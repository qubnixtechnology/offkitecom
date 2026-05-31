import { useEffect, useRef, useState } from 'react';

const STYLES = [
  {
    id: 'casual',
    name: 'Casual',
    count: 'Effortlessly cool',
    bg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=85',
    category: 'all'
  },
  {
    id: 'minimal',
    name: 'Minimal',
    count: 'Less is more',
    bg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=85',
    category: 'all'
  },
  {
    id: 'korean',
    name: 'Korean Fashion',
    count: 'K-style vibes',
    // Verified working — soft editorial fashion
    bg: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400&q=85',
    category: 'all'
  },
  {
    id: 'western',
    name: 'Western',
    count: 'Modern west edit',
    bg: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&q=85',
    category: 'jeans'
  },
  {
    id: 'traditional',
    name: 'Traditional',
    count: 'Heritage meets now',
    // Verified working editorial shot
    bg: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=85',
    category: 'all'
  },
  {
    id: 'evening',
    name: 'Luxury Evening',
    count: 'Night of elegance',
    // Verified working luxury evening editorial
    bg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=85',
    category: 'skirts'
  }
];

export default function ShopByStyle({ onCategoryClick }) {
  const headerRef = useRef(null);
  const gridRef = useRef(null);
  const [collectionsData, setCollectionsData] = useState(() => {
    const defaults = {
      bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      bestSellersTitle: 'Best Sellers',
      trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
      trendingTitle: 'Trending Collection',
      trendingTagline: 'TRENDING LOOKBOOK',
      styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
      styleTitle: 'Shop By Style',
      styleTagline: 'STYLE MANUAL'
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_homepage_collections')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  const [stylesList, setStylesList] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_homepage_grid_cards')) || {};
      return STYLES.map(s => {
        const custom = stored[s.id];
        return custom ? { ...s, name: custom.title || s.name, count: custom.tag || s.count, bg: custom.bg || s.bg } : s;
      });
    } catch (e) {
      return STYLES;
    }
  });

  useEffect(() => {
    const handleSettingsUpdate = () => {
      const defaults = {
        bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
        bestSellersTitle: 'Best Sellers',
        trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
        trendingTitle: 'Trending Collection',
        trendingTagline: 'TRENDING LOOKBOOK',
        styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
        styleTitle: 'Shop By Style',
        styleTagline: 'STYLE MANUAL'
      };
      try {
        setCollectionsData(JSON.parse(localStorage.getItem('offkilt_homepage_collections')) || defaults);
      } catch (e) {
        setCollectionsData(defaults);
      }
      try {
        const storedGrid = JSON.parse(localStorage.getItem('offkilt_homepage_grid_cards')) || {};
        setStylesList(STYLES.map(s => {
          const custom = storedGrid[s.id];
          return custom ? { ...s, name: custom.title || s.name, count: custom.tag || s.count, bg: custom.bg || s.bg } : s;
        }));
      } catch (e) {}
    };
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('offkilt_settings_updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          const cards = gridRef.current?.querySelectorAll('.style-card');
          cards?.forEach((card, i) => setTimeout(() => card.classList.add('in-view'), i * 60));
        }
      }),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="shop-style-sec" id="shop-by-style">
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Browse Your Vibe</span>
          <h2 className="luxury-section-title" style={{ textTransform: 'uppercase' }}>{collectionsData.styleTitle}</h2>
          <p className="luxury-section-subtitle">Find your aesthetic and explore curated looks that speak to who you are.</p>
        </div>

        {collectionsData.styleCover && (
          <div className="collection-cover-banner" style={{
            position: 'relative',
            width: '100%',
            height: '350px',
            marginBottom: '40px',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer'
          }} onClick={() => onCategoryClick?.('all')}>
            <img src={collectionsData.styleCover} alt={collectionsData.styleTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#ffffff' }}>
              <span className="mono" style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>{collectionsData.styleTagline || 'STYLE MANUAL'}</span>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: '4px 0 0 0', textTransform: 'uppercase' }}>{collectionsData.styleTitle}</h3>
            </div>
          </div>
        )}

        <div className="style-grid" ref={gridRef}>
          {stylesList.map((style, idx) => (
            <div
              key={style.id}
              className="style-card section-reveal"
              style={{ transitionDelay: `${idx * 0.07}s` }}
              onClick={() => onCategoryClick?.(style.category)}
              title={`Shop ${style.name}`}
            >
              <img
                src={style.bg}
                alt={style.name}
                className="style-card-bg"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.background = '#111'; }}
              />
              <div className="style-card-overlay" />
              <div className="style-card-content">
                <h3 className="style-name">{style.name}</h3>
                <span className="style-count">{style.count}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
