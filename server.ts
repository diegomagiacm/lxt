import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import initial products
import { PRODUCTS } from './constants';

const app = express();
const PORT = 3000;
const DATA_FILE = path.resolve(__dirname, 'products.json');
const SALES_FILE = path.resolve(__dirname, 'sales.json');
const USERS_FILE = path.resolve(__dirname, 'users.json');

console.log('Server: Data paths:', { DATA_FILE, SALES_FILE, USERS_FILE });

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

// GET Products
app.get('/api/products', (req, res) => {
  console.log('GET /api/products called');
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = fs.readFileSync(DATA_FILE, 'utf-8');
      const parsed = JSON.parse(data);
      console.log(`Server: Found products.json with ${parsed.length} products`);
      if (parsed.length === 0) {
        console.warn('Server: products.json is empty, returning fallback PRODUCTS');
        return res.json(PRODUCTS);
      }
      res.json(parsed);
    } else {
      console.log('Server: products.json NOT found, returning constants');
      res.json(PRODUCTS);
    }
  } catch (error) {
    console.error('Server: Error in GET /api/products:', error);
    res.status(500).json({ error: 'Failed to read products' });
  }
});

// PUT Product (Update single product)
app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;
    
    let products = [];
    if (fs.existsSync(DATA_FILE)) {
      products = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
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
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// GET Sales
app.get('/api/sales', (req, res) => {
  try {
    if (fs.existsSync(SALES_FILE)) {
      const data = fs.readFileSync(SALES_FILE, 'utf-8');
      res.json(JSON.parse(data));
    } else {
      res.json([]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to read sales' });
  }
});

// POST Sale
app.post('/api/sales', (req, res) => {
  try {
    const newSale = req.body;
    let sales = [];
    if (fs.existsSync(SALES_FILE)) {
      sales = JSON.parse(fs.readFileSync(SALES_FILE, 'utf-8'));
    }
    sales.push({ ...newSale, id: Math.random().toString() });
    fs.writeFileSync(SALES_FILE, JSON.stringify(sales, null, 2));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save sale' });
  }
});

// POST Login
app.post('/api/auth/login', (req, res) => {
  const { username, code } = req.body;
  try {
    if (fs.existsSync(USERS_FILE)) {
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
      }
    }
    res.status(401).json({ error: 'Credenciales inválidas' });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// GET Users
app.get('/api/users', (req, res) => {
  try {
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
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// POST Create User
app.post('/api/users', (req, res) => {
  const newUser = req.body;
  try {
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
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// PUT Update User Stats
app.put('/api/users/:username/stats', (req, res) => {
  const { username } = req.params;
  const { extraHours } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const index = users.findIndex((u: any) => u.username === username);
    if (index !== -1) {
      users[index].extra_hours = (users[index].extra_hours || 0) + extraHours;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stats' });
  }
});

// PUT Change Password
app.put('/api/users/:username/password', (req, res) => {
  const { username } = req.params;
  const { newCode } = req.body;
  try {
    const users = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
    const index = users.findIndex((u: any) => u.username === username);
    if (index !== -1) {
      users[index].code = newCode;
      fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
      return res.json({ success: true });
    }
    res.status(404).json({ error: 'User not found' });
  } catch (error) {
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
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
