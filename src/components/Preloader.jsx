import { useEffect, useState, useRef } from 'react';

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
  const [isContentHiding, setIsContentHiding] = useState(false);
  const [isOverlayHiding, setIsOverlayHiding] = useState(false);

  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    let currentWordIdx = 0;

    // Word cycler (driving the targets)
    const interval = setInterval(() => {
      setWordIndex((prevWordIdx) => {
        const nextWordIdx = prevWordIdx + 1;
        
        if (nextWordIdx >= STATEMENT_WORDS.length) {
          clearInterval(interval);
          return prevWordIdx;
        }
        
        currentWordIdx = nextWordIdx;
        return nextWordIdx;
      });
    }, 450);

    // Percentage progress roller (smoothly catches up to the word target)
    const percentInterval = setInterval(() => {
      setPercent((prevPercent) => {
        const targets = [15, 35, 55, 75, 90, 100];
        const target = targets[currentWordIdx] || 100;
        
        if (prevPercent < target) {
          const nextPercent = prevPercent + 1;
          if (nextPercent === 100) {
            clearInterval(percentInterval);
          }
          return nextPercent;
        }
        return prevPercent;
      });
    }, 15);

    return () => {
      clearInterval(interval);
      clearInterval(percentInterval);
    };
  }, []);

  useEffect(() => {
    if (percent === 100) {
      // 1. Wait a moment to show the 100% / OFF-KILT state (600ms)
      const contentFadeTimeout = setTimeout(() => {
        setIsContentHiding(true);
        
        // 2. Wait for the content fade-out transition to complete (600ms)
        const overlaySlideTimeout = setTimeout(() => {
          setIsOverlayHiding(true);
          
          // 3. Wait for the overlay slide-up transition to complete (1100ms)
          const completeTimeout = setTimeout(() => {
            if (onCompleteRef.current) {
              onCompleteRef.current();
            }
          }, 1100);
          
          return () => clearTimeout(completeTimeout);
        }, 600);
        
        return () => clearTimeout(overlaySlideTimeout);
      }, 600);
      
      return () => clearTimeout(contentFadeTimeout);
    }
  }, [percent]);

  return (
    <div className={`preloader-overlay ${isOverlayHiding ? 'hide' : ''}`}>
      <div className={`preloader-brand ${isContentHiding ? 'preloader-fade-out' : ''}`}>
        <span className="mono" style={{ fontSize: '0.9rem', color: '#8a8a93', letterSpacing: '4px', display: 'block', textAlign: 'center', marginBottom: '10px' }}>
          OFF-KILT // EDIT 01
        </span>
        <div style={{ minHeight: '6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <span style={{ display: 'inline-block' }}>{STATEMENT_WORDS[wordIndex]}</span>
        </div>
      </div>
      
      <div className={`preloader-progress-track ${isContentHiding ? 'preloader-fade-out' : ''}`}>
        <div className="preloader-progress-bar" style={{ width: `${percent}%` }}></div>
      </div>
      
      <div className={`preloader-tagline mono ${isContentHiding ? 'preloader-fade-out' : ''}`}>
        {percent}% INITIALIZING THE REBELLION
      </div>
    </div>
  );
}
