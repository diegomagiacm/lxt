import React, { useState, useEffect } from 'react';
import { User, Product } from '../../../types';
import { getProducts, saveProduct, getSales, uploadImage } from '../../services/db';
import { getUsers as fetchUsers, createUser, updateUserStats } from '../../services/auth';
import { Plus, Edit, Save, Trash, Clock, Upload, X, Check } from 'lucide-react';
import DashboardStats from '../../components/DashboardStats';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'users'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Product Form State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null); // For modal (new product)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  
  // Inline Editing State
  const [inlineEdits, setInlineEdits] = useState<Record<string, Product>>({});

  // User Form State
  const [newUser, setNewUser] = useState({ username: '', code: '', role: 'seller' as 'seller' | 'admin' });
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('dpanel_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [p, u, s] = await Promise.all([getProducts(), fetchUsers(), getSales()]);
    setProducts(p);
    setUsers(u);
    setSales(s);
    setLoading(false);
  };

  // --- Inline Editing Handlers ---
  const handleInlineChange = (id: string, field: keyof Product, value: any) => {
    setInlineEdits(prev => {
      const currentProduct = prev[id] || products.find(p => p.id === id);
      if (!currentProduct) return prev;
      return {
        ...prev,
        [id]: { ...currentProduct, [field]: value }
      };
    });
  };

  const handleVariantChange = (productId: string, variantIndex: number, field: 'color' | 'stock', value: string | number) => {
    setInlineEdits(prev => {
      const currentProduct = prev[productId] || products.find(p => p.id === productId);
      if (!currentProduct) return prev;
      
      const newVariants = [...(currentProduct.variants || [])];
      if (!newVariants[variantIndex]) return prev;

      newVariants[variantIndex] = {
        ...newVariants[variantIndex],
        [field]: field === 'stock' ? Number(value) : value
      };

      return {
        ...prev,
        [productId]: { ...currentProduct, variants: newVariants }
      };
    });
  };

  const addVariant = (productId: string) => {
    setInlineEdits(prev => {
      const currentProduct = prev[productId] || products.find(p => p.id === productId);
      if (!currentProduct) return prev;
      
      const newVariants = [...(currentProduct.variants || []), { color: 'Nuevo', stock: 0 }];
      
      return {
        ...prev,
        [productId]: { ...currentProduct, variants: newVariants }
      };
    });
  };

  const removeVariant = (productId: string, variantIndex: number) => {
    setInlineEdits(prev => {
      const currentProduct = prev[productId] || products.find(p => p.id === productId);
      if (!currentProduct) return prev;
      
      const newVariants = [...(currentProduct.variants || [])];
      newVariants.splice(variantIndex, 1);
      
      return {
        ...prev,
        [productId]: { ...currentProduct, variants: newVariants }
      };
    });
  };

  const handleInlineSave = async (id: string) => {
    const productToSave = inlineEdits[id];
    if (!productToSave) return;

    const success = await saveProduct(productToSave);
    if (success) {
      setProducts(prev => prev.map(p => p.id === id ? productToSave : p));
      setInlineEdits(prev => {
        const newState = { ...prev };
        delete newState[id];
        return newState;
      });
    } else {
      alert('Error al guardar');
    }
  };

  const handleInlineImageUpload = async (id: string, file: File) => {
    const url = await uploadImage(file);
    if (url) {
      handleInlineChange(id, 'image', url);
      // Auto-save image update? Or let user click save?
      // Let's let user click save to confirm, but update preview
    } else {
      alert('Error al subir imagen');
    }
  };

  // --- Modal Handlers (New Product) ---
  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    
    await saveProduct(editingProduct);
    setIsProductModalOpen(false);
    setEditingProduct(null);
    loadData();
  };

  const handleNewProductImageUpload = async (file: File) => {
    if (!editingProduct) return;
    const url = await uploadImage(file);
    if (url) {
      setEditingProduct({ ...editingProduct, image: url });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser({
      ...newUser,
      salesCount: 0,
      extraHours: 0
    });
    setIsUserModalOpen(false);
    setNewUser({ username: '', code: '', role: 'seller' });
    loadData();
  };

  const handleAddHours = async (username: string) => {
    const hours = prompt("Cantidad de horas extra a agregar:");
    if (hours && !isNaN(Number(hours))) {
      await updateUserStats(username, Number(hours));
      loadData();
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      {currentUser && <DashboardStats user={currentUser} sales={sales} allUsers={users} />}

      <div className="flex space-x-4 border-b border-gray-200 pb-2">
        <button 
          className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('products')}
        >
          Gestionar Productos
        </button>
        <button 
          className={`px-4 py-2 font-medium rounded-lg ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
          onClick={() => setActiveTab('users')}
        >
          Gestionar Usuarios
        </button>
      </div>

      {activeTab === 'products' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Inventario</h3>
            <button 
              onClick={() => {
                setEditingProduct({
                  id: `new-${Date.now()}`,
                  name: '',
                  price: 0,
                  category: '',
                  description: '',
                  image: '',
                  stock: true,
                  colors: []
                });
                setIsProductModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Producto
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 w-16">Img</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 w-24">Precio</th>
                  <th className="px-4 py-3">Variantes (Color/Stock)</th>
                  <th className="px-4 py-3 w-20">Stock Gral</th>
                  <th className="px-4 py-3 w-24">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(product => {
                  const isEdited = !!inlineEdits[product.id];
                  const p = inlineEdits[product.id] || product;

                  return (
                    <tr key={product.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="relative w-10 h-10 group">
                          <img src={p.image || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover rounded" />
                          <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded transition-opacity">
                            <Upload className="w-4 h-4 text-white" />
                            <input 
                              type="file" 
                              className="hidden" 
                              accept="image/*"
                              onChange={(e) => {
                                if (e.target.files?.[0]) handleInlineImageUpload(product.id, e.target.files[0]);
                              }}
                            />
                          </label>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={p.name}
                          onChange={(e) => handleInlineChange(product.id, 'name', e.target.value)}
                          className="w-full border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="text" 
                          value={p.category}
                          onChange={(e) => handleInlineChange(product.id, 'category', e.target.value)}
                          className="w-full border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input 
                          type="number" 
                          value={p.price}
                          onChange={(e) => handleInlineChange(product.id, 'price', Number(e.target.value))}
                          className="w-full border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          {(p.variants || []).map((variant, idx) => (
                            <div key={idx} className="flex items-center space-x-1">
                              <input 
                                type="text" 
                                value={variant.color}
                                onChange={(e) => handleVariantChange(product.id, idx, 'color', e.target.value)}
                                className="w-20 border-gray-200 rounded text-xs p-1"
                                placeholder="Color"
                              />
                              <input 
                                type="number" 
                                value={variant.stock}
                                onChange={(e) => handleVariantChange(product.id, idx, 'stock', e.target.value)}
                                className="w-12 border-gray-200 rounded text-xs p-1"
                                placeholder="Qty"
                              />
                              <button 
                                onClick={() => removeVariant(product.id, idx)}
                                className="text-red-400 hover:text-red-600"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          <button 
                            onClick={() => addVariant(product.id)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <Plus className="w-3 h-3 mr-1" /> Agregar
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleInlineChange(product.id, 'stock', !p.stock)}
                          className={`px-2 py-1 rounded-full text-xs font-medium w-full ${p.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {p.stock ? 'Si' : 'No'}
                        </button>
                      </td>
                      <td className="px-4 py-3">
                        {isEdited && (
                          <button 
                            onClick={() => handleInlineSave(product.id)}
                            className="text-green-600 hover:text-green-800 p-1 bg-green-50 rounded mr-2"
                            title="Guardar cambios"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-semibold text-lg">Personal</h3>
            <button 
              onClick={() => setIsUserModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> Nuevo Usuario
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-6 py-3">Usuario</th>
                  <th className="px-6 py-3">Rol</th>
                  <th className="px-6 py-3">Horas Extra</th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map(user => (
                  <tr key={user.username} className="hover:bg-gray-50">
                    <td className="px-6 py-3 font-medium">{user.username}</td>
                    <td className="px-6 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-3">{user.extraHours || 0}</td>
                    <td className="px-6 py-3">
                      <button 
                        onClick={() => handleAddHours(user.username)}
                        className="flex items-center text-green-600 hover:text-green-800 text-xs font-medium border border-green-200 px-2 py-1 rounded bg-green-50"
                      >
                        <Clock className="w-3 h-3 mr-1" /> + Horas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal (New Product Only) */}
      {isProductModalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">Crear Producto</h3>
            <form onSubmit={handleSaveNewProduct} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen</label>
                <div className="mt-1 flex items-center space-x-4">
                  {editingProduct.image && (
                    <img src={editingProduct.image} alt="Preview" className="w-16 h-16 object-cover rounded" />
                  )}
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) handleNewProductImageUpload(e.target.files[0]);
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input 
                  type="text" 
                  value={editingProduct.name}
                  onChange={e => setEditingProduct({...editingProduct, name: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio (USD)</label>
                  <input 
                    type="number" 
                    value={editingProduct.price}
                    onChange={e => setEditingProduct({...editingProduct, price: Number(e.target.value)})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Categoría</label>
                  <input 
                    type="text" 
                    value={editingProduct.category}
                    onChange={e => setEditingProduct({...editingProduct, category: e.target.value})}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Colores (separados por coma)</label>
                <input 
                  type="text" 
                  value={editingProduct.colors?.join(', ') || ''}
                  onChange={e => setEditingProduct({...editingProduct, colors: e.target.value.split(',').map(c => c.trim())})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  placeholder="Negro, Blanco, Azul"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea 
                  value={editingProduct.description}
                  onChange={e => setEditingProduct({...editingProduct, description: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  rows={3}
                />
              </div>
              <div className="flex items-center">
                <input 
                  type="checkbox" 
                  checked={editingProduct.stock}
                  onChange={e => setEditingProduct({...editingProduct, stock: e.target.checked})}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">En Stock</label>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* User Modal */}
      {isUserModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold mb-4">Nuevo Usuario</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Usuario</label>
                <input 
                  type="text" 
                  value={newUser.username}
                  onChange={e => setNewUser({...newUser, username: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contraseña (Código)</label>
                <input 
                  type="text" 
                  value={newUser.code}
                  onChange={e => setNewUser({...newUser, code: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Rol</label>
                <select 
                  value={newUser.role}
                  onChange={e => setNewUser({...newUser, role: e.target.value as 'admin' | 'seller'})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="seller">Vendedor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsUserModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Crear
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
