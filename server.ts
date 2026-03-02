import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import initial products
import { PRODUCTS } from './constants';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'products.json');
const SALES_FILE = path.join(__dirname, 'sales.json');
const USERS_FILE = path.join(__dirname, 'users.json');

// Initialize Supabase Admin Client (Server-side)
// We try to use the Service Role Key first, but fallback to other keys if available.
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

const supabaseKey = serviceRoleKey || anonKey;

let supabaseAdmin: any = null;
if (supabaseUrl && supabaseKey) {
  try {
    console.log('Initializing Supabase Admin with URL:', supabaseUrl);
    console.log('Using Service Role Key:', !!serviceRoleKey);
    console.log('Using Anon Key:', !!anonKey);
    
    supabaseAdmin = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
    console.log('Supabase Admin client initialized on server.');
  } catch (err) {
    console.error('Failed to initialize Supabase Admin:', err);
  }
} else {
  console.warn('Supabase credentials missing. Using local file storage for users.');
}

app.use(cors());
app.use(express.json());

// Initialize data files if they don't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(PRODUCTS, null, 2));
}
if (!fs.existsSync(SALES_FILE)) {
  fs.writeFileSync(SALES_FILE, JSON.stringify([], null, 2));
}
if (!fs.existsSync(USERS_FILE)) {
  const defaultUsers = [
    {
      id: '1',
      username: 'admin',
      code: '1234',
      role: 'admin',
      sales_count: 0,
      extra_hours: 0,
      created_at: new Date().toISOString()
    }
  ];
  fs.writeFileSync(USERS_FILE, JSON.stringify(defaultUsers, null, 2));
}

// API Routes

// POST Seed Products (Load from products.json to Supabase)
app.post('/api/products/seed', async (req, res) => {
  try {
    if (!supabaseAdmin) {
      return res.status(400).json({ error: 'Supabase not configured' });
    }

    // Read products.json
    let products = [];
    if (fs.existsSync(DATA_FILE)) {
      products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    } else {
      products = [...PRODUCTS];
    }

    console.log(`Seeding ${products.length} products to Supabase...`);

    // Upsert products
    // We process in batches to avoid limits
    const BATCH_SIZE = 50;
    for (let i = 0; i < products.length; i += BATCH_SIZE) {
      const batch = products.slice(i, i + BATCH_SIZE).map((p: any) => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category,
        description: p.description,
        image_url: p.image,
        stock: p.stock,
        quantity: p.quantity || 0,
        colors: p.colors,
        variants: p.variants,
        location: p.location
      }));

      const { error } = await supabaseAdmin.from('products').upsert(batch, { onConflict: 'id' });
      
      if (error) {
        console.error('Error seeding batch:', error);
        throw error;
      }
    }

    res.json({ success: true, count: products.length });
  } catch (error: any) {
    console.error('Error seeding products:', error);
    res.status(500).json({ error: `Failed to seed products: ${error.message}` });
  }
});

// GET Products
app.get('/api/products', async (req, res) => {
  try {
    // 1. Try Supabase
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('products').select('*');
      if (!error && data && data.length > 0) {
        return res.json(data.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: p.category,
          description: p.description,
          image: p.image_url,
          stock: p.stock,
          quantity: p.quantity || 0,
          colors: p.colors,
          variants: p.variants || [],
          location: p.location
        })));
      }
    }

    // 2. Fallback to Local File
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json(PRODUCTS);
    }
  } catch (error) {
    console.error('Error reading products:', error);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// POST Products (Bulk overwrite - mostly for initialization)
app.post('/api/products', (req, res) => {
  try {
    const newProducts = req.body;
    fs.writeFileSync(DATA_FILE, JSON.stringify(newProducts, null, 2));
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving products:', error);
    res.status(500).json({ error: 'Failed to save products' });
  }
});

// PUT Product (Update single product)
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;
    
    console.log(`Received update for product ID: ${id}`);

    // 1. Try Supabase Update
    if (supabaseAdmin) {
      const payload = {
        name: updatedProduct.name,
        price: updatedProduct.price,
        category: updatedProduct.category,
        description: updatedProduct.description,
        image_url: updatedProduct.image,
        stock: updatedProduct.stock,
        quantity: updatedProduct.quantity,
        colors: updatedProduct.colors,
        variants: updatedProduct.variants,
        location: updatedProduct.location
      };

      // Check if exists
      const { data } = await supabaseAdmin.from('products').select('id').eq('id', id).single();
      
      let error;
      if (data) {
        const result = await supabaseAdmin.from('products').update(payload).eq('id', id);
        error = result.error;
      } else {
        const result = await supabaseAdmin.from('products').insert([{ ...payload, id }]);
        error = result.error;
      }

      if (error) {
        console.error('Supabase update error:', error);
        // Don't fail yet, try local file as backup? 
        // Or maybe we should fail if Supabase is configured but fails.
        // Let's try to keep both in sync if possible, or just rely on Supabase.
      } else {
        console.log('Product updated in Supabase');
      }
    }

    // 2. Always update Local File (as cache/backup)
    let products = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
        if (!Array.isArray(products)) products = [];
      } catch (e) { products = []; }
    } else {
      products = [...PRODUCTS];
    }

    const index = products.findIndex((p: any) => String(p.id) === String(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updatedProduct, id: id };
    } else {
      products.push({ ...updatedProduct, id: id });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    res.json({ success: true });

  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: `Failed to update product: ${(error as Error).message}` });
  }
});

// GET Sales
app.get('/api/sales', async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('sales').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        return res.json(data);
      }
    }

    if (fs.existsSync(SALES_FILE)) {
      const data = fs.readFileSync(SALES_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    console.error('Error reading sales:', error);
    res.status(500).json({ error: 'Failed to read sales' });
  }
});

// POST Sale
app.post('/api/sales', async (req, res) => {
  try {
    const newSale = req.body;

    // 1. Try Supabase
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('sales').insert([{
        user_id: newSale.userId, 
        product_details: newSale.products,
        total_amount: newSale.total,
        created_at: newSale.date
      }]);
      
      if (error) {
        console.error('Supabase sale error:', error);
      }
    }

    // 2. Update Local File
    let sales = [];
    if (fs.existsSync(SALES_FILE)) {
      sales = JSON.parse(fs.readFileSync(SALES_FILE, 'utf-8'));
    }
    sales.push({ ...newSale, id: Math.random().toString() });
    fs.writeFileSync(SALES_FILE, JSON.stringify(sales, null, 2));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error saving sale:', error);
    res.status(500).json({ error: 'Failed to save sale' });
  }
});

// ==========================================
// USER MANAGEMENT ENDPOINTS
// ==========================================

// POST Login
app.post('/api/auth/login', async (req, res) => {
  let { username, code } = req.body;
  
  // Trim whitespace
  username = username?.trim();
  code = code?.trim();

  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('username', username)
        .eq('code', code)
        .single();

      if (error || !data) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      return res.json({
        user: {
          username: data.username,
          code: data.code,
          role: data.role,
          salesCount: data.sales_count || 0,
          extraHours: data.extra_hours || 0,
          id: data.id
        }
      });
    }
    
    // Fallback to local file if no Supabase
    console.warn('Using local file auth for login');
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const user = users.find((u: any) => u.username === username && u.code === code);

    if (user) {
      return res.json({
        user: {
          username: user.username,
          code: user.code,
          role: user.role,
          salesCount: user.sales_count || 0,
          extraHours: user.extra_hours || 0,
          id: user.id
        }
      });
    } else {
      return res.status(401).json({ error: 'Credenciales inválidas (Local)' });
    }
  } catch (error: any) {
    console.error('Login error details:', error);
    res.status(500).json({ error: `Login failed: ${error.message || JSON.stringify(error)}` });
  }
});

// GET Users
app.get('/api/users', async (req, res) => {
  try {
    if (supabaseAdmin) {
      const { data, error } = await supabaseAdmin.from('users').select('*');
      if (!error && data) {
        return res.json(data.map((d: any) => ({
          id: d.id,
          username: d.username,
          code: d.code,
          role: d.role,
          salesCount: d.sales_count || 0,
          extraHours: d.extra_hours || 0
        })));
      }
    }
    
    // Fallback
    if (fs.existsSync(USERS_FILE)) {
      const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
      return res.json(users.map((u: any) => ({
        id: u.id,
        username: u.username,
        code: u.code,
        role: u.role,
        salesCount: u.sales_count || 0,
        extraHours: u.extra_hours || 0
      })));
    }
    res.json([]);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST Create User
app.post('/api/users', async (req, res) => {
  const newUser = req.body;
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin.from('users').insert([{
        username: newUser.username,
        code: newUser.code,
        role: newUser.role,
        sales_count: 0,
        extra_hours: 0
      }]);
      
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      return res.json({ success: true });
    }

    // Fallback
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    if (users.some((u: any) => u.username === newUser.username)) {
      return res.status(400).json({ error: 'Usuario ya existe' });
    }
    
    users.push({
      id: Math.random().toString(),
      username: newUser.username,
      code: newUser.code,
      role: newUser.role,
      sales_count: 0,
      extra_hours: 0,
      created_at: new Date().toISOString()
    });
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
    res.json({ success: true });

  } catch (error) {
    console.error('Create user error:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT Update User Stats
app.put('/api/users/:username/stats', async (req, res) => {
  const { username } = req.params;
  const { extraHours } = req.body;
  
  try {
    if (supabaseAdmin) {
      // First get current
      const { data: current } = await supabaseAdmin.from('users').select('extra_hours').eq('username', username).single();
      
      if (!current) return res.status(404).json({ error: 'User not found' });
      
      const { error } = await supabaseAdmin
        .from('users')
        .update({ extra_hours: (current.extra_hours || 0) + extraHours })
        .eq('username', username);

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ success: true });
    }
    res.status(500).json({ error: 'Database not configured' });
  } catch (error) {
    console.error('Update stats error:', error);
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// PUT Change Password
app.put('/api/users/:username/password', async (req, res) => {
  const { username } = req.params;
  const { newCode } = req.body;
  
  try {
    if (supabaseAdmin) {
      const { error } = await supabaseAdmin
        .from('users')
        .update({ code: newCode })
        .eq('username', username);

      if (error) return res.status(400).json({ error: error.message });
      return res.json({ success: true });
    }
    res.status(500).json({ error: 'Database not configured' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
});

// Vite middleware for development
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
