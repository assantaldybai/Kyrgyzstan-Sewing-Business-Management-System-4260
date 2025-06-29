import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth, supabase } from '../contexts/AuthContext';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiTool, FiDollarSign, FiActivity, FiEye, FiSettings, FiTrendingUp, FiUserPlus, FiEdit2, FiTrash2 } = FiIcons;

const SuperAdminDashboard = () => {
  const { user, signOut } = useAuth();
  const [factories, setFactories] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalFactories: 0,
    activeFactories: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'factory_owner'
  });

  useEffect(() => {
    loadFactories();
    loadUsers();
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

  const loadUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          factories (
            id,
            name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
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

  const createUser = async (e) => {
    e.preventDefault();
    
    try {
      // Создаем пользователя через Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newUser.email,
        password: newUser.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        // Создаем профиль пользователя
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: newUser.firstName,
            last_name: newUser.lastName,
            email: newUser.email,
            role: newUser.role,
            is_active: true
          });

        if (profileError) throw profileError;

        // Если это владелец фабрики, создаем фабрику
        if (newUser.role === 'factory_owner') {
          const factoryName = `${newUser.firstName} ${newUser.lastName} Factory`;
          
          const { error: factoryError } = await supabase
            .from('factories')
            .insert({
              name: factoryName,
              owner_id: authData.user.id,
              is_active: true,
              has_completed_onboarding: false
            });

          if (factoryError) throw factoryError;
        }

        // Обновляем данные
        loadUsers();
        loadFactories();
        loadStats();

        // Сбрасываем форму
        setNewUser({
          email: '',
          password: '',
          firstName: '',
          lastName: '',
          role: 'factory_owner'
        });
        setShowUserForm(false);

        alert('Пользователь успешно создан!');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('Ошибка создания пользователя: ' + error.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Вы уверены, что хотите удалить этого пользователя?')) {
      return;
    }

    try {
      // Удаляем профиль (каскадно удалится и auth.users)
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId);

      if (error) throw error;

      loadUsers();
      loadFactories();
      loadStats();
      
      alert('Пользователь удален');
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Ошибка удаления пользователя');
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

        {/* User Management */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8"
        >
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Управление пользователями</h2>
            <button
              onClick={() => setShowUserForm(!showUserForm)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <SafeIcon icon={FiUserPlus} className="w-4 h-4 mr-2" />
              Добавить пользователя
            </button>
          </div>

          {/* User Creation Form */}
          {showUserForm && (
            <div className="p-6 bg-gray-50 border-b">
              <form onSubmit={createUser} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <input
                  type="email"
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="password"
                  placeholder="Пароль"
                  value={newUser.password}
                  onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Имя"
                  value={newUser.firstName}
                  onChange={(e) => setNewUser({...newUser, firstName: e.target.value})}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  placeholder="Фамилия"
                  value={newUser.lastName}
                  onChange={(e) => setNewUser({...newUser, lastName: e.target.value})}
                  required
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="factory_owner">Владелец фабрики</option>
                  <option value="superadmin">Суперадмин</option>
                </select>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Создать
                </button>
              </form>
            </div>
          )}

          {/* Users Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Пользователь
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Роль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Фабрика
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                          <SafeIcon icon={FiUsers} className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {user.first_name} {user.last_name}
                          </p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.role === 'superadmin' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role === 'superadmin' ? 'Суперадмин' : 'Владелец фабрики'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.factories?.name || 'Нет фабрики'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.is_active 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.is_active ? 'Активен' : 'Неактивен'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => deleteUser(user.id)}
                          disabled={user.role === 'superadmin'}
                          className={`text-red-600 hover:text-red-900 ${
                            user.role === 'superadmin' ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

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