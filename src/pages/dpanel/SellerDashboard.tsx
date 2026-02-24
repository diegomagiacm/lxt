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

  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

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
    setSelectedVariants({});
    await loadData(); // Refresh stats
    alert('Venta registrada con éxito');
  };

  const addToCart = (product: Product) => {
    // If product has variants, require selection
    if (product.variants && product.variants.length > 0) {
      const selectedColor = selectedVariants[product.id];
      if (!selectedColor) {
        alert(`Por favor selecciona un color para ${product.name}`);
        return;
      }
      
      // Check stock for specific variant
      const variant = product.variants.find(v => v.color === selectedColor);
      if (variant && variant.stock <= 0) {
        alert(`No hay stock para ${product.name} en color ${selectedColor}`);
        return;
      }
      
      setCart([...cart, { ...product, selectedColor }]);
    } else {
      setCart([...cart, product]);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
  };

  const handleVariantSelect = (productId: string, color: string) => {
    setSelectedVariants(prev => ({ ...prev, [productId]: color }));
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
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
            <h3 className="font-semibold text-lg">Productos Disponibles</h3>
            <div className="relative w-40 md:w-64">
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
          
          <div className="flex-1 overflow-y-auto p-4">
            {/* Mobile View (Cards) */}
            <div className="md:hidden space-y-4">
              {filteredProducts.map(product => (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <div className="flex gap-1 mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
                        {product.location && (
                          <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-100 font-medium">
                            {product.location}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="font-bold text-blue-600">${product.price}</span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3 line-clamp-2">{product.description}</p>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    {product.variants && product.variants.length > 0 ? (
                      <div className="flex flex-col gap-2">
                        <select 
                          className="w-full text-sm border rounded-lg p-2 bg-gray-50"
                          value={selectedVariants[product.id] || ''}
                          onChange={(e) => handleVariantSelect(product.id, e.target.value)}
                        >
                          <option value="">Seleccionar Color</option>
                          {product.variants.map((v, idx) => (
                            <option key={idx} value={v.color} disabled={v.stock <= 0}>
                              {v.color} ({v.stock})
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => addToCart(product)}
                          className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                        >
                          Agregar
                        </button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => addToCart(product)}
                        className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
                      >
                        Agregar
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <table className="hidden md:table w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500 sticky top-0">
                <tr>
                  <th className="px-6 py-3 font-medium">Producto</th>
                  <th className="px-6 py-3 font-medium">Ubicación</th>
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
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{product.description}</div>
                    </td>
                    <td className="px-6 py-3">
                      {product.location ? (
                        <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded border border-purple-100">
                          {product.location}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{product.category}</td>
                    <td className="px-6 py-3 font-medium">${product.price}</td>
                    <td className="px-6 py-3">
                      {product.variants && product.variants.length > 0 ? (
                        <div className="flex flex-col space-y-2">
                          <select 
                            className="text-xs border rounded p-1"
                            value={selectedVariants[product.id] || ''}
                            onChange={(e) => handleVariantSelect(product.id, e.target.value)}
                          >
                            <option value="">Seleccionar Color</option>
                            {product.variants.map((v, idx) => (
                              <option key={idx} value={v.color} disabled={v.stock <= 0}>
                                {v.color} ({v.stock})
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={() => addToCart(product)}
                            className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs font-medium"
                          >
                            Agregar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToCart(product)}
                          className="px-3 py-1 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 text-xs font-medium"
                        >
                          Agregar
                        </button>
                      )}
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
                    <div className="font-medium text-sm">
                      {item.name} 
                      {item.selectedColor && <span className="text-xs text-gray-500 ml-1">({item.selectedColor})</span>}
                    </div>
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
