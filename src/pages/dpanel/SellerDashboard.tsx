import React, { useState, useEffect } from 'react';
import { User, Product } from '../../../types';
import { getProducts, getSales, recordSale } from '../../services/db';
import { Package, Search } from 'lucide-react';
import DashboardStats from '../../components/DashboardStats';

interface SellerDashboardProps {
  user: User;
}

const SellerDashboard: React.FC<SellerDashboardProps> = ({ user }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [cart, setCart] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [p, s] = await Promise.all([getProducts(), getSales()]);
    setProducts(p);
    setSales(s);
    setLoading(false);
  };

  const handleSale = async () => {
    if (cart.length === 0) return;

    const total = cart.reduce((sum, p) => sum + p.price, 0);
    const sale = {
      userId: user.username, // Using username as ID for mock simplicity
      products: cart,
      total,
      date: new Date().toISOString()
    };

    await recordSale(sale);
    setCart([]);
    await loadData(); // Refresh stats
    alert('Venta registrada con éxito');
  };

  const addToCart = (product: Product) => {
    setCart([...cart, product]);
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <DashboardStats user={user} sales={sales} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Product List */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Productos Disponibles</h3>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Buscar..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="overflow-y-auto max-h-[600px]">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3 font-medium">Producto</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-gray-900">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.description}</div>
                    </td>
                    <td className="px-6 py-3 text-gray-500">{product.category}</td>
                    <td className="px-6 py-3 font-medium">${product.price}</td>
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => addToCart(product)}
                        className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs font-medium"
                      >
                        Agregar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Current Sale / Cart */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100">
            <h3 className="font-semibold text-lg">Nueva Venta</h3>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="text-center text-gray-400 mt-10">
                <Package className="w-12 h-12 mx-auto mb-2 opacity-20" />
                <p>Carrito vacío</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div>
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">${item.price}</div>
                  </div>
                  <button 
                    onClick={() => removeFromCart(idx)}
                    className="text-red-400 hover:text-red-600"
                  >
                    &times;
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-600">Total</span>
              <span className="text-2xl font-bold">${cart.reduce((sum, p) => sum + p.price, 0)}</span>
            </div>
            <button 
              onClick={handleSale}
              disabled={cart.length === 0}
              className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Confirmar Venta
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SellerDashboard;
