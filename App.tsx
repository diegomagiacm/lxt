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
import { PRODUCTS, fallbackImg, USED_PRODUCTS_SHEET_ID, USED_PRODUCTS_SHEET_GID, NEW_PRODUCTS_SHEET_ID, NEW_PRODUCTS_SHEET_GID } from './constants';
import { fetchProductsFromSheet } from './src/services/sheet';

import DashboardLayout from './src/pages/dpanel';

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

const App: React.FC = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  
  // Initialize with static products, then append fetched ones
  const [products, setProducts] = useState<Product[]>(PRODUCTS); 

  // Fetch products from Google Sheets
  useEffect(() => {
    const loadProducts = async () => {
      let newProducts: Product[] = [];
      let usedProducts: Product[] = [];

      // 1. Fetch New Products if configured
      if (NEW_PRODUCTS_SHEET_ID) {
        try {
          newProducts = await fetchProductsFromSheet(NEW_PRODUCTS_SHEET_ID, NEW_PRODUCTS_SHEET_GID, false);
          console.log(`Loaded ${newProducts.length} new items from sheet.`);
        } catch (error) {
          console.error("Error loading new products sheet:", error);
        }
      }

      // 2. Fetch Used Products
      if (USED_PRODUCTS_SHEET_ID) {
        try {
          usedProducts = await fetchProductsFromSheet(USED_PRODUCTS_SHEET_ID, USED_PRODUCTS_SHEET_GID, true);
          console.log(`Loaded ${usedProducts.length} used items from sheet.`);
        } catch (error) {
          console.error("Error loading used products sheet:", error);
        }
      }

      setProducts(prev => {
        // If we fetched new products, replace the static ones (PRODUCTS)
        // Otherwise, keep static ones.
        const baseProducts = newProducts.length > 0 ? newProducts : PRODUCTS;
        
        // Combine with used products
        // Filter out any previous 'Usados' from prev if we are re-fetching (though useEffect runs once)
        // Actually, we should just combine base + used.
        return [...baseProducts, ...usedProducts];
      });
    };

    loadProducts();
  }, []);

  const addToCart = (product: Product, selectedColor?: string) => {
    setCart(prev => {
      const existing = prev.find(p => p.id === product.id && p.selectedColor === selectedColor);
      if (existing) {
        return prev.map(p => (p.id === product.id && p.selectedColor === selectedColor) ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...product, quantity: 1, selectedColor }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (index: number) => {
    setCart(prev => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
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
          <Route path="/dpanel/*" element={<DashboardLayout />} />
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