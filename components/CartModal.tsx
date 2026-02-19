import React, { useState, useEffect } from 'react';
import { CartItem, PaymentMethod } from '../types';
import { BRANCHES, GOOGLE_SCRIPT_URL } from '../constants';
import { X, Calendar, DollarSign, Loader2 } from 'lucide-react';

interface CartModalProps {
  cart: CartItem[];
  onClose: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}

const CartModal: React.FC<CartModalProps> = ({ cart, onClose, onRemove, onClear }) => {
  const [step, setStep] = useState(1);
  const [dolarRate, setDolarRate] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    paymentMethod: PaymentMethod.CASH_USD,
    branch: BRANCHES[0].name,
    date: '',
    time: ''
  });

  // Fetch Dollar Rate on Mount
  useEffect(() => {
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(data => {
        if (data && data.venta) {
          setDolarRate(data.venta + 10);
        }
      })
      .catch(err => console.error("Error fetching dollar rate", err));
  }, []);

  const totalUsd = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  
  // Calculate final price based on payment method logic
  const calculateFinalPrice = () => {
    const rate = dolarRate || 1200;
    const baseArs = totalUsd * rate;

    switch (formData.paymentMethod) {
      case PaymentMethod.CASH_USD:
      case PaymentMethod.USDT:
        return { value: totalUsd, currency: 'USD' };
      case PaymentMethod.CASH_ARS:
        return { value: baseArs, currency: 'ARS' };
      case PaymentMethod.TRANSFER:
        return { value: baseArs * 1.05, currency: 'ARS' };
      case PaymentMethod.CREDIT_1:
        return { value: baseArs * 1.19, currency: 'ARS' };
      case PaymentMethod.CREDIT_3:
        return { value: baseArs * 1.45, currency: 'ARS' };
      case PaymentMethod.CREDIT_6:
        return { value: baseArs * 1.70, currency: 'ARS' };
      case PaymentMethod.CREDIT_9:
        return { value: baseArs * 1.85, currency: 'ARS' };
      case PaymentMethod.CREDIT_12:
        return { value: baseArs * 2.10, currency: 'ARS' };
      default:
        return { value: totalUsd, currency: 'USD' };
    }
  };

  const finalPrice = calculateFinalPrice();

  const sendToGoogleScript = async () => {
    // Generate Product Summary for Title
    const productSummary = cart.map(c => c.name).join(', ');
    
    // Updated Title: NOMBRE - EQUIPOS
    const title = `${formData.name} - ${productSummary}`;
    
    const productList = cart.map(c => `• ${c.quantity}x ${c.name}`).join('\n');
    const branchInfo = BRANCHES.find(b => b.name === formData.branch);

    // Color Logic: Belgrano = Red (11), Others = Blue (9)
    const colorId = formData.branch === 'Belgrano' ? '11' : '9';
    
    // Identify Used Items to Update Status
    // IDs are format: "used-{csvIndex}-{slug}"
    const usedItemsRows = cart
      .filter(item => item.id.startsWith('used-'))
      .map(item => {
        const parts = item.id.split('-');
        // The loop in App.tsx was 0-based relative to the array.
        // In CSV: Row 0 is Headers. Row 1 is the first data row.
        // The loop used 'i'. 
        // Google Sheets uses 1-based indexing.
        // If i=1 (first data row in code loop), that is Row 2 in Excel/Sheets.
        // So Row = i + 1.
        const i = parseInt(parts[1], 10);
        return i + 1;
      });

    const description = `
CLIENTE: ${formData.name}
TELÉFONO: ${formData.phone}
------------------
PEDIDO:
${productList}
------------------
PAGO: ${formData.paymentMethod}
TOTAL APROX: ${finalPrice.currency} ${Math.ceil(finalPrice.value).toLocaleString()}
(Cotiz Ref: $${dolarRate})
    `.trim();

    // Create Start and End times
    const startDateTime = new Date(`${formData.date}T${formData.time}`).toISOString();
    // Default 1 hour duration
    const endDateTime = new Date(new Date(`${formData.date}T${formData.time}`).getTime() + 60 * 60 * 1000).toISOString();

    const payload = {
      title,
      description,
      location: branchInfo?.address || 'Locos x la Tecnología',
      startTime: startDateTime,
      endTime: endDateTime,
      colorId: colorId,
      // Pass the list of rows to update
      usedRowsToUpdate: usedItemsRows
    };

    try {
      await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      alert("¡Reserva confirmada con éxito! Te esperamos en la sucursal.");
      onClear(); // Clear the cart
      onClose(); // Close modal

    } catch (error) {
      console.error('Error sending data:', error);
      alert("Hubo un error de conexión, pero intentaremos guardar tu pedido. Te esperamos en la sucursal.");
      onClear();
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes("PEGAR_TU_URL")) {
        alert("Error de Configuración: Falta configurar el Google Apps Script.");
        return;
    }

    setIsSaving(true);
    sendToGoogleScript();
  };

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex justify-end animate-fade-in">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-slide-in-right">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-bold flex items-center gap-2 text-gray-800">
            <DollarSign className="w-5 h-5 text-green-600" /> Checkout
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5 text-gray-600" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {cart.length === 0 ? (
            <p className="text-gray-500 text-center mt-10">Tu carrito está vacío.</p>
          ) : (
            <div className="space-y-6">
              {/* Product Summary */}
              <div className="space-y-4">
                {cart.map(item => (
                  <div key={item.id} className="flex gap-4 border-b border-gray-100 pb-4">
                    <img src={item.image} className="w-16 h-16 object-cover rounded-md border" alt={item.name} />
                    <div className="flex-1">
                      <h4 className="font-bold text-sm text-gray-800">{item.name}</h4>
                      <p className="text-blue-600 font-bold text-sm">USD {item.price}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">x{item.quantity}</span>
                        <button onClick={() => onRemove(item.id)} className="text-red-500 text-xs hover:underline">Eliminar</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals Section */}
              <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                <div className="flex justify-between items-center text-sm text-gray-600 mb-1">
                  <span>Subtotal USD:</span>
                  <span>{totalUsd}</span>
                </div>
                {dolarRate ? (
                   <div className="flex justify-between items-center text-xs text-green-600 mb-3 border-b border-blue-200 pb-2">
                    <span>Cotización Blue (+10):</span>
                    <span>${dolarRate} ARS</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                    <Loader2 className="w-3 h-3 animate-spin" /> Cargando cotización...
                  </div>
                )}
                
                <div className="flex justify-between items-center font-bold text-lg text-blue-800">
                   <span>Estimado ({finalPrice.currency}):</span>
                   <span>${Math.ceil(finalPrice.value).toLocaleString('es-AR')}</span>
                </div>
                 <p className="text-[10px] text-gray-500 mt-1 text-right">
                   *El precio final depende del método de pago seleccionado abajo.
                 </p>
              </div>
            </div>
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-6 border-t bg-gray-50 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
            {step === 1 ? (
              <button 
                onClick={() => setStep(2)}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-4 rounded-xl font-bold hover:shadow-lg transition-all transform active:scale-95"
              >
                Continuar Compra
              </button>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4 animate-fade-in">
                {/* Contrast improvements: bg-white text-gray-900 border-gray-300 */}
                <div>
                   <label className="text-xs font-bold text-gray-600 uppercase">Datos Personales</label>
                   <input required placeholder="Nombre Completo" className="w-full p-3 border border-gray-300 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" onChange={e => setFormData({...formData, name: e.target.value})} />
                   <input required placeholder="Teléfono / WhatsApp" type="tel" className="w-full p-3 border border-gray-300 rounded-lg mt-2 focus:ring-2 focus:ring-blue-500 outline-none bg-white text-gray-900" onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Sucursal</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg mt-1 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, branch: e.target.value})}>
                      {BRANCHES.map(b => <option key={b.name} value={b.name}>{b.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-600 uppercase">Pago</label>
                    <select className="w-full p-3 border border-gray-300 rounded-lg mt-1 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, paymentMethod: e.target.value as PaymentMethod})}>
                      {Object.values(PaymentMethod).map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                   <label className="text-xs font-bold text-gray-600 uppercase">Fecha de Retiro</label>
                   <div className="flex gap-2 mt-1">
                      <input required type="date" className="w-3/5 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, date: e.target.value})} />
                      <input required type="time" className="w-2/5 p-3 border border-gray-300 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500" onChange={e => setFormData({...formData, time: e.target.value})} />
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSaving}
                  className={`w-full bg-green-600 text-white py-4 rounded-xl font-bold hover:bg-green-700 flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95 ${isSaving ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Calendar className="w-5 h-5" />}
                  {isSaving ? 'Guardando Reserva...' : 'Confirmar Reserva'}
                </button>
                
                <button type="button" onClick={() => setStep(1)} className="w-full text-center text-gray-500 text-sm hover:underline">
                  Volver al resumen
                </button>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartModal;