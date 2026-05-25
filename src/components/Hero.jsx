import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ onExploreClick }) {
  const heroRef = useRef(null);
  const bgRef = useRef(null);

  useEffect(() => {
    // GSAP Parallax
    gsap.to(bgRef.current, {
      yPercent: 40,
      ease: "none",
      scrollTrigger: {
        trigger: heroRef.current,
        start: "top top",
        end: "bottom top",
        scrub: true
      }
    });
  }, []);

  return (
    <section className="hero-sec" id="hero" ref={heroRef}>
      <div className="hero-bg-wrapper" ref={bgRef}>
        <video 
          autoPlay
          loop
          muted
          playsInline
          className="hero-bg"
          poster="/images/hero_streetwear.png"
        >
          <source src="/videos/hero_bg.mp4" type="video/mp4" />
          <source src="https://cdn.shopify.com/videos/c/o/v/3bf4a509620e4e53aa454c856a432f1e.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <motion.span 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="mono hero-pretitle"
        >
          OFF-KILT // AUTUMN WINTER EDIT
        </motion.span>
        
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="hero-title"
        >
          FASHION BEYOND ORDINARY
        </motion.h1>
        
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.4 }}
          className="hero-description"
        >
          Born from rebellion, crafted with precision. We don't follow trends—we destroy them. Explore modern raw denim engineered for self-expression.
        </motion.p>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.6 }}
          className="hero-actions"
        >
          <button className="btn-primary" onClick={onExploreClick}>
            Explore Catalog <ArrowDown size={16} />
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2 }}
        className="scroll-indicator" 
        onClick={onExploreClick} 
        style={{ cursor: 'pointer' }}
      >
        <span className="mono scroll-indicator-text">SCROLL TO REBEL</span>
        <div className="scroll-indicator-line"></div>
      </motion.div>
    </section>
  );
}
