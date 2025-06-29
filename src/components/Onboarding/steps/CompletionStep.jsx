import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiCheckCircle, FiUser, FiSettings, FiUsers, FiHeart, FiArrowRight, FiHome } = FiIcons;

const CompletionStep = ({ data, onNext, isLoading }) => {
  const completedItems = [
    {
      icon: FiUser,
      title: 'Технолог добавлен',
      description: data.technologist?.name || 'Не указан',
      color: 'purple'
    },
    {
      icon: FiSettings,
      title: 'Оборудование настроено',
      description: `${data.equipment?.length || 0} типов машинок`,
      color: 'green'
    },
    {
      icon: FiUsers,
      title: 'Команда сформирована',
      description: [data.team?.cutter, data.team?.brigadier].filter(Boolean).join(', ') || 'Частично',
      color: 'orange'
    },
    {
      icon: FiHeart,
      title: 'Первый клиент создан',
      description: data.client?.name || 'Не указан',
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      purple: 'bg-purple-100 text-purple-600',
      green: 'bg-green-100 text-green-600',
      orange: 'bg-orange-100 text-orange-600',
      pink: 'bg-pink-100 text-pink-600'
    };
    return colors[color] || colors.green;
  };

  return (
    <div className="text-center">
      {/* Success Animation */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", duration: 0.6 }}
        className="mb-8"
      >
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiCheckCircle} className="w-12 h-12 text-green-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Поздравляем! Ваша фабрика готова к работе!
        </h1>
        
        <p className="text-xl text-gray-600 mb-2">
          Базовые данные внесены и система настроена
        </p>
        
        <p className="text-gray-500">
          Теперь вы можете создать свой первый полноценный заказ
        </p>
      </motion.div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8"
      >
        {completedItems.map((item, index) => (
          <motion.div
            key={item.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + index * 0.1 }}
            className="bg-gray-50 rounded-lg p-4 text-left"
          >
            <div className="flex items-center mb-2">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${getColorClasses(item.color)}`}>
                <SafeIcon icon={item.icon} className="w-4 h-4" />
              </div>
              <h3 className="font-semibold text-gray-900">{item.title}</h3>
            </div>
            <p className="text-sm text-gray-600 ml-11">{item.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* Next Steps */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8"
      >
        <h3 className="font-semibold text-blue-900 mb-3">🚀 Что дальше?</h3>
        <div className="text-left space-y-2 text-sm text-blue-700">
          <p>• Создайте первый заказ и увидите автоматическую генерацию задач</p>
          <p>• Добавьте больше сотрудников в разделе "Персонал"</p>
          <p>• Настройте технологические карты для ваших изделий</p>
          <p>• Начните отслеживать финансы и производительность</p>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="flex flex-col sm:flex-row gap-4 justify-center"
      >
        <button
          onClick={() => onNext({ action: 'create_order' })}
          disabled={isLoading}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-lg font-medium shadow-lg disabled:opacity-50"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
          ) : (
            <SafeIcon icon={FiArrowRight} className="w-5 h-5 mr-2" />
          )}
          Создать первый заказ
        </button>
        
        <button
          onClick={() => onNext({ action: 'go_dashboard' })}
          disabled={isLoading}
          className="bg-gray-100 text-gray-700 px-8 py-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center text-lg font-medium disabled:opacity-50"
        >
          <SafeIcon icon={FiHome} className="w-5 h-5 mr-2" />
          Перейти в дашборд
        </button>
      </motion.div>

      {/* Footer Note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.1 }}
        className="text-sm text-gray-500 mt-6"
      >
        Вы всегда можете изменить эти настройки в соответствующих разделах системы
      </motion.p>
    </div>
  );
};

export default CompletionStep;