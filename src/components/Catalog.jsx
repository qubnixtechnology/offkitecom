import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { products as productsApi } from '../services/api';

export default function Catalog({ onProductClick, activeTab, setActiveTab }) {
  const [productsList, setProductsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState({});
  const [renderedCategory, setRenderedCategory] = useState(activeTab);

  const handleImageLoad = (url) => {
    setLoadedImages(prev => ({ ...prev, [url]: true }));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await productsApi.getAll(activeTab);
        // Map API keys to expected local keys if needed, since details and sizes might be strings
        const mapped = res.data.map(p => ({
          ...p,
          details: typeof p.details === 'string' ? JSON.parse(p.details) : p.details,
          sizes: typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes,
          images: typeof p.images === 'string' ? JSON.parse(p.images) : p.images,
          hoverImage: p.hover_image,
        }));
        setProductsList(mapped);
        setRenderedCategory(activeTab);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [activeTab]);

  return (
    <section className="catalog-sec" id="catalog">
      <div className="container">
        
        <div className="catalog-header">
          <div className="catalog-title-wrapper">
            <span className="mono" style={{ color: 'var(--accent-raw)' }}>THE COLLECTIONS</span>
            <h2 className="catalog-title">STREET & DENIM EDITS</h2>
            <p>Select category to explore tailored structural garments crafted with raw materials.</p>
          </div>
          
          <div className="category-tabs">
            {['all', 'jeans', 'skirts'].map(tab => (
              <button 
                key={tab}
                className={`category-tab mono ${activeTab === tab ? 'active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div style={{ position: 'relative', width: '100%', minHeight: '400px' }}>
          {loading && <div className="catalog-loading-bar" />}
          <div className={`products-grid ${loading ? 'grid-loading' : ''}`}>
            <AnimatePresence mode="popLayout">
              {productsList.map((product, index) => (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 15 }}
                  transition={{ duration: 0.25, delay: index * 0.02 }}
                  key={`${renderedCategory}-${product.id}`}
                  className="product-card"
                >
                  <div className="product-image-container">
                    {product.badge && <span className="product-card-badge">{product.badge}</span>}
                    
                    {!loadedImages[product.image] && (
                      <div className="image-shimmer-skeleton" />
                    )}
                    
                    <img 
                      src={product.image} 
                      alt={product.name} 
                      className={`product-image ${loadedImages[product.image] ? 'loaded' : 'loading-blur'}`}
                      loading="lazy"
                      ref={(el) => {
                        if (el && el.complete && el.naturalWidth > 0 && !loadedImages[product.image]) {
                          handleImageLoad(product.image);
                        }
                      }}
                      onLoad={() => handleImageLoad(product.image)}
                    />
                    {product.hoverImage && (
                      <img 
                        src={product.hoverImage} 
                        alt={`${product.name} alternate view`} 
                        className={`product-image-hover ${loadedImages[product.hoverImage] ? 'loaded' : 'loading-blur'}`} 
                        loading="lazy"
                        ref={(el) => {
                          if (el && el.complete && el.naturalWidth > 0 && !loadedImages[product.hoverImage]) {
                            handleImageLoad(product.hoverImage);
                          }
                        }}
                        onLoad={() => handleImageLoad(product.hoverImage)}
                      />
                    )}
                    <div className="product-card-overlay">
                      <button 
                        className="product-quick-btn mono"
                        onClick={() => onProductClick(product)}
                      >
                        Quick Details
                      </button>
                    </div>
                  </div>
                  
                  <div className="product-info" onClick={() => onProductClick(product)} style={{ cursor: 'pointer' }}>
                    <div className="product-meta">
                      <span className="product-tag">{product.tagline}</span>
                      <h3 className="product-name">{product.name}</h3>
                    </div>
                    <div className="product-price">
                      ₹{product.price.toLocaleString('en-IN')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

      </div>
    </section>
  );
}
