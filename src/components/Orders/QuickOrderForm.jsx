import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useFactory } from '../../contexts/FactoryContext';
import { useTask } from '../../contexts/TaskContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiPlus } = FiIcons;

const QuickOrderForm = ({ onClose, onSuccess }) => {
  const { addOrder, materials } = useFactory();
  const { generateOrderTasks } = useTask();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      customerName: '',
      model: '',
      color: '',
      quantity: 1,
      pricePerUnit: 0,
      deliveryDate: '',
      advancePayment: 0,
      fabricConsumption: 1.2 // метров на единицу
    }
  });

  const onSubmit = (data) => {
    try {
      // Create order with task generation callback
      const orderId = addOrder({
        customerName: data.customerName,
        model: data.model,
        color: data.color,
        quantity: parseInt(data.quantity),
        pricePerUnit: parseFloat(data.pricePerUnit),
        deliveryDate: data.deliveryDate,
        advancePayment: parseFloat(data.advancePayment || 0),
        fabricConsumption: parseFloat(data.fabricConsumption)
      }, generateOrderTasks); // Pass task generator as callback

      console.log('✅ Заказ создан с автогенерацией задач:', orderId);
      
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('❌ Ошибка создания заказа:', error);
    }
  };

  // Check material availability
  const fabricMaterial = materials.find(m => m.type === 'fabric');
  const accessoryMaterial = materials.find(m => m.type === 'accessories');

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Новый заказ
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer and Model */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заказчик *
              </label>
              <input
                {...register('customerName', { required: 'Обязательное поле' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название компании или ФИО"
              />
              {errors.customerName && (
                <p className="text-red-500 text-sm mt-1">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Модель *
              </label>
              <input
                {...register('model', { required: 'Обязательное поле' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Женское платье офисное"
              />
              {errors.model && (
                <p className="text-red-500 text-sm mt-1">{errors.model.message}</p>
              )}
            </div>
          </div>

          {/* Color and Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цвет *
              </label>
              <input
                {...register('color', { required: 'Обязательное поле' })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Например: Синий"
              />
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Количество *
              </label>
              <input
                {...register('quantity', { 
                  required: 'Обязательное поле',
                  min: { value: 1, message: 'Минимум 1' }
                })}
                type="number"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.quantity && (
                <p className="text-red-500 text-sm mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Цена за единицу (сом) *
              </label>
              <input
                {...register('pricePerUnit', { 
                  required: 'Обязательное поле',
                  min: { value: 0, message: 'Минимум 0' }
                })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.pricePerUnit && (
                <p className="text-red-500 text-sm mt-1">{errors.pricePerUnit.message}</p>
              )}
            </div>
          </div>

          {/* Delivery and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата доставки *
              </label>
              <input
                {...register('deliveryDate', { required: 'Обязательное поле' })}
                type="date"
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.deliveryDate && (
                <p className="text-red-500 text-sm mt-1">{errors.deliveryDate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Предоплата (сом)
              </label>
              <input
                {...register('advancePayment', { min: { value: 0, message: 'Минимум 0' } })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0"
              />
              {errors.advancePayment && (
                <p className="text-red-500 text-sm mt-1">{errors.advancePayment.message}</p>
              )}
            </div>
          </div>

          {/* Fabric Consumption */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Расход ткани (метров на единицу) *
            </label>
            <input
              {...register('fabricConsumption', { 
                required: 'Обязательное поле',
                min: { value: 0.1, message: 'Минимум 0.1' }
              })}
              type="number"
              step="0.1"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.fabricConsumption && (
              <p className="text-red-500 text-sm mt-1">{errors.fabricConsumption.message}</p>
            )}
          </div>

          {/* Auto-Task Generation Info */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">🤖 Автоматическая генерация задач</h3>
            <p className="text-sm text-blue-700 mb-3">
              После создания заказа система автоматически создаст последовательность задач:
            </p>
            <div className="space-y-1 text-sm text-blue-600">
              <p>1. 👨‍💼 <strong>Технологу:</strong> Детализация техпроцесса</p>
              <p>2. 📦 <strong>Снабжение:</strong> Закупка материалов</p>
              <p>3. ✂️ <strong>Кройщику:</strong> Раскрой изделий</p>
              <p>4. 👥 <strong>Бригадиру:</strong> Пошив</p>
              <p>5. ✅ <strong>ОТК:</strong> Контроль качества</p>
              <p>6. 👨‍💼 <strong>Технологу:</strong> Финальная проверка</p>
              <p>7. 📋 <strong>Упаковщику:</strong> Упаковка и отгрузка</p>
            </div>
          </div>

          {/* Material Availability Check */}
          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="font-medium text-green-900 mb-2">📊 Проверка материалов на складе</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-green-700">
                  <strong>Ткань:</strong> {fabricMaterial ? `${fabricMaterial.stockQuantity} ${fabricMaterial.unit}` : 'Не найдена'}
                </p>
                <p className="text-green-600">
                  Цена: {fabricMaterial ? `${fabricMaterial.pricePerUnit} сом/${fabricMaterial.unit}` : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-green-700">
                  <strong>Фурнитура:</strong> {accessoryMaterial ? `${accessoryMaterial.stockQuantity} ${accessoryMaterial.unit}` : 'Не найдена'}
                </p>
                <p className="text-green-600">
                  Цена: {accessoryMaterial ? `${accessoryMaterial.pricePerUnit} сом/${accessoryMaterial.unit}` : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
              Создать заказ + задачи
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default QuickOrderForm;