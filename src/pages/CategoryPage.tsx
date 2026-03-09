import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { MessageCircle } from 'lucide-react';
import { formatPrice } from '../lib/utils';
import { supabase } from '../lib/supabase';

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
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category); // Assuming 'category' column exists
      
      if (error || !data || data.length === 0) {
        console.warn(`No products found for category ${category}. Using fallback data.`, error);
        // Fallback data if DB is empty
        setProducts([
          { id: `${category}-1`, name: `${title} Model 1`, price: 800, image_url: `https://picsum.photos/seed/${category}1/400/400` },
          { id: `${category}-2`, name: `${title} Model 2`, price: 900, image_url: `https://picsum.photos/seed/${category}2/400/400` },
          { id: `${category}-3`, name: `${title} Model 3`, price: 1000, image_url: `https://picsum.photos/seed/${category}3/400/400` },
          { id: `${category}-4`, name: `${title} Model 4`, price: 1100, image_url: `https://picsum.photos/seed/${category}4/400/400` },
        ]);
      } else {
        setProducts(data);
      }
      setLoading(false);
    };

    fetchProducts();
  }, [category, title]);

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
        
        {loading ? (
          <div className="text-center py-12">Cargando productos...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden group">
                <div className="relative overflow-hidden bg-gray-100 w-full aspect-square">
                  <img
                    src={product.image_url || `https://picsum.photos/seed/${product.id}/400/400`}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6 flex flex-col flex-grow">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                  <p className="text-xl font-bold text-gray-900 mb-4">{formatPrice(product.price)}</p>
                  <Link
                    to={`/product/${product.id}`}
                    className="mt-auto inline-flex items-center justify-center w-full px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-full text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
