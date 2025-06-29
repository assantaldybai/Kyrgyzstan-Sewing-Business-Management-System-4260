import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTechMap } from '../../contexts/TechMapContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiCheck, FiBook, FiSearch, FiClock, FiSettings } = FiIcons;

const ApplyTemplateModal = ({ lotId, modelId, onClose, onApply }) => {
  const { techMapTemplates, getTemplatesByModel, equipmentTypes } = useTechMap();
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Фильтрация шаблонов
  const availableTemplates = modelId 
    ? getTemplatesByModel(modelId)
    : techMapTemplates.filter(t => t.isActive);

  const filteredTemplates = availableTemplates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEquipmentName = (equipmentTypeId) => {
    const equipment = equipmentTypes.find(e => e.id === equipmentTypeId);
    return equipment ? equipment.name : 'Не указано';
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}ч ${mins}м`;
    }
    return `${mins}м`;
  };

  const getTotalTime = (operations) => {
    if (!operations) return 0;
    return operations.reduce((total, op) => total + (op.estimatedTimeMinutes || 0), 0);
  };

  const handleApply = async () => {
    if (!selectedTemplate) return;

    setIsApplying(true);
    try {
      await onApply(selectedTemplate.id, lotId);
      onClose();
    } catch (error) {
      console.error('Ошибка применения шаблона:', error);
      alert('Ошибка при применении шаблона');
    } finally {
      setIsApplying(false);
    }
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <SafeIcon icon={FiBook} className="w-6 h-6 mr-3" />
            Применить шаблон технологической карты
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b bg-gray-50">
          <div className="relative">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск шаблонов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Найдено {filteredTemplates.length} шаблонов
          </p>
        </div>

        {/* Templates List */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredTemplates.length > 0 ? (
            <div className="space-y-4">
              {filteredTemplates.map((template) => (
                <motion.div
                  key={template.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                    selectedTemplate?.id === template.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => setSelectedTemplate(template)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center mb-2">
                        <h3 className="text-lg font-semibold text-gray-900 mr-3">
                          {template.name}
                        </h3>
                        {selectedTemplate?.id === template.id && (
                          <SafeIcon icon={FiCheck} className="w-5 h-5 text-blue-600" />
                        )}
                      </div>
                      
                      {template.description && (
                        <p className="text-gray-600 mb-3">{template.description}</p>
                      )}

                      <div className="grid grid-cols-3 gap-4 mb-3">
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <SafeIcon icon={FiSettings} className="w-4 h-4 text-gray-400 mr-1" />
                          </div>
                          <p className="text-lg font-bold text-gray-900">
                            {template.operations?.length || 0}
                          </p>
                          <p className="text-xs text-gray-600">Операций</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <SafeIcon icon={FiClock} className="w-4 h-4 text-gray-400 mr-1" />
                          </div>
                          <p className="text-lg font-bold text-blue-600">
                            {formatTime(getTotalTime(template.operations))}
                          </p>
                          <p className="text-xs text-gray-600">Время</p>
                        </div>
                        <div className="text-center">
                          <div className="flex items-center justify-center mb-1">
                            <span className="text-gray-400 text-sm">₽</span>
                          </div>
                          <p className="text-lg font-bold text-green-600">
                            {template.operations?.reduce((sum, op) => sum + (op.baseRate || 0), 0) || 0}
                          </p>
                          <p className="text-xs text-gray-600">Расценка</p>
                        </div>
                      </div>

                      {/* Operations Preview */}
                      {template.operations && template.operations.length > 0 && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">
                            Основные операции:
                          </h4>
                          <div className="space-y-1">
                            {template.operations.slice(0, 3).map((operation, index) => (
                              <div key={index} className="flex items-center text-xs text-gray-600">
                                <span className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium mr-2">
                                  {operation.sequenceOrder}
                                </span>
                                <span className="flex-1">{operation.operationName}</span>
                                <span className="text-gray-400 ml-2">
                                  {getEquipmentName(operation.equipmentTypeId)}
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
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <SafeIcon icon={FiBook} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Шаблоны не найдены</h3>
              <p className="text-gray-600">
                {searchTerm 
                  ? 'Попробуйте изменить поисковый запрос'
                  : 'Нет доступных шаблонов для этой модели'
                }
              </p>
            </div>
          )}
        </div>

        {/* Selected Template Details */}
        {selectedTemplate && (
          <div className="border-t bg-blue-50 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">
              Выбранный шаблон: {selectedTemplate.name}
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedTemplate.operations?.length || 0}
                </p>
                <p className="text-sm text-gray-600">операций будет скопировано</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-600">
                  {formatTime(getTotalTime(selectedTemplate.operations))}
                </p>
                <p className="text-sm text-gray-600">плановое время</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-600">
                  {selectedTemplate.operations?.reduce((sum, op) => sum + (op.baseRate || 0), 0) || 0} сом
                </p>
                <p className="text-sm text-gray-600">базовая расценка</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end space-x-3 p-6 border-t">
          <button
            onClick={onClose}
            className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Отмена
          </button>
          <button
            onClick={handleApply}
            disabled={!selectedTemplate || isApplying}
            className={`px-6 py-2 rounded-lg transition-colors flex items-center ${
              selectedTemplate && !isApplying
                ? 'bg-blue-600 text-white hover:bg-blue-700'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isApplying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Применение...
              </>
            ) : (
              <>
                <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
                Применить шаблон
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ApplyTemplateModal;