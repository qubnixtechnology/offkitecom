import { useEffect, useRef } from 'react';
import { Star, CheckCircle } from 'lucide-react';

const REVIEWS = [
  {
    id: 'r1',
    text: '"The fabric quality is absolutely amazing! I ordered the carpenter jeans and they fit perfectly. Got so many compliments — this is my new favourite brand."',
    author: 'Priya Sharma',
    location: 'Mumbai, MH',
    photo: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Carpenter Jeans',
    verified: true,
  },
  {
    id: 'r2',
    text: '"Finally a denim brand that actually caters to women who love bold, edgy fashion. The denim skirt is stunning. Exactly what I wanted."',
    author: 'Ananya Reddy',
    location: 'Hyderabad, TS',
    photo: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Paneled Denim Skirt',
    verified: true,
  },
  {
    id: 'r3',
    text: '"Love everything about Off-Kilt. The packaging was so premium and the jeans are incredibly well-made. Worth every rupee. Will definitely order again!"',
    author: 'Sneha Kapoor',
    location: 'Delhi, DL',
    photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Wide Leg Jeans',
    verified: true,
  },
];

function StarRow({ rating }) {
  return (
    <div className="review-stars">
      {[1,2,3,4,5].map(i => (
        <Star
          key={i}
          size={14}
          fill={i <= rating ? 'var(--accent-gold)' : 'none'}
          stroke={i <= rating ? 'var(--accent-gold)' : 'var(--text-muted)'}
        />
      ))}
    </div>
  );
}

export default function CustomerReviews() {
  const headerRef = useRef(null);
  const cardsRef = useRef([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => e.isIntersecting && e.target.classList.add('in-view')),
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    cardsRef.current.forEach(el => el && observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="reviews-sec" id="reviews">
      <div className="container">
        <div className="luxury-section-header section-reveal" ref={headerRef}>
          <span className="luxury-eyebrow">What They Say</span>
          <h2 className="luxury-section-title">Customer <em>Love</em></h2>
          <p className="luxury-section-subtitle">Thousands of women trust Off-Kilt for their wardrobe. Here's what they have to say.</p>
        </div>

        <div className="reviews-grid">
          {REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className="review-card section-reveal"
              ref={el => cardsRef.current[idx] = el}
              style={{ transitionDelay: `${idx * 0.12}s` }}
            >
              <span className="review-quote-mark">"</span>
              <span className="review-product-tag">{review.product}</span>

              <StarRow rating={review.rating} />

              <p className="review-text">{review.text}</p>

              <div className="review-author">
                <img
                  src={review.photo}
                  alt={review.author}
                  className="review-author-img"
                  loading="lazy"
                />
                <div>
                  <p className="review-author-name">{review.author}</p>
                  <p className="review-author-location">{review.location}</p>
                  {review.verified && (
                    <div className="review-verified">
                      <CheckCircle size={10} />
                      Verified Purchase
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust badges */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: 60,
          marginTop: 70,
          flexWrap: 'wrap',
          paddingTop: 50,
          borderTop: '1px solid var(--bg-cream)'
        }}>
          {[
            { num: '10,000+', label: 'Happy Customers' },
            { num: '4.9', label: 'Average Rating' },
            { num: '5,000+', label: 'Reviews' },
          ].map((stat, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                fontFamily: 'var(--font-luxury)',
                fontSize: '3rem',
                fontWeight: 300,
                color: 'var(--text-light)',
                lineHeight: 1,
                marginBottom: 8,
                textTransform: 'none',
                letterSpacing: '-0.02em',
              }}>
                {stat.num}
              </div>
              <div style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '0.65rem',
                letterSpacing: 3,
                color: 'var(--text-muted)',
                textTransform: 'uppercase',
              }}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
