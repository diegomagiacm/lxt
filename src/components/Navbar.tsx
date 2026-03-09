import { Link } from 'react-router-dom';
import { ShoppingCart, MessageCircle } from 'lucide-react';
import { useStore } from '../store/useStore';

export function Navbar() {
  const cart = useStore((state) => state.cart);
  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0">
              <img
                className="h-12 w-auto"
                src="https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png"
                alt="Locos x la Tecnología"
                referrerPolicy="no-referrer"
              />
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/iphone" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">iPhone</Link>
              <Link to="/samsung" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Samsung</Link>
              <Link to="/xiaomi" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Xiaomi</Link>
              <Link to="/gaming" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Gaming</Link>
              <Link to="/plancanje" className="text-gray-900 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Plan Canje</Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a
              href="https://wa.me/5491160423000?text=Hola!%20Quiero%20hacer%20una%20consulta"
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-500 hover:text-green-600 transition-colors"
            >
              <MessageCircle className="h-6 w-6" />
            </a>
            <Link to="/cart" className="text-gray-900 hover:text-blue-600 transition-colors relative">
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
