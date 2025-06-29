import React from 'react';
import { motion } from 'framer-motion';
import { useTechMap } from '../../contexts/TechMapContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiBook, FiSettings, FiClock, FiEdit2, FiTrash2, FiMoreVertical, FiEye } = FiIcons;

const TechMapTemplateCard = ({ template, onEdit, onDelete, onViewDetails, getModelName }) => {
  const { equipmentTypes } = useTechMap();

  const getEquipmentName = (equipmentTypeId) => {
    const equipment = equipmentTypes.find(e => e.id === equipmentTypeId);
    return equipment ? equipment.name : 'Неизвестное оборудование';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <SafeIcon icon={FiBook} className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">
              {template.name}
            </h3>
            <p className="text-sm text-gray-600">{getModelName(template.modelId)}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${
            template.isActive 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {template.isActive ? 'Активный' : 'Неактивный'}
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onViewDetails(template)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <SafeIcon icon={FiEye} className="w-4 h-4 mr-2" />
                Просмотр
              </button>
              <button
                onClick={() => onEdit(template)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4 mr-2" />
                Редактировать
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description */}
      {template.description && (
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {template.description}
        </p>
      )}

      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <SafeIcon icon={FiSettings} className="w-4 h-4 text-gray-400 mr-1" />
          </div>
          <p className="text-lg font-bold text-gray-900">{template.operations?.length || 0}</p>
          <p className="text-xs text-gray-600">Операций</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-400 mr-1" />
          </div>
          <p className="text-lg font-bold text-blue-600">{formatTime(getTotalTime())}</p>
          <p className="text-xs text-gray-600">Время</p>
        </div>
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <span className="text-gray-400 text-sm">₽</span>
          </div>
          <p className="text-lg font-bold text-green-600">{getTotalRate()}</p>
          <p className="text-xs text-gray-600">Расценка</p>
        </div>
      </div>

      {/* Operations Preview */}
      {template.operations && template.operations.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Основные операции</h4>
          <div className="space-y-1">
            {template.operations.slice(0, 3).map((operation, index) => (
              <div key={index} className="flex items-center text-xs text-gray-600">
                <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                  {operation.sequenceOrder}
                </span>
                <span className="flex-1 truncate">{operation.operationName}</span>
                <span className="text-gray-400 ml-2">
                  {formatTime(operation.estimatedTimeMinutes || 0)}
                </span>
              </div>
            ))}
            {template.operations.length > 3 && (
              <p className="text-xs text-gray-500 text-center mt-2">
                +{template.operations.length - 3} операций
              </p>
            )}
          </div>
        </div>
      )}

      {/* Created Date */}
      <div className="text-xs text-gray-500 mb-4">
        Создан: {new Date(template.createdAt).toLocaleDateString()}
      </div>

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(template)}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Просмотреть детали
      </button>
    </motion.div>
  );
};

export default TechMapTemplateCard;