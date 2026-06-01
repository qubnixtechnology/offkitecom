import { useState } from 'react';
import { X, Trash2, Plus, Minus, ShieldCheck, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const FREE_SHIPPING_THRESHOLD = 5000;

export default function CartDrawer({ 
  isOpen, 
  onClose, 
  cartItems, 
  onUpdateQty, 
  onRemoveItem, 
  onCheckout 
}) {
  const subtotal = cartItems.reduce((acc, item) => {
    const price = item.variant ? item.variant.price : item.price;
    return acc + (price * item.quantity);
  }, 0);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingPercent = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  
  // Coupon Code Logic
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(() => {
    return JSON.parse(localStorage.getItem('offkilt_applied_coupon') || 'null');
  });
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    setCouponError('');
    if (!couponCode.trim()) return;

    const activeCoupons = JSON.parse(localStorage.getItem('offkilt_coupons') || '[]');
    if (activeCoupons.length === 0) {
      const defaultCoupons = [
        { code: 'OFFKILT10', discount: 10 },
        { code: 'OFFKILT20', discount: 20 },
        { code: 'FREESHIP', discount: 99 }
      ];
      localStorage.setItem('offkilt_coupons', JSON.stringify(defaultCoupons));
      activeCoupons.push(...defaultCoupons);
    }

    const found = activeCoupons.find(c => c.code.toUpperCase() === couponCode.trim().toUpperCase());
    if (found) {
      setAppliedCoupon(found);
      localStorage.setItem('offkilt_applied_coupon', JSON.stringify(found));
      setCouponCode('');
    } else {
      setCouponError('Invalid coupon code');
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem('offkilt_applied_coupon');
  };

  // Tax and Discount Calculations
  const discount = appliedCoupon 
    ? (appliedCoupon.discount <= 100 ? Math.round(subtotal * (appliedCoupon.discount / 100)) : appliedCoupon.discount)
    : 0;

  const gstIncluded = Math.round(Math.max(0, (subtotal - discount) - ((subtotal - discount) / 1.12)));
  const shippingCost = 0;
  const total = Math.max(0, subtotal - discount + shippingCost);

  return (
    <AnimatePresence>
      {isOpen && (
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
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="cart-drawer open"
            style={{ display: 'flex' }}
            data-lenis-prevent="true"
          >
            
            {/* Drawer Header */}
            <div className="cart-header">
              <h2 className="cart-title">YOUR BAG ({cartItems.reduce((acc, item) => acc + item.quantity, 0)})</h2>
              <button className="close-btn" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            {/* Free Shipping Progress Meter */}
            {cartItems.length > 0 && (
              <div className="cart-shipping-meter">
                <div className="shipping-meter-text mono">
                  <>Congrats! You have unlocked <span>FREE shipping</span></>
                </div>
                <div className="shipping-bar-track">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `100%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className="shipping-bar-fill"
                  ></motion.div>
                </div>
              </div>
            )}

            {/* Cart Items List */}
            <div className="cart-items">
              {cartItems.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="cart-empty"
                >
                  <X size={40} strokeWidth={1} />
                  <p className="mono">Your shopping bag is empty</p>
                  <button className="btn-secondary" onClick={onClose} style={{ marginTop: '10px' }}>
                    Go Rebels Catalog
                  </button>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {cartItems.map((item) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="cart-item" 
                      key={`${item.id}-${item.selectedSize}-${item.selectedVariantId || ''}`}
                    >
                      <div className="cart-item-img-wrapper">
                        <img 
                          src={item.variant && Array.isArray(item.variant.images) && item.variant.images.length > 0
                            ? item.variant.images[0]
                            : item.image
                          } 
                          alt={item.name} 
                          className="cart-item-img" 
                        />
                      </div>
                      
                      <div className="cart-item-details">
                        <div className="cart-item-title-row">
                          <div>
                            <h3 className="cart-item-name">{item.name}</h3>
                            <div className="cart-item-size">
                              SIZE: {item.selectedSize || 'FREE SIZE'}
                              {item.variant && ` | COLOR: ${item.variant.color}`}
                            </div>
                          </div>
                          <span className="cart-item-price">
                            {(() => {
                              const itemPrice = item.variant ? item.variant.price : item.price;
                              return `₹${(itemPrice * item.quantity).toLocaleString('en-IN')}`;
                            })()}
                          </span>
                        </div>
                        
                        <div className="cart-item-actions">
                          <div className="quantity-control">
                            <button 
                              className="quantity-btn" 
                              onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedVariantId, item.quantity - 1)}
                            >
                              <Minus size={10} />
                            </button>
                            <span className="quantity-val">{item.quantity}</span>
                            <button 
                              className="quantity-btn" 
                              onClick={() => onUpdateQty(item.id, item.selectedSize, item.selectedVariantId, item.quantity + 1)}
                            >
                              <Plus size={10} />
                            </button>
                          </div>
                          
                          <button 
                            className="remove-item-btn" 
                            onClick={() => onRemoveItem(item.id, item.selectedSize, item.selectedVariantId)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Cart Footer / checkout summary */}
            {cartItems.length > 0 && (
              <motion.div 
                layout
                className="cart-footer"
              >
                {/* Coupon entry form */}
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid rgba(0,0,0,0.06)' }}>
                  {appliedCoupon ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#f0fdf4', padding: '8px 12px', border: '1px solid #bbf7d0', borderRadius: '2px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#166534', fontSize: '0.75rem', fontWeight: 600 }}>
                        <Tag size={12} />
                        <span>COUPON APPLIED: {appliedCoupon.code}</span>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon} 
                        style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', background: 'none', border: 'none' }}
                      >
                        Remove
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '8px' }}>
                      <input
                        type="text"
                        placeholder="ENTER COUPON CODE"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value)}
                        style={{
                          flex: 1,
                          padding: '10px 12px',
                          fontSize: '0.75rem',
                          border: '1px solid rgba(0,0,0,0.12)',
                          borderRadius: '2px',
                          textTransform: 'uppercase',
                          fontFamily: 'var(--font-mono)',
                          outline: 'none',
                          backgroundColor: '#ffffff',
                          color: '#111111'
                        }}
                      />
                      <button 
                        type="submit" 
                        className="btn-primary" 
                        style={{ padding: '0 16px', fontSize: '0.7rem', justifyContent: 'center', height: '38px' }}
                      >
                        APPLY
                      </button>
                    </form>
                  )}
                  {couponError && (
                    <p style={{ color: '#ef4444', fontSize: '0.7rem', marginTop: '6px', fontFamily: 'var(--font-mono)' }}>
                      {couponError}
                    </p>
                  )}
                </div>

                <div className="cart-summary-row">
                  <span className="cart-summary-label">Subtotal</span>
                  <span className="cart-summary-val">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>

                {appliedCoupon && (
                  <div className="cart-summary-row" style={{ color: '#22c55e', fontWeight: 600 }}>
                    <span className="cart-summary-label">Discount ({appliedCoupon.code})</span>
                    <span className="cart-summary-val">-₹{discount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                
                <div className="cart-summary-row">
                  <span className="cart-summary-label">Shipping</span>
                  <span className="cart-summary-val">
                    {shippingCost === 0 ? 'FREE' : `₹${shippingCost.toLocaleString('en-IN')}`}
                  </span>
                </div>

                <div className="cart-summary-row" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span className="cart-summary-label">Included GST (12%)</span>
                  <span className="cart-summary-val">₹{gstIncluded.toLocaleString('en-IN')}</span>
                </div>

                <div className="cart-total-row">
                  <span className="cart-total-label">Total Amount</span>
                  <span className="cart-total-val">₹{total.toLocaleString('en-IN')}</span>
                </div>

                <button className="btn-primary checkout-btn" onClick={onCheckout}>
                  Checkout Via Razorpay
                </button>
                
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px', color: 'var(--text-muted)', fontSize: '0.7rem' }}>
                  <ShieldCheck size={14} style={{ color: '#22c55e' }} />
                  <span className="mono">Secure 256-bit SSL encrypted checkout</span>
                </div>
              </motion.div>
            )}

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
