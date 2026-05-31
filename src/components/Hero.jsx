import { useState, useEffect, useRef } from 'react';
import { ArrowDown, Sparkles } from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ onExploreClick, onShopNewArrivals, isAppLoading }) {
  const heroRef = useRef(null);
  const bgRef = useRef(null);

  const [heroSettings, setHeroSettings] = useState({
    mediaUrl: '',
    mediaType: 'video', // 'video' | 'image'
    word1: 'FASHION',
    word2: 'WITHOUT',
    word3: 'LIMITS',
    btn1Text: 'SHOP WOMEN',
    btn2Text: 'SHOP MEN',
    btn1Link: '#catalog',
    btn2Link: '#catalog',
  });

  useEffect(() => {
    const loadSettings = () => {
      const stored = localStorage.getItem('offkilt_campaign_hero');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setHeroSettings(prev => ({ ...prev, ...parsed }));
        } catch (e) {
          console.error('Error parsing hero settings', e);
        }
      }
    };
    loadSettings();
    window.addEventListener('offkilt_hero_updated', loadSettings);
    return () => window.removeEventListener('offkilt_hero_updated', loadSettings);
  }, []);

  useEffect(() => {
    // GSAP Parallax on scroll
    if (bgRef.current) {
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
    }
  }, [heroSettings.mediaUrl]);

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
        staggerChildren: 0.1,
        delayChildren: 0.6,
      }
    }
  };

  const titleWordVariants = {
    hidden: { y: "115%", rotate: 3 },
    visible: {
      y: 0,
      rotate: 0,
      transition: {
        type: "spring",
        damping: 14,
        stiffness: 80,
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

  const [resolvedMediaSrc, setResolvedMediaSrc] = useState('');

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    const resolveMedia = async () => {
      const src = heroSettings.mediaUrl;
      if (!src) {
        setResolvedMediaSrc(import.meta.env.DEV ? "/build/videos/hero_bg.mp4" : "/videos/hero_bg.mp4");
        return;
      }

      if (src.startsWith('indexeddb:')) {
        const key = src.replace('indexeddb:', '');
        try {
          const { getMediaFromIndexedDB } = await import('../services/db');
          const blob = await getMediaFromIndexedDB(key);
          if (blob && active) {
            objectUrl = URL.createObjectURL(blob);
            setResolvedMediaSrc(objectUrl);
          }
        } catch (err) {
          console.error('Failed to load hero media from IndexedDB:', err);
        }
      } else {
        setResolvedMediaSrc(src);
      }
    };

    resolveMedia();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [heroSettings.mediaUrl]);

  const isYouTubeUrl = (url) => {
    if (!url) return false;
    return url.includes('youtube.com') || url.includes('youtu.be');
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    let videoId = '';
    if (url.includes('youtu.be/')) {
      videoId = url.split('youtu.be/')[1]?.split(/[?#]/)[0];
    } else if (url.includes('v=')) {
      videoId = url.split('v=')[1]?.split(/[&#]/)[0];
    } else if (url.includes('embed/')) {
      videoId = url.split('embed/')[1]?.split(/[?#]/)[0];
    }
    return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&controls=0&showinfo=0&rel=0&modestbranding=1&iv_load_policy=3&playsinline=1&enablejsapi=1` : url;
  };

  const hasYouTube = isYouTubeUrl(resolvedMediaSrc);
  const isVideo = heroSettings.mediaType === 'video' || (resolvedMediaSrc && (resolvedMediaSrc.endsWith('.mp4') || resolvedMediaSrc.startsWith('blob:') || resolvedMediaSrc.startsWith('data:video/')));

  return (
    <section className="hero-sec" id="hero" ref={heroRef}>
      <div className="hero-bg-wrapper" ref={bgRef}>
        {hasYouTube ? (
          <iframe
            src={getYouTubeEmbedUrl(resolvedMediaSrc)}
            title="Hero Background YouTube"
            frameBorder="0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="hero-bg hero-zoom"
            style={{ width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%, -50%)', position: 'absolute', top: '50%', left: '50%', border: 'none', pointerEvents: 'none' }}
          />
        ) : isVideo ? (
          <video 
            autoPlay
            loop
            muted
            playsInline
            className="hero-bg hero-zoom"
            key={resolvedMediaSrc}
          >
            <source src={resolvedMediaSrc} type="video/mp4" />
            <source src="https://cdn.shopify.com/videos/c/o/v/3bf4a509620e4e53aa454c856a432f1e.mp4" type="video/mp4" />
          </video>
        ) : (
          <img 
            src={resolvedMediaSrc} 
            alt="Hero Background" 
            className="hero-bg hero-zoom"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        )}
      </div>
      <div className="hero-overlay"></div>
      
      <div className="hero-content">
        <motion.span 
          variants={pretitleVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-pretitle"
          style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}
        >
          <span style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '0px' }}>off-kilt</span>
          <span className="mono" style={{ opacity: 0.8 }}>// SS 2026 COLLECTION</span>
        </motion.span>
        
        <motion.h1 
          variants={titleContainerVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-title"
        >
          {/* Row 1, Column 1: Word 1 (Right-aligned) */}
          <div style={{ gridArea: '1 / 1 / 2 / 2', justifySelf: 'end', display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="word-wrapper" style={{ whiteSpace: 'nowrap' }}>
              <motion.span variants={titleWordVariants} className="highlight-accent" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {heroSettings.word1.toUpperCase()}
              </motion.span>
            </span>
          </div>
          
          {/* Row 1, Column 3: Word 2 (Left-aligned) */}
          <div style={{ gridArea: '1 / 3 / 2 / 4', justifySelf: 'start', display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap' }}>
            <span className="word-wrapper" style={{ whiteSpace: 'nowrap' }}>
              <motion.span variants={titleWordVariants} style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {heroSettings.word2.toUpperCase()}
              </motion.span>
            </span>
          </div>

          {/* Row 2, Columns 1-3: Word 3 (Centered under the gap) */}
          <div style={{ gridArea: '2 / 1 / 3 / 4', justifySelf: 'center', display: 'flex', overflow: 'hidden', marginTop: '6px', whiteSpace: 'nowrap' }}>
            <span className="word-wrapper" style={{ whiteSpace: 'nowrap' }}>
              <motion.span variants={titleWordVariants} className="highlight-accent" style={{ display: 'inline-block', whiteSpace: 'nowrap' }}>
                {heroSettings.word3.toUpperCase()}
              </motion.span>
            </span>
          </div>
        </motion.h1>
        
        <motion.p 
          variants={descriptionVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-description"
        >
          Bold. Effortless. Timeless.
        </motion.p>
        
        <motion.div 
          variants={actionsVariants}
          initial="hidden"
          animate={isAppLoading ? "hidden" : "visible"}
          className="hero-actions"
        >
          <button 
            className="btn-primary" 
            onClick={() => {
              if (heroSettings.btn1Link.startsWith('#')) {
                const el = document.getElementById(heroSettings.btn1Link.substring(1));
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = heroSettings.btn1Link;
              }
            }}
          >
            <Sparkles size={15} />
            {heroSettings.btn1Text}
          </button>
          <button 
            className="btn-outline-luxury" 
            onClick={() => {
              if (heroSettings.btn2Link.startsWith('#')) {
                const el = document.getElementById(heroSettings.btn2Link.substring(1));
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              } else {
                window.location.href = heroSettings.btn2Link;
              }
            }}
          >
            {heroSettings.btn2Text} <ArrowDown size={15} />
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
        <span className="mono scroll-indicator-text">SCROLL TO EXPLORE</span>
        <div className="scroll-indicator-line"></div>
      </motion.div>
    </section>
  );
}
