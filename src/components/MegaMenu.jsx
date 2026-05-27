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
  }
};

export default function MegaMenu({ activeMenu, onCategoryClick, onClose, onMouseEnter, onMouseLeave }) {
  const menuRef = useRef(null);
  const data = DENIM_CATEGORIES[activeMenu];

  if (!data) return null;

  const devPrefix = import.meta.env.DEV ? '/build' : '';
  const featuredImg = data.featured.image.startsWith('/images/')
    ? `${devPrefix}${data.featured.image}`
    : data.featured.image;

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
            {data.sections.map((section, idx) => (
              <div key={idx} className="mega-menu-category-group">
                <h4 className="mega-menu-group-title">{section.title}</h4>
                <ul className="mega-menu-links">
                  {section.links.map((link, i) => (
                    <li key={i}>
                      <button
                        className="mega-menu-link"
                        onClick={() => {
                          onCategoryClick?.(link.filter);
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

          {/* Featured Image */}
          <div
            className="mega-menu-featured"
            onClick={() => {
              onCategoryClick?.(data.featured.filter);
              onClose?.();
            }}
          >
            <img
              src={featuredImg}
              alt={data.featured.title}
              className="mega-menu-featured-img"
              loading="lazy"
            />
            <div className="mega-menu-featured-overlay" />
            <div className="mega-menu-featured-content">
              <span className="mega-menu-featured-title">{data.featured.title}</span>
              <span className="mega-menu-featured-cta">
                {data.featured.cta} <ArrowRight size={14} />
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
