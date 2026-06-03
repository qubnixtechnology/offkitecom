import { useState, useEffect, useRef } from 'react';
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
    text: '"Love everything about off-kilt. The packaging was so premium and the jeans are incredibly well-made. Worth every rupee. Will definitely order again!"',
    author: 'Sneha Kapoor',
    location: 'Delhi, DL',
    photo: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Wide Leg Jeans',
    verified: true,
  },
  {
    id: 'r4',
    text: '"The fit is out of this world. It is so hard to find skirts that fit my waist and hips perfectly, but this one sits just right. 10/10 recommendation!"',
    author: 'Sneha G.',
    location: 'Bangalore, KA',
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Asymmetrical Paneled Denim Skirt',
    verified: true,
  },
  {
    id: 'r5',
    text: '"Super fast delivery and top-notch, neat packaging. The quality of the denim is heavy and authentic. Love the raw, undone edge aesthetic."',
    author: 'Kriti M.',
    location: 'Pune, MH',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop',
    rating: 5,
    product: 'Contrast-Stitch Double Knee Carpenter',
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
  const [activeReviewIdx, setActiveReviewIdx] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [revealedCards, setRevealedCards] = useState({});
  const [headerInView, setHeaderInView] = useState(false);
  const headerRef = useRef(null);
  const cardsRef = useRef([]);
  const gridRef = useRef(null);
  const throttleTimeout = useRef(null);

  const getReviewStats = () => {
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_review_stats'));
      if (stored && stored.happyCustomers) return stored;
    } catch (e) {}
    return { happyCustomers: '10,000+', avgRating: '4.9', reviewCount: '5,000+' };
  };
  const [reviewStats, setReviewStats] = useState(getReviewStats);

  useEffect(() => {
    const onUpdate = () => setReviewStats(getReviewStats());
    window.addEventListener('offkilt_settings_updated', onUpdate);
    return () => window.removeEventListener('offkilt_settings_updated', onUpdate);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            if (e.target === headerRef.current) {
              setHeaderInView(true);
            } else {
              const idx = cardsRef.current.indexOf(e.target);
              if (idx !== -1) {
                setRevealedCards(prev => ({ ...prev, [idx]: true }));
              }
            }
          }
        });
      },
      { threshold: 0.1 }
    );
    if (headerRef.current) observer.observe(headerRef.current);
    cardsRef.current.forEach(el => el && observer.observe(el));

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      if (throttleTimeout.current) {
        clearTimeout(throttleTimeout.current);
      }
    };
  }, []);

  const handleScroll = () => {
    if (throttleTimeout.current) return;

    throttleTimeout.current = setTimeout(() => {
      throttleTimeout.current = null;
      if (!gridRef.current) return;
      const container = gridRef.current;
      const cards = container.querySelectorAll('.review-card');
      if (cards.length === 0) return;

      let closestIdx = 0;
      let minDistance = Infinity;

      const containerRect = container.getBoundingClientRect();
      const containerCenter = containerRect.left + containerRect.width / 2;

      cards.forEach((card, idx) => {
        const cardRect = card.getBoundingClientRect();
        const cardCenter = cardRect.left + cardRect.width / 2;
        const distance = Math.abs(cardCenter - containerCenter);
        if (distance < minDistance) {
          minDistance = distance;
          closestIdx = idx;
        }
      });

      setActiveReviewIdx(closestIdx);
    }, 120);
  };

  const scrollToReview = (idx) => {
    if (!gridRef.current) return;
    const container = gridRef.current;
    const cards = container.querySelectorAll('.review-card');
    const targetCard = cards[idx];
    if (targetCard) {
      container.scrollTo({
        left: targetCard.offsetLeft - (container.clientWidth - targetCard.clientWidth) / 2,
        behavior: 'smooth'
      });
      setActiveReviewIdx(idx);
    }
  };

  return (
    <section className="reviews-sec" id="reviews">
      <div className="container">
        <div className={`luxury-section-header section-reveal ${headerInView ? 'in-view' : ''}`} ref={headerRef}>
          <span className="luxury-eyebrow">What They Say</span>
          <h2 className="luxury-section-title">Customer <em>Love</em></h2>
          <p className="luxury-section-subtitle">Thousands of women trust <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700 }}>off-kilt</span> for their wardrobe. Here's what they have to say.</p>
        </div>

        <div className="reviews-grid" ref={gridRef} onScroll={isMobile ? handleScroll : undefined}>
          {REVIEWS.map((review, idx) => (
            <div
              key={review.id}
              className={`review-card section-reveal ${revealedCards[idx] ? 'in-view' : ''}`}
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

        {/* Mobile Page indicator dots */}
        <div className="reviews-mobile-dots">
          {REVIEWS.map((_, i) => (
            <button
              key={i}
              className={`review-dot ${activeReviewIdx === i ? 'active' : ''}`}
              onClick={() => scrollToReview(i)}
              aria-label={`Go to review ${i + 1}`}
            />
          ))}
        </div>

        {/* Trust badges */}
        <div className="reviews-stats-row">
          {[
            { num: reviewStats.happyCustomers || '10,000+', label: 'Happy Customers' },
            { num: reviewStats.avgRating || '4.9', label: 'Average Rating' },
            { num: reviewStats.reviewCount || '5,000+', label: 'Reviews' },
          ].map((stat, i) => (
            <div key={i} className="stat-item">
              <div className="stat-num">
                {stat.num}
              </div>
              <div className="stat-label">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
