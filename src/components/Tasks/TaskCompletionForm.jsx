import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCheck } = FiIcons;

const TaskCompletionForm = ({ task, onClose, onComplete }) => {
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: {
      actualHours: task.estimatedHours,
      actualQuantity: task.targetQuantity || 0,
      notes: '',
      completedBy: 'current_user'
    }
  });

  const watchActualQuantity = watch('actualQuantity');

  const getFormFields = () => {
    switch (task.type) {
      case 'tech_spec':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Расход ткани (м/ед.)
              </label>
              <input
                {...register('fabricConsumption', { required: true, min: 0.1 })}
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="1.2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Особые инструкции
              </label>
              <textarea
                {...register('specialInstructions')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Дополнительные требования к производству..."
              />
            </div>
          </div>
        );

      case 'procurement':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Закупленные материалы
              </label>
              {task.requiredMaterials?.map((material, index) => (
                <div key={index} className="flex items-center space-x-3 mb-2">
                  <input
                    {...register(`materials.${index}.purchased`)}
                    type="checkbox"
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm">
                    {material.name}: {material.quantity} {material.unit}
                  </span>
                </div>
              ))}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Общая стоимость закупки (сом)
              </label>
              <input
                {...register('totalCost', { required: true, min: 0 })}
                type="number"
                step="0.01"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        );

      case 'cutting':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фактически раскроено (шт.)
              </label>
              <input
                {...register('actualQuantity', { required: true, min: 0 })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Отходы ткани (%)
              </label>
              <input
                {...register('wastePercentage', { min: 0, max: 50 })}
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="5.0"
              />
            </div>
          </div>
        );

      case 'qc':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Проверено изделий
              </label>
              <input
                {...register('checkedQuantity', { required: true, min: 0 })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Принято
                </label>
                <input
                  {...register('passedQuantity', { required: true, min: 0 })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Брак
                </label>
                <input
                  {...register('rejectedQuantity', { min: 0 })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  На доработку
                </label>
                <input
                  {...register('reworkQuantity', { min: 0 })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Причины брака/доработки
              </label>
              <textarea
                {...register('defectReasons')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="Описание выявленных дефектов..."
              />
            </div>
          </div>
        );

      default:
        return (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество выполненной работы
            </label>
            <input
              {...register('actualQuantity', { min: 0 })}
              type="number"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        );
    }
  };

  const onSubmit = (data) => {
    const completionData = {
      ...data,
      completedBy: 'current_user',
      completedAt: new Date().toISOString()
    };

    // Add specific data based on task type
    switch (task.type) {
      case 'tech_spec':
        completionData.techSpec = {
          fabricConsumption: data.fabricConsumption,
          specialInstructions: data.specialInstructions
        };
        break;

      case 'procurement':
        completionData.purchasedMaterials = data.materials;
        completionData.totalCost = data.totalCost;
        break;

      case 'qc':
        completionData.qcResults = {
          checked: data.checkedQuantity,
          passed: data.passedQuantity,
          rejected: data.rejectedQuantity || 0,
          reworkNeeded: data.reworkQuantity || 0,
          defectReasons: data.defectReasons
        };
        break;

      default:
        break;
    }

    onComplete(completionData);
  };

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
          <h2 className="text-xl font-semibold text-gray-900">
            Завершение задачи
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900 mb-2">{task.title}</h3>
          <p className="text-sm text-gray-600">{task.description}</p>
          {task.orderNumber && (
            <p className="text-sm text-blue-600 mt-2">Заказ: {task.orderNumber}</p>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Common Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Фактическое время (часы)
              </label>
              <input
                {...register('actualHours', { required: true, min: 0.1 })}
                type="number"
                step="0.1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              {errors.actualHours && (
                <p className="text-red-500 text-sm mt-1">Обязательное поле</p>
              )}
            </div>

            {task.targetQuantity && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Выполнено (из {task.targetQuantity})
                </label>
                <input
                  {...register('actualQuantity', { 
                    required: true, 
                    min: 0, 
                    max: task.targetQuantity * 1.1 
                  })}
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}
          </div>

          {/* Task-specific Fields */}
          {getFormFields()}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Комментарии
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Дополнительные комментарии к выполнению задачи..."
            />
          </div>

          {/* Progress Indicator */}
          {task.targetQuantity && watchActualQuantity && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex justify-between text-sm text-blue-700 mb-2">
                <span>Прогресс выполнения</span>
                <span>{Math.round((watchActualQuantity / task.targetQuantity) * 100)}%</span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ 
                    width: `${Math.min((watchActualQuantity / task.targetQuantity) * 100, 100)}%` 
                  }}
                />
              </div>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
            >
              <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
              Завершить задачу
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TaskCompletionForm;