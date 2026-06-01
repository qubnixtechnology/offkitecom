import { useEffect, useRef, useState } from 'react';
import { Star, ShoppingBag } from 'lucide-react';

const DEFAULT_BESTSELLERS = [
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
      <span className="bestseller-reviews">{Number(rating).toFixed(1)}</span>
    </div>
  );
}

export default function BestSellers({ onScrollToCatalog }) {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const [bestsellersList, setBestsellersList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_bestsellers')) || DEFAULT_BESTSELLERS;
    } catch (e) {
      return DEFAULT_BESTSELLERS;
    }
  });
  const [collectionsData, setCollectionsData] = useState(() => {
    const defaults = {
      bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      bestSellersTitle: 'Best Sellers',
      trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
      trendingTitle: 'Trending Collection',
      styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
      styleTitle: 'Shop By Style'
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_homepage_collections')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      const defaults = {
        bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
        bestSellersTitle: 'Best Sellers',
        trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
        trendingTitle: 'Trending Collection',
        styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
        styleTitle: 'Shop By Style'
      };
      try {
        setCollectionsData(JSON.parse(localStorage.getItem('offkilt_homepage_collections')) || defaults);
      } catch (e) {
        setCollectionsData(defaults);
      }
      try {
        setBestsellersList(JSON.parse(localStorage.getItem('offkilt_bestsellers')) || DEFAULT_BESTSELLERS);
      } catch (e) {}
    };
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('offkilt_settings_updated', handleSettingsUpdate);
  }, []);

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
          <h2 className="luxury-section-title" style={{ textTransform: 'uppercase' }}>{collectionsData.bestSellersTitle}</h2>
          <p className="luxury-section-subtitle">The styles our customers can't stop reaching for — trusted, loved, and proven.</p>
        </div>

        {collectionsData.bestSellersCover && (
          <div className="collection-cover-banner" style={{
            position: 'relative',
            width: '100%',
            height: '350px',
            marginBottom: '40px',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer'
          }} onClick={handleCardClick}>
            <img src={collectionsData.bestSellersCover} alt={collectionsData.bestSellersTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#ffffff' }}>
              <span className="mono" style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FEATURED COLLECTION</span>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: '4px 0 0 0', textTransform: 'uppercase' }}>{collectionsData.bestSellersTitle}</h3>
            </div>
          </div>
        )}

        <div className="bestsellers-grid">
          {bestsellersList.map((product, idx) => (
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
