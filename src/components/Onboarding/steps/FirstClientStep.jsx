import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiHeart, FiUser, FiTag, FiHash, FiArrowRight, FiArrowLeft } = FiIcons;

const FirstClientStep = ({ data, onNext, onBack }) => {
  const [formData, setFormData] = useState({
    name: data.client?.name || '',
    productName: data.client?.productName || '',
    articleNumber: data.client?.articleNumber || ''
  });

  const [errors, setErrors] = useState({});

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Валидация
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Название клиента обязательно';
    }
    if (!formData.productName.trim()) {
      newErrors.productName = 'Название изделия обязательно';
    }
    if (!formData.articleNumber.trim()) {
      newErrors.articleNumber = 'Артикул обязателен';
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onNext({ client: formData });
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const exampleClients = [
    'Бутик "Модница"',
    'ТЦ "Ала-Арча"',
    'Магазин "Стиль"',
    'ИП Асанова А.К.'
  ];

  const exampleProducts = [
    'Платье "Весна"',
    'Худи оверсайз',
    'Футболка классик',
    'Брюки офисные'
  ];

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiHeart} className="w-8 h-8 text-pink-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Ваш первый заказчик и изделие
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Давайте создадим основу для вашего первого заказа, чтобы вы увидели, как работает система.
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
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название клиента *
          </label>
          <div className="relative">
            <SafeIcon icon={FiUser} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Например: Бутик 'Модница'"
            />
          </div>
          {errors.name && (
            <p className="text-red-500 text-sm mt-1">{errors.name}</p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-2">
            {exampleClients.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleChange('name', example)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Название изделия *
          </label>
          <div className="relative">
            <SafeIcon icon={FiTag} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.productName}
              onChange={(e) => handleChange('productName', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.productName ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Например: Платье 'Весна'"
            />
          </div>
          {errors.productName && (
            <p className="text-red-500 text-sm mt-1">{errors.productName}</p>
          )}
          
          <div className="mt-2 flex flex-wrap gap-2">
            {exampleProducts.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => handleChange('productName', example)}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
              >
                {example}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Артикул изделия *
          </label>
          <div className="relative">
            <SafeIcon icon={FiHash} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={formData.articleNumber}
              onChange={(e) => handleChange('articleNumber', e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.articleNumber ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="Например: PL-01"
            />
          </div>
          {errors.articleNumber && (
            <p className="text-red-500 text-sm mt-1">{errors.articleNumber}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            Уникальный код для идентификации изделия
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-900 mb-2">🎯 Что дальше?</h4>
          <p className="text-sm text-blue-700 mb-2">
            После завершения настройки вы сможете:
          </p>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Создать полноценный заказ для этого клиента</li>
            <li>• Настроить технологическую карту для изделия</li>
            <li>• Запустить автоматический производственный процесс</li>
            <li>• Отслеживать прогресс и финансы</li>
          </ul>
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

export default FirstClientStep;