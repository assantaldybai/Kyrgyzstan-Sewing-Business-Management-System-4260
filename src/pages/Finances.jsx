import React from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../contexts/FactoryContext';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTrendingUp, FiDollarSign, FiPieChart, FiBarChart3 } = FiIcons;

const Finances = () => {
  const { getMetrics, orders, finances } = useFactory();
  const metrics = getMetrics();

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} сом`;
  };

  // Prepare chart data
  const revenueData = orders.map((order, index) => ({
    name: `Заказ ${index + 1}`,
    revenue: order.finances.totalValue,
    costs: order.finances.materialCosts + order.finances.laborCosts,
    profit: order.finances.totalValue - order.finances.materialCosts - order.finances.laborCosts
  }));

  // Cost breakdown data
  const costBreakdown = [
    { name: 'Материалы', value: metrics.totalMaterialCosts, color: '#ef4444' },
    { name: 'Работа', value: metrics.totalLaborCosts, color: '#f97316' },
    { name: 'Прибыль', value: metrics.totalProfit, color: '#22c55e' }
  ];

  const COLORS = ['#ef4444', '#f97316', '#22c55e'];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Финансовая аналитика</h1>
        <p className="text-gray-600">Полный обзор доходов, расходов и прибыльности фабрики</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiDollarSign} className="w-8 h-8" />
            <span className="text-green-200 text-sm">+12%</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Общая выручка</h3>
          <p className="text-3xl font-bold">{formatCurrency(metrics.totalRevenue)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiTrendingUp} className="w-8 h-8" />
            <span className="text-red-200 text-sm">+8%</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Общие расходы</h3>
          <p className="text-3xl font-bold">
            {formatCurrency(metrics.totalMaterialCosts + metrics.totalLaborCosts)}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiBarChart3} className="w-8 h-8" />
            <span className="text-blue-200 text-sm">{metrics.profitMargin}%</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Чистая прибыль</h3>
          <p className="text-3xl font-bold">{formatCurrency(metrics.totalProfit)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-4">
            <SafeIcon icon={FiPieChart} className="w-8 h-8" />
            <span className="text-purple-200 text-sm">Средний</span>
          </div>
          <h3 className="text-lg font-semibold mb-1">Маржинальность</h3>
          <p className="text-3xl font-bold">{metrics.profitMargin}%</p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Revenue Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Динамика по заказам</h3>
          
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [formatCurrency(value), '']}
                  labelFormatter={(label) => label}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  name="Выручка"
                />
                <Line 
                  type="monotone" 
                  dataKey="costs" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  name="Затраты"
                />
                <Line 
                  type="monotone" 
                  dataKey="profit" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  name="Прибыль"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <SafeIcon icon={FiBarChart3} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Нет данных для отображения</p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Cost Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Структура затрат</h3>
          
          {costBreakdown.some(item => item.value > 0) ? (
            <>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [formatCurrency(value), '']} />
                </PieChart>
              </ResponsiveContainer>
              
              <div className="mt-4 space-y-2">
                {costBreakdown.map((item, index) => (
                  <div key={item.name} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div 
                        className="w-3 h-3 rounded-full mr-2"
                        style={{ backgroundColor: COLORS[index] }}
                      />
                      <span className="text-sm text-gray-600">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(item.value)}
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-250 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <SafeIcon icon={FiPieChart} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>Нет данных для отображения</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Order Profitability Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Прибыльность по заказам</h3>
        </div>
        
        {orders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Заказ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Заказчик
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Выручка
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Материалы
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Работа
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Прибыль
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Маржа %
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.map((order) => {
                  const profit = order.finances.totalValue - order.finances.materialCosts - order.finances.laborCosts;
                  const margin = order.finances.totalValue ? ((profit / order.finances.totalValue) * 100).toFixed(1) : 0;
                  
                  return (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {order.orderNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {order.customerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                        {formatCurrency(order.finances.totalValue)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        {formatCurrency(order.finances.materialCosts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600">
                        {formatCurrency(order.finances.laborCosts)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                        {formatCurrency(profit)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                          margin >= 20 ? 'bg-green-100 text-green-800' :
                          margin >= 10 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {margin}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <SafeIcon icon={FiDollarSign} className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Нет заказов для анализа прибыльности</p>
          </div>
        )}
      </motion.div>
    </div>
  );
};

export default Finances;