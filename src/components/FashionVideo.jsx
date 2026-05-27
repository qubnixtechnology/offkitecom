import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

export default function FashionVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <section className="fashion-video-sec" id="fashion-film">
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        className="fashion-video-bg"
        src={import.meta.env.DEV ? '/build/videos/hero_bg.mp4' : '/videos/hero_bg.mp4'}
      />
      <div className="fashion-video-overlay" />

      <div className="fashion-video-content">
        <span className="fashion-video-eyebrow">Fashion Film</span>
        <h2 className="fashion-video-title">
          Style That Moves You
        </h2>
        <button
          className="fashion-video-play-btn"
          onClick={togglePlay}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? <Pause size={28} /> : <Play size={28} />}
        </button>
        <p className="fashion-video-quote">
          "Confidence in every stitch. Elegance in every move."
        </p>
      </div>

      {/* Mute toggle */}
      <button
        onClick={toggleMute}
        style={{
          position: 'absolute',
          bottom: 30,
          right: 30,
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,0.15)',
          borderRadius: '50%',
          width: 44,
          height: 44,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-light)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
        }}
        title={isMuted ? 'Unmute' : 'Mute'}
      >
        {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>

      <div style={{
        position: 'absolute',
        bottom: 30,
        left: 30,
        zIndex: 10,
        display: 'flex',
        flexDirection: 'column',
        gap: 4
      }}>
        <span style={{
          fontFamily: 'var(--font-brand)',
          fontWeight: 700,
          fontSize: '0.75rem',
          letterSpacing: '0px',
          color: 'rgba(255,255,255,0.7)',
          textTransform: 'lowercase'
        }}>off-kilt</span>
        <span className="mono" style={{
          fontSize: '0.65rem',
          color: 'rgba(255,255,255,0.4)',
          letterSpacing: '0.05em'
        }}>SS 2026</span>
      </div>
    </section>
  );
}
