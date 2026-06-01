import { useState, useEffect } from 'react';
import { X, User, Mail, Phone, MapPin, Lock, Camera, History, LogOut, Edit, Save, Check, Truck, Eye, EyeOff, Heart, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { auth as authApi, profile as profileApi } from '../services/api';

export default function UserProfileModal({ 
  isOpen, 
  onClose, 
  currentUser, 
  onLogin, 
  onLogout, 
  onUpdateProfile,
  orders = [],
  onTrackOrder,
  onSeedMockOrders,
  onOpenAdmin,
  wishlist = [],
  onWishlistToggle,
  onProductClick
}) {
  const [activeTab, setActiveTab] = useState('login'); // 'login' | 'register' | 'forgot' | 'reset'
  
  // Auth Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');

  // Forgot Password Fields
  const [resetEmail, setResetEmail] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [resetRequested, setResetRequested] = useState(false);

  // Editing Profile Fields
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [editPincode, setEditPincode] = useState('');
  const [editError, setEditError] = useState('');
  const [editSuccess, setEditSuccess] = useState(false);

  // Auto-listen to URL hash parameters on mount/open to trigger mock reset links
  useEffect(() => {
    if (isOpen) {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('reset-email');
      const tokenParam = params.get('reset-token');
      if (emailParam) {
        setTimeout(() => {
          setResetEmail(emailParam);
          setResetToken(tokenParam || '');
          setActiveTab('reset');
          setAuthError('');
        }, 0);
        // Clean URL params so it doesn't trigger repeatedly
        window.history.replaceState({}, document.title, window.location.pathname);
      }
    }
  }, [isOpen]);

  // Handle Login submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');
    if (!email || !password) {
      setAuthError('Please fill in all credentials.');
      return;
    }
    
    try {
      const res = await authApi.login({ email, password });
      onLogin(res.data.user, res.data.access_token);
      resetAuthForm();
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Login failed. Please check credentials.');
    }
  };

  // Handle Registration submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccessMsg('');

    if (!name || !email || !phone || !address || !pincode || !password) {
      setAuthError('All registration fields are required.');
      return;
    }

    if (phone.replace(/\D/g, '').length !== 10) {
      setAuthError('Enter a valid 10-digit mobile number.');
      return;
    }

    if (pincode.replace(/\D/g, '').length !== 6) {
      setAuthError('Enter a valid 6-digit postal pincode.');
      return;
    }

    try {
      const res = await authApi.register({
        name,
        email,
        phone,
        address,
        pincode,
        password,
        password_confirmation: password // Auto-confirm for simple UX
      });
      onLogin(res.data.user, res.data.access_token);
      resetAuthForm();
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Registration failed.');
    }
  };

  // Handle Request Forgot Password link
  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setResetRequested(false);

    if (!resetEmail) {
      setAuthError('Please enter your registered email address.');
      return;
    }

    try {
      await authApi.forgotPassword(resetEmail);
      setResetRequested(true);
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Failed to request password reset link.');
    }
  };

  // Handle Reset password form submission
  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    if (!resetNewPassword || !resetConfirmPassword) {
      setAuthError('Please fill in both password fields.');
      return;
    }

    if (resetNewPassword !== resetConfirmPassword) {
      setAuthError('Passwords do not match.');
      return;
    }

    try {
      await authApi.resetPassword({
        email: resetEmail,
        token: resetToken || 'mock-token',
        password: resetNewPassword,
        password_confirmation: resetConfirmPassword
      });

      // Keep offline fallback synced
      const users = JSON.parse(localStorage.getItem('offkilt_users') || '[]');
      const updatedUsers = users.map(u => {
        if (u.email.toLowerCase() === resetEmail.toLowerCase()) {
          return { ...u, password: resetNewPassword };
        }
        return u;
      });

      localStorage.setItem('offkilt_users', JSON.stringify(updatedUsers));

      // Save defaults overrides
      if (resetEmail.toLowerCase() === 'demo@off-kilt.com') {
        localStorage.setItem('offkilt_demo_password', resetNewPassword);
      } else if (resetEmail.toLowerCase() === 'admin@offkilt.com') {
        localStorage.setItem('offkilt_admin_password', resetNewPassword);
      }
      
      // Clear reset inputs
      setResetNewPassword('');
      setResetConfirmPassword('');
      setResetEmail('');
      setResetToken('');
      setResetRequested(false);
      
      // Redirect to login with success message
      setActiveTab('login');
      setAuthSuccessMsg('Password successfully reset! Log in below.');
    } catch (err) {
      setAuthError(err.response?.data?.message || 'Password reset failed.');
    }
  };

  const resetAuthForm = () => {
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setPincode('');
    setAuthError('');
  };

  // Toggle Profile Edit mode
  const startEditing = () => {
    setEditName(currentUser.name);
    setEditPhone(currentUser.phone);
    setEditAddress(currentUser.address);
    setEditPincode(currentUser.pincode);
    setEditError('');
    setEditSuccess(false);
    setIsEditing(true);
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditSuccess(false);

    if (!editName || !editPhone || !editAddress || !editPincode) {
      setEditError('Please fill in all profile fields.');
      return;
    }

    try {
      const res = await profileApi.update({
        name: editName,
        phone: editPhone,
        address: editAddress,
        pincode: editPincode
      });
      onUpdateProfile(res.data.user);
      setIsEditing(false);
      setEditSuccess(true);
      setTimeout(() => setEditSuccess(false), 3000);
    } catch (err) {
      setEditError(err.response?.data?.message || 'Profile update failed.');
    }
  };

  // Profile Image Base64 Uploader
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedUser = {
          ...currentUser,
          profileImage: reader.result
        };
        onUpdateProfile(updatedUser);
      };
      reader.readAsDataURL(file);
    }
  };

  // Membership status calculation helper
  const getMembershipStatus = () => {
    if (!currentUser) return null;
    if (!currentUser.email) {
      return {
        tier: 'Rebel Member',
        badge: 'REBEL MEMBER',
        class: 'rebel',
        color: '#8a8a93',
        count: 0,
        nextTier: { name: 'Plus Member', remaining: 5 }
      };
    }
    
    const userOrders = (orders || []).filter(o => o?.email && o.email.toLowerCase() === currentUser.email.toLowerCase());
    const totalItems = userOrders.reduce((sum, order) => {
      return sum + (order.items ? order.items.reduce((itemSum, item) => itemSum + item.quantity, 0) : 0);
    }, 0);

    if (totalItems >= 10) {
      return {
        tier: 'Premium Plus Member',
        badge: 'PREMIUM PLUS',
        class: 'premium-plus',
        color: '#fbbf24',
        count: totalItems,
        nextTier: null
      };
    } else if (totalItems >= 5) {
      return {
        tier: 'Plus Member',
        badge: 'PLUS MEMBER',
        class: 'plus',
        color: '#f97316',
        count: totalItems,
        nextTier: { name: 'Premium Plus', remaining: 10 - totalItems }
      };
    } else {
      return {
        tier: 'Rebel Member',
        badge: 'REBEL MEMBER',
        class: 'rebel',
        color: '#8a8a93',
        count: totalItems,
        nextTier: { name: 'Plus Member', remaining: 5 - totalItems }
      };
    }
  };

  const membership = getMembershipStatus();
  const userOrders = (currentUser && currentUser.email && orders) 
    ? orders.filter(o => o?.email && o.email.toLowerCase() === currentUser.email.toLowerCase()) 
    : [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="drawer-backdrop open" 
            onClick={onClose} 
            style={{ zIndex: 1002, display: 'block' }} 
          />

          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="tracking-modal open" 
            style={{ maxWidth: '640px', display: 'flex' }}
          >
            
            {/* Header */}
            <div className="tracking-modal-header">
              <div>
                <h2 className="tracking-modal-title">
                  {currentUser ? 'Rebel Profile' : activeTab === 'forgot' ? 'Reset Gate' : activeTab === 'reset' ? 'Set Password' : 'Join the Rebellion'}
                </h2>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-grey)', marginTop: '4px' }}>
                  {currentUser ? `Welcome back, ${currentUser.name}` : 'Login or register to sync orders, track timelines, and unlock rewards.'}
                </p>
              </div>
              <button onClick={onClose} className="tracking-close-btn" title="Close Profile">
                <X size={20} />
              </button>
            </div>

            <div className="tracking-modal-body" data-lenis-prevent>
              
              <AnimatePresence mode="wait">
                {/* NOT LOGGED IN MODE */}
                {!currentUser && (
                  <motion.div 
                    key="auth"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="auth-container"
                  >
                    
                    {/* Tab Selector (only visible on login/register view) */}
                    {(activeTab === 'login' || activeTab === 'register') && (
                      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: '24px' }}>
                        <button 
                          className={`auth-tab ${activeTab === 'login' ? 'active' : ''}`}
                          onClick={() => { setActiveTab('login'); setAuthError(''); setAuthSuccessMsg(''); }}
                        >
                          SIGN IN
                        </button>
                        <button 
                          className={`auth-tab ${activeTab === 'register' ? 'active' : ''}`}
                          onClick={() => { setActiveTab('register'); setAuthError(''); setAuthSuccessMsg(''); }}
                        >
                          REGISTER
                        </button>
                      </div>
                    )}

                    {authSuccessMsg && (
                      <div style={{ color: '#22c55e', fontSize: '0.8rem', padding: '12px', border: '1px solid rgba(34, 197, 94, 0.2)', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '4px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Check size={14} /> {authSuccessMsg}
                      </div>
                    )}

                    {authError && (
                      <div style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', padding: '12px', border: '1px solid rgba(249, 115, 22, 0.2)', backgroundColor: 'rgba(249, 115, 22, 0.05)', borderRadius: '4px', marginBottom: '20px', fontFamily: 'var(--font-mono)' }}>
                        {authError}
                      </div>
                    )}

                    {/* Login Form */}
                    {activeTab === 'login' && (
                      <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div className="rzp-input-group">
                          <label className="rzp-label">Email Address</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="email" 
                              className="rzp-input" 
                              placeholder="e.g. name@example.com"
                              style={{ width: '100%', paddingLeft: '40px' }}
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                            />
                            <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          </div>
                        </div>

                        <div className="rzp-input-group">
                          <label className="rzp-label">Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? "text" : "password"} 
                              className="rzp-input" 
                              placeholder="Enter your password"
                              style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              required
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        {/* Forgot password trigger */}
                        <div style={{ textAlign: 'right', marginTop: '-8px' }}>
                          <button 
                            type="button" 
                            onClick={() => { setActiveTab('forgot'); setAuthError(''); setAuthSuccessMsg(''); setResetRequested(false); }}
                            style={{ fontSize: '0.75rem', color: 'var(--text-grey)', textDecoration: 'underline', background: 'none', border: 'none', cursor: 'pointer' }}
                          >
                            Forgot Password?
                          </button>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center', marginTop: '10px' }}>
                          Access Account
                        </button>


                      </form>
                    )}

                    {/* Register Form */}
                    {activeTab === 'register' && (
                      <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="rzp-input-group">
                            <label className="rzp-label">Full Name</label>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="text" 
                                className="rzp-input" 
                                placeholder="e.g. Demo User"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                              />
                              <User size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            </div>
                          </div>

                          <div className="rzp-input-group">
                            <label className="rzp-label">Mobile Number</label>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="tel" 
                                className="rzp-input" 
                                placeholder="e.g. 8291155692"
                                pattern="[0-9]{10}"
                                maxLength="10"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={phone}
                                onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                                required
                              />
                              <Phone size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            </div>
                          </div>
                        </div>

                        <div className="rzp-input-group">
                          <label className="rzp-label">Email Address</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="email" 
                              className="rzp-input" 
                              placeholder="e.g. demo@off-kilt.com"
                              style={{ width: '100%', paddingLeft: '40px' }}
                              value={email}
                              onChange={e => setEmail(e.target.value)}
                              required
                            />
                            <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          </div>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                          <div className="rzp-input-group">
                            <label className="rzp-label">Complete Shipping Address</label>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="text" 
                                className="rzp-input" 
                                placeholder="e.g. Flat 302, Building A, Sector 15, Vashi, Navi Mumbai"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={address}
                                onChange={e => setAddress(e.target.value)}
                                required
                              />
                              <MapPin size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            </div>
                          </div>

                          <div className="rzp-input-group">
                            <label className="rzp-label">Pincode</label>
                            <input 
                              type="text" 
                              className="rzp-input" 
                              placeholder="400703"
                              maxLength="6"
                              value={pincode}
                              onChange={e => setPincode(e.target.value.replace(/\D/g, ''))}
                              required
                            />
                          </div>
                        </div>

                        <div className="rzp-input-group">
                          <label className="rzp-label">Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type={showPassword ? "text" : "password"} 
                              className="rzp-input" 
                              placeholder="Create a strong password"
                              style={{ width: '100%', paddingLeft: '40px', paddingRight: '40px' }}
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              required
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center', marginTop: '10px' }}>
                          Create Rebel Account
                        </button>
                      </form>
                    )}

                    {/* Forgot Password Request View */}
                    {activeTab === 'forgot' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>PASSWORD RECOVERY</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', lineHeight: '1.4' }}>
                          Enter your registered email address below. We will simulate sending a secure verification token to reset your password credentials.
                        </p>

                        <form onSubmit={handleForgotSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                          <div className="rzp-input-group">
                            <label className="rzp-label">Registered Email</label>
                            <div style={{ position: 'relative' }}>
                              <input 
                                type="email" 
                                className="rzp-input" 
                                placeholder="e.g. demo@off-kilt.com"
                                style={{ width: '100%', paddingLeft: '40px' }}
                                value={resetEmail}
                                onChange={e => setResetEmail(e.target.value)}
                                required
                              />
                              <Mail size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                            </div>
                          </div>

                          {!resetRequested ? (
                            <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center' }}>
                              Request Reset Link
                            </button>
                          ) : (
                            <div style={{ backgroundColor: 'rgba(249,115,22,0.03)', border: '1px dashed rgba(249,115,22,0.25)', padding: '18px', borderRadius: '4px', textAlign: 'center' }}>
                              <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent-raw)', fontWeight: 800, marginBottom: '6px' }}>[REBEL EMAIL GATEWAY]</div>
                              <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', lineHeight: '1.4', marginBottom: '12px' }}>
                                A simulated verification reset link has been dispatched to <strong>{resetEmail}</strong>. Tap below to verify and open the password reset page:
                              </p>
                              <button 
                                type="button" 
                                className="btn-secondary" 
                                style={{ padding: '8px 16px', fontSize: '0.7rem', width: '100%', justifyContent: 'center' }}
                                onClick={() => { setActiveTab('reset'); setAuthError(''); }}
                              >
                                Verify & Set New Password
                              </button>
                            </div>
                          )}

                          <button 
                            type="button" 
                            className="rzp-input" 
                            style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }} 
                            onClick={() => { setActiveTab('login'); setAuthError(''); }}
                          >
                            Back to Sign In
                          </button>
                        </form>
                      </div>
                    )}

                    {/* Reset Password Form */}
                    {activeTab === 'reset' && (
                      <form onSubmit={handleResetPasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <h3 style={{ fontSize: '0.9rem', color: 'var(--text-light)', fontFamily: 'var(--font-mono)' }}>SET NEW PASSWORD</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-grey)', lineHeight: '1.4' }}>
                          Resetting credentials for <strong style={{ color: '#fff' }}>{resetEmail}</strong>.
                        </p>

                        <div className="rzp-input-group">
                          <label className="rzp-label">New Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="password" 
                              className="rzp-input" 
                              placeholder="Enter new password"
                              style={{ width: '100%', paddingLeft: '40px' }}
                              value={resetNewPassword}
                              onChange={e => setResetNewPassword(e.target.value)}
                              required
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          </div>
                        </div>

                        <div className="rzp-input-group">
                          <label className="rzp-label">Confirm New Password</label>
                          <div style={{ position: 'relative' }}>
                            <input 
                              type="password" 
                              className="rzp-input" 
                              placeholder="Re-enter new password"
                              style={{ width: '100%', paddingLeft: '40px' }}
                              value={resetConfirmPassword}
                              onChange={e => setResetConfirmPassword(e.target.value)}
                              required
                            />
                            <Lock size={14} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                          </div>
                        </div>

                        <button type="submit" className="btn-primary" style={{ height: '48px', justifyContent: 'center' }}>
                          Save Password Credentials
                        </button>

                        <button 
                          type="button" 
                          className="rzp-input" 
                          style={{ cursor: 'pointer', textAlign: 'center', backgroundColor: 'transparent' }} 
                          onClick={() => { setActiveTab('login'); setAuthError(''); }}
                        >
                          Cancel Reset
                        </button>
                      </form>
                    )}

                  </motion.div>
                )}

                {/* LOGGED IN MODE */}
                {currentUser && (
                  <motion.div 
                    key="profile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="profile-container"
                  >
                    
                    {/* Profile Card & Avatar */}
                    <div className="profile-hero-card" style={{ display: 'flex', gap: '24px', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.02)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', marginBottom: '30px' }}>
                      <div style={{ position: 'relative', width: '80px', height: '80px', flexShrink: 0 }}>
                        {currentUser.profile_image || currentUser.profileImage ? (
                          <img 
                            src={currentUser.profile_image || currentUser.profileImage} 
                            alt={currentUser.name} 
                            style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--accent-raw)' }} 
                          />
                        ) : (
                          <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: 'var(--bg-input)', border: '1px solid var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-grey)' }}>
                            <User size={36} />
                          </div>
                        )}
                        <label htmlFor="profile-upload" style={{ position: 'absolute', right: '-4px', bottom: '-4px', backgroundColor: 'var(--text-light)', color: 'var(--bg-dark)', width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.5)', transition: 'var(--transition-quick)' }} title="Upload Avatar">
                          <Camera size={14} />
                          <input 
                            type="file" 
                            id="profile-upload" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{ display: 'none' }} 
                          />
                        </label>
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-light)', margin: 0 }}>{currentUser.name}</h3>
                          
                          {/* Membership Badge */}
                          <span className={`membership-badge ${membership.class}`} style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6rem',
                            fontWeight: '700',
                            padding: '2px 8px',
                            borderRadius: '2px',
                            textTransform: 'uppercase',
                            border: `1px solid ${membership.color}4d`,
                            color: membership.color,
                            backgroundColor: `${membership.color}0d`,
                            boxShadow: membership.class !== 'rebel' ? `0 0 10px ${membership.color}1a` : 'none'
                          }}>
                            {membership.badge}
                          </span>
                        </div>
                        
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-grey)', marginTop: '4px' }}>
                          Member since {currentUser.created_at ? new Date(currentUser.created_at).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' }) : 'May 2026'}
                        </p>

                        {/* Next Tier helper */}
                        {membership.nextTier && (
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Order <strong style={{ color: 'var(--text-grey)' }}>{membership.nextTier.remaining}</strong> more items this year to unlock <strong style={{ color: 'var(--accent-raw)' }}>{membership.nextTier.name}</strong> status.
                          </div>
                        )}
                      </div>

                      <button 
                        onClick={onLogout} 
                        className="tracking-close-btn" 
                        title="Sign Out"
                        style={{ alignSelf: 'flex-start', color: '#ef4444' }}
                      >
                        <LogOut size={16} />
                      </button>
                    </div>

                    {/* Developer Testing Seeding Helpers */}
                    {currentUser?.email === 'demo@off-kilt.com' && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f9731608', border: '1px dashed #f9731633', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent-raw)', fontWeight: 800 }}>DEV TEST BUTTONS:</span>
                        <button 
                          onClick={() => onSeedMockOrders(6)}
                          className="category-tab" 
                          style={{ fontSize: '0.65rem', padding: '4px 10px', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          Seed 6 Items (Plus Member)
                        </button>
                        <button 
                          onClick={() => onSeedMockOrders(12)}
                          className="category-tab" 
                          style={{ fontSize: '0.65rem', padding: '4px 10px', textTransform: 'uppercase', cursor: 'pointer' }}
                        >
                          Seed 12 Items (Premium Plus)
                        </button>
                      </div>
                    )}

                    {(currentUser?.is_admin === true) && (
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', backgroundColor: '#f9731608', border: '1px dashed #f9731633', padding: '12px 16px', borderRadius: '4px', marginBottom: '24px', flexWrap: 'wrap' }}>
                        <span className="mono" style={{ fontSize: '0.65rem', color: 'var(--accent-raw)', fontWeight: 800 }}>ADMIN ACCESS:</span>
                        <button 
                          onClick={onOpenAdmin}
                          className="btn-primary" 
                          style={{ fontSize: '0.65rem', padding: '4px 10px', height: 'auto', marginLeft: 'auto' }}
                        >
                          ACCESS ADMIN PANEL
                        </button>
                      </div>
                    )}

                    {/* Detail view & Edit Form */}
                    <div style={{ marginBottom: '32px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>
                        <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700 }}>PERSONAL INFORMATION</div>
                        {!isEditing && (
                          <button onClick={startEditing} style={{ color: 'var(--accent-raw)', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <Edit size={12} /> Edit Details
                          </button>
                        )}
                      </div>

                      {editSuccess && (
                        <div style={{ color: '#22c55e', fontSize: '0.8rem', padding: '8px 12px', border: '1px solid rgba(34, 197, 94, 0.2)', backgroundColor: 'rgba(34, 197, 94, 0.05)', borderRadius: '4px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Check size={14} /> Profile details successfully updated.
                        </div>
                      )}

                      {editError && (
                        <div style={{ color: 'var(--accent-raw)', fontSize: '0.8rem', padding: '8px 12px', border: '1px solid rgba(249, 115, 22, 0.2)', backgroundColor: 'rgba(249, 115, 22, 0.05)', borderRadius: '4px', marginBottom: '16px' }}>
                          {editError}
                        </div>
                      )}

                      {isEditing ? (
                        <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                            <div className="rzp-input-group">
                              <label className="rzp-label">Name</label>
                              <input 
                                type="text" 
                                className="rzp-input" 
                                value={editName}
                                onChange={e => setEditName(e.target.value)}
                                required
                              />
                            </div>
                            <div className="rzp-input-group">
                              <label className="rzp-label">Mobile Phone</label>
                              <input 
                                type="tel" 
                                className="rzp-input" 
                                pattern="[0-9]{10}"
                                maxLength="10"
                                value={editPhone}
                                onChange={e => setEditPhone(e.target.value.replace(/\D/g, ''))}
                                required
                              />
                            </div>
                          </div>

                          <div style={{ display: 'grid', gridTemplateColumns: '3fr 1fr', gap: '16px' }}>
                            <div className="rzp-input-group">
                              <label className="rzp-label">Complete Shipping Address</label>
                              <input 
                                type="text" 
                                className="rzp-input" 
                                value={editAddress}
                                onChange={e => setEditAddress(e.target.value)}
                                required
                              />
                            </div>
                            <div className="rzp-input-group">
                              <label className="rzp-label">Pincode</label>
                              <input 
                                type="text" 
                                className="rzp-input" 
                                maxLength="6"
                                value={editPincode}
                                onChange={e => setEditPincode(e.target.value.replace(/\D/g, ''))}
                                required
                              />
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '10px' }}>
                            <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary" style={{ padding: '8px 20px', fontSize: '0.7rem' }}>
                              Cancel
                            </button>
                            <button type="submit" className="btn-primary" style={{ padding: '8px 24px', fontSize: '0.7rem' }}>
                              <Save size={12} /> Save Changes
                            </button>
                          </div>
                        </form>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Email:</span>
                            <span style={{ color: 'var(--text-light)' }}>{currentUser.email}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Mobile Phone:</span>
                            <span style={{ color: 'var(--text-light)' }}>+91 {currentUser.phone}</span>
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-muted)' }}>Address:</span>
                            <span style={{ color: 'var(--text-light)', lineHeight: '1.4' }}>
                              {currentUser.address}, Pincode - {currentUser.pincode}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Order History */}
                    <div>
                      <div className="mono" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '8px', marginBottom: '16px' }}>
                        ORDER HISTORY ({userOrders.length})
                      </div>

                      {userOrders.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          <History size={24} style={{ marginBottom: '10px', opacity: 0.3 }} />
                          <div>No orders placed yet. Start your rebellion today!</div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {userOrders.map((order) => {
                            const itemCount = order.items ? order.items.reduce((acc, item) => acc + item.quantity, 0) : 0;
                            return (
                              <div 
                                key={order.id || order.orderId}
                                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '4px' }}
                              >
                                <div>
                                  <div className="mono" style={{ fontSize: '0.8rem', color: 'var(--accent-raw)', fontWeight: 700 }}>
                                    {order.id || order.orderId}
                                  </div>
                                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                                    Placed: {order.created_at ? new Date(order.created_at).toLocaleDateString() : (order.date?.split(' at ')[0])} | {itemCount} {itemCount === 1 ? 'item' : 'items'}
                                  </div>
                                  <div style={{ fontSize: '0.75rem', color: 'var(--text-light)', fontWeight: 600, marginTop: '4px' }}>
                                    Paid: ₹{((order.total || 0) || (order.subtotal + order.shipping)).toLocaleString('en-IN')}
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={() => onTrackOrder(order)}
                                  className="btn-secondary" 
                                  style={{ padding: '6px 14px', fontSize: '0.65rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                                >
                                  <Truck size={12} /> Track Order
                                </button>
                              </div>
                             );
                          })}
                        </div>
                      )}
                    </div>

                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── SAVED WISHLIST — always visible, login not required ── */}
              <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>

                {/* Header row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <div className="mono" style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '7px' }}>
                    <Heart size={12} color="var(--accent-rose-dark)" fill="var(--accent-rose-dark)" />
                    MY WISHLIST
                    <span style={{ background: 'rgba(176,120,120,0.2)', color: 'var(--accent-rose-dark)', borderRadius: '10px', padding: '1px 7px', fontSize: '0.65rem' }}>
                      {wishlist.filter(w => w && typeof w === 'object' && w.id).length}
                    </span>
                  </div>
                  {wishlist.filter(w => w && typeof w === 'object' && w.id).length > 0 && (
                    <button
                      onClick={() => {
                        localStorage.removeItem('offkilt_wishlist');
                        // Clear via parent toggle hack — re-trigger state
                        wishlist.filter(w => w && typeof w === 'object' && w.id).forEach(p => onWishlistToggle?.(p));
                      }}
                      style={{ fontSize: '0.65rem', color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-mono)', textDecoration: 'underline' }}
                    >
                      Clear all
                    </button>
                  )}
                </div>

                {wishlist.filter(w => w && typeof w === 'object' && w.id).length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '28px 0', color: 'var(--text-muted)', fontSize: '0.82rem' }}>
                    <Heart size={28} style={{ opacity: 0.15, display: 'block', margin: '0 auto 10px' }} />
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>Your wishlist is empty</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Tap the ♡ heart on any product to save it here</div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {wishlist.filter(w => w && typeof w === 'object' && w.id).map((product, idx) => (
                      <div
                        key={product.id}
                        style={{
                          display: 'flex',
                          gap: '14px',
                          alignItems: 'center',
                          background: 'rgba(255,255,255,0.02)',
                          border: '1px solid rgba(255,255,255,0.05)',
                          borderRadius: '4px',
                          padding: '10px',
                          cursor: 'pointer',
                          transition: 'border-color 0.2s ease',
                        }}
                        onClick={() => { onProductClick?.(product); onClose(); }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(201,169,110,0.3)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'}
                      >
                        {/* Thumbnail */}
                        <div style={{ width: '64px', height: '80px', flexShrink: 0, overflow: 'hidden', borderRadius: '2px', background: '#111', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {product.image ? (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.9)' }}
                              loading="lazy"
                            />
                          ) : (
                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Heart size={16} style={{ opacity: 0.2 }} />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div className="wishlist-item-title" style={{ fontSize: '0.82rem', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 5 }}>
                            {product.name}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </span>
                            <button
                              onClick={(e) => { e.stopPropagation(); onProductClick?.(product); onClose(); }}
                              style={{ fontSize: '0.6rem', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '2px', padding: '2px 8px', cursor: 'pointer', letterSpacing: '0.05em' }}
                            >
                              VIEW
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={(e) => { e.stopPropagation(); onWishlistToggle?.(product); }}
                          title="Remove from Wishlist"
                          style={{ flexShrink: 0, width: 30, height: 30, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#ef4444', transition: 'all 0.2s ease' }}
                          onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.18)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.06)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.15)'; }}
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
