import { useEffect, useState } from 'react'
import { Routes, Route, useNavigate, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ShoppingCart, 
  Package, 
  MessageCircle, 
  LogIn, 
  LogOut,
  X,
  AlertTriangle,
  Plus,
  Trash2,
  Minus,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react'
import { supabase } from './lib/supabase'
import { calculateTotal, CARD_INSTALLMENTS, PAYMENT_METHODS } from './lib/payment'
import { getExchangeRate } from './lib/exchange'
import type { Product, CartItem, Warehouse, StockItem } from './types'

// --- Constants ---

const LOGO_URL = "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/lxtlogo.png"
const IMG_BASE_URL = "https://jecxqmertgnogjetodao.supabase.co/storage/v1/object/public/LXT2/Prod2/"
const WHATSAPP_NUMBER = "1162403000"

// --- Components ---

const Navbar = ({ cartCount, user, onLogin, onLogout, onOpenCart }: any) => {
  return (
    <nav className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 group">
          <img src={LOGO_URL} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 object-contain rounded-lg shadow-sm group-hover:scale-110 transition-transform" />
          <span className="font-extrabold text-base sm:text-xl tracking-tight text-slate-900 truncate max-w-[150px] sm:max-w-none">Locos x La tecnología</span>
        </Link>

        <div className="flex items-center gap-2 sm:gap-4">
          <a 
            href={`https://wa.me/${WHATSAPP_NUMBER}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="p-2 hover:bg-green-50 text-green-600 rounded-full transition-colors"
          >
            <MessageCircle className="w-6 h-6" />
          </a>
          
          <button onClick={onOpenCart} className="relative p-2 hover:bg-slate-100 rounded-full transition-colors">
            <ShoppingCart className="w-6 h-6" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full">
                {cartCount}
              </span>
            )}
          </button>

          {user ? (
            <div className="flex items-center gap-2">
              <img src={user.user_metadata.avatar_url} className="w-8 h-8 rounded-full border border-slate-200" alt="avatar" />
              <button onClick={onLogout} className="p-2 hover:bg-slate-100 rounded-full">
                <LogOut className="w-5 h-5 text-slate-600" />
              </button>
            </div>
          ) : (
            <button 
              onClick={onLogin}
              className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-slate-800 transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  )
}

const ProductCard = ({ modelName, variants, onAddToCart, stockInfo, viewMode }: { modelName: string, variants: Product[], onAddToCart: (p: Product) => void, stockInfo: Record<string, number>, viewMode: 'grid' | 'list' }) => {
  // Find the cheapest variant to initialize
  const cheapestVariant = [...variants].sort((a, b) => a.price_usd - b.price_usd)[0]
  const [selectedStorage, setSelectedStorage] = useState(cheapestVariant.storage)
  const [selectedColor, setSelectedColor] = useState(cheapestVariant.color)

  const storages = Array.from(new Set(variants.map(v => v.storage))).sort((a, b) => a - b)
  const colors = Array.from(new Set(variants.filter(v => v.storage === selectedStorage).map(v => v.color)))

  useEffect(() => {
    if (!colors.includes(selectedColor)) {
      setSelectedColor(colors[0])
    }
  }, [selectedStorage, colors, selectedColor])

  const product = variants.find(v => v.storage === selectedStorage && v.color === selectedColor) || variants.find(v => v.storage === selectedStorage) || variants[0]
  
  const handleWhatsAppReserve = () => {
    const message = `Hola! Me gustaría reservar el ${product.marca} ${product.model} de ${product.storage}GB en color ${product.color} que figura como agotado.`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const cleanModel = modelName.toLowerCase()
    .replace(/pro\s*max/g, 'promax')
    .replace(/pro/g, 'pro')
    .replace(/plus/g, 'plus')
    .replace(/\s+/g, '')
  
  const fallbackImg = `${IMG_BASE_URL}${cleanModel}.png`
  const imgSrc = product.image_url || fallbackImg
  const totalStock = stockInfo[product.id] || 0
  const isOutOfStock = totalStock <= 0

  if (viewMode === 'list') {
    return (
      <motion.div 
        layout
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        className={`group bg-white rounded-2xl p-3 shadow-sm hover:shadow-md transition-all border border-slate-100 flex items-center gap-4 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
      >
        <div className="w-20 h-20 bg-slate-50 rounded-xl overflow-hidden shrink-0 flex items-center justify-center relative">
          <img 
            src={imgSrc} 
            onError={(e: any) => { e.target.src = 'https://via.placeholder.com/400?text=' + encodeURIComponent(product.marca + ' ' + modelName) }}
            className="w-full h-full object-contain p-2" 
            alt={`${product.marca} ${modelName}`} 
          />
          {isOutOfStock && (
             <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
               <span className="bg-red-500 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-tighter">Agotado</span>
             </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-slate-900 truncate">{product.marca} {modelName}</h3>
            <span className="text-blue-600 font-black text-lg">${product.price_usd}</span>
          </div>
          
          <div className="flex gap-1.5 mt-2 overflow-x-auto no-scrollbar">
            {storages.map(s => (
              <button 
                key={s} onClick={() => setSelectedStorage(s)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all shrink-0 ${selectedStorage === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
              >
                {s}GB
              </button>
            ))}
          </div>

          <div className="flex gap-1.5 mt-1 overflow-x-auto no-scrollbar">
            {colors.map(c => (
              <button 
                key={c} onClick={() => setSelectedColor(c)}
                className={`px-2 py-0.5 rounded-md text-[9px] font-bold border transition-all shrink-0 ${selectedColor === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {isOutOfStock ? (
          <button 
            onClick={handleWhatsAppReserve}
            className="p-3 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-all flex flex-col items-center gap-0.5"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="text-[7px] font-bold uppercase leading-none">Reservar</span>
          </button>
        ) : (
          <button 
            onClick={() => onAddToCart(product)}
            className="p-3 rounded-xl bg-slate-900 text-white hover:bg-blue-600 transition-all"
          >
            <Plus className="w-5 h-5" />
          </button>
        )}
      </motion.div>
    )
  }

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className={`group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all border border-slate-100 ${isOutOfStock ? 'opacity-75 grayscale-[0.5]' : ''}`}
    >
      <div className="aspect-square bg-slate-50 rounded-2xl mb-4 overflow-hidden flex items-center justify-center relative">
        <img 
          src={imgSrc} 
          onError={(e: any) => { e.target.src = 'https://via.placeholder.com/400?text=' + encodeURIComponent(product.marca + ' ' + modelName) }}
          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500 p-4" 
          alt={`${product.marca} ${modelName}`} 
        />
        {isOutOfStock && (
          <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] flex items-center justify-center">
            <span className="bg-red-500 text-white px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg">Agotado</span>
          </div>
        )}
      </div>
      
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">{product.marca} {modelName}</h3>
          
          <div className="mt-3 flex flex-wrap gap-2">
            {storages.map(s => (
              <button 
                key={s} 
                onClick={() => setSelectedStorage(s)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border-2 transition-all ${selectedStorage === s ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
              >
                {s}GB
              </button>
            ))}
          </div>

          <div className="mt-2 flex flex-wrap gap-2">
            {colors.map(c => (
              <button 
                key={c} 
                onClick={() => setSelectedColor(c)}
                className={`px-3 py-1 rounded-full text-[10px] font-bold border-2 transition-all ${selectedColor === c ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400'}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-slate-50">
          <div>
            <span className="text-2xl font-black text-slate-900">${product.price_usd}</span>
            <span className="text-[10px] ml-1 text-slate-400 font-bold">USD</span>
          </div>
          {isOutOfStock ? (
            <button 
              onClick={handleWhatsAppReserve}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-green-600 transition-all shadow-lg shadow-green-100"
            >
              <MessageCircle className="w-4 h-4" />
              Reservar ahora
            </button>
          ) : (
            <button 
              onClick={() => onAddToCart(product)}
              className="p-2.5 rounded-xl bg-blue-600 text-white hover:bg-blue-700 hover:scale-110 transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  )
}

const CheckoutModal = ({ isOpen, onClose, cart, setCart, onComplete, rate }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<string>(PAYMENT_METHODS.CASH)
  const [installments, setInstallments] = useState(1)
  
  const subtotal = cart.reduce((acc: number, item: CartItem) => acc + (item.price_usd * item.quantity), 0)
  const totals = calculateTotal(subtotal, paymentMethod, rate, installments)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-6 sm:p-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Finalizar Reserva</h2>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><X /></button>
          </div>

          <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
            <div className="bg-slate-50 p-4 rounded-2xl">
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Tu Carrito</h3>
              {cart.map((item: CartItem) => (
                <div key={item.id} className="flex flex-col mb-4 bg-white p-3 rounded-xl shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900">{item.marca} {item.model} ({item.storage}GB)</span>
                    <span className="font-black text-blue-600">${item.price_usd * item.quantity}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-2 py-1">
                      <button 
                        onClick={() => {
                          if (item.quantity > 1) {
                            setCart((prev: CartItem[]) => prev.map((i: CartItem) => i.id === item.id ? { ...i, quantity: i.quantity - 1 } : i))
                          }
                        }}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="font-bold text-sm w-4 text-center">{item.quantity}</span>
                      <button 
                        onClick={() => setCart((prev: CartItem[]) => prev.map((i: CartItem) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i))}
                        className="p-1 hover:text-blue-600 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button 
                      onClick={() => setCart((prev: CartItem[]) => prev.filter((i: CartItem) => i.id !== item.id))}
                      className="text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors flex items-center gap-1 text-[10px] font-bold uppercase"
                    >
                      <Trash2 className="w-4 h-4" /> Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div>
              <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Método de Pago</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.CASH ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">Efectivo USD</div>
                  <div className="text-xs text-slate-500">Billetes USD</div>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CASH_ARS)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.CASH_ARS ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">Efectivo Pesos</div>
                  <div className="text-xs text-slate-500">Cotiz. Blue + 10</div>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.TRANSFER_USD)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.TRANSFER_USD ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">Transf. USD</div>
                  <div className="text-xs text-slate-500">Recargo del 5%</div>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.TRANSFER_ARS)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.TRANSFER_ARS ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">Transf. Pesos</div>
                  <div className="text-xs text-slate-500">Recargo 5% al cambio Blue</div>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.USDT)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.USDT ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">USDT 🔥</div>
                  <div className="text-xs text-slate-500">1 USDT = 1 USD</div>
                </button>
                <button 
                  onClick={() => setPaymentMethod(PAYMENT_METHODS.CARD)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all ${paymentMethod === PAYMENT_METHODS.CARD ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                  <div className="font-bold">Tarjeta</div>
                  <div className="text-xs text-slate-500">Hasta 12 cuotas</div>
                </button>
              </div>
            </div>

            {paymentMethod === PAYMENT_METHODS.CARD && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}>
                <h3 className="text-sm font-bold uppercase text-slate-400 mb-3 tracking-wider">Cuotas</h3>
                <select 
                  value={installments} 
                  onChange={(e) => setInstallments(Number(e.target.value))}
                  className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600 transition-colors"
                >
                  {CARD_INSTALLMENTS.map(c => (
                    <option key={c.quotes} value={c.quotes}>
                      {c.quotes} {c.quotes === 1 ? 'Pago' : 'Cuotas'} ({Math.round((c.surcharge - 1) * 100)}% recargo)
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-500 shrink-0" />
              <div className="text-[11px] text-orange-800 leading-tight">
                <strong>Atención:</strong> Dólares cara chica, manchados, con sellos o rotos se toman un 5% menos. 
                Billetes de baja denominación hasta USD 90. Pasado este monto, se abona 5% extra.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div>
                <span className="text-slate-400 text-sm">
                  {paymentMethod === PAYMENT_METHODS.CARD && installments > 1 ? `${installments} Cuotas de` : 'Total a Pagar'}
                </span>
                <div className="text-3xl font-black text-slate-900">
                  {totals.isARS ? (
                    <>${Math.round(totals.ars! / (paymentMethod === PAYMENT_METHODS.CARD ? installments : 1)).toLocaleString()} <span className="text-sm font-bold">ARS</span></>
                  ) : (
                    <>${totals.usd} <span className="text-sm font-bold">USD</span></>
                  )}
                </div>
                {totals.isARS && (
                  <div className="text-[10px] text-slate-400 font-bold uppercase">
                    {paymentMethod === PAYMENT_METHODS.CARD && installments > 1 
                      ? `Total financiado: $${totals.ars?.toLocaleString()} ARS` 
                      : `Equiv. $${totals.usd} USD (Blue: $${rate})`}
                  </div>
                )}
              </div>
              <button 
                onClick={() => onComplete(paymentMethod, installments, totals.isARS ? (totals.ars || 0) : totals.usd, totals.isARS ? 'ARS' : 'USD')}
                className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
              >
                Confirmar Reserva
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

const StoreView = () => {
  const [products, setProducts] = useState<Product[]>([])
  const [stockInfo, setStockInfo] = useState<Record<string, number>>({})
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedCategoria, setSelectedCategoria] = useState<string>('All')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('lxt_cart')
    return saved ? JSON.parse(saved) : []
  })
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [rate, setRate] = useState(1010)

  useEffect(() => {
    fetchProducts()
    checkUser()
    getExchangeRate().then(setRate)
  }, [])

  useEffect(() => {
    localStorage.setItem('lxt_cart', JSON.stringify(cart))
  }, [cart])

  async function checkUser() {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  async function fetchProducts() {
    try {
      setLoading(true)
      setError(null)
      console.log('Fetching products...')
      
      // Resilient fetch: remove order to avoid column name issues
      const { data: pData, error: pError } = await supabase.from('products').select('*')
      if (pError) {
        console.error('Products fetch error:', pError)
        throw pError
      }
      
      console.log('Products fetched:', pData?.length)

      let totals: Record<string, number> = {}
      try {
        const { data: sData, error: sError } = await supabase.from('stock').select('product_id, quantity')
        if (!sError && sData) {
          sData.forEach(s => {
            totals[s.product_id] = (totals[s.product_id] || 0) + s.quantity
          })
        } else {
          console.warn('Stock fetch error (ignoring):', sError)
        }
      } catch (e) {
        console.warn('Stock fetch exception (ignoring):', e)
      }

      setProducts(pData || [])
      setStockInfo(totals)
    } catch (err: any) {
      console.error('Final fetch error:', err)
      setError(err.message || 'Error al conectar con la base de datos')
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      }
      return [...prev, { ...product, quantity: 1 }]
    })
  }

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({ provider: 'google' })
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
  }

  const handleReservation = async (method: string, installments: number, total: number, currency: string = 'USD') => {
    if (!user) {
      alert('Debes iniciar sesión para reservar.')
      handleLogin()
      return
    }

    const orderSummary = cart.map(item => `- ${item.marca} ${item.model} (${item.storage}GB) x ${item.quantity}`).join('%0A')
    const methodNames: Record<string, string> = {
      [PAYMENT_METHODS.CASH]: 'Efectivo USD',
      [PAYMENT_METHODS.CASH_ARS]: 'Efectivo Pesos',
      [PAYMENT_METHODS.TRANSFER_USD]: 'Transf. USD',
      [PAYMENT_METHODS.TRANSFER_ARS]: 'Transf. Pesos',
      [PAYMENT_METHODS.USDT]: 'USDT',
      [PAYMENT_METHODS.CARD]: `Tarjeta (${installments} cuotas)`
    }

    // Save to 'agendas' table
    try {
      const { error } = await supabase.from('agendas').insert({
        user_id: user.id,
        order_details: cart,
        payment_method: method,
        total_amount: total,
        currency: currency,
        installments: installments
      })
      if (error) throw error
    } catch (err) {
      console.error('Error saving to agendas:', err)
    }

    const message = `Hola! Quisiera realizar una reserva.%0A%0A*Pedido:*%0A${orderSummary}%0A%0A*Método de Pago:* ${methodNames[method]}%0A*Total:* ${currency === 'ARS' ? '$' + total.toLocaleString() : '$' + total} ${currency}%0A%0A*Cliente:* ${user.user_metadata.full_name || user.email}`
    
    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
    
    window.open(waUrl, '_blank')
    setCart([])
    setIsCheckoutOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#FBFBFD] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-600">
      <Navbar 
        cartCount={cart.reduce((a, b) => a + b.quantity, 0)} 
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        onOpenCart={() => cart.length > 0 && setIsCheckoutOpen(true)}
      />

      <main className="pt-24 pb-20">
        {/* Hero */}
        <header className="max-w-7xl mx-auto px-4 pt-12 pb-16 sm:pt-24 sm:pb-32 text-center overflow-hidden">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-black uppercase tracking-widest mb-6"
          >
            Locos x La tecnología
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1] md:leading-[0.9] mb-8 px-4"
          >
            iPhone. <br className="hidden sm:block" />
            <span className="text-slate-400">Simplificado.</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto text-base sm:text-lg text-slate-500 font-medium px-6"
          >
            Encontrá el iPhone perfecto para vos. Modelos nuevos y usados con la mejor financiación del mercado.
          </motion.p>
        </header>

        {/* Catalog */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight text-slate-900">Modelos Disponibles</h2>
                <p className="text-slate-500 text-sm sm:text-base mt-1">Stock actualizado en tiempo real</p>
              </div>
              
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400'}`}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
              {['All', ...Array.from(new Set(products.map(p => p.categoria).filter(Boolean)))].map(cat => (
                <button 
                  key={cat}
                  onClick={() => setSelectedCategoria(cat as string)}
                  className={`px-6 py-2 rounded-full font-bold text-sm transition-all whitespace-nowrap ${selectedCategoria === cat ? 'bg-blue-600 text-white shadow-lg' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-100'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin" />
              <p className="font-bold text-slate-400 animate-pulse">Cargando equipos...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center py-24 text-center">
              <div className="bg-red-50 p-4 rounded-full mb-4">
                <AlertTriangle className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Hubo un problema</h3>
              <p className="text-slate-500 max-w-xs mx-auto mb-2">{error}</p>
              <div className="text-[10px] font-mono text-slate-400 mb-6 bg-slate-50 p-2 rounded">
                URL: {import.meta.env.VITE_SUPABASE_URL ? 'Configurada ✅' : 'Faltante ❌'}<br/>
                KEY: {(import.meta.env.VITE_ANON_KEY || import.meta.env.VITE_API_KEY) ? 'Configurada ✅' : 'Faltante ❌'}
              </div>
              <button 
                onClick={fetchProducts}
                className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-colors"
              >
                Reintentar
              </button>
            </div>
          ) : (
            products.length === 0 ? (
              <div className="flex flex-col items-center py-24 text-center">
                <div className="bg-blue-50 p-4 rounded-full mb-4">
                  <Package className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Sin productos disponibles</h3>
                <p className="text-slate-500 max-w-xs mx-auto">
                  Aún no hay equipos en el catálogo. Verificá la tabla 'products' en Supabase.
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' 
                ? "grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6 lg:gap-8" 
                : "flex flex-col gap-3 max-w-2xl mx-auto"
              }>
                {Object.entries(
                  products
                    .filter(p => selectedCategoria === 'All' || p.categoria === selectedCategoria)
                    .reduce((acc: Record<string, Product[]>, p) => {
                      const groupKey = `${p.marca}-${p.model}`
                      if (!acc[groupKey]) acc[groupKey] = []
                      acc[groupKey].push(p)
                      return acc
                    }, {})
                )
                .sort(([, aVariants], [, bVariants]) => {
                  const aMaxPrice = Math.max(...aVariants.map(v => v.price_usd))
                  const bMaxPrice = Math.max(...bVariants.map(v => v.price_usd))
                  return bMaxPrice - aMaxPrice
                })
                .map(([groupKey, variants]) => (
                  <ProductCard 
                    key={groupKey} 
                    modelName={variants[0].model}
                    variants={variants}
                    onAddToCart={addToCart} 
                    stockInfo={stockInfo}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )
          )}
        </section>
      </main>

      <footer className="bg-slate-50 border-t border-slate-100 py-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <img src={LOGO_URL} className="w-8 h-8 object-contain" alt="logo" />
            <span className="font-black text-lg">Locos x La tecnología</span>
          </div>
          <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
            © 2025 Locos x La tecnología. Todos los derechos reservados.
          </div>
          <Link to="/admin" className="text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase">Backend</Link>
        </div>
      </footer>

      <AnimatePresence>
        {isCheckoutOpen && (
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)}
            cart={cart}
            setCart={setCart}
            onComplete={handleReservation}
            rate={rate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (authError) throw authError

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut()
        throw new Error('No tienes permisos de administrador.')
      }

      onLogin()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <img src={LOGO_URL} className="w-16 h-16 mx-auto mb-4" alt="logo" />
          <h2 className="text-2xl font-bold">Acceso Backend</h2>
          <p className="text-slate-500 text-sm mt-2">Ingresá tus credenciales</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600 transition-all"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input 
            type="password" 
            placeholder="Contraseña" 
            className="w-full p-4 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600 transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}
          <button 
            disabled={isLoading}
            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg"
          >
            {isLoading ? 'Verificando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}

const AdminDashboard = ({ onLogout }: { onLogout: () => void }) => {
  const [activeTab, setActiveTab] = useState<'bulk' | 'transfers' | 'users' | 'agendas'>('bulk')
  const [products, setProducts] = useState<Product[]>([])
  const [warehouses, setWarehouses] = useState<Warehouse[]>([])
  const [stock, setStock] = useState<StockItem[]>([])
  const [profiles, setProfiles] = useState<any[]>([])
  const [agendas, setAgendas] = useState<any[]>([])
  const [modifiedData, setModifiedData] = useState<any>({ products: {}, stock: {} })
  const [isSaving, setIsSaving] = useState(false)
  const [sortConfig, setSortConfig] = useState<{ key: keyof Product | string, direction: 'asc' | 'desc' } | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // User creation state
  const [newUser, setNewUser] = useState({ email: '', password: '' })
  const [userMsg, setUserMsg] = useState('')

  // New product state
  const [newProduct, setNewProduct] = useState({ model: '', storage: 128, color: '', price_usd: 0, image_url: '', categoria: '', marca: '' })

  // Transfer state
  const [transfer, setTransfer] = useState({ productId: '', fromWh: '', toWh: '', qty: 1 })

  useEffect(() => { 
    if (activeTab !== 'users') fetchData() 
  }, [activeTab])

  const fetchData = async () => {
    console.log('Fetching all dashboard data...')
    const { data: pData, error: pError } = await supabase.from('products').select('*')
    if (pError) console.error('Error fetching products:', pError)
    
    const { data: wData, error: wError } = await supabase.from('warehouses').select('*')
    if (wError) console.error('Error fetching warehouses:', wError)
    
    const { data: sData, error: sError } = await supabase.from('stock').select('*, products(model, storage, color, marca, categoria), warehouses(name)')
    if (sError) console.error('Error fetching stock:', sError)
    
    const { data: userData } = await supabase.from('profiles').select('*')
    const { data: aData } = await supabase.from('agendas').select('*, profiles(full_name, email)').order('created_at', { ascending: false })
    
    console.log('Data loaded:', { products: pData?.length, warehouses: wData?.length, stock: sData?.length })
    
    setProducts(pData || [])
    setWarehouses(wData || [])
    setStock(sData || [])
    setProfiles(userData || [])
    setAgendas(aData || [])
  }

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setUserMsg('Creando...')
    const { error } = await supabase.auth.signUp({
      email: newUser.email,
      password: newUser.password,
    })
    if (error) setUserMsg('Error: ' + error.message)
    else {
      setUserMsg('Usuario creado exitosamente.')
      setNewUser({ email: '', password: '' })
      fetchData()
    }
  }

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!transfer.productId || !transfer.fromWh || !transfer.toWh || transfer.fromWh === transfer.toWh) {
      alert('Seleccione depósitos distintos y un producto.')
      return
    }

    const fromStock = stock.find(s => s.product_id === transfer.productId && s.warehouse_id === transfer.fromWh)
    if (!fromStock || fromStock.quantity < transfer.qty) {
      alert('Stock insuficiente en depósito de origen.')
      return
    }

    const toStock = stock.find(s => s.product_id === transfer.productId && s.warehouse_id === transfer.toWh)

    try {
      // Decrease from source
      await supabase.from('stock').update({ quantity: fromStock.quantity - transfer.qty }).eq('id', fromStock.id)
      
      // Increase or create at destination
      if (toStock) {
        await supabase.from('stock').update({ quantity: toStock.quantity + transfer.qty }).eq('id', toStock.id)
      } else {
        await supabase.from('stock').insert({ product_id: transfer.productId, warehouse_id: transfer.toWh, quantity: transfer.qty })
      }

      alert('Transferencia exitosa!')
      setTransfer({ ...transfer, qty: 1 })
      fetchData()
    } catch (err) {
      console.error(err)
      alert('Error en transferencia')
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    const { data, error } = await supabase.from('products').insert([newProduct]).select()
    if (error) alert('Error: ' + error.message)
    else {
      // Initialize stock for all warehouses for this product
      if (data && data[0]) {
        const stockEntries = warehouses.map(w => ({
          product_id: data[0].id,
          warehouse_id: w.id,
          quantity: 0
        }))
        await supabase.from('stock').insert(stockEntries)
      }
      setNewProduct({ model: '', storage: 128, color: '', price_usd: 0, image_url: '', categoria: '', marca: '' })
      fetchData()
      alert('Producto agregado!')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('¿Seguro que deseas eliminar este producto?')) {
      const { error } = await supabase.from('products').delete().eq('id', id)
      if (error) alert(error.message)
      else fetchData()
    }
  }

  const handleBulkChange = (type: 'products' | 'stock', id: string, field: string, value: any) => {
    setModifiedData((prev: any) => ({ ...prev, [type]: { ...prev[type], [id]: { ...prev[type][id], [field]: value } } }))
  }

  const handleStockChange = (productId: string, warehouseId: string, value: number) => {
    const existing = stock.find(s => s.product_id === productId && s.warehouse_id === warehouseId)
    const key = existing?.id || `new_${productId}_${warehouseId}`
    setModifiedData((prev: any) => ({
      ...prev,
      stock: {
        ...prev.stock,
        [key]: {
          ...(prev.stock[key] || {}),
          product_id: productId,
          warehouse_id: warehouseId,
          quantity: value
        }
      }
    }))
  }

  const saveBulkChanges = async () => {
    setIsSaving(true)
    try {
      // Products updates
      for (const [id, data] of Object.entries(modifiedData.products)) {
        const { error } = await supabase.from('products').update(data).eq('id', id)
        if (error) throw new Error(`Error actualizando producto ${id}: ${error.message}`)
      }
      
      // Stock upserts
      const stockToUpsert = Object.entries(modifiedData.stock).map(([id, data]: [string, any]) => {
        const entry: any = { ...data }
        if (!id.startsWith('new_')) entry.id = id
        return entry
      })

      if (stockToUpsert.length > 0) {
        const { error } = await supabase.from('stock').upsert(stockToUpsert, { onConflict: 'product_id,warehouse_id' })
        if (error) throw new Error(`Error actualizando stock: ${error.message}`)
      }

      setModifiedData({ products: {}, stock: {} })
      await fetchData()
      alert('Guardado exitosamente!')
    } catch (err: any) {
      console.error('Save error:', err)
      alert(err.message || 'Error al guardar los cambios')
    } finally { setIsSaving(false) }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b p-4 flex justify-between items-center">
        <div className="flex gap-4">
          <h2 className="font-bold">Backend</h2>
          <div className="flex gap-4 ml-4">
             <button onClick={() => setActiveTab('bulk')} className={`text-sm ${activeTab === 'bulk' ? 'font-bold text-blue-600' : 'text-slate-500'}`}>Stock</button>
             <button onClick={() => setActiveTab('transfers')} className={`text-sm ${activeTab === 'transfers' ? 'font-bold text-blue-600' : 'text-slate-500'}`}>Pases</button>
             <button onClick={() => setActiveTab('agendas')} className={`text-sm ${activeTab === 'agendas' ? 'font-bold text-blue-600' : 'text-slate-500'}`}>Reservas</button>
             <button onClick={() => setActiveTab('users')} className={`text-sm ${activeTab === 'users' ? 'font-bold text-blue-600' : 'text-slate-500'}`}>Usuarios</button>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchData} className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/></svg>
          </button>
          {activeTab === 'bulk' && <button onClick={saveBulkChanges} className="bg-green-600 text-white px-4 py-2 rounded-xl font-bold shadow-sm hover:bg-green-700 transition-all">{isSaving ? '...' : 'Guardar'}</button>}
          <button onClick={onLogout} className="text-slate-600 hover:text-slate-900 font-medium">Salir</button>
        </div>
      </nav>
      <main className="p-4 sm:p-8 max-w-[100vw] mx-auto overflow-hidden">

        {activeTab === 'transfers' && (
          <div className="bg-white rounded-3xl p-8 border shadow-sm max-w-2xl mx-auto">
            <h3 className="text-xl font-bold mb-6">Realizar Pase entre Depósitos</h3>
            <form onSubmit={handleTransfer} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Producto</label>
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100"
                    value={transfer.productId}
                    onChange={e => setTransfer({...transfer, productId: e.target.value})}
                  >
                    <option value="">Seleccionar iPhone...</option>
                    {[...products].sort((a, b) => a.model.localeCompare(b.model)).map(p => (
                  <option key={p.id} value={p.id}>{p.marca} {p.model} ({p.storage}GB) - {p.color}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Cantidad</label>
                  <input 
                    type="number" min="1"
                    className="w-full p-3 rounded-xl border-2 border-slate-100"
                    value={transfer.qty}
                    onChange={e => setTransfer({...transfer, qty: Number(e.target.value)})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Desde (Origen)</label>
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100"
                    value={transfer.fromWh}
                    onChange={e => setTransfer({...transfer, fromWh: e.target.value})}
                  >
                    <option value="">Seleccionar origen...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Hacia (Destino)</label>
                  <select 
                    className="w-full p-3 rounded-xl border-2 border-slate-100"
                    value={transfer.toWh}
                    onChange={e => setTransfer({...transfer, toWh: e.target.value})}
                  >
                    <option value="">Seleccionar destino...</option>
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-colors">
                Confirmar Transferencia
              </button>
            </form>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <div className="bg-white rounded-3xl p-8 border shadow-sm w-full lg:w-96 shrink-0">
              <h3 className="text-xl font-bold mb-6">Crear Nuevo Usuario</h3>
              <form onSubmit={handleCreateUser} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                  <input 
                    type="email" required
                    className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600"
                    value={newUser.email} onChange={e => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Contraseña</label>
                  <input 
                    type="password" required minLength={6}
                    className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600"
                    value={newUser.password} onChange={e => setNewUser(prev => ({ ...prev, password: e.target.value }))}
                  />
                </div>
                {userMsg && <p className={`text-sm font-bold ${userMsg.startsWith('Error') ? 'text-red-500' : 'text-green-600'}`}>{userMsg}</p>}
                <button className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  Registrar Usuario
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl p-8 border shadow-sm flex-1 w-full overflow-hidden">
              <h3 className="text-xl font-bold mb-6">Usuarios Registrados</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Nombre</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Email</th>
                      <th className="p-4 text-xs font-bold uppercase text-slate-400">Rol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {profiles.map(profile => (
                      <tr key={profile.id} className="border-t">
                        <td className="p-4">{profile.full_name || 'Sin nombre'}</td>
                        <td className="p-4">{profile.email}</td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={async () => {
                              const newRole = profile.role === 'admin' ? 'user' : 'admin'
                              const { error } = await supabase.from('profiles').update({ role: newRole }).eq('id', profile.id)
                              if (error) alert(error.message)
                              else fetchData()
                            }}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${profile.role === 'admin' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                          >
                            {profile.role || 'user'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agendas' && (
          <div className="bg-white rounded-3xl p-8 border shadow-sm overflow-hidden">
            <h3 className="text-xl font-bold mb-6">Reservas Recientes</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Fecha</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Cliente</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Pedido</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Método</th>
                    <th className="p-4 text-xs font-bold uppercase text-slate-400">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {agendas.map(item => (
                    <tr key={item.id} className="border-t">
                      <td className="p-4 text-xs">{new Date(item.created_at).toLocaleString()}</td>
                      <td className="p-4">
                        <div className="font-bold">{item.profiles?.full_name || 'N/A'}</div>
                        <div className="text-[10px] text-slate-400">{item.profiles?.email}</div>
                      </td>
                      <td className="p-4 text-[10px]">
                        {item.order_details.map((prod: any, idx: number) => (
                          <div key={idx}>{prod.marca} {prod.model} x {prod.quantity}</div>
                        ))}
                      </td>
                      <td className="p-4 font-bold text-xs uppercase">{item.payment_method}</td>
                      <td className="p-4">
                        <div className="font-black text-blue-600">${item.total_amount.toLocaleString()} {item.currency}</div>
                        {item.installments > 1 && <div className="text-[10px] text-slate-400">{item.installments} cuotas</div>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'bulk' && (
          <div className="space-y-6 overflow-hidden">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="bg-white rounded-3xl p-6 border shadow-sm flex-1">
                <h3 className="font-bold text-lg mb-4">Buscador</h3>
                <input 
                  type="text" 
                  placeholder="Buscar por modelo, marca o categoría..." 
                  className="w-full p-3 rounded-xl border-2 border-slate-100 outline-none focus:border-blue-600"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border shadow-sm">
              <h3 className="text-xl font-bold mb-6">Agregar Nuevo Producto</h3>
              <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Marca</label>
                  <input placeholder="Ej: Apple" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.marca} onChange={e => setNewProduct({...newProduct, marca: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Modelo</label>
                  <input placeholder="Ej: iPhone 15 Pro" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.model} onChange={e => setNewProduct({...newProduct, model: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Categoría</label>
                  <input placeholder="Ej: iPhone" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.categoria} onChange={e => setNewProduct({...newProduct, categoria: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Almacenamiento (GB)</label>
                  <input type="number" placeholder="Ej: 128" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.storage} onChange={e => setNewProduct({...newProduct, storage: Number(e.target.value)})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Color</label>
                  <input placeholder="Ej: Natural Titanium" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.color} onChange={e => setNewProduct({...newProduct, color: e.target.value})} required />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Precio (USD)</label>
                  <input type="number" placeholder="Ej: 999" className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600 font-bold text-blue-600" value={newProduct.price_usd} onChange={e => setNewProduct({...newProduct, price_usd: Number(e.target.value)})} required />
                </div>
                <div className="space-y-1 md:col-span-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase ml-1">Imagen (URL)</label>
                  <input placeholder="https://..." className="w-full p-3 border-2 border-slate-100 rounded-xl outline-none focus:border-blue-600" value={newProduct.image_url} onChange={e => setNewProduct({...newProduct, image_url: e.target.value})} />
                </div>
                <button className="md:col-span-4 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-blue-600 transition-all shadow-lg mt-2">
                  Crear Producto
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl overflow-x-auto border shadow-sm">
              <table className="w-full text-left text-[10px] sm:text-xs">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'marca', direction: sortConfig?.key === 'marca' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Marca</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'model', direction: sortConfig?.key === 'model' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Modelo</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'categoria', direction: sortConfig?.key === 'categoria' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Categoría</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'storage', direction: sortConfig?.key === 'storage' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>GB</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'color', direction: sortConfig?.key === 'color' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>Color</th>
                    <th className="p-4 cursor-pointer hover:bg-slate-100 transition-colors" onClick={() => setSortConfig({ key: 'price_usd', direction: sortConfig?.key === 'price_usd' && sortConfig.direction === 'asc' ? 'desc' : 'asc' })}>USD</th>
                    <th className="p-4">Imagen</th>
                    {warehouses.map(w => <th key={w.id} className="p-4 whitespace-nowrap text-blue-600">{w.name}</th>)}
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {[...products]
                    .filter(p => 
                      p.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (p.marca || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (p.categoria || '').toLowerCase().includes(searchTerm.toLowerCase())
                    )
                    .sort((a, b) => {
                    if (!sortConfig) return 0
                    const { key, direction } = sortConfig
                    const aVal = (a as any)[key]
                    const bVal = (b as any)[key]
                    if (aVal < bVal) return direction === 'asc' ? -1 : 1
                    if (aVal > bVal) return direction === 'asc' ? 1 : -1
                    return 0
                  }).map(p => {
                  const mod = modifiedData.products[p.id] || {}
                  return (
                    <tr key={p.id} className="border-t hover:bg-slate-50 transition-colors">
                      <td className="p-2"><input className="w-20 bg-transparent border-b border-transparent focus:border-blue-400 outline-none" value={mod.marca ?? p.marca ?? ''} onChange={e => handleBulkChange('products', p.id, 'marca', e.target.value)} placeholder="Marca" /></td>
                      <td className="p-2"><input className="w-32 bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-medium" value={mod.model ?? p.model} onChange={e => handleBulkChange('products', p.id, 'model', e.target.value)} /></td>
                      <td className="p-2"><input className="w-20 bg-transparent border-b border-transparent focus:border-blue-400 outline-none" value={mod.categoria ?? p.categoria ?? ''} onChange={e => handleBulkChange('products', p.id, 'categoria', e.target.value)} placeholder="Cat" /></td>
                      <td className="p-2"><input className="w-16 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-center" type="number" value={mod.storage ?? p.storage} onChange={e => handleBulkChange('products', p.id, 'storage', Number(e.target.value))} /></td>
                      <td className="p-2"><input className="w-24 bg-transparent border-b border-transparent focus:border-blue-400 outline-none" value={mod.color ?? p.color} onChange={e => handleBulkChange('products', p.id, 'color', e.target.value)} /></td>
                      <td className="p-2"><input className="w-20 bg-transparent border-b border-transparent focus:border-blue-400 outline-none font-bold text-center" type="number" value={mod.price_usd ?? p.price_usd} onChange={e => handleBulkChange('products', p.id, 'price_usd', Number(e.target.value))} /></td>
                      <td className="p-2"><input className="w-32 bg-transparent border-b border-transparent focus:border-blue-400 outline-none text-[8px]" value={mod.image_url ?? p.image_url ?? ''} onChange={e => handleBulkChange('products', p.id, 'image_url', e.target.value)} placeholder="URL..." /></td>
                      {warehouses.map(w => {
                        const s = stock.find(st => st.product_id === p.id && st.warehouse_id === w.id)
                        const key = s?.id || `new_${p.id}_${w.id}`
                        const sMod = modifiedData.stock[key] || {}
                        const quantity = sMod.quantity ?? s?.quantity ?? 0
                        
                        return (
                          <td key={w.id} className="p-2 sm:p-4">
                            <input 
                              className="w-12 sm:w-16 border-b border-transparent focus:border-blue-500 outline-none text-center bg-transparent" 
                              type="number" 
                              value={quantity} 
                              onChange={e => handleStockChange(p.id, w.id, Number(e.target.value))} 
                            />
                          </td>
                        )
                      })}
                      <td className="p-2 sm:p-4 text-center">
                        <button 
                          onClick={() => handleDeleteProduct(p.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          </div>
        )}
      </main>
    </div>
  )
}

function App() {
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    checkAdminSession()
  }, [])

  async function checkAdminSession() {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()
      
      if (profile?.role === 'admin') {
        setIsAdminLoggedIn(true)
      }
    }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setIsAdminLoggedIn(false)
    navigate('/')
  }

  return (
    <Routes>
      <Route path="/" element={<StoreView />} />
      <Route path="/admin" element={isAdminLoggedIn ? <AdminDashboard onLogout={handleLogout} /> : <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />} />
    </Routes>
  )
}

export default App
