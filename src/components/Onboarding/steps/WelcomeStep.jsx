import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTool, FiUsers, FiSettings, FiTarget, FiArrowRight } = FiIcons;

const WelcomeStep = ({ onNext }) => {
  const features = [
    {
      icon: FiTool,
      title: 'Автоматизация процессов',
      description: 'От заказа до отгрузки - все под контролем'
    },
    {
      icon: FiUsers,
      title: 'Управление командой',
      description: 'Роли, задачи и зарплаты в одной системе'
    },
    {
      icon: FiSettings,
      title: 'Технологические карты',
      description: 'Стандартизируйте производственные процессы'
    },
    {
      icon: FiTarget,
      title: 'Финансовая аналитика',
      description: 'Прозрачность доходов и расходов'
    }
  ];

  return (
    <div className="text-center">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <SafeIcon icon={FiTool} className="w-10 h-10 text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Добро пожаловать в KEMSEL SYSTEMS!
        </h1>
        
        <p className="text-xl text-gray-600 mb-2">
          Давайте потратим 3 минуты, чтобы настроить вашу цифровую фабрику
        </p>
        
        <p className="text-gray-500">
          Это поможет вам сразу начать работу с готовой системой
        </p>
      </motion.div>

      {/* Features Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8"
      >
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="bg-gray-50 rounded-lg p-6 text-left"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <SafeIcon icon={feature.icon} className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
            <p className="text-sm text-gray-600">{feature.description}</p>
          </motion.div>
        ))}
      </motion.div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <button
          onClick={() => onNext()}
          className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center mx-auto text-lg font-medium shadow-lg"
        >
          Начать настройку
          <SafeIcon icon={FiArrowRight} className="w-5 h-5 ml-2" />
        </button>
        
        <p className="text-sm text-gray-500 mt-4">
          Вы всегда можете изменить эти настройки позже
        </p>
      </motion.div>
    </div>
  );
};

export default WelcomeStep;