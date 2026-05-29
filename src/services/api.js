import axios from 'axios';
import { products as localProducts } from '../data/products';

const api = axios.create({
  baseURL: '/api', // Proxied in Vite to http://localhost:8000
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('offkilt_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Fallback wrappers for testing without Laravel backend
export const auth = {
  register: async (data) => {
    try { 
      const res = await api.post('/register', data);
      if (res.data?.user) localStorage.setItem('offkilt_current_user', JSON.stringify(res.data.user));
      return res;
    } catch (err) {
      if (err.response) throw err;
      const users = JSON.parse(localStorage.getItem('offkilt_users') || '[]');
      if (users.find(u => u.email === data.email)) throw { response: { data: { message: 'Email already exists.' } } };
      const user = { ...data, id: Date.now() };
      users.push(user);
      localStorage.setItem('offkilt_users', JSON.stringify(users));
      localStorage.setItem('offkilt_current_user', JSON.stringify(user));
      return { data: { user, access_token: 'mock-token' } };
    }
  },
  login: async (credentials) => {
    // Offline demo accounts — only used if backend is unreachable
    if (credentials.email === 'demo@off-kilt.com' && credentials.password === 'rebel') {
      const user = { name: 'Demo User', email: 'demo@off-kilt.com', phone: '9999999999', address: 'Off-Kilt HQ, Cyber City', pincode: '100001', id: 1, is_admin: false };
      localStorage.setItem('offkilt_current_user', JSON.stringify(user));
      return { data: { user, access_token: 'mock-token' } };
    }

    try { 
      const res = await api.post('/login', credentials);
      // Store token in localStorage so future requests are authenticated
      if (res.data?.access_token) {
        localStorage.setItem('offkilt_auth_token', res.data.access_token);
      }
      if (res.data?.user) localStorage.setItem('offkilt_current_user', JSON.stringify(res.data.user));
      return res;
    } catch (err) {
      // Fallback to localStorage registered accounts when backend is offline
      const users = JSON.parse(localStorage.getItem('offkilt_users') || '[]');
      const user = users.find(u => u.email === credentials.email && u.password === credentials.password);
      if (user) {
        localStorage.setItem('offkilt_current_user', JSON.stringify(user));
        return { data: { user, access_token: 'mock-token' } };
      }
      
      if (err.response) throw err;
      throw { response: { data: { message: 'Invalid credentials' } } };
    }
  },
  logout: async () => {
    localStorage.removeItem('offkilt_current_user');
    try { return await api.post('/logout'); } catch (err) { return { data: { message: 'ok' } }; }
  },
};

const toWebp = (url) => {
  if (typeof url === 'string') {
    let newUrl = url.replace(/\.(jpe?g|png)$/i, '.webp');
    // If running in Vite development server (import.meta.env.DEV), prefix with base path /build
    if (import.meta.env.DEV && newUrl.startsWith('/images/')) {
      newUrl = newUrl.replace(/^\/images\//, '/build/images/');
    }
    return newUrl;
  }
  return url;
};

const mapProductImagePaths = (product) => {
  if (!product) return product;
  
  let parsedImages = product.images;
  if (typeof parsedImages === 'string') {
    try {
      parsedImages = JSON.parse(parsedImages);
    } catch (e) {
      parsedImages = [];
    }
  }

  const mappedImages = Array.isArray(parsedImages)
    ? parsedImages.map(toWebp)
    : (parsedImages ? [toWebp(parsedImages)] : []);

  return {
    ...product,
    image: toWebp(product.image),
    hoverImage: toWebp(product.hoverImage || product.hover_image),
    hover_image: toWebp(product.hoverImage || product.hover_image),
    images: mappedImages
  };
};

export const products = {
  getAll: async (category = 'all') => {
    try {
      const res = await api.get(`/products${category !== 'all' ? `?category=${category}` : ''}`);
      return { data: res.data.map(mapProductImagePaths) };
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      const filtered = category === 'all' ? stored : stored.filter(p => p.category === category);
      return { data: filtered.map(mapProductImagePaths) };
    }
  },
  getOne: async (id) => {
    try {
      const res = await api.get(`/products/${id}`);
      return { data: mapProductImagePaths(res.data) };
    } catch (err) {
      const stored = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      return { data: mapProductImagePaths(stored.find(p => p.id === id)) };
    }
  },
};

export const admin = {
  // Fetch all products for admin (including inactive)
  getAllProducts: async () => {
    try {
      const res = await api.get('/admin/products');
      return { data: res.data.map(mapProductImagePaths) };
    } catch (err) {
      if (err.response) throw err;
      const stored = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      return { data: stored.map(mapProductImagePaths) };
    }
  },
  createProduct: async (data) => {
    try {
      const res = await api.post('/admin/products', data);
      return { data: mapProductImagePaths(res.data) };
    } catch (err) {
      if (err.response) throw err;
      const productsList = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      const newProduct = { ...data, id: data.id || `OK-${Date.now()}` };
      productsList.unshift(newProduct);
      localStorage.setItem('offkilt_products', JSON.stringify(productsList));
      return { data: mapProductImagePaths(newProduct) };
    }
  },
  updateProduct: async (id, data) => {
    try {
      const res = await api.put(`/admin/products/${id}`, data);
      return { data: mapProductImagePaths(res.data) };
    } catch (err) {
      if (err.response) throw err;
      const productsList = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      const index = productsList.findIndex(p => p.id === id);
      if (index > -1) {
        productsList[index] = { ...productsList[index], ...data };
        localStorage.setItem('offkilt_products', JSON.stringify(productsList));
        return { data: mapProductImagePaths(productsList[index]) };
      }
      throw { response: { data: { message: 'Product not found' } } };
    }
  },
  toggleProduct: async (id) => {
    try {
      return await api.patch(`/admin/products/${id}/toggle`);
    } catch (err) {
      if (err.response) throw err;
      return { data: { message: 'toggled' } };
    }
  },
  deleteProduct: async (id) => {
    try { return await api.delete(`/admin/products/${id}`); } catch (err) {
      if (err.response) throw err;
      const productsList = JSON.parse(localStorage.getItem('offkilt_products') || JSON.stringify(localProducts));
      const filtered = productsList.filter(p => p.id !== id);
      localStorage.setItem('offkilt_products', JSON.stringify(filtered));
      return { data: { message: 'Deleted' } };
    }
  },
  // Admin order management
  getAllOrders: async (params = {}) => {
    try {
      const query = new URLSearchParams(params).toString();
      const res = await api.get(`/admin/orders${query ? '?' + query : ''}`);
      return { data: res.data };
    } catch (err) {
      if (err.response) throw err;
      return { data: JSON.parse(localStorage.getItem('offkilt_orders') || '[]') };
    }
  },
  updateOrderStatus: async (id, status) => {
    try {
      return await api.patch(`/admin/orders/${id}/status`, { status });
    } catch (err) {
      if (err.response) throw err;
      return { data: { message: 'updated locally' } };
    }
  },
  deleteOrder: async (id) => {
    try { return await api.delete(`/admin/orders/${id}`); } catch (err) {
      if (err.response) throw err;
      return { data: { message: 'Deleted' } };
    }
  },
  // Dashboard stats
  getDashboardStats: async () => {
    try {
      const res = await api.get('/admin/dashboard');
      return { data: res.data };
    } catch (err) {
      return { data: null };
    }
  },
};


export const orders = {
  create: async (data) => {
    try {
      const res = await api.post('/orders', data);
      const order = res.data;
      if (order && Array.isArray(order.items)) {
        order.items = order.items.map(mapProductImagePaths);
      }
      return { data: order };
    } catch (err) {
      // Always fallback to localStorage if backend fails
      const allOrders = JSON.parse(localStorage.getItem('offkilt_orders') || '[]');
      const newOrder = { ...data, id: `OK-${Math.floor(100000 + Math.random() * 900000)}`, status: 'confirmed', created_at: new Date().toISOString() };
      if (newOrder && Array.isArray(newOrder.items)) {
        newOrder.items = newOrder.items.map(mapProductImagePaths);
      }
      allOrders.push(newOrder);
      localStorage.setItem('offkilt_orders', JSON.stringify(allOrders));
      return { data: newOrder };
    }
  },
  getAll: async () => {
    try {
      const res = await api.get('/orders');
      const oList = res.data;
      if (Array.isArray(oList)) {
        oList.forEach(order => {
          if (order && Array.isArray(order.items)) {
            order.items = order.items.map(mapProductImagePaths);
          }
        });
      }
      return { data: oList };
    } catch (err) {
      const oList = JSON.parse(localStorage.getItem('offkilt_orders') || '[]');
      if (Array.isArray(oList)) {
        oList.forEach(order => {
          if (order && Array.isArray(order.items)) {
            order.items = order.items.map(mapProductImagePaths);
          }
        });
      }
      return { data: oList };
    }
  },
  getOne: async (id) => {
    try {
      const res = await api.get(`/orders/${id}`);
      const order = res.data;
      if (order && Array.isArray(order.items)) {
        order.items = order.items.map(mapProductImagePaths);
      }
      return { data: order };
    } catch (err) {
      const o = JSON.parse(localStorage.getItem('offkilt_orders') || '[]').find(x => x.id === id);
      if (o && Array.isArray(o.items)) {
        o.items = o.items.map(mapProductImagePaths);
      }
      return o ? { data: o } : { data: null };
    }
  },
  track: async (id) => {
    try {
      const res = await api.get(`/orders/track/${id}`);
      const order = res.data;
      if (order && Array.isArray(order.items)) {
        order.items = order.items.map(mapProductImagePaths);
      }
      return { data: order };
    } catch (err) {
      // Fallback to localStorage if backend fails or returns 404
      const o = JSON.parse(localStorage.getItem('offkilt_orders') || '[]').find(x => x.id === id);
      if (o) {
        if (Array.isArray(o.items)) {
          o.items = o.items.map(mapProductImagePaths);
        }
        return { data: o };
      }
      
      if (err.response) throw err;
      throw { response: { data: { message: 'Not found' } } };
    }
  },
};

export const profile = {
  get: async () => {
    try { 
      const res = await api.get('/profile'); 
      if (res.data) localStorage.setItem('offkilt_current_user', JSON.stringify(res.data));
      return res;
    } catch (err) { 
      const user = JSON.parse(localStorage.getItem('offkilt_current_user') || 'null');
      return { data: user || {} }; 
    }
  },
  update: async (data) => {
    try { 
      const res = await api.put('/profile', data); 
      if (res.data) localStorage.setItem('offkilt_current_user', JSON.stringify(res.data));
      return res;
    } catch (err) {
      if (err.response) throw err;
      localStorage.setItem('offkilt_current_user', JSON.stringify(data));
      return { data: data };
    }
  },
};

export default api;
