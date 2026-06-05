import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Plus, Edit2, Trash2, Save, Image as ImageIcon, UploadCloud, 
  BarChart3, Package, ShoppingBag, Layout, List, FileText, Megaphone, 
  Tag, Users, Globe, RefreshCw, ShieldAlert, Database, UserCheck, 
  Download, Upload, Search, Check, AlertTriangle, Eye, Printer,
  Type, Share2, Phone, MapPin, HelpCircle, Layers, CreditCard, Key, ShieldCheck, Zap, Mail, Send
} from 'lucide-react';
import { products as productsApi, admin as adminApi, toWebp } from '../services/api';
import { saveMediaToIndexedDB } from '../services/db';

// ── Admin Email Management Tab ──────────────────────────────────────────────
function AdminEmailTab() {
  const [emailProvider, setEmailProvider] = useState(() =>
    JSON.parse(localStorage.getItem('offkilt_email_provider') || JSON.stringify({
      provider: 'Brevo', senderName: 'Off-Kilt',
      senderEmail: 'offkiltfashion@gmail.com', apiKey: ''
    }))
  );
  const [emailToggles, setEmailToggles] = useState(() =>
    JSON.parse(localStorage.getItem('offkilt_email_toggles') || JSON.stringify({
      welcome: true, forgot_password: true, order_confirm: true,
      order_shipped: true, order_delivered: true, contact_form: true, newsletter: true
    }))
  );
  const [selectedTemplate, setSelectedTemplate] = useState('forgot_password');
  const [templateSubject, setTemplateSubject] = useState('Reset Your Password - Off-Kilt');
  const [templateBody, setTemplateBody] = useState(`Hello {{customer_name}},\n\nClick the button below to reset your password.\n\n[ Reset Password ]\n\nThis link expires in 15 minutes.\n\n— Off-Kilt Team`);
  const [testEmail, setTestEmail] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [testLoading, setTestLoading] = useState(false);
  const [testError, setTestError] = useState(null);
  const [providerSaved, setProviderSaved] = useState(false);
  const [togglesSaved, setTogglesSaved] = useState(false);
  const [templateSaved, setTemplateSaved] = useState(false);

  const handleSendTestEmail = async () => {
    if (!testEmail) {
      alert('Please enter a recipient email address.');
      return;
    }
    setTestLoading(true);
    setTestResult(null);
    setTestError(null);
    try {
      const res = await adminApi.sendTestEmail(testEmail);
      setTestResult('success');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Unknown error occurred.';
      setTestError(errorMsg);
    } finally {
      setTestLoading(false);
    }
  };

  useEffect(() => {
    const fetchEmailSettings = async () => {
      try {
        const res = await adminApi.getEmailSettings();
        if (res.data) {
          const data = res.data;
          if (data.emailProvider) {
            setEmailProvider(data.emailProvider);
            localStorage.setItem('offkilt_email_provider', JSON.stringify(data.emailProvider));
          }
          if (data.emailToggles) {
            setEmailToggles(data.emailToggles);
            localStorage.setItem('offkilt_email_toggles', JSON.stringify(data.emailToggles));
          }
          if (data.templates) {
            localStorage.setItem('offkilt_email_templates', JSON.stringify(data.templates));
            const tmpl = data.templates[selectedTemplate] || { subject: '', body: '' };
            setTemplateSubject(tmpl.subject || '');
            setTemplateBody(tmpl.body || '');
          }
        }
      } catch (err) {
        console.error('Failed to load email settings from backend', err);
      }
    };
    fetchEmailSettings();
  }, []);

  useEffect(() => {
    try {
      const tmpl = JSON.parse(localStorage.getItem('offkilt_email_templates') || '{}');
      const current = tmpl[selectedTemplate] || { subject: '', body: '' };
      setTemplateSubject(current.subject || '');
      setTemplateBody(current.body || '');
    } catch (e) {
      console.error(e);
    }
  }, [selectedTemplate]);

  const saveSettingsToBackend = async (updatedProvider = emailProvider, updatedToggles = emailToggles, updatedTemplates = null) => {
    try {
      let templates = updatedTemplates;
      if (!templates) {
        try {
          templates = JSON.parse(localStorage.getItem('offkilt_email_templates') || '{}');
        } catch (e) {
          templates = {};
        }
      }
      const payload = {
        emailProvider: updatedProvider,
        emailToggles: updatedToggles,
        templates: templates
      };
      await adminApi.saveEmailSettings(payload);
    } catch (err) {
      console.error('Failed to save email settings to server', err);
    }
  };

  const activityLog = [
    { date: 'Today, 14:31', type: 'Forgot Password', recipient: 'user@gmail.com', status: 'Delivered' },
    { date: 'Today, 11:02', type: 'Order Confirmed', recipient: 'customer@gmail.com', status: 'Delivered' },
    { date: 'Yesterday, 18:55', type: 'Welcome Email', recipient: 'newuser@gmail.com', status: 'Delivered' },
    { date: 'Yesterday, 09:13', type: 'Order Shipped', recipient: 'orders@gmail.com', status: 'Delivered' },
    { date: '30 May, 16:40', type: 'Newsletter', recipient: 'fan@gmail.com', status: 'Bounced' },
  ];

  const emailTypes = [
    { value: 'forgot_password', label: 'Forgot Password' },
    { value: 'welcome', label: 'Welcome Email' },
    { value: 'order_confirm', label: 'Order Confirmation' },
    { value: 'order_shipped', label: 'Order Shipped' },
    { value: 'order_delivered', label: 'Order Delivered' },
    { value: 'newsletter', label: 'Newsletter Subscription' },
  ];

  const toggleRows = [
    { key: 'welcome', label: 'Welcome Email', desc: 'Sent when customer creates account.' },
    { key: 'forgot_password', label: 'Forgot Password', desc: 'Sent when customer requests password reset.' },
    { key: 'order_confirm', label: 'Order Confirmation', desc: 'Sent after successful order placement.' },
    { key: 'order_shipped', label: 'Order Shipped', desc: 'Sent when order is shipped.' },
    { key: 'order_delivered', label: 'Order Delivered', desc: 'Sent when order is delivered.' },
    { key: 'contact_form', label: 'Contact Form Notification', desc: 'Sent when customer submits contact form.' },
    { key: 'newsletter', label: 'Newsletter Subscription', desc: 'Sent after newsletter signup.' },
  ];

  return (
    <div className="admin-email-section">
      {/* Email Provider */}
      <div className="admin-email-card">
        <div className="admin-email-card-title">
          <Mail size={14} style={{ display: 'inline', marginRight: '8px' }} />
          Email Provider
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 600 }}>Current Provider: Brevo</span>
          <span className="admin-email-status-badge connected">🟢 Connected</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {[
            { label: 'Sender Name', key: 'senderName', type: 'text', placeholder: 'Off-Kilt' },
            { label: 'Sender Email', key: 'senderEmail', type: 'email', placeholder: 'offkiltfashion@gmail.com' },
            { label: 'Brevo API Key', key: 'apiKey', type: 'password', placeholder: '••••••••••••••••••' },
          ].map(field => (
            <div key={field.key}>
              <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '6px', letterSpacing: '1px', textTransform: 'uppercase' }}>
                {field.label}
              </label>
              <input
                type={field.type}
                value={emailProvider[field.key] || ''}
                onChange={e => setEmailProvider(p => ({ ...p, [field.key]: e.target.value }))}
                placeholder={field.placeholder}
                style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.72rem', width: 'auto' }}
            onClick={async () => { 
              localStorage.setItem('offkilt_email_provider', JSON.stringify(emailProvider)); 
              setProviderSaved(true); 
              await saveSettingsToBackend(emailProvider, emailToggles, null);
              setTimeout(() => setProviderSaved(false), 2000); 
            }}>
            {providerSaved ? <Check size={14} /> : <Save size={14} />}
            {providerSaved ? ' Saved!' : ' Save Changes'}
          </button>
          <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.72rem', width: 'auto' }}
            onClick={() => alert('Connection test: ✓ Brevo API key validated (simulated)')}>
            <Zap size={14} style={{ marginRight: '6px' }} /> Test Connection
          </button>
        </div>
      </div>

      {/* Automated Email Toggles */}
      <div className="admin-email-card">
        <div className="admin-email-card-title">
          <Send size={14} style={{ display: 'inline', marginRight: '8px' }} />
          Automated Emails
        </div>
        {toggleRows.map(row => (
          <div key={row.key} className="admin-email-toggle-row">
            <div>
              <div className="admin-email-toggle-label">{row.label}</div>
              <div className="admin-email-toggle-desc">{row.desc}</div>
            </div>
            <label className="admin-toggle-switch">
              <input
                type="checkbox"
                checked={emailToggles[row.key] !== false}
                onChange={e => setEmailToggles(t => ({ ...t, [row.key]: e.target.checked }))}
              />
              <span className="admin-toggle-slider" />
            </label>
          </div>
        ))}
        <button className="btn-primary" style={{ marginTop: '18px', padding: '10px 20px', fontSize: '0.72rem', width: 'auto' }}
          onClick={async () => { 
            localStorage.setItem('offkilt_email_toggles', JSON.stringify(emailToggles)); 
            setTogglesSaved(true); 
            await saveSettingsToBackend(emailProvider, emailToggles, null);
            setTimeout(() => setTogglesSaved(false), 2000); 
          }}>
          {togglesSaved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Preferences</>}
        </button>
      </div>

      {/* Email Templates */}
      <div className="admin-email-card">
        <div className="admin-email-card-title">Email Templates</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Type</label>
            <select value={selectedTemplate} onChange={e => setSelectedTemplate(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontFamily: 'var(--font-mono)', outline: 'none' }}>
              {emailTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Subject Line</label>
            <input type="text" value={templateSubject} onChange={e => setTemplateSubject(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
        </div>
        <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Content</label>
        <textarea className="admin-email-template-editor" value={templateBody} onChange={e => setTemplateBody(e.target.value)} rows={8} />
        <div style={{ display: 'flex', gap: '10px', marginTop: '14px' }}>
          <button className="btn-primary" style={{ padding: '10px 20px', fontSize: '0.72rem', width: 'auto' }}
            onClick={async () => {
              const tmpl = JSON.parse(localStorage.getItem('offkilt_email_templates') || '{}');
              tmpl[selectedTemplate] = { subject: templateSubject, body: templateBody };
              localStorage.setItem('offkilt_email_templates', JSON.stringify(tmpl));
              setTemplateSaved(true); 
              await saveSettingsToBackend(emailProvider, emailToggles, tmpl);
              setTimeout(() => setTemplateSaved(false), 2000);
            }}>
            {templateSaved ? <><Check size={14} /> Saved!</> : <><Save size={14} /> Save Template</>}
          </button>
          <button className="btn-secondary" style={{ padding: '10px 18px', fontSize: '0.72rem', width: 'auto' }}
            onClick={() => alert(`Preview — ${emailTypes.find(t=>t.value===selectedTemplate)?.label}\n\nSubject: ${templateSubject}\n\n${templateBody}`)}>
            <Eye size={14} style={{ marginRight: '6px' }} /> Preview
          </button>
        </div>
      </div>

      {/* Test Email */}
      <div className="admin-email-card">
        <div className="admin-email-card-title">
          <Send size={14} style={{ display: 'inline', marginRight: '8px' }} />
          Send Test Email
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Recipient Email</label>
            <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)} placeholder="test@example.com"
              style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontFamily: 'var(--font-mono)', outline: 'none', boxSizing: 'border-box' }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.68rem', fontFamily: 'var(--font-mono)', color: 'var(--text-grey)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '1px' }}>Email Type</label>
            <select style={{ width: '100%', padding: '10px 12px', fontSize: '0.82rem', border: '1.5px solid rgba(0,0,0,0.1)', borderRadius: '6px', fontFamily: 'var(--font-mono)', outline: 'none' }}>
              {emailTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
        </div>
        <button 
          className="btn-primary" 
          style={{ padding: '10px 20px', fontSize: '0.72rem', width: 'auto' }}
          disabled={testLoading}
          onClick={handleSendTestEmail}
        >
          {testLoading ? <RefreshCw size={14} className="spin-anim" style={{ marginRight: '6px' }} /> : <Send size={14} style={{ marginRight: '6px' }} />}
          {testLoading ? 'Sending...' : 'Send Test Email'}
        </button>
        {testResult === 'success' && (
          <div style={{ marginTop: '14px', padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', color: '#15803d', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Check size={14} /> Test email sent successfully to {testEmail}!
          </div>
        )}
        {testError && (
          <div style={{ marginTop: '14px', padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#dc2626', fontFamily: 'var(--font-mono)', fontSize: '0.75rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 'bold' }}>
              <AlertTriangle size={14} /> Test Email Dispatch Failed
            </div>
            <p style={{ margin: 0, paddingLeft: '22px' }}>{testError}</p>
          </div>
        )}
      </div>

      {/* Activity Log */}
      <div className="admin-email-card">
        <div className="admin-email-card-title">Recent Email Activity</div>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-email-log-table">
            <thead>
              <tr><th>Date</th><th>Type</th><th>Recipient</th><th>Status</th></tr>
            </thead>
            <tbody>
              {activityLog.map((log, i) => (
                <tr key={i}>
                  <td>{log.date}</td><td>{log.type}</td><td>{log.recipient}</td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      padding: '2px 8px', borderRadius: '20px', fontSize: '0.65rem', fontWeight: 600,
                      background: log.status === 'Delivered' ? '#f0fdf4' : '#fef2f2',
                      color: log.status === 'Delivered' ? '#15803d' : '#dc2626',
                      border: `1px solid ${log.status === 'Delivered' ? '#bbf7d0' : '#fecaca'}`
                    }}>
                      {log.status === 'Delivered' ? '✓' : '✕'} {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap' }}>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.72rem', width: 'auto' }} onClick={() => alert('Exporting logs... (simulated)')}>
            <Download size={13} style={{ marginRight: '6px' }} /> Export Logs
          </button>
          <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.72rem', width: 'auto' }} onClick={() => alert('Failed queue cleared! (simulated)')}>
            Clear Failed Queue
          </button>
        </div>
      </div>
    </div>
  );
}


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

  const saveGlobalSettingsToServer = async () => {
    const keys = [
      'offkilt_mega_menu',
      'offkilt_campaigns',
      'offkilt_categories_list',
      'offkilt_homepage_collections',
      'offkilt_category_metadata',
      'offkilt_homepage_grid_cards',
      'offkilt_narrative',
      'offkilt_instagram',
      'offkilt_best_sellers',
      'offkilt_fashion_film',
      'offkilt_instagram_gallery',
      'offkilt_company_pages',
      'offkilt_promo_discount_text',
      'offkilt_promo_discount_show',
      'offkilt_customer_love_stats',
      'offkilt_seo_products',
      'offkilt_razorpay_key',
      'offkilt_razorpay_secret',
      'offkilt_shiprocket_email',
      'offkilt_shiprocket_password',
      'offkilt_whatsapp_number',
      'offkilt_press_brands',
      'offkilt_announcement_text',
      'offkilt_announcement_show',
      'offkilt_announcement_bg',
      'offkilt_announcement_color',
      'offkilt_promo_popup_settings',
      'offkilt_genders_list',
      'offkilt_footer_settings',
      'offkilt_socials',
      'offkilt_partners',
      'offkilt_brand_story',
      'offkilt_review_stats',
      'offkilt_font_heading',
      'offkilt_font_body',
      'offkilt_menus',
      'offkilt_campaign_men',
      'offkilt_campaign_women',
      'offkilt_campaign_hero'
    ];
    const payload = {};
    keys.forEach(k => {
      const val = localStorage.getItem(k);
      if (val !== null) {
        try {
          payload[k] = JSON.parse(val);
        } catch (e) {
          payload[k] = val;
        }
      }
    });
    try {
      await adminApi.saveGlobalSettings(payload);
    } catch (err) {
      console.error('Failed to sync settings to server', err);
    }
  };

  useEffect(() => {
    const handleSettingsUpdated = async () => {
      await saveGlobalSettingsToServer();
    };
    window.addEventListener('offkilt_settings_updated', handleSettingsUpdated);
    return () => {
      window.removeEventListener('offkilt_settings_updated', handleSettingsUpdated);
    };
  }, []);

  const [gendersList, setGendersList] = useState(() => {
    const defaults = ['men', 'women'];
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_genders_list'));
      if (stored && Array.isArray(stored)) {
        return stored.filter(g => g !== 'unisex');
      }
    } catch (e) {}
    return defaults;
  });

  const [bulkTargetGender, setBulkTargetGender] = useState('men');

  const [reviewStatsForm, setReviewStatsForm] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_review_stats'));
      if (stored && stored.happyCustomers) return stored;
    } catch (e) {}
    return { happyCustomers: '10,000+', avgRating: '4.9', reviewCount: '5,000+' };
  });

  const [campaignsList, setCampaignsList] = useState(() => {
    const defaults = [
      {
        id: 'campaign-men',
        gender: 'men',
        title: "Denim Redefined",
        subtitle: "Crafted for the modern rebel. Raw denim, bold silhouettes, uncompromising attitude.",
        ctaText: "Explore Men's",
        image: "/images/mens_campaign.png",
        sectionInsertAfter: 'hero',
        visible: true
      },
      {
        id: 'campaign-women',
        gender: 'women',
        title: "Elegance Meets Edge",
        subtitle: "Structured denim and statement skirts for the confident woman who defies convention.",
        ctaText: "Explore Women's",
        image: "/images/womens_campaign.png",
        sectionInsertAfter: 'trending',
        visible: true
      }
    ];
    try {
      const stored = localStorage.getItem('offkilt_campaigns');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return defaults;
  });

  // --- 1. ANALYTICS STATE & MOCKS ---
  const [analyticsData, setAnalyticsData] = useState({
    totalSales: 0,
    totalOrders: 0,
    abandonmentRate: 0,
    conversionRate: 0,
    weeklySales: [
      { day: 'Mon', amount: 0 },
      { day: 'Tue', amount: 0 },
      { day: 'Wed', amount: 0 },
      { day: 'Thu', amount: 0 },
      { day: 'Fri', amount: 0 },
      { day: 'Sat', amount: 0 },
      { day: 'Sun', amount: 0 }
    ],
    fitDistribution: [
      { fit: 'Baggy', pct: 0, color: 'var(--accent-raw)' },
      { fit: 'Relaxed', pct: 0, color: 'var(--accent-gold)' },
      { fit: 'Boot Cut', pct: 0, color: '#3b82f6' },
      { fit: 'Slim/Skinny', pct: 0, color: '#10b981' }
    ],
    bestSellers: []
  });

  // --- 2. PRODUCTS CRUD STATE & LOGIC ---
  const [products, setProducts] = useState([]);
  const [productsLoading, setProductsLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    id: '', name: '', tagline: '', price: '', category: 'jeans', gender: 'unisex',
    image: '', hover_image: '', description: '', discountPrice: '',
    stock: '50', sku: '', swatches: [{ name: 'Raw Indigo', hex: '#1e293b' }, { name: 'Charcoal Black', hex: '#111111' }],
    sizes: ['30', '32', '34'],
    images: [],
    variants: [],
    slug: '',
    meta_title: '',
    meta_description: '',
    meta_keywords: '',
    size_guide: '',
    details: '',
    materials: '',
    shipping: ''
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

  const fetchOrders = async () => {
    try {
      const res = await adminApi.getAllOrders();
      if (res.data) {
        setOrders(res.data);
        localStorage.setItem('offkilt_orders', JSON.stringify(res.data));
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchOrders();
  }, []);

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    
    const mainImg = productForm.images?.[0] || productForm.image || '';
    const hoverImg = productForm.images?.[1] || productForm.hover_image || mainImg;

    const swatchesStr = Array.isArray(productForm.swatches)
      ? productForm.swatches.map(s => `${s.name.trim()}:${s.hex.trim()}`).join(', ')
      : productForm.swatches;

    const preparedVariants = Array.isArray(productForm.variants)
      ? productForm.variants.map(v => {
          let sizesArray = [];
          if (Array.isArray(v.sizes)) {
            sizesArray = v.sizes;
          } else if (typeof v.sizes === 'string') {
            sizesArray = v.sizes.split(',').map(s => s.trim()).filter(Boolean);
          }
          return {
            ...v,
            sizes: sizesArray,
            price: Number(v.price),
            stock: Number(v.stock)
          };
        })
      : [];

    const payload = {
      ...productForm,
      variants: preparedVariants,
      image: mainImg,
      hover_image: hoverImg,
      hoverImage: hoverImg,
      price: Number(productForm.price),
      discountPrice: productForm.discountPrice ? Number(productForm.discountPrice) : undefined,
      stock: Number(productForm.stock),
      sizes: productForm.sizes,
      size_guide: productForm.size_guide || '',
      details: typeof productForm.details === 'string' ? productForm.details.split('\n').map(d => d.trim()).filter(Boolean) : (Array.isArray(productForm.details) ? productForm.details : []),
      materials: productForm.materials || "100% heavyweight selvedge denim",
      shipping: productForm.shipping || "Standard delivery 3-5 business days"
    };

    try {
      if (editingProductId) {
        await adminApi.updateProduct(editingProductId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      setProductForm({
        id: '', name: '', tagline: '', price: '', category: 'jeans', gender: 'unisex',
        image: '', hover_image: '', description: '', discountPrice: '',
        stock: '50', sku: '', swatches: [{ name: 'Raw Indigo', hex: '#1e293b' }, { name: 'Charcoal Black', hex: '#111111' }],
        sizes: ['30', '32', '34'],
        images: [],
        variants: [],
        slug: '',
        meta_title: '',
        meta_description: '',
        meta_keywords: '',
        size_guide: '',
        details: '',
        materials: '',
        shipping: ''
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

    let swatchArr = [];
    if (swatchStr) {
      swatchArr = swatchStr.split(',').map(s => {
        const parts = s.split(':');
        return { name: parts[0]?.trim() || '', hex: parts[1]?.trim() || '#111111' };
      });
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
      gender: p.gender || 'unisex',
      image: p.image || '',
      hover_image: p.hoverImage || p.hover_image || '',
      images: productImages,
      description: p.description || '',
      discountPrice: p.discountPrice || '',
      stock: p.stock || '50',
      sku: p.sku || p.id,
      swatches: swatchArr,
      sizes: Array.isArray(p.sizes) ? p.sizes : ['30', '32', '34'],
      variants: p.variants || [],
      slug: p.slug || '',
      meta_title: p.meta_title || '',
      meta_description: p.meta_description || '',
      meta_keywords: p.meta_keywords || '',
      size_guide: p.size_guide || '',
      details: Array.isArray(p.details) ? p.details.join('\n') : (p.details || ''),
      materials: p.materials || '',
      shipping: p.shipping || ''
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

  const handleAddVariant = () => {
    const nextId = 'v-' + Math.random().toString(36).substr(2, 9);
    const newVariant = {
      id: nextId,
      color: 'New Color',
      hex: '#000000',
      price: productForm.price ? Number(productForm.price) : 2999,
      stock: 50,
      sku: productForm.sku ? `${productForm.sku}-${nextId.toUpperCase()}` : `SKU-${nextId.toUpperCase()}`,
      images: [],
      status: 'available',
      sizes: '',
      display_order: productForm.variants ? productForm.variants.length : 0
    };
    setProductForm(prev => ({
      ...prev,
      variants: [...(prev.variants || []), newVariant]
    }));
  };

  const handleUpdateVariant = (idx, field, value) => {
    setProductForm(prev => {
      const updatedVariants = [...(prev.variants || [])];
      updatedVariants[idx] = { ...updatedVariants[idx], [field]: value };
      return { ...prev, variants: updatedVariants };
    });
  };

  const handleDeleteVariant = (idx) => {
    setProductForm(prev => {
      const updatedVariants = (prev.variants || []).filter((_, i) => i !== idx);
      // Re-index display_order
      const indexed = updatedVariants.map((v, i) => ({ ...v, display_order: i }));
      return { ...prev, variants: indexed };
    });
  };

  const handleMoveVariant = (idx, direction) => {
    setProductForm(prev => {
      const variants = [...(prev.variants || [])];
      if (direction === 'up' && idx > 0) {
        const temp = variants[idx];
        variants[idx] = variants[idx - 1];
        variants[idx - 1] = temp;
      } else if (direction === 'down' && idx < variants.length - 1) {
        const temp = variants[idx];
        variants[idx] = variants[idx + 1];
        variants[idx + 1] = temp;
      }
      // Re-index display_order
      const updated = variants.map((v, i) => ({ ...v, display_order: i }));
      return { ...prev, variants: updated };
    });
  };

  const handleVariantImagesUpload = (e, idx) => {
    const files = Array.from(e.target.files || []);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProductForm(prev => {
          const updatedVariants = [...(prev.variants || [])];
          const variant = updatedVariants[idx];
          if (variant) {
            const updatedImages = [...(variant.images || []), reader.result];
            updatedVariants[idx] = { ...variant, images: updatedImages };
          }
          return { ...prev, variants: updatedVariants };
        });
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveVariantImage = (variantIdx, imgIdx) => {
    setProductForm(prev => {
      const updatedVariants = [...(prev.variants || [])];
      const variant = updatedVariants[variantIdx];
      if (variant) {
        const updatedImages = (variant.images || []).filter((_, i) => i !== imgIdx);
        updatedVariants[variantIdx] = { ...variant, images: updatedImages };
      }
      return { ...prev, variants: updatedVariants };
    });
  };

  // --- 3. ORDERS STATE & INVOICING ---
  const [orders, setOrders] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_orders')) || [];
    } catch (e) {
      return [];
    }
  });

  // Dynamic analytics helper calculations based on actual orders list
  const getWeeklySales = (ordersList) => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const salesByDay = {
      'Mon': 0, 'Tue': 0, 'Wed': 0, 'Thu': 0, 'Fri': 0, 'Sat': 0, 'Sun': 0
    };
    
    ordersList.forEach(o => {
      let dayName = 'Mon';
      try {
        const dateStr = o.created_at || o.date;
        if (dateStr) {
          const d = new Date(dateStr);
          if (!isNaN(d.getTime())) {
            dayName = days[d.getDay()];
          }
        }
      } catch (e) {}
      if (salesByDay[dayName] !== undefined) {
        salesByDay[dayName] += Number(o.total || 0);
      }
    });

    return Object.keys(salesByDay).map(day => ({
      day,
      amount: salesByDay[day]
    }));
  };

  const getFitDistribution = (ordersList) => {
    let baggy = 0, relaxed = 0, bootcut = 0, slim = 0;
    ordersList.forEach(o => {
      if (o.items) {
        o.items.forEach(item => {
          const name = (item.name || '').toLowerCase();
          if (name.includes('baggy') || name.includes('cargo') || name.includes('carpenter')) {
            baggy += item.quantity || 1;
          } else if (name.includes('relaxed') || name.includes('paneled') || name.includes('skirt')) {
            relaxed += item.quantity || 1;
          } else if (name.includes('boot') || name.includes('cut')) {
            bootcut += item.quantity || 1;
          } else {
            slim += item.quantity || 1;
          }
        });
      }
    });
    
    const total = baggy + relaxed + bootcut + slim;
    if (total === 0) {
      return [
        { fit: 'Baggy', pct: 0, color: 'var(--accent-raw)' },
        { fit: 'Relaxed', pct: 0, color: 'var(--accent-gold)' },
        { fit: 'Boot Cut', pct: 0, color: '#3b82f6' },
        { fit: 'Slim/Skinny', pct: 0, color: '#10b981' }
      ];
    }
    
    return [
      { fit: 'Baggy', pct: Math.round((baggy / total) * 100), color: 'var(--accent-raw)' },
      { fit: 'Relaxed', pct: Math.round((relaxed / total) * 100), color: 'var(--accent-gold)' },
      { fit: 'Boot Cut', pct: Math.round((bootcut / total) * 100), color: '#3b82f6' },
      { fit: 'Slim/Skinny', pct: Math.round((slim / total) * 100), color: '#10b981' }
    ];
  };

  const getBestSellers = (ordersList) => {
    const productStats = {};
    ordersList.forEach(o => {
      if (o.items) {
        o.items.forEach(item => {
          const id = item.id || item.productId || 'UNKNOWN';
          const name = item.name || 'Unknown Product';
          const qty = item.quantity || 1;
          const revenue = Number(item.price || 0) * qty;
          
          if (!productStats[id]) {
            productStats[id] = { id, name, qty: 0, revenue: 0 };
          }
          productStats[id].qty += qty;
          productStats[id].revenue += revenue;
        });
      }
    });
    
    return Object.values(productStats)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  };

  useEffect(() => {
    const totalOrders = orders.length;
    const totalSales = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const weeklySales = getWeeklySales(orders);
    const fitDistribution = getFitDistribution(orders);
    const bestSellers = getBestSellers(orders);
    
    const abandonmentRate = totalOrders > 0 ? 24 : 0;
    const conversionRate = totalOrders > 0 ? 3.6 : 0;

    setAnalyticsData({
      totalSales,
      totalOrders,
      abandonmentRate,
      conversionRate,
      weeklySales,
      fitDistribution,
      bestSellers
    });
  }, [orders]);

  const [selectedOrder, setSelectedOrder] = useState(null);
  const [invoiceModalOpen, setInvoiceModalOpen] = useState(false);
  const [orderSearch, setOrderSearch] = useState('');

  // Helper derived values for invoice rendering with robust camelCase & snake_case fallbacks
  const getInvoiceDetails = (order) => {
    if (!order) return {};
    const total = order.total !== undefined && order.total !== null 
      ? order.total 
      : ((order.subtotal || 0) - (order.discount || 0) + (order.shipping_fee !== undefined ? order.shipping_fee : (order.shipping !== undefined ? order.shipping : 0)));
    const shipping = order.shipping_fee !== undefined 
      ? order.shipping_fee 
      : (order.shipping !== undefined ? order.shipping : 0);
    const address = order.shipping_address || order.shippingAddress || '';
    const method = order.payment_method || order.paymentMethod || 'Prepaid';
    const date = order.date || (order.created_at ? new Date(order.created_at).toLocaleDateString('en-IN') : '');
    return { total, shipping, address, method, date };
  };
  const invoiceDetails = getInvoiceDetails(selectedOrder);


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
    try {
      localStorage.setItem(`offkilt_campaign_${section}`, JSON.stringify(data));
    } catch (e) {
      console.error('localStorage quota exceeded when saving campaign:', e);
      alert('Image is too large for storage. Please use a smaller image (under 500KB).');
      return;
    }
    triggerSync('offkilt_settings_updated');
    alert(`${section === 'men' ? "Men's" : "Women's"} campaign settings saved!`);
  };

  // Compress image to max 1200px wide before base64 encoding to avoid localStorage quota errors
  const compressImage = (file, maxWidth = 1200, quality = 0.82) => {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        let { width, height } = img;
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        // Fall back to original FileReader if canvas fails
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.readAsDataURL(file);
      };
      img.src = url;
    });
  };

  const handleCampaignImageUpload = (section, file) => {
    if (!file) return;
    compressImage(file).then((dataUrl) => {
      // Use functional updater so we always have latest campaigns state (no stale closure)
      setCampaigns(prev => {
        const updated = { ...prev[section], image: dataUrl };
        const newState = { ...prev, [section]: updated };
        try {
          localStorage.setItem(`offkilt_campaign_${section}`, JSON.stringify(updated));
        } catch (e) {
          console.error('localStorage quota exceeded:', e);
          alert('Image is too large for browser storage even after compression. Please use a smaller image.');
          return prev; // revert state
        }
        triggerSync('offkilt_settings_updated');
        return newState;
      });
    });
  };

  const handleHeroMediaUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const isVideo = file.type.startsWith('video/');
        if (isVideo) {
          await saveMediaToIndexedDB('hero_video_blob', file);
          const updated = { 
            ...campaigns.hero, 
            mediaUrl: 'indexeddb:hero_video_blob',
            mediaType: 'video'
          };
          setCampaigns(prev => ({ ...prev, hero: updated }));
          localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
          window.dispatchEvent(new Event('offkilt_hero_updated'));
          alert('Hero background video uploaded successfully!');
        } else {
          const reader = new FileReader();
          reader.onloadend = () => {
            const updated = { 
              ...campaigns.hero, 
              mediaUrl: reader.result,
              mediaType: 'image'
            };
            setCampaigns(prev => ({ ...prev, hero: updated }));
            localStorage.setItem('offkilt_campaign_hero', JSON.stringify(updated));
            window.dispatchEvent(new Event('offkilt_hero_updated'));
            alert('Hero background image updated successfully!');
          };
          reader.readAsDataURL(file);
        }
      } catch (err) {
        console.error(err);
        alert('Failed to upload hero media.');
      }
    }
  };

  const handleFashionFilmVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('video/')) {
        alert('Please select a valid video file.');
        return;
      }
      try {
        await saveMediaToIndexedDB('fashion_film_video_blob', file);
        setFashionFilm(prev => ({ ...prev, videoUrl: 'indexeddb:fashion_film_video_blob' }));
        alert('Video uploaded successfully to local database! Press "Save Fashion Film Settings" to apply.');
      } catch (err) {
        console.error(err);
        alert('Failed to save video to local database.');
      }
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

  // --- Newsletter Promo Popup CMS ---
  const [promoPopupSettings, setPromoPopupSettings] = useState(() => {
    const defaults = {
      enabled: true,
      title: 'JOIN & RECEIVE UP TO 20% OFF YOUR FIRST ORDER',
      subtitle: 'FREE SHIPPING IN INDIA',
      discountCode: 'WELCOME20',
      coverImage: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=85',
    };
    try {
      const stored = localStorage.getItem('offkilt_promo_popup_settings');
      if (stored) return JSON.parse(stored);
    } catch(e) {}
    return defaults;
  });

  const handleSavePromoPopup = () => {
    localStorage.setItem('offkilt_promo_popup_settings', JSON.stringify(promoPopupSettings));
    // Reset dismissed state so the popup shows again for all visitors
    if (promoPopupSettings.enabled) {
      localStorage.removeItem('offkilt_promo_popup_dismissed');
    }
    triggerSync('offkilt_settings_updated');
    alert('Newsletter Promo Popup settings saved successfully!');
  };

  // --- Collections CMS ---
  const [homepageCollections, setHomepageCollections] = useState(() => {
    const defaults = {
      bestSellersCover: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
      bestSellersTitle: 'Best Sellers',
      trendingCover: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=700&q=85',
      trendingTitle: 'Trending Collection',
      trendingTagline: 'TRENDING LOOKBOOK',
      styleCover: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=500&q=85',
      styleTitle: 'Shop By Style',
      styleTagline: 'STYLE MANUAL'
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
    try {
      const stored = JSON.parse(localStorage.getItem('offkilt_categories_list'));
      return (Array.isArray(stored) && stored.length > 0) ? stored : defaults;
    } catch (e) {
      return defaults;
    }
  });
  const [categoriesInput, setCategoriesInput] = useState(() => {
    try {
      const defaults = ['all', 'jeans', 'skirts', 'cargos', 'shirts'];
      const stored = JSON.parse(localStorage.getItem('offkilt_categories_list'));
      const list = (Array.isArray(stored) && stored.length > 0) ? stored : defaults;
      return list.join(', ');
    } catch (e) {
      return 'all, jeans, skirts, cargos, shirts';
    }
  });

  const handleCategoriesSave = () => {
    const arr = categoriesInput.split(',').map(x => x.trim()).filter(Boolean);
    setCategoryList(arr);
    localStorage.setItem('offkilt_categories_list', JSON.stringify(arr));
    triggerSync('offkilt_settings_updated');
    alert('Category list saved!');
  };

  const [newCustomCategoryInput, setNewCustomCategoryInput] = useState('');
  const handleAddNewCategory = () => {
    const trimmed = newCustomCategoryInput.trim().toLowerCase();
    if (!trimmed) return;
    if (categoryList.includes(trimmed)) {
      alert('Category already exists!');
      return;
    }
    const updatedList = [...categoryList, trimmed];
    setCategoryList(updatedList);
    setCategoriesInput(updatedList.join(', '));
    localStorage.setItem('offkilt_categories_list', JSON.stringify(updatedList));
    setSelectedMetaCategory(trimmed);
    setCategoryMetaForm({ tagline: '', coverImage: '' });
    setNewCustomCategoryInput('');
    triggerSync('offkilt_settings_updated');
    alert(`Category "${trimmed}" added! You can now set its tagline and banner.`);
  };

  // --- Category Banner Metadata CMS ---
  const [categoryMetadata, setCategoryMetadata] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_category_metadata')) || {};
    } catch (e) {
      return {};
    }
  });
  const [selectedMetaCategory, setSelectedMetaCategory] = useState('all');
  const [categoryMetaForm, setCategoryMetaForm] = useState({ tagline: '', coverImage: '' });

  const handleSelectMetaCategory = (cat) => {
    setSelectedMetaCategory(cat);
    const meta = categoryMetadata[cat.toLowerCase()] || { tagline: '', coverImage: '' };
    setCategoryMetaForm({
      tagline: meta.tagline || '',
      coverImage: meta.coverImage || ''
    });
  };

  useEffect(() => {
    const firstCat = categoryList[0] || 'all';
    setSelectedMetaCategory(firstCat);
    const meta = categoryMetadata[firstCat.toLowerCase()] || { tagline: '', coverImage: '' };
    setCategoryMetaForm({
      tagline: meta.tagline || '',
      coverImage: meta.coverImage || ''
    });
  }, [categoryList]);

  // --- Homepage Grid Cards CMS ---
  const [gridCardsMetadata, setGridCardsMetadata] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_homepage_grid_cards')) || {};
    } catch (e) {
      return {};
    }
  });

  const GRID_CARD_DEFAULTS = {
    // Trending Lookbook (TrendingCollection)
    'summer': { title: 'Summer Breeze', tag: 'Collection', bg: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=85', category: 'all' },
    'party': { title: 'Party Glam', tag: 'Occasion Wear', bg: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=600&q=85', category: 'all' },
    'office': { title: 'Office Chic', tag: 'Work Edit', bg: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&q=85', category: 'all' },
    'ethnic': { title: 'Ethnic Fusion', tag: 'Heritage', bg: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=600&q=85', category: 'all' },
    'street': { title: 'Street Style', tag: 'Urban', bg: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=600&q=85', category: 'all' },
    // Shop By Style (ShopByStyle)
    'casual': { title: 'Casual', tag: 'Effortlessly cool', bg: 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400&q=85', category: 'all' },
    'minimal': { title: 'Minimal', tag: 'Less is more', bg: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400&q=85', category: 'all' },
    'korean': { title: 'Korean Fashion', tag: 'K-style vibes', bg: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=400&q=85', category: 'all' },
    'western': { title: 'Western', tag: 'Modern west edit', bg: 'https://images.unsplash.com/photo-1584370848010-d7fe6bc767ec?w=400&q=85', category: 'jeans' },
    'traditional': { title: 'Traditional', tag: 'Heritage meets now', bg: 'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=400&q=85', category: 'all' },
    'evening': { title: 'Luxury Evening', tag: 'Night of elegance', bg: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=400&q=85', category: 'skirts' }
  };

  const [selectedGridCardId, setSelectedGridCardId] = useState('summer');
  const [gridCardForm, setGridCardForm] = useState({ title: '', tag: '', bg: '', category: 'all' });

  const handleSelectGridCard = (cardId) => {
    setSelectedGridCardId(cardId);
    const custom = gridCardsMetadata[cardId] || {};
    const fallback = GRID_CARD_DEFAULTS[cardId] || { title: '', tag: '', bg: '', category: 'all' };
    setGridCardForm({
      title: custom.title || fallback.title || '',
      tag: custom.tag || fallback.tag || '',
      bg: custom.bg || fallback.bg || '',
      category: custom.category || fallback.category || 'all'
    });
  };

  useEffect(() => {
    handleSelectGridCard('summer');
  }, []);

  // --- NAVIGATION / MENUS CONTROL ---
  const [menuItems, setMenuItems] = useState(() => {
    const defaults = [
      { label: 'New', link: '#new-arrivals', visible: true },
      { label: 'Men', link: '#campaign-men', category: 'jeans', visible: true },
      { label: 'Women', link: '#campaign-women', category: 'skirts', visible: true },
      { label: 'Collection', link: '#catalog', category: 'all', visible: true },
      { label: 'After Dark', link: '#catalog', category: 'all', visible: true },
      { label: 'Sale', link: '#catalog', category: 'sale', visible: true }
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
        label: 'Men',
        sections: [
          {
            title: 'DENIM FIT',
            links: [
              { name: 'Baggy', filter: 'baggy' },
              { name: 'Relaxed', filter: 'relaxed' },
              { name: 'Boot Cut', filter: 'boot cut' },
              { name: 'Slim', filter: 'slim' },
              { name: 'Skinny', filter: 'skinny' },
            ]
          },
          {
            title: 'CATEGORIES',
            links: [
              { name: 'All Jeans', filter: 'jeans' },
              { name: 'New Arrivals', filter: 'all' },
              { name: 'Cargo & Utility', filter: 'jeans' },
              { name: 'Carpenter', filter: 'jeans' },
            ]
          }
        ],
        featured: {
          image: '/images/mens_campaign.png',
          title: 'Men\'s SS26 Campaign',
          cta: 'Explore Men\'s',
          filter: 'jeans'
        }
      },
      women: {
        label: 'Women',
        sections: [
          {
            title: 'DENIM FIT',
            links: [
              { name: 'Baggy', filter: 'baggy' },
              { name: 'Relaxed', filter: 'relaxed' },
              { name: 'Boot Cut', filter: 'boot cut' },
              { name: 'Slim', filter: 'slim' },
              { name: 'Skinny', filter: 'skinny' },
            ]
          },
          {
            title: 'CATEGORIES',
            links: [
              { name: 'All Products', filter: 'all' },
              { name: 'Denim Skirts', filter: 'skirts' },
              { name: 'Kilt Skirts', filter: 'skirts' },
              { name: 'New Arrivals', filter: 'all' },
            ]
          }
        ],
        featured: {
          image: '/images/womens_campaign.png',
          title: 'Women\'s SS26 Campaign',
          cta: 'Explore Women\'s',
          filter: 'skirts'
        }
      },
      'after-dark': {
        label: 'After Dark',
        sections: [
          {
            title: 'MEN',
            links: [
              { name: 'Fits', filter: 'all' },
            ]
          },
          {
            title: 'WOMEN',
            links: [
              { name: 'Fits', filter: 'all' },
              { name: 'Skirts', filter: 'skirts' }
            ]
          }
        ],
        featured: {
          image: '/images/narrative_cover.png',
          title: 'After Dark Campaign',
          cta: 'Explore Collection',
          filter: 'all'
        }
      }
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_mega_menu')) || DEFAULT_MEGA;
    } catch(e) {
      return DEFAULT_MEGA;
    }
  });

  const [selectedMegaKey, setSelectedMegaKey] = useState('men');
  const [newMegaKeyInput, setNewMegaKeyInput] = useState('');

  const handleAddMegaCategory = () => {
    const key = newMegaKeyInput.toLowerCase().trim().replace(/\s+/g, '-');
    if (!key) return;
    if (megaMenuSettings[key]) {
      alert('This mega menu category already exists!');
      return;
    }
    const label = newMegaKeyInput.trim();
    const updated = {
      ...megaMenuSettings,
      [key]: {
        label: label,
        sections: [
          { title: 'CATEGORIES', links: [{ name: `All ${label}`, filter: 'all' }] }
        ],
        featured: {
          image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=800',
          title: `${label} Collection`,
          cta: 'Shop Now',
          filter: 'all'
        }
      }
    };
    setMegaMenuSettings(updated);
    setSelectedMegaKey(key);
    setNewMegaKeyInput('');
    alert(`Category "${label}" added to Mega Menu! Remember to add it to Header Navigation too.`);
  };

  const handleDeleteMegaCategory = (key) => {
    if (key === 'men' || key === 'women') {
      alert('Default categories "Men" and "Women" cannot be deleted.');
      return;
    }
    if (window.confirm(`Are you sure you want to delete the "${key}" Mega Menu category?`)) {
      const updated = { ...megaMenuSettings };
      delete updated[key];
      setMegaMenuSettings(updated);
      setSelectedMegaKey('men');
    }
  };

  const handleAddSection = () => {
    const current = megaMenuSettings[selectedMegaKey];
    if (!current) return;
    const updatedSections = [...(current.sections || []), { title: 'NEW SECTION', links: [{ name: 'New Link', filter: 'all' }] }];
    setMegaMenuSettings({
      ...megaMenuSettings,
      [selectedMegaKey]: {
        ...current,
        sections: updatedSections
      }
    });
  };

  const handleDeleteSection = (secIdx) => {
    const current = megaMenuSettings[selectedMegaKey];
    if (!current) return;
    const updatedSections = (current.sections || []).filter((_, idx) => idx !== secIdx);
    setMegaMenuSettings({
      ...megaMenuSettings,
      [selectedMegaKey]: {
        ...current,
        sections: updatedSections
      }
    });
  };

  const handleAddLink = (secIdx) => {
    const current = megaMenuSettings[selectedMegaKey];
    if (!current) return;
    const updatedSections = [...(current.sections || [])];
    updatedSections[secIdx] = {
      ...updatedSections[secIdx],
      links: [...(updatedSections[secIdx].links || []), { name: 'New Link', filter: 'all' }]
    };
    setMegaMenuSettings({
      ...megaMenuSettings,
      [selectedMegaKey]: {
        ...current,
        sections: updatedSections
      }
    });
  };

  const handleDeleteLink = (secIdx, linkIdx) => {
    const current = megaMenuSettings[selectedMegaKey];
    if (!current) return;
    const updatedSections = [...(current.sections || [])];
    updatedSections[secIdx] = {
      ...updatedSections[secIdx],
      links: (updatedSections[secIdx].links || []).filter((_, idx) => idx !== linkIdx)
    };
    setMegaMenuSettings({
      ...megaMenuSettings,
      [selectedMegaKey]: {
        ...current,
        sections: updatedSections
      }
    });
  };

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
    try {
      const parsed = JSON.parse(localStorage.getItem('offkilt_seo'));
      if (parsed) {
        return {
          home: { ...defaults.home, ...parsed.home },
          catalog: { ...defaults.catalog, ...parsed.catalog }
        };
      }
      return defaults;
    } catch(e) {
      return defaults;
    }
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


  const handleClearOrdersAndAnalytics = async () => {
    if (window.confirm('Wipe all order history and reset analytics to zero for a clean production start? This cannot be undone.')) {
      try {
        for (const order of orders) {
          const id = order.id || order.orderId;
          if (id) {
            await adminApi.deleteOrder(id);
          }
        }
      } catch (err) {
        console.error("Failed to delete some orders from backend API", err);
      }
      localStorage.removeItem('offkilt_orders');
      setOrders([]);
      triggerSync('offkilt_orders_updated');
      triggerSync('offkilt_settings_updated');
      alert('Order history cleared and analytics reset to zero.');
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
  const [editingAdminEmail, setEditingAdminEmail] = useState(null);

  const handleAddAdmin = (e) => {
    e.preventDefault();
    if (!newAdmin.name || !newAdmin.email) return;
    const permissions = newAdmin.role === 'Super Admin' ? 'Full Access' : 
                        (newAdmin.role === 'Catalog Manager' ? 'Write: Catalog, Content CMS' : 'Write: Orders, Shipments');
    
    let updated;
    if (editingAdminEmail) {
      updated = roles.map(r => r.email === editingAdminEmail ? { ...newAdmin, permissions } : r);
      setEditingAdminEmail(null);
      alert('Access Operator updated successfully!');
    } else {
      if (roles.some(r => r.email === newAdmin.email)) {
        alert("An admin account with this email already exists!");
        return;
      }
      updated = [...roles, { ...newAdmin, permissions }];
      alert('Access Operator registered successfully!');
    }
    
    setRoles(updated);
    localStorage.setItem('offkilt_admin_roles', JSON.stringify(updated));
    setNewAdmin({ name: '', email: '', role: 'Catalog Manager' });
  };

  const handleDeleteAdmin = (email) => {
    if (email === currentUser?.email) {
      alert("You cannot remove your own admin access!");
      return;
    }
    if (window.confirm(`Are you sure you want to remove admin access for ${email}?`)) {
      const updated = roles.filter(r => r.email !== email);
      setRoles(updated);
      localStorage.setItem('offkilt_admin_roles', JSON.stringify(updated));
      alert('Access Operator removed successfully.');
    }
  };

  // --- Promo Discount CMS ---
  const [promoText, setPromoText] = useState(() => localStorage.getItem('offkilt_promo_discount_text') || 'Extra 20% off ₹8,000+');
  const [showPromo, setShowPromo] = useState(() => localStorage.getItem('offkilt_promo_discount_show') !== 'false');

  const handlePromoDiscountSave = (e) => {
    e.preventDefault();
    localStorage.setItem('offkilt_promo_discount_text', promoText);
    localStorage.setItem('offkilt_promo_discount_show', showPromo ? 'true' : 'false');
    triggerSync('offkilt_settings_updated');
    alert('Promotional discount settings saved!');
  };

  // --- Product SEO CMS ---
  const [productSeoList, setProductSeoList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('offkilt_seo_products')) || {};
    } catch(e) {
      return {};
    }
  });
  const [selectedSeoProductId, setSelectedSeoProductId] = useState(null);
  const [seoProductForm, setSeoProductForm] = useState({ title: '', desc: '', keywords: '' });
  const [seoProductSearch, setSeoProductSearch] = useState('');

  const handleSaveProductSeo = (e) => {
    e.preventDefault();
    if (!selectedSeoProductId) return;
    const updated = {
      ...productSeoList,
      [selectedSeoProductId]: seoProductForm
    };
    setProductSeoList(updated);
    localStorage.setItem('offkilt_seo_products', JSON.stringify(updated));
    setSelectedSeoProductId(null);
    setSeoProductForm({ title: '', desc: '', keywords: '' });
    alert('Product SEO tags saved!');
  };

  // --- Website Content CMS State ---
  const [pressBrandsInput, setPressBrandsInput] = useState(() => {
    const defaults = ['Vogue India', 'Grazia', 'Elle', 'Femina', 'Harper\'s Bazaar'];
    try {
      const stored = localStorage.getItem('offkilt_press_brands');
      const list = stored ? JSON.parse(stored) : defaults;
      return list.join(', ');
    } catch (e) {
      return defaults.join(', ');
    }
  });

  const [tickerItemsInput, setTickerItemsInput] = useState(() => {
    const defaults = ['NEW ARRIVALS', '✦', 'JUST LANDED', '✦', 'FRESH DROPS', '✦', 'NEW SEASON', '✦', 'SHOP NOW', '✦'];
    try {
      const stored = localStorage.getItem('offkilt_ticker_items');
      const list = stored ? JSON.parse(stored) : defaults;
      return list.join(', ');
    } catch (e) {
      return defaults.join(', ');
    }
  });

  const [companyPages, setCompanyPages] = useState(() => {
    const defaults = {
      about: {
        title: "About Us",
        content: `Off-Kilt is not just a brand—it's an attitude. Born from the spirit of rebellion and self-expression, Off-Kilt challenges the ordinary and redefines modern denim.\n\nOur philosophy is simple: fashion should have an edge. We merge heavy-weight selvedge denim fabrics, utility silhouettes, and premium hardware to create garments that feel like armor for the street. Every raw edge, offset pocket, and asymmetric stitch is a deliberate choice.\n\nStay raw, stay rebellious.`
      },
      refund: {
        title: "Refund & Return Policy",
        content: `We offer a 7-day hassle-free return and exchange policy. Items must be unworn, unwashed, and in their original packaging with tags intact.\n\nTo initiate a return or exchange, contact support via our WhatsApp widget or email. Refunds are processed back to your original payment method (or store credit for COD) within 5-7 business days of our warehouse receiving the return.`
      },
      faq: {
        title: "Frequently Asked Questions",
        content: `Q: How do I track my order?\nA: You can track your order using the 'Track Order' option in the menu by entering your Order ID.\n\nQ: Do you offer free shipping?\nA: Yes! We offer free shipping on all orders above ₹5,000 across India.\n\nQ: What payment methods do you support?\nA: We accept all major credit/debit cards, net banking, UPI, and wallets via Razorpay Checkout. Cash on Delivery (COD) is also available.`
      },
      terms: {
        title: "Terms & Conditions",
        content: `Welcome to Off-Kilt. By accessing or using our website, you agree to comply with and be bound by these terms and conditions. All content, designs, and brand elements are copyrighted.\n\nPrices are subject to change without notice. We reserve the right to cancel or refuse any orders at our discretion. STAY RAW.`
      },
      career: {
        title: "Careers",
        content: `We are always looking for creative rebels to join our design, marketing, and operations teams.\n\nIf you have a passion for heavy-weight streetwear and selvedge denim, send your CV and portfolio to careers@off-kilt.com. Join the rebellion.`
      },
      partnership: {
        title: "Partnership & Collaborations",
        content: `Are you an influencer, designer, or boutique looking to collaborate with us? We'd love to chat!\n\nDrop us an email at collab@off-kilt.com with your proposal, social handles, and ideas. Let's create something extraordinary.`
      }
    };
    try {
      return JSON.parse(localStorage.getItem('offkilt_company_pages')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  const [selectedCompanyPageKey, setSelectedCompanyPageKey] = useState('about');
  const [currentPageForm, setCurrentPageForm] = useState({
    title: '',
    content: ''
  });

  useEffect(() => {
    const page = companyPages[selectedCompanyPageKey] || { title: '', content: '' };
    setCurrentPageForm({
      title: page.title || '',
      content: page.content || ''
    });
  }, [selectedCompanyPageKey, companyPages]);

  const handleCompanyPageFormChange = (field, value) => {
    setCurrentPageForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveCompanyPage = () => {
    const updatedPages = {
      ...companyPages,
      [selectedCompanyPageKey]: {
        title: currentPageForm.title,
        content: currentPageForm.content
      }
    };
    setCompanyPages(updatedPages);
    localStorage.setItem('offkilt_company_pages', JSON.stringify(updatedPages));
    triggerSync('offkilt_settings_updated');
    alert(`Company Page "${currentPageForm.title}" saved successfully!`);
  };

  const handleSaveWebsiteContentCms = (e) => {
    if (e) e.preventDefault();
    const brandsArr = pressBrandsInput.split(',').map(x => x.trim()).filter(Boolean);
    const tickerArr = tickerItemsInput.split(',').map(x => x.trim()).filter(Boolean);

    localStorage.setItem('offkilt_press_brands', JSON.stringify(brandsArr));
    localStorage.setItem('offkilt_ticker_items', JSON.stringify(tickerArr));
    triggerSync('offkilt_settings_updated');
    alert('Website Content CMS settings saved!');
  };

  const [bestsellers, setBestsellers] = useState(() => {
    const defaults = [
      {
        id: 'bs1',
        name: 'Signature Flared Denim',
        price: 2999,
        originalPrice: 3999,
        label: 'most-loved',
        labelText: 'Most Loved',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=85',
        rating: 4.9,
        reviews: 284,
      },
      {
        id: 'bs2',
        name: 'Asymmetric Denim Midi Skirt',
        price: 1999,
        originalPrice: null,
        label: 'trending-now',
        labelText: 'Trending Now',
        image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=85',
        rating: 4.7,
        reviews: 167,
      },
      {
        id: 'bs3',
        name: 'Wide-Leg High-Waist Trousers',
        price: 3499,
        originalPrice: 4499,
        label: 'limited-edition',
        labelText: 'Limited Edition',
        image: 'https://images.unsplash.com/photo-1485218126466-34e6392ec754?w=600&q=85',
        rating: 5.0,
        reviews: 53,
      }
    ];
    try {
      return JSON.parse(localStorage.getItem('offkilt_bestsellers')) || defaults;
    } catch (e) {
      return defaults;
    }
  });

  const handleSaveBestseller = (idx, updatedCard) => {
    const updated = [...bestsellers];
    updated[idx] = updatedCard;
    setBestsellers(updated);
    localStorage.setItem('offkilt_bestsellers', JSON.stringify(updated));
    triggerSync('offkilt_settings_updated');
    alert('Best Seller Card saved!');
  };

  // --- RENDERING TABS SIDEBAR ---
  const menuConfig = [
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'products', label: 'Product Catalog', icon: Package },
    { id: 'orders', label: 'Order Manager', icon: ShoppingBag },
    { id: 'payment', label: 'Payment Gateway', icon: CreditCard },
    { id: 'campaigns', label: 'Campaign CMS', icon: Layout },
    { id: 'contentcms', label: 'Content CMS', icon: Edit2 },
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
    { id: 'logs', label: 'Security & Logs', icon: ShieldAlert },
    { id: 'backups', label: 'System Backups', icon: Database },
    { id: 'email', label: 'Email Management', icon: Mail },
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
                          prefill: { name: 'Admin Test', email: 'admin@offkilt.com', contact: '9000000000' },
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
                        stock: '50', sku: '', swatches: [{ name: 'Raw Indigo', hex: '#1e293b' }, { name: 'Charcoal Black', hex: '#111111' }],
                        sizes: ['30', '32', '34'],
                        images: [],
                        variants: [],
                        slug: '',
                        meta_title: '',
                        meta_description: '',
                        meta_keywords: '',
                        details: '',
                        materials: '',
                        shipping: '',
                        size_guide: ''
                      });
                    }}
                    className="btn-primary"
                    style={{ padding: '10px 16px', fontSize: '0.75rem' }}
                  >
                    <Plus size={14} /> Clear Form
                  </button>
                  <button 
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to reset the product catalog to default premium products? This will overwrite your current changes.')) {
                        localStorage.removeItem('offkilt_products');
                        await fetchProducts();
                        triggerSync('offkilt_products_updated');
                        alert('Inventory reset to default products!');
                      }
                    }}
                    className="btn-secondary"
                    style={{ padding: '10px 16px', fontSize: '0.75rem', border: '1px solid #d97706', color: '#d97706', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <RefreshCw size={14} /> Reset to Defaults
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

                {/* Collection Products Manager */}
                <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', marginTop: '24px' }}>
                  <h3 style={{ fontSize: '0.85rem', marginBottom: '8px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Collection Products Manager</h3>
                  <p style={{ fontSize: '0.72rem', color: 'var(--text-grey)', marginBottom: '14px', lineHeight: '1.4' }}>
                    Quickly assign or remove products to different gender/age collections. Toggle a checkbox below to update immediately.
                  </p>
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '16px' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target Collection:</label>
                    <select
                      value={bulkTargetGender}
                      onChange={(e) => setBulkTargetGender(e.target.value)}
                      style={{ padding: '6px 10px', fontSize: '0.78rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none' }}
                    >
                      {gendersList.map(g => (
                        <option key={g} value={g}>{g.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div style={{ maxHeight: '240px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.06)', padding: '10px', borderRadius: '2px', backgroundColor: '#fafafa' }} className="admin-sidebar-scroll">
                    {products.map(p => {
                      const isAssigned = p.gender === bulkTargetGender;
                      return (
                        <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0', borderBottom: '1px solid rgba(0,0,0,0.02)', cursor: 'pointer', fontSize: '0.78rem' }}>
                          <input
                            type="checkbox"
                            checked={isAssigned}
                            onChange={async () => {
                              const newGender = isAssigned ? 'unisex' : bulkTargetGender;
                              try {
                                await adminApi.updateProduct(p.id, { gender: newGender });
                                fetchProducts();
                                triggerSync('offkilt_products_updated');
                              } catch (e) {
                                alert('Failed to update product collection');
                              }
                            }}
                          />
                          <img src={p.image} alt={p.name} style={{ width: '22px', height: '22px', objectFit: 'cover', borderRadius: '2px' }} />
                          <span style={{ fontWeight: isAssigned ? 600 : 400, color: isAssigned ? 'var(--accent-raw)' : 'inherit' }}>{p.name}</span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginLeft: 'auto', fontFamily: 'var(--font-mono)' }}>
                            ({p.gender || 'unisex'})
                          </span>
                        </label>
                      );
                    })}
                  </div>
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

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Category</label>
                      <div style={{ display: 'flex', gap: '4px', marginTop: '2px' }}>
                        <select 
                          value={productForm.category} 
                          onChange={(e) => setProductForm({...productForm, category: e.target.value})}
                          style={{ flex: 1, padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff', height: '34px' }}
                          required
                        >
                          {categoryList.map(cat => (
                            <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                          ))}
                        </select>
                        <button
                          type="button"
                          onClick={() => {
                            const name = prompt("Enter new category name:");
                            if (name) {
                              const trimmed = name.trim().toLowerCase();
                              if (trimmed && !categoryList.includes(trimmed)) {
                                const updatedList = [...categoryList, trimmed];
                                setCategoryList(updatedList);
                                localStorage.setItem('offkilt_categories_list', JSON.stringify(updatedList));
                                setProductForm({...productForm, category: trimmed});
                              } else if (categoryList.includes(trimmed)) {
                                alert("Category already exists.");
                              }
                            }
                          }}
                          style={{ width: '28px', height: '34px', fontSize: '0.9rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#e2e8f0', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Add Custom Category"
                        >
                          +
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (categoryList.length <= 1) {
                              alert("Cannot delete the last category.");
                              return;
                            }
                            if (confirm(`Are you sure you want to delete category "${productForm.category}"?`)) {
                              const updatedList = categoryList.filter(c => c !== productForm.category);
                              setCategoryList(updatedList);
                              localStorage.setItem('offkilt_categories_list', JSON.stringify(updatedList));
                              setProductForm({...productForm, category: updatedList[0]});
                            }
                          }}
                          style={{ width: '28px', height: '34px', fontSize: '0.9rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#fee2e2', color: '#dc2626', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          title="Delete Selected Category"
                        >
                          -
                        </button>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Gender</label>
                      <select 
                        value={productForm.gender || 'unisex'} 
                        onChange={(e) => setProductForm({...productForm, gender: e.target.value})}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', backgroundColor: '#ffffff', height: '34px' }}
                        required
                      >
                        {gendersList.map(g => (
                          <option key={g} value={g}>{g.toUpperCase()}</option>
                        ))}
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

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '-6px', marginBottom: '4px' }}>
                    <input 
                      type="text" 
                      placeholder="Add new gender..." 
                      id="newGenderInput"
                      style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', width: '140px' }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim().toLowerCase();
                          if (val && !gendersList.includes(val)) {
                            const newList = [...gendersList, val];
                            setGendersList(newList);
                            localStorage.setItem('offkilt_genders_list', JSON.stringify(newList));
                            triggerSync('offkilt_settings_updated');
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button 
                      type="button" 
                      className="btn-secondary" 
                      style={{ padding: '4px 8px', fontSize: '0.7rem', width: 'auto' }}
                      onClick={() => {
                        const el = document.getElementById('newGenderInput');
                        const val = el.value.trim().toLowerCase();
                        if (val && !gendersList.includes(val)) {
                          const newList = [...gendersList, val];
                          setGendersList(newList);
                          localStorage.setItem('offkilt_genders_list', JSON.stringify(newList));
                          triggerSync('offkilt_settings_updated');
                          el.value = '';
                        }
                      }}
                    >
                      + Add Gender Option
                    </button>
                    {gendersList.length > 3 && (
                      <button
                        type="button"
                        style={{ color: '#ef4444', background: 'none', border: 'none', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                        onClick={() => {
                          const toRemove = prompt(`Enter custom gender to remove (Available: ${gendersList.filter(g => !['unisex', 'men', 'women'].includes(g)).join(', ')}):`);
                          if (toRemove) {
                            const val = toRemove.trim().toLowerCase();
                            if (['unisex', 'men', 'women'].includes(val)) {
                              alert('Cannot remove default genders.');
                              return;
                            }
                            if (gendersList.includes(val)) {
                              const newList = gendersList.filter(g => g !== val);
                              setGendersList(newList);
                              localStorage.setItem('offkilt_genders_list', JSON.stringify(newList));
                              triggerSync('offkilt_settings_updated');
                            } else {
                              alert('Gender not found.');
                            }
                          }
                        }}
                      >
                        Remove Custom
                      </button>
                    )}
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
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Color Swatches</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '12px' }}>
                      {(productForm.swatches || []).map((sw, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <input 
                            type="text" 
                            value={sw.name} 
                            onChange={(e) => {
                              const updated = [...productForm.swatches];
                              updated[idx] = { ...updated[idx], name: e.target.value };
                              setProductForm({ ...productForm, swatches: updated });
                            }}
                            placeholder="Color Name (e.g. Raw Indigo)"
                            style={{ flex: 2, padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                            required
                          />
                          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <input 
                              type="color" 
                              value={sw.hex} 
                              onChange={(e) => {
                                const updated = [...productForm.swatches];
                                updated[idx] = { ...updated[idx], hex: e.target.value };
                                setProductForm({ ...productForm, swatches: updated });
                              }}
                              style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer' }}
                            />
                            <input 
                              type="text" 
                              value={sw.hex} 
                              onChange={(e) => {
                                const updated = [...productForm.swatches];
                                updated[idx] = { ...updated[idx], hex: e.target.value };
                                setProductForm({ ...productForm, swatches: updated });
                              }}
                              placeholder="#000000"
                              style={{ width: '80px', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', fontFamily: 'var(--font-mono)' }}
                              required
                            />
                          </div>
                          <button 
                            type="button" 
                            onClick={() => {
                              const updated = productForm.swatches.filter((_, i) => i !== idx);
                              setProductForm({ ...productForm, swatches: updated });
                            }}
                            style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            title="Remove Swatch"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button 
                      type="button" 
                      className="btn-secondary"
                      onClick={() => {
                        setProductForm({
                          ...productForm,
                          swatches: [...(productForm.swatches || []), { name: '', hex: '#000000' }]
                        });
                      }}
                      style={{ padding: '6px 12px', fontSize: '0.7rem', width: 'auto', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Plus size={12} /> Add Swatch Color
                    </button>
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

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Technical Specifications (One bullet per line)</label>
                    <textarea 
                      value={productForm.details} 
                      onChange={(e) => setProductForm({...productForm, details: e.target.value})} 
                      rows="3" 
                      placeholder="e.g. 13.5oz Heavyweight Raw Denim&#10;Relaxed baggy fit with utility pockets"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical', marginTop: '4px' }}
                    ></textarea>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Materials & Care</label>
                    <textarea 
                      value={productForm.materials} 
                      onChange={(e) => setProductForm({...productForm, materials: e.target.value})} 
                      rows="2" 
                      placeholder="e.g. 100% Cotton Denim. Wash cold inside out."
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical', marginTop: '4px' }}
                    ></textarea>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Shipping & Returns Details</label>
                    <textarea 
                      value={productForm.shipping} 
                      onChange={(e) => setProductForm({...productForm, shipping: e.target.value})} 
                      rows="2" 
                      placeholder="e.g. Free shipping across India. Dispatched within 24 hours."
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical', marginTop: '4px' }}
                    ></textarea>
                  </div>

                  {/* Size Guide Image URL / Upload */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px', marginTop: '16px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Product Specific Size Guide Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        value={productForm.size_guide || ''} 
                        onChange={(e) => setProductForm({...productForm, size_guide: e.target.value})} 
                        placeholder="Size guide image URL or upload below..."
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <UploadCloud size={14} /> Upload Size Guide Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              compressImage(file, 800, 0.8).then((dataUrl) => {
                                setProductForm(prev => ({ ...prev, size_guide: dataUrl }));
                              });
                            }
                          }}
                        />
                      </label>
                      {productForm.size_guide && (
                        <button 
                          type="button" 
                          onClick={() => setProductForm(prev => ({ ...prev, size_guide: '' }))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Remove Size Guide
                        </button>
                      )}
                    </div>
                    {productForm.size_guide && (
                      <div style={{ marginTop: '10px' }}>
                        <img 
                          src={toWebp(productForm.size_guide)} 
                          alt="Size Guide Preview" 
                          style={{ maxHeight: '100px', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }} 
                        />
                      </div>
                    )}
                  </div>

                  {/* SEO & Meta Details */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '16px', marginTop: '16px' }}>
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px' }}>SEO & META DATA</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>URL Slug</label>
                        <input 
                          type="text" 
                          value={productForm.slug || ''} 
                          onChange={(e) => setProductForm({...productForm, slug: e.target.value})} 
                          placeholder="e.g. premium-oversized-tshirt"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Meta Title</label>
                        <input 
                          type="text" 
                          value={productForm.meta_title || ''} 
                          onChange={(e) => setProductForm({...productForm, meta_title: e.target.value})} 
                          placeholder="Meta Title for search engines"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Meta Description</label>
                        <textarea 
                          value={productForm.meta_description || ''} 
                          onChange={(e) => setProductForm({...productForm, meta_description: e.target.value})} 
                          placeholder="Short description for search results"
                          rows="2"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', marginTop: '4px', resize: 'vertical' }}
                        ></textarea>
                      </div>
                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Meta Keywords</label>
                        <input 
                          type="text" 
                          value={productForm.meta_keywords || ''} 
                          onChange={(e) => setProductForm({...productForm, meta_keywords: e.target.value})} 
                          placeholder="comma-separated keywords"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', marginTop: '4px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: '12px' }}>
                      <button type="submit" className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', width: 'auto' }}>
                        <Save size={14} /> Save Product
                      </button>
                    </div>
                  </div>

                  {/* Variants Management Section */}
                  <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', paddingTop: '20px', marginTop: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', letterSpacing: '0.5px' }}>PRODUCT COLOR VARIANTS</h4>
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={handleAddVariant} 
                        style={{ padding: '6px 12px', fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto' }}
                      >
                        <Plus size={12} /> Add Variant
                      </button>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      {(!productForm.variants || productForm.variants.length === 0) ? (
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                          No variants defined. The product will only use its primary default color/swatches.
                        </p>
                      ) : (
                        productForm.variants.map((v, vIdx) => (
                          <div key={v.id || vIdx} style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '16px', borderRadius: '4px', backgroundColor: '#fafafa' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '8px', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Variant {vIdx + 1}: {v.color || 'Unnamed'}</span>
                                <div style={{ display: 'flex', gap: '2px' }}>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVariant(vIdx, 'up')}
                                    disabled={vIdx === 0}
                                    style={{ border: 'none', background: 'rgba(0,0,0,0.04)', color: 'var(--text-light)', cursor: vIdx === 0 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: '0.65rem', borderRadius: '2px', opacity: vIdx === 0 ? 0.3 : 1 }}
                                    title="Move Up"
                                  >
                                    ↑
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleMoveVariant(vIdx, 'down')}
                                    disabled={vIdx === productForm.variants.length - 1}
                                    style={{ border: 'none', background: 'rgba(0,0,0,0.04)', color: 'var(--text-light)', cursor: vIdx === productForm.variants.length - 1 ? 'not-allowed' : 'pointer', padding: '2px 6px', fontSize: '0.65rem', borderRadius: '2px', opacity: vIdx === productForm.variants.length - 1 ? 0.3 : 1 }}
                                    title="Move Down"
                                  >
                                    ↓
                                  </button>
                                </div>
                              </div>
                              <button 
                                type="button" 
                                onClick={() => handleDeleteVariant(vIdx)}
                                style={{ border: 'none', background: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.7rem' }}
                              >
                                <Trash2 size={12} /> Remove
                              </button>
                            </div>
                            
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '12px' }}>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Color Name</label>
                                <input 
                                  type="text" 
                                  value={v.color} 
                                  onChange={(e) => handleUpdateVariant(vIdx, 'color', e.target.value)}
                                  placeholder="e.g. Acid Blue"
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Hex Code</label>
                                <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '4px' }}>
                                  <input 
                                    type="color" 
                                    value={v.hex} 
                                    onChange={(e) => handleUpdateVariant(vIdx, 'hex', e.target.value)}
                                    style={{ width: '28px', height: '28px', border: 'none', padding: 0, cursor: 'pointer' }}
                                  />
                                  <input 
                                    type="text" 
                                    value={v.hex} 
                                    onChange={(e) => handleUpdateVariant(vIdx, 'hex', e.target.value)}
                                    placeholder="#000000"
                                    style={{ flex: 1, padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                                  />
                                </div>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Price (₹)</label>
                                <input 
                                  type="number" 
                                  value={v.price} 
                                  onChange={(e) => handleUpdateVariant(vIdx, 'price', Number(e.target.value))}
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Stock Qty</label>
                                <input 
                                  type="number" 
                                  value={v.stock} 
                                  onChange={(e) => handleUpdateVariant(vIdx, 'stock', Number(e.target.value))}
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>SKU</label>
                                <input 
                                  type="text" 
                                  value={v.sku} 
                                  onChange={(e) => handleUpdateVariant(vIdx, 'sku', e.target.value)}
                                  placeholder="SKU Code"
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Availability Status</label>
                                <select
                                  value={v.status || 'available'}
                                  onChange={(e) => handleUpdateVariant(vIdx, 'status', e.target.value)}
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', marginTop: '4px', backgroundColor: '#ffffff', height: '29px' }}
                                >
                                  <option value="available">Available</option>
                                  <option value="out_of_stock">Out of Stock</option>
                                  <option value="hidden">Hidden</option>
                                </select>
                              </div>
                              <div>
                                <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)' }}>Sizes (Comma-separated)</label>
                                <input 
                                  type="text" 
                                  value={Array.isArray(v.sizes) ? v.sizes.join(', ') : (v.sizes || '')} 
                                  onChange={(e) => handleUpdateVariant(vIdx, 'sizes', e.target.value)}
                                  placeholder="e.g. 30, 32, 34"
                                  style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                                />
                              </div>
                            </div>

                            {/* Variant Images Gallery */}
                            <div>
                              <label style={{ fontSize: '0.65rem', color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Variant Gallery Images</label>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                {(v.images || []).map((img, imgIdx) => (
                                  <div key={imgIdx} style={{ position: 'relative', width: '50px', height: '50px', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '2px', overflow: 'hidden' }}>
                                    <img src={img} alt={`Variant img ${imgIdx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                    <button 
                                      type="button" 
                                      onClick={() => handleRemoveVariantImage(vIdx, imgIdx)}
                                      style={{ position: 'absolute', top: '2px', right: '2px', background: 'rgba(239,68,68,0.9)', color: '#fff', border: 'none', borderRadius: '50%', width: '14px', height: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                    >
                                      <Trash2 size={8} />
                                    </button>
                                  </div>
                                ))}
                                <label style={{ width: '50px', height: '50px', border: '1px dashed var(--accent-raw)', borderRadius: '2px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', backgroundColor: 'rgba(249,115,22,0.01)' }}>
                                  <UploadCloud size={14} style={{ color: 'var(--accent-raw)' }} />
                                  <input 
                                    type="file" 
                                    accept="image/*" 
                                    multiple 
                                    onChange={(e) => handleVariantImagesUpload(e, vIdx)}
                                    style={{ display: 'none' }} 
                                  />
                                </label>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <button type="submit" className="btn-primary" style={{ justifyContent: 'center', marginTop: '20px' }}>
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
                            <td className="mono" style={{ padding: '12px', fontWeight: 'bold' }}>₹{(o.total !== undefined && o.total !== null ? o.total : (o.subtotal - (o.discount || 0) + (o.shipping_fee || o.shipping || 0)))?.toLocaleString('en-IN')}</td>
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
                        onChange={handleHeroMediaUpload}
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
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      localStorage.setItem('offkilt_campaign_hero', JSON.stringify(campaigns.hero));
                      window.dispatchEvent(new Event('offkilt_hero_updated'));
                      alert('Hero Banner saved successfully!');
                    }}
                    className="btn-primary"
                  >
                    <Save size={16} /> Save Hero Banner
                  </button>
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
                        onChange={handleFashionFilmVideoUpload}
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

              {/* Dynamic Campaigns List CMS */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  <h3 style={{ fontSize: '0.9rem', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>CAMPAIGNS MANAGER</h3>
                  <button
                    type="button"
                    onClick={() => {
                      const newCamp = {
                        id: 'campaign-' + Date.now(),
                        gender: 'unisex',
                        title: 'New Campaign',
                        subtitle: 'Campaign description text goes here.',
                        ctaText: 'Explore Now',
                        image: '',
                        sectionInsertAfter: 'hero',
                        visible: true
                      };
                      const updated = [...campaignsList, newCamp];
                      setCampaignsList(updated);
                      localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                      triggerSync('offkilt_settings_updated');
                    }}
                    className="btn-primary"
                    style={{ padding: '8px 16px', fontSize: '0.75rem', width: 'auto' }}
                  >
                    + Add New Campaign Banner
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {campaignsList.map((c, idx) => (
                    <div key={c.id || idx} style={{ border: '1px solid rgba(0,0,0,0.08)', padding: '24px', borderRadius: '6px', backgroundColor: '#fafafa', position: 'relative' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '8px' }}>
                        <span style={{ fontSize: '0.78rem', fontWeight: 700, fontFamily: 'var(--font-mono)' }}>Campaign Banner #{idx + 1}</span>
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', cursor: 'pointer' }}>
                            <input 
                              type="checkbox" 
                              checked={c.visible !== false} 
                              onChange={(e) => {
                                const updated = [...campaignsList];
                                updated[idx] = { ...updated[idx], visible: e.target.checked };
                                setCampaignsList(updated);
                                localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                                triggerSync('offkilt_settings_updated');
                              }}
                            />
                            Visible on Store
                          </label>
                          <button 
                            type="button"
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this campaign banner?')) {
                                const updated = campaignsList.filter((_, i) => i !== idx);
                                setCampaignsList(updated);
                                localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                                triggerSync('offkilt_settings_updated');
                              }
                            }}
                            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '14px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Title</label>
                          <input 
                            type="text" 
                            value={c.title} 
                            onChange={(e) => {
                              const updated = [...campaignsList];
                              updated[idx] = { ...updated[idx], title: e.target.value };
                              setCampaignsList(updated);
                              localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                              triggerSync('offkilt_settings_updated');
                            }} 
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>CTA Button Label</label>
                          <input 
                            type="text" 
                            value={c.ctaText} 
                            onChange={(e) => {
                              const updated = [...campaignsList];
                              updated[idx] = { ...updated[idx], ctaText: e.target.value };
                              setCampaignsList(updated);
                              localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                              triggerSync('offkilt_settings_updated');
                            }} 
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none' }}
                          />
                        </div>
                      </div>

                      <div style={{ marginBottom: '14px' }}>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Subtitle</label>
                        <textarea 
                          value={c.subtitle} 
                          onChange={(e) => {
                            const updated = [...campaignsList];
                            updated[idx] = { ...updated[idx], subtitle: e.target.value };
                            setCampaignsList(updated);
                            localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                            triggerSync('offkilt_settings_updated');
                          }} 
                          rows="2"
                          style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none' }}
                        ></textarea>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Gender Target Tag</label>
                          <input 
                            type="text" 
                            value={c.gender || 'unisex'} 
                            onChange={(e) => {
                              const updated = [...campaignsList];
                              updated[idx] = { ...updated[idx], gender: e.target.value.toLowerCase().trim() };
                              setCampaignsList(updated);
                              localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                              triggerSync('offkilt_settings_updated');
                            }} 
                            placeholder="e.g. men, women, kids"
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Show After Section (Homepage position)</label>
                          <select
                            value={c.sectionInsertAfter || 'hero'}
                            onChange={(e) => {
                              const updated = [...campaignsList];
                              updated[idx] = { ...updated[idx], sectionInsertAfter: e.target.value };
                              setCampaignsList(updated);
                              localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                              triggerSync('offkilt_settings_updated');
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none', height: '34px' }}
                          >
                            <option value="hero">After Hero / Press Strip</option>
                            <option value="trending">After Trending Collection</option>
                            <option value="new-arrivals">After New Arrivals</option>
                            <option value="best-sellers">After Best Sellers</option>
                            <option value="fashion-video">After Fashion Video</option>
                            <option value="shop-by-style">After Shop By Style</option>
                            <option value="brand-story">After Brand Story</option>
                            <option value="customer-reviews">After Customer Reviews</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Campaign Cover Banner</label>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'center', marginTop: '4px' }}>
                          <div style={{ border: '1px dashed rgba(0,0,0,0.15)', borderRadius: '4px', padding: '8px', textAlign: 'center', height: '90px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: '#ffffff' }}>
                            {c.image ? (
                              <img src={c.image} alt="Campaign Cover Preview" style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                            ) : (
                              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>No Image</span>
                            )}
                          </div>
                          <div>
                            <input 
                              type="text" 
                              value={c.image || ''} 
                              onChange={(e) => {
                                const updated = [...campaignsList];
                                updated[idx] = { ...updated[idx], image: e.target.value };
                                setCampaignsList(updated);
                                localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                                triggerSync('offkilt_settings_updated');
                              }}
                              placeholder="Image URL..."
                              style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff', outline: 'none', marginBottom: '8px' }}
                            />
                            <input 
                              type="file" 
                              accept="image/*" 
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) {
                                  compressImage(file).then((dataUrl) => {
                                    const updated = [...campaignsList];
                                    updated[idx] = { ...updated[idx], image: dataUrl };
                                    setCampaignsList(updated);
                                    localStorage.setItem('offkilt_campaigns', JSON.stringify(updated));
                                    triggerSync('offkilt_settings_updated');
                                  });
                                }
                              }} 
                              style={{ fontSize: '0.75rem', width: '100%' }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {campaignsList.length === 0 && (
                    <p style={{ textAlign: 'center', fontSize: '0.8rem', color: 'var(--text-muted)', padding: '20px 0', fontStyle: 'italic' }}>
                      No campaign banners configured.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Website Content CMS */}
          {activeTab === 'contentcms' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Brand & Marquee Ticker CMS</h3>
                <form onSubmit={handleSaveWebsiteContentCms}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>As Seen On Brands (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={pressBrandsInput}
                        onChange={(e) => setPressBrandsInput(e.target.value)}
                        placeholder="e.g. Vogue India, Grazia, Elle, Femina"
                        style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                        These brands will appear in the "AS SEEN ON" slider/strip on the homepage.
                      </small>
                    </div>

                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>New Arrivals Ticker / Marquee Items (Comma-separated)</label>
                      <input 
                        type="text" 
                        value={tickerItemsInput}
                        onChange={(e) => setTickerItemsInput(e.target.value)}
                        placeholder="e.g. NEW ARRIVALS, ✦, JUST LANDED, ✦, FRESH DROPS, ✦"
                        style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                      />
                      <small style={{ color: 'var(--text-muted)', fontSize: '0.7rem', marginTop: '4px', display: 'block' }}>
                        These words or symbols will cycle continuously in the gold marquee bar. Use ✦ or other icons to separate items.
                      </small>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-primary" 
                      style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                    >
                      Save Ticker & Brands
                    </button>
                  </div>
                </form>
              </div>

              {/* Customer Love Stats CMS */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Customer Love Stats CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Happy Customers Count</label>
                      <input 
                        type="text" 
                        value={reviewStatsForm.happyCustomers} 
                        onChange={(e) => setReviewStatsForm({...reviewStatsForm, happyCustomers: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. 10,000+"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Average Rating</label>
                      <input 
                        type="text" 
                        value={reviewStatsForm.avgRating} 
                        onChange={(e) => setReviewStatsForm({...reviewStatsForm, avgRating: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. 4.9"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)' }}>Reviews Count</label>
                      <input 
                        type="text" 
                        value={reviewStatsForm.reviewCount} 
                        onChange={(e) => setReviewStatsForm({...reviewStatsForm, reviewCount: e.target.value})} 
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                        placeholder="e.g. 5,000+"
                      />
                    </div>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary" 
                    onClick={() => {
                      localStorage.setItem('offkilt_review_stats', JSON.stringify(reviewStatsForm));
                      triggerSync('offkilt_settings_updated');
                      alert('Customer Love Stats saved!');
                    }}
                    style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                  >
                    Save Customer Love Stats
                  </button>
                </div>
              </div>

              {/* Newsletter Promo Popup CMS Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Newsletter Promo Popup CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <input 
                      type="checkbox" 
                      id="promo_enabled"
                      checked={promoPopupSettings.enabled === true} 
                      onChange={(e) => setPromoPopupSettings({ ...promoPopupSettings, enabled: e.target.checked })}
                    />
                    <label htmlFor="promo_enabled" style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)', cursor: 'pointer' }}>
                      Enable Newsletter Promo Popup on Storefront
                    </label>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Popup Title / Offer Heading</label>
                    <input 
                      type="text" 
                      value={promoPopupSettings.title}
                      onChange={(e) => setPromoPopupSettings({ ...promoPopupSettings, title: e.target.value })}
                      placeholder="e.g. JOIN & RECEIVE UP TO 20% OFF YOUR FIRST ORDER"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Popup Subtitle / Tagline</label>
                    <input 
                      type="text" 
                      value={promoPopupSettings.subtitle}
                      onChange={(e) => setPromoPopupSettings({ ...promoPopupSettings, subtitle: e.target.value })}
                      placeholder="e.g. FREE SHIPPING IN INDIA"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Discount Code (Welcome Offer)</label>
                    <input 
                      type="text" 
                      value={promoPopupSettings.discountCode}
                      onChange={(e) => setPromoPopupSettings({ ...promoPopupSettings, discountCode: e.target.value })}
                      placeholder="e.g. WELCOME20"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Cover Image URL</label>
                    <input 
                      type="text" 
                      value={promoPopupSettings.coverImage}
                      onChange={(e) => setPromoPopupSettings({ ...promoPopupSettings, coverImage: e.target.value })}
                      placeholder="Cover Image URL or upload file below..."
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                    />
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '8px' }}>
                      <label style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <UploadCloud size={14} /> Upload Popup Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setPromoPopupSettings(prev => ({ ...prev, coverImage: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleSavePromoPopup}
                    className="btn-primary" 
                    style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                  >
                    Save Promo Popup
                  </button>
                </div>
              </div>

              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}>Company Pages CMS</h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>Select Page to Edit:</label>
                    <select 
                      value={selectedCompanyPageKey}
                      onChange={(e) => setSelectedCompanyPageKey(e.target.value)}
                      style={{ padding: '8px 12px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      <option value="about">About Us</option>
                      <option value="refund">Refund & Return Policy</option>
                      <option value="faq">FAQ</option>
                      <option value="terms">Terms & Conditions</option>
                      <option value="career">Career</option>
                      <option value="partnership">Partnership & Collaborations</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page Title</label>
                    <input 
                      type="text" 
                      value={currentPageForm.title}
                      onChange={(e) => handleCompanyPageFormChange('title', e.target.value)}
                      placeholder="e.g. Refund Policy"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Page Content</label>
                    <textarea 
                      value={currentPageForm.content}
                      onChange={(e) => handleCompanyPageFormChange('content', e.target.value)}
                      placeholder="Enter detailed content here..."
                      rows="12"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', marginTop: '6px', resize: 'vertical', fontFamily: 'inherit', lineHeight: '1.5' }}
                    />
                  </div>

                  <button 
                    onClick={handleSaveCompanyPage}
                    className="btn-primary" 
                    style={{ width: 'auto', alignSelf: 'flex-start', padding: '10px 24px', fontSize: '0.75rem', fontFamily: 'var(--font-mono)' }}
                  >
                    Save Company Page
                  </button>
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
                    Add Image
                  </button>
                </div>

                <div style={{ marginBottom: '16px', padding: '12px', backgroundColor: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '4px', fontSize: '0.75rem', color: '#1e40af' }}>
                  💡 <strong>Featured Option</strong>: Only one post can be featured at a time. The featured post will be highlighted as the prominent large cover on the storefront Instagram grid. Other posts will display around it.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  {igGallery.map((item, idx) => (
                    <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr 1fr 100px 50px', gap: '12px', alignItems: 'center', padding: '12px', border: '1px solid rgba(0,0,0,0.04)', borderRadius: '2px', backgroundColor: '#fcfcf9' }}>
                      <div>
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Image URL / File</label>
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
                        <label style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Post / Story URL</label>
                        <input 
                          type="text" 
                          value={item.postUrl || ''} 
                          onChange={(e) => {
                            const updated = [...igGallery];
                            updated[idx].postUrl = e.target.value;
                            setIgGallery(updated);
                          }}
                          placeholder="https://instagram.com/p/..."
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
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

          {/* Mega Menu Builder CMS */}
          {activeTab === 'megamenu' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>MEGA MENU CATEGORIES</h3>
                
                {/* Category Selection Tabs & Adding New Category */}
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(0,0,0,0.06)', paddingBottom: '20px', marginBottom: '20px' }}>
                  {Object.keys(megaMenuSettings).map(key => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setSelectedMegaKey(key)}
                      style={{
                        padding: '8px 16px',
                        fontSize: '0.75rem',
                        fontFamily: 'var(--font-mono)',
                        border: '1px solid rgba(0,0,0,0.1)',
                        backgroundColor: selectedMegaKey === key ? 'var(--accent-raw)' : '#ffffff',
                        color: selectedMegaKey === key ? '#ffffff' : '#111111',
                        borderRadius: '2px',
                        textTransform: 'uppercase',
                        cursor: 'pointer'
                      }}
                    >
                      {megaMenuSettings[key].label || key}
                    </button>
                  ))}
                  
                  <div style={{ flex: 1 }} />
                  
                  {/* Add new mega menu key */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Add Category (e.g. Footwear)"
                      value={newMegaKeyInput}
                      onChange={(e) => setNewMegaKeyInput(e.target.value)}
                      style={{ padding: '6px 12px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                    <button
                      type="button"
                      onClick={handleAddMegaCategory}
                      className="btn-primary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                    >
                      <Plus size={12} /> Add Tab
                    </button>
                  </div>
                </div>

                {/* Selected Category Editor */}
                {megaMenuSettings[selectedMegaKey] ? (
                  <form onSubmit={handleMegaMenuSave} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-grey)' }}>Tab Label</label>
                        <input
                          type="text"
                          value={megaMenuSettings[selectedMegaKey].label || ''}
                          onChange={(e) => {
                            setMegaMenuSettings({
                              ...megaMenuSettings,
                              [selectedMegaKey]: {
                                ...megaMenuSettings[selectedMegaKey],
                                label: e.target.value
                              }
                            });
                          }}
                          style={{ padding: '6px 12px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                          required
                        />
                      </div>
                      
                      {selectedMegaKey !== 'men' && selectedMegaKey !== 'women' && (
                        <button
                          type="button"
                          onClick={() => handleDeleteMegaCategory(selectedMegaKey)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#fff5f5',
                            color: '#ef4444',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            borderRadius: '2px',
                            fontSize: '0.75rem',
                            cursor: 'pointer'
                          }}
                        >
                          <Trash2 size={12} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} /> Delete Tab
                        </button>
                      )}
                    </div>

                    {/* Columns / Sections List */}
                    <div>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '14px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '6px' }}>MENU COLUMNS</h4>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        {(megaMenuSettings[selectedMegaKey].sections || []).map((sec, secIdx) => (
                          <div key={secIdx} style={{ padding: '16px', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '4px', backgroundColor: '#fcfcf9' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <label style={{ fontSize: '0.65rem', fontWeight: 600, color: 'var(--text-muted)' }}>Column Title</label>
                                <input
                                  type="text"
                                  value={sec.title || ''}
                                  onChange={(e) => {
                                    const updatedSecs = [...megaMenuSettings[selectedMegaKey].sections];
                                    updatedSecs[secIdx].title = e.target.value.toUpperCase();
                                    setMegaMenuSettings({
                                      ...megaMenuSettings,
                                      [selectedMegaKey]: {
                                        ...megaMenuSettings[selectedMegaKey],
                                        sections: updatedSecs
                                      }
                                    });
                                  }}
                                  style={{ padding: '4px 8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', fontWeight: 'bold' }}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button
                                  type="button"
                                  onClick={() => handleAddLink(secIdx)}
                                  style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid var(--accent-raw)', color: 'var(--accent-raw)', backgroundColor: '#ffffff', borderRadius: '2px', cursor: 'pointer' }}
                                >
                                  + Add Link
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteSection(secIdx)}
                                  style={{ padding: '4px 8px', fontSize: '0.65rem', border: '1px solid rgba(239, 68, 68, 0.2)', color: '#ef4444', backgroundColor: '#fff5f5', borderRadius: '2px', cursor: 'pointer' }}
                                >
                                  Delete Column
                                </button>
                              </div>
                            </div>

                            {/* Links inside this section */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '20px' }}>
                              {(sec.links || []).map((link, linkIdx) => (
                                <div key={linkIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 2fr auto', gap: '10px', alignItems: 'center' }}>
                                  <div>
                                    <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block' }}>Link Label</label>
                                    <input
                                      type="text"
                                      value={link.name || ''}
                                      onChange={(e) => {
                                        const updatedSecs = [...megaMenuSettings[selectedMegaKey].sections];
                                        updatedSecs[secIdx].links[linkIdx].name = e.target.value;
                                        setMegaMenuSettings({
                                          ...megaMenuSettings,
                                          [selectedMegaKey]: {
                                            ...megaMenuSettings[selectedMegaKey],
                                            sections: updatedSecs
                                          }
                                        });
                                      }}
                                      style={{ width: '100%', padding: '4px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                                    />
                                  </div>
                                  <div>
                                    <label style={{ fontSize: '0.55rem', color: 'var(--text-muted)', display: 'block' }}>Category Filter Value</label>
                                    <input
                                      type="text"
                                      value={link.filter || ''}
                                      onChange={(e) => {
                                        const updatedSecs = [...megaMenuSettings[selectedMegaKey].sections];
                                        updatedSecs[secIdx].links[linkIdx].filter = e.target.value.toLowerCase().trim();
                                        setMegaMenuSettings({
                                          ...megaMenuSettings,
                                          [selectedMegaKey]: {
                                            ...megaMenuSettings[selectedMegaKey],
                                            sections: updatedSecs
                                          }
                                        });
                                      }}
                                      style={{ width: '100%', padding: '4px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                                    />
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteLink(secIdx, linkIdx)}
                                    style={{ color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer', marginTop: '14px' }}
                                    title="Delete Link"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <button
                        type="button"
                        onClick={handleAddSection}
                        className="btn-secondary"
                        style={{ marginTop: '12px', padding: '6px 12px', fontSize: '0.75rem' }}
                      >
                        + Add Column
                      </button>
                    </div>

                    {/* Featured Promotion Card */}
                    <div style={{ border: '1px solid rgba(0,0,0,0.06)', borderRadius: '4px', padding: '20px', backgroundColor: '#ffffff' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '14px', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '6px' }}>FEATURED PROMOTION CARD</h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Card Cover Title</label>
                          <input
                            type="text"
                            value={megaMenuSettings[selectedMegaKey].featured?.title || ''}
                            onChange={(e) => {
                              setMegaMenuSettings({
                                ...megaMenuSettings,
                                [selectedMegaKey]: {
                                  ...megaMenuSettings[selectedMegaKey],
                                  featured: {
                                    ...megaMenuSettings[selectedMegaKey].featured,
                                    title: e.target.value
                                  }
                                }
                              });
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Card Call To Action (CTA)</label>
                          <input
                            type="text"
                            value={megaMenuSettings[selectedMegaKey].featured?.cta || ''}
                            onChange={(e) => {
                              setMegaMenuSettings({
                                ...megaMenuSettings,
                                [selectedMegaKey]: {
                                  ...megaMenuSettings[selectedMegaKey],
                                  featured: {
                                    ...megaMenuSettings[selectedMegaKey].featured,
                                    cta: e.target.value
                                  }
                                }
                              });
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Card Category Filter (Redirect Target)</label>
                          <input
                            type="text"
                            value={megaMenuSettings[selectedMegaKey].featured?.filter || ''}
                            onChange={(e) => {
                              setMegaMenuSettings({
                                ...megaMenuSettings,
                                [selectedMegaKey]: {
                                  ...megaMenuSettings[selectedMegaKey],
                                  featured: {
                                    ...megaMenuSettings[selectedMegaKey].featured,
                                    filter: e.target.value
                                  }
                                }
                              });
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Featured Image URL</label>
                          <input
                            type="text"
                            value={megaMenuSettings[selectedMegaKey].featured?.image || ''}
                            onChange={(e) => {
                              setMegaMenuSettings({
                                ...megaMenuSettings,
                                [selectedMegaKey]: {
                                  ...megaMenuSettings[selectedMegaKey],
                                  featured: {
                                    ...megaMenuSettings[selectedMegaKey].featured,
                                    image: e.target.value
                                  }
                                }
                              });
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setMegaMenuSettings(prev => ({
                                    ...prev,
                                    [selectedMegaKey]: {
                                      ...prev[selectedMegaKey],
                                      featured: {
                                        ...prev[selectedMegaKey].featured,
                                        image: reader.result
                                      }
                                    }
                                  }));
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ fontSize: '0.75rem', marginTop: '6px', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                      <button type="submit" className="btn-primary">
                        <Save size={16} /> Save Mega Menu Config
                      </button>
                    </div>
                  </form>
                ) : (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    Select a tab key to begin editing.
                  </div>
                )}
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
              {/* Global Promotional Discount Builder */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', color: 'var(--accent-raw)' }}>GLOBAL PROMOTIONAL TAG EDITORIAL</h3>
                <form onSubmit={handlePromoDiscountSave} style={{ display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '240px' }}>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Promo Banner Tagline (shown globally on storefront & products)</label>
                    <input 
                      type="text" 
                      value={promoText}
                      onChange={(e) => setPromoText(e.target.value)}
                      placeholder="e.g. Extra 20% off $100+"
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', height: '40px', marginBottom: '2px' }}>
                    <input 
                      type="checkbox" 
                      id="showPromoCheck"
                      checked={showPromo}
                      onChange={(e) => setShowPromo(e.target.checked)}
                      style={{ cursor: 'pointer' }}
                    />
                    <label htmlFor="showPromoCheck" style={{ fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>Enable Promo Tag Globally</label>
                  </div>
                  <button type="submit" className="btn-primary" style={{ height: '40px', padding: '0 20px', fontSize: '0.8rem' }}>
                    <Save size={14} /> Save Promo Tag Settings
                  </button>
                </form>
              </div>

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
            </div>
          )}

          {/* 9. CUSTOMERS DATABASE */}
          {activeTab === 'customers' && (
            <div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', alignItems: 'center' }}>
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
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                  {customers.length} USERS
                </span>
              </div>

              <div style={{ backgroundColor: '#ffffff', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', overflow: 'hidden' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#fcfcf9', borderBottom: '1px solid rgba(0,0,0,0.06)', textAlign: 'left', color: 'var(--text-muted)' }}>
                      <th style={{ padding: '14px' }}>Name</th>
                      <th style={{ padding: '14px' }}>Email</th>
                      <th style={{ padding: '14px' }}>Phone</th>
                      <th style={{ padding: '14px', textAlign: 'center' }}>Role</th>
                      <th style={{ padding: '14px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(c => (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || (c.email || '').toLowerCase().includes(customerSearch.toLowerCase()))
                      .map(c => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(0,0,0,0.03)' }}>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 600 }}>{c.name}</div>
                            <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>#{c.id}</span>
                          </td>
                          <td style={{ padding: '12px', fontSize: '0.78rem' }}>{c.email}</td>
                          <td style={{ padding: '12px', fontSize: '0.78rem' }}>{c.phone || 'N/A'}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <span style={{
                                padding: '3px 10px',
                                borderRadius: '2px',
                                fontSize: '0.65rem',
                                fontFamily: 'var(--font-mono)',
                                fontWeight: 700,
                                background: c.is_admin ? 'rgba(220,38,38,0.08)' : 'rgba(0,0,0,0.04)',
                                color: c.is_admin ? '#dc2626' : 'var(--text-muted)'
                              }}>
                                {c.is_admin ? 'ADMIN' : 'USER'}
                              </span>
                              {c.is_blocked && (
                                <span style={{
                                  padding: '2px 8px',
                                  borderRadius: '2px',
                                  fontSize: '0.6rem',
                                  fontFamily: 'var(--font-mono)',
                                  fontWeight: 700,
                                  background: 'rgba(234,88,12,0.1)',
                                  color: '#ea580c',
                                  border: '1px solid rgba(234,88,12,0.2)'
                                }}>
                                  BLOCKED
                                </span>
                              )}
                            </div>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                              {/* Edit name/email for admins or self */}
                              {(c.is_admin || c.email === currentUser?.email) && (
                                <button
                                  onClick={() => {
                                    const newName = window.prompt('Update display name:', c.name);
                                    if (newName === null) return;
                                    const newEmail = window.prompt('Update email address:', c.email);
                                    if (newEmail === null) return;
                                    const updated = customers.map(u =>
                                      u.id === c.id ? { ...u, name: newName.trim() || u.name, email: newEmail.trim() || u.email } : u
                                    );
                                    setCustomers(updated);
                                    localStorage.setItem('offkilt_users', JSON.stringify(updated));
                                    triggerSync('offkilt_settings_updated');
                                    alert('Profile updated.');
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.65rem',
                                    fontFamily: 'var(--font-mono)',
                                    border: '1px solid rgba(0,0,0,0.12)',
                                    borderRadius: '2px',
                                    background: '#f9f9f7',
                                    color: 'var(--text-light)',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Edit Profile
                                </button>
                              )}
                              {/* Block/Unblock toggle button — only for regular users (non-admins) */}
                              {!c.is_admin && c.email !== currentUser?.email && (
                                <button
                                  onClick={() => {
                                    const actionText = c.is_blocked ? 'unblock' : 'block';
                                    if (!window.confirm(`Are you sure you want to ${actionText} ${c.name}?`)) return;
                                    const updated = customers.map(u =>
                                      u.id === c.id ? { ...u, is_blocked: !c.is_blocked } : u
                                    );
                                    setCustomers(updated);
                                    localStorage.setItem('offkilt_users', JSON.stringify(updated));
                                    triggerSync('offkilt_settings_updated');
                                    alert(`User has been ${c.is_blocked ? 'unblocked' : 'blocked'}.`);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.65rem',
                                    fontFamily: 'var(--font-mono)',
                                    border: c.is_blocked ? '1px solid rgba(22,163,74,0.3)' : '1px solid rgba(234,88,12,0.3)',
                                    borderRadius: '2px',
                                    background: c.is_blocked ? '#f0fdf4' : '#fff7ed',
                                    color: c.is_blocked ? '#16a34a' : '#ea580c',
                                    cursor: 'pointer'
                                  }}
                                >
                                  {c.is_blocked ? 'Unblock' : 'Block User'}
                                </button>
                              )}
                              {/* Revoke admin access — only if OTHER admin, not yourself */}
                              {c.is_admin && c.email !== currentUser?.email && (
                                <button
                                  onClick={() => {
                                    if (!window.confirm(`Revoke admin access from ${c.name}? They will become a regular user.`)) return;
                                    const updated = customers.map(u =>
                                      u.id === c.id ? { ...u, is_admin: false } : u
                                    );
                                    setCustomers(updated);
                                    localStorage.setItem('offkilt_users', JSON.stringify(updated));
                                    triggerSync('offkilt_settings_updated');
                                    alert(`Admin access revoked from ${c.name}.`);
                                  }}
                                  style={{
                                    padding: '5px 10px',
                                    fontSize: '0.65rem',
                                    fontFamily: 'var(--font-mono)',
                                    border: '1px solid rgba(220,38,38,0.3)',
                                    borderRadius: '2px',
                                    background: '#fff5f5',
                                    color: '#dc2626',
                                    cursor: 'pointer'
                                  }}
                                >
                                  Revoke Admin
                                </button>
                              )}
                              {/* You badge for current user */}
                              {c.email === currentUser?.email && (
                                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>You</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
                {customers.filter(c => (c.name || '').toLowerCase().includes(customerSearch.toLowerCase()) || (c.email || '').toLowerCase().includes(customerSearch.toLowerCase())).length === 0 && (
                  <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    No users found.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 10. SEO META TAGS */}
          {activeTab === 'seo' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
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
                    <Save size={16} /> Save Global SEO Tag settings
                  </button>
                </div>
              </div>

              {/* Product SEO Manager Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', color: 'var(--accent-gold)' }}>PRODUCT SEO MANAGER</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '30px', alignItems: 'start' }}>
                  {/* Product SEO Search & List */}
                  <div>
                    <input 
                      type="text" 
                      placeholder="Search products for SEO..."
                      value={seoProductSearch}
                      onChange={(e) => setSeoProductSearch(e.target.value)}
                      style={{ width: '100%', padding: '10px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.08)', borderRadius: '2px', outline: 'none', marginBottom: '14px' }}
                    />
                    <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid rgba(0,0,0,0.05)', borderRadius: '2px' }} className="admin-sidebar-scroll">
                      {products && products.length > 0 ? (
                        products
                          .filter(p => p && ((p.name || '').toLowerCase().includes(seoProductSearch.toLowerCase()) || (p.id || '').toLowerCase().includes(seoProductSearch.toLowerCase())))
                          .map(p => {
                            const hasSeo = p.id && !!productSeoList[p.id];
                            const isSelected = p.id && selectedSeoProductId === p.id;
                            return (
                              <div 
                                key={p.id}
                                onClick={() => {
                                  setSelectedSeoProductId(p.id);
                                  setSeoProductForm(productSeoList[p.id] || { title: '', desc: '', keywords: '' });
                                }}
                                style={{ 
                                  padding: '10px 12px', 
                                  borderBottom: '1px solid rgba(0,0,0,0.02)', 
                                  cursor: 'pointer', 
                                  backgroundColor: isSelected ? 'rgba(249, 115, 22, 0.05)' : '#ffffff',
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  transition: 'var(--transition-quick)'
                                }}
                              >
                                <div>
                                  <div style={{ fontWeight: 600, fontSize: '0.78rem' }}>{p.name || 'Unnamed Product'}</div>
                                  <span className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{p.id}</span>
                                </div>
                                <span style={{ fontSize: '0.65rem', color: hasSeo ? '#16a34a' : 'var(--text-muted)', fontWeight: 600 }}>
                                  {hasSeo ? '✓ Customized' : 'Default'}
                                </span>
                              </div>
                            );
                          })
                      ) : (
                        <div style={{ padding: '20px', color: 'var(--text-muted)', fontSize: '0.8rem', textAlign: 'center' }}>
                          No products found in database.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Product SEO Form */}
                  <div>
                    {selectedSeoProductId ? (
                      <form onSubmit={handleSaveProductSeo} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', borderBottom: '1px solid rgba(0,0,0,0.04)', paddingBottom: '6px' }}>
                          EDITING SEO: {products.find(p => p.id === selectedSeoProductId)?.name}
                        </h4>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Meta Title</label>
                          <input 
                            type="text" 
                            value={seoProductForm.title}
                            onChange={(e) => setSeoProductForm({ ...seoProductForm, title: e.target.value })}
                            placeholder="Custom title tag"
                            style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Meta Description</label>
                          <textarea 
                            value={seoProductForm.desc}
                            onChange={(e) => setSeoProductForm({ ...seoProductForm, desc: e.target.value })}
                            placeholder="Custom description tag"
                            rows="3"
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none', resize: 'vertical' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '4px' }}>Keywords</label>
                          <input 
                            type="text" 
                            value={seoProductForm.keywords}
                            onChange={(e) => setSeoProductForm({ ...seoProductForm, keywords: e.target.value })}
                            placeholder="e.g. customized, carpenter, jeans"
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', outline: 'none' }}
                          />
                        </div>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button type="submit" className="btn-primary" style={{ flex: 1, padding: '8px 12px', fontSize: '0.75rem' }}>
                            Save Product SEO
                          </button>
                          <button 
                            type="button" 
                            className="btn-secondary"
                            onClick={() => {
                              setSelectedSeoProductId(null);
                              setSeoProductForm({ title: '', desc: '', keywords: '' });
                            }}
                            style={{ padding: '8px 12px', fontSize: '0.75rem' }}
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.75rem', border: '1px dashed rgba(0,0,0,0.1)', borderRadius: '4px' }}>
                        Select a product from the list to manage its custom SEO metadata tags.
                      </div>
                    )}
                  </div>
                </div>
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
                  <ShoppingBag size={28} style={{ color: 'var(--accent-raw)', marginBottom: '12px' }} />
                  <h4 style={{ fontSize: '0.85rem', marginBottom: '8px' }}>Clean Production Start</h4>
                  <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '16px' }}>Wipe all order history and analytics data before launch.</p>
                  <button onClick={handleClearOrdersAndAnalytics} className="btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '8px 12px', backgroundColor: 'var(--accent-raw)', color: '#ffffff' }}>Clear Orders & Analytics</button>
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
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>TRENDING COLLECTION SECTION</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Section Title</label>
                        <input 
                          type="text" 
                          value={homepageCollections.trendingTitle} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, trendingTitle: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                      </div>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Cover Banner Eyebrow / Tagline</label>
                        <input 
                          type="text" 
                          value={homepageCollections.trendingTagline || 'TRENDING LOOKBOOK'} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, trendingTagline: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                          placeholder="e.g. TRENDING LOOKBOOK"
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
                    <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '12px' }}>SHOP BY STYLE SECTION</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                      <div>
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Section Title</label>
                        <input 
                          type="text" 
                          value={homepageCollections.styleTitle} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, styleTitle: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                        />
                        <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '10px', display: 'block' }}>Cover Banner Eyebrow / Tagline</label>
                        <input 
                          type="text" 
                          value={homepageCollections.styleTagline || 'STYLE MANUAL'} 
                          onChange={(e) => setHomepageCollections({ ...homepageCollections, styleTagline: e.target.value })}
                          style={{ width: '100%', padding: '6px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)' }}
                          placeholder="e.g. STYLE MANUAL"
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

              {/* Best Seller Cards Editor Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', textTransform: 'uppercase' }}>BEST SELLER PRODUCTS EDIT</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-grey)', marginBottom: '20px' }}>
                  Edit details of the 3 featured cards displayed in the Customer Favourites / Best Sellers homepage section.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {bestsellers.map((card, idx) => (
                    <div key={card.id || idx} style={{ border: '1px solid rgba(0,0,0,0.06)', padding: '20px', borderRadius: '4px', backgroundColor: '#fcfcfc' }}>
                      <h4 style={{ fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid rgba(0,0,0,0.03)', paddingBottom: '8px' }}>
                        <span>BEST SELLER CARD #{idx + 1} ({card.labelText})</span>
                      </h4>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Select Inventory Product</label>
                          <select
                            value={card.productId || ''}
                            onChange={(e) => {
                              const selectedId = e.target.value;
                              const matchedProd = products.find(p => String(p.id) === String(selectedId));
                              if (matchedProd) {
                                const updated = { 
                                  ...card, 
                                  productId: matchedProd.id, 
                                  name: matchedProd.name,
                                  price: matchedProd.discountPrice && Number(matchedProd.discountPrice) < Number(matchedProd.price) ? Number(matchedProd.discountPrice) : Number(matchedProd.price),
                                  originalPrice: matchedProd.discountPrice && Number(matchedProd.discountPrice) < Number(matchedProd.price) ? Number(matchedProd.price) : null,
                                  image: matchedProd.image
                                };
                                handleSaveBestseller(idx, updated);
                              } else {
                                const updated = {
                                  ...card,
                                  productId: '',
                                };
                                handleSaveBestseller(idx, updated);
                              }
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px', backgroundColor: '#ffffff' }}
                          >
                            <option value="">-- Choose inventory product --</option>
                            {products.map(p => (
                              <option key={p.id} value={p.id}>{p.name} (ID: {p.id} - ₹{p.price})</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Product Name Override</label>
                          <input 
                            type="text" 
                            value={card.name} 
                            onChange={(e) => {
                              const updated = { ...card, name: e.target.value };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Badge Label CSS Class (e.g. most-loved, trending-now, limited-edition)</label>
                          <input 
                            type="text" 
                            value={card.label} 
                            onChange={(e) => {
                              const updated = { ...card, label: e.target.value };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Badge Text Display (e.g. Most Loved)</label>
                          <input 
                            type="text" 
                            value={card.labelText} 
                            onChange={(e) => {
                              const updated = { ...card, labelText: e.target.value };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Price (₹)</label>
                          <input 
                            type="number" 
                            value={card.price} 
                            onChange={(e) => {
                              const updated = { ...card, price: Number(e.target.value) };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Original Price (₹, optional)</label>
                          <input 
                            type="number" 
                            value={card.originalPrice || ''} 
                            onChange={(e) => {
                              const updated = { ...card, originalPrice: e.target.value ? Number(e.target.value) : null };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rating Stars (e.g. 4.9)</label>
                          <input 
                            type="number" 
                            step="0.1" 
                            max="5.0"
                            value={card.rating} 
                            onChange={(e) => {
                              const updated = { ...card, rating: Number(e.target.value) };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                        </div>
                        <div style={{ gridColumn: 'span 2' }}>
                          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Image URL or Base64</label>
                          <input 
                            type="text" 
                            value={card.image} 
                            onChange={(e) => {
                              const updated = { ...card, image: e.target.value };
                              handleSaveBestseller(idx, updated);
                            }}
                            style={{ width: '100%', padding: '8px', fontSize: '0.75rem', border: '1px solid rgba(0,0,0,0.1)', marginTop: '4px' }}
                          />
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  const updated = { ...card, image: reader.result };
                                  handleSaveBestseller(idx, updated);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                            style={{ fontSize: '0.65rem', marginTop: '6px', width: '100%' }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
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
                      value={categoriesInput} 
                      onChange={(e) => setCategoriesInput(e.target.value)} 
                      placeholder="e.g. all, jeans, skirts, cargos, shirts, footwear"
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

              {/* Category Banners & Tagline CMS Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', marginTop: '30px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', color: 'var(--accent-gold)' }}>CATEGORY HERO BANNERS CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', borderBottom: '1px dashed rgba(0,0,0,0.08)', paddingBottom: '14px', marginBottom: '4px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Add New Custom Category</label>
                      <input 
                        type="text"
                        placeholder="e.g. coordinates"
                        value={newCustomCategoryInput}
                        onChange={(e) => setNewCustomCategoryInput(e.target.value)}
                        style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    <button 
                      type="button" 
                      onClick={handleAddNewCategory}
                      className="btn-primary"
                      style={{ padding: '9px 16px', fontSize: '0.75rem', height: 'fit-content' }}
                    >
                      Add Category
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Select Category</label>
                    <select
                      value={selectedMetaCategory}
                      onChange={(e) => handleSelectMetaCategory(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      {categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Category Tagline / Description</label>
                    <input 
                      type="text" 
                      value={categoryMetaForm.tagline}
                      onChange={(e) => setCategoryMetaForm(prev => ({ ...prev, tagline: e.target.value }))}
                      placeholder="e.g. Modern silhouettes, raw edges, deconstructed fits"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Category Cover Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        value={categoryMetaForm.coverImage}
                        onChange={(e) => setCategoryMetaForm(prev => ({ ...prev, coverImage: e.target.value }))}
                        placeholder="Image URL or upload file below..."
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <UploadCloud size={14} /> Upload Banner Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setCategoryMetaForm(prev => ({ ...prev, coverImage: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {categoryMetaForm.coverImage && (
                        <button 
                          type="button" 
                          onClick={() => setCategoryMetaForm(prev => ({ ...prev, coverImage: '' }))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  {categoryMetaForm.coverImage && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Banner Preview</label>
                      <div style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(${categoryMetaForm.coverImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '140px',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '16px',
                        color: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '1.2rem', fontWeight: 800 }}>{selectedMetaCategory}</h4>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem', color: '#dddddd' }}>{categoryMetaForm.tagline || 'No tagline set'}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = {
                          ...categoryMetadata,
                          [selectedMetaCategory.toLowerCase()]: categoryMetaForm
                        };
                        setCategoryMetadata(updated);
                        localStorage.setItem('offkilt_category_metadata', JSON.stringify(updated));
                        triggerSync('offkilt_settings_updated');
                        alert(`Cover and tagline settings saved for category "${selectedMetaCategory}"!`);
                      }}
                      className="btn-primary"
                    >
                      <Save size={16} /> Save Category Banner
                    </button>
                  </div>

                </div>
              </div>

              {/* Homepage Grid Cards CMS Card */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)', marginTop: '30px' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px', color: 'var(--accent-gold)' }}>HOMEPAGE GRID CARDS CMS</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  
                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Select Grid Section Card</label>
                    <select
                      value={selectedGridCardId}
                      onChange={(e) => handleSelectGridCard(e.target.value)}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      <optgroup label="Trending Lookbook Grid">
                        <option value="summer">Summer Breeze (Collection)</option>
                        <option value="party">Party Glam (Occasion Wear)</option>
                        <option value="office">Office Chic (Work Edit)</option>
                        <option value="ethnic">Ethnic Fusion (Heritage)</option>
                        <option value="street">Street Style (Urban)</option>
                      </optgroup>
                      <optgroup label="Shop By Style Grid">
                        <option value="casual">Casual (Effortlessly cool)</option>
                        <option value="minimal">Minimal (Less is more)</option>
                        <option value="korean">Korean Fashion (K-style vibes)</option>
                        <option value="western">Western (Modern west edit)</option>
                        <option value="traditional">Traditional (Heritage meets now)</option>
                        <option value="evening">Luxury Evening (Night of elegance)</option>
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Target Category (Catalog Redirect on Click)</label>
                    <select
                      value={gridCardForm.category || 'all'}
                      onChange={(e) => setGridCardForm(prev => ({ ...prev, category: e.target.value }))}
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px', backgroundColor: '#ffffff' }}
                    >
                      {categoryList.map(cat => (
                        <option key={cat} value={cat}>{cat.toUpperCase()}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Card Title / Name</label>
                    <input 
                      type="text" 
                      value={gridCardForm.title}
                      onChange={(e) => setGridCardForm(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g. Summer Breeze"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Card Subtext / Tagline</label>
                    <input 
                      type="text" 
                      value={gridCardForm.tag}
                      onChange={(e) => setGridCardForm(prev => ({ ...prev, tag: e.target.value }))}
                      placeholder="e.g. Effortlessly cool, K-style vibes, Collection"
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                    />
                  </div>

                  <div>
                    <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Card Background Cover Image</label>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
                      <input 
                        type="text" 
                        value={gridCardForm.bg}
                        onChange={(e) => setGridCardForm(prev => ({ ...prev, bg: e.target.value }))}
                        placeholder="Image URL or upload file below..."
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', border: '1px solid rgba(0,0,0,0.1)', borderRadius: '2px' }}
                      />
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <label style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        border: '1px solid rgba(0,0,0,0.15)',
                        borderRadius: '2px',
                        cursor: 'pointer',
                        fontSize: '0.7rem',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <UploadCloud size={14} /> Upload Card Image
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: 'none' }}
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onloadend = () => {
                                setGridCardForm(prev => ({ ...prev, bg: reader.result }));
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                      </label>
                      {gridCardForm.bg && (
                        <button 
                          type="button" 
                          onClick={() => setGridCardForm(prev => ({ ...prev, bg: '' }))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '0.7rem', textDecoration: 'underline', cursor: 'pointer' }}
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                  </div>

                  {gridCardForm.bg && (
                    <div style={{ marginTop: '10px' }}>
                      <label style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-grey)', display: 'block', marginBottom: '6px' }}>Card Preview</label>
                      <div style={{ 
                        backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(${gridCardForm.bg})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        height: '180px',
                        width: '180px',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        padding: '16px',
                        color: '#ffffff',
                        border: '1px solid rgba(0,0,0,0.05)'
                      }}>
                        <span style={{ fontSize: '0.55rem', letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--accent-raw)', fontWeight: 600 }}>{gridCardForm.tag || 'SUBTEXT'}</span>
                        <h4 style={{ margin: 0, textTransform: 'uppercase', fontSize: '0.95rem', fontWeight: 800 }}>{gridCardForm.title || 'TITLE'}</h4>
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
                    <button 
                      type="button" 
                      onClick={() => {
                        const updated = {
                          ...gridCardsMetadata,
                          [selectedGridCardId]: gridCardForm
                        };
                        setGridCardsMetadata(updated);
                        localStorage.setItem('offkilt_homepage_grid_cards', JSON.stringify(updated));
                        triggerSync('offkilt_settings_updated');
                        alert(`Homepage card settings saved for "${GRID_CARD_DEFAULTS[selectedGridCardId]?.title || selectedGridCardId}"!`);
                      }}
                      className="btn-primary"
                    >
                      <Save size={16} /> Save Card Settings
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
                      {currentUser?.role === 'Super Admin' && <th style={{ padding: '12px', textAlign: 'right' }}>Actions</th>}
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
                        {currentUser?.role === 'Super Admin' && (
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                              <button 
                                onClick={() => {
                                  setEditingAdminEmail(r.email);
                                  setNewAdmin({ name: r.name, email: r.email, role: r.role });
                                }}
                                style={{ color: 'var(--accent-raw)', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Edit Role"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => handleDeleteAdmin(r.email)}
                                style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}
                                title="Delete Admin"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Add/Edit admin form */}
              <div style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '4px', border: '1px solid rgba(0,0,0,0.06)' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '20px', letterSpacing: '1px' }}>
                  {editingAdminEmail ? 'EDIT ACCESS OPERATOR' : 'ADD ACCESS OPERATOR'}
                </h3>
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
                      disabled={!!editingAdminEmail}
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

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      {editingAdminEmail ? <Save size={16} /> : <Plus size={16} />}
                      {editingAdminEmail ? ' Save Operator' : ' Register Admin'}
                    </button>
                    {editingAdminEmail && (
                      <button 
                        type="button" 
                        className="btn-secondary" 
                        onClick={() => {
                          setEditingAdminEmail(null);
                          setNewAdmin({ name: '', email: '', role: 'Catalog Manager' });
                        }}
                        style={{ padding: '8px 16px', fontSize: '0.75rem' }}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* 15. EMAIL MANAGEMENT */}
          {activeTab === 'email' && <AdminEmailTab />}

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
                  <p>Order ID: {selectedOrder.id || selectedOrder.orderId}</p>
                  <p>Date: {invoiceDetails.date}</p>
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
                  <p style={{ whiteSpace: 'pre-line' }}>{invoiceDetails.address}</p>
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
                    <span>{invoiceDetails.shipping === 0 ? 'FREE' : `₹${invoiceDetails.shipping.toLocaleString('en-IN')}`}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', color: '#555555', fontSize: '0.7rem' }}>
                    <span>Included IGST (12%):</span>
                    <span>₹{Math.round((invoiceDetails.total) - ((invoiceDetails.total) / 1.12)).toLocaleString('en-IN')}</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '2px double #111111', fontWeight: 'bold', fontSize: '0.85rem', marginTop: '10px' }}>
                    <span>Grand Total:</span>
                    <span>₹{invoiceDetails.total?.toLocaleString('en-IN')}</span>
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
