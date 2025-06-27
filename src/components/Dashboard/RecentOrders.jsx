import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const RecentOrders = () => {
  const { orders } = useData();
  const { t, formatCurrency } = useLanguage();

  const recentOrders = orders.slice(0, 5);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'inProgress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('recentOrders')}</h3>
      
      <div className="space-y-4">
        {recentOrders.map((order) => (
          <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{order.orderNumber}</p>
              <p className="text-sm text-gray-600">{order.customer}</p>
              <p className="text-xs text-gray-500">{order.orderDate}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">{formatCurrency(order.total)}</p>
              <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                {t(order.status)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default RecentOrders;