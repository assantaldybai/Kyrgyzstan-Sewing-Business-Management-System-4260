import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUsers, FiScissors, FiUser, FiArrowRight, FiArrowLeft } = FiIcons;

const TeamStep = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    cutter: data.team?.cutter || '',
    brigadier: data.team?.brigadier || ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext({ team: formData });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiUsers} className="w-8 h-8 text-orange-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Добавьте кройщика и бригадира
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Эти люди управляют потоком работы в цеху и координируют производственные процессы.
        </p>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        {/* Cutter Section */}
        <div className="bg-blue-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
              <SafeIcon icon={FiScissors} className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">Кройщик</h3>
              <p className="text-sm text-blue-700">Отвечает за раскрой материалов</p>
            </div>
          </div>
          
          <input
            type="text"
            value={formData.cutter}
            onChange={(e) => handleChange('cutter', e.target.value)}
            className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            placeholder="Например: Марат Жумабеков"
          />
          
          <div className="mt-3 text-sm text-blue-700">
            <p className="font-medium mb-1">Основные задачи:</p>
            <ul className="space-y-1">
              <li>• Раскрой ткани по лекалам</li>
              <li>• Контроль расхода материалов</li>
              <li>• Подготовка деталей для пошива</li>
            </ul>
          </div>
        </div>

        {/* Brigadier Section */}
        <div className="bg-purple-50 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
              <SafeIcon icon={FiUser} className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-purple-900">Бригадир</h3>
              <p className="text-sm text-purple-700">Руководит швейной бригадой</p>
            </div>
          </div>
          
          <input
            type="text"
            value={formData.brigadier}
            onChange={(e) => handleChange('brigadier', e.target.value)}
            className="w-full px-4 py-3 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
            placeholder="Например: Нурзат Асанова"
          />
          
          <div className="mt-3 text-sm text-purple-700">
            <p className="font-medium mb-1">Основные задачи:</p>
            <ul className="space-y-1">
              <li>• Координация работы швей</li>
              <li>• Контроль качества пошива</li>
              <li>• Распределение заданий</li>
            </ul>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">💡 Можно добавить позже</h4>
          <p className="text-sm text-yellow-700">
            Если у вас пока нет этих сотрудников, оставьте поля пустыми. 
            Вы сможете добавить их в разделе "Сотрудники" когда будете готовы.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex justify-between pt-6">
          <button
            type="button"
            onClick={onBack}
            className="px-6 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
          >
            <SafeIcon icon={FiArrowLeft} className="w-4 h-4 mr-2" />
            Назад
          </button>
          
          <button
            type="submit"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
          >
            Далее
            <SafeIcon icon={FiArrowRight} className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.form>
    </div>
  );
};

export default TeamStep;