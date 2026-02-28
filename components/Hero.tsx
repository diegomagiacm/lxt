import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';

interface HeroProps {
  products: Product[];
}

const Hero: React.FC<HeroProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroItems, setHeroItems] = useState<(Product & { bg: string; textDark?: boolean })[]>([]);

  const bgGradients = [
    'bg-gradient-to-br from-gray-900 to-gray-800',
    'bg-gradient-to-br from-blue-700 to-blue-900',
    'bg-gradient-to-br from-orange-500 to-red-600',
    'bg-gradient-to-br from-gray-200 to-gray-400',
    'bg-gradient-to-br from-purple-700 to-purple-900',
    'bg-gradient-to-br from-emerald-600 to-teal-800',
    'bg-gradient-to-br from-indigo-600 to-blue-800',
    'bg-gradient-to-br from-rose-600 to-pink-800',
  ];

  // Helper to shuffle array
  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  useEffect(() => {
    if (products.length > 0) {
      const shuffled = shuffleArray(products).slice(0, 5);
      const items = shuffled.map((p, index) => {
         // Pick a random gradient, but try to keep it consistent for the same index if we wanted, 
         // but here we just pick random.
         const bg = bgGradients[Math.floor(Math.random() * bgGradients.length)];
         const isLightBg = bg.includes('gray-200');
         return { ...p, bg, textDark: isLightBg };
      });
      setHeroItems(items);
    }
  }, [products]);

  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 5000); // Faster rotation for random items

    return () => clearInterval(interval);
  }, [heroItems.length]);

  if (heroItems.length === 0) return null;

  const currentItem = heroItems[currentIndex];
  const isTextDark = currentItem.textDark;
  
  return (
    // Changed pt-24 to pt-20 to stick to navbar
    <section className={`relative w-full pt-20 pb-12 overflow-hidden min-h-[650px] flex items-center transition-colors duration-1000 ease-in-out ${currentItem.bg}`}>
      
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-8 items-center relative z-10">
        
        {/* Text Section */}
        <div className={`flex flex-col items-center md:items-start text-center md:text-left space-y-6 animate-fade-in-up ${isTextDark ? 'text-gray-900' : 'text-white'}`}>
          <span className="inline-block px-4 py-1 rounded-full border border-current text-sm font-bold tracking-widest uppercase opacity-80">
            Destacado
          </span>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
            {currentItem.name}
          </h1>
          <p className={`text-lg md:text-xl max-w-lg opacity-90 font-medium`}>
            {currentItem.description}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold">USD {currentItem.price}</span>
          </div>
          
          <button className={`mt-4 px-8 py-4 rounded-full font-bold text-lg shadow-lg transform transition hover:scale-105 flex items-center gap-2 ${isTextDark ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-900 hover:bg-gray-100'}`}>
            <ShoppingBag className="w-5 h-5" />
            Ver Producto
          </button>
        </div>

        {/* Image Section - Box Removed */}
        <div className="relative h-[450px] md:h-[550px] flex items-center justify-center animate-float px-4">
          
          {/* Inner Glow */}
          <div className={`absolute w-64 h-64 md:w-96 md:h-96 rounded-full filter blur-3xl opacity-40 z-0 ${isTextDark ? 'bg-white' : 'bg-blue-400'}`}></div>
          
          <img 
            key={currentItem.id}
            src={currentItem.image} 
            alt={currentItem.name} 
            className="relative z-10 max-h-[90%] w-auto object-contain drop-shadow-2xl animate-scale-in"
          />
        </div>
      </div>

      {/* Circular Banners - High Z-Index but below Navbar (Navbar is z-[100]) */}
      <div key={currentIndex} className="absolute top-[60%] right-4 md:right-12 flex flex-col gap-5 pointer-events-none z-[90]">
        
        {/* Banner 1: Cuotas */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-orange-100 flex flex-col items-center justify-center text-center p-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <CreditCard className="w-6 h-6 text-orange-600 mb-1" />
          <span className="text-xs font-bold text-gray-800 leading-tight uppercase tracking-tight">Hasta<br/><span className="text-2xl font-black text-orange-600">12</span><br/>Cuotas</span>
        </div>

        {/* Banner 2: Envíos */}
        <div className="w-24 h-24 md:w-32 md:h-32 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-4 border-green-100 flex flex-col items-center justify-center text-center p-2 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          <Truck className="w-6 h-6 text-green-600 mb-1" />
          <span className="text-xs font-bold text-gray-800 leading-tight uppercase tracking-tight">Envíos<br/>a todo<br/>el País</span>
        </div>

      </div>

      {/* Progress Indicators */}
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
        {heroItems.map((_, idx) => (
          <button 
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${idx === currentIndex ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/60'}`}
          />
        ))}
      </div>

    </section>
  );
};

export default Hero;