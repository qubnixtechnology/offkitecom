import { useEffect, useRef } from 'react';
import { ExternalLink } from 'lucide-react';

const PARTNERS = [
  {
    name: 'Myntra',
    url: 'https://www.myntra.com/',
    color: '#ff3f6c',
    logo: (
      <svg viewBox="0 0 100 30" className="partner-logo-svg">
        <text x="50" y="22" textAnchor="middle" fontFamily="'ITC Avant Garde Gothic', 'Century Gothic', 'Futura', sans-serif" fontWeight="800" fontSize="22" fill="currentColor">MYNTRA</text>
      </svg>
    )
  },
  {
    name: 'Ajio',
    url: 'https://www.ajio.com/',
    color: '#3f2a56',
    logo: (
      <svg viewBox="0 0 100 30" className="partner-logo-svg">
        <text x="50" y="22" textAnchor="middle" fontFamily="'ITC Avant Garde Gothic', 'Century Gothic', 'Futura', sans-serif" fontWeight="800" fontSize="24" fill="currentColor">AJIO</text>
      </svg>
    )
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.in/',
    color: '#ff9900',
    logo: (
      <svg viewBox="0 0 120 30" className="partner-logo-svg">
        <text x="60" y="22" textAnchor="middle" fontFamily="'ITC Avant Garde Gothic', 'Century Gothic', 'Futura', sans-serif" fontWeight="800" fontSize="22" fill="currentColor">amazon</text>
        <path d="M30 26 Q60 32 90 26" stroke="currentColor" strokeWidth="1.5" fill="none" opacity="0.6" />
      </svg>
    )
  },
  {
    name: 'Flipkart',
    url: 'https://www.flipkart.com/',
    color: '#2874f0',
    logo: (
      <svg viewBox="0 0 120 30" className="partner-logo-svg">
        <text x="60" y="22" textAnchor="middle" fontFamily="'ITC Avant Garde Gothic', 'Century Gothic', 'Futura', sans-serif" fontWeight="800" fontSize="20" fill="currentColor">Flipkart</text>
      </svg>
    )
  }
];

export default function SellerPartners() {
  const sectionRef = useRef(null);
  const headerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in-view');
          const cards = sectionRef.current?.querySelectorAll('.partner-card');
          cards?.forEach((card, i) => setTimeout(() => card.classList.add('in-view'), i * 100));
        }
      }),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="seller-partners-sec" id="seller-partners" ref={sectionRef}>
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">Available On</span>
          <h2 className="luxury-section-title">Our <em>Marketplace</em> Partners</h2>
          <p className="luxury-section-subtitle">
            Shop <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}>off-kilt</span> on India's leading fashion and e-commerce platforms.
          </p>
        </div>

        <div className="partners-grid">
          {PARTNERS.map((partner, idx) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-card section-reveal"
              style={{ transitionDelay: `${idx * 0.08}s`, '--partner-color': partner.color }}
              title={`Shop on ${partner.name}`}
            >
              <div className="partner-logo-wrapper">
                {partner.logo}
              </div>
              <div className="partner-info">
                <span className="partner-name">{partner.name}</span>
                <span className="partner-link">
                  Shop Now <ExternalLink size={11} />
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
