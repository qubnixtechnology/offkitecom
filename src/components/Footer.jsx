import { useState, useEffect } from 'react';
import { MessageSquare, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer({ onCategoryClick, onStoryClick, onTrackClick, onOpenAdmin, onCompanyPageClick }) {
  const [footerData, setFooterData] = useState({
    email1: 'info@off-kilt.com',
    email2: 'offkiltfashion@gmail.com',
    phone: '+91 8291155692',
    address: 'Off-Kilt HQ, Cyber City, India',
    instagramUrl: 'https://www.instagram.com/off_kilt?igsh=MWQ3c29nNGhzNDMycw==',
    facebookUrl: '',
    youtubeUrl: '',
  });

  useEffect(() => {
    const loadFooterData = () => {
      setFooterData({
        email1: localStorage.getItem('offkilt_footer_email1') || 'info@off-kilt.com',
        email2: localStorage.getItem('offkilt_footer_email2') || 'offkiltfashion@gmail.com',
        phone: localStorage.getItem('offkilt_footer_phone') || '+91 8291155692',
        address: localStorage.getItem('offkilt_footer_address') || 'Off-Kilt HQ, Cyber City, India',
        instagramUrl: localStorage.getItem('offkilt_instagram_url') || 'https://www.instagram.com/off_kilt?igsh=MWQ3c29nNGhzNDMycw==',
        facebookUrl: localStorage.getItem('offkilt_facebook_url') || '',
        youtubeUrl: localStorage.getItem('offkilt_youtube_url') || '',
      });
    };
    loadFooterData();
    window.addEventListener('offkilt_settings_updated', loadFooterData);
    return () => window.removeEventListener('offkilt_settings_updated', loadFooterData);
  }, []);

  const handleInstagramClick = () => {
    if (footerData.instagramUrl) window.open(footerData.instagramUrl, "_blank");
  };

  const handleWhatsAppClick = () => {
    const cleanPhone = footerData.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone || '918291155692'}?text=Hi%20Off-Kilt%20Support,%20I'd%20like%20to%20inquire%20about%20your%20collection.`, "_blank");
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
               {footerData.instagramUrl && (
                 <button onClick={handleInstagramClick} className="social-link" title="Instagram">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                     <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                     <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
                   </svg>
                 </button>
               )}
               <button onClick={handleWhatsAppClick} className="social-link" title="WhatsApp Chat">
                 <MessageSquare size={18} />
               </button>
               {footerData.facebookUrl && (
                 <button onClick={() => window.open(footerData.facebookUrl, "_blank")} className="social-link" title="Facebook">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                   </svg>
                 </button>
               )}
               {footerData.youtubeUrl && (
                 <button onClick={() => window.open(footerData.youtubeUrl, "_blank")} className="social-link" title="YouTube">
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z" />
                     <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" />
                   </svg>
                 </button>
               )}
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
              <li><button onClick={() => onCompanyPageClick?.('about')} className="footer-link">ABOUT US</button></li>
              <li><button onClick={() => onCompanyPageClick?.('refund')} className="footer-link">REFUND & RETURN POLICY</button></li>
              <li><button onClick={() => onCompanyPageClick?.('faq')} className="footer-link">FAQ</button></li>
              <li><button onClick={() => onCompanyPageClick?.('terms')} className="footer-link">TERMS & CONDITIONS</button></li>
              <li><button onClick={() => onCompanyPageClick?.('career')} className="footer-link">CAREER</button></li>
              <li><button onClick={() => onCompanyPageClick?.('partnership')} className="footer-link">PARTNERSHIP</button></li>
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
              {footerData.email1 && (
                <div 
                  onClick={() => handleEmailClick(footerData.email1)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                  className="footer-link"
                >
                  <Mail size={12} /> {footerData.email1}
                </div>
              )}
              {footerData.email2 && (
                <div 
                  onClick={() => handleEmailClick(footerData.email2)} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                  className="footer-link"
                >
                  <Mail size={12} /> {footerData.email2}
                </div>
              )}
              {footerData.phone && (
                <div 
                  onClick={handleWhatsAppClick} 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', cursor: 'pointer', color: 'var(--text-grey)' }}
                  className="footer-link"
                >
                  <Phone size={12} /> {footerData.phone}
                </div>
              )}
              {footerData.address && (
                <div 
                  style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-grey)' }}
                >
                  <MapPin size={12} style={{ flexShrink: 0 }} /> {footerData.address}
                </div>
              )}
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
