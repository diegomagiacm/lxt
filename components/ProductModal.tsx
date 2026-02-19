import React, { useState, useEffect } from 'react';
import { Product, PaymentMethod } from '../types';
import { X, Check, Info } from 'lucide-react';

interface ProductModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (p: Product) => void;
}

const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onAddToCart }) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(PaymentMethod.CASH_USD);
  const [dolarRate, setDolarRate] = useState<number | null>(null);

  useEffect(() => {
    // Fetch Dolar Blue from external API
    fetch('https://dolarapi.com/v1/dolares/blue')
      .then(res => res.json())
      .then(data => {
        if (data && data.venta) {
          setDolarRate(data.venta + 10); // Rule: Blue + 10
        }
      })
      .catch(err => console.error("Error fetching dollar rate", err));
  }, []);

  // Calculator Logic
  const calculateTotal = (baseUsd: number, method: PaymentMethod, rate: number | null): { total: number, currency: string, installment: number | null } => {
    const rateToUse = rate || 1200; // Fallback if API fails
    
    // Convert to ARS for non-USD methods
    const baseArs = baseUsd * rateToUse;

    switch (method) {
      case PaymentMethod.CASH_USD:
      case PaymentMethod.USDT:
        return { total: baseUsd, currency: 'USD', installment: null };
      
      case PaymentMethod.CASH_ARS:
        return { total: baseArs, currency: 'ARS', installment: null };
        
      case PaymentMethod.TRANSFER:
        return { total: baseArs * 1.05, currency: 'ARS', installment: null };

      // Credit Cards (Base is ARS value + surcharge)
      case PaymentMethod.CREDIT_1:
        return { total: baseArs * 1.19, currency: 'ARS', installment: (baseArs * 1.19) };
      case PaymentMethod.CREDIT_3:
        return { total: baseArs * 1.45, currency: 'ARS', installment: (baseArs * 1.45) / 3 };
      case PaymentMethod.CREDIT_6:
        return { total: baseArs * 1.70, currency: 'ARS', installment: (baseArs * 1.70) / 6 };
      case PaymentMethod.CREDIT_9:
        return { total: baseArs * 1.85, currency: 'ARS', installment: (baseArs * 1.85) / 9 };
      case PaymentMethod.CREDIT_12:
        return { total: baseArs * 2.10, currency: 'ARS', installment: (baseArs * 2.10) / 12 };
        
      default:
        return { total: baseUsd, currency: 'USD', installment: null };
    }
  };

  const { total, currency, installment } = calculateTotal(product.price, selectedPayment, dolarRate);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto flex flex-col md:flex-row relative shadow-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 z-10 transition-transform hover:scale-110"
        >
          <X className="w-6 h-6 text-gray-600" />
        </button>

        {/* Image Section */}
        <div className="w-full md:w-1/2 p-8 bg-gray-50 flex items-center justify-center">
          <img src={product.image} alt={product.name} className="max-h-80 object-contain drop-shadow-xl" />
        </div>

        {/* Info Section */}
        <div className="w-full md:w-1/2 p-8 flex flex-col">
          <span className="text-sm font-bold text-blue-600 uppercase tracking-wide mb-1">{product.category}</span>
          <h2 className="text-3xl font-bold mb-2 text-gray-800">{product.name}</h2>
          <p className="text-gray-500 mb-6 leading-relaxed">{product.description}</p>

          <div className="mb-6 bg-white rounded-xl">
            <h3 className="font-semibold mb-3 text-gray-700 flex items-center gap-2">
              <Info className="w-4 h-4" /> Calculadora de Pagos
            </h3>
            
            {/* Dollar Rate Badge */}
            <div className="mb-3 text-xs font-semibold text-green-600 bg-green-50 px-3 py-1 rounded-full inline-block">
              Cotización hoy: 1 USD = {dolarRate ? `$${dolarRate} ARS` : 'Cargando...'}
            </div>

            {/* High contrast select */}
            <select 
              value={selectedPayment}
              onChange={(e) => setSelectedPayment(e.target.value as PaymentMethod)}
              className="w-full p-3 border border-gray-300 rounded-xl mb-4 focus:ring-2 focus:ring-blue-500 bg-white text-gray-900 cursor-pointer shadow-sm"
            >
              {Object.values(PaymentMethod).map((method) => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>
            
            <div className="bg-blue-50 p-5 rounded-2xl border border-blue-100 shadow-inner">
              <div className="flex justify-between items-end">
                <span className="text-gray-600 font-medium">Precio Final:</span>
                <span className="text-3xl font-bold text-blue-700 tracking-tight">
                  {currency} {total.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                </span>
              </div>
              {installment && (
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-blue-200/60">
                  <span className="text-sm font-medium text-blue-800">Valor de cuota:</span>
                  <span className="text-lg font-bold text-blue-800">
                    {currency} {installment.toLocaleString('es-AR', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              )}
            </div>
            
            <div className="mt-4 text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-100 leading-snug">
              <strong>Importante:</strong> Billetes "cara chica", manchados o rotos tienen un 5% de recargo. 
              Billetes de denominación menor a USD 90 pagan 5% extra si el monto supera los USD 90.
            </div>
          </div>

          <div className="mt-auto">
            <button 
              onClick={() => { onAddToCart(product); onClose(); }}
              className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 transform active:scale-95"
            >
              Agregar al Carrito <Check className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;