import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';

const STATEMENT_WORDS = [
  "REBELLION",
  "SELF-EXPRESSION",
  "BEYOND ORDINARY",
  "STAY RAW",
  "STAY REAL",
  "OFF-KILT"
];

export default function Preloader({ onComplete }) {
  const [percent, setPercent] = useState(0);
  const [wordIndex, setWordIndex] = useState(0);
  const containerRef = useRef(null);
  const progressBarRef = useRef(null);
  const wordRef = useRef(null);

  useEffect(() => {
    // Word cycler
    const wordInterval = setInterval(() => {
      setWordIndex((prev) => {
        if (prev < STATEMENT_WORDS.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 450);

    // Percentage progress
    const progressInterval = setInterval(() => {
      setPercent((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 2;
        if (next >= 100) {
          clearInterval(progressInterval);
          clearInterval(wordInterval);
          
          const tl = gsap.timeline({
            onComplete: onComplete
          });
          
          tl.to(wordRef.current, { y: -20, opacity: 0, duration: 0.4, ease: "power2.in" })
            .to(progressBarRef.current, { height: 0, opacity: 0, duration: 0.4, ease: "power2.inOut" }, "-=0.2")
            .to(containerRef.current, { y: "-100%", duration: 0.8, ease: "power4.inOut" }, "+=0.2")
            .set(containerRef.current, { display: "none" });

          return 100;
        }
        return next;
      });
    }, 80);

    return () => {
      clearInterval(wordInterval);
      clearInterval(progressInterval);
    };
  }, [onComplete]);

  return (
    <div className="preloader-overlay" ref={containerRef}>
      <div className="preloader-brand">
        <span className="mono" style={{ fontSize: '0.9rem', color: '#8a8a93', letterSpacing: '4px', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
          OFF-KILT // EDIT 01
        </span>
        <div style={{ minHeight: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span ref={wordRef} style={{ display: 'inline-block' }}>{STATEMENT_WORDS[wordIndex]}</span>
        </div>
      </div>
      
      <div className="preloader-progress-track">
        <div className="preloader-progress-bar" ref={progressBarRef} style={{ width: `${percent}%` }}></div>
      </div>
      
      <div className="preloader-tagline mono">
        {percent}% INITIALIZING THE REBELLION
      </div>
    </div>
  );
}
