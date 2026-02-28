import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';
import { fallbackImg } from '../constants';

interface HeroProps {
  products: Product[];
}

const Hero: React.FC<HeroProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [heroItems, setHeroItems] = useState<(Product & { bg: string; shadow: string; textDark?: boolean })[]>([]);

  const bgConfigs = [
    { bg: 'bg-gradient-to-br from-gray-900 to-gray-800', shadow: 'shadow-[0_0_15px_rgba(255,255,255,0.5)]' },
    { bg: 'bg-gradient-to-br from-blue-700 to-blue-900', shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.8)]' },
    { bg: 'bg-gradient-to-br from-orange-500 to-red-600', shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.8)]' },
    { bg: 'bg-gradient-to-br from-gray-200 to-gray-400', shadow: 'shadow-[0_0_15px_rgba(156,163,175,0.8)]' },
    { bg: 'bg-gradient-to-br from-purple-700 to-purple-900', shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.8)]' },
    { bg: 'bg-gradient-to-br from-emerald-600 to-teal-800', shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.8)]' },
    { bg: 'bg-gradient-to-br from-indigo-600 to-blue-800', shadow: 'shadow-[0_0_15px_rgba(99,102,241,0.8)]' },
    { bg: 'bg-gradient-to-br from-rose-600 to-pink-800', shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.8)]' },
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
      // Filter out products with no image or using the fallback logo
      const productsWithImages = products.filter(p => 
        p.image && 
        p.image.trim() !== '' && 
        p.image !== fallbackImg &&
        !p.image.includes('lxtlogo.png') // Extra safety check
      );
      
      const shuffled = shuffleArray(productsWithImages).slice(0, 5);
      const items = shuffled.map((p, index) => {
         // Pick a random gradient config
         const config = bgConfigs[Math.floor(Math.random() * bgConfigs.length)];
         const isLightBg = config.bg.includes('gray-200');
         return { ...p, bg: config.bg, shadow: config.shadow, textDark: isLightBg };
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
    <section className={`relative w-full pt-20 md:pt-24 pb-8 md:pb-12 overflow-hidden min-h-[400px] md:min-h-[650px] flex items-center transition-colors duration-1000 ease-in-out ${currentItem.bg}`}>
      
      <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>

      <div className="container mx-auto px-2 md:px-4 grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-8 items-center relative z-10">
        
        {/* Text Section - 1/4 width on desktop */}
        <div className={`flex flex-col items-start text-left space-y-2 md:space-y-6 animate-fade-in-up md:col-span-1 ${isTextDark ? 'text-gray-900' : 'text-white'}`}>
          <span className={`inline-block px-3 md:px-5 py-1 md:py-1.5 rounded-full border border-current text-[10px] md:text-sm font-bold tracking-widest uppercase ${currentItem.shadow} backdrop-blur-sm`}>
            Destacado
          </span>
          <h1 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
            {currentItem.name}
          </h1>
          <p className={`text-xs sm:text-sm md:text-lg opacity-90 font-medium line-clamp-3 md:line-clamp-none`}>
            {currentItem.description}
          </p>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl md:text-4xl font-bold">USD {currentItem.price}</span>
          </div>
          
          <a 
            href={`https://wa.me/5491160423000?text=${encodeURIComponent(`Hola! Me interesa reservar el producto: ${currentItem.name}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`mt-2 md:mt-4 px-4 py-2 md:px-6 md:py-3 rounded-full font-bold text-xs md:text-base shadow-lg transform transition hover:scale-105 flex items-center gap-1 md:gap-2 whitespace-nowrap ${isTextDark ? 'bg-gray-900 text-white hover:bg-black' : 'bg-white text-gray-900 hover:bg-gray-100'}`}
          >
            <ShoppingBag className="w-3 h-3 md:w-4 md:h-4" />
            Reservar Ahora!
          </a>
        </div>

        {/* Image Section - 3/4 width on desktop */}
        <div className="relative h-[250px] sm:h-[350px] md:h-[600px] lg:h-[700px] flex items-center justify-center animate-float px-1 md:px-4 md:col-span-3">
          
          {/* Inner Glow */}
          <div className={`absolute w-32 h-32 md:w-[500px] md:h-[500px] rounded-full filter blur-3xl opacity-40 z-0 ${isTextDark ? 'bg-white' : 'bg-blue-400'}`}></div>
          
          <img 
            key={currentItem.id}
            src={currentItem.image} 
            alt={currentItem.name} 
            className="relative z-10 max-h-[95%] w-auto object-contain drop-shadow-2xl animate-scale-in"
          />
        </div>
      </div>

      {/* Circular Banners - High Z-Index but below Navbar (Navbar is z-[100]) */}
      <div key={currentIndex} className="absolute top-[50%] md:top-[60%] right-1 md:right-12 flex flex-col gap-2 md:gap-5 pointer-events-none z-[90]">
        
        {/* Banner 1: Cuotas */}
        <div className="w-16 h-16 md:w-32 md:h-32 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 md:border-4 border-orange-100 flex flex-col items-center justify-center text-center p-1 md:p-2 animate-bounce-in" style={{ animationDelay: '0.2s' }}>
          <CreditCard className="w-3 h-3 md:w-6 md:h-6 text-orange-600 mb-0.5 md:mb-1" />
          <span className="text-[8px] md:text-xs font-bold text-gray-800 leading-tight uppercase tracking-tight">Hasta<br/><span className="text-sm md:text-2xl font-black text-orange-600">12</span><br/>Cuotas</span>
        </div>

        {/* Banner 2: Envíos */}
        <div className="w-16 h-16 md:w-32 md:h-32 bg-white/95 backdrop-blur-xl rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.12)] border-2 md:border-4 border-green-100 flex flex-col items-center justify-center text-center p-1 md:p-2 animate-bounce-in" style={{ animationDelay: '0.4s' }}>
          <Truck className="w-3 h-3 md:w-6 md:h-6 text-green-600 mb-0.5 md:mb-1" />
          <span className="text-[8px] md:text-xs font-bold text-gray-800 leading-tight uppercase tracking-tight">Envíos<br/>a todo<br/>el País</span>
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