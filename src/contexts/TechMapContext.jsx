import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TechMapContext = createContext();

export const useTechMap = () => {
  const context = useContext(TechMapContext);
  if (!context) {
    throw new Error('useTechMap must be used within a TechMapProvider');
  }
  return context;
};

export const TechMapProvider = ({ children }) => {
  // Модели изделий
  const [productModels, setProductModels] = useState([
    {
      id: uuidv4(),
      name: 'Футболка классическая',
      articleNumber: 'T-001',
      description: 'Базовая футболка с коротким рукавом',
      category: 'clothing'
    },
    {
      id: uuidv4(),
      name: 'Худи оверсайз',
      articleNumber: 'H-101',
      description: 'Толстовка с капюшоном свободного кроя',
      category: 'clothing'
    },
    {
      id: uuidv4(),
      name: 'Платье офисное',
      articleNumber: 'D-201',
      description: 'Деловое платье прямого силуэта',
      category: 'clothing'
    },
    {
      id: uuidv4(),
      name: 'Брюки классические',
      articleNumber: 'P-301',
      description: 'Прямые брюки со стрелками',
      category: 'clothing'
    }
  ]);

  // Типы оборудования
  const [equipmentTypes, setEquipmentTypes] = useState([
    {
      id: uuidv4(),
      name: 'Универсальная машина',
      description: 'Стандартная швейная машина для основных операций',
      category: 'sewing'
    },
    {
      id: uuidv4(),
      name: 'Оверлок',
      description: 'Машина для обметки краев',
      category: 'sewing'
    },
    {
      id: uuidv4(),
      name: 'Плоскошовная',
      description: 'Машина для плоских швов',
      category: 'sewing'
    },
    {
      id: uuidv4(),
      name: 'Петельная',
      description: 'Машина для выметывания петель',
      category: 'sewing'
    },
    {
      id: uuidv4(),
      name: 'Пуговичная',
      description: 'Машина для пришивания пуговиц',
      category: 'sewing'
    },
    {
      id: uuidv4(),
      name: 'Раскройная машина',
      description: 'Оборудование для раскроя ткани',
      category: 'cutting'
    },
    {
      id: uuidv4(),
      name: 'Утюжильная станция',
      description: 'Оборудование для ВТО',
      category: 'pressing'
    }
  ]);

  // Шаблоны технологических карт
  const [techMapTemplates, setTechMapTemplates] = useState([
    {
      id: uuidv4(),
      name: 'Футболка базовая - стандартный процесс',
      modelId: productModels[0]?.id,
      description: 'Стандартная технологическая карта для пошива базовой футболки',
      isActive: true,
      createdAt: new Date().toISOString(),
      operations: [
        {
          id: uuidv4(),
          operationName: 'Раскрой деталей',
          sequenceOrder: 1,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Раскройная машина')?.id,
          baseRate: 50,
          estimatedTimeMinutes: 30,
          description: 'Раскрой всех деталей футболки по лекалам'
        },
        {
          id: uuidv4(),
          operationName: 'Обметка деталей',
          sequenceOrder: 2,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Оверлок')?.id,
          baseRate: 35,
          estimatedTimeMinutes: 20,
          description: 'Обметка срезов всех деталей'
        },
        {
          id: uuidv4(),
          operationName: 'Стачивание плечевых швов',
          sequenceOrder: 3,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Универсальная машина')?.id,
          baseRate: 25,
          estimatedTimeMinutes: 15,
          description: 'Соединение передней и задней части по плечевым швам'
        },
        {
          id: uuidv4(),
          operationName: 'Обработка горловины',
          sequenceOrder: 4,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Универсальная машина')?.id,
          baseRate: 40,
          estimatedTimeMinutes: 25,
          description: 'Притачивание бейки к горловине'
        },
        {
          id: uuidv4(),
          operationName: 'Втачивание рукавов',
          sequenceOrder: 5,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Универсальная машина')?.id,
          baseRate: 45,
          estimatedTimeMinutes: 30,
          description: 'Втачивание рукавов в проймы'
        },
        {
          id: uuidv4(),
          operationName: 'Стачивание боковых швов',
          sequenceOrder: 6,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Универсальная машина')?.id,
          baseRate: 30,
          estimatedTimeMinutes: 20,
          description: 'Соединение боковых швов и швов рукавов'
        },
        {
          id: uuidv4(),
          operationName: 'Подгибка низа',
          sequenceOrder: 7,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Универсальная машина')?.id,
          baseRate: 20,
          estimatedTimeMinutes: 15,
          description: 'Обработка низа изделия и рукавов'
        },
        {
          id: uuidv4(),
          operationName: 'ВТО готового изделия',
          sequenceOrder: 8,
          equipmentTypeId: equipmentTypes.find(e => e.name === 'Утюжильная станция')?.id,
          baseRate: 15,
          estimatedTimeMinutes: 10,
          description: 'Влажно-тепловая обработка готового изделия'
        }
      ]
    }
  ]);

  // Производственные партии
  const [productionLots, setProductionLots] = useState([]);

  // Операции для партий (sew_flow)
  const [sewFlowOperations, setSewFlowOperations] = useState([]);

  // CRUD операции для моделей изделий
  const addProductModel = (modelData) => {
    const newModel = {
      id: uuidv4(),
      ...modelData,
      createdAt: new Date().toISOString()
    };
    setProductModels(prev => [...prev, newModel]);
    return newModel.id;
  };

  const updateProductModel = (modelId, updates) => {
    setProductModels(prev => prev.map(model => 
      model.id === modelId ? { ...model, ...updates } : model
    ));
  };

  const deleteProductModel = (modelId) => {
    setProductModels(prev => prev.filter(model => model.id !== modelId));
  };

  // CRUD операции для шаблонов
  const addTechMapTemplate = (templateData) => {
    const newTemplate = {
      id: uuidv4(),
      ...templateData,
      isActive: true,
      createdAt: new Date().toISOString(),
      operations: templateData.operations || []
    };
    setTechMapTemplates(prev => [...prev, newTemplate]);
    return newTemplate.id;
  };

  const updateTechMapTemplate = (templateId, updates) => {
    setTechMapTemplates(prev => prev.map(template => 
      template.id === templateId ? { ...template, ...updates } : template
    ));
  };

  const deleteTechMapTemplate = (templateId) => {
    setTechMapTemplates(prev => prev.filter(template => template.id !== templateId));
  };

  // Применение шаблона к партии
  const applyTemplateToLot = async (templateId, lotId) => {
    try {
      const template = techMapTemplates.find(t => t.id === templateId);
      if (!template) {
        throw new Error('Шаблон не найден');
      }

      // Удаляем существующие операции для этой партии
      setSewFlowOperations(prev => prev.filter(op => op.lotId !== lotId));

      // Копируем операции из шаблона
      const newOperations = template.operations.map(op => ({
        id: uuidv4(),
        lotId: lotId,
        operationName: op.operationName,
        sequenceOrder: op.sequenceOrder,
        equipmentTypeId: op.equipmentTypeId,
        rate: op.baseRate || 0,
        estimatedTimeMinutes: op.estimatedTimeMinutes || 0,
        actualTimeMinutes: 0,
        status: 'pending',
        assignedEmployeeId: null,
        completedAt: null,
        notes: op.description || '',
        createdAt: new Date().toISOString()
      }));

      setSewFlowOperations(prev => [...prev, ...newOperations]);

      // Обновляем статус партии
      setProductionLots(prev => prev.map(lot => 
        lot.id === lotId 
          ? { 
              ...lot, 
              techMapApplied: true, 
              appliedTemplateId: templateId,
              status: 'ready_for_production'
            }
          : lot
      ));

      return {
        success: true,
        appliedOperations: newOperations.length,
        templateName: template.name
      };
    } catch (error) {
      console.error('Ошибка применения шаблона:', error);
      throw error;
    }
  };

  // Создание производственной партии
  const createProductionLot = (lotData) => {
    const newLot = {
      id: uuidv4(),
      lotNumber: `LOT-${Date.now()}`,
      ...lotData,
      status: 'planning',
      techMapApplied: false,
      appliedTemplateId: null,
      createdAt: new Date().toISOString()
    };
    setProductionLots(prev => [...prev, newLot]);
    return newLot.id;
  };

  // Получение операций для партии
  const getOperationsForLot = (lotId) => {
    return sewFlowOperations
      .filter(op => op.lotId === lotId)
      .sort((a, b) => a.sequenceOrder - b.sequenceOrder);
  };

  // Обновление операции
  const updateSewFlowOperation = (operationId, updates) => {
    setSewFlowOperations(prev => prev.map(op => 
      op.id === operationId ? { ...op, ...updates } : op
    ));
  };

  // Удаление операции
  const deleteSewFlowOperation = (operationId) => {
    setSewFlowOperations(prev => prev.filter(op => op.id !== operationId));
  };

  // Получение шаблонов по модели
  const getTemplatesByModel = (modelId) => {
    return techMapTemplates.filter(template => 
      template.modelId === modelId && template.isActive
    );
  };

  // Поиск шаблонов
  const searchTemplates = (searchTerm) => {
    if (!searchTerm) return techMapTemplates;
    
    return techMapTemplates.filter(template =>
      template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      template.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  };

  return (
    <TechMapContext.Provider value={{
      // Данные
      productModels,
      equipmentTypes,
      techMapTemplates,
      productionLots,
      sewFlowOperations,

      // Модели изделий
      addProductModel,
      updateProductModel,
      deleteProductModel,

      // Шаблоны
      addTechMapTemplate,
      updateTechMapTemplate,
      deleteTechMapTemplate,
      getTemplatesByModel,
      searchTemplates,

      // Производственные партии
      createProductionLot,
      applyTemplateToLot,

      // Операции
      getOperationsForLot,
      updateSewFlowOperation,
      deleteSewFlowOperation,

      // Сеттеры для прямого обновления
      setProductModels,
      setEquipmentTypes,
      setTechMapTemplates,
      setProductionLots,
      setSewFlowOperations
    }}>
      {children}
    </TechMapContext.Provider>
  );
};