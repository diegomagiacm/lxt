import React, { useState } from 'react';
import { INITIAL_USERS } from '../constants';
import { User } from '../types';
import { supabase } from '../supabaseClient'; // Included for structure, even if mocking here

const AdminPanel: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  
  // Simulated database state for the session
  const [usersData, setUsersData] = useState<User[]>(INITIAL_USERS);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = usersData.find(u => u.username === username && u.code === password);
    if (found) {
      setUser(found);
    } else {
      alert("Usuario o clave incorrectos");
    }
  };

  const calculateCommission = (u: User) => {
    let commission = 0;
    
    // Sales Logic
    if (u.salesCount > 20) {
      commission += 10; // Base for passing 20
      const remainder = u.salesCount - 20;
      if (remainder > 0) {
        commission += Math.floor(remainder / 10) * 5;
      }
    }

    // Extra Hours Logic
    commission += u.extraHours * 5;

    return commission;
  };

  const updateSales = (targetUser: string, increment: number) => {
    setUsersData(prev => prev.map(u => {
      if (u.username === targetUser) {
        return { ...u, salesCount: Math.max(0, u.salesCount + increment) };
      }
      return u;
    }));
  };
  
  const updateHours = (targetUser: string, increment: number) => {
    setUsersData(prev => prev.map(u => {
      if (u.username === targetUser) {
        return { ...u, extraHours: Math.max(0, u.extraHours + increment) };
      }
      return u;
    }));
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-lg w-96">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">LXT Panel</h2>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2">Usuario</label>
            <input className="w-full border p-2 rounded" value={username} onChange={e => setUsername(e.target.value)} />
          </div>
          <div className="mb-6">
            <label className="block text-sm font-bold mb-2">Código</label>
            <input type="password" className="w-full border p-2 rounded" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          <button className="w-full bg-blue-600 text-white p-2 rounded font-bold">Ingresar</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Panel de Control: {user.username}</h1>
          <button onClick={() => setUser(null)} className="text-red-600 font-bold hover:underline">Cerrar Sesión</button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Stats Card */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h3 className="text-xl font-bold mb-4">Mis Estadísticas</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-gray-500">Ventas Totales</p>
                <p className="text-3xl font-bold text-blue-600">{usersData.find(u => u.username === user.username)?.salesCount}</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-gray-500">Comisión Actual</p>
                <p className="text-3xl font-bold text-green-600">USD {calculateCommission(usersData.find(u => u.username === user.username)!)}</p>
              </div>
            </div>
            
            {/* Quick Action: Register Sale */}
            <button 
              onClick={() => updateSales(user.username, 1)}
              className="w-full mt-4 bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700"
            >
              + Registrar Nueva Venta
            </button>
          </div>

          {/* Admin Controls */}
          {user.role === 'admin' && (
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h3 className="text-xl font-bold mb-4">Gestión de Equipo (Admin)</h3>
              <div className="space-y-4">
                {usersData.map(u => (
                  <div key={u.username} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-bold">{u.username}</p>
                      <p className="text-xs text-gray-500">Ventas: {u.salesCount} | Hrs Extra: {u.extraHours}</p>
                    </div>
                    <div className="flex gap-2">
                      <div className="flex flex-col items-end">
                         <span className="text-xs font-bold text-gray-400">Horas Extra</span>
                         <div className="flex gap-1">
                           <button onClick={() => updateHours(u.username, -1)} className="px-2 bg-gray-200 rounded">-</button>
                           <button onClick={() => updateHours(u.username, 1)} className="px-2 bg-blue-100 text-blue-600 rounded">+</button>
                         </div>
                      </div>
                      <div className="flex flex-col items-end ml-2">
                         <span className="text-xs font-bold text-gray-400">Ventas</span>
                         <div className="flex gap-1">
                           <button onClick={() => updateSales(u.username, -1)} className="px-2 bg-gray-200 rounded">-</button>
                           <button onClick={() => updateSales(u.username, 1)} className="px-2 bg-green-100 text-green-600 rounded">+</button>
                         </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Product Management Simulation */}
        <div className="mt-8 bg-white p-6 rounded-xl shadow-md">
           <h3 className="text-xl font-bold mb-4">Gestión de Productos</h3>
           <p className="text-gray-500 mb-4">
             Integrado con Supabase. Los administradores pueden editar precios y stock aquí.
             (Funcionalidad simulada para la UI).
           </p>
           {user.role === 'admin' ? (
             <button className="bg-gray-800 text-white px-4 py-2 rounded">Añadir Producto</button>
           ) : (
             <p className="text-orange-500 font-bold">Solo lectura</p>
           )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;