import React, { useState, useEffect } from 'react';
import { Product } from '../types';
import { ShoppingBag, CreditCard, Truck } from 'lucide-react';

interface HeroProps {
  products: Product[];
}

const Hero: React.FC<HeroProps> = ({ products }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Define preferred hero items by ID
  const preferredIds = [
    { id: 'ip16promax-256', bg: 'bg-gradient-to-br from-gray-900 to-gray-800' },
    { id: 'ps5-pro', bg: 'bg-gradient-to-br from-blue-700 to-blue-900' },
    { id: 'jbl-pb710', bg: 'bg-gradient-to-br from-orange-500 to-red-600' },
    { id: 'mac-pro-m3pro-14', bg: 'bg-gradient-to-br from-gray-200 to-gray-400', textDark: true },
    { id: 'sw2', bg: 'bg-gradient-to-br from-red-600 to-red-800' },
  ];

  // Map products to hero configuration
  let heroItems = preferredIds.map(pref => {
    const product = products.find(p => p.id === pref.id);
    return product ? { ...product, bg: pref.bg, textDark: (pref as any).textDark } : null;
  }).filter((item): item is (Product & { bg: string; textDark?: boolean }) => item !== null);

  // Fallback
  if (heroItems.length === 0 && products.length > 0) {
    const bgColors = [
      'bg-gradient-to-br from-gray-900 to-gray-800',
      'bg-gradient-to-br from-blue-700 to-blue-900',
      'bg-gradient-to-br from-orange-500 to-red-600',
      'bg-gradient-to-br from-gray-200 to-gray-400',
      'bg-gradient-to-br from-purple-700 to-purple-900'
    ];
    heroItems = products.slice(0, 5).map((p, index) => ({
      ...p,
      bg: bgColors[index % bgColors.length],
      textDark: index === 3
    }));
  }

  useEffect(() => {
    if (heroItems.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroItems.length);
    }, 15000); 

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
            Destacado del Mes
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

        {/* Image Section with Frame */}
        <div className="relative h-[450px] md:h-[550px] flex items-center justify-center animate-float px-4">
          
          {/* Main Frame/Recuadro */}
          <div className={`absolute inset-0 m-auto w-[90%] h-[90%] md:w-[80%] md:h-[80%] rounded-[2.5rem] transform rotate-3 
            ${isTextDark ? 'bg-white/40 border-white/50' : 'bg-white/10 border-white/20'} 
            backdrop-blur-xl border-2 shadow-2xl z-0`}>
          </div>
          
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

      {/* Circular Banners - Lowered Position */}
      <div key={currentIndex} className="absolute top-[60%] right-4 md:right-12 flex flex-col gap-5 pointer-events-none z-50">
        
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