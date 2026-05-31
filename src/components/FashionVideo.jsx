import { useRef, useState, useEffect } from 'react';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

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

export default function FashionVideo() {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(true);
  const [settings, setSettings] = useState({
    title: 'Style That Moves You',
    quote: '"Confidence in every stitch. Elegance in every move."',
    videoUrl: ''
  });
  const [resolvedVideoSrc, setResolvedVideoSrc] = useState('');

  useEffect(() => {
    const loadSettings = () => {
      const stored = localStorage.getItem('offkilt_fashion_film');
      if (stored) {
        try {
          setSettings(JSON.parse(stored));
        } catch (e) {
          console.error(e);
        }
      }
    };
    loadSettings();
    window.addEventListener('offkilt_fashion_film_updated', loadSettings);
    return () => window.removeEventListener('offkilt_fashion_film_updated', loadSettings);
  }, []);

  useEffect(() => {
    let active = true;
    let objectUrl = null;

    const resolveVideo = async () => {
      const src = settings.videoUrl;
      if (!src) {
        setResolvedVideoSrc(import.meta.env.DEV ? '/build/videos/hero_bg.mp4' : '/videos/hero_bg.mp4');
        return;
      }

      if (src.startsWith('indexeddb:')) {
        const key = src.replace('indexeddb:', '');
        try {
          const { getMediaFromIndexedDB } = await import('../services/db');
          const blob = await getMediaFromIndexedDB(key);
          if (blob && active) {
            objectUrl = URL.createObjectURL(blob);
            setResolvedVideoSrc(objectUrl);
          }
        } catch (err) {
          console.error('Failed to load fashion film video from IndexedDB:', err);
        }
      } else {
        setResolvedVideoSrc(src);
      }
    };

    resolveVideo();

    return () => {
      active = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [settings.videoUrl]);

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

  const hasYouTube = isYouTubeUrl(resolvedVideoSrc);

  return (
    <section className="fashion-video-sec" id="fashion-film">
      {hasYouTube ? (
        <iframe
          src={getYouTubeEmbedUrl(resolvedVideoSrc)}
          title="Fashion Film YouTube"
          frameBorder="0"
          allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="fashion-video-bg"
          style={{ width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%, -50%)', position: 'absolute', top: '50%', left: '50%', border: 'none', pointerEvents: 'none' }}
        />
      ) : (
        <video
          ref={videoRef}
          key={resolvedVideoSrc}
          autoPlay
          loop
          muted
          playsInline
          className="fashion-video-bg"
          src={resolvedVideoSrc}
        />
      )}
      <div className="fashion-video-overlay" />

      <div className="fashion-video-content">
        <span className="fashion-video-eyebrow">Fashion Film</span>
        <h2 className="fashion-video-title">
          {settings.title}
        </h2>
        {!hasYouTube && (
          <button
            className="fashion-video-play-btn"
            onClick={togglePlay}
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={28} /> : <Play size={28} />}
          </button>
        )}
        <p className="fashion-video-quote">
          {settings.quote}
        </p>
      </div>

      {/* Mute toggle */}
      {!hasYouTube && (
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
      )}

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
