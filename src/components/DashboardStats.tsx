import React from 'react';
import { User } from '../types';
import { calculateDailyCommissions } from '../services/db';
import { ShoppingCart, TrendingUp, DollarSign, Users } from 'lucide-react';

interface DashboardStatsProps {
  user: User;
  sales: any[];
  allUsers?: User[]; // Optional, for admin view
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ user, sales, allUsers }) => {
  // Calculate today's sales count
  const today = new Date().toISOString().split('T')[0];
  const todaySales = sales.filter(s => (s.created_at || s.date).startsWith(today));
  const myTodaySales = todaySales.filter(s => s.user_id === user.username).length;
  
  // Calculate commissions for the current user
  const mySales = sales.filter(s => s.user_id === user.username);
  const { totalCommission } = calculateDailyCommissions(mySales);
  
  // Calculate total earnings (Commissions + Extra Hours)
  const extraHoursPay = (user.extraHours || 0) * 5;
  const totalEarnings = totalCommission + extraHoursPay;

  // Admin Stats
  const totalDailySales = todaySales.length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Ventas Hoy (Mías)</p>
            <h3 className="text-2xl font-bold text-gray-800">{myTodaySales}</h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <ShoppingCart className="w-6 h-6 text-blue-600" />
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          Meta prox nivel: {myTodaySales < 20 ? 20 : (myTodaySales < 30 ? 30 : 'Max')}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Comisiones (Bonos)</p>
            <h3 className="text-2xl font-bold text-green-600">${totalCommission}</h3>
          </div>
          <div className="p-3 bg-green-50 rounded-lg">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Horas Extra ({user.extraHours || 0}h)</p>
            <h3 className="text-2xl font-bold text-purple-600">${extraHoursPay}</h3>
          </div>
          <div className="p-3 bg-purple-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Total a Cobrar</p>
            <h3 className="text-2xl font-bold text-gray-800">${totalEarnings}</h3>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg">
            <DollarSign className="w-6 h-6 text-gray-600" />
          </div>
        </div>
      </div>

      {user.role === 'admin' && (
        <div className="col-span-1 md:col-span-4 bg-indigo-50 p-4 rounded-xl border border-indigo-100 mt-2">
          <div className="flex items-center space-x-2 mb-2">
            <Users className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-indigo-900">Resumen Global (Admin)</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-xs text-indigo-600">Ventas Totales Hoy</p>
              <p className="text-xl font-bold text-indigo-900">{totalDailySales}</p>
            </div>
            {/* Add more global stats here if needed */}
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardStats;
