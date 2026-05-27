import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit2, Trash2, Save, Image as ImageIcon, UploadCloud, 
  BarChart3, Package, ShoppingBag, Layout, List, FileText, Megaphone, 
  Tag, Users, Globe, RefreshCw, ShieldAlert, Database, UserCheck, 
  Download, Upload, Search, Check, AlertTriangle, Eye, Printer 
} from 'lucide-react';
import { products as productsApi, admin as adminApi } from '../services/api';

export default function AdminDashboard({ currentUser, onClose }) {
  const [activeTab, setActiveTab] = useState('analytics');
  
  // Custom sync helper
  const triggerSync = (eventName) => {
    window.dispatchEvent(new Event(eventName || 'offkilt_settings_updated'));
  };

  // --- 1. ANALYTICS STATE & MOCKS ---
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 245200,
    totalOrders: 48,
    abandonmentRate: 24,
    conversionRate: 3.6,
    weeklySales: [
      { day: 'Mon', amount: 32000 },
      { day: 'Tue', amount: 45000 },
      { day: 'Wed', amount: 28000 },
      { day: 'Thu', amount: 52000 },
      { day: 'Fri', amount: 48000 },
      { day: 'Sat', amount: 64000 },
      { day: 'Sun', amount: 58000 }
    ],
    fitDistribution: [
      { fit: 'Baggy', pct: 45, color: 'var(--accent-raw)' },
      { fit: 'Relaxed', pct: 25, color: 'var(--accent-gold)' },
      { fit: 'Boot Cut', pct: 15, color: '#3b82f6' },
      { fit: 'Slim/Skinny', pct: 15, color: '#10b981' }
    ],
    bestSellers: [
      { id: 'OKJ24201', name: 'Asymmetric Raw Carpenter Jeans', qty: 18, revenue: 53982 },
      { id: 'OKJ24205', name: 'Asymmetrical Paneled Denim Skirt', qty: 14, revenue: 27986 },
      { id: 'OKJ24202', name: 'Raw Edge Baggy Denim Cargo', qty: 11, revenue: 38489 }
    ]
  });

  // --- 2. PRODUCTS CRUD STATE & LOGIC ---
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    id: '', name: '', tagline: '', price: '', category: 'jeans',
    image: '', hover_image: '', description: '', discountPrice: '',
    stock: '50', sku: '', swatches: 'Raw Indigo:#1e293b, Charcoal Black:#111111',
    sizes: ['30', '32', '34'],
    images: []
  });
  const [editingProductId, setEditingProductId] = useState(null);
  const [productSearch, setProductSearch] = useState('');
  
  const fetchProducts = async () => {
    setProductsLoading(true);
    try {
      const res = await productsApi.getAll('all');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const mainImg = productForm.images?.[0] || productForm.image || '';
    const hoverImg = productForm.images?.[1] || productForm.hover_image || mainImg;

    const payload = {
      ...productForm,
      image: mainImg,
      hover_image: hoverImg,
      hoverImage: hoverImg,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: Number(productForm.stock),
      sizes: productForm.sizes,
      // Parse swatches comma separated list to structured details
      details: [
        `SKU: ${productForm.sku || 'OK-' + Math.floor(Math.random() * 10000)}`,
        `Inventory: ${productForm.stock} units`,
        `Fabric Swatches: ${productForm.swatches}`
      ],
      materials: "100% heavyweight selvedge denim",
      shipping: "Standard delivery 3-5 business days"
    };

    try {
      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setProductForm({
        id: '', name: '', tagline: '', price: '', category: 'jeans',
        image: '', hover_image: '', description: '', discountPrice: '',
        stock: '50', sku: '', swatches: 'Raw Indigo:#1e293b, Charcoal Black:#111111',
        sizes: ['30', '32', '34'],
        images: []
      });
      setEditingProductId(null);
      fetchProducts();
      triggerSync('offkilt_products_updated');
      alert('Product saved successfully!');
    } catch (err) {
      alert('Failed to save product');
    }
  };

  const handleEditProduct = (p) => {
    // Parse color swatch string
    let swatchStr = 'Raw Indigo:#1e293b, Charcoal Black:#111111';
    if (Array.isArray(p.details)) {
      const swatchLine = p.details.find(d => d.includes('Fabric Swatches:'));
      if (swatchLine) swatchStr = swatchLine.replace('Fabric Swatches:', '').trim();
    }

    let productImages = [];
    if (p.images) {
      if (Array.isArray(p.images)) {
        productImages = [...p.images];
      } else if (typeof p.images === 'string') {
        try {
          productImages = JSON.parse(p.images);
        } catch (e) {
          productImages = [];
        }
      }
    }
    if (!Array.isArray(productImages) || productImages.length === 0) {
      productImages = [];
      if (p.image) productImages.push(p.image);
      if (p.hoverImage || p.hover_image) productImages.push(p.hoverImage || p.hover_image);
    }

    setProductForm({
      id: p.id,
      name: p.name,
      tagline: p.tagline || '',
      price: p.price,
      category: p.category || 'jeans',
      image: p.image || '',
      hover_image: p.hoverImage || p.hover_image || '',
      images: productImages,
      description: p.description || '',
      discountPrice: p.discountPrice || '',
      stock: p.stock || '50',
      sku: p.sku || p.id,
      swatches: swatchStr,
      sizes: Array.isArray(p.sizes) ? p.sizes : ['30', '32', '34']
    });
    setEditingProductId(p.id);
  };

  const handleDeleteProduct = async (id) => {
    if (window.confirm('Delete this product from inventory?')) {
      try {
        await adminApi.deleteProduct(id);
        fetchProducts();
        triggerSync('offkilt_products_updated');
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const handleProductImageUpload = (e, field) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => ({ ...prev, [field]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => {
          const newImages = [...(prev.images || []), reader.result];
          return {
            ...prev,
            images: newImages,
            image: prev.image || reader.result,
            hover_image: prev.hover_image || (newImages.length > 1 ? newImages[1] : prev.hover_image)
          };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveImage = (index) => {
    setProductForm(prev => {
      const filtered = (prev.images || []).filter((_, idx) => idx !== index);
      return {
        ...prev,
        images: filtered,
        image: filtered[0] || '',
        hover_image: filtered[1] || filtered[0] || ''
      };
    });
  };

  // --- 3. ORDERS STATE & INVOICING ---
  const [orders, setOrders] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('offkilt_orders') || '[]');
    if (stored.length === 0) {
      // Seed default orders if empty
      const seeded = [
        {
          id: 'OK-482910',
          email: 'simran.k@example.com',
          phone: '9876543210',
          shipping_address: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai, Maharashtra - 400050',
          payment_method: 'UPI Instant Pay',
          date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
          status: 'confirmed',
          items: [
            { id: 'OKJ24201', name: 'Asymmetric Raw Carpenter Jeans', price: 2999, quantity: 1, selectedSize: '32', image: '/images/products/AMAZON LISTING/AMAZON LISTING/OKJ24201/iloveimg-resized (20)/0fb309ab-0d27-4569-b0a8-01cbfe745a22.webp' }
          ],
          subtotal: 2999,
          discount: 300,
          coupon_code: 'OFFKILT10',
          shipping_fee: 0,
          total: 2699,
          tracking_number: 'ECOM9938472910'
        },
        {
          id: 'OK-109284',
          email: 'rahul.s@example.com',
          phone: '8877665544',
          shipping_address: 'House 14, Gali 2, Shanti Kunj, Vasant Kunj, New Delhi, Delhi - 110070',
          payment_method: 'Cash On Delivery (COD)',
          date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN'),
          status: 'delivered',
          items: [
            { id: 'OKJ24205', name: 'Asymmetrical Paneled Denim Skirt', price: 1999, quantity: 2, selectedSize: '30', image: '/images/products/AMAZON LISTING/AMAZON LISTING/SKIRT/OKJ24205/iloveimg-resized (14)/4be88751-b68c-4d3c-9f2e-0357693a1f61.webp' }
          ],
          subtotal: 3998,
          discount: 0,
          coupon_code: null,
          shipping_fee: 99,
          total: 4097,
          tracking_number: 'SHIP882749102'
        }
      ];
      localStorage.setItem('offkilt_orders', JSON.stringify(seeded));
      return seeded;
    }
    return stored;
  });

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  const updateOrderStatus = (orderId, status) => {
    const updated = orders.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, status } : o);
    setOrders(updated);
    localStorage.setItem('offkilt_orders', JSON.stringify(updated));
    triggerSync('offkilt_orders_updated');
  };

  const updateOrderTracking = (orderId, tracking_number) => {
    const updated = orders.map(o => (o.id === orderId || o.orderId === orderId) ? { ...o, tracking_number } : o);
    setOrders(updated);
    localStorage.setItem('offkilt_orders', JSON.stringify(updated));
    triggerSync('offkilt_orders_updated');
    alert('Tracking details saved.');
  };

  const handlePrintInvoice = () => {
    window.print();
  };

  // --- 4. CAMPAIGNS & BANNER CMS ---
  const [campaigns, setCampaigns] = useState(() => {
    const defaultMen = {
      title: "Denim Redefined",
      subtitle: "Crafted for the modern rebel. Raw denim, bold silhouettes, uncompromising attitude.",
      ctaText: "Explore Men's",
      image: "/images/mens_campaign.png"
    };
    const defaultWomen = {
      title: "Elegance Meets Edge",
      subtitle: "Structured denim and statement skirts for the confident woman who defies convention.",
      ctaText: "Explore Women's",
      image: "/images/womens_campaign.png"
    };
    const defaultHero = {
      title: "ELEGANCE DESIGNED FOR EVERY WOMAN",
      subtitle: "Off-kilt challenges the ordinary to bring you premium raw and selvedge denim statements.",
      videoUrl: "https://cdn.shopify.com/videos/c/o/v/3bf4a509620e4e53aa454c856a432f1e.mp4"
    };

    return {
      men: JSON.parse(localStorage.getItem('offkilt_campaign_men')) || defaultMen,
      women: JSON.parse(localStorage.getItem('offkilt_campaign_women')) || defaultWomen,
      hero: JSON.parse(localStorage.getItem('offkilt_campaign_hero')) || defaultHero
    };
  });

  const handleCampaignSave = (section, data) => {
    const updated = { ...campaigns, [section]: data };
    setCampaigns(updated);
    localStorage.setItem(`offkilt_campaign_${section}`, JSON.stringify(data));
    triggerSync('offkilt_settings_updated');
    alert(`${section.toUpperCase()} campaign settings saved!`);
  };

  const handleCampaignImageUpload = (section, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleCampaignSave(section, { ...campaigns[section], image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // --- 5. NAVIGATION / MENUS CONTROL ---
  const [menuItems, setMenuItems] = useState(() => {
    const defaults = [
      { label: 'New', link: '#new-arrivals', visible: true },
      { label: 'Men', link: '#campaign-men', category: 'jeans', visible: true },
      { label: 'Women', link: '#campaign-women', category: 'skirts', visible: true },
      { label: 'Collection', link: '#catalog', visible: true },
      { label: 'After Dark', link: '#catalog', category: 'all', visible: true },
      { label: 'Sale', link: '#catalog', category: 'all', visible: true }
    ];
    return JSON.parse(localStorage.getItem('offkilt_menus') || JSON.stringify(defaults));
  });

  const handleMenuSave = () => {
    localStorage.setItem('offkilt_menus', JSON.stringify(menuItems));
    triggerSync('offkilt_settings_updated');
    alert('Header navigation settings saved.');
  };

  // --- 6. CMS POLICIES & FAQS ---
  const [policies, setPolicies] = useState(() => {
    const defaults = {
      refund: "We offer a 7-day hassle-free return and exchange policy for all unworn, unwashed items in their original packaging. Return shipping is free. Refund is credited back via original payment method or UPI wallet.",
      terms: "Welcome to off-kilt. By using our website, you agree to comply with our terms of service. All designs, media, and text are property of off-kilt. Reselling or distributing is strictly prohibited without authorization.",
      faqs: [
        { q: "How do I care for raw selvedge denim?", a: "Wash raw denim inside out in cold water, or soak. Air dry to maintain rigid silhouette and custom fading." },
        { q: "Do you offer cash on delivery (COD)?", a: "Yes, we support COD across most Indian pincodes. A service charge of ₹99 is applicable." }
      ]
    };
    return JSON.parse(localStorage.getItem('offkilt_cms_policies') || JSON.stringify(defaults));
  });

  const handlePoliciesSave = () => {
    localStorage.setItem('offkilt_cms_policies', JSON.stringify(policies));
    triggerSync('offkilt_settings_updated');
    alert('CMS Policies & FAQs updated successfully.');
  };

  // --- 7. ANNOUNCEMENT BAR CONTROL ---
  const [annBar, setAnnBar] = useState({
    text: localStorage.getItem('offkilt_announcement_text') || '✦ GET FREE SHIPPING ON ORDERS ABOVE ₹5,000 | EXTRA 10% OFF USE CODE: OFFKILT10 ✦',
    show: localStorage.getItem('offkilt_announcement_show') !== 'false',
    bg: localStorage.getItem('offkilt_announcement_bg') || '#111111',
    color: localStorage.getItem('offkilt_announcement_color') || '#ffffff'
  });

  const handleAnnBarSave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_announcement_text', annBar.text);
    localStorage.setItem('offkilt_announcement_show', annBar.show ? 'true' : 'false');
    localStorage.setItem('offkilt_announcement_bg', annBar.bg);
    localStorage.setItem('offkilt_announcement_color', annBar.color);
    triggerSync('offkilt_settings_updated');
    alert('Announcement bar configurations updated!');
  };

  // --- 8. COUPONS BUILDER ---
  const [coupons, setCoupons] = useState(() => {
    const defaults = [
      { code: 'OFFKILT10', discount: 10, type: 'percent', status: 'active' },
      { code: 'OFFKILT20', discount: 20, type: 'percent', status: 'active' },
      { code: 'FREESHIP', discount: 99, type: 'flat', status: 'active' }
    ];
    return JSON.parse(localStorage.getItem('offkilt_coupons') || JSON.stringify(defaults));
  });
  const [newCoupon, setNewCoupon] = useState({ code: '', discount: '', type: 'percent', status: 'active' });

  const handleAddCoupon = (e) => {
    e.preventDefault();
    if (!newCoupon.code.trim() || !newCoupon.discount) return;
    const code = newCoupon.code.toUpperCase().trim();
    if (coupons.some(c => c.code === code)) {
      alert('Coupon code already exists');
      return;
    }
    const updated = [...coupons, { ...newCoupon, code, discount: Number(newCoupon.discount) }];
    setCoupons(updated);
    localStorage.setItem('offkilt_coupons', JSON.stringify(updated));
    setNewCoupon({ code: '', discount: '', type: 'percent', status: 'active' });
    triggerSync('offkilt_settings_updated');
  };

  const handleDeleteCoupon = (code) => {
    const updated = coupons.filter(c => c.code !== code);
    setCoupons(updated);
    localStorage.setItem('offkilt_coupons', JSON.stringify(updated));
    triggerSync('offkilt_settings_updated');
  };

  // --- 9. CUSTOMERS DATABASE ---
  const [customers, setCustomers] = useState(() => {
    const defaults = [
      { id: 1, name: 'Simran Kaur', email: 'simran.k@example.com', phone: '9876543210', address: 'Bandra West, Mumbai', wishlistCount: 3 },
      { id: 2, name: 'Rahul Sharma', email: 'rahul.s@example.com', phone: '8877665544', address: 'Vasant Kunj, Delhi', wishlistCount: 1 },
      { id: 3, name: 'Priya Desai', email: 'priya.d@example.com', phone: '9900112233', address: 'Koramangala, Bangalore', wishlistCount: 5 }
    ];
    return JSON.parse(localStorage.getItem('offkilt_users') || JSON.stringify(defaults));
  });
  const [customerSearch, setCustomerSearch] = useState('');

  // --- 10. SEO META TAGS ---
  const [seo, setSeo] = useState(() => {
    const defaults = {
      home: { title: 'off-kilt | Modern Heavyweight Denim & Street Edits', desc: 'Born from raw rebellion. Shop our asymmetrical carpenter jeans, premium paneled denim skirts, and street essentials.', keywords: 'off-kilt, raw denim, carpenter jeans, premium skirts' },
      catalog: { title: 'Shop Collections | off-kilt Selvedge Edits', desc: 'Browse the latest release of baggy, relaxed, bootcut and skinny fits from off-kilt. Free shipping across India.', keywords: 'off-kilt collections, selvedge denim' }
    };
    return JSON.parse(localStorage.getItem('offkilt_seo') || JSON.stringify(defaults));
  });

  const handleSeoSave = () => {
    localStorage.setItem('offkilt_seo', JSON.stringify(seo));
    triggerSync('offkilt_settings_updated');
    alert('SEO meta tags updated.');
  };

  // --- 11. MARKETPLACE SYNC ---
  const [marketplaces, setMarketplaces] = useState([
    { id: 'myntra', name: 'Myntra Fashion', status: 'Synced', lastSync: '15 mins ago', listings: 42, loading: false },
    { id: 'ajio', name: 'Ajio Luxe', status: 'Synced', lastSync: '2 hours ago', listings: 38, loading: false },
    { id: 'amazon', name: 'Amazon India', status: 'Pending Sync', lastSync: '1 day ago', listings: 50, loading: false },
    { id: 'flipkart', name: 'Flipkart Plus', status: 'Authentication Error', lastSync: '3 days ago', listings: 45, loading: false }
  ]);

  const handleMarketplaceSync = (id) => {
    setMarketplaces(prev => prev.map(m => m.id === id ? { ...m, loading: true } : m));
    setTimeout(() => {
      setMarketplaces(prev => prev.map(m => m.id === id ? { ...m, loading: false, status: 'Synced', lastSync: 'Just now' } : m));
    }, 2000);
  };

  // --- 12. AUDIT LOGS & SECURITY ---
  const [securityLogs, setSecurityLogs] = useState(() => {
    const defaults = [
      `[${new Date().toLocaleDateString('en-IN')} 13:42:10] Admin logged in from IP 192.168.1.5`,
      `[${new Date().toLocaleDateString('en-IN')} 12:15:33] Selvedge inventory automatic sync complete`,
      `[${new Date().toLocaleDateString('en-IN')} 10:04:19] Edited pricing parameters of item OKJ24201`,
      `[${new Date().toLocaleDateString('en-IN')} 08:30:00] Automated local storage system backup created`
    ];
    return JSON.parse(localStorage.getItem('offkilt_security_logs') || JSON.stringify(defaults));
  });
  const [twoFactor, setTwoFactor] = useState(false);

  // --- 13. BACKUPS MANAGER ---
  const handleExportBackup = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(localStorage));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute("href", dataStr);
    dlAnchor.setAttribute("download", `offkilt_backup_${Date.now()}.json`);
    dlAnchor.click();
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result);
          Object.keys(parsed).forEach(k => {
            if (k.startsWith('offkilt_')) {
              localStorage.setItem(k, parsed[k]);
            }
          });
          alert('Backup imported successfully! Page will refresh.');
          window.location.reload();
        } catch {
          alert('Failed to parse backup file.');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFactoryReset = () => {
    if (window.confirm('WARNING: This will wipe all orders, custom products, settings, and reviews! Reset store to factory settings?')) {
      localStorage.clear();
      alert('Local storage cleared. Refreshing page...');
      window.location.reload();
    }
  };

  // --- 14. ADMIN ROLES ---
  const [roles, setRoles] = useState(() => {
    const defaults = [
      { name: 'Rebel Admin', email: 'admin@off-kilt.com', role: 'Super Admin', permissions: 'Full Access' },
      { name: 'Priya Nair', email: 'priya@off-kilt.com', role: 'Catalog Manager', permissions: 'Write: Catalog, Content CMS' },
      { name: 'Sumit Sharma', email: 'sumit@off-kilt.com', role: 'Order Operator', permissions: 'Write: Orders, Shipments' }
    ];
    return JSON.parse(localStorage.getItem('offkilt_admin_roles') || JSON.stringify(defaults));
  });
  const [newAdmin, setNewAdmin] = useState({ name: '', email: '', role: 'Catalog Manager' });

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;
    const permissions = newAdmin.role === 'Super Admin' ? 'Full Access' : 
                        (newAdmin.role === 'Catalog Manager' ? 'Write: Catalog, Content CMS' : 'Write: Orders, Shipments');
    const updated = [...roles, { ...newAdmin, permissions }];
    setRoles(updated);
    localStorage.setItem('offkilt_admin_roles', JSON.stringify(updated));
    setNewAdmin({ name: '', email: '', role: 'Catalog Manager' });
  };

  // --- RENDERING TABS SIDEBAR ---
  const menuConfig = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Order Manager', icon: ShoppingBag },
    { id: 'campaigns', label: 'Campaign CMS', icon: Layout },
    { id: 'menus', label: 'Header Navigation', icon: List },
    { id: 'policies', label: 'CMS Policies', icon: FileText },
    { id: 'announcement', label: 'Announcement Bar', icon: Megaphone },
    { id: 'coupons', label: 'Coupon Builder', icon: Tag },
    { id: 'customers', label: 'Customer DB', icon: Users },
    { id: 'seo', label: 'SEO Tags', icon: Globe },
    { id: 'marketplace', label: 'Marketplace Sync', icon: RefreshCw },
    { id: 'logs', label: 'Security & Logs', icon: ShieldAlert },
    { id: 'backups', label: 'System Backups', icon: Database },
    { id: 'roles', label: 'Admin Roles', icon: UserCheck }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: '#fbfbf9',
      color: '#111111',
      zIndex: 9999,
      display: 'flex',
      fontFamily: 'var(--font-body)',
      overflow: 'hidden'
    }} data-lenis-prevent="true">
      
      {/* Sidebar navigation */}
      <div style={{
        width: '280px',
        backgroundColor: '#111111',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid rgba(255,255,255,0.05)',
        flexShrink: 0
      }}>
        {/* Sidebar Header */}
        <div style={{ padding: '30px 24px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '1.6rem', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '-1px' }}>off-kilt</h1>
          <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--accent-raw)', letterSpacing: '2px', fontWeight: 'bold' }}>REBEL COMMAND CENTER</span>
        </div>

        {/* Sidebar Tabs List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }} className="admin-sidebar-scroll">
          {menuConfig.map(m => {
            const Icon = m.icon;
            const isActive = activeTab === m.id;
            return (
              <button
                key={m.id}
                onClick={() => setActiveTab(m.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 16px',
                  borderRadius: '4px',
                  color: isActive ? '#ffffff' : 'rgba(255,255,255,0.6)',
                  backgroundColor: isActive ? 'var(--accent-raw)' : 'transparent',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.75rem',
                  letterSpacing: '1px',
                  textAlign: 'left',
                  textTransform: 'uppercase',
                  marginBottom: '4px',
                  transition: 'var(--transition-quick)'
                }}
              >
                <Icon size={16} />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sidebar Footer */}
        <div style={{ padding: '20px', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{currentUser?.name || 'Rebel Admin'}</div>
            <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.4)', wordBreak: 'break-all' }}>{currentUser?.email || 'admin@off-kilt.com'}</div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              padding: '8px',
              backgroundColor: 'rgba(255,255,255,0.05)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              transition: 'var(--transition-quick)'
            }}
            title="Exit Panel"
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        
        {/* Top bar header */}
        <div style={{
          height: '80px',
          backgroundColor: '#ffffff',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 40px',
          flexShrink: 0
        }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
              {menuConfig.find(m => m.id === activeTab)?.label}
            </h2>
            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
              SYSTEM LEVEL ADMINISTRATIVE COMMAND PANEL
            </span>
          </div>
          <button 
            onClick={onClose} 
            className="btn-secondary" 
            style={{ padding: '8px 16px', fontSize: '0.75rem', gap: '8px' }}
          >
            Exit Admin Center <X size={14} />
          </button>
        </div>

        {/* Dynamic Tab Body Container */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '40px', backgroundColor: '#fcfcf9' }}>
          
          {/* 1. ANALYTICS TABS */}
          {activeTab === 'analytics' && (
            <div>
              {/* Analytics metrics summary grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', marginBottom: '40px' }}>
                {[
                  { label: 'Total Revenue', value: `₹${analyticsData.totalSales.toLocaleString('en-IN')}`, rate: '+12.4% vs last week', icon: BarChart3, color: 'var(--accent-raw)' },
                  { label: 'Total Orders', value: analyticsData.totalOrders, rate: '+8% vs last week', icon: ShoppingBag, color: 'var(--accent-gold)' },
                  { label: 'Cart Abandonment', value: `${analyticsData.abandonmentRate}%`, rate: '-2.1% improvement', icon: AlertTriangle, color: '#ef4444' },
                  { label: 'Conversion Rate', value: `${analyticsData.conversionRate}%`, rate: '+0.5% optimization', icon: Globe, color: '#10b981' }
                ].map((card, i) => {
                  const Icon = card.icon;
                  return (
                    <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                        <span className="mono" style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{card.label}</span>
                        <div style={{ color: card.color }}><Icon size={18} /></div>
                      </div>
                      <div style={{ fontSize: '1.6rem', fontWeight: 700, fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>{card.value}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-grey)' }}>{card.rate}</div>
                    </div>
                  );
                })}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', alignItems: 'start' }}>
                {/* Sales Chart representation */}
                <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '24px', letterSpacing: '1px' }}>WEEKLY SALES PERFORMANCE</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '200px', paddingBottom: '10px' }}>
                    {analyticsData.weeklySales.map((w, i) => {
                      const pctHeight = (w.amount / 70000) * 100;
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '10%', height: '100%', justifyContent: 'flex-end' }}>
                          <div style={{ width: '100%', height: `${pctHeight}%`, backgroundColor: 'var(--accent-raw)', borderRadius: '2px', position: 'relative' }} title={`₹${w.amount}`}>
                            <div className="bar-hover-label" style={{ position: 'absolute', top: '-24px', left: '50%', transform: 'translateX(-50%)', fontSize: '0.6rem', backgroundColor: '#111111', color: '#ffffff', padding: '2px 4px', borderRadius: '2px', whiteSpace: 'nowrap', opacity: 0.8 }}>₹{w.amount/1000}k</div>
                          </div>
                          <span className="mono" style={{ fontSize: '0.65rem', marginTop: '10px', color: 'var(--text-muted)' }}>{w.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Fit distributions */}
                <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '0.9rem', marginBottom: '24px', letterSpacing: '1px' }}>FIT CATEGORIES BREAKDOWN</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {analyticsData.fitDistribution.map((f, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
                          <span style={{ fontWeight: 600 }}>{f.fit}</span>
                          <span className="mono" style={{ color: 'var(--text-muted)' }}>{f.pct}%</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: '#f0f0ed', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${f.pct}%`, height: '100%', backgroundColor: f.color }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Best sellers */}
              <div style={{ marginTop: '30px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>TOP SELLERS</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Product</th>
                      <th style={{ padding: '12px' }}>ID</th>
                      <th style={{ padding: '12px' }}>Quantity Sold</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsData.bestSellers.map((b, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                        <td style={{ padding: '12px', fontWeight: 600 }}>{b.name}</td>
                        <td className="mono" style={{ padding: '12px' }}>{b.id}</td>
                        <td style={{ padding: '12px' }}>{b.qty} units</td>
                        <td className="mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>₹{b.revenue.toLocaleString('en-IN')}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 2. PRODUCT CMS */}
          {activeTab === 'products' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              
              {/* Product catalog list */}
              <div>
                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1, position: 'relative' }}>
                    <input
                      type="text"
                      placeholder="Search inventory..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      style={{ width: '100%', padding: '10px 16px 10px 40px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', outline: 'none', fontSize: '0.8rem' }}
                    />
                    <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  </div>
                  <button 
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({
                        id: '', name: '', tagline: '', price: '', category: 'jeans',
                        image: '', hover_image: '', description: '', discountPrice: '',
                        stock: '50', sku: '', swatches: 'Raw Indigo:#1e293b, Charcoal Black:#111111',
                        sizes: ['30', '32', '34'],
                        images: []
                      });
                    }}
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} /> Clear Form
                  </button>
                </div>

                <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                  {productsLoading ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading items...</div>
                  ) : (
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                      <thead>
                        <tr style={{ backgroundColor: '#fcfcf9', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                          <th style={{ padding: '14px' }}>Item</th>
                          <th style={{ padding: '14px' }}>Category</th>
                          <th style={{ padding: '14px' }}>Price</th>
                          <th style={{ padding: '14px', textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {products
                          .filter(p => p.name.toLowerCase().includes(productSearch.toLowerCase()) || p.id.toLowerCase().includes(productSearch.toLowerCase()))
                          .map(p => (
                            <tr key={p.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                  <img src={p.image} alt={p.name} style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '2px' }} />
                                  <div>
                                    <div style={{ fontWeight: 600 }}>{p.name}</div>
                                    <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.id}</span>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px', textTransform: 'capitalize' }}>{p.category}</td>
                              <td style={{ padding: '12px', fontFamily: 'var(--font-mono)' }}>₹{p.price}</td>
                              <td style={{ padding: '12px', textAlign: 'right' }}>
                                <button onClick={() => handleEditProduct(p)} style={{ color: 'var(--accent-raw)', marginRight: '12px' }} title="Edit"><Edit2 size={14} /></button>
                                <button onClick={() => handleDeleteProduct(p.id)} style={{ color: '#ef4444' }} title="Delete"><Trash2 size={14} /></button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>

              {/* Product Form */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>
                  {editingProductId ? `EDIT PRODUCT: ${editingProductId}` : 'CREATE NEW PRODUCT'}
                </h3>
                <form onSubmit={handleProductSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Product ID (Unique)</label>
                      <input 
                        type="text" 
                        value={productForm.id} 
                        onChange={(e) => setProductForm({...productForm, id: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. OKJ24209"
                        disabled={!!editingProductId}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>SKU Code</label>
                      <input 
                        type="text" 
                        value={productForm.sku} 
                        onChange={(e) => setProductForm({...productForm, sku: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. OKJ-CARP-01"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Display Title</label>
                    <input 
                      type="text" 
                      value={productForm.name} 
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Price (INR)</label>
                      <input 
                        type="number" 
                        value={productForm.price} 
                        onChange={(e) => setProductForm({...productForm, price: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Sale Price (Optional)</label>
                      <input 
                        type="number" 
                        value={productForm.discountPrice} 
                        onChange={(e) => setProductForm({...productForm, discountPrice: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. 2499"
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Category</label>
                      <select 
                        value={productForm.category} 
                        onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff' }}
                      >
                        <option value="jeans">Men / Jeans</option>
                        <option value="skirts">Women / Skirts</option>
                        <option value="tops">Tops / Edits</option>
                        <option value="denim fits">Denim Fits</option>
                        <option value="new arrivals">New Arrivals</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Stock Count</label>
                      <input 
                        type="number" 
                        value={productForm.stock} 
                        onChange={(e) => setProductForm({...productForm, stock: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Tagline / Subtext</label>
                    <input 
                      type="text" 
                      value={productForm.tagline} 
                      onChange={(e) => setProductForm({...productForm, tagline: e.target.value})} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      placeholder="e.g. Asymmetric Raw Indigo Stitch"
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Color Swatches (Hex mappings)</label>
                    <input 
                      type="text" 
                      value={productForm.swatches} 
                      onChange={(e) => setProductForm({...productForm, swatches: e.target.value})} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      placeholder="e.g. Indigo:#2b4360, Slate:#64748b"
                    />
                  </div>

                  {/* Size Checklist */}
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Sizes Available</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                      {['28', '30', '32', '34', '36', 'XS', 'S', 'M', 'L', 'XL', 'Free Size'].map(sz => {
                        const hasSize = productForm.sizes.includes(sz);
                        return (
                          <label key={sz} style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={hasSize} 
                              onChange={() => {
                                const updated = hasSize 
                                  ? productForm.sizes.filter(s => s !== sz) 
                                  : [...productForm.sizes, sz];
                                setProductForm({...productForm, sizes: updated});
                              }}
                            />
                            {sz}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Multiple Product Images Gallery Manager */}
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>
                      Product Images Gallery
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                      {(productForm.images || []).map((imgUrl, idx) => (
                        <div key={idx} style={{ position: 'relative', width: '80px', height: '80px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.08)', overflow: 'hidden', backgroundColor: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <img src={imgUrl} alt={`Product image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(idx)}
                            style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239, 68, 68, 0.9)', color: '#ffffff', border: 'none', borderRadius: '50%', width: '18px', height: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 10 }}
                            title="Remove Image"
                          >
                            <Trash2 size={10} />
                          </button>
                          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, backgroundColor: 'rgba(0,0,0,0.6)', color: '#ffffff', fontSize: '0.55rem', textAlign: 'center', padding: '2px 0', fontFamily: 'var(--font-mono)' }}>
                            {idx === 0 ? 'Cover' : idx === 1 ? 'Hover' : `#${idx + 1}`}
                          </div>
                        </div>
                      ))}
                      
                      <label style={{ width: '80px', height: '80px', border: '1px dashed var(--accent-raw)', borderRadius: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'rgba(249, 115, 22, 0.02)', gap: '4px' }} className="add-img-btn">
                        <UploadCloud size={18} style={{ color: 'var(--accent-raw)' }} />
                        <span style={{ fontSize: '0.6rem', color: 'var(--accent-raw)', fontWeight: 600 }}>Add Image</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          multiple 
                          onChange={handleMultipleImagesUpload} 
                          style={{ display: 'none' }} 
                        />
                      </label>
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', display: 'block', marginBottom: '10px' }}>
                      * Add multiple images. First image is the main Cover, second is the Hover view.
                    </span>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Product Description</label>
                    <textarea 
                      value={productForm.description} 
                      onChange={(e) => setProductForm({...productForm, description: e.target.value})} 
                      rows="3" 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical' }}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '10px' }}>
                    <Save size={16} /> Save Product to Catalog
                  </button>
                </form>
              </div>

            </div>
          )}

          {/* 3. ORDER MANAGER */}
          {activeTab === 'orders' && (
            <div>
              {/* Order Search & List */}
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search by Order ID or email..."
                    value={orderSearch}
                    onChange={(e) => setOrderSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 40px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', outline: 'none', fontSize: '0.8rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfcf9', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px' }}>Order ID</th>
                      <th style={{ padding: '14px' }}>Customer Email</th>
                      <th style={{ padding: '14px' }}>Method</th>
                      <th style={{ padding: '14px' }}>Status</th>
                      <th style={{ padding: '14px' }}>Tracking Number</th>
                      <th style={{ padding: '14px' }}>Total</th>
                      <th style={{ padding: '14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => {
                        const oid = (o.id || o.orderId || '').toString().toLowerCase();
                        const oemail = (o.email || '').toString().toLowerCase();
                        const term = orderSearch.toLowerCase();
                        return oid.includes(term) || oemail.includes(term);
                      })
                      .map(o => {
                        const orderId = o.id || o.orderId;
                        return (
                          <tr key={orderId} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                            <td className="mono" style={{ padding: '12px', fontWeight: 600 }}>{orderId}</td>
                            <td style={{ padding: '12px' }}>
                              <div>{o.email || 'guest@off-kilt.com'}</div>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{o.date || (o.created_at ? new Date(o.created_at).toLocaleDateString('en-IN') : '')}</span>
                            </td>
                            <td style={{ padding: '12px', fontSize: '0.75rem' }}>{o.payment_method || 'Razorpay Prepaid'}</td>
                            <td style={{ padding: '12px' }}>
                              <select 
                                value={o.status}
                                onChange={(e) => updateOrderStatus(orderId, e.target.value)}
                                style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff' }}
                              >
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                            </td>
                            <td style={{ padding: '12px' }}>
                              <form 
                                onSubmit={(e) => {
                                  e.preventDefault();
                                  updateOrderTracking(orderId, e.target.elements.trackNum.value);
                                }}
                                style={{ display: 'flex', gap: '4px' }}
                              >
                                <input 
                                  type="text" 
                                  name="trackNum"
                                  defaultValue={o.tracking_number || ''}
                                  placeholder="Tracking No."
                                  style={{ padding: '4px', fontSize: '0.7rem', width: '120px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                                />
                                <button type="submit" style={{ padding: '4px 8px', backgroundColor: 'var(--accent-raw)', color: '#ffffff', borderRadius: '2px', fontSize: '0.65rem' }}>Save</button>
                              </form>
                            </td>
                            <td className="mono" style={{ padding: '12px', fontWeight: 'bold' }}>₹{o.total?.toLocaleString('en-IN')}</td>
                            <td style={{ padding: '12px', textAlign: 'right' }}>
                              <button 
                                onClick={() => {
                                  setSelectedOrder(o);
                                  setInvoiceModalOpen(true);
                                }} 
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--accent-gold)', fontWeight: 600, fontSize: '0.75rem' }}
                              >
                                <Eye size={12} /> Invoice
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. CAMPAIGN CMS */}
          {activeTab === 'campaigns' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
              {/* Men's campaign configuration */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>MEN'S CAMPAIGN CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Title</label>
                    <input 
                      type="text" 
                      value={campaigns.men.title} 
                      onChange={(e) => handleCampaignSave('men', { ...campaigns.men, title: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Subtitle</label>
                    <textarea 
                      value={campaigns.men.subtitle} 
                      onChange={(e) => handleCampaignSave('men', { ...campaigns.men, subtitle: e.target.value })} 
                      rows="2"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    ></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>CTA Button Label</label>
                    <input 
                      type="text" 
                      value={campaigns.men.ctaText} 
                      onChange={(e) => handleCampaignSave('men', { ...campaigns.men, ctaText: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Cover Banner</label>
                    <div style={{ position: 'relative', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '2px', padding: '16px', textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <input type="file" accept="image/*" onChange={(e) => handleCampaignImageUpload('men', e.target.files?.[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      {campaigns.men.image ? (
                        <img src={campaigns.men.image} alt="Men Preview" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload Men's Campaign Image</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Women's campaign configuration */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>WOMEN'S CAMPAIGN CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Title</label>
                    <input 
                      type="text" 
                      value={campaigns.women.title} 
                      onChange={(e) => handleCampaignSave('women', { ...campaigns.women, title: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Subtitle</label>
                    <textarea 
                      value={campaigns.women.subtitle} 
                      onChange={(e) => handleCampaignSave('women', { ...campaigns.women, subtitle: e.target.value })} 
                      rows="2"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    ></textarea>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>CTA Button Label</label>
                    <input 
                      type="text" 
                      value={campaigns.women.ctaText} 
                      onChange={(e) => handleCampaignSave('women', { ...campaigns.women, ctaText: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Cover Banner</label>
                    <div style={{ position: 'relative', border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '2px', padding: '16px', textAlign: 'center', height: '140px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                      <input type="file" accept="image/*" onChange={(e) => handleCampaignImageUpload('women', e.target.files?.[0])} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                      {campaigns.women.image ? (
                        <img src={campaigns.women.image} alt="Women Preview" style={{ maxHeight: '100%', objectFit: 'contain' }} />
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Upload Women's Campaign Image</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 5. NAVIGATION LINKS */}
          {activeTab === 'menus' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>HEADER NAVIGATION MENU MANAGER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {menuItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 100px', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '2px', backgroundColor: '#fcfcf9' }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Menu Label</label>
                      <input 
                        type="text" 
                        value={item.label} 
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].label = e.target.value;
                          setMenuItems(items);
                        }}
                        style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Target Section / Anchor</label>
                      <input 
                        type="text" 
                        value={item.link} 
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].link = e.target.value;
                          setMenuItems(items);
                        }}
                        style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Category Filter</label>
                      <input 
                        type="text" 
                        value={item.category || ''} 
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].category = e.target.value || undefined;
                          setMenuItems(items);
                        }}
                        style={{ padding: '6px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                        placeholder="e.g. jeans (optional)"
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Visible</label>
                      <input 
                        type="checkbox" 
                        checked={item.visible} 
                        onChange={(e) => {
                          const items = [...menuItems];
                          items[index].visible = e.target.checked;
                          setMenuItems(items);
                        }}
                      />
                    </div>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button onClick={handleMenuSave} className="btn-primary">
                    <Save size={16} /> Save Navigation Changes
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 6. CMS POLICIES & FAQS */}
          {activeTab === 'policies' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '14px', letterSpacing: '1px' }}>REFUND & RETURN POLICY</h3>
                <textarea 
                  value={policies.refund} 
                  onChange={(e) => setPolicies({ ...policies, refund: e.target.value })} 
                  rows="4"
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                ></textarea>
              </div>

              <div>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '14px', letterSpacing: '1px' }}>TERMS & CONDITIONS</h3>
                <textarea 
                  value={policies.terms} 
                  onChange={(e) => setPolicies({ ...policies, terms: e.target.value })} 
                  rows="4"
                  style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                ></textarea>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h3 style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>FAQS DATABASE</h3>
                  <button 
                    onClick={() => {
                      const updated = [...policies.faqs, { q: 'New Question', a: 'New Answer' }];
                      setPolicies({ ...policies, faqs: updated });
                    }}
                    style={{ fontSize: '0.75rem', textDecoration: 'underline', color: 'var(--accent-raw)', fontWeight: 'bold' }}
                  >
                    + Add FAQ
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {policies.faqs.map((faq, idx) => (
                    <div key={idx} style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '16px', borderRadius: '4px', backgroundColor: '#fcfcf9', position: 'relative' }}>
                      <button 
                        onClick={() => {
                          const updated = policies.faqs.filter((_, i) => i !== idx);
                          setPolicies({ ...policies, faqs: updated });
                        }}
                        style={{ position: 'absolute', right: '12px', top: '12px', color: '#ef4444' }}
                        title="Delete FAQ"
                      >
                        <Trash2 size={14} />
                      </button>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '90%' }}>
                        <input 
                          type="text" 
                          value={faq.q} 
                          onChange={(e) => {
                            const updated = [...policies.faqs];
                            updated[idx].q = e.target.value;
                            setPolicies({ ...policies, faqs: updated });
                          }}
                          style={{ fontWeight: 600, fontSize: '0.8rem', padding: '6px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        />
                        <textarea 
                          value={faq.a} 
                          onChange={(e) => {
                            const updated = [...policies.faqs];
                            updated[idx].a = e.target.value;
                            setPolicies({ ...policies, faqs: updated });
                          }}
                          rows="2"
                          style={{ fontSize: '0.75rem', padding: '6px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        ></textarea>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={handlePoliciesSave} className="btn-primary">
                  <Save size={16} /> Save Policies &amp; FAQs
                </button>
              </div>
            </div>
          )}

          {/* 7. ANNOUNCEMENT BAR */}
          {activeTab === 'announcement' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>ANNOUNCEMENT MARQUEE CONTROLS</h3>
              <form onSubmit={handleAnnBarSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <input 
                    type="checkbox" 
                    id="showAnnCheck"
                    checked={annBar.show} 
                    onChange={(e) => setAnnBar({ ...annBar, show: e.target.checked })} 
                  />
                  <label htmlFor="showAnnCheck" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Enable announcement bar at top of site</label>
                </div>

                <div>
                  <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Marquee Ticker Text</label>
                  <input 
                    type="text" 
                    value={annBar.text} 
                    onChange={(e) => setAnnBar({ ...annBar, text: e.target.value })} 
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Background Color (Hex)</label>
                    <input 
                      type="text" 
                      value={annBar.bg} 
                      onChange={(e) => setAnnBar({ ...annBar, bg: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Text / Link Color (Hex)</label>
                    <input 
                      type="text" 
                      value={annBar.color} 
                      onChange={(e) => setAnnBar({ ...annBar, color: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    <Save size={16} /> Save Banner Configurations
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* 8. COUPONS BUILDER */}
          {activeTab === 'coupons' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              {/* Coupons List */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>ACTIVE CAMPAIGN PROMOTIONS</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Promo Code</th>
                      <th style={{ padding: '12px' }}>Discount Value</th>
                      <th style={{ padding: '12px' }}>Type</th>
                      <th style={{ padding: '12px' }}>Status</th>
                      <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {coupons.map((c, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                        <td className="mono" style={{ padding: '12px', fontWeight: 600 }}>{c.code}</td>
                        <td className="mono" style={{ padding: '12px' }}>{c.discount}{c.type === 'percent' ? '%' : ' INR'}</td>
                        <td style={{ padding: '12px', textTransform: 'capitalize' }}>{c.type}</td>
                        <td style={{ padding: '12px' }}>
                          <span style={{ fontSize: '0.65rem', padding: '2px 6px', borderRadius: '2px', backgroundColor: c.status === 'active' ? '#dcfce7' : '#fee2e2', color: c.status === 'active' ? '#166534' : '#991b1b', fontWeight: 600 }}>
                            {c.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <button onClick={() => handleDeleteCoupon(c.code)} style={{ color: '#ef4444' }} title="Delete Code">
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add Coupon Form */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>CREATE NEW COUPON</h3>
                <form onSubmit={handleAddCoupon} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Coupon Code</label>
                    <input 
                      type="text" 
                      value={newCoupon.code} 
                      onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value })} 
                      placeholder="e.g. MONSOON25"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', textTransform: 'uppercase' }}
                      required
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Discount Value</label>
                      <input 
                        type="number" 
                        value={newCoupon.discount} 
                        onChange={(e) => setNewCoupon({ ...newCoupon, discount: e.target.value })} 
                        placeholder="e.g. 20"
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Reduction Type</label>
                      <select 
                        value={newCoupon.type} 
                        onChange={(e) => setNewCoupon({ ...newCoupon, type: e.target.value })}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                      >
                        <option value="percent">Percent Discount (%)</option>
                        <option value="flat">Flat Cash Deduct (INR)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Initial Status</label>
                    <select 
                      value={newCoupon.status} 
                      onChange={(e) => setNewCoupon({ ...newCoupon, status: e.target.value })}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      <option value="active">Active &amp; Redeemable</option>
                      <option value="inactive">Disabled / Expired</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    <Plus size={16} /> Add Promo Code
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 9. CUSTOMERS DATABASE */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <div style={{ flex: 1, position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Search users database..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    style={{ width: '100%', padding: '10px 16px 10px 40px', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', outline: 'none', fontSize: '0.8rem' }}
                  />
                  <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfcf9', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px' }}>Name / User ID</th>
                      <th style={{ padding: '14px' }}>Email Address</th>
                      <th style={{ padding: '14px' }}>Mobile Phone</th>
                      <th style={{ padding: '14px' }}>Shipping Address</th>
                      <th style={{ padding: '14px', textAlign: 'right' }}>Wishlist Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(c => c.name.toLowerCase().includes(customerSearch.toLowerCase()) || c.email.toLowerCase().includes(customerSearch.toLowerCase()))
                      .map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>#USER00{c.id}</span>
                          </td>
                          <td style={{ padding: '12px' }}>{c.email}</td>
                          <td style={{ padding: '12px' }}>{c.phone || '+91 - N/A'}</td>
                          <td style={{ padding: '12px', fontSize: '0.75rem', maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.address || 'N/A'}</td>
                          <td className="mono" style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', color: 'var(--accent-raw)' }}>
                            {c.wishlistCount || 0} items
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 10. SEO META TAGS */}
          {activeTab === 'seo' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <h3 style={{ fontSize: '0.85rem', marginBottom: '14px', letterSpacing: '1px', color: 'var(--accent-raw)' }}>HOMEPAGE SEO CONFIG</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={seo.home.title} 
                    onChange={(e) => setSeo({ ...seo, home: { ...seo.home, title: e.target.value } })} 
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Meta Title"
                  />
                  <textarea 
                    value={seo.home.desc} 
                    onChange={(e) => setSeo({ ...seo, home: { ...seo.home, desc: e.target.value } })} 
                    rows="2"
                    style={{ padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Meta Description"
                  ></textarea>
                  <input 
                    type="text" 
                    value={seo.home.keywords} 
                    onChange={(e) => setSeo({ ...seo, home: { ...seo.home, keywords: e.target.value } })} 
                    style={{ padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Keywords (comma separated)"
                  />
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '0.85rem', marginBottom: '14px', letterSpacing: '1px', color: 'var(--accent-raw)' }}>COLLECTIONS CATALOG SEO CONFIG</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <input 
                    type="text" 
                    value={seo.catalog.title} 
                    onChange={(e) => setSeo({ ...seo, catalog: { ...seo.catalog, title: e.target.value } })} 
                    style={{ padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Meta Title"
                  />
                  <textarea 
                    value={seo.catalog.desc} 
                    onChange={(e) => setSeo({ ...seo, catalog: { ...seo.catalog, desc: e.target.value } })} 
                    rows="2"
                    style={{ padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Meta Description"
                  ></textarea>
                  <input 
                    type="text" 
                    value={seo.catalog.keywords} 
                    onChange={(e) => setSeo({ ...seo, catalog: { ...seo.catalog, keywords: e.target.value } })} 
                    style={{ padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    placeholder="Keywords (comma separated)"
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button onClick={handleSeoSave} className="btn-primary">
                  <Save size={16} /> Save SEO Tag settings
                </button>
              </div>
            </div>
          )}

          {/* 11. MARKETPLACE SYNC */}
          {activeTab === 'marketplace' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {marketplaces.map((m, i) => (
                  <div key={i} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '0.85rem' }}>{m.name}</h4>
                      <RefreshCw size={16} style={{ color: 'var(--text-muted)' }} />
                    </div>
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', marginBottom: '4px' }}>
                        <span>Status:</span>
                        <span style={{ 
                          fontWeight: 'bold', 
                          color: m.status === 'Synced' ? '#166534' : (m.status === 'Pending Sync' ? '#854d0e' : '#991b1b') 
                        }}>
                          {m.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        Last Updated: {m.lastSync}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-grey)', marginTop: '4px' }}>
                        Active Listings: {m.listings} products
                      </div>
                    </div>

                    <button
                      onClick={() => handleMarketplaceSync(m.id)}
                      disabled={m.loading}
                      style={{
                        width: '100%',
                        padding: '8px',
                        fontSize: '0.75rem',
                        backgroundColor: 'var(--accent)',
                        color: '#ffffff',
                        fontFamily: 'var(--font-mono)',
                        textTransform: 'uppercase',
                        borderRadius: '2px',
                        cursor: m.loading ? 'default' : 'pointer',
                        opacity: m.loading ? 0.6 : 1
                      }}
                    >
                      {m.loading ? 'Syncing Catalog...' : 'Sync Catalog Now'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 12. AUDIT LOGS & SECURITY */}
          {activeTab === 'logs' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              {/* Audit logs */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>ADMIN SECURITY &amp; EVENT LOGS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }} className="admin-sidebar-scroll">
                  {securityLogs.map((log, idx) => (
                    <div key={idx} className="mono" style={{ fontSize: '0.7rem', padding: '8px 12px', borderBottom: '1px solid rgba(0,0,0,0.03)', color: 'var(--text-grey)', wordBreak: 'break-all' }}>
                      {log}
                    </div>
                  ))}
                </div>
              </div>

              {/* Security parameters */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>SECURITY CONSTRAINTS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>SSL Encryption Status</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Secure TLS 1.3 tunnels active</div>
                    </div>
                    <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: '10px', backgroundColor: '#dcfce7', color: '#166534', fontWeight: 600 }}>ENFORCED</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid rgba(0,0,0,0.04)' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 600 }}>2-Factor Authentication (2FA)</div>
                      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Require OTP to login to Admin panel</div>
                    </div>
                    <button 
                      onClick={() => {
                        setTwoFactor(!twoFactor);
                        alert(`2-Factor Authentication has been ${!twoFactor ? 'enabled' : 'disabled'}.`);
                      }}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '2px',
                        fontSize: '0.7rem',
                        backgroundColor: twoFactor ? '#166534' : 'rgba(0,0,0,0.06)',
                        color: twoFactor ? '#ffffff' : '#111111',
                        fontWeight: 'bold'
                      }}
                    >
                      {twoFactor ? 'ENABLED' : 'DISABLED'}
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Session Timeout Limit</label>
                    <select style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}>
                      <option value="15">15 Minutes</option>
                      <option value="30">30 Minutes</option>
                      <option value="60">1 Hour</option>
                      <option value="never">Never (Persistent)</option>
                    </select>
                  </div>

                </div>
              </div>
            </div>
          )}

          {/* 13. SYSTEM BACKUPS */}
          {activeTab === 'backups' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '16px', letterSpacing: '1px' }}>DATABASE EXPORT &amp; FACTORY RESET</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', marginBottom: '24px' }}>
                Manage local client state database configurations. Save or import JSON files to sync inventories.
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
                <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                  <Download size={28} style={{ color: 'var(--accent-raw)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Export DB State</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Download JSON file containing all settings and products.</p>
                  <button onClick={handleExportBackup} className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>Download Backup</button>
                </div>

                <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px', textAlign: 'center', position: 'relative' }}>
                  <Upload size={28} style={{ color: 'var(--accent-gold)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Import DB State</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Upload a valid off-kilt JSON database to restore states.</p>
                  <input type="file" accept=".json" onChange={handleImportBackup} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
                  <button className="btn-secondary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px' }}>Upload File</button>
                </div>

                <div style={{ padding: '20px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px', textAlign: 'center' }}>
                  <AlertTriangle size={28} style={{ color: '#ef4444', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Factory Reset</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Wipe all changes and restore original defaults.</p>
                  <button onClick={handleFactoryReset} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', backgroundColor: '#ef4444', color: '#ffffff' }}>Reset Storage</button>
                </div>
              </div>
            </div>
          )}

          {/* 14. ADMIN ROLES */}
          {activeTab === 'roles' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
              {/* Roles Table */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>ADMINISTRATOR ACCOUNTS</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '12px' }}>Name</th>
                      <th style={{ padding: '12px' }}>Role</th>
                      <th style={{ padding: '12px' }}>System Permissions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {roles.map((r, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(0,0,0,0.02)' }}>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 600 }}>{r.name}</div>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.email}</span>
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className="mono" style={{ fontSize: '0.7rem', color: r.role === 'Super Admin' ? 'var(--accent-raw)' : 'var(--text-light)' }}>{r.role}</span>
                        </td>
                        <td style={{ padding: '12px', fontSize: '0.75rem', color: 'var(--text-grey)' }}>{r.permissions}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add admin form */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>ADD ACCESS OPERATOR</h3>
                <form onSubmit={handleAddAdmin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Full Name</label>
                    <input 
                      type="text" 
                      value={newAdmin.name} 
                      onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Email Address</label>
                    <input 
                      type="email" 
                      value={newAdmin.email} 
                      onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      required
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Assigned Tier</label>
                    <select 
                      value={newAdmin.role} 
                      onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value })}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      <option value="Catalog Manager">Catalog Manager (Write Products &amp; Content)</option>
                      <option value="Order Operator">Order Operator (Manage Shipment Tracking)</option>
                      <option value="Super Admin">Super Admin (Full Permission Privileges)</option>
                    </select>
                  </div>

                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center' }}>
                    <Plus size={16} /> Register Admin User
                  </button>
                </form>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* --- INVOICE GENERATOR PRINT MODAL PANEL --- */}
      {invoiceModalOpen && selectedOrder && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            width: '100%',
            maxWidth: '800px',
            borderRadius: '4px',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '90vh',
            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
          }}>
            {/* Invoice Top Actions */}
            <div style={{
              padding: '16px 30px',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }} className="no-print">
              <span className="mono" style={{ fontWeight: 'bold' }}>Simulated Invoice Generator</span>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={handlePrintInvoice} className="btn-primary" style={{ padding: '6px 14px', fontSize: '0.75rem', gap: '6px' }}>
                  <Printer size={14} /> Print Invoice
                </button>
                <button onClick={() => { setSelectedOrder(null); setInvoiceModalOpen(false); }} className="btn-secondary" style={{ padding: '6px 14px', fontSize: '0.75rem' }}>
                  Close
                </button>
              </div>
            </div>

            {/* Print Area */}
            <div style={{
              padding: '40px',
              overflowY: 'auto',
              color: '#111111',
              fontFamily: 'var(--font-mono)',
              lineHeight: 1.4
            }} id="print-area">
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #111111', paddingBottom: '20px', marginBottom: '30px' }}>
                <div>
                  <h1 style={{ fontFamily: 'var(--font-brand)', fontSize: '2.5rem', fontWeight: 700, textTransform: 'lowercase', letterSpacing: '-1.5px', margin: 0 }}>off-kilt</h1>
                  <p style={{ fontSize: '0.65rem', color: '#555555', marginTop: '4px' }}>MŌ-DISH // DENIM REBELS</p>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
                  <h3 style={{ margin: 0, fontSize: '0.9rem' }}>TAX INVOICE</h3>
                  <p>Order ID: {selectedOrder.id}</p>
                  <p>Date: {selectedOrder.date}</p>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', fontSize: '0.75rem', marginBottom: '4px' }}>
                <div>
                  <h4 style={{ textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Sold By:</h4>
                  <p><strong>off-kilt Fashion Ltd.</strong></p>
                  <p>Selvedge Warehouse &amp; HQ</p>
                  <p>Mumbai, MH, Pincode 400001</p>
                  <p>GSTIN: 27AAHCO8820L1ZA</p>
                </div>
                <div>
                  <h4 style={{ textTransform: 'uppercase', marginBottom: '8px', borderBottom: '1px solid #ddd', paddingBottom: '4px' }}>Billing / Shipping Address:</h4>
                  <p>{selectedOrder.email}</p>
                  <p>Phone: {selectedOrder.phone}</p>
                  <p style={{ whiteSpace: 'pre-line' }}>{selectedOrder.shipping_address}</p>
                </div>
              </div>

              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', margin: '40px 0' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #111111', borderTop: '2px solid #111111', textAlign: 'left', fontWeight: 'bold' }}>
                    <th style={{ padding: '8px 0' }}>Item Description</th>
                    <th style={{ padding: '8px 0' }}>Size</th>
                    <th style={{ padding: '8px 0', textAlign: 'center' }}>Qty</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Price</th>
                    <th style={{ padding: '8px 0', textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedOrder.items?.map((item, index) => (
                    <tr key={index} style={{ borderBottom: '1px solid #eee' }}>
                      <td style={{ padding: '10px 0' }}>
                        <div>{item.name}</div>
                        <span style={{ fontSize: '0.65rem', color: '#555555' }}>ID: {item.id}</span>
                      </td>
                      <td style={{ padding: '10px 0' }}>{item.selectedSize || 'FREE'}</td>
                      <td style={{ padding: '10px 0', textAlign: 'center' }}>{item.quantity}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{item.price.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '10px 0', textAlign: 'right' }}>₹{(item.price * item.quantity).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.75rem' }}>
                <div style={{ width: '320px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Subtotal:</span>
                    <span>₹{selectedOrder.subtotal?.toLocaleString('en-IN')}</span>
                  </div>
                  
                  {selectedOrder.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#166534' }}>
                      <span>Discount ({selectedOrder.coupon_code}):</span>
                      <span>-₹{selectedOrder.discount.toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0' }}>
                    <span>Shipping Charges:</span>
                    <span>{selectedOrder.shipping_fee === 0 ? 'FREE' : `₹${selectedOrder.shipping_fee}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555555', fontSize: '0.7rem' }}>
                    <span>Included IGST (12%):</span>
                    <span>₹{Math.round((selectedOrder.total || selectedOrder.subtotal) - ((selectedOrder.total || selectedOrder.subtotal) / 1.12)).toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px double #111111', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '10px' }}>
                    <span>Grand Total:</span>
                    <span>₹{selectedOrder.total?.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ marginTop: '60px', borderTop: '1px solid #eee', paddingTop: '20px', textAlign: 'center', fontSize: '0.65rem', color: '#555555' }}>
                <p>This is a computer-generated tax invoice and does not require a physical signature.</p>
                <p>Thank you for shopping with off-kilt. Keep it raw.</p>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* CSS print override styles for printing invoices */}
      <style dangerouslySetInnerHTML={{__html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #print-area, #print-area * {
            visibility: visible;
          }
          #print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}} />

    </div>
  );
}
