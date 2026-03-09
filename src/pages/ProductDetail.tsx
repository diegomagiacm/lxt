import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ShoppingCart, MessageCircle, AlertTriangle } from 'lucide-react';
import { useStore } from '../store/useStore';
import { formatPrice, formatARS } from '../lib/utils';

export function ProductDetail() {
  const { id } = useParams();
  const { dolarBlue, addToCart, user } = useStore();
  const [product, setProduct] = useState<any>(null);

  // Mock fetching product
  useEffect(() => {
    // In a real app, fetch from Supabase
    setProduct({
      id: id || '1',
      name: 'iPhone 15 Pro Max 256GB',
      price: 1200,
      image: 'https://picsum.photos/seed/iphone15/800/800',
      description: 'El iPhone más avanzado hasta la fecha. Chip A17 Pro, diseño de titanio y cámara de 48MP.',
    });
  }, [id]);

  if (!product) return <div className="p-20 text-center">Cargando...</div>;

  const arsRate = dolarBlue + 10;
  const priceArs = product.price * arsRate;

  const paymentMethods = [
    { name: 'Efectivo USD', value: formatPrice(product.price) },
    { name: 'Efectivo ARS', value: formatARS(priceArs) },
    { name: 'Transferencia USD (+5%)', value: formatPrice(product.price * 1.05) },
    { name: 'Transferencia ARS (+5%)', value: formatARS(priceArs * 1.05) },
    { name: 'USDT', value: `${product.price} USDT` },
  ];

  const creditCardMethods = [
    { name: '1 cuota (+19%)', value: formatARS(priceArs * 1.19) },
    { name: '3 cuotas (+45%)', value: formatARS(priceArs * 1.45) },
    { name: '6 cuotas (+70%)', value: formatARS(priceArs * 1.70) },
    { name: '9 cuotas (+85%)', value: formatARS(priceArs * 1.85) },
    { name: '12 cuotas (+110%)', value: formatARS(priceArs * 2.10) },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex flex-col md:flex-row gap-12">
        {/* Image */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-1/2"
        >
          <div className="bg-gray-100 rounded-3xl overflow-hidden shadow-sm">
            <img src={product.image} alt={product.name} className="w-full h-auto object-cover" />
          </div>
        </motion.div>

        {/* Details */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="md:w-1/2 flex flex-col"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">{formatPrice(product.price)}</p>
          <p className="text-gray-600 mb-8 text-lg">{product.description}</p>

          <div className="flex flex-col sm:flex-row gap-4 mb-12">
            {user ? (
              <button
                onClick={() => addToCart({ ...product, quantity: 1 })}
                className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-5 h-5 mr-2" />
                Agregar al Carrito
              </button>
            ) : (
              <button
                onClick={() => alert('Debes iniciar sesión para reservar.')}
                className="flex-1 bg-gray-900 text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-colors flex items-center justify-center"
              >
                Iniciar Sesión para Reservar
              </button>
            )}
            <a
              href={`https://wa.me/5491160423000?text=Hola!%20Quiero%20consultar%20por%20el%20${encodeURIComponent(product.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 bg-green-500 text-white px-8 py-4 rounded-full font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Consultar
            </a>
          </div>

          {/* Payment Methods */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h2 className="text-2xl font-semibold mb-6">Formas de Pago</h2>
            <p className="text-sm text-gray-500 mb-6">Tipo de cambio tomado: Dólar Blue Venta + $10 ({formatARS(arsRate)})</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Contado / Transferencia</h3>
                <ul className="space-y-2">
                  {paymentMethods.map((method) => (
                    <li key={method.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">{method.name}</span>
                      <span className="font-medium text-gray-900">{method.value}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="font-medium text-gray-900 mb-3 border-b pb-2">Tarjetas de Crédito (ARS)</h3>
                <ul className="space-y-2">
                  {creditCardMethods.map((method) => (
                    <li key={method.name} className="flex justify-between text-sm">
                      <span className="text-gray-600">{method.name}</span>
                      <span className="font-medium text-gray-900">{method.value}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Aclaraciones importantes:</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Dólares cara chica, manchados, con sello, rotos o deteriorados se tomarán un 5% menos.</li>
                  <li>Billetes de baja denominación (hasta USD 90): Pasado este monto, se abona 5% extra.</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
