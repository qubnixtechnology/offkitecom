import { useEffect, useRef } from 'react';
import { ArrowRight } from 'lucide-react';

export default function CampaignSection({ gender, title, subtitle, ctaText, image, onExplore }) {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => {
        if (e.isIntersecting) e.target.classList.add('in-view');
      }),
      { threshold: 0.15 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const devPrefix = import.meta.env.DEV ? '/build' : '';
  const imgSrc = image?.startsWith('/images/')
    ? `${devPrefix}${image}`
    : image;

  return (
    <section
      className={`campaign-section campaign-${gender} section-reveal`}
      ref={sectionRef}
      id={`campaign-${gender}`}
    >
      <div className="campaign-image-wrapper">
        <img
          src={imgSrc}
          alt={`${gender}'s campaign — ${title}`}
          className="campaign-image"
          loading="lazy"
        />
        <div className="campaign-gradient-overlay" />
      </div>

      <div className="campaign-content">
        <div className="campaign-inner">
          <span className="campaign-eyebrow">{gender === 'men' ? "Men's Collection" : "Women's Collection"}</span>
          <h2 className="campaign-title">{title}</h2>
          {subtitle && <p className="campaign-subtitle">{subtitle}</p>}
          <button className="campaign-cta" onClick={onExplore}>
            {ctaText || 'Explore'} <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  );
}
