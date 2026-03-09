import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';

interface CategoryPageProps {
  title: string;
  heroProduct: {
    name: string;
    price: number;
    image: string;
    color: string;
  };
  category: string;
}

export function CategoryPage({ title, heroProduct, category }: CategoryPageProps) {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <motion.section 
        className={`relative h-[50vh] flex items-center justify-center overflow-hidden ${heroProduct.color}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between z-10">
          <div className="md:w-1/2 text-center md:text-left mb-8 md:mb-0">
            <motion.h1 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4"
            >
              {heroProduct.name}
            </motion.h1>
            <motion.p 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-2xl text-gray-700 mb-8"
            >
              Desde {formatPrice(heroProduct.price)}
            </motion.p>
            <motion.a
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              href={`https://wa.me/5491160423000?text=Hola!%20Quiero%20consultar%20por%20el%20${encodeURIComponent(heroProduct.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-green-500 hover:bg-green-600 transition-colors"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Consultar por WhatsApp
            </motion.a>
          </div>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="md:w-1/2 flex justify-center"
          >
            <img
              src={heroProduct.image}
              alt={heroProduct.name}
              className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-3xl shadow-2xl"
            />
          </motion.div>
        </div>
      </motion.section>

      {/* Products Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <h2 className="text-3xl font-bold text-gray-900 mb-8">Todos los modelos de {title}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {/* Placeholder for actual products from DB */}
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
              <div className="relative overflow-hidden bg-gray-100 w-full aspect-square">
                <img
                  src={`https://picsum.photos/seed/${category}${i}/400/400`}
                  alt={`Producto ${i}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Modelo {i}</h3>
                <p className="text-xl font-bold text-gray-900 mb-4">{formatPrice(800 + i * 100)}</p>
                <Link
                  to={`/product/${category}-${i}`}
                  className="mt-auto inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Ver Detalles
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
