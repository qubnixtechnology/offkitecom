import { useState, useEffect } from 'react';
import { X, Check, Package, Truck, ArrowRight, ShieldCheck, Search, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { orders as ordersApi } from '../services/api';

export default function OrderTrackingModal({ 
  isOpen, 
  onClose, 
  order: propOrder, 
  onContinueShopping 
}) {
  const [searchId, setSearchId] = useState('');
  const [activeOrder, setActiveOrder] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (propOrder) {
        setTimeout(() => {
          setActiveOrder(propOrder);
          setErrorMsg('');
        }, 0);
      } else {
        setTimeout(() => {
          setActiveOrder(null);
          setSearchId('');
          setErrorMsg('');
        }, 0);
      }
    }
  }, [isOpen, propOrder]);

  const handleSearch = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    
    if (!searchId.trim()) {
      setErrorMsg('Please enter an Order ID.');
      return;
    }

    setLoading(true);
    try {
      const res = await ordersApi.track(searchId.trim());
      if (res.data) {
        setActiveOrder(res.data);
      } else {
        throw new Error('Not found');
      }
    } catch (err) {
      setErrorMsg('Invalid Order ID. No shipment found with this tracking code.');
      setActiveOrder(null);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setActiveOrder(null);
    setSearchId('');
    setErrorMsg('');
    onClose();
  };

  const statusMap = {
    'confirmed': 1,
    'production': 2,
    'dispatched': 3,
    'transit': 4,
    'delivered': 5
  };

  const currentStep = activeOrder ? (statusMap[activeOrder.status] || 1) : 1;

  const timelineSteps = [
    { title: 'Rebellion Confirmed', desc: 'Order received and secure payment verified.', icon: ShieldCheck },
    { title: 'In Production', desc: 'Raw denim sourced & tailoring inspected.', icon: Package },
    { title: 'Dispatched', desc: 'Handed over to Rebel Cargo Logix.', icon: Truck },
    { title: 'In Transit', desc: 'Shipment evading conformity in transit.', icon: ArrowRight },
    { title: 'Delivered', desc: 'Rebellion successfully delivered.', icon: Check }
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drawer-backdrop open" 
            onClick={handleClose} 
            style={{ zIndex: 1002, display: 'block' }} 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="tracking-modal open"
            style={{ display: 'flex' }}
          >
            <div className="tracking-modal-header">
              <div>
                <h2 className="tracking-modal-title">Track the Rebellion</h2>
                {activeOrder && (
                  <p style={{ fontSize: '0.75rem', color: 'var(--accent-raw)', marginTop: '4px', fontFamily: 'var(--font-mono)' }}>
                    ORDER ID: {activeOrder.id || activeOrder.orderId}
                  </p>
                )}
              </div>
              <button onClick={handleClose} className="tracking-close-btn" title="Close Tracking">
                <X size={20} />
              </button>
            </div>

            <div className="tracking-modal-body" data-lenis-prevent>
              <AnimatePresence mode="wait">
                {!activeOrder ? (
                  <motion.div 
                    key="search"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="tracking-result-container" 
                    style={{ padding: '20px 0' }}
                  >
                    <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                      <Search size={32} style={{ color: 'var(--accent-raw)', marginBottom: '16px', opacity: 0.8 }} />
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--text-light)', fontFamily: 'var(--font-heading)' }}>RETRIEVE CARGO TIMELINE</h3>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', marginTop: '8px', lineHeight: '1.4' }}>
                        Enter your 8-character secure transaction code (e.g., <strong style={{ color: 'var(--accent-raw)' }}>OK-123456</strong>) to inspect dispatch and transit logs.
                      </p>
                    </div>

                    {errorMsg && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{ 
                          color: 'var(--accent-raw)', 
                          fontSize: '0.8rem', 
                          padding: '12px', 
                          border: '1px solid rgba(249, 115, 22, 0.2)', 
                          backgroundColor: 'rgba(249, 115, 22, 0.05)', 
                          borderRadius: '4px', 
                          marginBottom: '20px', 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '8px',
                          fontFamily: 'var(--font-mono)'
                        }}
                      >
                        <AlertCircle size={16} style={{ flexShrink: 0 }} />
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                      <div className="rzp-input-group">
                        <label className="rzp-label">ORDER SECURE CODE</label>
                        <input 
                          type="text" 
                          className="rzp-input" 
                          placeholder="e.g. OK-384910"
                          style={{ width: '100%', textTransform: 'uppercase' }}
                          value={searchId}
                          onChange={e => setSearchId(e.target.value)}
                          required
                        />
                      </div>

                      <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center', width: '100%' }} disabled={loading}>
                        {loading ? 'Querying...' : 'Query Cargo Status'}
                      </button>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="timeline"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="tracking-result-container"
                  >
                    
                    {/* Timeline Section */}
                    <div className="tracking-section-title">SHIPMENT TIMELINE</div>
                    <div className="tracking-timeline">
                      {timelineSteps.map((step, idx) => {
                        const stepNum = idx + 1;
                        const isCompleted = stepNum < currentStep;
                        const isActive = stepNum === currentStep;
                        const StepIcon = step.icon;

                        return (
                          <div key={idx} className={`timeline-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                            <div className="timeline-badge-wrapper">
                              <div className="timeline-badge">
                                <StepIcon size={14} />
                              </div>
                              {idx < timelineSteps.length - 1 && <div className="timeline-line"></div>}
                            </div>
                            <div className="timeline-content">
                              <h4 className="timeline-title">{step.title}</h4>
                              <p className="timeline-desc">{step.desc}</p>
                              {isActive && (
                                <span className="timeline-pulse-badge">
                                  <span className="pulse-dot"></span> Active Status
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Order Info & Address */}
                    <div className="tracking-section-title" style={{ marginTop: '30px' }}>LOGISTICS DETAILS</div>
                    <div className="tracking-meta-grid">
                      <div className="tracking-meta-card">
                        <div className="tracking-meta-label">COURIER SERVICE</div>
                        <div className="tracking-meta-value" style={{ color: 'var(--text-light)', fontWeight: 600 }}>
                          Rebel Cargo Logix (RC)
                        </div>
                        <div className="tracking-meta-label" style={{ marginTop: '8px' }}>AWB TRACKING NO.</div>
                        <div className="tracking-meta-value font-mono">
                          RC-{(activeOrder.id || activeOrder.orderId).replace('OK-', '')}92IN
                        </div>
                      </div>

                      <div className="tracking-meta-card">
                        <div className="tracking-meta-label">DELIVERY ADDRESS</div>
                        <div className="tracking-meta-value" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                          {activeOrder.shipping_address || activeOrder.shippingAddress}
                        </div>
                      </div>
                    </div>

                    {/* Items Section */}
                    <div className="tracking-section-title" style={{ marginTop: '30px' }}>ITEMS IN TRANSIT</div>
                    <div className="tracking-items-list">
                      {activeOrder.items && activeOrder.items.map((item, idx) => (
                        <div key={idx} className="tracking-item-row">
                          <img 
                            src={item.image_path || item.image} 
                            alt={item.product_name || item.name} 
                            className="tracking-item-thumb" 
                          />
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="tracking-item-name">{item.product_name || item.name}</div>
                            <div className="tracking-item-meta">
                              Size: {item.selected_size || item.selectedSize} | Qty: {item.quantity}
                            </div>
                          </div>
                          <div className="tracking-item-price">
                            ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Pricing breakdown */}
                    <div className="tracking-summary-box">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span>₹{activeOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      <div className="summary-row">
                        <span>Rebel Courier Fee</span>
                        <span>{(activeOrder.shipping_fee === 0 || activeOrder.shipping === 0) ? 'FREE' : `₹${activeOrder.shipping_fee || activeOrder.shipping}`}</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total paid</span>
                        <span style={{ color: 'var(--accent-raw)' }}>
                          ₹{(activeOrder.total || (activeOrder.subtotal + activeOrder.shipping)).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {/* Continue Shopping & Track Another Buttons */}
                    <button 
                      onClick={onContinueShopping || handleClose} 
                      className="btn-primary" 
                      style={{ width: '100%', marginTop: '30px', justifyContent: 'center', height: '48px' }}
                    >
                      Continue Shopping
                    </button>

                    <div style={{ textAlign: 'center', marginTop: '16px' }}>
                      <button 
                        type="button" 
                        onClick={() => { setActiveOrder(null); setSearchId(''); setErrorMsg(''); }}
                        style={{ fontSize: '0.75rem', color: 'var(--text-grey)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                      >
                        Track another shipment
                      </button>
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
