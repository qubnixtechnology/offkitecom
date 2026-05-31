import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp, ShoppingBag, Heart, ZoomIn, ShoppingCart, Star, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { products as localProducts } from '../data/products';
import { products as productsApi } from '../services/api';

export default function ProductDetailModal({ product, isOpen, onClose, onAddToCart, wishlist = [], onWishlistToggle, onProductClick }) {
  const [selectedSize, setSelectedSize] = useState(() => {
    const sizes = Array.isArray(product?.sizes) ? product.sizes
      : (typeof product?.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes); } catch(e) { return []; } })() : []);
    return sizes.length === 1 ? sizes[0] : '';
  });
  const [activeAccordion, setActiveAccordion] = useState('specs');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeImgIndex, setActiveImgIndex] = useState(0);
  const [loadedImages, setLoadedImages] = useState({});
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [shakeButton, setShakeButton] = useState(false);

  const [selectedColor, setSelectedColor] = useState('');
  const [promoText, setPromoText] = useState('Extra 20% off $100+');
  const [showPromo, setShowPromo] = useState(false);

  const parseSwatches = () => {
    let swatchesList = [];
    if (!product) return swatchesList;
    if (product.swatches) {
      if (Array.isArray(product.swatches)) {
        swatchesList = product.swatches;
      } else if (typeof product.swatches === 'string') {
        swatchesList = product.swatches.split(',').map(s => {
          const parts = s.split(':');
          return { name: parts[0]?.trim(), hex: parts[1]?.trim() || '#111111' };
        });
      }
    } else if (Array.isArray(product.details)) {
      const swatchLine = product.details.find(d => d.includes('Fabric Swatches:'));
      if (swatchLine) {
        const swatchStr = swatchLine.replace('Fabric Swatches:', '').trim();
        swatchesList = swatchStr.split(',').map(s => {
          const parts = s.split(':');
          return { name: parts[0]?.trim(), hex: parts[1]?.trim() || '#111111' };
        });
      }
    }
    
    // Fallback: detect from name/description but only if actually present
    if (swatchesList.length === 0 && product.name) {
      const colorMap = {
        'indigo': '#1a237e',
        'charcoal': '#37474f',
        'sand': '#c2b280',
        'desert': '#c2b280',
        'acid': '#8d9db6',
        'raw': '#0d1b2a',
        'vintage': '#6d5c4e',
        'black': '#1a1a1a',
        'grey': '#616161',
        'sage': '#7c9473',
        'tinted': '#8b7355',
      };
      const text = `${product.name} ${product.description}`.toLowerCase();
      const detected = Object.entries(colorMap)
        .filter(([keyword]) => text.includes(keyword))
        .map(([name, hex]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), hex }));
      
      if (detected.length > 0) {
        swatchesList = detected;
      }
    }
    return swatchesList;
  };

  const swatches = parseSwatches();

  // Reviews State & CRUD Logic
  const [reviews, setReviews] = useState([]);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [writeOpen, setWriteOpen] = useState(false);

  // Q&A State & CRUD Logic
  const [qnas, setQnas] = useState([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [similarProducts, setSimilarProducts] = useState([]);
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    if (!product?.id) return;
    const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
    setQnas(allQna[product.id] || []);
  }, [product?.id]);

  useEffect(() => {
    if (swatches && swatches.length > 0) {
      setSelectedColor(swatches[0].name);
    } else {
      setSelectedColor('');
    }
  }, [product, swatches]);

  useEffect(() => {
    const text = localStorage.getItem('offkilt_promo_discount_text') || 'Extra 20% off $100+';
    const show = localStorage.getItem('offkilt_promo_discount_show') !== 'false';
    setPromoText(text);
    setShowPromo(show);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen || !product?.id) return;
    
    // Save original tags
    const originalTitle = document.title;
    
    let originalDesc = '';
    const descMeta = document.querySelector('meta[name="description"]');
    if (descMeta) originalDesc = descMeta.getAttribute('content') || '';
    
    let originalKeywords = '';
    const keywordsMeta = document.querySelector('meta[name="keywords"]');
    if (keywordsMeta) originalKeywords = keywordsMeta.getAttribute('content') || '';
    
    // Fetch custom product SEO tags
    try {
      const productSeoList = JSON.parse(localStorage.getItem('offkilt_seo_products') || '{}');
      const customSeo = productSeoList[product.id];
      
      if (customSeo) {
        if (customSeo.title) document.title = customSeo.title;
        
        if (customSeo.desc) {
          let dMeta = document.querySelector('meta[name="description"]');
          if (!dMeta) {
            dMeta = document.createElement('meta');
            dMeta.setAttribute('name', 'description');
            document.head.appendChild(dMeta);
          }
          dMeta.setAttribute('content', customSeo.desc);
        }
        
        if (customSeo.keywords) {
          let kMeta = document.querySelector('meta[name="keywords"]');
          if (!kMeta) {
            kMeta = document.createElement('meta');
            kMeta.setAttribute('name', 'keywords');
            document.head.appendChild(kMeta);
          }
          kMeta.setAttribute('content', customSeo.keywords);
        }
      } else {
        // Fallback to standard product-level tags
        document.title = `${product.name} | off-kilt Premium Denim`;
        
        let dMeta = document.querySelector('meta[name="description"]');
        if (dMeta) dMeta.setAttribute('content', product.description || '');
      }
    } catch (e) {
      console.error('Error injecting product SEO tags', e);
    }
    
    return () => {
      // Restore original tags
      document.title = originalTitle;
      const dMeta = document.querySelector('meta[name="description"]');
      if (dMeta) {
        if (originalDesc) dMeta.setAttribute('content', originalDesc);
        else dMeta.remove();
      }
      const kMeta = document.querySelector('meta[name="keywords"]');
      if (kMeta) {
        if (originalKeywords) kMeta.setAttribute('content', originalKeywords);
        else kMeta.remove();
      }
    };
  }, [isOpen, product?.id]);

  useEffect(() => {
    const handleQnaUpdate = () => {
      if (!product?.id) return;
      const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
      setQnas(allQna[product.id] || []);
    };
    window.addEventListener('offkilt_qna_updated', handleQnaUpdate);
    return () => window.removeEventListener('offkilt_qna_updated', handleQnaUpdate);
  }, [product?.id]);

  useEffect(() => {
    if (!product?.id) return;
    const fetchSimilar = async () => {
      try {
        const res = await productsApi.getAll(product.category);
        if (res?.data) {
          const filtered = res.data.filter(p => p.id !== product.id).slice(0, 4);
          setSimilarProducts(filtered);
        }
      } catch (err) {
        const stored = localStorage.getItem('offkilt_products');
        let prodList = [];
        if (stored) {
          try { prodList = JSON.parse(stored); } catch (e) {}
        }
        if (prodList.length === 0) {
          prodList = localProducts;
        }
        const toWebp = (url) => {
          if (typeof url === 'string') {
            let newUrl = url.replace(/\.(jpe?g|png)$/i, '.webp');
            if (import.meta.env.DEV && newUrl.startsWith('/images/')) {
              newUrl = newUrl.replace(/^\/images\//, '/build/images/');
            }
            return newUrl;
          }
          return url;
        };
        const mapped = prodList.map(p => ({
          ...p,
          image: toWebp(p.image),
          hoverImage: toWebp(p.hoverImage || p.hover_image),
          images: Array.isArray(p.images) ? p.images.map(toWebp) : [toWebp(p.image)]
        }));
        const filtered = mapped.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4);
        setSimilarProducts(filtered);
      }
    };
    fetchSimilar();
  }, [product?.id, product?.category]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleQuestionSubmit = (e) => {
    e.preventDefault();
    if (!newQuestion.trim()) return;
    const newQ = {
      id: `qna-${Date.now()}`,
      question: newQuestion.trim(),
      answer: '',
      date: new Date().toLocaleDateString('en-IN'),
      createdAt: new Date().toISOString()
    };
    const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
    const updated = [newQ, ...(allQna[product.id] || [])];
    allQna[product.id] = updated;
    localStorage.setItem('offkilt_product_qna', JSON.stringify(allQna));
    setQnas(updated);
    setNewQuestion('');
    window.dispatchEvent(new Event('offkilt_qna_updated'));
  };

  const handleShareProduct = (e) => {
    e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    
    // Copy to clipboard
    navigator.clipboard.writeText(shareUrl).then(() => {
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    }).catch(err => {
      console.error('Failed to copy: ', err);
    });

    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on off-kilt!`,
        url: shareUrl,
      }).catch(() => {});
    }
  };

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
      setShakeButton(true);
      setTimeout(() => setShakeButton(false), 500);
      
      const sizeArea = document.querySelector('.size-selection-area');
      if (sizeArea) {
        sizeArea.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
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
            data-lenis-prevent
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
                    <h2 className="modal-title">{product.name}</h2>
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

                <div className="modal-price-row-editorial" style={{ display: 'flex', gap: '10px', alignItems: 'center', margin: '4px 0', fontFamily: 'var(--font-mono)' }}>
                  <span className="original-price-editorial" style={{ fontSize: '0.95rem' }}>₹{(product.price * 2).toLocaleString('en-IN')}</span>
                  <span className="sale-price-editorial" style={{ fontSize: '1.15rem' }}>₹{product.price.toLocaleString('en-IN')}</span>
                  <span className="discount-editorial" style={{ fontSize: '0.95rem' }}>50% off</span>
                </div>
                

                {/* Color Swatches */}
                {swatches.length > 1 ? (
                  <div className="color-swatches-area">
                    <span className="color-swatches-title">COLOR</span>
                    <div className="color-swatches">
                      {swatches.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          className={`color-swatch ${selectedColor === color.name ? 'active' : ''}`}
                          onClick={() => setSelectedColor(color.name)}
                          title={color.name}
                        >
                          <div
                            className="color-swatch-inner"
                            style={{ backgroundColor: color.hex }}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="color-swatch-label">{selectedColor}</span>
                  </div>
                ) : swatches.length === 1 ? (
                  <div style={{ marginTop: '15px', marginBottom: '15px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>COLOR: </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '1px' }}>{swatches[0].name}</span>
                  </div>
                ) : null}

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

                <p className="modal-desc">
                  {product.description}
                </p>



                {/* Mobile View: Clean bullet points list. Desktop: Accordions */}
                <div className="specs-mobile-list" style={{ marginTop: '20px' }}>
                  <ul className="spec-list-bullet" style={{ listStyle: 'none', padding: 0 }}>
                    {safeDetails.map((detail, i) => (
                      <li key={i} style={{ fontSize: '0.78rem', color: 'var(--text-grey)', marginBottom: '8px', display: 'flex', gap: '8px', alignItems: 'flex-start', fontFamily: 'var(--font-body)', textTransform: 'uppercase', letterSpacing: '0.5px', lineHeight: '1.4' }}>
                        <span style={{ color: 'var(--accent-raw)', flexShrink: 0 }}>•</span> {detail}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="specs-accordions specs-desktop-only">
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

                {/* Similar Products Section */}
                {similarProducts.length > 0 && (
                  <div className="similar-products-section" style={{ marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
                        YOU MAY ALSO LIKE
                      </h3>
                      <button 
                        onClick={handleShareProduct}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '0.75rem',
                          fontFamily: 'var(--font-mono)',
                          color: 'var(--text-light)',
                          border: '1px solid rgba(0,0,0,0.1)',
                          padding: '6px 12px',
                          borderRadius: '2px',
                          cursor: 'pointer',
                          background: 'none'
                        }}
                      >
                        <Share2 size={12} />
                        {shareCopied ? 'COPIED!' : 'SHARE PRODUCT'}
                      </button>
                    </div>
                    
                    <div className="similar-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                      {similarProducts.map((p) => {
                        const pImages = p.images && Array.isArray(p.images) && p.images.length > 0
                          ? p.images
                          : (typeof p.images === 'string'
                              ? (() => { try { return JSON.parse(p.images); } catch { return [p.image].filter(Boolean); } })()
                              : [p.image].filter(Boolean));
                        const displayImg = pImages[0] || p.image;
                        return (
                          <div 
                            key={p.id} 
                            onClick={() => {
                              if (onProductClick) {
                                onProductClick(p);
                                setActiveImgIndex(0);
                              }
                            }}
                            style={{ cursor: 'pointer' }}
                            className="similar-product-card"
                          >
                            <div style={{ aspectRatio: '3/4', overflow: 'hidden', backgroundColor: 'var(--bg-cream)', marginBottom: '8px', position: 'relative' }}>
                              <img 
                                src={displayImg} 
                                alt={p.name} 
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                                loading="lazy"
                              />
                            </div>
                            <h4 className="similar-product-title">
                              {p.name}
                            </h4>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
                              ₹{p.price.toLocaleString('en-IN')}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

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

                {/* Q&A Section */}
                <div className="product-qna-section" style={{ marginTop: '30px', borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '16px' }}>
                    QUESTIONS & ANSWERS
                  </h3>
                  
                  <form onSubmit={handleQuestionSubmit} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
                    <input 
                      type="text"
                      placeholder="Ask a question about this product..."
                      value={newQuestion}
                      onChange={(e) => setNewQuestion(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        padding: '10px 14px',
                        fontSize: '0.8rem',
                        border: '1px solid rgba(0,0,0,0.1)',
                        borderRadius: '2px',
                        backgroundColor: '#ffffff',
                        color: '#111111',
                        outline: 'none',
                        fontFamily: 'inherit'
                      }}
                    />
                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ 
                        padding: '0 16px', 
                        fontSize: '0.75rem', 
                        fontFamily: 'var(--font-mono)', 
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      ASK
                    </button>
                  </form>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {qnas.length === 0 ? (
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', fontStyle: 'italic', textAlign: 'center', padding: '10px 0' }}>
                        No questions asked yet. Be the first to ask!
                      </p>
                    ) : (
                      qnas.map((q) => (
                        <div key={q.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '14px' }}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', marginBottom: '6px' }}>
                            <span style={{ 
                              fontFamily: 'var(--font-mono)', 
                              fontSize: '0.75rem', 
                              fontWeight: 'bold', 
                              color: 'var(--accent-raw)',
                              backgroundColor: 'rgba(0,0,0,0.04)',
                              padding: '2px 6px',
                              borderRadius: '2px'
                            }}>Q</span>
                            <p style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-light)', marginTop: '2px', lineHeight: '1.4' }}>
                              {q.question}
                            </p>
                          </div>
                          
                          {q.answer ? (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '12px', marginTop: '8px' }}>
                              <span style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.65rem', 
                                fontWeight: 'bold', 
                                color: '#15803d',
                                backgroundColor: '#f0fdf4',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                whiteSpace: 'nowrap'
                              }}>ADMIN REPLY</span>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', marginTop: '2px', lineHeight: '1.4' }}>
                                {q.answer}
                              </p>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px', paddingLeft: '12px', marginTop: '8px' }}>
                              <span style={{ 
                                fontFamily: 'var(--font-mono)', 
                                fontSize: '0.65rem', 
                                fontWeight: 'bold', 
                                color: 'var(--text-muted)',
                                backgroundColor: 'rgba(0,0,0,0.02)',
                                padding: '2px 6px',
                                borderRadius: '2px',
                                whiteSpace: 'nowrap'
                              }}>PENDING REPLY</span>
                              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '2px' }}>
                                Admin will answer this shortly.
                              </p>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Sticky bottom actions */}
              <div className="modal-actions-fixed">
                <button className={`btn-primary add-to-cart-btn ${shakeButton ? 'shake-anim' : ''}`} onClick={handleAddToCart} style={{ flex: 1 }}>
                  <ShoppingBag size={16} /> Add To Cart
                </button>
                {/* Share Product Button */}
                <button
                  onClick={handleShareProduct}
                  title="Share Product"
                  style={{
                    width: '52px',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid rgba(0,0,0,0.1)',
                    background: '#ffffff',
                    borderRadius: '2px',
                    cursor: 'pointer',
                    color: 'var(--text-light)',
                    transition: 'all 0.3s ease',
                  }}
                >
                  <Share2 size={18} />
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
