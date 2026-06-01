import { useRef, useState } from 'react';
import { Mail, Gift, Truck, Tag, CheckCircle } from 'lucide-react';
import { newsletter as newsletterApi } from '../services/api';

export default function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }
    try {
      await newsletterApi.subscribe(email);
      setSubmitted(true);
      setError('');
      setEmail('');
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to subscribe. Please try again.');
    }
  };

  return (
    <section className="newsletter-sec" id="newsletter">
      <div className="container">
        <div className="newsletter-inner">
          <span className="newsletter-icon">
            <Mail size={32} style={{ color: 'var(--accent-gold)' }} />
          </span>

          <h2 className="newsletter-title">
            First Access to New Arrivals &amp; Exclusive Offers
          </h2>

          <p className="newsletter-subtitle">
            Join the <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}>off-kilt</span> family. Get early access to new drops, style guides, and members-only offers delivered straight to your inbox.
          </p>

          {submitted ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              padding: '40px 0',
              animation: 'fadeUpIn 0.6s ease forwards'
            }}>
              <CheckCircle size={48} color="var(--accent-gold)" />
              <p style={{
                fontFamily: 'var(--font-luxury)',
                fontSize: '1.4rem',
                fontStyle: 'italic',
                color: 'var(--text-light)'
              }}>
                Welcome to the family!
              </p>
              <p style={{ color: 'var(--text-grey)', fontSize: '0.9rem' }}>
                Check your inbox for a special welcome gift.
              </p>
            </div>
          ) : (
            <>
              <form className="newsletter-form" onSubmit={handleSubmit}>
                <input
                  type="email"
                  className="newsletter-input"
                  placeholder="Your email address..."
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  aria-label="Email address"
                />
                <button type="submit" className="newsletter-submit">
                  <Mail size={14} style={{ display: 'inline', marginRight: 6 }} />
                  Subscribe
                </button>
              </form>

              {error && (
                <p style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.65rem',
                  color: '#ef4444',
                  letterSpacing: 1,
                  marginBottom: 16
                }}>{error}</p>
              )}

              <p className="newsletter-disclaimer">
                No spam, ever. Unsubscribe anytime.
              </p>
            </>
          )}

          <div className="newsletter-perks">
            <div className="newsletter-perk">
              <Gift size={16} className="newsletter-perk-icon" />
              <span>10% off first order</span>
            </div>
            <div className="newsletter-perk">
              <Truck size={16} className="newsletter-perk-icon" />
              <span>Free shipping updates</span>
            </div>
            <div className="newsletter-perk">
              <Tag size={16} className="newsletter-perk-icon" />
              <span>Exclusive sale access</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
