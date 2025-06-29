import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useTechMap } from '../../contexts/TechMapContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiPlus, FiTrash2, FiMove, FiSave, FiBook } = FiIcons;

const TechMapTemplateForm = ({ template, onClose }) => {
  const { 
    productModels, 
    equipmentTypes, 
    addTechMapTemplate, 
    updateTechMapTemplate 
  } = useTechMap();

  const { register, control, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: template || {
      name: '',
      modelId: '',
      description: '',
      operations: [
        {
          operationName: '',
          sequenceOrder: 1,
          equipmentTypeId: '',
          baseRate: 0,
          estimatedTimeMinutes: 0,
          description: ''
        }
      ]
    }
  });

  const { fields, append, remove, move } = useFieldArray({
    control,
    name: 'operations'
  });

  const [draggedIndex, setDraggedIndex] = useState(null);

  const onSubmit = (data) => {
    // Пересортировка операций по sequence_order
    const sortedOperations = data.operations.map((op, index) => ({
      ...op,
      sequenceOrder: index + 1,
      baseRate: parseFloat(op.baseRate) || 0,
      estimatedTimeMinutes: parseInt(op.estimatedTimeMinutes) || 0
    }));

    const templateData = {
      ...data,
      operations: sortedOperations
    };

    if (template) {
      updateTechMapTemplate(template.id, templateData);
    } else {
      addTechMapTemplate(templateData);
    }
    
    onClose();
  };

  const addOperation = () => {
    append({
      operationName: '',
      sequenceOrder: fields.length + 1,
      equipmentTypeId: '',
      baseRate: 0,
      estimatedTimeMinutes: 0,
      description: ''
    });
  };

  const removeOperation = (index) => {
    if (fields.length > 1) {
      remove(index);
    }
  };

  const handleDragStart = (e, index) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex) {
      move(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  const getTotalTime = () => {
    const operations = watch('operations') || [];
    return operations.reduce((total, op) => total + (parseInt(op.estimatedTimeMinutes) || 0), 0);
  };

  const getTotalRate = () => {
    const operations = watch('operations') || [];
    return operations.reduce((total, op) => total + (parseFloat(op.baseRate) || 0), 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
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
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <SafeIcon icon={FiBook} className="w-6 h-6 mr-3" />
            {template ? 'Редактировать шаблон' : 'Новый шаблон технологической карты'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Название шаблона *
                  </label>
                  <input
                    {...register('name', { required: 'Обязательное поле' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Например: Футболка базовая - стандартный процесс"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Модель изделия *
                  </label>
                  <select
                    {...register('modelId', { required: 'Обязательное поле' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Выберите модель</option>
                    {productModels.map(model => (
                      <option key={model.id} value={model.id}>
                        {model.name} ({model.articleNumber})
                      </option>
                    ))}
                  </select>
                  {errors.modelId && (
                    <p className="text-red-500 text-sm mt-1">{errors.modelId.message}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Описание
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Краткое описание технологического процесса..."
                  />
                </div>
              </div>
            </div>

            {/* Operations */}
            <div className="bg-blue-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Технологические операции ({fields.length})
                </h3>
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-600">
                    Общее время: <span className="font-medium">{formatTime(getTotalTime())}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    Общая расценка: <span className="font-medium">{getTotalRate()} сом</span>
                  </div>
                  <button
                    type="button"
                    onClick={addOperation}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                  >
                    <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1" />
                    Добавить операцию
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {fields.map((field, index) => (
                  <motion.div
                    key={field.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`bg-white rounded-lg border-2 p-4 ${
                      draggedIndex === index ? 'border-blue-500 shadow-lg' : 'border-gray-200'
                    }`}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                  >
                    <div className="flex items-start space-x-4">
                      {/* Drag Handle */}
                      <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg cursor-move">
                        <SafeIcon icon={FiMove} className="w-4 h-4 text-gray-500" />
                      </div>

                      {/* Sequence Number */}
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold text-sm">
                        {index + 1}
                      </div>

                      {/* Operation Fields */}
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Название операции *
                          </label>
                          <input
                            {...register(`operations.${index}.operationName`, { 
                              required: 'Обязательное поле' 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Например: Стачивание плечевых швов"
                          />
                          {errors.operations?.[index]?.operationName && (
                            <p className="text-red-500 text-xs mt-1">
                              {errors.operations[index].operationName.message}
                            </p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Оборудование
                          </label>
                          <select
                            {...register(`operations.${index}.equipmentTypeId`)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          >
                            <option value="">Выберите оборудование</option>
                            {equipmentTypes.map(equipment => (
                              <option key={equipment.id} value={equipment.id}>
                                {equipment.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Время (мин)
                          </label>
                          <input
                            {...register(`operations.${index}.estimatedTimeMinutes`)}
                            type="number"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="30"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Расценка (сом)
                          </label>
                          <input
                            {...register(`operations.${index}.baseRate`)}
                            type="number"
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="50"
                          />
                        </div>

                        <div className="md:col-span-2 lg:col-span-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Описание операции
                          </label>
                          <textarea
                            {...register(`operations.${index}.description`)}
                            rows={2}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                            placeholder="Подробное описание выполнения операции..."
                          />
                        </div>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeOperation(index)}
                        disabled={fields.length === 1}
                        className={`p-2 rounded-lg transition-colors ${
                          fields.length === 1
                            ? 'text-gray-300 cursor-not-allowed'
                            : 'text-red-500 hover:bg-red-50'
                        }`}
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {fields.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Нет операций. Добавьте первую операцию.</p>
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Сводка</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900">{fields.length}</p>
                  <p className="text-sm text-gray-600">Операций</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-blue-600">{formatTime(getTotalTime())}</p>
                  <p className="text-sm text-gray-600">Общее время</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-green-600">{getTotalRate()} сом</p>
                  <p className="text-sm text-gray-600">Общая расценка</p>
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
                <SafeIcon icon={FiSave} className="w-4 h-4 mr-2" />
                {template ? 'Обновить шаблон' : 'Создать шаблон'}
              </button>
            </div>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TechMapTemplateForm;