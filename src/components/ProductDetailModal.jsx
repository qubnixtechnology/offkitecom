import { useState } from 'react';
import { X, ChevronDown, ChevronUp, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart }) {
  const [selectedSize, setSelectedSize] = useState(() => {
    return product && product.sizes && product.sizes.length === 1 ? product.sizes[0] : '';
  });
  const [activeAccordion, setActiveAccordion] = useState('specs');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);

  const productImages = product?.images && product.images.length > 0 
    ? product.images 
    : [product?.image];

  const handleAddToCart = () => {
    if (product.sizes.length > 0 && !selectedSize) {
      setErrorMsg('Please select a size before adding to cart.');
      return;
    }
    setErrorMsg('');
    onAddToCart(product, selectedSize);
    onClose();
    setSelectedSize(''); // Reset size
  };

  const toggleAccordion = (name) => {
    setActiveAccordion(activeAccordion === name ? '' : name);
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
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="product-modal open"
            style={{ display: 'grid' }}
          >
            <button className="modal-close-btn" onClick={onClose}>
              <X size={20} />
            </button>

            {/* Left Side: Product Gallery */}
            <div className="modal-image-gallery-container">
              <div className="modal-image-gallery">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={activeImgIndex}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{ duration: 0.2 }}
                    src={productImages[activeImgIndex] || product.image} 
                    alt={product.name} 
                    className="modal-gallery-img"
                    loading="lazy"
                  />
                </AnimatePresence>
                <div className="modal-gallery-overlay"></div>

                {/* Gallery Navigation Arrows */}
                {productImages.length > 1 && (
                  <>
                    <button 
                      className="gallery-nav-btn prev" 
                      onClick={() => setActiveImgIndex(prev => (prev === 0 ? productImages.length - 1 : prev - 1))}
                      title="Previous Image"
                    >
                      &larr;
                    </button>
                    <button 
                      className="gallery-nav-btn next" 
                      onClick={() => setActiveImgIndex(prev => (prev === productImages.length - 1 ? 0 : prev + 1))}
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
                      <img src={img} alt={`Thumb ${idx + 1}`} className="gallery-thumb-img" loading="lazy" />
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
                  {product.sizes.map((size) => (
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
              <div className="modal-actions">
                <button className="btn-primary add-to-cart-btn" onClick={handleAddToCart}>
                  <ShoppingBag size={16} /> Add To Cart
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
                          {product.details.map((detail, i) => (
                            <li key={i}>{detail}</li>
                          ))}
                        </ul>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="spec-accordion">
                  <button className="spec-header" onClick={() => toggleAccordion('materials')}>
                    <span>MATERIALS & CARE</span>
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
                    <span>SHIPPING & TAX DETAILS</span>
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
                        <p><strong>GST Info:</strong> Integrated Goods & Services Tax (IGST) is applied automatically based on delivery zones. Our listed prices include 12% apparel GST.</p>
                        <p><strong>Zones:</strong> Free shipping is provided all across India. Standard cash on delivery (COD) charges of ₹99 apply if chosen at checkout.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
