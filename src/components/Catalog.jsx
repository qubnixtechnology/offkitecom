import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, ShoppingBag, Check, Star } from 'lucide-react';
import { products as productsApi } from '../services/api';

export default function Catalog({ onProductClick, activeTab, setActiveTab, wishlist = [], onWishlistToggle, onAddToCart }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [selectedCardVariants, setSelectedCardVariants] = useState({});
  const [renderedCategory, setRenderedCategory] = useState(activeTab);
  const [addedIds, setAddedIds] = useState({}); // track which products were just added
  const [reviewTrigger, setReviewTrigger] = useState(0);
  const [productTrigger, setProductTrigger] = useState(0);
  const [categoriesList, setCategoriesList] = useState(() => {
    const defaults = ['all', 'jeans', 'skirts', 'baggy', 'relaxed', 'boot cut', 'slim', 'skinny'];
    try {
      return JSON.parse(localStorage.getItem('offkilt_categories_list')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  const [promoText, setPromoText] = useState('Extra 20% off $100+');
  const [showPromo, setShowPromo] = useState(false);
  const [categoryMetadata, setCategoryMetadata] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_category_metadata')) || {};
    } catch (e) {
      return {};
    }
  });

  const handleSettingsUpdate = () => {
    const defaults = ['all', 'jeans', 'skirts', 'baggy', 'relaxed', 'boot cut', 'slim', 'skinny'];
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_categories_list'));
      if (stored && Array.isArray(stored)) {
        setCategoriesList(stored);
      } else {
        setCategoriesList(defaults);
      }
    } catch (e) {
      setCategoriesList(defaults);
    }
    try {
      const storedMeta = JSON.parse(localStorage.getItem('offkilt_category_metadata'));
      if (storedMeta) setCategoryMetadata(storedMeta);
    } catch (e) {}
    
    // Load global promo values
    const text = localStorage.getItem('offkilt_promo_discount_text') || 'Extra 20% off $100+';
    const show = localStorage.getItem('offkilt_promo_discount_show') !== 'false';
    setPromoText(text);
    setShowPromo(show);
  };

  useEffect(() => {
    handleSettingsUpdate();
  }, []);

  useEffect(() => {
    const handleReviews = () => setReviewTrigger(prev => prev + 1);
    const handleProducts = () => setProductTrigger(prev => prev + 1);
    
    window.addEventListener('offkilt_reviews_updated', handleReviews);
    window.addEventListener('offkilt_products_updated', handleProducts);
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdate);
    return () => {
      window.removeEventListener('offkilt_reviews_updated', handleReviews);
      window.removeEventListener('offkilt_products_updated', handleProducts);
      window.removeEventListener('offkilt_settings_updated', handleSettingsUpdate);
    };
  }, []);

  useEffect(() => {
    if (categoriesList.length > 0 && !categoriesList.includes(activeTab)) {
      setActiveTab(categoriesList[0]);
    }
  }, [categoriesList, activeTab, setActiveTab]);

  const parseSwatches = (product) => {
    let swatchesList = [];
    if (!product) return swatchesList;
    if (product.swatches) {
      if (Array.isArray(product.swatches)) {
        swatchesList = product.swatches;
      } else if (typeof product.swatches === 'string') {
        swatchesList = product.swatches.split(',').map(s => {
          const parts = s.split(':');
          return { name: parts[0]?.trim(), hex: parts[1]?.trim() || '#111111' };
        });
      }
    } else if (Array.isArray(product.details)) {
      const swatchLine = product.details.find(d => d.includes('Fabric Swatches:'));
      if (swatchLine) {
        const swatchStr = swatchLine.replace('Fabric Swatches:', '').trim();
        swatchesList = swatchStr.split(',').map(s => {
          const parts = s.split(':');
          return { name: parts[0]?.trim(), hex: parts[1]?.trim() || '#111111' };
        });
      }
    }
    
    // Fallback: detect from name/description
    if (swatchesList.length === 0 && product.name) {
      const colorMap = {
        'indigo': '#1a237e',
        'charcoal': '#37474f',
        'sand': '#c2b280',
        'desert': '#c2b280',
        'acid': '#8d9db6',
        'raw': '#0d1b2a',
        'vintage': '#6d5c4e',
        'black': '#1a1a1a',
        'grey': '#616161',
        'sage': '#7c9473',
        'tinted': '#8b7355',
      };
      const text = `${product.name} ${product.description || ''}`.toLowerCase();
      const detected = Object.entries(colorMap)
        .filter(([keyword]) => text.includes(keyword))
        .map(([name, hex]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), hex }));
      
      if (detected.length > 0) {
        swatchesList = detected;
      }
    }
    return swatchesList;
  };

  const getProductVariantsAndDefault = (product) => {
    if (!product) return [];
    const visibleVariants = (product.variants || []).filter(v => v.status !== 'hidden');
    if (visibleVariants.length > 0) {
      let defaultColorName = 'Original';
      let defaultHex = '#111111';
      
      const sw = parseSwatches(product);
      if (sw && sw.length > 0) {
        defaultColorName = sw[0].name;
        defaultHex = sw[0].hex;
      }
      
      const defaultVariant = {
        id: 'default',
        color: defaultColorName,
        hex: defaultHex,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        sku: product.sku || product.id,
        images: Array.isArray(product.images) && product.images.length > 0 
          ? product.images 
          : [product.image, product.hoverImage || product.hover_image].filter(Boolean),
        status: 'available',
        display_order: -1
      };
      
      return [defaultVariant, ...visibleVariants];
    }
    return [];
  };

  const getProductRatingInfo = (productId) => {
    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    const prodReviews = allReviews[productId];
    if (prodReviews && prodReviews.length > 0) {
      const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
      return { rating: avg.toFixed(1), count: prodReviews.length };
    }
    const sum = String(productId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
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
        // For known API categories use them directly; for custom/unknown use 'all'
        const knownApiCategories = ['jeans', 'skirts'];
        const apiCategory = knownApiCategories.includes(activeTab) ? activeTab : (isFit ? 'jeans' : 'all');
        
        const res = await productsApi.getAll(apiCategory);
        const mapped = res.data.map(p => {
          let details = p.details;
          if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch(e) { details = [details]; }
          }
          let sizes = p.sizes;
          if (typeof sizes === 'string') {
            try { sizes = JSON.parse(sizes); } catch(e) { sizes = []; }
          }
          let images = p.images;
          if (typeof images === 'string') {
            try { images = JSON.parse(images); } catch(e) { images = []; }
          }
          return {
            ...p,
            details,
            sizes,
            images,
            hoverImage: p.hover_image || p.hoverImage,
          };
        });

        let filtered = mapped;
        if (isFit) {
          const fitKeyword = activeTab.toLowerCase();
          const byFit = mapped.filter(p => {
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
          // If no products match the fit filter, show all rather than empty
          filtered = byFit.length > 0 ? byFit : mapped;
        } else if (activeTab !== 'all' && !knownApiCategories.includes(activeTab)) {
          // Custom category: try matching by p.category first, fall back to show all products
          const byCategory = mapped.filter(p => p.category && p.category.toLowerCase() === activeTab.toLowerCase());
          filtered = byCategory.length > 0 ? byCategory : mapped;
        }

        setProductsList(filtered);
        setRenderedCategory(activeTab);
      } catch (err) {
        console.error("Failed to fetch products", err);
        setProductsList([]);
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
      : (typeof product.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes || '[]'); } catch(e) { return []; } })() : []);
    
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
        
        {(() => {
          const meta = categoryMetadata[(activeTab || '').toLowerCase()] || {};
          const title = (activeTab || '').toUpperCase();
          const tagline = meta.tagline || "Browse by category or denim fit — every piece crafted with precision.";
          const cover = meta.coverImage;
          
          return (
            <div className="catalog-header-wrapper" style={{ marginBottom: '24px' }}>
              {cover ? (
                <div className="category-cover-banner" style={{ 
                  backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.85)), url(${cover})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  padding: '60px 40px',
                  borderRadius: '4px',
                  marginBottom: '20px',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  minHeight: '220px',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 0 100px rgba(0,0,0,0.5)'
                }}>
                  <span className="mono" style={{ color: 'var(--accent-raw)', letterSpacing: '2px', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase' }}>CATEGORY</span>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: 800, margin: '6px 0', textTransform: 'uppercase', letterSpacing: '1px', textShadow: '2px 2px 8px rgba(0,0,0,0.7)', fontFamily: 'var(--font-heading)' }}>{title}</h2>
                  <p style={{ fontSize: '0.9rem', color: '#eaeaea', maxWidth: '600px', fontWeight: 400, textShadow: '1px 1px 4px rgba(0,0,0,0.6)', margin: 0 }}>{tagline}</p>
                </div>
              ) : (
                <div className="catalog-header" style={{ marginBottom: '20px' }}>
                  <div className="catalog-title-wrapper">
                    <span className="mono" style={{ color: 'var(--accent-raw)' }}>THE COLLECTIONS</span>
                    <h2 className="catalog-title">DENIM &amp; STREET EDITS</h2>
                    <p>{tagline}</p>
                  </div>
                </div>
              )}
              
              <div className="category-tabs" style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '10px' }}>
                {categoriesList.map(tab => (
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
          );
        })()}

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
                  <div 
                    className="product-image-container"
                    onClick={() => {
                      const activeVariant = selectedCardVariants[product.id];
                      onProductClick(product, activeVariant?.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
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
                    
                    {(() => {
                      const visibleVariants = getProductVariantsAndDefault(product);
                      const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                      const displayImg = activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 0
                        ? activeVariant.images[0]
                        : product.image;
                      
                      const displayHoverImg = activeVariant && Array.isArray(activeVariant.images) && activeVariant.images.length > 1
                        ? activeVariant.images[1]
                        : product.hoverImage || displayImg;
                      
                      return (
                        <>
                          {!loadedImages[displayImg] && (
                            <div className="image-shimmer-skeleton" />
                          )}
                          <img 
                            src={displayImg} 
                            alt={product.name} 
                            className={`product-image ${loadedImages[displayImg] ? 'loaded' : 'loading-blur'}`}
                            loading="lazy"
                            style={{ cursor: 'pointer' }}
                            onClick={() => onProductClick(product, activeVariant?.id)}
                            ref={(el) => {
                              if (el && el.complete && el.naturalWidth > 0 && !loadedImages[displayImg]) {
                                handleImageLoad(displayImg);
                              }
                            }}
                            onLoad={() => handleImageLoad(displayImg)}
                          />
                          {displayHoverImg && (
                            <img 
                              src={displayHoverImg} 
                              alt={`${product.name} alternate view`} 
                              className={`product-image-hover ${loadedImages[displayHoverImg] ? 'loaded' : 'loading-blur'}`} 
                              loading="lazy"
                              style={{ cursor: 'pointer' }}
                              onClick={() => onProductClick(product, activeVariant?.id)}
                              ref={(el) => {
                                if (el && el.complete && el.naturalWidth > 0 && !loadedImages[displayHoverImg]) {
                                  handleImageLoad(displayHoverImg);
                                }
                              }}
                              onLoad={() => handleImageLoad(displayHoverImg)}
                            />
                          )}
                        </>
                      );
                    })()}
                    <div 
                      className="product-card-overlay"
                      onClick={() => {
                        const activeVariant = selectedCardVariants[product.id];
                        onProductClick(product, activeVariant?.id);
                      }}
                    >
                      <button 
                        className="product-quick-btn mono"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const activeVariant = selectedCardVariants[product.id];
                          onProductClick(product, activeVariant?.id); 
                        }}
                      >
                        Quick Details
                      </button>
                    </div>
                  </div>
                  
                  {/* Product info — on mobile bottom tap = quick add to cart */}
                  <div
                    className="product-info"
                    onClick={() => {
                      const activeVariant = selectedCardVariants[product.id];
                      onProductClick(product, activeVariant?.id);
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="product-meta" style={{ width: '100%', maxWidth: '100%' }}>
                      <h3 className="product-name">{product.name}</h3>
                      
                      {/* Calvin Klein style price display with discounts */}
                      <div className="catalog-price-row-editorial">
                        {(() => {
                          const visibleVariants = getProductVariantsAndDefault(product);
                          const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                          const displayPrice = activeVariant ? activeVariant.price : product.price;
                          const displayDiscountPrice = activeVariant && activeVariant.id !== 'default' ? null : product.discountPrice;
                          
                          return displayDiscountPrice && Number(displayDiscountPrice) < Number(displayPrice) ? (
                            <>
                              <span className="original-price-editorial">₹{Number(displayPrice).toLocaleString('en-IN')}</span>
                              <span className="sale-price-editorial">₹{Number(displayDiscountPrice).toLocaleString('en-IN')}</span>
                              <span className="discount-editorial">{Math.round((1 - Number(displayDiscountPrice) / Number(displayPrice)) * 100)}% off</span>
                            </>
                          ) : (
                            <span className="sale-price-editorial">₹{Number(displayPrice).toLocaleString('en-IN')}</span>
                          );
                        })()}
                      </div>


                      {/* Dynamic Color Swatches circular list */}
                      {(() => {
                        const visibleVariants = getProductVariantsAndDefault(product);
                        const hasVars = visibleVariants.length > 0;
                        const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                        
                        if (hasVars) {
                          return (
                            <div className="catalog-swatches-editorial">
                              {visibleVariants.map((v) => {
                                const isSelected = activeVariant ? (activeVariant.id === v.id) : false;
                                const isOutOfStock = v.status === 'out_of_stock' || v.stock <= 0;
                                return (
                                  <span
                                    key={v.id}
                                    className={`catalog-swatch-circle ${isSelected ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                                    style={{ 
                                      backgroundColor: v.hex || '#111111',
                                      position: 'relative'
                                    }}
                                    title={isOutOfStock ? `${v.color} (Out of Stock)` : v.color}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setSelectedCardVariants(prev => ({
                                        ...prev,
                                        [product.id]: v
                                      }));
                                    }}
                                  >
                                    {isOutOfStock && (
                                      <div style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        width: '120%',
                                        height: '1.5px',
                                        backgroundColor: '#ef4444',
                                        transform: 'translate(-50%, -50%) rotate(45deg)',
                                        pointerEvents: 'none'
                                      }} />
                                    )}
                                  </span>
                                );
                              })}
                            </div>
                          );
                        } else {
                          const swatchesList = parseSwatches(product);
                          if (swatchesList && swatchesList.length > 0) {
                            return (
                              <div className="catalog-swatches-editorial">
                                {swatchesList.map((color, i) => (
                                  <span
                                    key={color.name}
                                    className={`catalog-swatch-circle ${i === 0 ? 'active' : ''}`}
                                    style={{ backgroundColor: color.hex }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            );
                          }
                        }
                        return null;
                      })()}

                      {/* Ratings stars display */}
                      {(() => {
                        const info = getProductRatingInfo(product.id);
                        return (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.68rem', color: 'var(--accent-gold)', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                            <Star size={10} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                            <span style={{ color: 'var(--text-light)', fontWeight: 600 }}>{info.rating}</span>
                            <span style={{ color: 'var(--text-muted)' }}>({info.count})</span>
                          </div>
                        );
                      })()}
                    </div>
                    <div className="product-price-row" style={{ display: 'flex', alignSelf: 'flex-end', marginTop: '10px' }}>
                      {/* Mobile Quick Add button — replaces the price row on mobile tap */}
                      {(() => {
                        const visibleVariants = getProductVariantsAndDefault(product);
                        const activeVar = selectedCardVariants[product.id] || visibleVariants[0];
                        const isOutOfStock = activeVar ? (activeVar.status === 'out_of_stock' || activeVar.stock <= 0) : product.stock <= 0;
                        
                        if (isOutOfStock) {
                          return (
                            <button
                              className="catalog-quick-add-btn"
                              disabled={true}
                              style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#a1a1aa' }}
                              aria-label="Out of stock"
                            >
                              Out
                            </button>
                          );
                        }
                        
                        return (
                          <button
                            className={`catalog-quick-add-btn ${addedIds[product.id] ? 'added' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              const sizes = Array.isArray(product.sizes) ? product.sizes
                                : (typeof product.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes || '[]'); } catch(e) { return []; } })() : []);
                              const activeVar = selectedCardVariants[product.id];
                              if (sizes.length > 1) {
                                onProductClick(product, activeVar?.id);
                                return;
                              }
                              const size = sizes[0] || 'Free Size';
                              onAddToCart?.(product, size, activeVar?.id);
                              setAddedIds(prev => ({ ...prev, [product.id]: true }));
                              setTimeout(() => setAddedIds(prev => { const n = { ...prev }; delete n[product.id]; return n; }), 1800);
                            }}
                            aria-label="Quick add to cart"
                          >
                            {addedIds[product.id]
                              ? <><Check size={13} /> Added</>
                              : <><ShoppingBag size={13} /> Add</>
                            }
                          </button>
                        );
                      })()}
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
