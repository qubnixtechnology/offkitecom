import { useState, useEffect } from 'react';
import { X, Smartphone, CreditCard, Landmark, ChevronRight, Check, Truck, Zap } from 'lucide-react';

// Helper to read saved Razorpay settings from localStorage
function getRzpSettings() {
  try {
    return JSON.parse(localStorage.getItem('offkilt_razorpay') || 'null') || {};
  } catch { return {}; }
}

export default function RazorpayModal({ 
  isOpen, 
  onClose, 
  totalAmount, 
  onSuccess,
  currentUser
}) {
  const [step, setStep] = useState('contact'); // contact -> methods -> card | upi | netbanking -> verifying
  const [email, setEmail] = useState(() => currentUser ? currentUser.email || '' : '');
  const [phone, setPhone] = useState(() => currentUser ? currentUser.phone || '' : '');
  const [shippingAddress, setShippingAddress] = useState(() => currentUser ? currentUser.address || '' : '');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  // Verification animation states (fallback / COD)
  const [verificationStatus, setVerificationStatus] = useState('init');
  const [paymentMethodName, setPaymentMethodName] = useState('');

  // Mobile UPI detection
  const [isWaitingForMobilePay, setIsWaitingForMobilePay] = useState(false);
  const [desktopPaymentStatus, setDesktopPaymentStatus] = useState('awaiting');
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  const rzpSettings = getRzpSettings();
  const hasRzpKey = !!(rzpSettings.keyId);
  const upiIdFallback = rzpSettings.upiId || 'offkilt@oksbi';
  const upiLink = `upi://pay?pa=${upiIdFallback}&pn=${encodeURIComponent(rzpSettings.businessName || 'off-kilt Fashion')}&am=${totalAmount}&cu=INR`;

  // ─── Real Razorpay Checkout ───────────────────────────────────────────────
  const openRazorpayCheckout = (prefillMethod) => {
    if (!window.Razorpay) {
      alert('Razorpay SDK not loaded. Please check your internet connection and refresh the page.');
      return;
    }

    const options = {
      key: rzpSettings.keyId,
      amount: Math.round(totalAmount * 100), // paise
      currency: rzpSettings.currency || 'INR',
      name: rzpSettings.businessName || 'off-kilt Fashion',
      description: rzpSettings.businessDescription || 'Premium Denim & Streetwear',
      image: rzpSettings.businessLogo || '',
      prefill: {
        name: currentUser?.name || '',
        email: email || currentUser?.email || '',
        contact: phone || currentUser?.phone || '',
      },
      notes: {
        shipping_address: shippingAddress,
        customer_email: email,
      },
      theme: {
        color: rzpSettings.theme || '#f97316',
      },
      handler: function (response) {
        // Payment successful!
        const orderId = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
        onSuccess({
          orderId,
          email,
          phone,
          shippingAddress,
          paymentMethod: `Razorpay (${prefillMethod || 'Online Payment'})`,
          razorpay_payment_id: response.razorpay_payment_id,
          razorpay_order_id: response.razorpay_order_id,
          razorpay_signature: response.razorpay_signature,
          date: new Date().toLocaleDateString('en-IN', {
            year: 'numeric', month: 'long', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
          })
        });
        resetState();
      },
      modal: {
        ondismiss: function () {
          // User closed the popup — go back to methods
          setStep('methods');
        }
      }
    };

    const rzp = new window.Razorpay(options);

    rzp.on('payment.failed', function (response) {
      alert(`Payment failed: ${response.error.description}\n\nPlease try again or choose a different payment method.`);
      setStep('methods');
    });

    rzp.open();
  };

  // ─── Simulated payment for COD / when no Razorpay key set ────────────────
  function startSimulatedVerification(methodName) {
    setPaymentMethodName(methodName);
    setStep('verifying');
    setVerificationStatus('init');
    setTimeout(() => {
      setVerificationStatus('ledger');
      setTimeout(() => {
        setVerificationStatus('success');
        setTimeout(() => {
          const orderId = `OK-${Math.floor(100000 + Math.random() * 900000)}`;
          onSuccess({
            orderId, email, phone, shippingAddress,
            paymentMethod: methodName,
            date: new Date().toLocaleDateString('en-IN', {
              year: 'numeric', month: 'long', day: 'numeric',
              hour: '2-digit', minute: '2-digit'
            })
          });
          resetState();
        }, 1500);
      }, 1500);
    }, 1500);
  }

  function resetState() {
    setStep('contact');
    setEmail(''); setPhone(''); setCardNumber(''); setExpiry('');
    setCvv(''); setUpiId(''); setShippingAddress('');
    setIsWaitingForMobilePay(false); setDesktopPaymentStatus('awaiting');
  }

  const handleContactSubmit = (e) => {
    e.preventDefault();
    if (!email || !phone || !shippingAddress) return;
    setStep('methods');
  };

  const handlePaymentSelect = (mode) => {
    if (mode === 'cod') {
      startSimulatedVerification('Cash on Delivery');
      return;
    }
    // If Razorpay key is configured, open real checkout
    if (hasRzpKey && (mode === 'card' || mode === 'upi' || mode === 'netbanking' || mode === 'razorpay')) {
      openRazorpayCheckout(mode === 'card' ? 'Card' : mode === 'upi' ? 'UPI' : 'Netbanking');
      return;
    }
    // No key — fall back to simulated UI
    setStep(mode);
    if (mode === 'upi') {
      setIsWaitingForMobilePay(false);
      setDesktopPaymentStatus('awaiting');
    }
  };

  // Visibility return detection for mobile UPI
  useEffect(() => {
    const handleFocus = () => {
      if (step === 'upi' && isWaitingForMobilePay) {
        setIsWaitingForMobilePay(false);
        setDesktopPaymentStatus('detected');
      }
    };
    window.addEventListener('focus', handleFocus);
    const handleVisibility = () => { if (document.visibilityState === 'visible') handleFocus(); };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, isWaitingForMobilePay]);

  if (!isOpen) return null;

  const showCod = rzpSettings.enableCod !== false; // default true

  return (
    <>
      <div className="drawer-backdrop open" onClick={onClose} style={{ zIndex: 1001 }} />
      
      <div className="razorpay-modal open" data-lenis-prevent="true">
        
        {/* Header */}
        <div className="rzp-header">
          <div className="rzp-brand-info">
            <div className="rzp-logo-badge">ok</div>
            <div>
              <div className="rzp-name" style={{ fontFamily: 'var(--font-brand)', fontWeight: 700, textTransform: 'lowercase' }}>
                off-kilt <span style={{ textTransform: 'none', fontWeight: 'normal', fontSize: '0.8rem', opacity: 0.8 }}>Fashion</span>
              </div>
              <div className="rzp-desc">
                {hasRzpKey ? 'Powered by Razorpay — Secure Checkout' : 'Secure Checkout'}
              </div>
            </div>
          </div>
          <div className="rzp-amount-box">
            <div className="rzp-amt-label">Amount</div>
            <div className="rzp-amt-val">₹{totalAmount.toLocaleString('en-IN')}</div>
          </div>
          <button onClick={onClose} style={{ color: '#a0a5b5', cursor: 'pointer', padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Step 1: Contact & Shipping */}
        {step === 'contact' && (
          <form onSubmit={handleContactSubmit} className="rzp-body">
            <div className="rzp-input-group">
              <label className="rzp-label">Email Address</label>
              <input type="email" className="rzp-input" placeholder="rebel@off-kilt.com"
                value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div className="rzp-input-group">
              <label className="rzp-label">Mobile Number</label>
              <input type="tel" className="rzp-input" placeholder="9999999999"
                pattern="[0-9]{10}" maxLength="10"
                value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} required />
            </div>
            <div className="rzp-input-group">
              <label className="rzp-label">Shipping Address</label>
              <textarea className="rzp-input" placeholder="Enter complete delivery address..."
                rows={3} style={{ resize: 'none' }}
                value={shippingAddress} onChange={e => setShippingAddress(e.target.value)} required />
            </div>
            <button type="submit" className="rzp-mode-btn"
              style={{ justifyContent: 'space-between', backgroundColor: '#528ff0', borderColor: '#528ff0', color: '#ffffff', cursor: 'pointer' }}>
              <span>Proceed to Payment</span>
              <ChevronRight size={16} />
            </button>
          </form>
        )}

        {/* Step 2: Choose Method */}
        {step === 'methods' && (
          <div className="rzp-body">
            {/* Real Razorpay button when key is configured */}
            {hasRzpKey && (
              <div style={{ marginBottom: '16px', padding: '12px 16px', backgroundColor: 'rgba(82,143,240,0.06)', border: '1px solid rgba(82,143,240,0.2)', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Zap size={14} color="#528ff0" />
                <span style={{ fontSize: '0.75rem', color: '#528ff0', fontFamily: 'var(--font-mono)' }}>
                  RAZORPAY ACTIVE — All payment methods are live
                </span>
              </div>
            )}

            <div className="rzp-payment-modes">
              <button className="rzp-mode-btn" onClick={() => handlePaymentSelect('card')}>
                <CreditCard className="rzp-mode-icon" size={20} />
                <div className="rzp-mode-text">
                  <span className="rzp-mode-title">Card</span>
                  <span className="rzp-mode-subtitle">Visa, MasterCard, RuPay, Amex</span>
                </div>
                {hasRzpKey && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>LIVE</span>}
              </button>

              <button className="rzp-mode-btn" onClick={() => handlePaymentSelect('upi')}>
                <Smartphone className="rzp-mode-icon" size={20} />
                <div className="rzp-mode-text">
                  <span className="rzp-mode-title">UPI</span>
                  <span className="rzp-mode-subtitle">Google Pay, PhonePe, Paytm, BHIM</span>
                </div>
                {hasRzpKey && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>LIVE</span>}
              </button>

              <button className="rzp-mode-btn" onClick={() => handlePaymentSelect('netbanking')}>
                <Landmark className="rzp-mode-icon" size={20} />
                <div className="rzp-mode-text">
                  <span className="rzp-mode-title">Netbanking</span>
                  <span className="rzp-mode-subtitle">All Indian Major Banks</span>
                </div>
                {hasRzpKey && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontFamily: 'var(--font-mono)', marginLeft: 'auto' }}>LIVE</span>}
              </button>

              {showCod && (
                <button className="rzp-mode-btn" onClick={() => handlePaymentSelect('cod')}
                  style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '16px', marginTop: '8px' }}>
                  <Truck className="rzp-mode-icon" size={20} style={{ color: '#4ade80' }} />
                  <div className="rzp-mode-text">
                    <span className="rzp-mode-title">Cash on Delivery (COD)</span>
                    <span className="rzp-mode-subtitle">Pay when you receive the order</span>
                  </div>
                </button>
              )}
            </div>

            <button className="rzp-input" style={{ width: '100%', cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }}
              onClick={() => setStep('contact')}>
              Go Back
            </button>
          </div>
        )}

        {/* Simulated Card (when no Razorpay key) */}
        {step === 'card' && !hasRzpKey && (
          <div className="rzp-body">
            <div className="rzp-input-group">
              <label className="rzp-label">Card Number</label>
              <input type="text" className="rzp-input" placeholder="4111 2222 3333 4444"
                maxLength="19" value={cardNumber}
                onChange={e => setCardNumber(e.target.value.replace(/\W/gi, '').replace(/(.{4})/g, '$1 ').trim())} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="rzp-input-group">
                <label className="rzp-label">Expiry (MM/YY)</label>
                <input type="text" className="rzp-input" placeholder="12/28"
                  maxLength="5" value={expiry} onChange={e => setExpiry(e.target.value)} />
              </div>
              <div className="rzp-input-group">
                <label className="rzp-label">CVV</label>
                <input type="password" className="rzp-input" placeholder="•••"
                  maxLength="3" value={cvv} onChange={e => setCvv(e.target.value.replace(/\D/g, ''))} />
              </div>
            </div>
            <button className="rzp-mode-btn"
              style={{ justifyContent: 'center', backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#ffffff', cursor: 'pointer' }}
              onClick={() => startSimulatedVerification('Credit Card')}
              disabled={!cardNumber || !expiry || !cvv}>
              Pay ₹{totalAmount.toLocaleString('en-IN')} Securely
            </button>
            <button className="rzp-input" style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }}
              onClick={() => setStep('methods')}>Back to Methods</button>
          </div>
        )}

        {/* Simulated UPI (when no Razorpay key) */}
        {step === 'upi' && !hasRzpKey && (
          <div className="rzp-body">
            {isMobile ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ fontSize: '0.85rem', color: '#a0a5b5', textAlign: 'center', lineHeight: '1.4' }}>
                  Tap below to pay <strong style={{ color: '#fff' }}>₹{totalAmount}</strong> to <strong style={{ color: '#528ff0' }}>{upiIdFallback}</strong>.
                </div>
                <a href={upiLink} className="rzp-mode-btn"
                  style={{ justifyContent: 'center', backgroundColor: '#528ff0', borderColor: '#528ff0', color: '#ffffff', textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem', textAlign: 'center' }}
                  onClick={() => setIsWaitingForMobilePay(true)}>
                  Pay via UPI App (GPay/PhonePe)
                </a>
                {desktopPaymentStatus === 'detected' && (
                  <button className="rzp-mode-btn"
                    style={{ justifyContent: 'center', backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#ffffff', cursor: 'pointer', marginTop: '10px' }}
                    onClick={() => startSimulatedVerification('UPI App Direct')}>
                    I have completed the payment ✓
                  </button>
                )}
                {isWaitingForMobilePay && (
                  <div style={{ textAlign: 'center', fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent-raw)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                    <span className="pulse-dot" style={{ backgroundColor: 'var(--accent-raw)' }}></span>
                    <span>AWAITING RETURN FROM UPI APP...</span>
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ textAlign: 'center', padding: '16px', border: '1px dashed #363a4d', borderRadius: '4px' }}>
                  <div style={{ fontSize: '0.8rem', color: '#a0a5b5', marginBottom: '8px' }}>
                    Scan QR to pay ₹{totalAmount} to <strong style={{ color: '#528ff0' }}>{upiIdFallback}</strong>
                  </div>
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(upiLink)}`}
                    alt="Payment QR"
                    style={{ backgroundColor: '#ffffff', padding: '8px', borderRadius: '4px', margin: '0 auto', display: 'block' }}
                  />
                  <button className="rzp-mode-btn"
                    style={{ justifyContent: 'center', backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#ffffff', cursor: 'pointer', margin: '12px auto 0', maxWidth: '200px', fontSize: '0.75rem', padding: '8px 12px' }}
                    onClick={() => startSimulatedVerification('UPI QR Scan')}>
                    I have paid via QR ✓
                  </button>
                </div>
              </div>
            )}

            <div className="rzp-input-group">
              <label className="rzp-label">Or Enter UPI ID</label>
              <input type="text" className="rzp-input" placeholder="someone@upi"
                value={upiId} onChange={e => setUpiId(e.target.value)} />
              <div style={{ fontSize: '0.75rem', color: '#a0a5b5', marginTop: '6px' }}>
                Recipient: <strong style={{ color: '#528ff0' }}>{upiIdFallback}</strong>
              </div>
            </div>
            <button className="rzp-mode-btn"
              style={{ justifyContent: 'center', backgroundColor: '#22c55e', borderColor: '#22c55e', color: '#ffffff', cursor: 'pointer' }}
              onClick={() => startSimulatedVerification('UPI Instant VPA')}
              disabled={!upiId && !isMobile}>
              Verify & Confirm Order
            </button>
            <button className="rzp-input" style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }}
              onClick={() => setStep('methods')}>Back to Methods</button>
          </div>
        )}

        {/* Simulated Netbanking (when no Razorpay key) */}
        {step === 'netbanking' && !hasRzpKey && (
          <div className="rzp-body">
            <div className="rzp-payment-modes">
              {['HDFC Bank', 'ICICI Bank', 'SBI', 'Axis Bank', 'Kotak Bank'].map(bank => (
                <button key={bank} className="rzp-mode-btn"
                  onClick={() => startSimulatedVerification(`Netbanking (${bank})`)}
                  style={{ fontSize: '0.9rem', justifyContent: 'space-between' }}>
                  <span>{bank}</span>
                  <ChevronRight size={14} />
                </button>
              ))}
            </div>
            <button className="rzp-input" style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }}
              onClick={() => setStep('methods')}>Back to Methods</button>
          </div>
        )}

        {/* Verifying (COD / simulated) */}
        {step === 'verifying' && (
          <div className="rzp-body" style={{ minHeight: '260px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', textAlign: 'center' }}>
            {verificationStatus === 'init' && (
              <div className="verify-step animate-fadeIn">
                <div style={{ width: '50px', height: '50px', border: '4px solid rgba(82, 143, 240, 0.1)', borderTopColor: '#528ff0', borderRadius: '50%', animation: 'preloader-progress-track 1.5s infinite linear', margin: '0 auto 16px' }}></div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Confirming Order...</h3>
                <p style={{ fontSize: '0.8rem', color: '#a0a5b5', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0', lineHeight: '1.4' }}>
                  Processing your {paymentMethodName} order for ₹{totalAmount.toLocaleString('en-IN')}.
                </p>
              </div>
            )}
            {verificationStatus === 'ledger' && (
              <div className="verify-step animate-fadeIn">
                <div style={{ width: '50px', height: '50px', border: '4px solid rgba(249, 115, 22, 0.1)', borderTopColor: 'var(--accent-raw)', borderRadius: '50%', animation: 'preloader-progress-track 1.5s infinite linear', margin: '0 auto 16px' }}></div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Securing Order...</h3>
                <p style={{ fontSize: '0.8rem', color: '#a0a5b5', marginTop: '8px', maxWidth: '300px', margin: '8px auto 0', lineHeight: '1.4' }}>
                  Generating your order receipt and updating inventory.
                </p>
                <div className="ledger-progress-container" style={{ width: '200px', margin: '16px auto 0' }}>
                  <div className="ledger-progress-bar"></div>
                </div>
              </div>
            )}
            {verificationStatus === 'success' && (
              <div className="verify-step animate-fadeIn">
                <div style={{ width: '60px', height: '60px', borderRadius: '50%', backgroundColor: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', boxShadow: '0 0 15px rgba(34, 197, 94, 0.2)' }}>
                  <Check size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#22c55e' }}>ORDER PLACED!</h3>
                <p style={{ fontSize: '0.8rem', color: '#a0a5b5', marginTop: '8px' }}>
                  Rebellion Accomplished. Launching order tracker...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="rzp-footer">
          <span>{hasRzpKey ? 'Razorpay Trusted Merchant' : 'Secure Checkout'}</span>
          <span>•</span>
          <span>PCI-DSS Compliant</span>
          {hasRzpKey && <><span>•</span><span style={{ color: '#22c55e' }}>●</span><span style={{ color: '#22c55e' }}>{rzpSettings.enableLiveMode ? 'LIVE' : 'TEST'}</span></>}
        </div>

      </div>
    </>
  );
}
