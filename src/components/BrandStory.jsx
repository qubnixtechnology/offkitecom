import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function BrandStory() {
  const sectionRef = useRef(null);
  const leftRef = useRef(null);
  const rightRef = useRef(null);

  const [story, setStory] = useState({
    title: 'REDEFINING DENIM FROM THE SOUL',
    body1: 'Born from the spirit of rebellion and self-expression, off-kilt challenges the ordinary and redefines modern denim. We create pieces that break away from tradition—clean yet bold, minimal yet impactful.',
    quote: '"We don\'t create for the masses. We build for the individual who stands solid in their own skin."',
    body2: 'Rooted in contemporary design and crafted with precision, our collections blend structure with individuality. Every stitch speaks confidence, every silhouette tells a story. This is for those who don’t follow trends—they set them.',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800'
  });

  useEffect(() => {
    const loadStory = () => {
      const stored = localStorage.getItem('offkilt_brand_story');
      if (stored) {
        try {
          setStory(prev => ({ ...prev, ...JSON.parse(stored) }));
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadStory();
    window.addEventListener('offkilt_settings_updated', loadStory);
    return () => window.removeEventListener('offkilt_settings_updated', loadStory);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Left content reveal
      gsap.fromTo(leftRef.current.children, 
        { y: 50, opacity: 0 },
        { 
          y: 0, 
          opacity: 1, 
          duration: 0.8, 
          stagger: 0.15,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 75%",
          }
        }
      );

      // Right image reveal with slight parallax
      gsap.fromTo(rightRef.current,
        { y: 100, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power3.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
          }
        }
      );
    }, sectionRef);

    return () => ctx.revert(); // cleanup
  }, [story.image]);

  return (
    <section className="story-sec" id="story" ref={sectionRef}>
      <div className="container">
        <div className="story-grid">
          
          <div className="story-left" ref={leftRef}>
            <div className="story-title-group">
              <span className="mono story-subtitle">THE NARRATIVE</span>
              <h2 className="story-title">{story.title}</h2>
            </div>
            
            <p className="story-body">
              {story.body1}
            </p>
            
            <p className="story-quote">
              {story.quote}
            </p>
            
            <p className="story-body" style={{ color: 'var(--text-grey)' }}>
              {story.body2}
            </p>
 
            <div className="story-highlight-box">
              <div className="highlight-item">
                <span className="highlight-num">100%</span>
                <span className="highlight-label">RAW SELVEDGE</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-num">INF</span>
                <span className="highlight-label">ATTITUDE</span>
              </div>
              <div className="highlight-item">
                <span className="highlight-num">0%</span>
                <span className="highlight-label">COMPROMISE</span>
              </div>
            </div>
          </div>
          
          <div className="story-right" ref={rightRef}>
            <div className="story-image-wrapper">
              <img 
                src={story.image} 
                alt="off-kilt denim closeup" 
                className="story-img"
              />
              <div className="story-img-overlay"></div>
              
              <div className="story-badge">
                <span>STAY RAW</span>
                <span style={{ fontSize: '0.6rem', letterSpacing: '2px', marginTop: '6px', color: 'var(--text-muted)' }}>STAY REAL</span>
              </div>
            </div>
          </div>
          
        </div>
      </div>
    </section>
  );
}
