import { motion } from 'motion/react';
import { Trash2, Plus, Minus, CreditCard } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';

export function Cart() {
  const { cart, removeFromCart, updateQuantity, user } = useStore();

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!user) {
      alert('Debes iniciar sesión para finalizar la compra.');
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + '/cart'
        }
      });
      if (error) console.error(error);
      return;
    }
    
    alert('Funcionalidad de checkout en desarrollo.');
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4">
        <ShoppingCartIcon className="w-24 h-24 text-gray-300 mb-6" />
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Tu carrito está vacío</h2>
        <p className="text-gray-500 mb-8 text-center">Parece que aún no has agregado ningún producto.</p>
        <a href="/" className="bg-gray-900 text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors">
          Explorar Productos
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Tu Carrito</h1>
      
      <div className="flex flex-col lg:flex-row gap-12">
        <div className="lg:w-2/3">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <ul className="divide-y divide-gray-100">
              {cart.map((item) => (
                <motion.li 
                  key={item.id}
                  layout
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-6 flex flex-col sm:flex-row items-center"
                >
                  <img src={item.image} alt={item.name} className="w-24 h-24 object-cover rounded-xl mb-4 sm:mb-0 sm:mr-6" />
                  <div className="flex-grow text-center sm:text-left mb-4 sm:mb-0">
                    <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                    <p className="text-blue-600 font-medium">{formatPrice(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center border border-gray-200 rounded-full">
                      <button 
                        onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <button 
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-red-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </motion.li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:w-1/3">
          <div className="bg-gray-50 rounded-3xl p-8 border border-gray-100 sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Resumen de Compra</h2>
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(total)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío</span>
                <span>A calcular</span>
              </div>
              <div className="border-t border-gray-200 pt-4 flex justify-between text-lg font-bold text-gray-900">
                <span>Total Estimado</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            <button 
              onClick={handleCheckout}
              className="w-full bg-gray-900 text-white px-6 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
            >
              <CreditCard className="w-5 h-5 mr-2" />
              {user ? 'Proceder al Pago' : 'Iniciar Sesión para Pagar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ShoppingCartIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="8" cy="21" r="1" />
      <circle cx="19" cy="21" r="1" />
      <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
    </svg>
  );
}
