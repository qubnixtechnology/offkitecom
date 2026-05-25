import { useState, useEffect } from 'react';
import { ShoppingBag, Menu, X, Phone, User } from 'lucide-react';
import Lenis from 'lenis';
import { auth, profile, orders as ordersApi } from './services/api';
import Preloader from './components/Preloader';
import Hero from './components/Hero';
import BrandStory from './components/BrandStory';
import Catalog from './components/Catalog';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import RazorpayModal from './components/RazorpayModal';
import Footer from './components/Footer';
import OrderTrackingModal from './components/OrderTrackingModal';
import UserProfileModal from './components/UserProfileModal';
import AdminDashboard from './components/AdminDashboard';

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

  // Initialize Lenis Smooth Scrolling
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });

    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    return () => lenis.destroy();
  }, []);

  // Check auth and fetch past orders on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('offkilt_auth_token');
      if (token) {
        try {
          const res = await profile.get();
          const user = res.data?.user || res.data;
          if (user && Object.keys(user).length > 0) {
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

  // Monitor URL parameters for simulated password reset links on initialization
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('reset-email')) {
      setTimeout(() => {
        setIsProfileOpen(true);
      }, 0);
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

  const handleQuickView = (product) => {
    setSelectedProduct(product);
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
    const shipping = 0;
    
    const orderData = {
      email: paymentDetails.email || currentUser?.email,
      phone: paymentDetails.phone || currentUser?.phone,
      shipping_address: paymentDetails.shippingAddress,
      payment_method: paymentDetails.paymentMethod,
      items: cartItems,
      subtotal,
      shipping_fee: shipping,
      total: subtotal + shipping
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
    }
  };

  const handleUpdateProfile = async (updatedUser) => {
    try {
      const res = await profile.update(updatedUser);
      setCurrentUser(res.data?.user || res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    }
  };

  // Helper to seed past mock orders for testing badges
  const handleSeedMockOrders = (itemCount) => {
    if (!currentUser) return;
    
    const orderId1 = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
    const orderId2 = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
    
    const order1 = {
      orderId: orderId1,
      email: currentUser.email,
      phone: currentUser.phone,
      shippingAddress: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      paymentMethod: 'UPI Instant Pay',
      date: new Date().toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [
        {
          id: "OKJ24201",
          name: "Asymmetric Raw Carpenter Jeans",
          price: 2999,
          image: "/images/products/AMAZON LISTING/AMAZON LISTING/OKJ24201/iloveimg-resized (20)/0fb309ab-0d27-4569-b0a8-01cbfe745a22.jpg",
          selectedSize: '32',
          quantity: Math.ceil(itemCount / 2)
        }
      ],
      subtotal: 2999 * Math.ceil(itemCount / 2),
      shipping: 0,
      stepVal: 4 // In Transit
    };

    const order2 = {
      orderId: orderId2,
      email: currentUser.email,
      phone: currentUser.phone,
      shippingAddress: `${currentUser.address}, Pincode - ${currentUser.pincode}`,
      paymentMethod: 'Credit Card',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      items: [
        {
          id: "OKJ24205",
          name: "Asymmetrical Paneled Denim Skirt",
          price: 1999,
          image: "/images/products/AMAZON LISTING/AMAZON LISTING/SKIRT/OKJ24205/iloveimg-resized (14)/4be88751-b68c-4d3c-9f2e-0357693a1f61.jpg",
          selectedSize: '30',
          quantity: Math.floor(itemCount / 2)
        }
      ],
      subtotal: 1999 * Math.floor(itemCount / 2),
      shipping: 0,
      stepVal: 5 // Delivered
    };

    const newOrders = [order1, order2, ...pastOrders];
    setPastOrders(newOrders);
    localStorage.setItem('offkilt_orders', JSON.stringify(newOrders));
  };

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="app-container">
      <Preloader onComplete={() => setLoading(false)} />
      
      {/* Header */}
          <header className={`site-header ${isHeaderScrolled ? 'scrolled' : ''}`}>
            <div className="container header-container">
              
              {/* Logo */}
              <a href="#" className="logo-link" onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}>
                <span className="logo-text">off-kilt</span>
                <span className="logo-sub">FASHION BEYOND ORDINARY</span>
              </a>

              {/* Navigation Links */}
              <nav className={`nav-links ${isMobileMenuOpen ? 'open' : ''}`}>
                <a 
                  href="#hero" 
                  className={`nav-link ${activeSection === 'hero' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection('hero'); }}
                >
                  Home
                </a>
                <a 
                  href="#story" 
                  className={`nav-link ${activeSection === 'story' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection('story'); }}
                >
                  Narrative
                </a>
                <a 
                  href="#catalog" 
                  className={`nav-link ${activeSection === 'catalog' ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); scrollToSection('catalog'); }}
                >
                  Catalog
                </a>
                <a 
                  href="#track" 
                  className="nav-link"
                  onClick={(e) => { e.preventDefault(); setIsTrackingOpen(true); setIsMobileMenuOpen(false); }}
                >
                  Track Order
                </a>
              </nav>

              {/* Actions: Profile & Cart Trigger */}
              <div className="header-actions">
                <button 
                  className="header-btn" 
                  onClick={() => setIsProfileOpen(true)} 
                  title="User Profile"
                  style={{ display: 'flex', alignItems: 'center' }}
                >
                  {currentUser && currentUser.profileImage ? (
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
                  ) : (
                    <User size={20} />
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

          {/* Main sections */}
          <main>
            <Hero onExploreClick={() => scrollToSection('catalog')} />
            <BrandStory />
            <Catalog 
              onProductClick={handleQuickView} 
              activeTab={activeCategory}
              setActiveTab={setActiveCategory}
            />
          </main>

          {/* Footer */}
          <Footer 
            onCategoryClick={(cat) => {
              setActiveCategory(cat);
              scrollToSection('catalog');
            }} 
            onStoryClick={() => scrollToSection('story')} 
            onTrackClick={() => setIsTrackingOpen(true)}
          />

          {/* Modals & Overlay Components */}
          <ProductDetailModal 
            key={selectedProduct ? selectedProduct.id : 'empty'}
            product={selectedProduct}
            isOpen={isProductModalOpen}
            onClose={() => setIsProductModalOpen(false)}
            onAddToCart={handleAddToCart}
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
          />

          {isRazorpayOpen && (
            <RazorpayModal 
              isOpen={isRazorpayOpen}
              onClose={() => setIsRazorpayOpen(false)}
              totalAmount={
                (() => {
                  const subtotal = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
                  const shipping = 0;
                  return subtotal + shipping;
                })()
              }
              onSuccess={handlePaymentSuccess}
              currentUser={currentUser}
            />
          )}

          {isAdminOpen && currentUser && (
            <AdminDashboard 
              currentUser={currentUser} 
              onClose={() => setIsAdminOpen(false)} 
            />
          )}

          {/* Floating WhatsApp Widget */}
          <a 
            href="https://wa.me/918291155692?text=Hi%20Off-Kilt%20Support,%20I%20have%20an%20inquiry%20regarding%20my%20recent%20order." 
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
    </div>
  );
}
