import { useEffect, useRef } from 'react';

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
          <h2 className="luxury-section-title">Shop By <em>Style</em></h2>
          <p className="luxury-section-subtitle">Find your aesthetic and explore curated looks that speak to who you are.</p>
        </div>

        <div className="style-grid" ref={gridRef}>
          {STYLES.map((style, idx) => (
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
