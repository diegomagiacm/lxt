import { motion } from 'motion/react';
import { MessageCircle, RefreshCw } from 'lucide-react';

export function PlanCanje() {
  return (
    <div className="min-h-screen bg-white py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <RefreshCw className="w-20 h-20 mx-auto text-blue-500 mb-8" />
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Plan Canje iPhone</h1>
          <p className="text-xl text-gray-600 mb-12">
            Traé tu iPhone usado y llevalo como parte de pago para tu nuevo equipo. 
            Cotizamos tu equipo en el acto y te llevás el nuevo en el momento.
          </p>

          <div className="bg-gray-50 rounded-3xl p-8 mb-12 shadow-sm border border-gray-100 text-left">
            <h2 className="text-2xl font-semibold mb-6 text-center">¿Cómo funciona?</h2>
            <ul className="space-y-4 text-lg text-gray-700">
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">1</span>
                <p>Contactanos por WhatsApp indicando el modelo, capacidad y estado de tu batería.</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">2</span>
                <p>Te damos una cotización aproximada en el momento.</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">3</span>
                <p>Acercate a cualquiera de nuestras sucursales para la revisión final.</p>
              </li>
              <li className="flex items-start">
                <span className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-4 flex-shrink-0">4</span>
                <p>¡Llevate tu nuevo iPhone pagando solo la diferencia!</p>
              </li>
            </ul>
          </div>

          <a
            href="https://wa.me/5491160423000?text=Hola!%20Quiero%20consultar%20por%20el%20Plan%20Canje%20de%20iPhone"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-8 py-4 border border-transparent text-lg font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-6 h-6 mr-2" />
            Consultar Cotización por WhatsApp
          </a>
        </motion.div>
      </div>
    </div>
  );
}
