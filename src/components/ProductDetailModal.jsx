import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, ShoppingBag, Heart, ZoomIn, ShoppingCart, Star } from 'lucide-react';
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

  // Reviews State & CRUD Logic
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [writeOpen, setWriteOpen] = useState(false);

  // Load reviews from localStorage
  useEffect(() => {
    if (!product?.id) return;
    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    let prodReviews = allReviews[product.id] || [];
    
    // Seed default realistic reviews if none exist
    if (prodReviews.length === 0) {
      const defaultReviews = [
        {
          id: 'def1',
          author: 'Meera Deshmukh',
          rating: 5,
          comment: "Absolutely loved this! The denim is premium and heavy. Fits exactly as described. Love off-kilt's styling.",
          image: '',
          likes: 5,
          dislikes: 0,
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
          verified: true
        },
        {
          id: 'def2',
          author: 'Simran K.',
          rating: 4,
          comment: "Great fit and high quality stitching. The color is slightly different under sunlight but looks even better!",
          image: '',
          likes: 2,
          dislikes: 1,
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
          verified: true
        }
      ];
      allReviews[product.id] = defaultReviews;
      localStorage.setItem('offkilt_product_reviews', JSON.stringify(allReviews));
      prodReviews = defaultReviews;
    }
    setReviews(prodReviews);
  }, [product?.id]);

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) {
      alert('Please fill in your name and comment.');
      return;
    }

    const newReview = {
      id: `rev-${Date.now()}`,
      author: newName,
      rating: newRating,
      comment: newComment,
      image: newImage,
      likes: 0,
      dislikes: 0,
      date: new Date().toLocaleDateString('en-IN'),
      verified: true
    };

    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    const updatedReviews = [newReview, ...(allReviews[product.id] || [])];
    allReviews[product.id] = updatedReviews;
    localStorage.setItem('offkilt_product_reviews', JSON.stringify(allReviews));

    setReviews(updatedReviews);
    setNewName('');
    setNewComment('');
    setNewRating(5);
    setNewImage('');
    setWriteOpen(false);

    window.dispatchEvent(new Event('offkilt_reviews_updated'));
  };

  const handleLike = (reviewId, isLike) => {
    const allReviews = JSON.parse(localStorage.getItem('offkilt_product_reviews') || '{}');
    const prodReviews = allReviews[product.id] || [];
    const idx = prodReviews.findIndex(r => r.id === reviewId);
    
    if (idx > -1) {
      const reviewKey = `offkilt_voted_${reviewId}`;
      const previousVote = localStorage.getItem(reviewKey);
      
      if (isLike) {
        if (previousVote === 'like') {
          prodReviews[idx].likes = Math.max(0, prodReviews[idx].likes - 1);
          localStorage.removeItem(reviewKey);
        } else {
          if (previousVote === 'dislike') {
            prodReviews[idx].dislikes = Math.max(0, prodReviews[idx].dislikes - 1);
          }
          prodReviews[idx].likes += 1;
          localStorage.setItem(reviewKey, 'like');
        }
      } else {
        if (previousVote === 'dislike') {
          prodReviews[idx].dislikes = Math.max(0, prodReviews[idx].dislikes - 1);
          localStorage.removeItem(reviewKey);
        } else {
          if (previousVote === 'like') {
            prodReviews[idx].likes = Math.max(0, prodReviews[idx].likes - 1);
          }
          prodReviews[idx].dislikes += 1;
          localStorage.setItem(reviewKey, 'dislike');
        }
      }

      allReviews[product.id] = prodReviews;
      localStorage.setItem('offkilt_product_reviews', JSON.stringify(allReviews));
      setReviews(prodReviews);
    }
  };

  const handleImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 300;
        const MAX_HEIGHT = 300;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        setNewImage(dataUrl);
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

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
              
              {/* Scrollable middle content */}
              <div className="modal-details-scrollable">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div>
                    <span className="mono modal-tagline">{product.tagline}</span>
                    <h2 className="modal-title">{product.name}</h2>
                    <div className="mono" style={{ color: 'var(--text-grey)', fontSize: '0.75rem', marginTop: '6px' }}>
                      CATALOG ID: {product.id} // TAX INCLUDED (GST @ 12% INCL.)
                    </div>
                  </div>
                  {/* Rating Stars under Name */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-grey)', fontFamily: 'var(--font-mono)', marginTop: '4px', flexShrink: 0 }}>
                    <Star size={12} fill="var(--accent-gold)" stroke="var(--accent-gold)" />
                    <span>
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                    </span>
                    <span>({reviews.length})</span>
                  </div>
                </div>

                <div className="modal-price">
                  ₹{product.price.toLocaleString('en-IN')}
                </div>

                <p className="modal-desc">
                  {product.description}
                </p>

                {/* Color Swatches */}
                {(() => {
                  // Derive colors from product name/description
                  const colorMap = {
                    'indigo': '#1a237e',
                    'charcoal': '#37474f',
                    'sand': '#c2b280',
                    'desert': '#c2b280',
                    'acid': '#8d9db6',
                    'raw': '#0d1b2a',
                    'vintage': '#6d5c4e',
                    'black': '#1a1a1a',
                    'dark': '#1a1a1a',
                    'grey': '#616161',
                    'sage': '#7c9473',
                    'tinted': '#8b7355',
                  };
                  const text = `${product.name} ${product.description}`.toLowerCase();
                  const detectedColors = Object.entries(colorMap)
                    .filter(([keyword]) => text.includes(keyword))
                    .map(([name, hex]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), hex }));
                  // Always include at least the default indigo
                  if (detectedColors.length === 0) detectedColors.push({ name: 'Indigo', hex: '#1a237e' });
                  // Add a couple of complementary options
                  if (detectedColors.length < 3) {
                    if (!detectedColors.find(c => c.name === 'Black')) detectedColors.push({ name: 'Black', hex: '#1a1a1a' });
                    if (!detectedColors.find(c => c.name === 'Indigo') && detectedColors.length < 3) detectedColors.push({ name: 'Indigo', hex: '#1a237e' });
                  }

                  return (
                    <div className="color-swatches-area">
                      <span className="color-swatches-title">COLOR</span>
                      <div className="color-swatches">
                        {detectedColors.slice(0, 4).map((color, i) => (
                          <button
                            key={color.name}
                            className={`color-swatch ${i === 0 ? 'active' : ''}`}
                            title={color.name}
                          >
                            <div
                              className="color-swatch-inner"
                              style={{ backgroundColor: color.hex }}
                            />
                          </button>
                        ))}
                      </div>
                      <span className="color-swatch-label">{detectedColors[0]?.name}</span>
                    </div>
                  );
                })()}

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

                {/* Customer Reviews Section */}
                <div style={{ marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '1px' }}>
                      CUSTOMER REVIEWS ({reviews.length})
                    </h3>
                    <button 
                      onClick={() => setWriteOpen(!writeOpen)} 
                      style={{
                        fontSize: '0.75rem',
                        textDecoration: 'underline',
                        fontFamily: 'var(--font-mono)',
                        color: 'var(--accent-raw)',
                        fontWeight: 600
                      }}
                    >
                      {writeOpen ? 'Cancel' : 'Write a Review'}
                    </button>
                  </div>

                  {/* Average Star Rating Summary */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: 'var(--bg-cream)', padding: '12px 16px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--text-light)' }}>
                      {reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1) : '5.0'}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5;
                          return (
                            <Star
                              key={i}
                              size={12}
                              fill={i < Math.round(avg) ? 'var(--accent-gold)' : 'none'}
                              stroke={i < Math.round(avg) ? 'var(--accent-gold)' : '#cccccc'}
                            />
                          );
                        })}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-grey)', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
                        Based on {reviews.length} reviews
                      </span>
                    </div>
                  </div>

                  {/* Review Form */}
                  {writeOpen && (
                    <form onSubmit={handleReviewSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px', padding: '16px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '4px', background: 'var(--bg-cream)' }}>
                      <div style={{ display: 'flex', gap: '12px', flexDirection: 'row', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}>YOUR RATING:</span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          {[1,2,3,4,5].map(star => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewRating(star)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Star
                                size={18}
                                fill={star <= newRating ? 'var(--accent-gold)' : 'none'}
                                stroke={star <= newRating ? 'var(--accent-gold)' : '#cccccc'}
                              />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <input
                          type="text"
                          placeholder="Your Name"
                          value={newName}
                          onChange={(e) => setNewName(e.target.value)}
                          required
                          style={{
                            padding: '10px',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '2px',
                            backgroundColor: '#ffffff',
                            color: '#111111',
                            outline: 'none',
                            fontFamily: 'inherit'
                          }}
                        />
                        <textarea
                          placeholder="Share your thoughts about this product..."
                          rows="3"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          required
                          style={{
                            padding: '10px',
                            fontSize: '0.8rem',
                            border: '1px solid rgba(0,0,0,0.1)',
                            borderRadius: '2px',
                            backgroundColor: '#ffffff',
                            color: '#111111',
                            outline: 'none',
                            fontFamily: 'inherit',
                            resize: 'vertical'
                          }}
                        />
                      </div>

                      <div>
                        <label style={{ display: 'flex', flexDirection: 'column', gap: '6px', cursor: 'pointer' }}>
                          <span style={{ fontSize: '0.7rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)' }}>
                            UPLOAD DELIVERED PRODUCT PHOTO
                          </span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleImageFile}
                            style={{ fontSize: '0.75rem' }}
                          />
                        </label>
                        {newImage && (
                          <div style={{ marginTop: '10px', position: 'relative', width: '80px', height: '80px' }}>
                            <img src={newImage} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                            <button
                              type="button"
                              onClick={() => setNewImage('')}
                              style={{ position: 'absolute', top: -6, right: -6, background: '#111111', color: '#ffffff', borderRadius: '50%', width: '16px', height: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      <button type="submit" className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.7rem', width: 'fit-content', justifyContent: 'center' }}>
                        SUBMIT REVIEW
                      </button>
                    </form>
                  )}

                  {/* Reviews List */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {reviews.map((review) => (
                      <div key={review.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{review.author}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>{review.date}</span>
                        </div>

                        <div style={{ display: 'flex', gap: '2px', marginBottom: '8px' }}>
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              size={10}
                              fill={i < review.rating ? 'var(--accent-gold)' : 'none'}
                              stroke={i < review.rating ? 'var(--accent-gold)' : '#cccccc'}
                            />
                          ))}
                        </div>

                        <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', lineHeight: '1.5', marginBottom: '10px' }}>
                          {review.comment}
                        </p>

                        {/* Uploaded review image */}
                        {review.image && (
                          <div style={{ marginBottom: '12px' }}>
                            <img 
                              src={review.image} 
                              alt="Delivered product" 
                              style={{ maxHeight: '100px', borderRadius: '4px', cursor: 'zoom-in', border: '1px solid rgba(0,0,0,0.08)' }} 
                              onClick={() => {
                                setLightboxOpen(true);
                              }}
                            />
                          </div>
                        )}

                        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          <span>Was this review helpful?</span>
                          <button 
                            onClick={() => handleLike(review.id, true)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            👍 {review.likes}
                          </button>
                          <button 
                            onClick={() => handleLike(review.id, false)} 
                            style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                          >
                            👎 {review.dislikes}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sticky bottom actions */}
              <div className="modal-actions-fixed">
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
                      ? '1px solid #ff4d6d'
                      : '1px solid rgba(255, 77, 109, 0.35)',
                    background: isWishlistedProduct
                      ? '#fff0f3'
                      : '#ffffff',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    color: isWishlistedProduct
                      ? '#ff4d6d'
                      : '#ff8fa3',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Heart
                    size={18}
                    fill={isWishlistedProduct ? '#ff4d6d' : 'none'}
                    stroke={isWishlistedProduct ? '#ff4d6d' : '#ff8fa3'}
                  />
                </button>
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
