import { Facebook, Instagram } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Sucursal Centro</h3>
            <p className="text-gray-400">Corrientes 1464</p>
            <p className="text-gray-400 mt-2">Lunes a Viernes de 10 a 19 hs.</p>
            <p className="text-gray-400">Sábados y feriados de 11 a 16 hs.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Sucursal Belgrano</h3>
            <p className="text-gray-400">Olazabal 1515</p>
            <p className="text-gray-400 mt-2">Lunes a Viernes de 11 a 20 hs.</p>
            <p className="text-gray-400">Sábados y feriados de 11 a 16 hs.</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Redes Sociales</h3>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/people/Locos-X-la-Tecnolog%C3%ADa" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="h-6 w-6" />
              </a>
              <a href="https://www.instagram.com/locosxlatecnologia.ok" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="h-6 w-6" />
              </a>
              <a href="https://www.tiktok.com/@locosxlatecnologi" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition-colors flex items-center justify-center">
                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/></svg>
              </a>
            </div>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} Locos x la Tecnología. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  );
}
