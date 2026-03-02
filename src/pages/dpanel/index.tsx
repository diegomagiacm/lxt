import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Login from './Login';
import SellerDashboard from './SellerDashboard';
import AdminDashboard from './AdminDashboard';
import { User } from '../../../types';
import { changePassword } from '../../services/auth';
import { LogOut, LayoutDashboard, Key, X } from 'lucide-react';

const DashboardLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  
  console.log('DashboardLayout rendered, user:', user?.username);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Check session on mount
    const storedUser = localStorage.getItem('dpanel_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      if (location.pathname === '/dpanel' || location.pathname === '/dpanel/') {
        navigate('/dpanel/dashboard');
      }
    } else {
      if (location.pathname !== '/dpanel') {
        navigate('/dpanel');
      }
    }
  }, [navigate, location.pathname]);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    localStorage.setItem('dpanel_user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('dpanel_user');
    navigate('/dpanel');
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ text: 'Las contraseñas no coinciden', type: 'error' });
      return;
    }

    if (newPassword.length < 4) {
      setPasswordMessage({ text: 'La contraseña es muy corta', type: 'error' });
      return;
    }

    const { success, error } = await changePassword(user.username, newPassword);
    
    if (success) {
      setPasswordMessage({ text: 'Contraseña actualizada correctamente', type: 'success' });
      setTimeout(() => {
        setIsPasswordModalOpen(false);
        setPasswordMessage(null);
        setNewPassword('');
        setConfirmPassword('');
      }, 1500);
    } else {
      setPasswordMessage({ text: error || 'Error al actualizar', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex justify-between items-center max-w-7xl mx-auto">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <LayoutDashboard className="text-white w-5 h-5" />
              </div>
              <div>
                <h1 className="font-bold text-gray-800">Panel de Control</h1>
                <p className="text-xs text-gray-500">Hola, {user.username} ({user.role})</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="flex items-center text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium"
              >
                <Key className="w-4 h-4 mr-2" />
                Cambiar Clave
              </button>
              <button 
                onClick={handleLogout}
                className="flex items-center text-gray-500 hover:text-red-600 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Salir
              </button>
            </div>
          </div>
        </nav>
      )}

      <div className="max-w-7xl mx-auto p-6">
        <Routes>
          <Route index element={<Login onLogin={handleLogin} />} />
          <Route path="/dashboard" element={
            user ? (
              user.role === 'admin' ? <AdminDashboard /> : <SellerDashboard user={user} />
            ) : (
              <div className="text-center mt-10">Redirigiendo...</div>
            )
          } />
          <Route path="*" element={<Login onLogin={handleLogin} />} />
        </Routes>
      </div>

      {/* Change Password Modal */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm relative">
            <button 
              onClick={() => setIsPasswordModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
            
            <h3 className="text-xl font-bold mb-4">Cambiar Contraseña</h3>
            
            {passwordMessage && (
              <div className={`mb-4 p-3 rounded-lg text-sm text-center ${passwordMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                {passwordMessage.text}
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nueva Contraseña</label>
                <input 
                  type="password" 
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  required
                />
              </div>
              <button 
                type="submit"
                className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Actualizar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardLayout;
