import { MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ onCategoryClick, onStoryClick, onTrackClick, onOpenAdmin }) {
  
  const handleInstagramClick = () => {
    window.open("https://www.instagram.com/off_kilt?igsh=MWQ3c29nNGhzNDMycw==", "_blank");
  };

  const handleWhatsAppClick = () => {
    window.open("https://wa.me/918291155692?text=Hi%20Off-Kilt%20Support,%20I'd%20like%20to%20inquire%20about%20your%20collection.", "_blank");
  };

  const handleEmailClick = (email) => {
    window.location.href = `mailto:${email}`;
  };

  return (
    <footer className="site-footer">
      <div className="container">
        <div className="footer-grid">
          
          {/* Brand Column */}
          <div className="footer-brand">
            <div>
              <div className="footer-logo-text">off-kilt</div>
              <div className="mono" style={{ color: 'var(--accent-raw)', fontSize: '0.65rem', letterSpacing: '2px', marginTop: '4px' }}>
                mō-dish // leading edge // Fashion beyond ordinary
              </div>
            </div>
            <p className="footer-desc">
              Off-Kilt is not just a brand—it's an attitude. Born from the spirit of rebellion and self-expression, Off-Kilt challenges the ordinary and redefines modern denim.
            </p>
            <div className="footer-socials">
              <button onClick={handleInstagramClick} className="social-link" title="Instagram">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                </svg>
              </button>
              <button onClick={handleWhatsAppClick} className="social-link" title="WhatsApp Chat">
                <MessageSquare size={18} />
              </button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h3 className="footer-column-title">SHOP</h3>
            <ul className="footer-links">
              <li><button onClick={() => onCategoryClick('jeans')} className="footer-link">MEN'S DENIM</button></li>
              <li><button onClick={() => onCategoryClick('skirts')} className="footer-link">WOMEN'S DENIM</button></li>
              <li><button onClick={() => onCategoryClick('all')} className="footer-link">ALL PRODUCTS</button></li>
              <li><button onClick={() => onCategoryClick('all')} className="footer-link">NEW ARRIVALS</button></li>
              <li><button onClick={() => onCategoryClick('all')} className="footer-link">SALE</button></li>
              <li><button onClick={onTrackClick} className="footer-link">TRACK ORDER</button></li>
            </ul>
          </div>

          {/* Company Pages */}
          <div>
            <h3 className="footer-column-title">COMPANY</h3>
            <ul className="footer-links">
              <li><button onClick={onStoryClick} className="footer-link">ABOUT US</button></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>REFUND & RETURN POLICY</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>FAQ</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>TERMS & CONDITIONS</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>CAREER</span></li>
              <li><span className="footer-link" style={{ cursor: 'default' }}>PARTNERSHIP</span></li>
            </ul>
          </div>

          {/* Contact & Newsletter */}
          <div className="footer-newsletter">
            <h3 className="footer-column-title">JOIN THE REBELLION</h3>
            <p className="footer-desc" style={{ fontSize: '0.8rem' }}>
              Subscribe to unlock drops, private selvedge edits, and rebellious stories.
            </p>
            
            <div className="newsletter-form">
              <input 
                type="email" 
                className="newsletter-input" 
                placeholder="YOUR EMAIL" 
              />
              <button className="newsletter-submit mono">
                SUBMIT
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '10px' }}>
              <div 
                onClick={() => handleEmailClick('info@off-kilt.com')} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                className="footer-link"
              >
                <Mail size={12} /> info@off-kilt.com
              </div>
              <div 
                onClick={() => handleEmailClick('offkiltfashion@gmail.com')} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                className="footer-link"
              >
                <Mail size={12} /> offkiltfashion@gmail.com
              </div>
              <div 
                onClick={handleWhatsAppClick} 
                style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                className="footer-link"
              >
                <Phone size={12} /> +91 8291155692
              </div>
            </div>
          </div>

        </div>

        {/* Bottom copyright and Payment integrations */}
        <div className="footer-bottom">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div>
              © {new Date().getFullYear()} <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, textTransform: 'lowercase' }}>off-kilt</span> FASHION. ALL RIGHTS PRESERVED. STAY RAW.
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-grey)', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
              DESIGN & DEVELOPED BY <a href="https://qubnixtechnology.com/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-light)', textDecoration: 'none', borderBottom: '1px solid var(--accent-raw)', paddingBottom: '1px', transition: 'color 0.2s' }} onMouseEnter={(e) => e.target.style.color = 'var(--accent-raw)'} onMouseLeave={(e) => e.target.style.color = 'var(--text-light)'}>QUBNIX TECHNOLOGY</a>
            </div>
          </div>
          <div className="footer-bottom-links">
            <span className="mono" style={{ fontSize: '0.65rem' }}>SECURE PAYMENTS BY RAZORPAY CHECKOUT</span>
          </div>
        </div>

      </div>
    </footer>
  );
}
