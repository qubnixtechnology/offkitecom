import { useEffect, useRef, useState } from 'react';
import { Star, ShoppingBag } from 'lucide-react';
import { products as productsApi } from '../services/api';

const DEFAULT_BESTSELLERS = [
  {
    id: 'bs1',
    productId: 'OKJ24201', // Asymmetric Raw Carpenter Jeans
    name: 'Signature Flared Denim',
    price: 2999,
    originalPrice: 3999,
    label: 'most-loved',
    labelText: 'Most Loved',
    image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=85',
    rating: 4.9,
    reviews: 284,
  },
  {
    id: 'bs2',
    productId: 'OKJ24202', // Slouchy Triple-Stitched Utility Jeans
    name: 'Asymmetric Denim Midi Skirt',
    price: 1999,
    originalPrice: null,
    label: 'trending-now',
    labelText: 'Trending Now',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
    rating: 4.7,
    reviews: 167,
  },
  {
    id: 'bs3',
    productId: 'OKJ24203',
    name: 'Wide-Leg High-Waist Trousers',
    price: 3499,
    originalPrice: 4499,
    label: 'limited-edition',
    labelText: 'Limited Edition',
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

export default function BestSellers({ onScrollToCatalog, onProductClick }) {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const [products, setProducts] = useState([]);
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
    productsApi.getAll('all').then(res => {
      if (res && res.data) {
        setProducts(res.data);
      }
    }).catch(err => console.error("Error loading products for BestSellers", err));
  }, []);

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
  }, [bestsellersList]);

  // Map configuration slots to actual database products if they exist
  const mappedBestsellersList = bestsellersList.map(item => {
    if (item.productId) {
      const match = products.find(p => String(p.id) === String(item.productId));
      if (match) {
        return {
          ...item,
          name: match.name,
          price: match.discountPrice && Number(match.discountPrice) < Number(match.price) ? Number(match.discountPrice) : Number(match.price),
          originalPrice: match.discountPrice && Number(match.discountPrice) < Number(match.price) ? Number(match.price) : null,
          image: match.image,
          rating: match.rating || item.rating || 4.8,
          reviews: match.reviews || item.reviews || 120,
          productObj: match
        };
      }
    }
    // Fallback search by name if ID matches nothing or isn't set
    const matchByName = products.find(p => p.name && p.name.toLowerCase() === item.name.toLowerCase());
    if (matchByName) {
      return {
        ...item,
        productId: matchByName.id,
        name: matchByName.name,
        price: matchByName.discountPrice && Number(matchByName.discountPrice) < Number(matchByName.price) ? Number(matchByName.discountPrice) : Number(matchByName.price),
        originalPrice: matchByName.discountPrice && Number(matchByName.discountPrice) < Number(matchByName.price) ? Number(matchByName.price) : null,
        image: matchByName.image,
        rating: matchByName.rating || item.rating || 4.8,
        reviews: matchByName.reviews || item.reviews || 120,
        productObj: matchByName
      };
    }
    return item;
  });

  const handleCardClick = (productItem) => {
    if (productItem.productObj && onProductClick) {
      onProductClick(productItem.productObj);
    } else {
      const el = document.getElementById('catalog');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      onScrollToCatalog?.();
    }
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
          }} onClick={() => handleCardClick({})}>
            <img src={collectionsData.bestSellersCover} alt={collectionsData.bestSellersTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#ffffff' }}>
              <span className="mono" style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>FEATURED COLLECTION</span>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: '4px 0 0 0', textTransform: 'uppercase' }}>{collectionsData.bestSellersTitle}</h3>
            </div>
          </div>
        )}

        <div className="bestsellers-grid">
          {mappedBestsellersList.map((product, idx) => (
            <div
              key={product.id}
              className="bestseller-card section-reveal"
              ref={el => cardsRef.current[idx] = el}
              style={{ transitionDelay: `${idx * 0.12}s` }}
              onClick={() => handleCardClick(product)}
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
                  <button className="bestseller-add-btn" onClick={(e) => { e.stopPropagation(); handleCardClick(product); }}>
                    <ShoppingBag size={13} style={{ display: 'inline', marginRight: 7 }} />
                    Quick View
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
