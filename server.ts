import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { fileURLToPath } from 'url';

// Helper for __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import initial products (we'll need to read this file manually or import it if possible)
// Since importing TS files directly in Node without compilation can be tricky with some setups,
// we'll try to import it. If it fails, we'll fallback to an empty array and let the client handle initialization.
// However, tsx handles TS imports fine.
import { PRODUCTS } from './constants';

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'products.json');

app.use(cors());
app.use(express.json());

// Initialize data file if it doesn't exist
if (!fs.existsSync(DATA_FILE)) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(PRODUCTS, null, 2));
  console.log('Initialized products.json with default data');
}

const SALES_FILE = path.join(__dirname, 'sales.json');

// Initialize sales file if it doesn't exist
if (!fs.existsSync(SALES_FILE)) {
  fs.writeFileSync(SALES_FILE, JSON.stringify([], null, 2));
}

// API Routes
app.get('/api/products', (req, res) => {
  try {
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

app.put('/api/products/:id', (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = req.body;
    
    console.log(`Received update for product ID: ${id}`);
    console.log('Updated product data:', JSON.stringify(updatedProduct, null, 2));

    let products = [];
    if (fs.existsSync(DATA_FILE)) {
      try {
        const fileContent = fs.readFileSync(DATA_FILE, 'utf-8');
        products = JSON.parse(fileContent);
        if (!Array.isArray(products)) {
          console.error('products.json is not an array, resetting to empty array');
          products = [];
        }
      } catch (e) {
        console.error('Error parsing products.json:', e);
        products = [];
      }
    } else {
      products = [...PRODUCTS];
    }

    const index = products.findIndex((p: any) => String(p.id) === String(id));
    
    if (index !== -1) {
      console.log(`Product found at index ${index}, updating...`);
      // Ensure ID is preserved if not in body
      products[index] = { ...products[index], ...updatedProduct, id: id };
    } else {
      console.log('Product not found, creating new...');
      products.push({ ...updatedProduct, id: id });
    }

    fs.writeFileSync(DATA_FILE, JSON.stringify(products, null, 2));
    console.log('Product saved successfully');
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).json({ error: `Failed to update product: ${(error as Error).message}` });
  }
});

app.get('/api/sales', (req, res) => {
  try {
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
    console.error('Error saving sale:', error);
    res.status(500).json({ error: 'Failed to save sale' });
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
  // Serve static files in production
  app.use(express.static(path.join(__dirname, 'dist')));
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
