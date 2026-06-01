import { useEffect, useRef, useState } from 'react';
import { Heart, Star, ShoppingBag, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products as productsApi } from '../services/api';

const BADGE_CYCLE = ['new', 'trending', 'limited', 'new', 'new', 'trending', 'limited', 'new'];
const SCARCITY = [null, 'Only 3 left', null, 'Only 1 left!', null, null, 'Only 2 left', null];
const RATINGS = [4.9, 4.7, 4.8, 5.0, 4.6, 4.9, 4.7, 4.8];
const REVIEW_COUNTS = [128, 94, 211, 67, 156, 88, 173, 102];

function StarRating({ rating }) {
  return (
    <div className="arrival-stars">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={11}
          className={i <= Math.round(rating) ? 'star-icon' : 'star-icon-empty'}
          fill={i <= Math.round(rating) ? 'var(--accent-gold)' : 'none'}
          stroke={i <= Math.round(rating) ? 'var(--accent-gold)' : 'var(--text-muted)'}
        />
      ))}
    </div>
  );
}

export default function NewArrivals({ onProductClick, onAddToCart, wishlist, onWishlistToggle, onViewAll }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCardVariants, setSelectedCardVariants] = useState({});
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
  const [reviewTrigger, setReviewTrigger] = useState(0);
  const [productTrigger, setProductTrigger] = useState(0);

  const [promoText, setPromoText] = useState('Extra 20% off $100+');
  const [showPromo, setShowPromo] = useState(false);
  const [tickerItems, setTickerItems] = useState(() => {
    const defaults = ['NEW ARRIVALS', '✦', 'JUST LANDED', '✦', 'FRESH DROPS', '✦', 'NEW SEASON', '✦', 'SHOP NOW', '✦'];
    try {
      return JSON.parse(localStorage.getItem('offkilt_ticker_items')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  const loadPromoSettings = () => {
    const text = localStorage.getItem('offkilt_promo_discount_text') || 'Extra 20% off $100+';
    const show = localStorage.getItem('offkilt_promo_discount_show') !== 'false';
    setPromoText(text);
    setShowPromo(show);
    try {
      const storedTicker = localStorage.getItem('offkilt_ticker_items');
      if (storedTicker) {
        setTickerItems(JSON.parse(storedTicker));
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadPromoSettings();
    const handleReviews = () => setReviewTrigger(prev => prev + 1);
    const handleProducts = () => setProductTrigger(prev => prev + 1);
    window.addEventListener('offkilt_reviews_updated', handleReviews);
    window.addEventListener('offkilt_products_updated', handleProducts);
    window.addEventListener('offkilt_settings_updated', loadPromoSettings);
    return () => {
      window.removeEventListener('offkilt_reviews_updated', handleReviews);
      window.removeEventListener('offkilt_products_updated', handleProducts);
      window.removeEventListener('offkilt_settings_updated', loadPromoSettings);
    };
  }, []);

  const getProductRatingInfo = (productId) => {
    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    const prodReviews = allReviews[productId];
    if (prodReviews && prodReviews.length > 0) {
      const avg = prodReviews.reduce((acc, r) => acc + r.rating, 0) / prodReviews.length;
      return { rating: avg, count: prodReviews.length };
    }
    const sum = String(productId).split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockRating = (4.5 + (sum % 5) * 0.1);
    const mockCount = 6 + (sum % 20);
    return { rating: mockRating, count: mockCount };
  };

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

  useEffect(() => {
    productsApi.getAll('all').then(res => {
      setProducts(res.data.slice(0, 8));
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [productTrigger]);

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const getBadge = (idx) => BADGE_CYCLE[idx % BADGE_CYCLE.length];

  return (
    <section className="new-arrivals-sec" id="new-arrivals" ref={sectionRef}>
      {/* Gold marquee ticker */}
      <div className="marquee-strip" style={{ marginBottom: '0', position: 'relative', zIndex: 1 }}>
        <div className="marquee-inner">
          {[...Array(2)].map((_, gi) => (
            tickerItems.map((item, i) => (
              <div key={`${gi}-${i}`} className="marquee-item">
                {item}
                {item !== '✦' && <span className="marquee-dot"></span>}
              </div>
            ))
          ))}
        </div>
      </div>

      <div className="container" style={{ paddingTop: '80px' }}>
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Just Arrived</span>
          <h2 className="luxury-section-title">New <em>Arrivals</em></h2>
          <p className="luxury-section-subtitle">Fresh styles crafted for the season — be the first to wear what everyone will want.</p>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
            <div className="catalog-loading-bar" style={{ position: 'relative', top: 0 }} />
          </div>
        ) : (
          <AnimatePresence>
            <div className="arrivals-grid">
              {products.map((product, idx) => {
                const badge = getBadge(idx);
                const isWishlisted = wishlist?.some(w => (w.id || w) === product.id);
                const ratingInfo = getProductRatingInfo(product.id);
                const rating = ratingInfo.rating;
                const reviewCount = ratingInfo.count;
                const scarcity = SCARCITY[idx % SCARCITY.length];

                return (
                  <motion.div
                    key={product.id}
                    className="arrival-card"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: idx * 0.06 }}
                  >
                    <div 
                      className="arrival-img-wrapper"
                      onClick={() => {
                        const activeVariant = selectedCardVariants[product.id];
                        onProductClick?.(product, activeVariant?.id);
                      }}
                      style={{ cursor: 'pointer' }}
                    >
                      {/* Badge */}
                      {badge === 'new' && <span className="arrival-badge-new">New</span>}
                      {badge === 'trending' && <span className="arrival-badge-trending">Trending</span>}
                      {badge === 'limited' && <span className="arrival-badge-limited">Limited</span>}

                      {/* Wishlist */}
                      <button
                        className={`arrival-wishlist-btn ${isWishlisted ? 'wishlisted' : ''}`}
                        onClick={(e) => { e.stopPropagation(); onWishlistToggle?.(product); }}
                        title={isWishlisted ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart 
                          size={15} 
                          fill={isWishlisted ? '#ff4d6d' : 'none'} 
                          stroke={isWishlisted ? '#ff4d6d' : 'currentColor'}
                        />
                      </button>

                      {/* Images */}
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
                            <img 
                              src={displayImg} 
                              alt={product.name} 
                              className="arrival-img" 
                              loading="lazy" 
                              style={{ cursor: 'pointer' }}
                              onClick={() => onProductClick?.(product, activeVariant?.id)}
                            />
                            {displayHoverImg && (
                              <img 
                                src={displayHoverImg} 
                                alt={product.name} 
                                className="arrival-img-hover" 
                                loading="lazy" 
                                style={{ cursor: 'pointer' }}
                                onClick={() => onProductClick?.(product, activeVariant?.id)}
                              />
                            )}
                          </>
                        );
                      })()}

                      {/* Hover Actions */}
                      <div 
                        className="arrival-card-actions"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          const visibleVariants = getProductVariantsAndDefault(product);
                          const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                          onProductClick?.(product, activeVariant?.id); 
                        }}
                      >
                        {(() => {
                          const visibleVariants = getProductVariantsAndDefault(product);
                          const activeVar = selectedCardVariants[product.id] || visibleVariants[0];
                          const isOutOfStock = activeVar ? (activeVar.status === 'out_of_stock' || activeVar.stock <= 0) : product.stock <= 0;
                          
                          if (isOutOfStock) {
                            return (
                              <button 
                                className="arrival-quick-add" 
                                disabled={true} 
                                style={{ opacity: 0.6, cursor: 'not-allowed', backgroundColor: '#a1a1aa' }}
                              >
                                <ShoppingBag size={13} style={{ display: 'inline', marginRight: 6 }} />
                                Out of Stock
                              </button>
                            );
                          }
                          
                          return (
                            <button className="arrival-quick-add" onClick={(e) => { 
                              e.stopPropagation(); 
                              const visibleVariants = getProductVariantsAndDefault(product);
                              const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                              onAddToCart?.(product, 'Free Size', activeVariant?.id); 
                            }}>
                              <ShoppingBag size={13} style={{ display: 'inline', marginRight: 6 }} />
                              Quick Add
                            </button>
                          );
                        })()}
                        <button className="arrival-quick-view" onClick={(e) => { 
                          e.stopPropagation(); 
                          const visibleVariants = getProductVariantsAndDefault(product);
                          const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                          onProductClick?.(product, activeVariant?.id); 
                        }}>
                          <Eye size={12} style={{ display: 'inline', marginRight: 5 }} />
                          View Details
                        </button>
                      </div>
                    </div>

                    <div 
                      className="arrival-info" 
                      onClick={() => {
                        const visibleVariants = getProductVariantsAndDefault(product);
                        const activeVariant = selectedCardVariants[product.id] || visibleVariants[0];
                        onProductClick?.(product, activeVariant?.id);
                      }}
                    >
                      <p className="arrival-name">{product.name}</p>
                      
                      <div className="catalog-price-row-editorial" style={{ margin: '4px 0' }}>
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
                             <div className="catalog-swatches-editorial" style={{ margin: '8px 0 4px 0' }}>
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
                         }
                         return null;
                      })()}

                      <div className="arrival-meta-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StarRating rating={rating} />
                          <span className="arrival-review-count">({reviewCount})</span>
                        </div>
                      </div>
                      {scarcity && <p className="arrival-scarcity" style={{ marginTop: '4px' }}>{scarcity}</p>}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}

        <div className="arrivals-view-all">
          <button className="btn-secondary" onClick={onViewAll}>
            View All Products
          </button>
        </div>
      </div>
    </section>
  );
}
