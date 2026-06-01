import { useState, useEffect, useRef, useCallback } from 'react';
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
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [shareUrlCopied, setShareUrlCopied] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Touch swipe state
  const touchStartX = useRef(null);
  const touchStartY = useRef(null);
  const isSwiping = useRef(false);
  // Holds the current images array length so swipe handlers don't capture a stale value
  const productImagesLenRef = useRef(1);

  const [selectedColor, setSelectedColor] = useState('');
  const [selectedVariant, setSelectedVariant] = useState(null);
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

  const getProductVariantsAndDefault = (product) => {
    if (!product) return [];
    const visibleVars = (product.variants || []).filter(v => v.status !== 'hidden');
    if (visibleVars.length > 0) {
      let defaultColorName = 'Original';
      let defaultHex = '#111111';
      
      if (swatches && swatches.length > 0) {
        defaultColorName = swatches[0].name;
        defaultHex = swatches[0].hex;
      }
      
      const defaultVariant = {
        id: 'default',
        color: defaultColorName,
        hex: defaultHex,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        sku: product.sku || product.id,
        images: Array.isArray(product.images) && product.images.length > 0 
          ? product.images 
          : [product.image, product.hoverImage || product.hover_image].filter(Boolean),
        status: 'available',
        display_order: -1
      };
      
      return [defaultVariant, ...visibleVars];
    }
    return [];
  };

  const visibleVariants = getProductVariantsAndDefault(product);
  const hasVariants = visibleVariants.length > 0;

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
    if (!isOpen || !product) {
      setSelectedVariant(null);
      return;
    }
    const hasVars = visibleVariants.length > 0;
    if (hasVars) {
      const params = new URLSearchParams(window.location.search);
      const urlVariantId = params.get('variant');
      const foundVariant = visibleVariants.find(v => v.id === urlVariantId);
      if (foundVariant) {
        setSelectedVariant(foundVariant);
      } else {
        setSelectedVariant(visibleVariants[0]);
      }

      // Preload images
      const imagesToPreload = [];
      if (product.image) imagesToPreload.push(product.image);
      const defaultImages = product.images && Array.isArray(product.images)
        ? product.images
        : (typeof product.images === 'string' ? (() => { try { return JSON.parse(product.images); } catch { return []; } })() : []);
      defaultImages.forEach(img => imagesToPreload.push(img));
      
      visibleVariants.forEach(v => {
        if (Array.isArray(v.images)) {
          v.images.forEach(img => imagesToPreload.push(img));
        }
      });
      
      const uniqueImages = [...new Set(imagesToPreload)].filter(Boolean);
      uniqueImages.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    } else {
      setSelectedVariant(null);
    }
  }, [isOpen, product, visibleVariants]);

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
          images: Array.isArray(p.images) ? p.images.map(toWebp) : [toWebp(p.image)],
          variants: Array.isArray(p.variants)
            ? p.variants.map(v => ({
                ...v,
                images: Array.isArray(v.images) ? v.images.map(toWebp) : []
              }))
            : []
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

  const handleShareProduct = useCallback((e) => {
    if (e) e.stopPropagation();
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const productPrice = product.discountPrice || product.price;
    const text = `Check out ${product.name} — ₹${Number(productPrice).toLocaleString('en-IN')} on Off-Kilt!`;

    const isMobile = window.innerWidth <= 768 || /Mobi|Android|iPhone/i.test(navigator.userAgent);
    if (isMobile && navigator.share) {
      navigator.share({
        title: product.name,
        text: text,
        url: shareUrl,
      }).catch((err) => {
        console.log('Native share failed or cancelled, falling back to modal', err);
        setShareModalOpen(true);
      });
    } else {
      setShareModalOpen(true);
    }
  }, [product]);

  const handleSharePlatform = (platform) => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    const productPrice = product.discountPrice || product.price;
    const text = `Check out ${product.name} — ₹${Number(productPrice).toLocaleString('en-IN')} on Off-Kilt!\n${shareUrl}`;

    const urls = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`,
      instagram: shareUrl, // Instagram doesn't support direct URL sharing — copy link
    };

    if (platform === 'copy' || platform === 'instagram') {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setShareUrlCopied(true);
        setTimeout(() => setShareUrlCopied(false), 2500);
      }).catch(() => {});
      return;
    }

    if (platform === 'native' && navigator.share) {
      const displayPrice = product.discountPrice || product.price;
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} — ₹${Number(displayPrice).toLocaleString('en-IN')} on Off-Kilt!`,
        url: shareUrl,
      }).catch(() => {});
      return;
    }

    if (urls[platform]) window.open(urls[platform], '_blank', 'noopener,noreferrer');
  };

  // Touch swipe handlers
  const handleTouchStart = useCallback((e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    isSwiping.current = false;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.touches[0].clientX - touchStartX.current;
    const deltaY = e.touches[0].clientY - touchStartY.current;
    // If horizontal movement is dominant, prevent vertical scroll
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      e.preventDefault();
      isSwiping.current = true;
    }
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    touchStartY.current = null;

    if (!isSwiping.current) return;
    isSwiping.current = false;

    const SWIPE_THRESHOLD = 45;
    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    const len = productImagesLenRef.current;
    if (deltaX < 0) {
      // Swipe left → next image
      setActiveImgIndex(prev => (prev === len - 1 ? 0 : prev + 1));
    } else {
      // Swipe right → previous image
      setActiveImgIndex(prev => (prev === 0 ? len - 1 : prev - 1));
    }
  }, []); // productImagesLenRef is a ref — always stable, no dep needed


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

  const handleVariantSelect = (variant) => {
    setSelectedVariant(variant);
    setActiveImgIndex(0);
    
    // Update query params
    const params = new URLSearchParams(window.location.search);
    params.set('variant', variant.id);
    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({ ...window.history.state }, '', newUrl);
  };

  // Safely parse sizes and details (may come as strings from localStorage)
  const safeSizes = Array.isArray(product?.sizes) ? product.sizes
    : (typeof product?.sizes === 'string' ? (() => { try { return JSON.parse(product.sizes); } catch { return []; } })() : []);
  const safeDetails = Array.isArray(product?.details) ? product.details
    : (typeof product?.details === 'string' ? (() => { try { return JSON.parse(product.details); } catch { return []; } })() : []);
  const productImages = selectedVariant && Array.isArray(selectedVariant.images) && selectedVariant.images.length > 0
    ? selectedVariant.images
    : (product?.images && Array.isArray(product.images) && product.images.length > 0
        ? product.images
        : (typeof product?.images === 'string'
            ? (() => { try { return JSON.parse(product.images); } catch { return [product?.image].filter(Boolean); } })()
            : [product?.image].filter(Boolean)));

  // Keep the ref in sync so touch-swipe handlers always see the current length
  productImagesLenRef.current = productImages.length;

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
    onAddToCart(product, selectedSize, selectedVariant?.id);
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
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                ref={(el) => {
                  // passive: false is required to call preventDefault in touchmove
                  if (el) {
                    el.addEventListener('touchmove', handleTouchMove, { passive: false });
                  }
                }}
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

                {/* Position Indicator Dots */}
                {productImages.length > 1 && (
                  <div className="gallery-dots-indicator">
                    {productImages.map((_, i) => (
                      <button
                        key={i}
                        className={`gallery-dot ${i === activeImgIndex ? 'active' : ''}`}
                        onClick={(e) => { e.stopPropagation(); setActiveImgIndex(i); }}
                        aria-label={`Image ${i + 1}`}
                      />
                    ))}
                  </div>
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
                  {(() => {
                    const displayPrice = selectedVariant ? selectedVariant.price : product.price;
                    const displayDiscountPrice = selectedVariant && selectedVariant.id !== 'default' ? null : product.discountPrice;
                    return displayDiscountPrice && Number(displayDiscountPrice) < Number(displayPrice) ? (
                      <>
                        <span className="original-price-editorial" style={{ fontSize: '0.95rem' }}>₹{Number(displayPrice).toLocaleString('en-IN')}</span>
                        <span className="sale-price-editorial" style={{ fontSize: '1.15rem' }}>₹{Number(displayDiscountPrice).toLocaleString('en-IN')}</span>
                        <span className="discount-editorial" style={{ fontSize: '0.95rem' }}>{Math.round((1 - Number(displayDiscountPrice) / Number(displayPrice)) * 100)}% off</span>
                      </>
                    ) : (
                      <span className="sale-price-editorial" style={{ fontSize: '1.15rem' }}>₹{Number(displayPrice).toLocaleString('en-IN')}</span>
                    );
                  })()}
                </div>

                {/* SKU and Stock Info */}
                <div style={{ display: 'flex', gap: '20px', margin: '8px 0', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  <span>SKU: <span style={{ color: 'var(--text-light)' }}>{selectedVariant ? selectedVariant.sku : product.sku || product.id}</span></span>
                  <span>AVAILABILITY: <span style={{ 
                    color: (() => {
                      const isOutOfStock = selectedVariant
                        ? (selectedVariant.status === 'out_of_stock' || selectedVariant.stock <= 0)
                        : (product.stock <= 0);
                      return !isOutOfStock ? '#15803d' : '#ef4444';
                    })(),
                    fontWeight: 'bold' 
                  }}>
                    {(() => {
                      const isOutOfStock = selectedVariant
                        ? (selectedVariant.status === 'out_of_stock' || selectedVariant.stock <= 0)
                        : (product.stock <= 0);
                      const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
                      return !isOutOfStock ? `${currentStock} IN STOCK` : 'OUT OF STOCK';
                    })()}
                  </span></span>
                </div>

                {/* Color Swatches */}
                {hasVariants ? (
                  <div className="color-swatches-area">
                    <span className="color-swatches-title">COLOR: <span style={{ color: 'var(--accent-raw)', fontWeight: 'bold', marginLeft: '6px' }}>{selectedVariant ? selectedVariant.color.toUpperCase() : ''}</span></span>
                    <div className="color-swatches">
                      {visibleVariants.map((v) => {
                        const isOutOfStock = v.status === 'out_of_stock' || v.stock <= 0;
                        return (
                          <button
                            key={v.id}
                            type="button"
                            className={`color-swatch ${selectedVariant?.id === v.id ? 'active' : ''} ${isOutOfStock ? 'out-of-stock' : ''}`}
                            onClick={() => handleVariantSelect(v)}
                            title={isOutOfStock ? `${v.color} (Out of Stock)` : v.color}
                          >
                            <div
                              className="color-swatch-inner"
                              style={{ 
                                backgroundColor: v.hex || '#111111',
                                position: 'relative'
                              }}
                            >
                              {isOutOfStock && (
                                <div style={{
                                  position: 'absolute',
                                  top: '50%',
                                  left: '50%',
                                  width: '120%',
                                  height: '1.5px',
                                  backgroundColor: '#ef4444',
                                  transform: 'translate(-50%, -50%) rotate(45deg)',
                                  pointerEvents: 'none'
                                }} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <span className="color-swatch-label">{selectedVariant?.color || ''}</span>
                  </div>
                ) : swatches.length > 1 ? (
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
                    <button className="size-guide-link" onClick={() => setSizeGuideOpen(true)}>Size Guide</button>
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
                {(() => {
                  const isOutOfStock = selectedVariant
                    ? (selectedVariant.status === 'out_of_stock' || selectedVariant.stock <= 0)
                    : (product.stock <= 0);
                  
                  if (isOutOfStock) {
                    return (
                      <button 
                        className="btn-primary add-to-cart-btn" 
                        disabled={true} 
                        style={{ flex: 1, backgroundColor: '#a1a1aa', cursor: 'not-allowed', opacity: 0.7 }}
                      >
                        <ShoppingBag size={16} /> Out of Stock
                      </button>
                    );
                  }
                  
                  return (
                    <button className={`btn-primary add-to-cart-btn ${shakeButton ? 'shake-anim' : ''}`} onClick={handleAddToCart} style={{ flex: 1 }}>
                      <ShoppingBag size={16} /> Add To Cart
                    </button>
                  );
                })()}
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

          {/* ── SHARE MODAL ── */}
          <AnimatePresence>
            {shareModalOpen && (
              <motion.div
                className="share-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setShareModalOpen(false)}
              >
                <motion.div
                  className="share-modal-card"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="share-modal-handle" />
                  <button className="share-modal-close" onClick={() => setShareModalOpen(false)} aria-label="Close share">
                    <X size={14} />
                  </button>

                  <p className="share-modal-title">Share This Product</p>

                  {/* Product Preview */}
                  <div className="share-modal-product-preview">
                    <img
                      src={currentImage || product?.image}
                      alt={product?.name}
                      className="share-modal-product-img"
                    />
                    <div className="share-modal-product-info">
                      <span className="share-modal-product-name">{product?.name}</span>
                      <span className="share-modal-product-price">
                        ₹{Number(product?.discountPrice || product?.price).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  {/* Social Platforms */}
                  <div className="share-modal-platforms">
                    {/* WhatsApp */}
                    <button className="share-platform-btn" onClick={() => handleSharePlatform('whatsapp')} title="Share on WhatsApp">
                      <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                      <span className="share-platform-label">WhatsApp</span>
                    </button>

                    {/* Facebook */}
                    <button className="share-platform-btn" onClick={() => handleSharePlatform('facebook')} title="Share on Facebook">
                      <svg viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                      <span className="share-platform-label">Facebook</span>
                    </button>

                    {/* X / Twitter */}
                    <button className="share-platform-btn" onClick={() => handleSharePlatform('twitter')} title="Share on X (Twitter)">
                      <svg viewBox="0 0 24 24" fill="#000000"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.254 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span className="share-platform-label">X / Twitter</span>
                    </button>

                    {/* Instagram (Copy link) */}
                    <button className="share-platform-btn" onClick={() => handleSharePlatform('instagram')} title="Copy link for Instagram">
                      <svg viewBox="0 0 24 24" fill="url(#ig-gradient)">
                        <defs>
                          <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#f09433"/>
                            <stop offset="25%" stopColor="#e6683c"/>
                            <stop offset="50%" stopColor="#dc2743"/>
                            <stop offset="75%" stopColor="#cc2366"/>
                            <stop offset="100%" stopColor="#bc1888"/>
                          </linearGradient>
                        </defs>
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="share-platform-label">Instagram</span>
                    </button>

                    {/* Native Share (mobile) */}
                    {typeof navigator !== 'undefined' && navigator.share && (
                      <button className="share-platform-btn" onClick={() => handleSharePlatform('native')} title="More options">
                        <svg viewBox="0 0 24 24" fill="none" stroke="#555" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                        <span className="share-platform-label">More</span>
                      </button>
                    )}
                  </div>

                  {/* Copy Link Row */}
                  <div className="share-copy-link-row">
                    <span className="share-copy-url">
                      {`${window.location.origin}${window.location.pathname}?product=${product?.id}`}
                    </span>
                    <button
                      className={`share-copy-btn ${shareUrlCopied ? 'copied' : ''}`}
                      onClick={() => handleSharePlatform('copy')}
                    >
                      {shareUrlCopied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ── SIZE GUIDE MODAL ── */}
          <AnimatePresence>
            {sizeGuideOpen && (
              <motion.div
                className="share-modal-backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                onClick={() => setSizeGuideOpen(false)}
                style={{ zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <motion.div
                  className="share-modal-card"
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: 40, opacity: 0 }}
                  transition={{ type: 'spring', damping: 28, stiffness: 260 }}
                  onClick={(e) => e.stopPropagation()}
                  style={{ maxWidth: '600px', width: '100%' }}
                >
                  <div className="share-modal-handle" />
                  <button className="share-modal-close" onClick={() => setSizeGuideOpen(false)} aria-label="Close size guide">
                    <X size={14} />
                  </button>
                  <p className="share-modal-title" style={{ textTransform: 'uppercase', letterSpacing: '1px' }}>Size Guide</p>
                  <div style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', borderRadius: '4px', padding: '10px', marginTop: '15px' }}>
                    <img 
                      src={product?.size_guide || '/images/size_guide.png'} 
                      alt="Size Guide" 
                      style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain' }} 
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=600';
                      }}
                    />
                  </div>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-grey)', marginTop: '15px', textAlign: 'center', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    All measurements are in inches. Fits may vary by style and construction.
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </AnimatePresence>
  );
}
