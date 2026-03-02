import React, { useState, useEffect } from 'react';
import { User, Product, CartItem, PaymentMethod } from '../../../types';
import { getProducts, saveProduct, getSales, uploadImage, recordSale } from '../../services/db';
import { getUsers as fetchUsers, createUser, updateUserStats } from '../../services/auth';
import { sendSaleToGoogleScript, calculateFinalPrice, getUsedProducts } from '../../services/googleScript';
import { Plus, Edit, Save, Trash, Clock, Upload, X, Check, Search, Calendar, DollarSign, Loader2 } from 'lucide-react';
import DashboardStats from '../../components/DashboardStats';
import { BRANCHES } from '../../../constants';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'products' | 'users' | 'pos'>('products');
  const [products, setProducts] = useState<Product[]>([]);
  const [usedProducts, setUsedProducts] = useState<Product[]>([]);
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

  // POS State
  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [posSearch, setPosSearch] = useState('');
  const [posSelectedVariants, setPosSelectedVariants] = useState<Record<string, string>>({});
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [isPosSaving, setIsPosSaving] = useState(false);
  const [posFormData, setPosFormData] = useState({
    name: '',
    phone: '',
    paymentMethod: PaymentMethod.CASH_USD,
    branch: BRANCHES[0].name,
    date: '',
    time: ''
  });

  const LOCATIONS = ['Z', 'R1', 'R2', 'R3', 'R4', 'W1', 'W2', 'W3', 'W4', 'W5', 'W6', 'W7'];

  useEffect(() => {
    const storedUser = localStorage.getItem('dpanel_user');
    if (storedUser) setCurrentUser(JSON.parse(storedUser));
    loadData();
    fetchDolar();
  }, []);

  const fetchDolar = () => {
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(data => {
        if (data && data.venta) {
          setDolarRate(data.venta + 10);
        }
      })
      .catch(err => console.error("Error fetching dollar rate", err));
  };

  const loadData = async () => {
    setLoading(true);
    const [p, u, s, used] = await Promise.all([getProducts(), fetchUsers(), getSales(), getUsedProducts()]);
    setProducts(p);
    setUsers(u);
    setSales(s);
    setUsedProducts(used);
    setLoading(false);
  };

  // --- POS Handlers ---
  const addToPosCart = (product: Product) => {
    if (product.variants && product.variants.length > 0) {
      const selectedColor = posSelectedVariants[product.id];
      if (!selectedColor) {
        alert(`Por favor selecciona un color para ${product.name}`);
        return;
      }
      const variant = product.variants.find(v => v.color === selectedColor);
      if (variant && variant.stock <= 0) {
        alert(`No hay stock para ${product.name} en color ${selectedColor}`);
        return;
      }
      
      setPosCart(prev => {
        const existing = prev.find(p => p.id === product.id && p.selectedColor === selectedColor);
        if (existing) {
          return prev.map(p => (p.id === product.id && p.selectedColor === selectedColor) ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { ...product, quantity: 1, selectedColor }];
      });
    } else {
      setPosCart(prev => {
        const existing = prev.find(p => p.id === product.id);
        if (existing) {
          return prev.map(p => p.id === product.id ? { ...p, quantity: p.quantity + 1 } : p);
        }
        return [...prev, { ...product, quantity: 1 }];
      });
    }
  };

  const removeFromPosCart = (index: number) => {
    setPosCart(prev => {
      const newCart = [...prev];
      newCart.splice(index, 1);
      return newCart;
    });
  };

  const handlePosVariantSelect = (productId: string, color: string) => {
    setPosSelectedVariants(prev => ({ ...prev, [productId]: color }));
  };

  const handlePosSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (posCart.length === 0) return;

    setIsPosSaving(true);
    try {
      const totalUsd = posCart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
      const finalPrice = calculateFinalPrice(totalUsd, posFormData.paymentMethod, dolarRate || 1200);

      // 1. Send to Google Script (Calendar & Sheets)
      await sendSaleToGoogleScript({
        ...posFormData,
        cart: posCart,
        totalUsd,
        dolarRate: dolarRate || 1200,
        finalPrice
      });

      // 2. Record in Supabase Sales
      await recordSale({
        userId: currentUser?.username || 'admin',
        products: posCart,
        total: totalUsd,
        date: new Date().toISOString()
      });

      alert("Venta registrada y agendada con éxito.");
      setPosCart([]);
      setPosFormData({
        name: '',
        phone: '',
        paymentMethod: PaymentMethod.CASH_USD,
        branch: BRANCHES[0].name,
        date: '',
        time: ''
      });
      setPosSelectedVariants({});
      loadData(); // Refresh sales stats

    } catch (error) {
      console.error(error);
      alert("Error al registrar la venta.");
    } finally {
      setIsPosSaving(false);
    }
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

  const allPosProducts = [...products, ...usedProducts];
  const filteredPosProducts = allPosProducts.filter(p => 
    p.name.toLowerCase().includes(posSearch.toLowerCase()) ||
    p.category.toLowerCase().includes(posSearch.toLowerCase())
  );

  const handleSeedDatabase = async () => {
    if (!confirm('¿Estás seguro de que deseas restaurar la base de datos con los productos iniciales? Esto sobrescribirá los cambios existentes.')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/products/seed', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert(`Base de datos restaurada con éxito (${data.count} productos).`);
        loadData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding database:', error);
      alert('Error de conexión al restaurar la base de datos.');
    } finally {
      setLoading(false);
    }
  };

  const handleSeedUsers = async () => {
    if (!confirm('¿Estás seguro de que deseas restaurar los usuarios desde el archivo local?')) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/users/seed', { method: 'POST' });
      const data = await response.json();
      
      if (response.ok) {
        alert(`Usuarios restaurados con éxito (${data.count}).`);
        loadData();
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error seeding users:', error);
      alert('Error de conexión al restaurar usuarios.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Cargando...</div>;

  return (
    <div className="space-y-6">
      {currentUser && <DashboardStats user={currentUser} sales={sales} allUsers={users} />}

      <div className="flex justify-between items-center border-b border-gray-200 pb-2 overflow-x-auto">
        <div className="flex space-x-4">
          <button 
            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap ${activeTab === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('products')}
          >
            Gestionar Productos
          </button>
          <button 
            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap ${activeTab === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('users')}
          >
            Gestionar Usuarios
          </button>
          <button 
            className={`px-4 py-2 font-medium rounded-lg whitespace-nowrap ${activeTab === 'pos' ? 'bg-green-100 text-green-700' : 'text-gray-500 hover:bg-gray-50'}`}
            onClick={() => setActiveTab('pos')}
          >
            Registrar Venta (POS)
          </button>
        </div>
        
        {activeTab === 'products' && (
          <button 
            onClick={handleSeedDatabase}
            className="text-xs text-gray-500 hover:text-red-600 underline"
          >
            Restaurar Base de Datos
          </button>
        )}
        
        {activeTab === 'users' && (
          <button 
            onClick={handleSeedUsers}
            className="text-xs text-gray-500 hover:text-red-600 underline"
          >
            Restaurar Usuarios
          </button>
        )}
      </div>

      {activeTab === 'pos' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* POS Product List */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center shrink-0">
              <h3 className="font-semibold text-lg">Seleccionar Productos</h3>
              <div className="relative w-40 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  value={posSearch}
                  onChange={e => setPosSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
               <div className="space-y-4">
                {filteredPosProducts.map(product => (
                  <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <img src={product.image || 'https://via.placeholder.com/60'} alt="" className="w-16 h-16 object-cover rounded-md" />
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{product.name}</h4>
                      <div className="flex gap-2 mt-1">
                         <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{product.category}</span>
                         {product.location && <span className="text-xs text-purple-700 bg-purple-50 px-2 py-0.5 rounded-full">{product.location}</span>}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 w-full sm:w-auto">
                      <span className="font-bold text-blue-600 text-lg">${product.price}</span>
                      
                      {product.variants && product.variants.length > 0 ? (
                        <div className="flex flex-col gap-2 w-full sm:w-auto">
                          <select 
                            className="text-xs border rounded p-1.5 w-full"
                            value={posSelectedVariants[product.id] || ''}
                            onChange={(e) => handlePosVariantSelect(product.id, e.target.value)}
                          >
                            <option value="">Color</option>
                            {product.variants.map((v, idx) => (
                              <option key={idx} value={v.color} disabled={v.stock <= 0}>
                                {v.color} ({v.stock})
                              </option>
                            ))}
                          </select>
                          <button 
                            onClick={() => addToPosCart(product)}
                            className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold"
                          >
                            Agregar
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => addToPosCart(product)}
                          className="px-4 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-xs font-bold w-full sm:w-auto"
                        >
                          Agregar
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* POS Checkout Form */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col h-[600px]">
            <div className="p-6 border-b border-gray-100 bg-gray-50">
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-green-600" /> Checkout
              </h3>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Cart Items */}
              {posCart.length === 0 ? (
                <p className="text-center text-gray-400 py-4">Carrito vacío</p>
              ) : (
                <div className="space-y-2 mb-4">
                  {posCart.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm p-2 bg-gray-50 rounded border border-gray-100">
                      <div>
                        <span className="font-medium">{item.name}</span>
                        {item.selectedColor && <span className="text-xs text-gray-500 ml-1">({item.selectedColor})</span>}
                        <div className="text-xs text-gray-400">x{item.quantity} - ${item.price}</div>
                      </div>
                      <button onClick={() => removeFromPosCart(idx)} className="text-red-400 hover:text-red-600">&times;</button>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                    <span>Total USD:</span>
                    <span>${posCart.reduce((sum, p) => sum + (p.price * p.quantity), 0)}</span>
                  </div>
                </div>
              )}

              {/* Form */}
              <form id="pos-form" onSubmit={handlePosSubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Cliente</label>
                  <input 
                    required 
                    placeholder="Nombre Completo" 
                    className="w-full p-2 border border-gray-300 rounded text-sm" 
                    value={posFormData.name}
                    onChange={e => setPosFormData({...posFormData, name: e.target.value})} 
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Teléfono</label>
                  <input 
                    required 
                    placeholder="Contacto" 
                    className="w-full p-2 border border-gray-300 rounded text-sm" 
                    value={posFormData.phone}
                    onChange={e => setPosFormData({...posFormData, phone: e.target.value})} 
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Sucursal</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                      value={posFormData.branch}
                      onChange={e => setPosFormData({...posFormData, branch: e.target.value})}
                    >
                      {BRANCHES.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Pago</label>
                    <select 
                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                      value={posFormData.paymentMethod}
                      onChange={e => setPosFormData({...posFormData, paymentMethod: e.target.value as PaymentMethod})}
                    >
                      {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-600 uppercase">Fecha Retiro</label>
                  <div className="flex gap-2">
                    <input 
                      required 
                      type="date" 
                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                      value={posFormData.date}
                      onChange={e => setPosFormData({...posFormData, date: e.target.value})} 
                    />
                    <input 
                      required 
                      type="time" 
                      className="w-full p-2 border border-gray-300 rounded text-sm" 
                      value={posFormData.time}
                      onChange={e => setPosFormData({...posFormData, time: e.target.value})} 
                    />
                  </div>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button 
                type="submit"
                form="pos-form"
                disabled={isPosSaving || posCart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-white flex items-center justify-center gap-2 shadow-md
                  ${isPosSaving || posCart.length === 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}
                `}
              >
                {isPosSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                {isPosSaving ? 'Procesando...' : 'Confirmar Venta'}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  quantity: 0,
                  colors: []
                });
                setIsProductModalOpen(true);
              }}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" /> <span className="hidden sm:inline">Nuevo Producto</span><span className="sm:hidden">Nuevo</span>
            </button>
          </div>
          
          {/* Mobile View (Cards) */}
          <div className="md:hidden p-4 space-y-4">
            {products.map(product => {
              const isEdited = !!inlineEdits[product.id];
              const p = inlineEdits[product.id] || product;
              
              return (
                <div key={product.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex gap-4 mb-4">
                    <div className="relative w-24 h-24 shrink-0 group">
                      <img src={p.image || 'https://via.placeholder.com/40'} alt="" className="w-full h-full object-cover rounded-lg" />
                      <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer rounded-lg transition-opacity">
                        <Upload className="w-6 h-6 text-white" />
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
                    <div className="flex-1 space-y-2">
                      <input 
                        type="text" 
                        value={p.name}
                        onChange={(e) => handleInlineChange(product.id, 'name', e.target.value)}
                        className="w-full border-gray-200 rounded text-sm font-medium focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre"
                      />
                      <input 
                        type="text" 
                        value={p.category}
                        onChange={(e) => handleInlineChange(product.id, 'category', e.target.value)}
                        className="w-full border-gray-200 rounded text-xs text-gray-500 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Categoría"
                      />
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm">$</span>
                        <input 
                          type="number" 
                          value={p.price}
                          onChange={(e) => handleInlineChange(product.id, 'price', Number(e.target.value))}
                          className="w-24 border-gray-200 rounded text-sm font-bold text-blue-600 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <select 
                          value={p.location || ''}
                          onChange={(e) => handleInlineChange(product.id, 'location', e.target.value)}
                          className="flex-1 border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-1"
                        >
                          <option value="">Ubicación</option>
                          {LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4 bg-gray-50 p-3 rounded-lg">
                    <label className="text-xs font-bold text-gray-500 uppercase">Variantes</label>
                    {(p.variants || []).map((variant, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input 
                          type="text" 
                          value={variant.color}
                          onChange={(e) => handleVariantChange(product.id, idx, 'color', e.target.value)}
                          className="flex-1 border-gray-200 rounded text-xs p-1.5"
                          placeholder="Color"
                        />
                        <input 
                          type="number" 
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(product.id, idx, 'stock', e.target.value)}
                          className="w-16 border-gray-200 rounded text-xs p-1.5"
                          placeholder="Qty"
                        />
                        <button 
                          onClick={() => removeVariant(product.id, idx)}
                          className="text-red-400 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button 
                      onClick={() => addVariant(product.id)}
                      className="text-xs text-blue-600 hover:text-blue-800 flex items-center font-medium mt-1"
                    >
                      <Plus className="w-3 h-3 mr-1" /> Agregar Variante
                    </button>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                    {p.variants && p.variants.length > 0 ? (
                      <span className="text-xs text-gray-500 font-medium">
                        Total: {p.variants.reduce((acc, v) => acc + (v.stock || 0), 0)} u.
                      </span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input 
                          type="number" 
                          value={p.quantity || 0}
                          onChange={(e) => handleInlineChange(product.id, 'quantity', Number(e.target.value))}
                          className="w-16 border-gray-200 rounded text-sm p-1"
                          placeholder="Qty"
                        />
                        <button 
                          onClick={() => handleInlineChange(product.id, 'stock', !p.stock)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium ${p.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                        >
                          {p.stock ? 'En Stock' : 'Sin Stock'}
                        </button>
                      </div>
                    )}
                    
                    {isEdited && (
                      <button 
                        onClick={() => handleInlineSave(product.id)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 shadow-sm"
                      >
                        <Save className="w-4 h-4 mr-2" /> Guardar
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View (Table) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-gray-500">
                <tr>
                  <th className="px-4 py-3 w-16">Img</th>
                  <th className="px-4 py-3">Nombre</th>
                  <th className="px-4 py-3">Categoría</th>
                  <th className="px-4 py-3 w-24">Precio</th>
                  <th className="px-4 py-3 w-24">Ubicación</th>
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
                        <select 
                          value={p.location || ''}
                          onChange={(e) => handleInlineChange(product.id, 'location', e.target.value)}
                          className="w-full border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500 p-1"
                        >
                          <option value="">-</option>
                          {LOCATIONS.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                          ))}
                        </select>
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
                        {p.variants && p.variants.length > 0 ? (
                          <span className="text-xs text-gray-500">
                            {p.variants.reduce((acc, v) => acc + (v.stock || 0), 0)} u.
                          </span>
                        ) : (
                          <div className="flex items-center gap-2">
                            <input 
                              type="number" 
                              value={p.quantity || 0}
                              onChange={(e) => handleInlineChange(product.id, 'quantity', Number(e.target.value))}
                              className="w-16 border-gray-200 rounded text-sm focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button 
                              onClick={() => handleInlineChange(product.id, 'stock', !p.stock)}
                              className={`px-2 py-1 rounded-full text-xs font-medium ${p.stock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                            >
                              {p.stock ? 'Si' : 'No'}
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          <button 
                            onClick={() => {
                              setEditingProduct(product);
                              setIsProductModalOpen(true);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 bg-blue-50 rounded mr-2"
                            title="Editar Detalles"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          
                          {isEdited && (
                            <button 
                              onClick={() => handleInlineSave(product.id)}
                              className="text-green-600 hover:text-green-800 p-1 bg-green-50 rounded mr-2"
                              title="Guardar cambios rápidos"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
            <h3 className="text-xl font-bold mb-4">
              {products.some(p => p.id === editingProduct.id) ? 'Editar Producto' : 'Crear Producto'}
            </h3>
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
                <label className="block text-sm font-medium text-gray-700">Ubicación (Depósito)</label>
                <select 
                  value={editingProduct.location || ''}
                  onChange={e => setEditingProduct({...editingProduct, location: e.target.value})}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                >
                  <option value="">Seleccionar Ubicación</option>
                  {LOCATIONS.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
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
              <div className="flex items-center gap-6">
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    checked={editingProduct.stock}
                    onChange={e => setEditingProduct({...editingProduct, stock: e.target.checked})}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-900">En Stock</label>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cantidad (si no hay variantes)</label>
                  <input 
                    type="number" 
                    value={editingProduct.quantity || 0}
                    onChange={e => setEditingProduct({...editingProduct, quantity: Number(e.target.value)})}
                    className="mt-1 block w-24 border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
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
