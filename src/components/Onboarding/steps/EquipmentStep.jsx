import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiPlus, FiTrash2, FiArrowRight, FiArrowLeft } = FiIcons;

const EquipmentStep = ({ data, onNext, onBack }) => {
  const [equipment, setEquipment] = useState(
    data.equipment?.length > 0 ? data.equipment : [
      { name: '', baseRate: '' }
    ]
  );

  const addEquipment = () => {
    setEquipment(prev => [...prev, { name: '', baseRate: '' }]);
  };

  const removeEquipment = (index) => {
    if (equipment.length > 1) {
      setEquipment(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateEquipment = (index, field, value) => {
    setEquipment(prev => prev.map((item, i) => 
      i === index ? { ...item, [field]: value } : item
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Фильтруем только заполненные машинки
    const validEquipment = equipment.filter(item => item.name.trim());
    
    onNext({ equipment: validEquipment });
  };

  const commonEquipment = [
    'Универсальная машина',
    'Оверлок 3-нитка',
    'Оверлок 5-нитка',
    'Плоскошовная',
    'Петельная',
    'Пуговичная',
    'Раскройная машина'
  ];

  const fillCommonEquipment = (name) => {
    const emptyIndex = equipment.findIndex(item => !item.name.trim());
    if (emptyIndex !== -1) {
      updateEquipment(emptyIndex, 'name', name);
    } else {
      setEquipment(prev => [...prev, { name, baseRate: '' }]);
    }
  };

  return (
    <div>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiSettings} className="w-8 h-8 text-green-600" />
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Укажите ваше оборудование
        </h2>
        
        <p className="text-gray-600 max-w-md mx-auto">
          Перечислите основные типы швейных машинок на вашем производстве. Это нужно для расчета зарплат и планирования.
        </p>
      </motion.div>

      {/* Quick Add Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-6"
      >
        <p className="text-sm font-medium text-gray-700 mb-3">Быстрое добавление:</p>
        <div className="flex flex-wrap gap-2">
          {commonEquipment.map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => fillCommonEquipment(name)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
            >
              + {name}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Form */}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        onSubmit={handleSubmit}
        className="space-y-6"
      >
        <div className="space-y-4">
          {equipment.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg"
            >
              <div className="flex-1">
                <input
                  type="text"
                  value={item.name}
                  onChange={(e) => updateEquipment(index, 'name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Название машинки"
                />
              </div>
              
              <div className="w-32">
                <input
                  type="number"
                  value={item.baseRate}
                  onChange={(e) => updateEquipment(index, 'baseRate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Расценка"
                  min="0"
                  step="0.01"
                />
              </div>
              
              <button
                type="button"
                onClick={() => removeEquipment(index)}
                disabled={equipment.length === 1}
                className={`p-2 rounded-lg transition-colors ${
                  equipment.length === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-red-500 hover:bg-red-50'
                }`}
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </div>

        <button
          type="button"
          onClick={addEquipment}
          className="w-full py-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-300 hover:text-blue-600 transition-colors flex items-center justify-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Добавить еще машинку
        </button>

        {/* Info Box */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-900 mb-2">💡 Зачем указывать расценки?</h4>
          <p className="text-sm text-green-700">
            Расценки помогут автоматически рассчитывать стоимость операций и зарплаты сотрудников. 
            Вы можете оставить поле пустым и заполнить позже.
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

export default EquipmentStep;