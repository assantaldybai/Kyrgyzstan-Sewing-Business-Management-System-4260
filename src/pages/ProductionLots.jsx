import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTechMap } from '../contexts/TechMapContext';
import { useFactory } from '../contexts/FactoryContext';
import ApplyTemplateModal from '../components/TechMaps/ApplyTemplateModal';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiBook, FiSettings, FiClock, FiCheck, FiEdit2, FiTrash2 } = FiIcons;

const ProductionLots = () => {
  const { 
    productionLots, 
    createProductionLot, 
    applyTemplateToLot,
    getOperationsForLot,
    updateSewFlowOperation,
    deleteSewFlowOperation,
    productModels,
    equipmentTypes
  } = useTechMap();
  
  const { orders } = useFactory();
  
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [selectedLot, setSelectedLot] = useState(null);
  const [showOperations, setShowOperations] = useState({});

  const getModelName = (modelId) => {
    const model = productModels.find(m => m.id === modelId);
    return model ? model.name : 'Неизвестная модель';
  };

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

  const getStatusColor = (status) => {
    switch (status) {
      case 'planning': return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_production': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'planning': return 'Планирование';
      case 'ready_for_production': return 'Готов к производству';
      case 'in_production': return 'В производстве';
      case 'completed': return 'Завершен';
      default: return status;
    }
  };

  const handleApplyTemplate = (lotId, modelId) => {
    setSelectedLot({ id: lotId, modelId });
    setShowTemplateModal(true);
  };

  const handleTemplateApplied = async (templateId, lotId) => {
    try {
      await applyTemplateToLot(templateId, lotId);
      alert('Шаблон успешно применен!');
    } catch (error) {
      console.error('Ошибка применения шаблона:', error);
      alert('Ошибка при применении шаблона');
    }
  };

  const toggleOperations = (lotId) => {
    setShowOperations(prev => ({
      ...prev,
      [lotId]: !prev[lotId]
    }));
  };

  const handleOperationStatusChange = (operationId, newStatus) => {
    updateSewFlowOperation(operationId, { 
      status: newStatus,
      completedAt: newStatus === 'completed' ? new Date().toISOString() : null
    });
  };

  // Создание тестовой партии для демонстрации
  const createTestLot = () => {
    const testOrder = orders[0]; // Берем первый заказ
    const testModel = productModels[0]; // Берем первую модель
    
    createProductionLot({
      orderId: testOrder?.id,
      modelId: testModel?.id,
      quantity: 50
    });
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Производственные партии
          </h1>
          <p className="text-gray-600">
            Управление партиями и применение технологических карт
          </p>
        </div>
        <button
          onClick={createTestLot}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
          Создать партию
        </button>
      </div>

      {/* Production Lots */}
      <div className="space-y-6">
        {productionLots.map((lot) => {
          const operations = getOperationsForLot(lot.id);
          const isExpanded = showOperations[lot.id];
          
          return (
            <motion.div
              key={lot.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Lot Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-4">
                      <SafeIcon icon={FiSettings} className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {lot.lotNumber}
                      </h3>
                      <p className="text-gray-600">
                        {getModelName(lot.modelId)} • {lot.quantity} шт.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 text-sm rounded-full ${getStatusColor(lot.status)}`}>
                      {getStatusText(lot.status)}
                    </span>
                    
                    {!lot.techMapApplied ? (
                      <button
                        onClick={() => handleApplyTemplate(lot.id, lot.modelId)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                      >
                        <SafeIcon icon={FiBook} className="w-4 h-4 mr-2" />
                        Применить шаблон
                      </button>
                    ) : (
                      <button
                        onClick={() => toggleOperations(lot.id)}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center"
                      >
                        <SafeIcon icon={FiSettings} className="w-4 h-4 mr-2" />
                        {isExpanded ? 'Скрыть операции' : 'Показать операции'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Lot Stats */}
                {lot.techMapApplied && operations.length > 0 && (
                  <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t border-gray-100">
                    <div className="text-center">
                      <p className="text-lg font-bold text-gray-900">{operations.length}</p>
                      <p className="text-sm text-gray-600">Операций</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-green-600">
                        {operations.filter(op => op.status === 'completed').length}
                      </p>
                      <p className="text-sm text-gray-600">Завершено</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-blue-600">
                        {operations.filter(op => op.status === 'in_progress').length}
                      </p>
                      <p className="text-sm text-gray-600">В работе</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-bold text-orange-600">
                        {formatTime(operations.reduce((sum, op) => sum + (op.estimatedTimeMinutes || 0), 0))}
                      </p>
                      <p className="text-sm text-gray-600">Плановое время</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Operations List */}
              {isExpanded && operations.length > 0 && (
                <div className="p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Технологические операции
                  </h4>
                  
                  <div className="space-y-3">
                    {operations.map((operation) => (
                      <div
                        key={operation.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-blue-600 font-bold text-sm">
                            {operation.sequenceOrder}
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-900">
                              {operation.operationName}
                            </h5>
                            <p className="text-sm text-gray-600">
                              {getEquipmentName(operation.equipmentTypeId)}
                              {operation.estimatedTimeMinutes > 0 && (
                                <> • {formatTime(operation.estimatedTimeMinutes)}</>
                              )}
                              {operation.rate > 0 && (
                                <> • {operation.rate} сом</>
                              )}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <select
                            value={operation.status}
                            onChange={(e) => handleOperationStatusChange(operation.id, e.target.value)}
                            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="pending">Ожидание</option>
                            <option value="in_progress">В работе</option>
                            <option value="completed">Завершено</option>
                          </select>
                          
                          <button
                            onClick={() => deleteSewFlowOperation(operation.id)}
                            className="p-1 text-red-500 hover:bg-red-50 rounded"
                          >
                            <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* No Template Applied */}
              {!lot.techMapApplied && (
                <div className="p-6 text-center bg-yellow-50">
                  <SafeIcon icon={FiBook} className="w-12 h-12 mx-auto text-yellow-500 mb-3" />
                  <h4 className="text-lg font-medium text-yellow-900 mb-2">
                    Технологическая карта не применена
                  </h4>
                  <p className="text-yellow-700 mb-4">
                    Примените шаблон технологической карты для начала производства
                  </p>
                  <button
                    onClick={() => handleApplyTemplate(lot.id, lot.modelId)}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
                  >
                    Применить шаблон
                  </button>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Empty State */}
      {productionLots.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiSettings} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет производственных партий</h3>
          <p className="text-gray-600 mb-4">
            Создайте первую производственную партию для начала работы
          </p>
          <button
            onClick={createTestLot}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            Создать партию
          </button>
        </div>
      )}

      {/* Apply Template Modal */}
      {showTemplateModal && selectedLot && (
        <ApplyTemplateModal
          lotId={selectedLot.id}
          modelId={selectedLot.modelId}
          onClose={() => {
            setShowTemplateModal(false);
            setSelectedLot(null);
          }}
          onApply={handleTemplateApplied}
        />
      )}
    </div>
  );
};

export default ProductionLots;