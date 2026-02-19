import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import ProductList from './components/ProductList';
import AdminPanel from './components/AdminPanel';
import CartModal from './components/CartModal';
import ProductModal from './components/ProductModal';
import Footer from './components/Footer';
import { Product, CartItem } from './types';
import { PRODUCTS, fallbackImg, USED_PRODUCTS_SHEET_ID } from './constants';

// Wrapper to conditionally render layout
const Layout: React.FC<{ children: React.ReactNode; cartCount: number; openCart: () => void }> = ({ children, cartCount, openCart }) => {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dpanel');

  return (
    <div className="flex flex-col min-h-screen">
      {!isDashboard && <Navbar cartCount={cartCount} openCart={openCart} />}
      <div className="flex-grow">
        {children}
      </div>
      {!isDashboard && <Footer />}
    </div>
  );
};

// Robust CSV Line Parser to handle quoted fields containing commas
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; 
      } else {
        // Toggle quote
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // End of cell
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  // Push last cell
  result.push(current.trim());
  return result;
};

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Initialize with static products, then append fetched ones
  const [products, setProducts] = useState<Product[]>(PRODUCTS); 

  // Fetch used products from Google Sheets
  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const sheetId = USED_PRODUCTS_SHEET_ID;
        // Using GVIZ endpoint which is often more reliable for public sheets
        const csvUrl = `https://docs.google.com/spreadsheets/d/${sheetId}/gviz/tq?tqx=out:csv&gid=0`;
        
        const response = await fetch(csvUrl);
        if (!response.ok) throw new Error('Network response was not ok');
        
        const csvText = await response.text();
        const lines = csvText.split('\n');
        
        if (lines.length < 2) {
          console.warn("Spreadsheet seems empty or failed to load");
          return;
        }

        // Parse Headers
        const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().replace(/^"|"$/g, '').trim());
        const usedProducts: Product[] = [];

        // Dynamic Column Mapping
        const getIdx = (keywords: string[]) => headers.findIndex(h => keywords.some(k => h.includes(k)));

        const idxModel = getIdx(['modelo', 'equipo', 'nombre', 'producto']);
        const idxPrice = getIdx(['precio', 'valor', 'usd', 'precio usd']);
        const idxBattery = getIdx(['bateria', 'batería', 'bat', '%']);
        const idxCondition = getIdx(['condicion', 'condición']); // Physical condition (e.g. Impecable)
        const idxStatus = getIdx(['estado', 'disponibilidad', 'status']); // Availability (e.g. Disponible/Vendido)
        const idxColor = getIdx(['color']);
        const idxDetails = getIdx(['detalle', 'detalles', 'obs', 'notas']);
        const idxStorage = getIdx(['capacidad', 'memoria', 'gb', 'almacenamiento']);

        // Start from index 1 (Row 2 in Sheets)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          if (!line.trim()) continue;

          const cols = parseCSVLine(line);
          
          // Safety check for column bounds
          const getValue = (idx: number) => (idx >= 0 && idx < cols.length) ? cols[idx].replace(/^"|"$/g, '') : '';

          // 1. Check Availability
          if (idxStatus > -1) {
            const statusVal = getValue(idxStatus).toLowerCase();
            if (!statusVal.includes('disponible')) {
              continue; 
            }
          }

          const rawName = getValue(idxModel);
          // Skip if no name
          if (!rawName) continue;

          // Clean price
          const priceStr = getValue(idxPrice);
          const priceClean = priceStr.replace(/[^\d.]/g, '');
          let price = parseFloat(priceClean) || 0;

          // Only add if valid price or specifically listed
          if (price <= 0 && !priceStr.includes('Consultar')) continue;

          // RULE: Add 50 to the price
          price += 50;

          const battery = getValue(idxBattery);
          const condition = getValue(idxCondition);
          const color = getValue(idxColor);
          const details = getValue(idxDetails);
          const storage = getValue(idxStorage);

          // RULE: Name format "iPhone [Model] [Storage]Gb"
          const modelClean = rawName.replace(/^iphone\s+/i, '').trim();
          
          // Ensure we don't double add "Gb" if it's already there (unlikely but safe)
          const storageSuffix = storage.toLowerCase().includes('gb') ? storage : `${storage}Gb`;
          
          const finalName = `iPhone ${modelClean} ${storageSuffix}`.trim();

          // Construct comprehensive description
          let descParts = [];
          if (condition) descParts.push(condition);
          if (details) descParts.push(details);

          const desc = descParts.length > 0 ? descParts.join(' - ') : 'Usado Seleccionado';

          // IMPORTANT: The ID now includes the row index 'i' (which maps to Sheet Row i+1)
          // We use this in CartModal to tell the backend which row to update
          usedProducts.push({
            id: `used-${i}-${rawName.replace(/\s+/g, '-').toLowerCase()}`,
            name: finalName,
            price: price,
            category: 'Usados',
            description: desc,
            stock: true,
            image: fallbackImg, 
            batteryHealth: battery ? (battery.includes('%') ? battery : `${battery}%`) : undefined,
            warranty: '1 Mes', 
            condition: condition,
            colors: color ? [color] : []
          });
        }

        console.log(`Loaded ${usedProducts.length} used items from sheet.`);

        if (usedProducts.length > 0) {
          setProducts(prev => {
            const others = prev.filter(p => p.category !== 'Usados');
            return [...others, ...usedProducts];
          });
        }

      } catch (error) {
        console.error("Error loading spreadsheet:", error);
      }
    };

    fetchSheetData();
  }, []);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id);
      if (existing) {
        return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };
  
  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <HashRouter>
      <Layout cartCount={totalItems} openCart={() => setIsCartOpen(true)}>
        <Routes>
          <Route path="/" element={
            <main>
              <Hero products={products} />
              <div className="container mx-auto px-4 py-8">
                <ProductList products={products} onProductSelect={setSelectedProduct} />
              </div>
            </main>
          } />
          <Route path="/dpanel" element={<AdminPanel />} />
        </Routes>

        {isCartOpen && (
          <CartModal 
            cart={cart} 
            onClose={() => setIsCartOpen(false)} 
            onRemove={removeFromCart}
            onClear={clearCart}
          />
        )}

        {selectedProduct && (
          <ProductModal 
            product={selectedProduct} 
            onClose={() => setSelectedProduct(null)} 
            onAddToCart={addToCart}
          />
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;