import { X, ArrowLeft } from 'lucide-react';

export default function CompanyPageViewer({ pageKey, pagesData, onClose }) {
  const page = pagesData[pageKey] || {
    title: 'Page Not Found',
    content: 'The requested company page could not be located.'
  };

  // Convert double newlines to paragraphs, single newlines to line breaks for simple formatting
  const formattedContent = page.content.split('\n\n').map((paragraph, idx) => {
    return (
      <p key={idx} style={{ marginBottom: '20px', lineHeight: '1.8', color: 'var(--text-grey)', fontSize: '1rem', whiteSpace: 'pre-line' }}>
        {paragraph}
      </p>
    );
  });

  return (
    <div style={{
      minHeight: '80vh',
      padding: '80px 0 120px 0',
      backgroundColor: 'var(--bg-dark)',
      color: 'var(--text-light)',
      animation: 'fadeIn 0.6s ease-out'
    }}>
      <div className="container" style={{ maxWidth: '800px' }}>
        {/* Back navigation */}
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-mono)',
            fontSize: '0.75rem',
            color: 'var(--accent-raw)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginBottom: '40px',
            transition: 'var(--transition-quick)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
        >
          <ArrowLeft size={14} /> Back to Home
        </button>

        {/* Page Header */}
        <header style={{ borderBottom: '1px solid rgba(0, 0, 0, 0.08)', paddingBottom: '24px', marginBottom: '40px' }}>
          <span className="mono" style={{ color: 'var(--accent-gold)', letterSpacing: '2px', fontSize: '0.7rem', fontWeight: 600 }}>COMPANY INFO</span>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            letterSpacing: '-1px',
            marginTop: '8px',
            fontFamily: 'var(--font-heading)',
            textTransform: 'uppercase'
          }}>{page.title}</h1>
        </header>

        {/* Page Content */}
        <article style={{ fontFamily: 'var(--font-body)' }}>
          {formattedContent}
        </article>
      </div>
    </div>
  );
}
