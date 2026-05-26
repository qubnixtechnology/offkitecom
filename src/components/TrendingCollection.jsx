import { useEffect, useRef } from 'react';
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
          <h2 className="luxury-section-title"><em>Trending</em> Collections</h2>
          <p className="luxury-section-subtitle">Curated styles that are setting the fashion agenda right now.</p>
        </div>

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
