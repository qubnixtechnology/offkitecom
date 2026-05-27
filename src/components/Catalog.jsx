import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { products as productsApi } from '../services/api';

export default function Catalog({ onProductClick, activeTab, setActiveTab, wishlist = [], onWishlistToggle, onAddToCart }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [renderedCategory, setRenderedCategory] = useState(activeTab);
  const [addedIds, setAddedIds] = useState({}); // track which products were just added
  const [reviewTrigger, setReviewTrigger] = useState(0);
  const [productTrigger, setProductTrigger] = useState(0);

  useEffect(() => {
    const handleReviews = () => setReviewTrigger(prev => prev + 1);
    const handleProducts = () => setProductTrigger(prev => prev + 1);
    window.addEventListener('offkilt_reviews_updated', handleReviews);
    window.addEventListener('offkilt_products_updated', handleProducts);
    return () => {
      window.removeEventListener('offkilt_reviews_updated', handleReviews);
      window.removeEventListener('offkilt_products_updated', handleProducts);
    };
  }, []);

  const getProductRatingInfo = (productId) => {
    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    const prodReviews = allReviews[productId];
    if (prodReviews && prodReviews.length > 0) {
      const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
      return { rating: avg.toFixed(1), count: prodReviews.length };
    }
    const sum = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockRating = (4.5 + (sum % 5) * 0.1).toFixed(1);
    const mockCount = 6 + (sum % 20);
    return { rating: mockRating, count: mockCount };
  };

  const handleImageLoad = (url) => {
    setLoadedImages(prev => ({ ...prev, [url]: true }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const fits = ['baggy', 'relaxed', 'boot cut', 'slim', 'skinny'];
        const isFit = fits.includes(activeTab.toLowerCase());
        const apiCategory = ['jeans', 'skirts'].includes(activeTab) ? activeTab : (isFit ? 'jeans' : 'all');
        
        const res = await productsApi.getAll(apiCategory);
        const mapped = res.data.map(p => ({
          ...p,
          details: typeof p.details === 'string' ? JSON.parse(p.details) : p.details,
          sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
          hoverImage: p.hover_image,
        }));

        let filtered = mapped;
        if (isFit) {
          const fitKeyword = activeTab.toLowerCase();
          filtered = mapped.filter(p => {
            const name = (p.name || '').toLowerCase();
            const desc = (p.description || '').toLowerCase();
            const detailsText = Array.isArray(p.details) 
              ? p.details.join(' ').toLowerCase() 
              : (p.details || '').toLowerCase();

            if (fitKeyword === 'boot cut') {
              return name.includes('bootcut') || name.includes('boot cut') ||
                     desc.includes('bootcut') || desc.includes('boot cut') ||
                     detailsText.includes('bootcut') || detailsText.includes('boot cut');
            }
            return name.includes(fitKeyword) || desc.includes(fitKeyword) || detailsText.includes(fitKeyword);
          });
        }

        setProductsList(filtered);
        setRenderedCategory(activeTab);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [activeTab, productTrigger]);

  const isWishlisted = (productId) => wishlist.some(w => (w.id || w) === productId);

  const handleQuickAdd = (e, product) => {
    e.stopPropagation();
    const sizes = Array.isArray(product.sizes) ? product.sizes
      : (typeof product.sizes === 'string' ? JSON.parse(product.sizes || '[]') : []);
    
    if (sizes.length > 1) {
      // Multiple sizes — open product detail for size selection
      onProductClick(product);
      return;
    }
    // Single size or free size — add directly
    const size = sizes[0] || 'Free Size';
    onAddToCart?.(product, size);
    // Show tick feedback briefly
    setAddedIds(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => setAddedIds(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 1800);
  };

  return (
    <section className="catalog-sec" id="catalog">
      <div className="container">
        
        <div className="catalog-header">
          <div className="catalog-title-wrapper">
            <span className="mono" style={{ color: 'var(--accent-raw)' }}>THE COLLECTIONS</span>
            <h2 className="catalog-title">DENIM &amp; STREET EDITS</h2>
            <p>Browse by category or denim fit — every piece crafted with precision.</p>
          </div>
          
          <div className="category-tabs">
            {['all', 'jeans', 'skirts', 'baggy', 'relaxed', 'boot cut', 'slim', 'skinny'].map(tab => (
              <button 
                key={tab}
                className={`category-tab mono ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
          {loading && <div className="catalog-loading-bar" />}
          <div className={`products-grid ${loading ? 'grid-loading' : ''}`}>
            <AnimatePresence mode="popLayout">
              {productsList.map((product, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  key={`${renderedCategory}-${product.id}`}
                  className="product-card"
                >
                  <div className="product-image-container">
                    {product.badge && <span className="product-card-badge">{product.badge}</span>}

                    {/* Wishlist heart button — no login required */}
                    <button
                      className={`catalog-wishlist-btn ${isWishlisted(product.id) ? 'wishlisted' : ''}`}
                      onClick={(e) => { e.stopPropagation(); onWishlistToggle?.(product); }}
                      title={isWishlisted(product.id) ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      aria-label="Toggle Wishlist"
                    >
                      <Heart
                        size={14}
                        fill={isWishlisted(product.id) ? '#ff4d6d' : 'none'}
                        stroke={isWishlisted(product.id) ? '#ff4d6d' : 'currentColor'}
                      />
                    </button>
                    
                    {!loadedImages[product.image] && (
                      <div className="image-shimmer-skeleton" />
                    )}
                    
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`product-image ${loadedImages[product.image] ? 'loaded' : 'loading-blur'}`}
                      loading="lazy"
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0 && !loadedImages[product.image]) {
                          handleImageLoad(product.image);
                        }
                      }}
                      onLoad={() => handleImageLoad(product.image)}
                    />
                    {product.hoverImage && (
                      <img 
                        src={product.hoverImage} 
                        alt={`${product.name} alternate view`} 
                        className={`product-image-hover ${loadedImages[product.hoverImage] ? 'loaded' : 'loading-blur'}`} 
                        loading="lazy"
                        ref={(el) => {
                          if (el && el.complete && el.naturalWidth > 0 && !loadedImages[product.hoverImage]) {
                            handleImageLoad(product.hoverImage);
                          }
                        }}
                        onLoad={() => handleImageLoad(product.hoverImage)}
                      />
                    )}
                    <div className="product-card-overlay">
                      <button 
                        className="product-quick-btn mono"
                        onClick={() => onProductClick(product)}
                      >
                        Quick Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Product info — on mobile bottom tap = quick add to cart */}
                  <div
                    className="product-info"
                    onClick={() => onProductClick(product)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-meta">
                      <span className="product-tag">{product.tagline}</span>
                      <h3 className="product-name">{product.name}</h3>
                      {(() => {
                        const info = getProductRatingInfo(product.id);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--accent-gold)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                            <Star size={10} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{info.rating}</span>
                            <span style={{ color: 'var(--text-muted)' }}>({info.count})</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="product-price-row">
                      <div className="product-price">
                        ₹{product.price.toLocaleString('en-IN')}
                      </div>
                      {/* Mobile Quick Add button — replaces the price row on mobile tap */}
                      <button
                        className={`catalog-quick-add-btn ${addedIds[product.id] ? 'added' : ''}`}
                        onClick={(e) => handleQuickAdd(e, product)}
                        aria-label="Quick add to cart"
                      >
                        {addedIds[product.id]
                          ? <><Check size={13} /> Added</>
                          : <><ShoppingBag size={13} /> Add</>
                        }
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
