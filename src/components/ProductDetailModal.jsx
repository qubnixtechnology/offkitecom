import { useState } from 'react';
import { X, ChevronDown, ChevronUp, ShoppingBag, Heart, ZoomIn, ShoppingCart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, wishlist = [], onWishlistToggle }) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const sizes = Array.isArray(product?.sizes) ? product.sizes
      : (typeof product?.sizes === 'string' ? JSON.parse(product.sizes) : []);
    return sizes.length === 1 ? sizes[0] : '';
  });
  const [activeAccordion, setActiveAccordion] = useState('specs');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const handleImageLoad = (url) => {
    setLoadedImages(prev => ({ ...prev, [url]: true }));
  };

  // Safely parse sizes and details (may come as strings from localStorage)
  const safeSizes = Array.isArray(product?.sizes) ? product.sizes
    : (typeof product?.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes); } catch { return []; } })() : []);
  const safeDetails = Array.isArray(product?.details) ? product.details
    : (typeof product?.details === 'string' ? (() => { try { return JSON.parse(product.details); } catch { return []; } })() : []);
  const productImages = product?.images && Array.isArray(product.images) && product.images.length > 0
    ? product.images
    : (typeof product?.images === 'string'
        ? (() => { try { return JSON.parse(product.images); } catch { return [product?.image].filter(Boolean); } })()
        : [product?.image].filter(Boolean));

  const currentImage = productImages[activeImgIndex] || product?.image;
  const isWishlistedProduct = wishlist.some(w => (w.id || w) === product?.id);

  const handleAddToCart = () => {
    if (safeSizes.length > 0 && !selectedSize) {
      setErrorMsg('Please select a size before adding to cart.');
      return;
    }
    setErrorMsg('');
    onAddToCart(product, selectedSize);
    onClose();
    setSelectedSize('');
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
  };

  const openLightbox = (e) => {
    e.stopPropagation();
    setLightboxOpen(true);
    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <AnimatePresence>
      {isOpen && product && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="drawer-backdrop open" 
            onClick={onClose} 
            style={{ display: 'block' }}
          />
          
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 220 }}
            className="product-modal open"
            style={{ display: 'grid' }}
          >
            {/* Mobile drag handle */}
            <div className="modal-drag-handle" aria-hidden="true" />

            <button className="modal-close-btn" onClick={onClose} aria-label="Close product view">
              <X size={18} />
            </button>

            {/* Image gallery */}
            <div className="modal-image-gallery-container">
              <div
                className="modal-image-gallery modal-image-tappable"
                onClick={openLightbox}
                title="Tap to view fullscreen"
              >
                {!loadedImages[currentImage] && (
                  <div className="image-shimmer-skeleton" />
                )}
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImgIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    src={currentImage} 
                    alt={product.name} 
                    className={`modal-gallery-img ${loadedImages[currentImage] ? 'loaded' : 'loading-blur'}`}
                    loading="lazy"
                    ref={(el) => {
                      if (el && el.complete && el.naturalWidth > 0 && !loadedImages[currentImage]) {
                        handleImageLoad(currentImage);
                      }
                    }}
                    onLoad={() => handleImageLoad(currentImage)}
                  />
                </AnimatePresence>
                <div className="modal-gallery-overlay" />

                {/* Zoom hint — visible on mobile only */}
                <div className="modal-zoom-hint">
                  <ZoomIn size={13} />
                  Tap to expand
                </div>

                {/* Gallery Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button 
                      className="gallery-nav-btn prev" 
                      onClick={(e) => { e.stopPropagation(); setActiveImgIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1)); }}
                      title="Previous Image"
                    >
                      &larr;
                    </button>
                    <button 
                      className="gallery-nav-btn next" 
                      onClick={(e) => { e.stopPropagation(); setActiveImgIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1)); }}
                      title="Next Image"
                    >
                      &rarr;
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails Row */}
              {productImages.length > 1 && (
                <div className="modal-gallery-thumbnails">
                  {productImages.map((img, idx) => (
                    <button 
                      key={idx}
                      className={`gallery-thumb-btn ${activeImgIndex === idx ? 'active' : ''}`}
                      onClick={() => setActiveImgIndex(idx)}
                    >
                      <img 
                        src={img} 
                        alt={`Thumb ${idx + 1}`} 
                        className={`gallery-thumb-img ${loadedImages[img] ? 'loaded' : 'loading-blur'}`} 
                        loading="lazy" 
                        ref={(el) => {
                          if (el && el.complete && el.naturalWidth > 0 && !loadedImages[img]) {
                            handleImageLoad(img);
                          }
                        }}
                        onLoad={() => handleImageLoad(img)}
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right Side: Product Details */}
            <div className="modal-details-container" data-lenis-prevent>
              <div>
                <span className="mono modal-tagline">{product.tagline}</span>
                <h2 className="modal-title">{product.name}</h2>
                <div className="mono" style={{ color: 'var(--text-grey)', fontSize: '0.75rem', marginTop: '6px' }}>
                  CATALOG ID: {product.id} // TAX INCLUDED (GST @ 12% INCL.)
                </div>
              </div>

              <div className="modal-price">
                ₹{product.price.toLocaleString('en-IN')}
              </div>

              <p className="modal-desc">
                {product.description}
              </p>

              {/* Size Selection */}
              <div className="size-selection-area">
                <div className="size-selector-title">
                  <span className="mono" style={{ fontSize: '0.8rem' }}>SELECT SIZE</span>
                  <button className="size-guide-link">Size Guide</button>
                </div>
                
                <div className="size-options">
                  {safeSizes.map((size) => (
                    <button
                      key={size}
                      className={`size-option-btn ${selectedSize === size ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedSize(size);
                        setErrorMsg('');
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                {errorMsg && (
                  <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '8px', fontFamily: 'var(--font-mono)' }}>
                    {errorMsg}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="modal-actions" style={{ display: 'flex', gap: '12px', alignItems: 'stretch' }}>
                <button className="btn-primary add-to-cart-btn" onClick={handleAddToCart} style={{ flex: 1 }}>
                  <ShoppingBag size={16} /> Add To Cart
                </button>
                {/* Wishlist toggle button */}
                <button
                  onClick={() => onWishlistToggle?.(product)}
                  title={isWishlistedProduct ? 'Remove from Wishlist' : 'Save to Wishlist'}
                  style={{
                    width: '52px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: isWishlistedProduct
                      ? '1px solid var(--accent-rose-dark)'
                      : '1px solid rgba(255,255,255,0.12)',
                    background: isWishlistedProduct
                      ? 'rgba(176,120,120,0.15)'
                      : 'transparent',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    color: isWishlistedProduct
                      ? 'var(--accent-rose-dark)'
                      : 'rgba(255,255,255,0.5)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Heart
                    size={18}
                    fill={isWishlistedProduct ? 'var(--accent-rose-dark)' : 'none'}
                  />
                </button>
              </div>

              {/* Details Accordion */}
              <div className="specs-accordions">
                <div className="spec-accordion">
                  <button className="spec-header" onClick={() => toggleAccordion('specs')}>
                    <span>TECHNICAL SPECIFICATIONS</span>
                    {activeAccordion === 'specs' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'specs' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="spec-content"
                      >
                        <ul className="spec-list">
                          {safeDetails.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="spec-accordion">
                  <button className="spec-header" onClick={() => toggleAccordion('materials')}>
                    <span>MATERIALS &amp; CARE</span>
                    {activeAccordion === 'materials' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'materials' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="spec-content"
                      >
                        <p>{product.materials}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="spec-accordion">
                  <button className="spec-header" onClick={() => toggleAccordion('shipping')}>
                    <span>SHIPPING &amp; TAX DETAILS</span>
                    {activeAccordion === 'shipping' ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                  <AnimatePresence>
                    {activeAccordion === 'shipping' && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="spec-content" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
                      >
                        <p>{product.shipping}</p>
                        <p><strong>GST Info:</strong> Integrated Goods &amp; Services Tax (IGST) is applied automatically based on delivery zones. Our listed prices include 12% apparel GST.</p>
                        <p><strong>Zones:</strong> Free shipping is provided all across India. Standard cash on delivery (COD) charges of ₹99 apply if chosen at checkout.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── FULLSCREEN IMAGE LIGHTBOX ── */}
          <AnimatePresence>
            {lightboxOpen && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="image-lightbox-overlay"
                onClick={closeLightbox}
              >
                {/* Close button */}
                <button
                  className="lightbox-close-btn"
                  onClick={closeLightbox}
                  aria-label="Close fullscreen"
                >
                  <X size={20} />
                </button>

                {/* Image counter */}
                {productImages.length > 1 && (
                  <div className="lightbox-counter">
                    {activeImgIndex + 1} / {productImages.length}
                  </div>
                )}

                {/* Main image */}
                <motion.img
                  key={activeImgIndex}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  src={currentImage}
                  alt={product.name}
                  className="lightbox-img"
                  onClick={(e) => e.stopPropagation()}
                />

                {/* Navigation arrows */}
                {productImages.length > 1 && (
                  <>
                    <button
                      className="lightbox-nav prev"
                      onClick={(e) => { e.stopPropagation(); setActiveImgIndex(i => (i === 0 ? productImages.length - 1 : i - 1)); }}
                    >
                      ←
                    </button>
                    <button
                      className="lightbox-nav next"
                      onClick={(e) => { e.stopPropagation(); setActiveImgIndex(i => (i === productImages.length - 1 ? 0 : i + 1)); }}
                    >
                      →
                    </button>
                  </>
                )}

                {/* Dot indicators */}
                {productImages.length > 1 && (
                  <div className="lightbox-dots">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        className={`lightbox-dot ${i === activeImgIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveImgIndex(i); }}
                        aria-label={`View image ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
