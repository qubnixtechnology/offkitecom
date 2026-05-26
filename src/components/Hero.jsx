import { useEffect, useRef } from 'react';
import { ArrowDown } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ onExploreClick, isAppLoading }) {
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

  const pretitleVariants = {
    hidden: { opacity: 0, letterSpacing: '0.25em', y: -5 },
    visible: { 
      opacity: 1, 
      letterSpacing: '0.05em',
      y: 0,
      transition: { duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 } 
    }
  };

  const titleContainerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.6,
      }
    }
  };

  const titleWordVariants = {
    hidden: { y: "115%", rotate: 4 },
    visible: {
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 85,
        duration: 0.8,
      }
    }
  };

  const descriptionVariants = {
    hidden: { opacity: 0, y: 15, filter: 'blur(6px)' },
    visible: {
      opacity: 1,
      y: 0,
      filter: 'blur(0px)',
      transition: { duration: 1, ease: [0.16, 1, 0.3, 1], delay: 1.3 }
    }
  };

  const actionsVariants = {
    hidden: { opacity: 0, scale: 0.96, y: 10 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 1.6 }
    }
  };

  const titleText = "FASHION BEYOND ORDINARY";
  const words = titleText.split(" ");

  return (
    <section className="hero-sec" id="hero" ref={heroRef}>
      <div className="hero-bg-wrapper" ref={bgRef}>
        <video 
          autoPlay
          loop
          muted
          playsInline
          className="hero-bg"
          poster={import.meta.env.DEV ? "/build/images/hero_streetwear.png" : "/images/hero_streetwear.png"}
        >
          <source src={import.meta.env.DEV ? "/build/videos/hero_bg.mp4" : "/videos/hero_bg.mp4"} type="video/mp4" />
          <source src="https://cdn.shopify.com/videos/c/o/v/3bf4a509620e4e53aa454c856a432f1e.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <motion.span 
          variants={pretitleVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="mono hero-pretitle"
        >
          OFF-KILT // AUTUMN WINTER EDIT
        </motion.span>
        
        <motion.h1 
          variants={titleContainerVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-title"
        >
          {words.map((word, idx) => (
            <span key={idx} className="word-wrapper">
              <motion.span 
                variants={titleWordVariants}
                className={word === "BEYOND" ? "highlight-accent" : ""}
                style={{ display: 'inline-block', marginRight: idx === words.length - 1 ? 0 : '0.25em' }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </motion.h1>
        
        <motion.p 
          variants={descriptionVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-description"
        >
          Born from rebellion, crafted with precision. We don't follow trends—we destroy them. Explore modern raw denim engineered for self-expression.
        </motion.p>
        
        <motion.div 
          variants={actionsVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-actions"
        >
          <button className="btn-primary" onClick={onExploreClick}>
            Explore Catalog <ArrowDown size={16} />
          </button>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: isAppLoading ? 0 : 1 }}
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
