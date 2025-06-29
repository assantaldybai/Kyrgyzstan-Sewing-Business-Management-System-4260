import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTechMap } from '../../contexts/TechMapContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiBook, FiEdit2, FiClock, FiSettings, FiInfo, FiList } = FiIcons;

const TechMapTemplateDetails = ({ template, onClose, onEdit, getModelName }) => {
  const { equipmentTypes } = useTechMap();
  const [activeTab, setActiveTab] = useState('operations');

  const getEquipmentName = (equipmentTypeId) => {
    const equipment = equipmentTypes.find(e => e.id === equipmentTypeId);
    return equipment ? equipment.name : 'Не указано';
  };

  const getTotalTime = () => {
    if (!template.operations) return 0;
    return template.operations.reduce((total, op) => total + (op.estimatedTimeMinutes || 0), 0);
  };

  const getTotalRate = () => {
    if (!template.operations) return 0;
    return template.operations.reduce((total, op) => total + (op.baseRate || 0), 0);
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const tabs = [
    { id: 'operations', name: 'Операции', icon: FiList },
    { id: 'info', name: 'Информация', icon: FiInfo }
  ];

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
        className="bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <SafeIcon icon={FiBook} className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {template.name}
              </h2>
              <p className="text-gray-600">{getModelName(template.modelId)}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${
                  template.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {template.isActive ? 'Активный' : 'Неактивный'}
                </span>
                <span className="text-sm text-gray-500">
                  {template.operations?.length || 0} операций
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(template)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <SafeIcon icon={FiEdit2} className="w-4 h-4 mr-2" />
              Редактировать
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-6 p-6 bg-gray-50 border-b">
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiSettings} className="w-5 h-5 text-gray-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{template.operations?.length || 0}</p>
            <p className="text-sm text-gray-600">Операций</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <SafeIcon icon={FiClock} className="w-5 h-5 text-gray-400 mr-2" />
            </div>
            <p className="text-2xl font-bold text-blue-600">{formatTime(getTotalTime())}</p>
            <p className="text-sm text-gray-600">Общее время</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center mb-2">
              <span className="text-gray-400 text-lg">₽</span>
            </div>
            <p className="text-2xl font-bold text-green-600">{getTotalRate()} сом</p>
            <p className="text-sm text-gray-600">Общая расценка</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'operations' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Последовательность операций
              </h3>
              
              {template.operations && template.operations.length > 0 ? (
                <div className="space-y-3">
                  {template.operations
                    .sort((a, b) => a.sequenceOrder - b.sequenceOrder)
                    .map((operation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start space-x-4">
                          {/* Sequence Number */}
                          <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full text-blue-600 font-bold">
                            {operation.sequenceOrder}
                          </div>

                          {/* Operation Details */}
                          <div className="flex-1">
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="text-lg font-semibold text-gray-900">
                                {operation.operationName}
                              </h4>
                              <div className="flex items-center space-x-4 text-sm">
                                {operation.estimatedTimeMinutes > 0 && (
                                  <div className="flex items-center text-blue-600">
                                    <SafeIcon icon={FiClock} className="w-4 h-4 mr-1" />
                                    {formatTime(operation.estimatedTimeMinutes)}
                                  </div>
                                )}
                                {operation.baseRate > 0 && (
                                  <div className="text-green-600 font-medium">
                                    {operation.baseRate} сом
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                              <div>
                                <span className="text-sm text-gray-600">Оборудование:</span>
                                <p className="font-medium text-gray-900">
                                  {getEquipmentName(operation.equipmentTypeId)}
                                </p>
                              </div>
                              <div>
                                <span className="text-sm text-gray-600">Порядок:</span>
                                <p className="font-medium text-gray-900">
                                  Операция #{operation.sequenceOrder}
                                </p>
                              </div>
                            </div>

                            {operation.description && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <span className="text-sm text-gray-600">Описание:</span>
                                <p className="text-sm text-gray-700 mt-1">
                                  {operation.description}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <SafeIcon icon={FiSettings} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Нет операций</h3>
                  <p className="text-gray-600">В этом шаблоне пока нет операций</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Основная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Название шаблона:</span>
                    <p className="font-medium text-gray-900">{template.name}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Модель изделия:</span>
                    <p className="font-medium text-gray-900">{getModelName(template.modelId)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Статус:</span>
                    <p className="font-medium text-gray-900">
                      {template.isActive ? 'Активный' : 'Неактивный'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Дата создания:</span>
                    <p className="font-medium text-gray-900">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                {template.description && (
                  <div className="mt-4">
                    <span className="text-sm text-gray-600">Описание:</span>
                    <p className="text-gray-700 mt-1">{template.description}</p>
                  </div>
                )}
              </div>

              {/* Statistics */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Статистика шаблона</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-blue-600">{template.operations?.length || 0}</p>
                    <p className="text-sm text-gray-600">Всего операций</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-green-600">{formatTime(getTotalTime())}</p>
                    <p className="text-sm text-gray-600">Плановое время</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-orange-600">{getTotalRate()}</p>
                    <p className="text-sm text-gray-600">Базовая расценка (сом)</p>
                  </div>
                </div>
              </div>

              {/* Equipment Usage */}
              {template.operations && template.operations.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Используемое оборудование</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {[...new Set(template.operations
                      .filter(op => op.equipmentTypeId)
                      .map(op => op.equipmentTypeId))]
                      .map(equipmentId => {
                        const equipment = equipmentTypes.find(e => e.id === equipmentId);
                        const operationsCount = template.operations.filter(op => op.equipmentTypeId === equipmentId).length;
                        
                        return equipment ? (
                          <div key={equipmentId} className="bg-white p-3 rounded-lg border border-purple-200">
                            <p className="font-medium text-purple-900">{equipment.name}</p>
                            <p className="text-sm text-purple-700">{operationsCount} операций</p>
                          </div>
                        ) : null;
                      })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TechMapTemplateDetails;