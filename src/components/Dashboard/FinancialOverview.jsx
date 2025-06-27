import React from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../../contexts/FactoryContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiDollarSign, FiTrendingUp, FiTrendingDown, FiTarget } = FiIcons;

const FinancialOverview = () => {
  const { getMetrics } = useFactory();
  const metrics = getMetrics();

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} сом`;
  };

  const cards = [
    {
      title: 'Общая выручка',
      value: formatCurrency(metrics.totalRevenue),
      icon: FiDollarSign,
      color: 'green',
      trend: '+12%'
    },
    {
      title: 'Затраты на материалы',
      value: formatCurrency(metrics.totalMaterialCosts),
      icon: FiTrendingDown,
      color: 'red',
      trend: '+8%'
    },
    {
      title: 'Затраты на работу',
      value: formatCurrency(metrics.totalLaborCosts),
      icon: FiTrendingDown,
      color: 'orange',
      trend: '+5%'
    },
    {
      title: 'Прибыль',
      value: formatCurrency(metrics.totalProfit),
      icon: FiTrendingUp,
      color: 'blue',
      trend: `${metrics.profitMargin}%`
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      green: 'bg-green-500 text-green-600 bg-green-100',
      red: 'bg-red-500 text-red-600 bg-red-100',
      orange: 'bg-orange-500 text-orange-600 bg-orange-100',
      blue: 'bg-blue-500 text-blue-600 bg-blue-100'
    };
    return colors[color]?.split(' ') || colors.blue.split(' ');
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => {
        const [bgColor, textColor, iconBgColor] = getColorClasses(card.color);
        
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 ${iconBgColor} rounded-lg flex items-center justify-center`}>
                <SafeIcon icon={card.icon} className={`w-6 h-6 ${textColor}`} />
              </div>
              <span className={`text-sm font-medium ${textColor}`}>
                {card.trend}
              </span>
            </div>
            
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">
                {card.title}
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {card.value}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default FinancialOverview;