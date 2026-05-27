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
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
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
      return { rating: avg, count: prodReviews.length };
    }
    const sum = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockRating = (4.5 + (sum % 5) * 0.1);
    const mockCount = 6 + (sum % 20);
    return { rating: mockRating, count: mockCount };
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
            ['NEW ARRIVALS', '✦', 'JUST LANDED', '✦', 'FRESH DROPS', '✦', 'NEW SEASON', '✦', 'SHOP NOW', '✦'].map((item, i) => (
              <div key={`${gi}-${i}`} className="marquee-item">
                {item}
                {i % 2 === 0 && <span className="marquee-dot"></span>}
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
                    <div className="arrival-img-wrapper">
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
                      <img src={product.image} alt={product.name} className="arrival-img" loading="lazy" />
                      {product.hoverImage && (
                        <img src={product.hoverImage} alt={product.name} className="arrival-img-hover" loading="lazy" />
                      )}

                      {/* Hover Actions */}
                      <div className="arrival-card-actions">
                        <button className="arrival-quick-add" onClick={(e) => { e.stopPropagation(); onAddToCart?.(product); }}>
                          <ShoppingBag size={13} style={{ display: 'inline', marginRight: 6 }} />
                          Quick Add
                        </button>
                        <button className="arrival-quick-view" onClick={() => onProductClick?.(product)}>
                          <Eye size={12} style={{ display: 'inline', marginRight: 5 }} />
                          View Details
                        </button>
                      </div>
                    </div>

                    <div className="arrival-info" onClick={() => onProductClick?.(product)}>
                      <p className="arrival-name">{product.name}</p>
                      <div className="arrival-meta-row">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <StarRating rating={rating} />
                          <span className="arrival-review-count">({reviewCount})</span>
                        </div>
                        <span className="arrival-price">₹{product.price?.toLocaleString('en-IN')}</span>
                      </div>
                      {scarcity && <p className="arrival-scarcity">{scarcity}</p>}
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
