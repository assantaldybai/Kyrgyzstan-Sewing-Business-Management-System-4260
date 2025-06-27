import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../contexts/FactoryContext';
import { useTask } from '../contexts/TaskContext';
import FinancialOverview from '../components/Dashboard/FinancialOverview';
import QuickOrderForm from '../components/Orders/QuickOrderForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiPackage, FiClock, FiCheck, FiAlertTriangle, FiUsers, FiTarget } = FiIcons;

const Dashboard = () => {
  const { 
    factoryConfig, 
    orders, 
    getMetrics, 
    getOrdersByStatus,
    materials 
  } = useFactory();
  
  const { getTaskStats, getTasksByRole } = useTask();
  
  const [showQuickOrder, setShowQuickOrder] = useState(false);
  
  const metrics = getMetrics();
  const ordersByStatus = getOrdersByStatus();
  const taskStats = getTaskStats();

  // Low stock materials
  const lowStockMaterials = materials.filter(m => m.stockQuantity < m.reorderLevel);

  // Recent orders
  const recentOrders = orders.slice(-5).reverse();

  // Urgent tasks (high priority + overdue)
  const urgentTasks = getTasksByRole('all').filter(task => 
    task.priority === 'high' || 
    (task.status !== 'completed' && new Date(task.dueDate) < new Date())
  ).slice(0, 5);

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} сом`;
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Добро пожаловать в {factoryConfig.name}
          </h1>
          <p className="text-gray-600 mt-1">
            MVP Цифровой фабрики - Фокус на финансах и автоматизации процессов
          </p>
        </div>
        
        <button
          onClick={() => setShowQuickOrder(true)}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
          Новый заказ + задачи
        </button>
      </div>

      {/* Financial Overview */}
      <FinancialOverview />

      {/* Production & Task Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Активные заказы</h3>
            <SafeIcon icon={FiPackage} className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">{metrics.activeOrders}</p>
          <p className="text-sm text-gray-600 mt-1">В производстве</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Активные задачи</h3>
            <SafeIcon icon={FiClock} className="w-6 h-6 text-orange-600" />
          </div>
          <p className="text-3xl font-bold text-orange-600">
            {taskStats.pending + taskStats.inProgress}
          </p>
          <p className="text-sm text-gray-600 mt-1">Требуют внимания</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Завершено</h3>
            <SafeIcon icon={FiCheck} className="w-6 h-6 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{metrics.completedOrders}</p>
          <p className="text-sm text-gray-600 mt-1">Заказов выполнено</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Маржинальность</h3>
            <SafeIcon icon={FiTarget} className="w-6 h-6 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{metrics.profitMargin}%</p>
          <p className="text-sm text-gray-600 mt-1">Средняя прибыль</p>
        </motion.div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Recent Orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Последние заказы</h3>
          
          {recentOrders.length > 0 ? (
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{order.orderNumber}</p>
                    <p className="text-sm text-gray-600">{order.customerName}</p>
                    <p className="text-sm text-gray-500">{order.model} - {order.quantity} шт.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(order.finances.totalValue)}
                    </p>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      order.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                      order.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {order.status === 'pending' ? 'Ожидание' :
                       order.status === 'in_production' ? 'В производстве' :
                       order.status === 'completed' ? 'Завершен' : order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiPackage} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>Заказов пока нет</p>
              <button
                onClick={() => setShowQuickOrder(true)}
                className="mt-3 text-blue-600 hover:text-blue-700 font-medium"
              >
                Создать первый заказ
              </button>
            </div>
          )}
        </motion.div>

        {/* Urgent Tasks */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Срочные задачи</h3>
          
          {urgentTasks.length > 0 ? (
            <div className="space-y-3">
              {urgentTasks.map(task => (
                <div key={task.id} className="flex items-center p-3 bg-red-50 rounded-lg border border-red-200">
                  <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-600 mr-3" />
                  <div className="flex-1">
                    <p className="font-medium text-red-900">{task.title}</p>
                    <p className="text-sm text-red-700">
                      {task.assignedRole?.replace('_', ' ')} • Срок: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                    {task.orderNumber && (
                      <p className="text-xs text-red-600">{task.orderNumber}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    task.priority === 'high' ? 'bg-red-100 text-red-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {task.priority === 'high' ? 'Высокий' : 'Просрочено'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <SafeIcon icon={FiCheck} className="w-12 h-12 mx-auto mb-3 text-green-300" />
              <p>Срочных задач нет</p>
              <p className="text-sm">Все под контролем!</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Material Alerts */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        delay={0.2}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Уведомления по складу</h3>
        
        {lowStockMaterials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lowStockMaterials.map(material => (
              <div key={material.id} className="flex items-center p-4 bg-orange-50 rounded-lg border border-orange-200">
                <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-orange-600 mr-3" />
                <div className="flex-1">
                  <p className="font-medium text-orange-900">{material.name}</p>
                  <p className="text-sm text-orange-700">
                    Остаток: {material.stockQuantity} {material.unit}
                  </p>
                  <p className="text-xs text-orange-600">
                    Минимум: {material.reorderLevel} {material.unit}
                  </p>
                </div>
                <button className="px-3 py-1 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors">
                  Заказать
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <SafeIcon icon={FiCheck} className="w-12 h-12 mx-auto mb-3 text-green-300" />
            <p>Все материалы в достаточном количестве</p>
          </div>
        )}
      </motion.div>

      {/* Quick Order Form */}
      {showQuickOrder && (
        <QuickOrderForm
          onClose={() => setShowQuickOrder(false)}
          onSuccess={() => {
            console.log('✅ Заказ создан с автогенерацией задач!');
          }}
        />
      )}
    </div>
  );
};

export default Dashboard;