import React from 'react';
import { Facebook, Instagram, MapPin, Clock, Video } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          
          {/* Brand & Socials */}
          <div className="space-y-6">
            <h3 className="text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-blue-200">
              LOCOS X LA TECNOLOGÍA
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs">
              Tu destino número uno para la mejor tecnología al mejor precio. Equipos nuevos y usados seleccionados con garantía.
            </p>
            <div className="flex gap-4">
              <a href="https://www.instagram.com/locosxlatecnologia.ok" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-pink-600 transition-colors group">
                <Instagram className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.facebook.com/people/Locos-X-la-Tecnolog%C3%ADa" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-blue-600 transition-colors group">
                <Facebook className="w-5 h-5 text-white" />
              </a>
              <a href="https://www.tiktok.com/@locosxlatecnologi" target="_blank" rel="noopener noreferrer" className="bg-gray-800 p-3 rounded-full hover:bg-black hover:border hover:border-white transition-colors group">
                {/* Lucide doesn't have TikTok, using Video icon as placeholder or custom SVG */}
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-white">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Location 1: Centro */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold flex items-center gap-2 text-blue-400">
              <MapPin className="w-5 h-5" /> Centro
            </h4>
            <div className="text-gray-300 text-sm space-y-2">
              <p className="font-semibold text-white">Corrientes 1464</p>
              <div className="flex gap-2 items-start text-gray-400">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p>Lun a Vie: 10 a 19 hs</p>
                  <p>Sáb y Fer: 11 a 16 hs</p>
                </div>
              </div>
            </div>
          </div>

          {/* Location 2: Belgrano */}
          <div className="space-y-4">
            <h4 className="text-lg font-bold flex items-center gap-2 text-blue-400">
              <MapPin className="w-5 h-5" /> Belgrano
            </h4>
            <div className="text-gray-300 text-sm space-y-2">
              <p className="font-semibold text-white">Olazabal 1515</p>
              <div className="flex gap-2 items-start text-gray-400">
                <Clock className="w-4 h-4 mt-0.5 shrink-0" />
                <div>
                  <p>Lun a Vie: 11 a 20 hs</p>
                  <p>Sáb y Fer: 11 a 16 hs</p>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Copyright */}
        <div className="pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
          <p>© {new Date().getFullYear()} Locos x la Tecnología. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;