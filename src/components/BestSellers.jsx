import { useEffect, useRef } from 'react';
import { Star, ShoppingBag } from 'lucide-react';

const BESTSELLERS = [
  {
    id: 'bs1',
    name: 'Signature Flared Denim',
    price: 2999,
    originalPrice: 3999,
    label: 'most-loved',
    labelText: 'Most Loved',
    // Verified: elegant editorial woman in fashion — clearly female
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=85',
    rating: 4.9,
    reviews: 284,
  },
  {
    id: 'bs2',
    name: 'Asymmetric Denim Midi Skirt',
    price: 1999,
    originalPrice: null,
    label: 'trending-now',
    labelText: 'Trending Now',
    // Verified: woman in elegant fashion editorial
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
    rating: 4.7,
    reviews: 167,
  },
  {
    id: 'bs3',
    name: 'Wide-Leg High-Waist Trousers',
    price: 3499,
    originalPrice: 4499,
    label: 'limited-edition',
    labelText: 'Limited Edition',
    // Verified: premium woman fashion editorial
    image: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=600&q=85',
    rating: 5.0,
    reviews: 53,
  }
];

function StarRating({ rating }) {
  return (
    <div className="bestseller-stars-row">
      <div style={{ display: 'flex', gap: 3 }}>
        {[1,2,3,4,5].map(i => (
          <Star
            key={i}
            size={12}
            fill={i <= Math.round(rating) ? 'var(--accent-gold)' : 'none'}
            stroke={i <= Math.round(rating) ? 'var(--accent-gold)' : 'var(--text-muted)'}
          />
        ))}
      </div>
      <span className="bestseller-reviews">{rating.toFixed(1)}</span>
    </div>
  );
}

export default function BestSellers({ onScrollToCatalog }) {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const handleCardClick = () => {
    // Navigate to catalog to browse all products
    const el = document.getElementById('catalog');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    onScrollToCatalog?.();
  };

  return (
    <section className="bestsellers-sec" id="best-sellers">
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Customer Favourites</span>
          <h2 className="luxury-section-title">Best <em>Sellers</em></h2>
          <p className="luxury-section-subtitle">The styles our customers can't stop reaching for — trusted, loved, and proven.</p>
        </div>

        <div className="bestsellers-grid">
          {BESTSELLERS.map((product, idx) => (
            <div
              key={product.id}
              className="bestseller-card section-reveal"
              ref={el => cardsRef.current[idx] = el}
              style={{ transitionDelay: `${idx * 0.12}s` }}
              onClick={handleCardClick}
            >
              <div className="bestseller-img-wrapper">
                <span className={`bestseller-label ${product.label}`}>{product.labelText}</span>
                <img
                  src={product.image}
                  alt={product.name}
                  className="bestseller-img"
                  loading="lazy"
                  onError={(e) => { e.target.style.background = '#111'; e.target.style.display = 'none'; }}
                />
                <div className="bestseller-overlay">
                  <button className="bestseller-add-btn" onClick={(e) => { e.stopPropagation(); handleCardClick(); }}>
                    <ShoppingBag size={13} style={{ display: 'inline', marginRight: 7 }} />
                    Shop in Collection
                  </button>
                </div>
              </div>

              <div className="bestseller-info">
                <h3 className="bestseller-name">{product.name}</h3>
                <StarRating rating={product.rating} />
                <div className="bestseller-price-row">
                  <span className="bestseller-price">₹{product.price.toLocaleString('en-IN')}</span>
                  {product.originalPrice && (
                    <span className="bestseller-original-price">₹{product.originalPrice.toLocaleString('en-IN')}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
