import React, { useState } from 'react';
import { Product } from '../types';
import { LayoutGrid, List, Search, Battery, ShieldCheck, Droplets, ChevronRight } from 'lucide-react';

interface ProductSectionProps {
  title: string;
  products: Product[];
  viewMode: 'grid' | 'list';
  onProductSelect: (p: Product) => void;
  isUsedSection?: boolean;
}

const ProductSection: React.FC<ProductSectionProps> = ({ title, products, viewMode, onProductSelect, isUsedSection }) => {
  if (products.length === 0) return null;

  const isListView = viewMode === 'list';

  return (
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-4 border-l-4 pl-3 ${isUsedSection ? 'text-orange-700 border-orange-500' : 'text-gray-800 border-blue-600'}`}>
        {title}
      </h3>
      
      <div className={`
        ${isListView 
          ? 'flex flex-col gap-2' // Compact gap for list view
          : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
        }
      `}>
        {products.map((product, index) => (
          <div 
            key={product.id}
            onClick={() => onProductSelect(product)}
            className={`
              glass cursor-pointer hover:shadow-lg transition-all duration-200 group relative bg-white
              ${isListView 
                ? 'flex flex-row items-center p-2 rounded-lg gap-3 border border-gray-100 hover:border-blue-300' // Compact List Layout
                : 'flex flex-col p-6 items-center text-center rounded-2xl' // Grid Layout
              }
              ${isUsedSection && !isListView ? 'border-2 border-orange-50 hover:border-orange-300' : ''}
              ${isUsedSection && isListView ? 'bg-orange-50/30' : ''}
            `}
            style={{ animationDelay: `${Math.min(index * 0.05, 1)}s` }}
          >
            {/* Badge for Used Items (Grid Only or Compact Badge in List) */}
            {isUsedSection && !isListView && (
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl rounded-tr-lg z-10">
                USADO
              </div>
            )}

            {/* Image Container */}
            <div className={`relative overflow-hidden bg-white flex items-center justify-center
              ${isListView 
                ? 'w-16 h-16 rounded-md flex-shrink-0 border border-gray-100' // Small square for list
                : 'w-full h-48 mb-4 rounded-xl'
              }
            `}>
              <img 
                src={product.image} 
                alt={product.name} 
                className="object-contain max-w-full max-h-full transition-transform group-hover:scale-110 duration-500"
              />
            </div>
            
            {/* Content Container */}
            <div className={`flex-1 min-w-0 ${isListView ? 'text-left' : 'text-center'}`}>
              
              {!isUsedSection && !isListView && (
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 block">{product.category}</span>
              )}
              
              <h3 className={`font-bold text-gray-800 group-hover:text-blue-600 transition-colors leading-tight truncate ${isListView ? 'text-base' : 'text-lg'}`}>
                {product.name}
              </h3>

              {/* Special Layout for Used Items */}
              {isUsedSection ? (
                <div className={`mt-1 ${isListView ? 'flex flex-wrap gap-2 items-center text-xs' : 'space-y-2'}`}>
                  {/* Condition / Description */}
                  {isListView ? (
                    <div className="flex items-center gap-2 text-gray-500 overflow-hidden">
                       {product.batteryHealth && (
                         <span className="flex items-center gap-1 bg-green-50 text-green-700 px-1.5 py-0.5 rounded border border-green-100 font-medium whitespace-nowrap">
                           <Battery className="w-3 h-3" /> {product.batteryHealth}
                         </span>
                       )}
                       <span className="truncate max-w-[150px] italic">"{product.description}"</span>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-500 font-medium italic border-l-2 border-orange-300 pl-3 mb-2">
                        "{product.description}"
                      </div>
                      <div className="flex flex-wrap gap-2 justify-center mt-2">
                        {product.batteryHealth && (
                          <div className="flex items-center gap-1.5 bg-green-50 text-green-800 px-2 py-1 rounded border border-green-100 text-xs shadow-sm">
                            <Battery className="w-3 h-3" /> 
                            <span className="font-semibold">{product.batteryHealth}</span>
                          </div>
                        )}
                         <div className="flex items-center gap-1.5 bg-blue-50 text-blue-800 px-2 py-1 rounded border border-blue-100 text-xs shadow-sm">
                          <ShieldCheck className="w-3 h-3" /> 
                          <span>{product.warranty}</span>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              ) : (
                <p className={`text-sm text-gray-500 mt-1 truncate ${isListView ? 'max-w-xs' : 'mb-4'}`}>{product.description}</p>
              )}
            </div>

            {/* Price & Action Container */}
            <div className={`
              ${isListView 
                ? 'flex flex-col items-end justify-center min-w-[80px] pl-2' 
                : 'w-full mt-4 pt-4 border-t border-gray-100 flex justify-between items-end'
              }
            `}>
               {!isListView && !isUsedSection && (
                  <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">{product.category}</span>
              )}
              
              <div className={`flex flex-col ${isListView ? 'items-end' : 'items-end ml-auto'}`}>
                <div className={`${isListView ? 'text-lg' : 'text-3xl'} font-black text-blue-600 leading-none tracking-tight`}>
                  ${product.price}
                </div>
                {isListView ? (
                   <span className="text-[9px] text-gray-400 font-bold uppercase">USD</span>
                ) : (
                   <div className="text-[10px] text-gray-400 font-bold mb-2 uppercase tracking-wide">Precio USD</div>
                )}
              </div>
              
              {!isListView && (
                <button className="mt-1 text-xs font-bold text-blue-600 hover:underline">
                  Ver Detalles
                </button>
              )}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
};

interface ProductListProps {
  products: Product[];
  onProductSelect: (p: Product) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onProductSelect }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchTerm, setSearchTerm] = useState('');
  
  const SECTIONS = ['iPhone', 'Samsung', 'Xiaomi', 'Gaming', 'MacBook', 'iPad', 'Watch'];
  
  const lowerSearch = searchTerm.toLowerCase();
  const hasSearch = lowerSearch.length > 0;

  const getFilteredProducts = (category?: string) => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(lowerSearch) || 
                            p.description.toLowerCase().includes(lowerSearch);
      
      if (!matchesSearch) return false;
      if (!category) return true;

      if (SECTIONS.includes(category)) return p.category === category;
      if (category === 'Usados') return p.category === 'Usados';
      
      if (category === 'Otros') {
         return !SECTIONS.includes(p.category) && p.category !== 'Laptops' && p.category !== 'Usados'; 
      }
      if (category === 'Laptops') return p.category === 'Laptops';
      
      return false;
    });
  };

  const usedProducts = getFilteredProducts('Usados');

  return (
    <div className="w-full">
      {/* Search and View Controls */}
      <div className="glass p-4 rounded-xl mb-6 sticky top-20 z-30 backdrop-blur-md shadow-sm border border-white/40">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-800 tracking-tight hidden md:block">Catálogo</h2>
          
          <div className="flex flex-row items-center gap-2 w-full md:w-auto">
            <div className="relative w-full md:w-80 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4 group-focus-within:text-blue-600 transition-colors" />
              {/* Increased contrast here: bg-white, text-gray-900 */}
              <input 
                type="text" 
                placeholder="Buscar (ej: iPhone, PS5)..." 
                className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-500 text-sm shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex bg-gray-100 p-1 rounded-lg shrink-0">
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <List className="w-4 h-4" />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center justify-center w-8 h-8 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-900'}`}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Render Sections */}
      {hasSearch ? (
        <ProductSection 
          title="Resultados de Búsqueda" 
          products={getFilteredProducts()} 
          viewMode={viewMode}
          onProductSelect={onProductSelect}
        />
      ) : (
        <>
          {/* Main Sections (excluding Usados) */}
          {SECTIONS.map(sec => (
            <ProductSection 
              key={sec} 
              title={sec} 
              products={getFilteredProducts(sec)} 
              viewMode={viewMode}
              onProductSelect={onProductSelect}
            />
          ))}
          
          <ProductSection 
            title="Notebooks & Laptops" 
            products={getFilteredProducts('Laptops')} 
            viewMode={viewMode}
            onProductSelect={onProductSelect}
          />
          
          <ProductSection 
            title="Accesorios y Audio" 
            products={getFilteredProducts('Otros')} 
            viewMode={viewMode}
            onProductSelect={onProductSelect}
          />

          {/* Used Items moved to bottom */}
          {usedProducts.length > 0 && (
            <div id="used-section" className="mt-8 bg-gradient-to-br from-orange-50 to-white p-2 sm:p-6 rounded-3xl border border-orange-100 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-200 rounded-full blur-[100px] opacity-20 pointer-events-none"></div>
              <ProductSection 
                title="Equipos Usados Seleccionados" 
                products={usedProducts} 
                viewMode={viewMode}
                onProductSelect={onProductSelect}
                isUsedSection={true}
              />
            </div>
          )}
        </>
      )}

      {hasSearch && getFilteredProducts().length === 0 && (
         <div className="flex flex-col items-center justify-center py-20 text-gray-400 bg-white/30 rounded-3xl mt-4">
          <Search className="w-12 h-12 mb-4 opacity-20" />
          <p className="text-lg">No se encontraron productos.</p>
          <button onClick={() => setSearchTerm('')} className="mt-2 text-blue-600 font-bold hover:underline">
            Limpiar Búsqueda
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductList;