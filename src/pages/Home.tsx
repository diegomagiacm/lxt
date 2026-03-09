import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Grid, List } from 'lucide-react';
import { cn, formatPrice } from '../lib/utils';

const banners = [
  "Envíos al todo el país",
  "Hasta 12 cuotas con tarjeta de crédito",
  "El precio más bajo todos los días",
  "Reservalo Ahora!"
];

const mockProducts = [
  { id: '1', name: 'iPhone 15 Pro Max', price: 1200, category: 'iphone', image: 'https://picsum.photos/seed/iphone15/400/400', color: 'bg-blue-100' },
  { id: '2', name: 'Samsung Galaxy S24 Ultra', price: 1100, category: 'samsung', image: 'https://picsum.photos/seed/s24/400/400', color: 'bg-purple-100' },
  { id: '3', name: 'PlayStation 5', price: 500, category: 'gaming', image: 'https://picsum.photos/seed/ps5/400/400', color: 'bg-indigo-100' },
  { id: '4', name: 'Xiaomi 14 Pro', price: 800, category: 'xiaomi', image: 'https://picsum.photos/seed/xiaomi14/400/400', color: 'bg-orange-100' },
  { id: '5', name: 'MacBook Pro M3', price: 2000, category: 'mac', image: 'https://picsum.photos/seed/macbook/400/400', color: 'bg-gray-200' },
];

export function Home() {
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setCurrentBannerIndex((prev) => (prev + 1) % banners.length);
    }, 3000);
    return () => clearInterval(bannerInterval);
  }, []);

  useEffect(() => {
    const heroInterval = setInterval(() => {
      setCurrentHeroIndex((prev) => (prev + 1) % mockProducts.length);
    }, 5000);
    return () => clearInterval(heroInterval);
  }, []);

  const currentHeroProduct = mockProducts[currentHeroIndex];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Animated Banner */}
      <div className="bg-gray-900 text-white overflow-hidden py-2">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBannerIndex}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center text-sm font-medium tracking-wide uppercase"
          >
            {banners[currentBannerIndex]}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Section */}
      <motion.section 
        className={cn("relative h-[60vh] flex items-center justify-center overflow-hidden transition-colors duration-1000", currentHeroProduct.color)}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col md:flex-row items-center justify-between z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroProduct.id + '-text'}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 50, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 text-center md:text-left mb-8 md:mb-0"
            >
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-4">
                {currentHeroProduct.name}
              </h1>
              <p className="text-2xl text-gray-700 mb-8">
                Desde {formatPrice(currentHeroProduct.price)}
              </p>
              <Link
                to={`/product/${currentHeroProduct.id}`}
                className="inline-flex items-center px-8 py-4 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors"
              >
                Ver Producto
              </Link>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentHeroProduct.id + '-img'}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.2, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="md:w-1/2 flex justify-center"
            >
              <img
                src={currentHeroProduct.image}
                alt={currentHeroProduct.name}
                className="w-64 h-64 md:w-96 md:h-96 object-cover rounded-3xl shadow-2xl"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        
        {/* Parallax background elements */}
        <motion.div 
          className="absolute inset-0 z-0 opacity-30"
          style={{ backgroundImage: 'radial-gradient(circle at center, white 0%, transparent 70%)' }}
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.section>

      {/* Catalog Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Catálogo</h2>
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={cn("p-2 rounded-md transition-colors", viewMode === 'grid' ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-2 rounded-md transition-colors", viewMode === 'list' ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-900")}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className={cn(
          "grid gap-8",
          viewMode === 'grid' ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid-cols-1"
        )}>
          {mockProducts.map((product, index) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className={cn(
                "bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group",
                viewMode === 'list' && "flex flex-row items-center"
              )}
            >
              <div className={cn("relative overflow-hidden bg-gray-100", viewMode === 'list' ? "w-48 h-48 flex-shrink-0" : "w-full aspect-square")}>
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className={cn("p-6 flex flex-col flex-grow", viewMode === 'list' && "justify-center")}>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-xl font-bold text-gray-900 mb-4">{formatPrice(product.price)}</p>
                <Link
                  to={`/product/${product.id}`}
                  className="mt-auto inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Ver Detalles
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
