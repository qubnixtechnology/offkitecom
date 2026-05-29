import { useEffect, useState } from 'react';

const DEFAULT_PARTNERS = [
  {
    name: 'Myntra',
    url: 'https://www.myntra.com/',
    color: '#ff3f6c',
    logoText: 'MYNTRA',
    active: true
  },
  {
    name: 'Ajio',
    url: 'https://www.ajio.com/',
    color: '#3f2a56',
    logoText: 'AJIO',
    active: true
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.in/',
    color: '#ff9900',
    logoText: 'amazon',
    active: true
  },
  {
    name: 'Flipkart',
    url: 'https://www.flipkart.com/',
    color: '#2874f0',
    logoText: 'Flipkart',
    active: true
  }
];

export default function SellerPartners() {
  const [partners, setPartners] = useState(() => {
    const stored = localStorage.getItem('offkilt_partners');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return DEFAULT_PARTNERS;
      }
    }
    return DEFAULT_PARTNERS;
  });

  useEffect(() => {
    const loadPartners = () => {
      const stored = localStorage.getItem('offkilt_partners');
      if (stored) {
        try {
          setPartners(JSON.parse(stored));
        } catch (e) {}
      }
    };
    window.addEventListener('offkilt_settings_updated', loadPartners);
    return () => window.removeEventListener('offkilt_settings_updated', loadPartners);
  }, []);

  const activePartners = partners.filter(p => p.active !== false);

  if (activePartners.length === 0) return null;

  return (
    <section className="seller-partners-sec" id="seller-partners">
      <div className="partners-strip-wrapper">
        <div className="partners-strip-label">
          <span>AVAILABLE ON</span>
        </div>
        <div className="partners-strip-logos">
          {activePartners.map((partner) => (
            <a
              key={partner.name}
              href={partner.url}
              target="_blank"
              rel="noopener noreferrer"
              className="partner-strip-item"
              style={{ 
                '--partner-hover-color': partner.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title={`Shop on ${partner.name}`}
            >
              {partner.imageUrl ? (
                <img 
                  src={partner.imageUrl} 
                  alt={partner.name} 
                  style={{ 
                    maxHeight: '26px', 
                    maxWidth: '120px', 
                    objectFit: 'contain', 
                    filter: 'brightness(0) invert(0)', 
                    transition: 'opacity 0.3s ease' 
                  }} 
                  className="partner-logo-img"
                />
              ) : (
                <span className="partner-strip-name">{partner.logoText || partner.name}</span>
              )}
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

