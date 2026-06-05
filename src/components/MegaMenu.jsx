import { useState, useRef, useEffect } from 'react';
import { ArrowRight, ChevronRight } from 'lucide-react';

const DENIM_CATEGORIES = {
  men: {
    label: 'Men',
    sections: [
      {
        title: 'DENIM FIT',
        links: [
          { name: 'Baggy', filter: 'baggy' },
          { name: 'Relaxed', filter: 'relaxed' },
          { name: 'Boot Cut', filter: 'boot cut' },
          { name: 'Slim', filter: 'slim' },
          { name: 'Skinny', filter: 'skinny' },
        ]
      },
      {
        title: 'CATEGORIES',
        links: [
          { name: 'All Jeans', filter: 'jeans' },
          { name: 'New Arrivals', filter: 'all' },
          { name: 'Cargo & Utility', filter: 'jeans' },
          { name: 'Carpenter', filter: 'jeans' },
        ]
      }
    ],
    featured: {
      image: '/images/mens_campaign.png',
      title: 'Men\'s SS26 Campaign',
      cta: 'Explore Men\'s',
      filter: 'jeans'
    }
  },
  women: {
    label: 'Women',
    sections: [
      {
        title: 'DENIM FIT',
        links: [
          { name: 'Baggy', filter: 'baggy' },
          { name: 'Relaxed', filter: 'relaxed' },
          { name: 'Boot Cut', filter: 'boot cut' },
          { name: 'Slim', filter: 'slim' },
          { name: 'Skinny', filter: 'skinny' },
        ]
      },
      {
        title: 'CATEGORIES',
        links: [
          { name: 'All Products', filter: 'all' },
          { name: 'Denim Skirts', filter: 'skirts' },
          { name: 'Kilt Skirts', filter: 'skirts' },
          { name: 'New Arrivals', filter: 'all' },
        ]
      }
    ],
    featured: {
      image: '/images/womens_campaign.png',
      title: 'Women\'s SS26 Campaign',
      cta: 'Explore Women\'s',
      filter: 'skirts'
    }
  },
  collection: {
    label: 'Collection',
    sections: [
      {
        title: 'STYLES',
        links: [
          { name: 'All Products', filter: 'all' },
          { name: 'Jeans', filter: 'jeans' },
          { name: 'Skirts', filter: 'skirts' },
          { name: 'Cargo & Utility', filter: 'jeans' },
          { name: 'Shirts', filter: 'shirts' },
          { name: '🔴 SALE', filter: 'sale' },
        ]
      },
      {
        title: 'DENIM FITS',
        links: [
          { name: 'Baggy', filter: 'baggy' },
          { name: 'Relaxed', filter: 'relaxed' },
          { name: 'Boot Cut', filter: 'boot cut' },
          { name: 'Slim', filter: 'slim' },
          { name: 'Skinny', filter: 'skinny' },
        ]
      }
    ],
    featured: {
      image: '/images/narrative_cover.png',
      title: 'Our Premium Fits',
      cta: 'Explore Collection',
      filter: 'all'
    }
  },
  'after-dark': {
    label: 'After Dark',
    sections: [
      {
        title: 'MEN',
        links: [
          { name: 'Fits', filter: 'all' },
        ]
      },
      {
        title: 'WOMEN',
        links: [
          { name: 'Fits', filter: 'all' },
          { name: 'Skirts', filter: 'skirts' }
        ]
      }
    ],
    featured: {
      image: '/images/narrative_cover.png',
      title: 'After Dark Campaign',
      cta: 'Explore Collection',
      filter: 'all'
    }
  }
};

export default function MegaMenu({ activeMenu, onCategoryClick, onClose, onMouseEnter, onMouseLeave }) {
  const menuRef = useRef(null);

  // Validate that a stored mega menu entry has the correct sections[] format
  const isValidMegaMenu = (data) => {
    if (!data || typeof data !== 'object') return false;
    const keys = Object.keys(data);
    if (keys.length === 0) return false;
    // Old format had .fits / .categories — new format has .sections[]
    return keys.every(k => {
      const entry = data[k];
      return entry && Array.isArray(entry.sections);
    });
  };

  const [denimCategories, setDenimCategories] = useState(() => {
    try {
      const stored = localStorage.getItem('offkilt_mega_menu');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (isValidMegaMenu(parsed)) return parsed;
        // Stale/incompatible format — reset it
        localStorage.removeItem('offkilt_mega_menu');
      }
    } catch (e) {}
    return DENIM_CATEGORIES;
  });

  useEffect(() => {
    const loadMegaMenu = () => {
      try {
        const stored = localStorage.getItem('offkilt_mega_menu');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (isValidMegaMenu(parsed)) setDenimCategories(parsed);
        }
      } catch (e) {}
    };
    window.addEventListener('offkilt_settings_updated', loadMegaMenu);
    return () => window.removeEventListener('offkilt_settings_updated', loadMegaMenu);
  }, []);

  const data = activeMenu ? denimCategories[activeMenu] : null;

  if (!data) return null;

  const featured = data.featured || {};
  const featuredImage = featured.image || '';
  const devPrefix = import.meta.env.DEV ? '/build' : '';
  const featuredImg = featuredImage.startsWith('/images/')
    ? `${devPrefix}${featuredImage}`
    : featuredImage;

  return (
    <div
      className={`mega-menu-wrapper ${activeMenu ? 'open' : ''}`}
      ref={menuRef}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave || onClose}
    >
      <div className="container">
        <div className="mega-menu-content">
          {/* Category Columns */}
          <div className="mega-menu-categories">
            {(data.sections || []).map((section, idx) => (
              <div key={idx} className="mega-menu-category-group">
                <h4 className="mega-menu-group-title">{section.title}</h4>
                <ul className="mega-menu-links">
                  {(section.links || []).map((link, i) => (
                    <li key={i}>
                      <button
                        className="mega-menu-link"
                        onClick={() => {
                          onCategoryClick?.(link.filter, section.title);
                          onClose?.();
                        }}
                      >
                        {link.name}
                        <ChevronRight size={12} className="mega-menu-link-arrow" />
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Featured Image — only render if image URL exists */}
          {featuredImg && (
            <div
              className="mega-menu-featured"
              onClick={() => {
                onCategoryClick?.(featured.filter);
                onClose?.();
              }}
            >
              <img
                src={featuredImg}
                alt={featured.title || ''}
                className="mega-menu-featured-img"
                loading="lazy"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
              <div className="mega-menu-featured-overlay" />
              <div className="mega-menu-featured-content">
                <span className="mega-menu-featured-title">{featured.title || ''}</span>
                <span className="mega-menu-featured-cta">
                  {featured.cta || 'Explore'} <ArrowRight size={14} />
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
