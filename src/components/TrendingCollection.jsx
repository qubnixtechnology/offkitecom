import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';

const COLLECTIONS = [
  {
    id: 'summer',
    tag: 'Collection',
    title: 'Summer Breeze',
    bg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=85',
    category: 'all'
  },
  {
    id: 'party',
    tag: 'Occasion Wear',
    title: 'Party Glam',
    bg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=85',
    category: 'all'
  },
  {
    id: 'office',
    tag: 'Work Edit',
    title: 'Office Chic',
    bg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85',
    category: 'all'
  },
  {
    id: 'ethnic',
    tag: 'Heritage',
    title: 'Ethnic Fusion',
    // Reliable editorial ethnic/cultural fashion shot
    bg: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=85',
    category: 'all'
  },
  {
    id: 'street',
    tag: 'Urban',
    title: 'Street Style',
    // Reliable urban street fashion
    bg: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=600&q=85',
    category: 'all'
  }
];

export default function TrendingCollection({ onCategoryClick }) {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);
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
    };
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('offkilt_settings_updated', handleSettingsUpdate);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          const cards = sectionRef.current?.querySelectorAll('.trending-card');
          cards?.forEach((card, i) => {
            setTimeout(() => card.classList.add('in-view'), i * 80);
          });
        }
      }),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="trending-sec" id="trending" ref={sectionRef}>
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Handpicked For You</span>
          <h2 className="luxury-section-title" style={{ textTransform: 'uppercase' }}>{collectionsData.trendingTitle}</h2>
          <p className="luxury-section-subtitle">Curated styles that are setting the fashion agenda right now.</p>
        </div>

        {collectionsData.trendingCover && (
          <div className="collection-cover-banner" style={{
            position: 'relative',
            width: '100%',
            height: '350px',
            marginBottom: '40px',
            borderRadius: '4px',
            overflow: 'hidden',
            cursor: 'pointer'
          }} onClick={() => onCategoryClick?.('all')}>
            <img src={collectionsData.trendingCover} alt={collectionsData.trendingTitle} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 100%)' }} />
            <div style={{ position: 'absolute', bottom: '30px', left: '30px', color: '#ffffff' }}>
              <span className="mono" style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', letterSpacing: '2px', textTransform: 'uppercase' }}>TRENDING LOOKBOOK</span>
              <h3 style={{ fontSize: '1.8rem', fontFamily: 'var(--font-heading)', fontWeight: 'bold', margin: '4px 0 0 0', textTransform: 'uppercase' }}>{collectionsData.trendingTitle}</h3>
            </div>
          </div>
        )}

        <div className="trending-grid">
          {COLLECTIONS.map((col, idx) => (
            <div
              key={col.id}
              className="trending-card section-reveal"
              style={{ transitionDelay: `${idx * 0.07}s` }}
              onClick={() => onCategoryClick?.(col.category)}
            >
              <img
                src={col.bg}
                alt={col.title}
                className="trending-card-bg"
                loading="lazy"
                onError={(e) => { e.target.style.background = '#1a1a1a'; e.target.style.display = 'none'; }}
              />
              <div className="trending-card-overlay" />
              <div className="trending-card-content">
                <span className="trending-card-tag">{col.tag}</span>
                <h3 className="trending-card-title">{col.title}</h3>
                <span className="trending-card-cta">
                  Shop Now <ArrowRight size={12} />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
