import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, supabase } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTool, FiDollarSign, FiActivity, FiEye, FiSettings, FiTrendingUp } = FiIcons;

const SuperAdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [factories, setFactories] = useState([]);
  const [stats, setStats] = useState({
    totalFactories: 0,
    activeFactories: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFactories();
    loadStats();
  }, []);

  const loadFactories = async () => {
    try {
      const { data, error } = await supabase
        .from('factories')
        .select(`
          *,
          profiles!factories_owner_id_fkey (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setFactories(data || []);
    } catch (error) {
      console.error('Error loading factories:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Get factory stats
      const { data: factoryStats, error: factoryError } = await supabase
        .from('factories')
        .select('id, is_active');

      if (factoryError) throw factoryError;

      // Get user stats
      const { data: userStats, error: userError } = await supabase
        .from('profiles')
        .select('id');

      if (userError) throw userError;

      setStats({
        totalFactories: factoryStats?.length || 0,
        activeFactories: factoryStats?.filter(f => f.is_active).length || 0,
        totalUsers: userStats?.length || 0,
        totalRevenue: 0 // This would come from aggregated order data
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleFactoryStatus = async (factoryId, currentStatus) => {
    try {
      const { error } = await supabase
        .from('factories')
        .update({ is_active: !currentStatus })
        .eq('id', factoryId);

      if (error) throw error;

      // Reload data
      loadFactories();
      loadStats();
    } catch (error) {
      console.error('Error updating factory status:', error);
      alert('Ошибка обновления статуса фабрики');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center mr-3">
                <SafeIcon icon={FiSettings} className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Панель Суперадмина</h1>
                <p className="text-gray-600">KEMSEL SYSTEMS Platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">
                {user?.email}
              </span>
              <button
                onClick={signOut}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Выйти
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего фабрик</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalFactories}</p>
              </div>
              <SafeIcon icon={FiTool} className="w-8 h-8 text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.1}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Активных фабрик</p>
                <p className="text-3xl font-bold text-green-600">{stats.activeFactories}</p>
              </div>
              <SafeIcon icon={FiActivity} className="w-8 h-8 text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.2}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Всего пользователей</p>
                <p className="text-3xl font-bold text-purple-600">{stats.totalUsers}</p>
              </div>
              <SafeIcon icon={FiUsers} className="w-8 h-8 text-purple-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            delay={0.3}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Рост платформы</p>
                <p className="text-3xl font-bold text-orange-600">+{Math.round((stats.totalFactories / 30) * 100)}%</p>
              </div>
              <SafeIcon icon={FiTrendingUp} className="w-8 h-8 text-orange-600" />
            </div>
          </motion.div>
        </div>

        {/* Factories Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Управление фабриками</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Фабрика
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Владелец
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Создана
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {factories.map((factory) => (
                  <tr key={factory.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <SafeIcon icon={FiTool} className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{factory.name}</p>
                          <p className="text-sm text-gray-500">ID: {factory.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {factory.profiles?.first_name} {factory.profiles?.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{factory.profiles?.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        factory.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {factory.is_active ? 'Активна' : 'Неактивна'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(factory.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleFactoryStatus(factory.id, factory.is_active)}
                          className={`px-3 py-1 rounded text-xs ${
                            factory.is_active
                              ? 'bg-red-100 text-red-700 hover:bg-red-200'
                              : 'bg-green-100 text-green-700 hover:bg-green-200'
                          }`}
                        >
                          {factory.is_active ? 'Деактивировать' : 'Активировать'}
                        </button>
                        <button className="text-blue-600 hover:text-blue-900">
                          <SafeIcon icon={FiEye} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {factories.length === 0 && (
            <div className="text-center py-12">
              <SafeIcon icon={FiTool} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет фабрик</h3>
              <p className="text-gray-600">Фабрики появятся здесь после регистрации пользователей</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default SuperAdminDashboard;