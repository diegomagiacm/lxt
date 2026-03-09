import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { CategoryPage } from './pages/CategoryPage';
import { PlanCanje } from './pages/PlanCanje';
import { ProductDetail } from './pages/ProductDetail';
import { Cart } from './pages/Cart';
import { DPanel } from './pages/DPanel';
import { supabase } from './lib/supabase';
import { useStore } from './store/useStore';

export default function App() {
  const { setUser, setProfile } = useStore();

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for changes on auth state (logged in, signed out, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [setUser]);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="iphone" element={<CategoryPage title="iPhone" category="iphone" heroProduct={{ name: 'iPhone 17', price: 1500, image: 'https://picsum.photos/seed/iphone17/800/800', color: 'bg-blue-100' }} />} />
          <Route path="samsung" element={<CategoryPage title="Samsung" category="samsung" heroProduct={{ name: 'Samsung S26 Ultra', price: 1400, image: 'https://picsum.photos/seed/s26/800/800', color: 'bg-purple-100' }} />} />
          <Route path="gaming" element={<CategoryPage title="Gaming" category="gaming" heroProduct={{ name: 'PlayStation 5 Pro', price: 800, image: 'https://picsum.photos/seed/ps5pro/800/800', color: 'bg-indigo-100' }} />} />
          <Route path="xiaomi" element={<CategoryPage title="Xiaomi" category="xiaomi" heroProduct={{ name: 'Poco X7 Pro', price: 600, image: 'https://picsum.photos/seed/pocox7/800/800', color: 'bg-orange-100' }} />} />
          <Route path="plancanje" element={<PlanCanje />} />
          <Route path="product/:id" element={<ProductDetail />} />
          <Route path="cart" element={<Cart />} />
        </Route>
        <Route path="/dpanel" element={<DPanel />} />
      </Routes>
    </Router>
  );
}
