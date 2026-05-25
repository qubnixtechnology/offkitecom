import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, Plus, Edit2, Trash2, Save, Image as ImageIcon, UploadCloud } from 'lucide-react';
import { products as productsApi, admin as adminApi } from '../services/api';

export default function AdminDashboard({ currentUser, onClose }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '', name: '', tagline: '', price: '', category: 'jeans',
    image: '', description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await productsApi.getAll('all');
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({ id: '', name: '', tagline: '', price: '', category: 'jeans', image: '', description: '' });
    setIsEditing(false);
    setEditingId(null);
  };

  const handleEdit = (product) => {
    setFormData({
      id: product.id,
      name: product.name,
      tagline: product.tagline || '',
      price: product.price,
      category: product.category || 'jeans',
      image: product.image || '',
      description: product.description || ''
    });
    setEditingId(product.id);
    setIsEditing(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      try {
        await adminApi.deleteProduct(id);
        fetchProducts();
      } catch (err) {
        alert('Failed to delete product');
      }
    }
  };

  const processImageFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image must be smaller than 2MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, image: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e) => {
    processImageFile(e.target.files?.[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    processImageFile(e.dataTransfer.files?.[0]);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      price: Number(formData.price),
      sizes: ["28", "30", "32", "34", "36"], // default
      details: ["100% Cotton", "Relaxed Fit"],
      materials: "Premium Denim",
      shipping: "Standard delivery 3-5 business days"
    };

    try {
      if (editingId) {
        await adminApi.updateProduct(editingId, payload);
      } else {
        await adminApi.createProduct(payload);
      }
      resetForm();
      fetchProducts();
    } catch (err) {
      alert('Failed to save product');
      console.error(err);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, backgroundColor: 'var(--bg-dark)', zIndex: 9999, overflowY: 'auto' }} data-lenis-prevent="true">
      
      {/* Header */}
      <div style={{ padding: '24px 40px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, backgroundColor: 'var(--bg-dark)', zIndex: 10 }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.5rem', letterSpacing: '-0.5px' }}>REBEL COMMAND CENTER</h1>
          <p className="mono" style={{ fontSize: '0.75rem', color: 'var(--accent-raw)' }}>ADMINISTRATOR ACCESS // {currentUser.email}</p>
        </div>
        <button onClick={onClose} className="tracking-close-btn" title="Exit Admin">
          <X size={24} />
        </button>
      </div>

      <div style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '40px', alignItems: 'start' }}>
        
        {/* Left: Product List */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', alignItems: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.2rem' }}>CATALOG INVENTORY</h2>
            <button onClick={resetForm} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              <Plus size={16} /> New Product
            </button>
          </div>

          <div style={{ backgroundColor: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-grey)' }}>Loading inventory...</div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.05)', textAlign: 'left' }}>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>ID / Item</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>Category</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 400 }}>Price</th>
                    <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 400, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.02)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ width: '40px', height: '40px', backgroundColor: 'var(--bg-input)', borderRadius: '2px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {p.image ? <img src={p.image} alt={p.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <ImageIcon size={16} color="var(--text-muted)" />}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{p.name}</div>
                            <div className="mono" style={{ fontSize: '0.65rem', color: 'var(--text-grey)', marginTop: '2px' }}>{p.id}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ padding: '16px', textTransform: 'capitalize' }}>{p.category}</td>
                      <td style={{ padding: '16px', fontFamily: 'var(--font-mono)' }}>₹{p.price.toLocaleString('en-IN')}</td>
                      <td style={{ padding: '16px', textAlign: 'right' }}>
                        <button onClick={() => handleEdit(p)} style={{ background: 'none', border: 'none', color: 'var(--text-grey)', cursor: 'pointer', marginRight: '16px' }} title="Edit"><Edit2 size={16} /></button>
                        <button onClick={() => handleDelete(p.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }} title="Delete"><Trash2 size={16} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Right: Add/Edit Form */}
        <div style={{ backgroundColor: 'var(--bg-card)', padding: '24px', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '4px', position: 'sticky', top: '100px' }}>
          <h3 style={{ fontSize: '1rem', marginBottom: '20px', fontFamily: 'var(--font-mono)', color: 'var(--accent-raw)' }}>
            {isEditing ? `EDITING: ${editingId}` : 'CREATE NEW ITEM'}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="rzp-input-group">
              <label className="rzp-label">Product ID (Unique)</label>
              <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="rzp-input" required disabled={isEditing} placeholder="e.g. OKJ24500" />
            </div>
            
            <div className="rzp-input-group">
              <label className="rzp-label">Display Name</label>
              <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="rzp-input" required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="rzp-input-group">
                <label className="rzp-label">Price (INR)</label>
                <input type="number" name="price" value={formData.price} onChange={handleInputChange} className="rzp-input" required />
              </div>
              <div className="rzp-input-group">
                <label className="rzp-label">Category</label>
                <select name="category" value={formData.category} onChange={handleInputChange} className="rzp-input" style={{ appearance: 'none', backgroundColor: 'rgba(0,0,0,0.2)' }} required>
                  <option value="jeans">Jeans</option>
                  <option value="skirts">Skirts</option>
                  <option value="tops">Tops</option>
                </select>
              </div>
            </div>

            <div className="rzp-input-group">
              <label className="rzp-label">Tagline</label>
              <input type="text" name="tagline" value={formData.tagline} onChange={handleInputChange} className="rzp-input" placeholder="e.g. Asymmetric Utility" />
            </div>

            <div className="rzp-input-group">
              <label className="rzp-label">Product Image</label>
              <div 
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ 
                  border: '1px dashed rgba(255,255,255,0.2)', 
                  borderRadius: '4px', 
                  padding: '20px', 
                  textAlign: 'center',
                  backgroundColor: 'rgba(0,0,0,0.2)',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleImageUpload}
                  style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                />
                {formData.image ? (
                  <img src={formData.image} alt="Preview" style={{ maxHeight: '120px', objectFit: 'contain' }} />
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text-grey)' }}>
                    <UploadCloud size={24} />
                    <span style={{ fontSize: '0.8rem' }}>Drag & Drop or Click to Upload</span>
                  </div>
                )}
              </div>
            </div>

            <div className="rzp-input-group">
              <label className="rzp-label">Description</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} className="rzp-input" rows="3" style={{ resize: 'vertical' }}></textarea>
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <button type="submit" className="btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={16} /> {isEditing ? 'Save Changes' : 'Publish Product'}
              </button>
              {isEditing && (
                <button type="button" onClick={resetForm} className="btn-secondary" style={{ padding: '0 16px' }}>Cancel</button>
              )}
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}
