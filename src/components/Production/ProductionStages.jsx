import React from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../../contexts/FactoryContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiScissors, FiUsers, FiCheck, FiPackage, FiClock } = FiIcons;

const ProductionStages = ({ orderId, onStageUpdate }) => {
  const { orders, updateOrderStage, employees } = useFactory();
  
  const order = orders.find(o => o.id === orderId);
  if (!order) return null;

  const stages = [
    {
      id: 'design',
      name: 'Техпроцесс',
      icon: FiCheck,
      color: 'blue',
      description: 'Детализация технологом'
    },
    {
      id: 'cutting',
      name: 'Раскрой',
      icon: FiScissors,
      color: 'green',
      description: 'Раскрой материалов'
    },
    {
      id: 'sewing',
      name: 'Пошив',
      icon: FiUsers,
      color: 'purple',
      description: 'Производство изделий'
    },
    {
      id: 'qc',
      name: 'ОТК',
      icon: FiCheck,
      color: 'orange',
      description: 'Контроль качества'
    },
    {
      id: 'finishing',
      name: 'Упаковка',
      icon: FiPackage,
      color: 'indigo',
      description: 'Финальная обработка'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-400 bg-gray-100';
      case 'in_progress': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      default: return 'text-gray-400 bg-gray-100';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'in_progress': return 'В работе';
      case 'completed': return 'Завершено';
      default: return 'Ожидание';
    }
  };

  const handleStageAction = (stageId, action) => {
    const currentStage = order.stages[stageId];
    
    if (action === 'start') {
      updateOrderStage(orderId, stageId, {
        status: 'in_progress',
        startDate: new Date().toISOString(),
        assignedTo: 'current_user' // В реальной системе - текущий пользователь
      });
    } else if (action === 'complete') {
      updateOrderStage(orderId, stageId, {
        status: 'completed',
        completedDate: new Date().toISOString()
      });
    }
    
    onStageUpdate?.(stageId, action);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Этапы производства
      </h3>
      
      <div className="space-y-3">
        {stages.map((stage, index) => {
          const stageData = order.stages[stage.id];
          const statusColors = getStatusColor(stageData.status);
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white border border-gray-200 rounded-lg p-4"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 ${statusColors}`}>
                    {stageData.status === 'completed' ? (
                      <SafeIcon icon={FiCheck} className="w-5 h-5" />
                    ) : stageData.status === 'in_progress' ? (
                      <SafeIcon icon={FiClock} className="w-5 h-5" />
                    ) : (
                      <SafeIcon icon={stage.icon} className="w-5 h-5" />
                    )}
                  </div>
                  
                  <div>
                    <h4 className="font-medium text-gray-900">{stage.name}</h4>
                    <p className="text-sm text-gray-600">{stage.description}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors}`}>
                    {getStatusText(stageData.status)}
                  </span>
                  
                  {stageData.status === 'pending' && (
                    <button
                      onClick={() => handleStageAction(stage.id, 'start')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Начать
                    </button>
                  )}
                  
                  {stageData.status === 'in_progress' && (
                    <button
                      onClick={() => handleStageAction(stage.id, 'complete')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Завершить
                    </button>
                  )}
                </div>
              </div>
              
              {/* Stage Details */}
              {stageData.status !== 'pending' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    {stageData.assignedTo && (
                      <div>
                        <span className="font-medium">Исполнитель:</span>
                        <p>{stageData.assignedTo}</p>
                      </div>
                    )}
                    
                    {stageData.startDate && (
                      <div>
                        <span className="font-medium">Начато:</span>
                        <p>{new Date(stageData.startDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {stageData.completedDate && (
                      <div>
                        <span className="font-medium">Завершено:</span>
                        <p>{new Date(stageData.completedDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    
                    {stage.id === 'cutting' && stageData.actualQuantity > 0 && (
                      <div>
                        <span className="font-medium">Раскроено:</span>
                        <p>{stageData.actualQuantity} шт.</p>
                      </div>
                    )}
                    
                    {stage.id === 'qc' && (stageData.passedQuantity > 0 || stageData.rejectedQuantity > 0) && (
                      <div className="col-span-2">
                        <span className="font-medium">Результат ОТК:</span>
                        <p>Принято: {stageData.passedQuantity} шт., Брак: {stageData.rejectedQuantity} шт.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductionStages;