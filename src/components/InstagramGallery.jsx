import { useEffect, useRef } from 'react';
import { Heart } from 'lucide-react';

function InstagramIcon({ size = 18, color = 'white' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <circle cx="12" cy="12" r="4"/>
      <circle cx="17.5" cy="6.5" r="1" fill={color} stroke="none"/>
    </svg>
  );
}

// 9 items: item[0] is featured (spans 2 rows in 3-col grid = perfect 3x3 fill)
// All images verified working with minimal URL params
const GALLERY_ITEMS = [
  {
    id: 'ig1',
    src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
    likes: '4.2K',
    featured: true,
  },
  {
    id: 'ig2',
    src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
    likes: '2.1K',
  },
  {
    id: 'ig3',
    src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85',
    likes: '1.8K',
  },
  {
    id: 'ig4',
    src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85',
    likes: '3.3K',
  },
  {
    id: 'ig5',
    src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=85',
    likes: '5.7K',
  },
  {
    id: 'ig6',
    // Was broken — using verified alternative
    src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=85',
    likes: '987',
  },
  {
    id: 'ig7',
    // Was broken — using verified alternative
    src: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=500&q=85',
    likes: '1.4K',
  },
  {
    id: 'ig8',
    // Was broken — using verified alternative
    src: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&q=85',
    likes: '2.9K',
  },
  {
    id: 'ig9',
    src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=85',
    likes: '1.2K',
  },
];

export default function InstagramGallery() {
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  const openInstagram = () => {
    window.open('https://www.instagram.com/offkiltfashion', '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="instagram-sec" id="instagram">
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Follow Along</span>
          <h2 className="luxury-section-title"><em>Instagram</em> Gallery</h2>
          <p className="luxury-section-subtitle">Real looks, real women, real confidence. Tag us and get featured.</p>
        </div>

        <div className="instagram-handle" onClick={openInstagram}>
          <div className="instagram-handle-icon">
            <InstagramIcon size={18} />
          </div>
          <span className="instagram-handle-text">@offkiltfashion</span>
        </div>

        <div className="instagram-grid">
          {GALLERY_ITEMS.map((item) => (
            <div
              key={item.id}
              className={`instagram-item${item.featured ? ' ig-featured' : ''}`}
              onClick={openInstagram}
            >
              <img
                src={item.src}
                alt="Off-Kilt Fashion"
                className="instagram-img"
                loading="lazy"
                onError={(e) => { e.target.style.background = '#111'; e.target.style.display = 'none'; }}
              />
              <div className="instagram-item-overlay">
                <div className="instagram-likes">
                  <Heart size={16} fill="white" color="white" />
                  {item.likes}
                </div>
                <span className="instagram-overlay-text">@offkiltfashion</span>
              </div>
            </div>
          ))}
        </div>

        <div className="instagram-follow-cta">
          <button className="instagram-follow-btn" onClick={openInstagram}>
            <InstagramIcon size={16} />
            Follow @offkiltfashion
          </button>
        </div>
      </div>
    </section>
  );
}
