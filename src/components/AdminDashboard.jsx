import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit2, Trash2, Save, Image as ImageIcon, UploadCloud, 
  BarChart3, Package, ShoppingBag, Layout, List, FileText, Megaphone, 
  Tag, Users, Globe, RefreshCw, ShieldAlert, Database, UserCheck, 
  Download, Upload, Search, Check, AlertTriangle, Eye, Printer,
  Type, Share2, Phone, MapPin, HelpCircle, Layers, CreditCard, Key, ShieldCheck, Zap
} from 'lucide-react';
import { products as productsApi, admin as adminApi } from '../services/api';

// Helper component for Q&A Manager row
function QnaItemRow({ q, prodId, onSaveAnswer, onDelete }) {
  const [ansText, setAnsText] = useState(q.answer || '');
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr auto', gap: '16px', alignItems: 'flex-start', padding: '12px', background: '#fcfcf9', borderRadius: '2px', border: '1px solid rgba(0,0,0,0.02)' }}>
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>QUESTION ({q.date})</div>
        <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#111111' }}>{q.question}</p>
      </div>
      <div>
        <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)', marginBottom: '4px' }}>ADMIN REPLY</div>
        <textarea 
          value={ansText}
          onChange={(e) => setAnsText(e.target.value)}
          placeholder="Type your reply here..."
          rows="2"
          style={{ width: '100%', padding: '6px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', resize: 'vertical' }}
        />
      </div>
      <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
        <button 
          onClick={() => onSaveAnswer(prodId, q.id, ansText)}
          className="btn-primary"
          style={{ padding: '8px 12px', fontSize: '0.65rem', fontFamily: 'var(--font-mono)', width: 'auto' }}
        >
          SAVE
        </button>
        <button 
          onClick={() => onDelete(prodId, q.id)}
          style={{
            padding: '8px',
            color: '#ef4444',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: '2px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fff5f5',
            cursor: 'pointer'
          }}
          title="Delete Question"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}

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
      // Use admin endpoint to get ALL products (including inactive)
      const res = await adminApi.getAllProducts();
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
      mediaUrl: '',
      mediaType: 'video', // 'video' | 'image'
      word1: 'FASHION',
      word2: 'WITHOUT',
      word3: 'LIMITS',
      btn1Text: 'SHOP WOMEN',
      btn2Text: 'SHOP MEN',
      btn1Link: '#catalog',
      btn2Link: '#catalog',
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

  // --- Q&A CMS ---
  const [qnaProducts, setQnaProducts] = useState({});
  useEffect(() => {
    const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
    setQnaProducts(allQna);
  }, []);

  const handleSaveAnswer = (productId, qnaId, answerText) => {
    const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
    const prodQnas = allQna[productId] || [];
    const updated = prodQnas.map(q => q.id === qnaId ? { ...q, answer: answerText } : q);
    allQna[productId] = updated;
    localStorage.setItem('offkilt_product_qna', JSON.stringify(allQna));
    setQnaProducts(allQna);
    window.dispatchEvent(new Event('offkilt_qna_updated'));
    alert('Answer saved successfully!');
  };

  const handleDeleteQuestion = (productId, qnaId) => {
    if (!window.confirm('Are you sure you want to delete this question?')) return;
    const allQna = JSON.parse(localStorage.getItem('offkilt_product_qna') || '{}');
    const prodQnas = allQna[productId] || [];
    const updated = prodQnas.filter(q => q.id !== qnaId);
    allQna[productId] = updated;
    localStorage.setItem('offkilt_product_qna', JSON.stringify(allQna));
    setQnaProducts(allQna);
    window.dispatchEvent(new Event('offkilt_qna_updated'));
    alert('Question deleted.');
  };

  // --- Instagram Gallery CMS ---
  const [igGallery, setIgGallery] = useState(() => {
    const defaults = [
      { id: 'ig1', src: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85', likes: '4.2K', featured: true },
      { id: 'ig2', src: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85', likes: '2.1K' },
      { id: 'ig3', src: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=500&q=85', likes: '1.8K' },
      { id: 'ig4', src: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=500&q=85', likes: '3.3K' },
      { id: 'ig5', src: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=500&q=85', likes: '5.7K' },
      { id: 'ig6', src: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=500&q=85', likes: '987' },
      { id: 'ig7', src: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=500&q=85', likes: '1.4K' },
      { id: 'ig8', src: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=500&q=85', likes: '2.9K' },
      { id: 'ig9', src: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&q=85', likes: '1.2K' }
    ];
    return JSON.parse(localStorage.getItem('offkilt_instagram_gallery')) || defaults;
  });

  const handleSaveIgGallery = () => {
    localStorage.setItem('offkilt_instagram_gallery', JSON.stringify(igGallery));
    window.dispatchEvent(new Event('offkilt_instagram_updated'));
    alert('Instagram Gallery saved!');
  };

  const handleAddIgItem = () => {
    setIgGallery([...igGallery, { id: `ig-${Date.now()}`, src: '', likes: '0', featured: false }]);
  };

  const handleDeleteIgItem = (id) => {
    setIgGallery(igGallery.filter(item => item.id !== id));
  };

  // --- Fashion Film CMS ---
  const [fashionFilm, setFashionFilm] = useState(() => {
    const defaults = {
      title: 'Style That Moves You',
      quote: '"Confidence in every stitch. Elegance in every move."',
      videoUrl: ''
    };
    return JSON.parse(localStorage.getItem('offkilt_fashion_film')) || defaults;
  });

  const handleFashionFilmSave = () => {
    localStorage.setItem('offkilt_fashion_film', JSON.stringify(fashionFilm));
    window.dispatchEvent(new Event('offkilt_fashion_film_updated'));
    alert('Fashion Film settings saved!');
  };

  // --- Narrative (BrandStory) CMS ---
  const [narrative, setNarrative] = useState(() => {
    const defaults = {
      title: 'REDEFINING DENIM FROM THE SOUL',
      body1: 'Born from the spirit of rebellion and self-expression, off-kilt challenges the ordinary and redefines modern denim. We create pieces that break away from tradition—clean yet bold, minimal yet impactful.',
      quote: '"We don\'t create for the masses. We build for the individual who stands solid in their own skin."',
      body2: 'Rooted in contemporary design and crafted with precision, our collections blend structure with individuality. Every stitch speaks confidence, every silhouette tells a story. This is for those who don’t follow trends—they set them.',
      image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800'
    };
    return JSON.parse(localStorage.getItem('offkilt_brand_story')) || defaults;
  });

  const handleNarrativeSave = () => {
    localStorage.setItem('offkilt_brand_story', JSON.stringify(narrative));
    triggerSync('offkilt_settings_updated');
    alert('Narrative settings saved!');
  };

  // --- Collections CMS ---
  const [homepageCollections, setHomepageCollections] = useState(() => {
    const defaults = {
      bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      bestSellersTitle: 'Best Sellers',
      trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
      trendingTitle: 'Trending Collection',
      styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
      styleTitle: 'Shop By Style'
    };
    return JSON.parse(localStorage.getItem('offkilt_homepage_collections')) || defaults;
  });

  const handleCollectionsSave = () => {
    localStorage.setItem('offkilt_homepage_collections', JSON.stringify(homepageCollections));
    triggerSync('offkilt_settings_updated');
    alert('Homepage Collections saved!');
  };

  // --- Category List CMS ---
  const [categoryList, setCategoryList] = useState(() => {
    const defaults = ['all', 'jeans', 'skirts', 'cargos', 'shirts'];
    return JSON.parse(localStorage.getItem('offkilt_categories_list')) || defaults;
  });

  const handleCategoriesSave = () => {
    localStorage.setItem('offkilt_categories_list', JSON.stringify(categoryList));
    triggerSync('offkilt_settings_updated');
    alert('Category list saved!');
  };

  // --- NAVIGATION / MENUS CONTROL ---
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

  const handleAddMenuItem = () => {
    setMenuItems([...menuItems, { label: 'New Item', link: '#catalog', visible: true }]);
  };

  const handleDeleteMenuItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  // --- NEW CMS STATES & HANDLERS ---
  // 1. Typography Settings
  const [fontHeading, setFontHeading] = useState(() => localStorage.getItem('offkilt_font_heading') || 'Outfit');
  const [fontBody, setFontBody] = useState(() => localStorage.getItem('offkilt_font_body') || 'Inter');

  // 2. Footer Settings
  const [footerSettings, setFooterSettings] = useState(() => {
    const defaults = {
      email1: 'info@off-kilt.com',
      email2: 'offkiltfashion@gmail.com',
      phone: '+91 8291155692',
      address: 'Flat 402, Sea Breeze Apts, Bandra West, Mumbai, MH - 400050'
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_footer_settings')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  // 3. Instagram & Socials Settings
  const [socialSettings, setSocialSettings] = useState(() => {
    const defaults = {
      instagram: '@offkiltfashion',
      instagramUrl: 'https://www.instagram.com/offkiltfashion',
      whatsapp: '918291155692',
      facebookUrl: 'https://facebook.com',
      youtubeUrl: 'https://youtube.com'
    };
    try {
      const stored = localStorage.getItem('offkilt_socials');
      return stored ? JSON.parse(stored) : defaults;
    } catch(e) {
      return defaults;
    }
  });

  // 4. Marketplace Partners Settings
  const [partnersList, setPartnersList] = useState(() => {
    const DEFAULT_PARTNERS = [
      { name: 'Myntra', url: 'https://www.myntra.com/', color: '#ff3f6c', logoText: 'MYNTRA', active: true },
      { name: 'Ajio', url: 'https://www.ajio.com/', color: '#3f2a56', logoText: 'AJIO', active: true },
      { name: 'Amazon', url: 'https://www.amazon.in/', color: '#ff9900', logoText: 'amazon', active: true },
      { name: 'Flipkart', url: 'https://www.flipkart.com/', color: '#2874f0', logoText: 'Flipkart', active: true }
    ];
    try {
      return JSON.parse(localStorage.getItem('offkilt_partners')) || DEFAULT_PARTNERS;
    } catch (e) {
      return DEFAULT_PARTNERS;
    }
  });

  // 5. Mega Menu Settings
  const [megaMenuSettings, setMegaMenuSettings] = useState(() => {
    const DEFAULT_MEGA = {
      men: {
        fits: ['Baggy Fit', 'Relaxed Fit', 'Straight Fit', 'Bootcut Fit', 'Carpenter Pants'],
        categories: ['Classic Jeans', 'Carpenter Edits', 'Selvedge Series', 'Utility Cargos', 'Distressed']
      },
      women: {
        fits: ['High Waist Skirts', 'Asymmetrical skirts', 'Paneled Skirts', 'Relaxed Cargos', 'Baggy Jeans'],
        categories: ['Denim Skirts', 'Street Cargos', 'Classic Fits', 'Paneled Skirts', 'Tops & Edits']
      }
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_mega_menu')) || DEFAULT_MEGA;
    } catch(e) {
      return DEFAULT_MEGA;
    }
  });

  const handleTypographySave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_font_heading', fontHeading);
    localStorage.setItem('offkilt_font_body', fontBody);
    triggerSync('offkilt_settings_updated');
    alert('Typography settings updated!');
  };

  const handleFooterSettingsSave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_footer_settings', JSON.stringify(footerSettings));
    localStorage.setItem('offkilt_footer_email1', footerSettings.email1);
    localStorage.setItem('offkilt_footer_email2', footerSettings.email2 || '');
    localStorage.setItem('offkilt_footer_phone', footerSettings.phone);
    localStorage.setItem('offkilt_footer_address', footerSettings.address);
    triggerSync('offkilt_settings_updated');
    alert('Footer settings updated!');
  };

  const handleSocialSettingsSave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_socials', JSON.stringify(socialSettings));
    localStorage.setItem('offkilt_instagram', socialSettings.instagram);
    localStorage.setItem('offkilt_instagram_url', socialSettings.instagramUrl);
    localStorage.setItem('offkilt_whatsapp', socialSettings.whatsapp);
    localStorage.setItem('offkilt_facebook_url', socialSettings.facebookUrl || '');
    localStorage.setItem('offkilt_youtube_url', socialSettings.youtubeUrl || '');
    triggerSync('offkilt_settings_updated');
    alert('Socials & Instagram settings updated!');
  };

  const handlePartnersSave = (e) => {
    if(e) e.preventDefault();
    localStorage.setItem('offkilt_partners', JSON.stringify(partnersList));
    triggerSync('offkilt_settings_updated');
    alert('Marketplace partners updated!');
  };

  const handleMegaMenuSave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_mega_menu', JSON.stringify(megaMenuSettings));
    triggerSync('offkilt_settings_updated');
    alert('Mega menu settings updated!');
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

  // --- PAYMENT GATEWAY STATE ---
  const [razorpaySettings, setRazorpaySettings] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_razorpay') || 'null') || {
        keyId: '',
        keySecret: '',
        businessName: 'off-kilt Fashion',
        businessDescription: 'Premium Denim & Streetwear',
        businessLogo: '',
        upiId: '',
        currency: 'INR',
        theme: '#f97316',
        enableCod: true,
        enableLiveMode: false,
      };
    } catch { 
      return { keyId: '', keySecret: '', businessName: 'off-kilt Fashion', businessDescription: 'Premium Denim & Streetwear', businessLogo: '', upiId: '', currency: 'INR', theme: '#f97316', enableCod: true, enableLiveMode: false };
    }
  });
  const [rzpShowSecret, setRzpShowSecret] = useState(false);
  const [rzpSaveSuccess, setRzpSaveSuccess] = useState(false);

  const handleRazorpaySave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_razorpay', JSON.stringify(razorpaySettings));
    triggerSync('offkilt_settings_updated');
    setRzpSaveSuccess(true);
    setTimeout(() => setRzpSaveSuccess(false), 3000);
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
    { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
    { id: 'campaigns', label: 'Campaign CMS', icon: Layout },
    { id: 'collections', label: 'Collections & Story', icon: Layers },
    { id: 'qna', label: 'Q&A Manager', icon: HelpCircle },
    { id: 'typography', label: 'Typography CMS', icon: Type },
    { id: 'menus', label: 'Header Navigation', icon: List },
    { id: 'megamenu', label: 'Mega Menu Builder', icon: Layout },
    { id: 'socials', label: 'Socials & Instagram', icon: Share2 },
    { id: 'footer', label: 'Footer CMS', icon: MapPin },
    { id: 'partners', label: 'Marketplace Partners', icon: Users },
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

          {/* PAYMENT GATEWAY TAB */}
          {activeTab === 'payment' && (
            <div style={{ maxWidth: '780px' }}>
              
              {/* Status Banner */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                backgroundColor: razorpaySettings.keyId ? '#f0fdf4' : '#fffbeb',
                border: `1px solid ${razorpaySettings.keyId ? '#86efac' : '#fde68a'}`,
                borderRadius: '8px', padding: '16px 20px', marginBottom: '32px'
              }}>
                <div style={{ fontSize: '2rem' }}>{razorpaySettings.keyId ? '✅' : '⚠️'}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.9rem', color: razorpaySettings.keyId ? '#16a34a' : '#92400e' }}>
                    {razorpaySettings.keyId 
                      ? (razorpaySettings.enableLiveMode ? '🟢 LIVE MODE ACTIVE — Real payments are being collected' : '🟡 TEST MODE — Payments are simulated (no real money)') 
                      : 'Razorpay Not Configured — Payments are fully simulated'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>
                    {razorpaySettings.keyId 
                      ? `Key: ${razorpaySettings.keyId.slice(0,8)}••••••••  |  Business: ${razorpaySettings.businessName}`
                      : 'Enter your Razorpay credentials below to enable real payment collection.'}
                  </div>
                </div>
              </div>

              <form onSubmit={handleRazorpaySave} style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>

                {/* API Credentials */}
                <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Key size={18} color="var(--accent-raw)" />
                    <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>API Credentials</h3>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Razorpay Key ID *</label>
                      <input type="text" value={razorpaySettings.keyId}
                        onChange={e => setRazorpaySettings(p => ({ ...p, keyId: e.target.value.trim() }))}
                        placeholder="rzp_test_XXXXXXXXXXXXXXXXXX"
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                      />
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>Starts with <code>rzp_test_</code> (test) or <code>rzp_live_</code> (live)</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Key Secret *</label>
                      <div style={{ position: 'relative' }}>
                        <input type={rzpShowSecret ? 'text' : 'password'} value={razorpaySettings.keySecret}
                          onChange={e => setRazorpaySettings(p => ({ ...p, keySecret: e.target.value.trim() }))}
                          placeholder="••••••••••••••••••••••"
                          style={{ width: '100%', padding: '10px 40px 10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                        />
                        <button type="button" onClick={() => setRzpShowSecret(p => !p)} style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af' }}>
                          <Eye size={16} />
                        </button>
                      </div>
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>Never share this. Stored locally in your browser only.</p>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your UPI ID (for QR fallback)</label>
                      <input type="text" value={razorpaySettings.upiId}
                        onChange={e => setRazorpaySettings(p => ({ ...p, upiId: e.target.value.trim() }))}
                        placeholder="yourname@oksbi"
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                      />
                      <p style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '4px' }}>Used for QR code when Razorpay SDK is not loaded</p>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Checkout Theme Color</label>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <input type="color" value={razorpaySettings.theme}
                          onChange={e => setRazorpaySettings(p => ({ ...p, theme: e.target.value }))}
                          style={{ width: '48px', height: '40px', border: 'none', padding: '0', cursor: 'pointer', borderRadius: '4px' }}
                        />
                        <input type="text" value={razorpaySettings.theme}
                          onChange={e => setRazorpaySettings(p => ({ ...p, theme: e.target.value }))}
                          style={{ flex: 1, padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'monospace', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Business Info */}
                <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <ShieldCheck size={18} color="var(--accent-raw)" />
                    <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>Business Info (shown on checkout popup)</h3>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Name</label>
                      <input type="text" value={razorpaySettings.businessName}
                        onChange={e => setRazorpaySettings(p => ({ ...p, businessName: e.target.value }))}
                        placeholder="off-kilt Fashion"
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Description</label>
                      <input type="text" value={razorpaySettings.businessDescription}
                        onChange={e => setRazorpaySettings(p => ({ ...p, businessDescription: e.target.value }))}
                        placeholder="Premium Denim & Streetwear"
                        style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, marginBottom: '6px', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Business Logo URL (optional)</label>
                    <input type="url" value={razorpaySettings.businessLogo}
                      onChange={e => setRazorpaySettings(p => ({ ...p, businessLogo: e.target.value }))}
                      placeholder="https://yourdomain.com/logo.png"
                      style={{ width: '100%', padding: '10px 14px', border: '1.5px solid #e5e7eb', borderRadius: '6px', fontSize: '0.85rem', outline: 'none' }}
                    />
                  </div>
                </div>

                {/* Mode Toggles */}
                <div style={{ backgroundColor: '#fff', padding: '28px', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.07)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                    <Zap size={18} color="var(--accent-raw)" />
                    <h3 style={{ fontSize: '0.9rem', fontFamily: 'var(--font-mono)', letterSpacing: '1px', textTransform: 'uppercase' }}>Payment Settings</h3>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: razorpaySettings.enableLiveMode ? '#fef2f2' : '#f9fafb', borderRadius: '6px', border: `1px solid ${razorpaySettings.enableLiveMode ? '#fecaca' : '#e5e7eb'}` }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem', color: razorpaySettings.enableLiveMode ? '#dc2626' : '#374151' }}>
                          {razorpaySettings.enableLiveMode ? '🔴 LIVE MODE — Real money is charged' : '🟡 Test Mode — No real money charged'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>
                          {razorpaySettings.enableLiveMode ? 'Customers pay real money. Use rzp_live_ keys.' : 'Safe testing. Use rzp_test_ keys.'}
                        </div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="checkbox" checked={razorpaySettings.enableLiveMode} onChange={e => {
                          if (e.target.checked && !window.confirm('⚠️ Switch to LIVE MODE? Real customers will be charged. Ensure your rzp_live_ key is set.')) return;
                          setRazorpaySettings(p => ({ ...p, enableLiveMode: e.target.checked }));
                        }} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', inset: 0, backgroundColor: razorpaySettings.enableLiveMode ? '#dc2626' : '#d1d5db', borderRadius: '13px', transition: '0.3s' }}>
                          <span style={{ position: 'absolute', left: razorpaySettings.enableLiveMode ? '24px' : '2px', top: '2px', width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                        </span>
                      </label>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f9fafb', borderRadius: '6px', border: '1px solid #e5e7eb' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>Cash on Delivery (COD)</div>
                        <div style={{ fontSize: '0.7rem', color: '#9ca3af', marginTop: '2px' }}>Show COD at checkout (always simulated — no payment).</div>
                      </div>
                      <label style={{ position: 'relative', display: 'inline-block', width: '48px', height: '26px', cursor: 'pointer', flexShrink: 0 }}>
                        <input type="checkbox" checked={razorpaySettings.enableCod} onChange={e => setRazorpaySettings(p => ({ ...p, enableCod: e.target.checked }))} style={{ opacity: 0, width: 0, height: 0 }} />
                        <span style={{ position: 'absolute', inset: 0, backgroundColor: razorpaySettings.enableCod ? 'var(--accent-raw)' : '#d1d5db', borderRadius: '13px', transition: '0.3s' }}>
                          <span style={{ position: 'absolute', left: razorpaySettings.enableCod ? '24px' : '2px', top: '2px', width: '22px', height: '22px', backgroundColor: '#fff', borderRadius: '50%', transition: '0.3s' }} />
                        </span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* How to get keys */}
                <div style={{ backgroundColor: '#eff6ff', padding: '20px 24px', borderRadius: '8px', border: '1px solid #bfdbfe' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.8rem', color: '#1d4ed8', marginBottom: '10px' }}>📋 How to get your Razorpay API Keys</div>
                  <ol style={{ fontSize: '0.78rem', color: '#1e40af', lineHeight: '1.8', paddingLeft: '20px', margin: 0 }}>
                    <li>Go to <strong>dashboard.razorpay.com</strong> → Login or Sign Up (free)</li>
                    <li>Click <strong>Settings</strong> → <strong>API Keys</strong></li>
                    <li>Click <strong>"Generate Test Key"</strong> for testing or <strong>"Generate Live Key"</strong> for production</li>
                    <li>Copy the <strong>Key ID</strong> and <strong>Key Secret</strong></li>
                    <li>Paste them above and click <strong>Save Gateway Settings</strong></li>
                  </ol>
                  <div style={{ marginTop: '12px', fontSize: '0.72rem', color: '#6b7280' }}>
                    ⚡ Test card: <code>4111 1111 1111 1111</code> | Any CVV & future expiry | OTP: <code>1234</code>
                  </div>
                </div>

                {/* Save & Test */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="submit" style={{ padding: '12px 28px', backgroundColor: 'var(--accent-raw)', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 700, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)', letterSpacing: '1px' }}>
                    <Save size={16} /> SAVE GATEWAY SETTINGS
                  </button>
                  {rzpSaveSuccess && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#16a34a', fontWeight: 600, fontSize: '0.85rem' }}>
                      <Check size={16} /> Saved! Checkout will now use these credentials.
                    </div>
                  )}
                  {razorpaySettings.keyId && (
                    <button type="button"
                      onClick={() => {
                        const s = razorpaySettings;
                        if (!s.keyId) { alert('Save your settings first!'); return; }
                        if (!window.Razorpay) { alert('Razorpay SDK not loaded. Check internet connection.'); return; }
                        const rzp = new window.Razorpay({
                          key: s.keyId,
                          amount: 100,
                          currency: 'INR',
                          name: s.businessName || 'off-kilt Fashion',
                          description: 'Gateway Connection Test ₹1',
                          image: s.businessLogo || '',
                          handler: () => alert('✅ Razorpay connection successful! Your gateway is working perfectly.'),
                          prefill: { name: 'Admin Test', email: 'admin@offkite.com', contact: '9000000000' },
                          theme: { color: s.theme || '#f97316' },
                        });
                        rzp.open();
                      }}
                      style={{ padding: '12px 20px', backgroundColor: '#f0fdf4', color: '#16a34a', border: '1.5px solid #86efac', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontFamily: 'var(--font-mono)' }}
                    >
                      <Zap size={14} /> TEST CONNECTION (₹1)
                    </button>
                  )}
                </div>
              </form>
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
                      <input 
                        type="text" 
                        value={productForm.category} 
                        onChange={(e) => setProductForm({...productForm, category: e.target.value.toLowerCase()})}
                        placeholder="e.g. jeans, skirts, footwear, accessories"
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        required
                      />
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Hero Banner configuration */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>HERO BANNER CMS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Background Media URL (Video or Image)</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.mediaUrl || ''} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, mediaUrl: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      placeholder="e.g. /videos/hero_bg.mp4 or external URL"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <input 
                        type="file" 
                        accept="image/*,video/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const isVideo = file.type.startsWith('video/');
                              const updated = { 
                                ...campaigns.hero, 
                                mediaUrl: reader.result,
                                mediaType: isVideo ? 'video' : 'image'
                              };
                              setCampaigns(prev => ({ ...prev, hero: updated }));
                              localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                              window.dispatchEvent(new Event('offkilt_hero_updated'));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ fontSize: '0.75rem', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Media Type</label>
                    <select
                      value={campaigns.hero.mediaType || 'video'}
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, mediaType: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    >
                      <option value="video">Video</option>
                      <option value="image">Image</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Title Word 1 (Split Design)</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.word1 || 'FASHION'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, word1: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Title Word 2</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.word2 || 'WITHOUT'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, word2: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Title Word 3</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.word3 || 'LIMITS'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, word3: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Button 1 Text</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.btn1Text || 'SHOP WOMEN'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, btn1Text: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Button 1 Action/Link</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.btn1Link || '#catalog'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, btn1Link: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Button 2 Text</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.btn2Text || 'SHOP MEN'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, btn2Text: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Button 2 Action/Link</label>
                    <input 
                      type="text" 
                      value={campaigns.hero.btn2Link || '#catalog'} 
                      onChange={(e) => {
                        const updated = { ...campaigns.hero, btn2Link: e.target.value };
                        setCampaigns(prev => ({ ...prev, hero: updated }));
                        localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
                        window.dispatchEvent(new Event('offkilt_hero_updated'));
                      }} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Fashion Film CMS */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>FASHION FILM CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Video Source URL</label>
                    <input 
                      type="text" 
                      value={fashionFilm.videoUrl} 
                      onChange={(e) => setFashionFilm({ ...fashionFilm, videoUrl: e.target.value })} 
                      placeholder="e.g. /videos/fashion_film.mp4 or empty for default"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <input 
                        type="file" 
                        accept="video/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setFashionFilm(prev => ({ ...prev, videoUrl: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ fontSize: '0.75rem', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Title</label>
                    <input 
                      type="text" 
                      value={fashionFilm.title} 
                      onChange={(e) => setFashionFilm({ ...fashionFilm, title: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Quote</label>
                    <input 
                      type="text" 
                      value={fashionFilm.quote} 
                      onChange={(e) => setFashionFilm({ ...fashionFilm, quote: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={handleFashionFilmSave} className="btn-primary">
                      <Save size={16} /> Save Fashion Film Settings
                    </button>
                  </div>
                </div>
              </div>

              {/* Grid layout for Men and Women campaigns */}
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
            </div>
          )}

          {/* Typography Settings Tab */}
          {activeTab === 'typography' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>TYPOGRAPHY & BRAND FONTS</h3>
              <form onSubmit={handleTypographySave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Heading Font Style</label>
                  <select 
                    value={fontHeading} 
                    onChange={(e) => setFontHeading(e.target.value)}
                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="Outfit">Outfit (Modern Geometrical Sans)</option>
                    <option value="Syne">Syne (Artistic & Edgy)</option>
                    <option value="Playfair Display">Playfair Display (Zara Serif Style)</option>
                    <option value="Space Grotesk">Space Grotesk (Tech Brutalist)</option>
                    <option value="Cormorant Garamond">Cormorant Garamond (Premium Luxury Serif)</option>
                    <option value="Montserrat">Montserrat (Clean Classic Geometric)</option>
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Body / Interface Font Style</label>
                  <select 
                    value={fontBody} 
                    onChange={(e) => setFontBody(e.target.value)}
                    style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff' }}
                  >
                    <option value="Inter">Inter (Premium Neutral Sans)</option>
                    <option value="Manrope">Manrope (Modern Humanist Sans)</option>
                    <option value="Roboto Mono">Roboto Mono (Clean Technical Monospace)</option>
                    <option value="DM Sans">DM Sans (Minimalist Geometric)</option>
                  </select>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    <Save size={16} /> Save Typography Configs
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Mega Menu Settings Tab */}
          {activeTab === 'megamenu' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>MEGA MENU CATEGORIZATIONS BUILDER</h3>
              <form onSubmit={handleMegaMenuSave} style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
                  {/* Men's Mega Menu Column */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '6px', marginBottom: '16px', textTransform: 'uppercase' }}>Men's Fits & Categories</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>FITS (Comma Separated)</label>
                        <textarea
                          value={megaMenuSettings.men.fits.join(', ')}
                          onChange={(e) => {
                            const fits = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setMegaMenuSettings({ ...megaMenuSettings, men: { ...megaMenuSettings.men, fits } });
                          }}
                          rows="3"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>CATEGORIES (Comma Separated)</label>
                        <textarea
                          value={megaMenuSettings.men.categories.join(', ')}
                          onChange={(e) => {
                            const categories = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setMegaMenuSettings({ ...megaMenuSettings, men: { ...megaMenuSettings.men, categories } });
                          }}
                          rows="3"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Women's Mega Menu Column */}
                  <div>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 700, borderBottom: '1px solid rgba(0,0,0,0.1)', paddingBottom: '6px', marginBottom: '16px', textTransform: 'uppercase' }}>Women's Fits & Categories</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>FITS (Comma Separated)</label>
                        <textarea
                          value={megaMenuSettings.women.fits.join(', ')}
                          onChange={(e) => {
                            const fits = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setMegaMenuSettings({ ...megaMenuSettings, women: { ...megaMenuSettings.women, fits } });
                          }}
                          rows="3"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>CATEGORIES (Comma Separated)</label>
                        <textarea
                          value={megaMenuSettings.women.categories.join(', ')}
                          onChange={(e) => {
                            const categories = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                            setMegaMenuSettings({ ...megaMenuSettings, women: { ...megaMenuSettings.women, categories } });
                          }}
                          rows="3"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    <Save size={16} /> Save Mega Menu Configurations
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Socials & Instagram Settings Tab */}
          {activeTab === 'socials' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>SOCIAL MEDIA & SUPPORT CONFIG</h3>
                <form onSubmit={handleSocialSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Instagram Handle</label>
                      <input 
                        type="text" 
                        value={socialSettings.instagram} 
                        onChange={(e) => setSocialSettings({ ...socialSettings, instagram: e.target.value })} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="@offkiltfashion"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Instagram URL (Reels/Stories Link)</label>
                      <input 
                        type="text" 
                        value={socialSettings.instagramUrl} 
                        onChange={(e) => setSocialSettings({ ...socialSettings, instagramUrl: e.target.value })} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="https://www.instagram.com/offkiltfashion"
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>WhatsApp Support Number (With Country Code)</label>
                      <input 
                        type="text" 
                        value={socialSettings.whatsapp} 
                        onChange={(e) => setSocialSettings({ ...socialSettings, whatsapp: e.target.value })} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="918291155692"
                        required
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Facebook Brand Page URL</label>
                      <input 
                        type="text" 
                        value={socialSettings.facebookUrl || ''} 
                        onChange={(e) => setSocialSettings({ ...socialSettings, facebookUrl: e.target.value })} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="https://facebook.com/offkilt"
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>YouTube Channel Link</label>
                    <input 
                      type="text" 
                      value={socialSettings.youtubeUrl || ''} 
                      onChange={(e) => setSocialSettings({ ...socialSettings, youtubeUrl: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      placeholder="https://youtube.com/c/offkilt"
                    />
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="submit" className="btn-primary">
                      <Save size={16} /> Save Social Configurations
                    </button>
                  </div>
                </form>
              </div>

              {/* Instagram Gallery Manager Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>INSTAGRAM GALLERY MANAGER</h3>
                  <button 
                    type="button" 
                    onClick={handleAddIgItem} 
                    className="btn-primary" 
                    style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                  >
                    <Plus size={12} /> Add Post
                  </button>
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {igGallery.map((item, idx) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px 50px', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '2px', backgroundColor: '#fcfcf9' }}>
                      <div>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Image URL</label>
                        <input 
                          type="text" 
                          value={item.src} 
                          onChange={(e) => {
                            const updated = [...igGallery];
                            updated[idx].src = e.target.value;
                            setIgGallery(updated);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                const updated = [...igGallery];
                                updated[idx].src = reader.result;
                                setIgGallery(updated);
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.65rem', marginTop: '4px', width: '100%' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Likes Display</label>
                        <input 
                          type="text" 
                          value={item.likes} 
                          onChange={(e) => {
                            const updated = [...igGallery];
                            updated[idx].likes = e.target.value;
                            setIgGallery(updated);
                          }}
                          placeholder="e.g. 4.2K"
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                        />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Featured</label>
                        <input 
                          type="checkbox" 
                          checked={item.featured === true} 
                          onChange={(e) => {
                            const updated = igGallery.map((g, i) => ({ ...g, featured: i === idx ? e.target.checked : false }));
                            setIgGallery(updated);
                          }}
                        />
                      </div>
                      <div>
                        <button 
                          type="button" 
                          onClick={() => handleDeleteIgItem(item.id)}
                          style={{ color: '#ef4444', marginTop: '14px', cursor: 'pointer' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={handleSaveIgGallery} className="btn-primary">
                    <Save size={16} /> Save Gallery Items
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Footer Settings Tab */}
          {activeTab === 'footer' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>FOOTER CONTACT INFO & ADDRESS CMS</h3>
              <form onSubmit={handleFooterSettingsSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Primary Email</label>
                    <input 
                      type="email" 
                      value={footerSettings.email1} 
                      onChange={(e) => setFooterSettings({ ...footerSettings, email1: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      required
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Secondary Email</label>
                    <input 
                      type="email" 
                      value={footerSettings.email2} 
                      onChange={(e) => setFooterSettings({ ...footerSettings, email2: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Support Mobile Phone / WhatsApp</label>
                  <input 
                    type="text" 
                    value={footerSettings.phone} 
                    onChange={(e) => setFooterSettings({ ...footerSettings, phone: e.target.value })} 
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                    required
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Physical Warehouse Address (Includes MapPin Icon Rendering)</label>
                  <textarea 
                    value={footerSettings.address} 
                    onChange={(e) => setFooterSettings({ ...footerSettings, address: e.target.value })} 
                    rows="3"
                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical' }}
                    required
                  ></textarea>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                  <button type="submit" className="btn-primary">
                    <Save size={16} /> Save Footer Details
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Marketplace Partners Settings Tab */}
          {activeTab === 'partners' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ fontSize: '0.9rem', letterSpacing: '1px' }}>MARKETPLACE PARTNERS DIRECTORY</h3>
                <button 
                  type="button"
                  onClick={() => {
                    const newPartnerList = [...partnersList, { name: 'New Partner', url: '#', color: '#111111', logoText: 'NEW', imageUrl: '', active: true }];
                    setPartnersList(newPartnerList);
                  }}
                  className="btn-primary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <Plus size={12} /> Add Partner
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {partnersList.map((partner, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr 60px 40px', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '2px', backgroundColor: '#fcfcf9' }}>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Name</label>
                      <input 
                        type="text" 
                        value={partner.name} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].name = e.target.value;
                          setPartnersList(updated);
                        }}
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Storefront Link (URL)</label>
                      <input 
                        type="text" 
                        value={partner.url} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].url = e.target.value;
                          setPartnersList(updated);
                        }}
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Logo Text</label>
                      <input 
                        type="text" 
                        value={partner.logoText} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].logoText = e.target.value;
                          setPartnersList(updated);
                        }}
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Logo Image URL</label>
                      <input 
                        type="text" 
                        value={partner.imageUrl || ''} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].imageUrl = e.target.value;
                          setPartnersList(updated);
                        }}
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                        placeholder="https://..."
                      />
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              const updated = [...partnersList];
                              updated[idx].imageUrl = reader.result;
                              setPartnersList(updated);
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ fontSize: '0.65rem', marginTop: '4px', width: '100%' }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Hover Accent Color</label>
                      <input 
                        type="text" 
                        value={partner.color} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].color = e.target.value;
                          setPartnersList(updated);
                        }}
                        style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', fontFamily: 'var(--font-mono)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Active</label>
                      <input 
                        type="checkbox" 
                        checked={partner.active !== false} 
                        onChange={(e) => {
                          const updated = [...partnersList];
                          updated[idx].active = e.target.checked;
                          setPartnersList(updated);
                        }}
                      />
                    </div>
                    <div>
                      <button 
                        type="button"
                        onClick={() => {
                          const updated = partnersList.filter((_, i) => i !== idx);
                          setPartnersList(updated);
                        }}
                        style={{ color: '#ef4444', marginTop: '14px' }}
                        title="Delete Partner"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                <button type="button" onClick={handlePartnersSave} className="btn-primary">
                  <Save size={16} /> Save Marketplace Partners
                </button>
              </div>
            </div>
          )}

          {/* 5. NAVIGATION LINKS */}
          {activeTab === 'menus' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>HEADER NAVIGATION MENU MANAGER</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {menuItems.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '1.5fr 1.5fr 1fr 100px 50px', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '2px', backgroundColor: '#fcfcf9' }}>
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
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      <button 
                        type="button" 
                        onClick={() => handleDeleteMenuItem(index)}
                        style={{ color: '#ef4444', marginTop: '14px', cursor: 'pointer' }}
                        title="Delete Menu Link"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <button onClick={handleAddMenuItem} className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Plus size={16} /> Add Menu Item
                  </button>
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

          {/* COLLECTIONS & STORY PANEL */}
          {activeTab === 'collections' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              
              {/* Brand Story (Narrative) CMS Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>THE NARRATIVE & BRAND STORY</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Title</label>
                    <input 
                      type="text" 
                      value={narrative.title} 
                      onChange={(e) => setNarrative({ ...narrative, title: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>First Paragraph</label>
                    <textarea 
                      value={narrative.body1} 
                      onChange={(e) => setNarrative({ ...narrative, body1: e.target.value })} 
                      rows="3"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Pull Quote</label>
                    <input 
                      type="text" 
                      value={narrative.quote} 
                      onChange={(e) => setNarrative({ ...narrative, quote: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Second Paragraph</label>
                    <textarea 
                      value={narrative.body2} 
                      onChange={(e) => setNarrative({ ...narrative, body2: e.target.value })} 
                      rows="3"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Cover Image URL</label>
                    <input 
                      type="text" 
                      value={narrative.image} 
                      onChange={(e) => setNarrative({ ...narrative, image: e.target.value })} 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                    <div style={{ marginTop: '6px' }}>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setNarrative(prev => ({ ...prev, image: reader.result }));
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                        style={{ fontSize: '0.75rem', width: '100%' }}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={handleNarrativeSave} className="btn-primary">
                      <Save size={16} /> Save Brand Narrative
                    </button>
                  </div>
                </div>
              </div>

              {/* Homepage Collections Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>HOMEPAGE COLLECTIONS COVERS & LINKS</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  
                  {/* Best Sellers */}
                  <div style={{ border: '1px solid rgba(0,0,0,0.04)', padding: '16px', borderRadius: '2px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>BEST SELLERS GRID</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Collection Title</label>
                        <input 
                          type="text" 
                          value={homepageCollections.bestSellersTitle} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, bestSellersTitle: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cover Image URL</label>
                        <input 
                          type="text" 
                          value={homepageCollections.bestSellersCover} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, bestSellersCover: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setHomepageCollections(prev => ({ ...prev, bestSellersCover: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.65rem', marginTop: '4px', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Trending Collection */}
                  <div style={{ border: '1px solid rgba(0,0,0,0.04)', padding: '16px', borderRadius: '2px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>TRENDING GRID</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Collection Title</label>
                        <input 
                          type="text" 
                          value={homepageCollections.trendingTitle} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, trendingTitle: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cover Image URL</label>
                        <input 
                          type="text" 
                          value={homepageCollections.trendingCover} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, trendingCover: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setHomepageCollections(prev => ({ ...prev, trendingCover: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.65rem', marginTop: '4px', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Shop by Style */}
                  <div style={{ border: '1px solid rgba(0,0,0,0.04)', padding: '16px', borderRadius: '2px', gridColumn: 'span 2' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>SHOP BY STYLE</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Section Title</label>
                        <input 
                          type="text" 
                          value={homepageCollections.styleTitle} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, styleTitle: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cover Image URL</label>
                        <input 
                          type="text" 
                          value={homepageCollections.styleCover} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, styleCover: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setHomepageCollections(prev => ({ ...prev, styleCover: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                          style={{ fontSize: '0.65rem', marginTop: '4px', width: '100%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button type="button" onClick={handleCollectionsSave} className="btn-primary">
                    <Save size={16} /> Save Collections Settings
                  </button>
                </div>
              </div>

              {/* Product Categories List Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>STOREFRONT CATEGORY TABS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Active Categories (Comma-separated)</label>
                    <input 
                      type="text" 
                      value={categoryList.join(', ')} 
                      onChange={(e) => {
                        const arr = e.target.value.split(',').map(x => x.trim()).filter(Boolean);
                        setCategoryList(arr);
                      }} 
                      placeholder="e.g. all, jeans, skirts, cargos, shirts"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button type="button" onClick={handleCategoriesSave} className="btn-primary">
                      <Save size={16} /> Save Storefront Categories
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Q&A MANAGER PANEL */}
          {activeTab === 'qna' && (
            <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
              <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>PRODUCT Q&A MANAGER</h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.keys(qnaProducts).length === 0 || Object.values(qnaProducts).flat().length === 0 ? (
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', fontStyle: 'italic', textAlign: 'center', padding: '30px 0' }}>
                    No questions have been submitted by customers yet.
                  </p>
                ) : (
                  Object.entries(qnaProducts).map(([prodId, qList]) => {
                    if (!qList || qList.length === 0) return null;
                    const prod = products.find(p => p.id === prodId) || { name: `Product ID: ${prodId}`, image: '' };
                    return (
                      <div key={prodId} style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '20px', borderRadius: '4px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '12px' }}>
                          {prod.image && <img src={prod.image} alt={prod.name} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '2px' }} />}
                          <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{prod.name.toUpperCase()}</h4>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          {qList.map((q) => (
                            <QnaItemRow 
                              key={q.id} 
                              q={q} 
                              prodId={prodId} 
                              onSaveAnswer={handleSaveAnswer}
                              onDelete={handleDeleteQuestion}
                            />
                          ))}
                        </div>
                      </div>
                    );
                  })
                )}
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
