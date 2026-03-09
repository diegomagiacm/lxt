import { useState, useEffect, FormEvent } from 'react';
import { supabase } from '../lib/supabase';
import { useStore } from '../store/useStore';
import { LayoutDashboard, Package, Database, Users, Settings, LogOut, FileText } from 'lucide-react';

export function DPanel() {
  const { user, profile, setProfile } = useStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  useEffect(() => {
    if (user && !profile) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (data) {
      setProfile(data);
    } else {
      // Mock profile if not found
      setProfile({ id: user.id, role: 'admin', username: user.email?.split('@')[0] });
    }
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl shadow-sm border border-gray-100">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Acceso a DPanel
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Gestión de CMS y Ventas
            </p>
          </div>
          <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && <div className="text-red-500 text-sm text-center">{error}</div>}
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <input
                  type="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <input
                  type="password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                {loading ? 'Ingresando...' : 'Iniciar Sesión'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">DPanel</h2>
          <p className="text-sm text-gray-500 mt-1">{profile?.username || user.email}</p>
          <span className="inline-block mt-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full uppercase">
            {profile?.role || 'user'}
          </span>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'dashboard' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <LayoutDashboard className="w-5 h-5 mr-3" /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab('agendas')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'agendas' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <FileText className="w-5 h-5 mr-3" /> Ventas / Agendas
          </button>
          <button
            onClick={() => setActiveTab('stock')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'stock' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Database className="w-5 h-5 mr-3" /> Stock
          </button>
          
          {isAdmin && (
            <>
              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'products' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Package className="w-5 h-5 mr-3" /> Productos
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'users' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
              >
                <Users className="w-5 h-5 mr-3" /> Usuarios
              </button>
            </>
          )}
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-colors ${activeTab === 'settings' ? 'bg-gray-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
          >
            <Settings className="w-5 h-5 mr-3" /> Mi Perfil
          </button>
        </nav>
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut className="w-5 h-5 mr-3" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Ventas del Mes</h3>
                <p className="text-3xl font-bold text-gray-900">24</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Ingresos Estimados</h3>
                <p className="text-3xl font-bold text-gray-900">$12,450</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="text-gray-500 text-sm font-medium mb-2">Órdenes Pendientes</h3>
                <p className="text-3xl font-bold text-gray-900">5</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agendas' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Ventas / Agendas</h1>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                Nueva Orden
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center text-gray-500">
                Módulo de ventas en construcción. Aquí podrás cargar y ver las órdenes.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stock' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Consulta de Stock</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center text-gray-500">
                Módulo de stock en construcción. Aquí podrás ver la disponibilidad en warehouses.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && isAdmin && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900">Bulk Edit: Productos</h1>
              <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                Guardar Cambios
              </button>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center text-gray-500">
                Editor masivo de productos en construcción.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'users' && isAdmin && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Gestión de Usuarios</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-8 text-center text-gray-500">
                Módulo de usuarios en construcción.
              </div>
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Mi Perfil</h1>
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 max-w-2xl">
              <form className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Usuario</label>
                  <input type="text" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" defaultValue={profile?.username} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nueva Contraseña</label>
                  <input type="password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Dejar en blanco para no cambiar" />
                </div>
                <button type="button" className="bg-gray-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-gray-800">
                  Actualizar Perfil
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

