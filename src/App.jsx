import { useState, useEffect, useRef } from 'react';
import { ShoppingBag, Menu, X, Phone, User, Search, Check, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Lenis from 'lenis';
import { auth, profile, orders as ordersApi, products as productsApi } from './services/api';
import Preloader from './components/Preloader';
import Hero from './components/Hero';
import NewArrivals from './components/NewArrivals';
import TrendingCollection from './components/TrendingCollection';
import BestSellers from './components/BestSellers';
import FashionVideo from './components/FashionVideo';
import ShopByStyle from './components/ShopByStyle';
import BrandStory from './components/BrandStory';
import CustomerReviews from './components/CustomerReviews';
import InstagramGallery from './components/InstagramGallery';
import NewsletterSection from './components/NewsletterSection';
import Catalog from './components/Catalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import RazorpayModal from './components/RazorpayModal';
import Footer from './components/Footer';
import OrderTrackingModal from './components/OrderTrackingModal';
import UserProfileModal from './components/UserProfileModal';
import AdminDashboard from './components/AdminDashboard';
import MegaMenu from './components/MegaMenu';
import CampaignSection from './components/CampaignSection';
import SellerPartners from './components/SellerPartners';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isHeaderScrolled, setIsHeaderScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Cart State
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Product Detail Modal State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  // Razorpay simulated checkout state
  const [isRazorpayOpen, setIsRazorpayOpen] = useState(false);
  
  // Past orders for tracking persistence
  const [pastOrders, setPastOrders] = useState(() => JSON.parse(localStorage.getItem('offkilt_orders') || '[]'));
  const [isTrackingOpen, setIsTrackingOpen] = useState(false);
  const [activeTrackingOrder, setActiveTrackingOrder] = useState(null);

  // Fetch user session state from API
  const [currentUser, setCurrentUser] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Catalog category filtering state
  const [activeCategory, setActiveCategory] = useState('all');

  // Mega menu hover state
  const [activeMegaMenu, setActiveMegaMenu] = useState(null);
  const megaMenuTimeoutRef = useRef(null);
  const [megaMenuKeys, setMegaMenuKeys] = useState(() => {
    try {
      const stored = localStorage.getItem('offkilt_mega_menu');
      if (stored) {
        return Object.keys(JSON.parse(stored));
      }
    } catch (e) {}
    return ['men', 'women'];
  });

  // Toast Notification State
  const [toast, setToast] = useState(null);
  
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Announcement Bar States
  const [announcementText, setAnnouncementText] = useState(() => 
    localStorage.getItem('offkilt_announcement_text') || '✦ GET FREE SHIPPING ON ORDERS ABOVE ₹5,000 | EXTRA 10% OFF USE CODE: OFFKILT10 ✦'
  );
  const [showAnnouncement, setShowAnnouncement] = useState(() => 
    localStorage.getItem('offkilt_announcement_show') !== 'false'
  );
  const [announcementBg, setAnnouncementBg] = useState(() => 
    localStorage.getItem('offkilt_announcement_bg') || '#111111'
  );
  const [announcementColor, setAnnouncementColor] = useState(() => 
    localStorage.getItem('offkilt_announcement_color') || '#ffffff'
  );

  // Custom Font & Navigation Menu states
  const [fontHeading, setFontHeading] = useState(() => localStorage.getItem('offkilt_font_heading') || 'Outfit');
  const [fontBody, setFontBody] = useState(() => localStorage.getItem('offkilt_font_body') || 'Inter');
  const [menuItems, setMenuItems] = useState(() => {
    const defaults = [
      { label: 'New', link: '#new-arrivals', visible: true },
      { label: 'Men', link: '#campaign-men', category: 'jeans', visible: true },
      { label: 'Women', link: '#campaign-women', category: 'skirts', visible: true },
      { label: 'Collection', link: '#catalog', visible: true },
      { label: 'After Dark', link: '#catalog', category: 'all', visible: true },
      { label: 'Sale', link: '#catalog', category: 'all', visible: true }
    ];
    try {
      return JSON.parse(localStorage.getItem('offkilt_menus')) || defaults;
    } catch (e) {
      return defaults;
    }
  });
  const [whatsappNumber, setWhatsappNumber] = useState(() => {
    const stored = localStorage.getItem('offkilt_whatsapp');
    if (stored) return stored.replace(/[^0-9]/g, '');
    try {
      const footer = JSON.parse(localStorage.getItem('offkilt_footer_settings'));
      if (footer?.phone) return footer.phone.replace(/[^0-9]/g, '');
    } catch(e) {}
    return '918291155692';
  });

  // Campaign Banners States
  const [campaignMen, setCampaignMen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_campaign_men')) || {
        title: "Denim Redefined",
        subtitle: "Crafted for the modern rebel. Raw denim, bold silhouettes, uncompromising attitude.",
        ctaText: "Explore Men's",
        image: "/images/mens_campaign.png"
      };
    } catch {
      return {
        title: "Denim Redefined",
        subtitle: "Crafted for the modern rebel. Raw denim, bold silhouettes, uncompromising attitude.",
        ctaText: "Explore Men's",
        image: "/images/mens_campaign.png"
      };
    }
  });

  const [campaignWomen, setCampaignWomen] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_campaign_women')) || {
        title: "Elegance Meets Edge",
        subtitle: "Structured denim and statement skirts for the confident woman who defies convention.",
        ctaText: "Explore Women's",
        image: "/images/womens_campaign.png"
      };
    } catch {
      return {
        title: "Elegance Meets Edge",
        subtitle: "Structured denim and statement skirts for the confident woman who defies convention.",
        ctaText: "Explore Women's",
        image: "/images/womens_campaign.png"
      };
    }
  });

  // Check if current user is blocked
  const checkBlockedUser = () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('offkilt_current_user'));
      if (storedUser) {
        const users = JSON.parse(localStorage.getItem('offkilt_users') || '[]');
        const latestUser = users.find(u => u.email === storedUser.email);
        if (latestUser?.is_blocked || storedUser.is_blocked) {
          localStorage.removeItem('offkilt_current_user');
          localStorage.removeItem('offkilt_auth_token');
          setCurrentUser(null);
          showToast('Your session has ended because this account is blocked.', 'error');
        }
      }
    } catch (e) {}
  };

  // Settings sync listener
  useEffect(() => {
    const handleSettingsUpdate = () => {
      checkBlockedUser();
      setAnnouncementText(localStorage.getItem('offkilt_announcement_text') || '✦ GET FREE SHIPPING ON ORDERS ABOVE ₹5,000 | EXTRA 10% OFF USE CODE: OFFKILT10 ✦');
      setShowAnnouncement(localStorage.getItem('offkilt_announcement_show') !== 'false');
      setAnnouncementBg(localStorage.getItem('offkilt_announcement_bg') || '#111111');
      setAnnouncementColor(localStorage.getItem('offkilt_announcement_color') || '#ffffff');
      setFontHeading(localStorage.getItem('offkilt_font_heading') || 'Outfit');
      setFontBody(localStorage.getItem('offkilt_font_body') || 'Inter');
      try {
        const storedMenus = localStorage.getItem('offkilt_menus');
        if (storedMenus) setMenuItems(JSON.parse(storedMenus));
      } catch (e) {}
      const storedWhatsapp = localStorage.getItem('offkilt_whatsapp');
      if (storedWhatsapp) {
        setWhatsappNumber(storedWhatsapp.replace(/[^0-9]/g, ''));
      } else {
        try {
          const footer = JSON.parse(localStorage.getItem('offkilt_footer_settings'));
          if (footer?.phone) setWhatsappNumber(footer.phone.replace(/[^0-9]/g, ''));
        } catch(e) {}
      }
      try {
        const men = JSON.parse(localStorage.getItem('offkilt_campaign_men'));
        if (men) setCampaignMen(men);
      } catch {}
      try {
        const women = JSON.parse(localStorage.getItem('offkilt_campaign_women'));
        if (women) setCampaignWomen(women);
      } catch {}
      try {
        const storedMega = localStorage.getItem('offkilt_mega_menu');
        if (storedMega) setMegaMenuKeys(Object.keys(JSON.parse(storedMega)));
      } catch (e) {}
    };
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdate);
    return () => window.removeEventListener('offkilt_settings_updated', handleSettingsUpdate);
  }, []);

  const handleNavMouseEnter = (menu) => {
    clearTimeout(megaMenuTimeoutRef.current);
    setActiveMegaMenu(menu);
  };

  const handleNavMouseLeave = () => {
    megaMenuTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 350);
  };

  const handleMegaMenuClose = () => {
    setActiveMegaMenu(null);
  };

  // Wishlist state — stores full product objects, NO login required
  const [wishlist, setWishlist] = useState(() => {
    try {
      const raw = JSON.parse(localStorage.getItem('offkilt_wishlist') || '[]');
      // Filter out old format (plain IDs) — only keep proper product objects
      return raw.filter(w => w && typeof w === 'object' && w.id && w.name);
    } catch { return []; }
  });

  const lenisRef = useRef(null);

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => {
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  // Disable body scroll and pause Lenis scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      if (lenisRef.current) lenisRef.current.stop();
    } else {
      document.body.style.overflow = '';
      if (lenisRef.current) lenisRef.current.start();
    }
    return () => {
      document.body.style.overflow = '';
      if (lenisRef.current) lenisRef.current.start();
    };
  }, [isMobileMenuOpen]);

  // Check auth and fetch past orders on mount
  useEffect(() => {
    checkBlockedUser();
    const checkAuth = async () => {
      const token = localStorage.getItem('offkilt_auth_token');
      if (token) {
        try {
          const res = await profile.get();
          const user = res.data?.user || res.data;
          if (user && Object.keys(user).length > 0) {
            if (user.is_blocked) {
              setCurrentUser(null);
              localStorage.removeItem('offkilt_auth_token');
              localStorage.removeItem('offkilt_current_user');
              showToast('Your session has ended because this account is blocked.', 'error');
              return;
            }
            setCurrentUser(user);
            const ordersRes = await ordersApi.getAll();
            setPastOrders(ordersRes.data);
          } else {
            setCurrentUser(null);
            localStorage.removeItem('offkilt_auth_token');
            localStorage.removeItem('offkilt_current_user');
          }
        } catch (err) {
          console.error('Session expired or invalid', err);
          localStorage.removeItem('offkilt_auth_token');
          localStorage.removeItem('offkilt_current_user');
          setCurrentUser(null);
        }
      }
    };
    checkAuth();
  }, []);

  // Monitor URL parameters for simulated password reset links and product quick views on initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset-email')) {
      setTimeout(() => {
        setIsProfileOpen(true);
      }, 0);
    }

    const prodId = params.get('product');
    if (prodId) {
      const loadProduct = async () => {
        try {
          const res = await productsApi.getOne(prodId);
          if (res.data) {
            handleQuickView(res.data);
          }
        } catch (e) {
          console.error('Failed to load product from query param', e);
        }
      };
      setTimeout(loadProduct, 200);
    }
  }, []);

  // Track scroll position to update header styling & active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsHeaderScrolled(true);
      } else {
        setIsHeaderScrolled(false);
      }

      // Check active sections for active nav highlighting
      const sections = ['hero', 'story', 'catalog'];
      const scrollPos = window.scrollY + 200;

      for (const section of sections) {
        const el = document.getElementById(section);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPos >= top && scrollPos < top + height) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Cart operations
  const handleAddToCart = (product, size) => {
    if (!currentUser) {
      setIsProfileOpen(true);
      return;
    }

    setCartItems(prevItems => {
      const existingItemIndex = prevItems.findIndex(
        item => item.id === product.id && item.selectedSize === size
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        newItems[existingItemIndex].quantity += 1;
        return newItems;
      } else {
        return [...prevItems, { ...product, selectedSize: size, quantity: 1 }];
      }
    });
    // Automatically open the cart drawer after adding an item
    setIsCartOpen(true);
  };

  const handleUpdateQty = (productId, size, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId, size);
      return;
    }
    setCartItems(prevItems => 
      prevItems.map(item => 
        (item.id === productId && item.selectedSize === size) 
          ? { ...item, quantity: newQty } 
          : item
      )
    );
  };

  const handleRemoveItem = (productId, size) => {
    setCartItems(prevItems => 
      prevItems.filter(item => !(item.id === productId && item.selectedSize === size))
    );
  };

  const handleCloseProductModal = () => {
    setIsProductModalOpen(false);
    setSelectedProduct(null);
    const cleanUrl = `${window.location.origin}${window.location.pathname}`;
    window.history.pushState({ path: cleanUrl }, '', cleanUrl);
  };

  const handleQuickView = (product) => {
    if (!product) return;
    const newUrl = `${window.location.origin}${window.location.pathname}?product=${product.id}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    // Sanitize array fields — they may be JSON strings when coming from localStorage wishlist
    const parseArr = (val) => {
      if (Array.isArray(val)) return val;
      if (typeof val === 'string') { try { return JSON.parse(val); } catch { return []; } }
      return [];
    };
    const safe = {
      ...product,
      sizes: parseArr(product.sizes),
      details: parseArr(product.details),
      images: parseArr(product.images).length > 0
        ? parseArr(product.images)
        : [product.image].filter(Boolean),
    };
    setSelectedProduct(safe);
    setIsProductModalOpen(true);
  };

  const handleCheckoutTrigger = () => {
    if (!currentUser) {
      setIsCartOpen(false);
      setIsProfileOpen(true);
      return;
    }
    setIsCartOpen(false);
    setIsRazorpayOpen(true);
  };

  const handlePaymentSuccess = async (paymentDetails) => {
    setIsRazorpayOpen(false);
    
    const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const coupon = JSON.parse(localStorage.getItem('offkilt_applied_coupon') || 'null');
    const discount = coupon 
      ? (coupon.discount <= 100 ? Math.round(subtotal * (coupon.discount / 100)) : coupon.discount)
      : 0;
    const shipping = 0;
    const total = Math.max(0, subtotal - discount + shipping);
    
    const orderData = {
      email: paymentDetails.email || currentUser?.email,
      phone: paymentDetails.phone || currentUser?.phone,
      shipping_address: paymentDetails.shippingAddress,
      payment_method: paymentDetails.paymentMethod,
      items: cartItems,
      subtotal,
      discount,
      coupon_code: coupon ? coupon.code : null,
      shipping_fee: shipping,
      total: total
    };

    try {
      const response = await ordersApi.create(orderData);
      const newOrder = response.data;
      
      // Update past orders if logged in
      if (currentUser) {
        setPastOrders(prev => [newOrder, ...prev]);
      } else {
        setPastOrders(prev => [newOrder, ...prev]); // Keep local for guest session
        localStorage.setItem('offkilt_orders', JSON.stringify([newOrder, ...pastOrders]));
      }

      setCartItems([]);
      localStorage.removeItem('offkilt_applied_coupon');
      setActiveTrackingOrder(newOrder);
      setIsTrackingOpen(true);
    } catch (err) {
      console.error('Failed to create order', err);
      alert('Failed to place order. Please try again.');
    }
  };

  const handleLogin = async (user, token) => {
    if (token) localStorage.setItem('offkilt_auth_token', token);
    setCurrentUser(user);
    setIsProfileOpen(false);
    showToast(`Access Granted. Welcome back, ${user.name}!`, 'success');
    
    // Fetch orders upon login
    try {
      const ordersRes = await ordersApi.getAll();
      setPastOrders(ordersRes.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error(err);
    } finally {
      setCurrentUser(null);
      setPastOrders([]);
      localStorage.removeItem('offkilt_auth_token');
      setIsProfileOpen(false);
      showToast('Logged out successfully. See you soon rebel!', 'info');
    }
  };

  const handleUpdateProfile = async (updatedUser) => {
    try {
      const res = await profile.update(updatedUser);
      setCurrentUser(res.data?.user || res.data);
      showToast('Profile credentials updated successfully.', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile.', 'error');
    }
  };

  // Helper to seed past mock orders for testing badges
  const handleSeedMockOrders = (itemCount) => {
    if (!currentUser) return;
    
    const orderId1 = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId2 = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const order1 = {
      id: orderId1,
      orderId: orderId1,
      email: currentUser.email,
      phone: currentUser.phone,
      shipping_address: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      shippingAddress: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      payment_method: 'UPI Instant Pay',
      paymentMethod: 'UPI Instant Pay',
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      created_at: new Date().toISOString(),
      items: [
        {
          id: "OKJ24201",
          name: "Asymmetric Raw Carpenter Jeans",
          price: 2999,
          image: "/images/products/AMAZON LISTING/AMAZON LISTING/OKJ24201/iloveimg-resized (20)/0fb309ab-0d27-4569-b0a8-01cbfe745a22.webp",
          selectedSize: '32',
          quantity: Math.ceil(itemCount / 2)
        }
      ],
      subtotal: 2999 * Math.ceil(itemCount / 2),
      discount: 0,
      coupon_code: null,
      shipping_fee: 0,
      shipping: 0,
      total: 2999 * Math.ceil(itemCount / 2),
      status: 'confirmed',
      stepVal: 4 // In Transit
    };

    const order2 = {
      id: orderId2,
      orderId: orderId2,
      email: currentUser.email,
      phone: currentUser.phone,
      shipping_address: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      shippingAddress: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      payment_method: 'Credit Card',
      paymentMethod: 'Credit Card',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      items: [
        {
          id: "OKJ24205",
          name: "Asymmetrical Paneled Denim Skirt",
          price: 1999,
          image: "/images/products/AMAZON LISTING/AMAZON LISTING/SKIRT/OKJ24205/iloveimg-resized (14)/4be88751-b68c-4d3c-9f2e-0357693a1f61.webp",
          selectedSize: '30',
          quantity: Math.floor(itemCount / 2)
        }
      ],
      subtotal: 1999 * Math.floor(itemCount / 2),
      discount: 0,
      coupon_code: null,
      shipping_fee: 0,
      shipping: 0,
      total: 1999 * Math.floor(itemCount / 2),
      status: 'delivered',
      stepVal: 5 // Delivered
    };

    const newOrders = [order1, order2, ...pastOrders];
    setPastOrders(newOrders);
    localStorage.setItem('offkilt_orders', JSON.stringify(newOrders));
    window.dispatchEvent(new Event('offkilt_orders_updated'));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToNewArrivals = () => {
    const el = document.getElementById('new-arrivals');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const handleWishlistToggle = (product) => {
    // Works without login — stored in localStorage
    setWishlist(prev => {
      const alreadyIn = prev.some(w => (w.id || w) === (product.id || product));
      const updated = alreadyIn
        ? prev.filter(w => (w.id || w) !== (product.id || product))
        : [...prev, product];
      localStorage.setItem('offkilt_wishlist', JSON.stringify(updated));
      return updated;
    });
  };

  return (
    <div className="app-container" style={{ paddingTop: showAnnouncement ? '36px' : '0px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontHeading.replace(/ /g, '+')}:wght@300;400;500;700;800&family=${fontBody.replace(/ /g, '+')}:wght@300;400;500;600;700&display=swap');
        :root {
          --font-heading: '${fontHeading}', sans-serif;
          --font-body: '${fontBody}', sans-serif;
        }
        @keyframes marquee-scroll-announcement {
          0% { transform: translate3d(0, 0, 0); }
          100% { transform: translate3d(-50%, 0, 0); }
        }
      `}</style>
      
      {showAnnouncement && (
        <div className="announcement-bar" style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '36px',
          backgroundColor: announcementBg,
          color: announcementColor,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontFamily: 'var(--font-mono)',
          letterSpacing: '1px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', overflow: 'hidden', whiteSpace: 'nowrap', width: '100%', padding: '0 40px', justifyContent: 'center' }}>
            <div className="marquee-text-scroll" style={{
              display: 'inline-block',
              animation: 'marquee-scroll-announcement 30s linear infinite',
              paddingLeft: '50%'
            }}>
              {announcementText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; {announcementText}
            </div>
          </div>
          <button 
            onClick={() => {
              setShowAnnouncement(false);
              localStorage.setItem('offkilt_announcement_show', 'false');
              window.dispatchEvent(new Event('offkilt_settings_updated'));
            }} 
            style={{
              position: 'absolute',
              right: '15px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: announcementColor,
              opacity: 0.6,
              cursor: 'pointer',
              background: 'none',
              border: 'none',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="Close Announcement"
          >
            <X size={12} />
          </button>
        </div>
      )}

      {loading && <Preloader onComplete={() => setLoading(false)} />}
      
      {/* Header */}
          <header 
            className={`site-header ${isHeaderScrolled || isMobileMenuOpen ? 'scrolled' : ''}`}
            style={{ 
              top: showAnnouncement ? (isHeaderScrolled ? '0px' : '36px') : '0px',
              transition: 'top 0.3s ease, background-color 0.5s cubic-bezier(0.16, 1, 0.3, 1), height 0.5s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          >
            <div className="container header-container">
              
              {/* Logo */}
              <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
                <span className="logo-text">off-kilt</span>
                <span className="logo-sub">FASHION BEYOND ORDINARY</span>
              </a>

              {/* Navigation Links — Calvin Klein Style */}
              <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`} data-lenis-prevent="true" onMouseLeave={handleNavMouseLeave}>
                {menuItems.filter(item => item.visible !== false).map((item, idx) => (
                  <a
                    key={idx}
                    href={item.link}
                    className={`nav-link ${(item.link === '#catalog' && activeSection === 'catalog') ? 'active' : ''}`}
                    onClick={(e) => {
                      e.preventDefault();
                      if (item.category) {
                        setActiveCategory(item.category);
                      }
                      const sectionId = item.link.replace('#', '');
                      scrollToSection(sectionId || 'hero');
                    }}
                    onMouseEnter={() => {
                      const labelSlug = item.label.toLowerCase().trim().replace(/\s+/g, '-');
                      if (megaMenuKeys.includes(labelSlug)) {
                        handleNavMouseEnter(labelSlug);
                      } else {
                        handleNavMouseEnter(null);
                      }
                    }}
                  >
                    {item.label}
                  </a>
                ))}

                {/* Mobile Menu Spacer/Divider & Extras (Hidden on Desktop) */}
                <div className="mobile-menu-divider" />
                <div className="mobile-menu-extra-links">
                  {currentUser ? (
                    <>
                      <button 
                        className="mobile-extra-link" 
                        onClick={() => { setIsMobileMenuOpen(false); setIsProfileOpen(true); }}
                      >
                        Account ({currentUser.name})
                      </button>
                      <button 
                        className="mobile-extra-link" 
                        onClick={() => { setIsMobileMenuOpen(false); handleLogout(); }}
                        style={{ color: 'var(--accent-raw)' }}
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <button 
                      className="mobile-extra-link" 
                      onClick={() => { setIsMobileMenuOpen(false); setIsProfileOpen(true); }}
                    >
                      Sign In / Register
                    </button>
                  )}
                  <button 
                    className="mobile-extra-link" 
                    onClick={() => { setIsMobileMenuOpen(false); setIsTrackingOpen(true); }}
                  >
                    Track Order
                  </button>
                </div>
                <div className="mobile-menu-footer">
                  <a href={localStorage.getItem('offkilt_instagram') || 'https://instagram.com/off_kilt'} target="_blank" rel="noreferrer" className="mobile-social-link">Instagram</a>
                  <a href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noreferrer" className="mobile-social-link">WhatsApp Support</a>
                </div>
              </nav>

              {/* Actions: Profile & Cart Trigger */}
              <div className="header-actions">
                {!isMobileMenuOpen && (
                  <>
                    <button 
                      className="header-btn" 
                      onClick={() => setIsProfileOpen(true)} 
                      title="User Profile"
                      style={{ display: 'flex', alignItems: 'center', position: 'relative' }}
                    >
                      {currentUser && currentUser.profileImage ? (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <img 
                            src={currentUser.profileImage} 
                            alt="Profile" 
                            style={{ 
                              width: '20px', 
                              height: '20px', 
                              borderRadius: '50%', 
                              objectFit: 'cover', 
                              border: '1px solid var(--accent-raw)' 
                            }} 
                          />
                          <span style={{
                            position: 'absolute',
                            top: '-2px',
                            right: '-2px',
                            width: '7px',
                            height: '7px',
                            borderRadius: '50%',
                            backgroundColor: 'var(--accent-raw)',
                            border: '1px solid var(--bg-dark)'
                          }} />
                        </div>
                      ) : (
                        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                          <User size={20} style={{ color: currentUser ? 'var(--accent-raw)' : 'inherit' }} />
                          {currentUser && (
                            <span style={{
                              position: 'absolute',
                              top: '-2px',
                              right: '-2px',
                              width: '7px',
                              height: '7px',
                              borderRadius: '50%',
                              backgroundColor: 'var(--accent-raw)',
                              border: '1px solid var(--bg-dark)'
                            }} />
                          )}
                        </div>
                      )}
                    </button>

                    <button className="header-btn" onClick={() => setIsCartOpen(true)} title="View Cart">
                      <ShoppingBag size={20} />
                      {cartItems.length > 0 && (
                        <span className="cart-count">
                          {cartItems.reduce((acc, item) => acc + item.quantity, 0)}
                        </span>
                      )}
                    </button>
                  </>
                )}
                
                <button 
                  className="header-btn menu-toggle" 
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  title="Menu"
                >
                  {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                </button>
              </div>

            </div>
          </header>

          {/* Calvin Klein Mega Menu Dropdown */}
          <MegaMenu
            activeMenu={activeMegaMenu}
            onCategoryClick={(cat) => {
              setActiveCategory(cat);
              scrollToSection('catalog');
            }}
            onClose={handleMegaMenuClose}
            onMouseEnter={() => clearTimeout(megaMenuTimeoutRef.current)}
            onMouseLeave={handleNavMouseLeave}
          />

           {/* Main sections — Full Homepage Flow */}
          <main>
            <Hero
              onExploreClick={() => scrollToSection('catalog')}
              onShopNewArrivals={scrollToNewArrivals}
              isAppLoading={loading}
            />

            {/* Press / As Seen On Strip */}
            <div className="press-strip">
              <div className="container">
                <div className="press-strip-inner">
                  <span className="press-label">As Seen On</span>
                  {['Vogue India', 'Grazia', 'Elle', 'Femina', 'Harper\'s Bazaar'].map(name => (
                    <span key={name} className="press-name">{name}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Men's Campaign Section */}
            <CampaignSection
              gender="men"
              title={campaignMen.title}
              subtitle={campaignMen.subtitle}
              ctaText={campaignMen.ctaText}
              image={campaignMen.image}
              onExplore={() => { setActiveCategory('jeans'); scrollToSection('catalog'); }}
            />

            <TrendingCollection
              onCategoryClick={(cat) => { setActiveCategory(cat); scrollToSection('catalog'); }}
            />

            {/* Women's Campaign Section */}
            <CampaignSection
              gender="women"
              title={campaignWomen.title}
              subtitle={campaignWomen.subtitle}
              ctaText={campaignWomen.ctaText}
              image={campaignWomen.image}
              onExplore={() => { setActiveCategory('skirts'); scrollToSection('catalog'); }}
            />

            <NewArrivals
              onProductClick={handleQuickView}
              onAddToCart={(p) => handleAddToCart(p, p.sizes?.[0] || 'Free Size')}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              onViewAll={() => scrollToSection('catalog')}
            />

            <BestSellers
              onScrollToCatalog={() => scrollToSection('catalog')}
            />

            <FashionVideo />

            <ShopByStyle
              onCategoryClick={(cat) => { setActiveCategory(cat); scrollToSection('catalog'); }}
            />

            <BrandStory />

            <CustomerReviews />

            <Catalog
              onProductClick={handleQuickView}
              activeTab={activeCategory}
              setActiveTab={setActiveCategory}
              wishlist={wishlist}
              onWishlistToggle={handleWishlistToggle}
              onAddToCart={handleAddToCart}
            />

            <InstagramGallery />

            <SellerPartners />

            <NewsletterSection />
          </main>

          {/* Footer */}
          <Footer 
            onCategoryClick={(cat) => {
              setActiveCategory(cat);
              scrollToSection('catalog');
            }} 
            onStoryClick={() => scrollToSection('story')} 
            onTrackClick={() => setIsTrackingOpen(true)}
            onOpenAdmin={() => {
              if (currentUser?.is_admin) {
                setIsAdminOpen(true);
              } else {
                setIsProfileOpen(true); // prompt them to log in
              }
            }}
          />

          {/* Modals & Overlay Components */}
          <ProductDetailModal 
            key={selectedProduct ? selectedProduct.id : 'empty'}
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={handleCloseProductModal}
            onAddToCart={handleAddToCart}
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            onProductClick={handleQuickView}
          />

          <CartDrawer 
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            cartItems={cartItems}
            onUpdateQty={handleUpdateQty}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckoutTrigger}
          />

          <OrderTrackingModal 
            isOpen={isTrackingOpen}
            onClose={() => {
              setIsTrackingOpen(false);
              setActiveTrackingOrder(null);
            }}
            order={activeTrackingOrder}
            onContinueShopping={() => {
              setIsTrackingOpen(false);
              setActiveTrackingOrder(null);
            }}
          />

          <UserProfileModal 
            isOpen={isProfileOpen}
            onClose={() => setIsProfileOpen(false)}
            currentUser={currentUser}
            onLogin={handleLogin}
            onLogout={handleLogout}
            onUpdateProfile={handleUpdateProfile}
            orders={pastOrders}
            onTrackOrder={(order) => {
              setActiveTrackingOrder(order);
              setIsTrackingOpen(true);
              setIsProfileOpen(false);
            }}
            onSeedMockOrders={handleSeedMockOrders}
            onOpenAdmin={() => {
              setIsProfileOpen(false);
              setIsAdminOpen(true);
            }}
            wishlist={wishlist}
            onWishlistToggle={handleWishlistToggle}
            onProductClick={(product) => { handleQuickView(product); setIsProfileOpen(false); }}
          />

          {isRazorpayOpen && (
            <RazorpayModal 
              isOpen={isRazorpayOpen}
              onClose={() => setIsRazorpayOpen(false)}
              totalAmount={
                (() => {
                  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                  const coupon = JSON.parse(localStorage.getItem('offkilt_applied_coupon') || 'null');
                  const discount = coupon 
                    ? (coupon.discount <= 100 ? Math.round(subtotal * (coupon.discount / 100)) : coupon.discount)
                    : 0;
                  const shipping = 0;
                  return Math.max(0, subtotal - discount + shipping);
                })()
              }
              onSuccess={handlePaymentSuccess}
              currentUser={currentUser}
            />
          )}

          {isAdminOpen && currentUser?.is_admin && (
            <AdminDashboard 
              currentUser={currentUser} 
              onClose={() => setIsAdminOpen(false)} 
            />
          )}

           {/* Floating WhatsApp Widget */}
          <a 
            href={`https://wa.me/${whatsappNumber}?text=Hi%20Off-Kilt%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20recent%20order.`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="whatsapp-widget"
            title="Chat on WhatsApp"
          >
            <Phone size={24} fill="#ffffff" color="#25d366" />
            <div className="whatsapp-tooltip">
              WHATSAPP SUPPORT
            </div>
          </a>

          {/* Toast Notification popup */}
          <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                style={{
                  position: 'fixed',
                  top: '96px',
                  right: '24px',
                  zIndex: 99999,
                  backgroundColor: 'rgba(17, 17, 17, 0.95)',
                  backdropFilter: 'blur(8px)',
                  color: '#ffffff',
                  padding: '12px 20px',
                  borderRadius: '4px',
                  boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
              >
                {toast.type === 'success' && <Check size={16} style={{ color: 'var(--accent-raw)' }} />}
                {toast.type === 'error' && <AlertCircle size={16} style={{ color: '#ef4444' }} />}
                {toast.type === 'info' && <Info size={16} style={{ color: 'var(--accent-gold)' }} />}
                <span>{toast.message}</span>
              </motion.div>
            )}
          </AnimatePresence>
    </div>
  );
}
