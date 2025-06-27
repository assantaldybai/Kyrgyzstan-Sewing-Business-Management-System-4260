import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const TaskContext = createContext();

export const useTask = () => {
  const context = useContext(TaskContext);
  if (!context) {
    throw new Error('useTask must be used within a TaskProvider');
  }
  return context;
};

export const TaskProvider = ({ children }) => {
  const [tasks, setTasks] = useState([]);

  // Task Types and Workflow
  const TASK_TYPES = {
    TECH_SPEC: 'tech_spec',
    PROCUREMENT: 'procurement',
    CUTTING: 'cutting',
    SEWING: 'sewing',
    QC: 'qc',
    FINAL_CHECK: 'final_check',
    PACKAGING: 'packaging'
  };

  const TASK_STATUS = {
    PENDING: 'pending',
    IN_PROGRESS: 'in_progress',
    COMPLETED: 'completed',
    BLOCKED: 'blocked'
  };

  // Auto-generate tasks for new order
  const generateOrderTasks = (order) => {
    const baseTasks = [
      {
        type: TASK_TYPES.TECH_SPEC,
        title: `Детализация техпроцесса для заказа ${order.orderNumber}`,
        description: `Составить техническое описание и расход материалов для ${order.model} (${order.color}, ${order.quantity} шт.)`,
        assignedRole: 'technologist',
        priority: 'high',
        estimatedHours: 2,
        dependencies: [],
        autoNext: TASK_TYPES.PROCUREMENT
      },
      {
        type: TASK_TYPES.PROCUREMENT,
        title: `Закупка материалов для заказа ${order.orderNumber}`,
        description: `Закупить необходимые материалы согласно техспецификации`,
        assignedRole: 'procurement_manager',
        priority: 'high',
        estimatedHours: 4,
        dependencies: [TASK_TYPES.TECH_SPEC],
        autoNext: TASK_TYPES.CUTTING,
        requiredMaterials: [
          {
            name: 'Ткань',
            quantity: order.quantity * (order.fabricConsumption || 1.2),
            unit: 'метр'
          },
          {
            name: 'Фурнитура',
            quantity: order.quantity,
            unit: 'комплект'
          }
        ]
      },
      {
        type: TASK_TYPES.CUTTING,
        title: `Раскрой для заказа ${order.orderNumber}`,
        description: `Раскроить ${order.quantity} единиц ${order.model}`,
        assignedRole: 'cutter',
        priority: 'medium',
        estimatedHours: Math.ceil(order.quantity * 0.5), // 30 мин на единицу
        dependencies: [TASK_TYPES.PROCUREMENT],
        autoNext: TASK_TYPES.SEWING,
        targetQuantity: order.quantity
      },
      {
        type: TASK_TYPES.SEWING,
        title: `Пошив для заказа ${order.orderNumber}`,
        description: `Пошить ${order.quantity} единиц ${order.model}`,
        assignedRole: 'brigade_leader',
        priority: 'medium',
        estimatedHours: Math.ceil(order.quantity * 2), // 2 часа на единицу
        dependencies: [TASK_TYPES.CUTTING],
        autoNext: TASK_TYPES.QC,
        targetQuantity: order.quantity
      },
      {
        type: TASK_TYPES.QC,
        title: `Контроль качества для заказа ${order.orderNumber}`,
        description: `Проверить качество ${order.quantity} единиц ${order.model}`,
        assignedRole: 'qc_specialist',
        priority: 'high',
        estimatedHours: Math.ceil(order.quantity * 0.25), // 15 мин на единицу
        dependencies: [TASK_TYPES.SEWING],
        autoNext: TASK_TYPES.FINAL_CHECK,
        targetQuantity: order.quantity
      },
      {
        type: TASK_TYPES.FINAL_CHECK,
        title: `Финальная проверка для заказа ${order.orderNumber}`,
        description: `Финальная проверка технологом перед упаковкой`,
        assignedRole: 'technologist',
        priority: 'medium',
        estimatedHours: 1,
        dependencies: [TASK_TYPES.QC],
        autoNext: TASK_TYPES.PACKAGING
      },
      {
        type: TASK_TYPES.PACKAGING,
        title: `Упаковка для заказа ${order.orderNumber}`,
        description: `Упаковать готовые изделия для отправки`,
        assignedRole: 'packer',
        priority: 'low',
        estimatedHours: Math.ceil(order.quantity * 0.1), // 6 мин на единицу
        dependencies: [TASK_TYPES.FINAL_CHECK],
        autoNext: null
      }
    ];

    const generatedTasks = baseTasks.map((taskTemplate, index) => ({
      id: uuidv4(),
      orderId: order.id,
      orderNumber: order.orderNumber,
      ...taskTemplate,
      status: index === 0 ? TASK_STATUS.PENDING : TASK_STATUS.BLOCKED,
      createdAt: new Date().toISOString(),
      dueDate: calculateDueDate(taskTemplate.estimatedHours, index),
      actualHours: 0,
      completedAt: null,
      completedBy: null,
      notes: '',
      attachments: []
    }));

    setTasks(prev => [...prev, ...generatedTasks]);
    return generatedTasks;
  };

  // Calculate due date based on task sequence
  const calculateDueDate = (estimatedHours, sequence) => {
    const now = new Date();
    const daysToAdd = Math.ceil((sequence * 8 + estimatedHours) / 8); // 8 hours per day
    now.setDate(now.getDate() + daysToAdd);
    return now.toISOString().split('T')[0];
  };

  // Complete task and auto-generate next
  const completeTask = (taskId, completionData = {}) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Update completed task
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? {
            ...t,
            status: TASK_STATUS.COMPLETED,
            completedAt: new Date().toISOString(),
            completedBy: completionData.completedBy || 'current_user',
            actualHours: completionData.actualHours || t.estimatedHours,
            notes: completionData.notes || '',
            actualQuantity: completionData.actualQuantity || t.targetQuantity
          }
        : t
    ));

    // Unlock next tasks in the same order
    if (task.autoNext) {
      setTasks(prev => prev.map(t => 
        t.orderId === task.orderId && 
        t.type === task.autoNext && 
        t.status === TASK_STATUS.BLOCKED
          ? { ...t, status: TASK_STATUS.PENDING }
          : t
      ));
    }

    // Special handling for specific task types
    handleTaskSpecialActions(task, completionData);
  };

  // Handle special actions after task completion
  const handleTaskSpecialActions = (task, completionData) => {
    switch (task.type) {
      case TASK_TYPES.TECH_SPEC:
        // Update order with tech specifications
        if (completionData.techSpec) {
          // This would update the order in FactoryContext
          console.log('Tech spec completed:', completionData.techSpec);
        }
        break;

      case TASK_TYPES.PROCUREMENT:
        // Update inventory levels
        if (completionData.purchasedMaterials) {
          console.log('Materials purchased:', completionData.purchasedMaterials);
        }
        break;

      case TASK_TYPES.CUTTING:
        // Update cutting quantities
        if (completionData.actualQuantity) {
          console.log('Cut quantity:', completionData.actualQuantity);
        }
        break;

      case TASK_TYPES.QC:
        // Handle quality control results
        if (completionData.qcResults) {
          const { passed, rejected, reworkNeeded } = completionData.qcResults;
          
          // If there's rework needed, create additional tasks
          if (reworkNeeded > 0) {
            generateReworkTasks(task.orderId, reworkNeeded);
          }
          
          console.log('QC Results:', { passed, rejected, reworkNeeded });
        }
        break;

      default:
        break;
    }
  };

  // Generate rework tasks if needed
  const generateReworkTasks = (orderId, quantity) => {
    const reworkTask = {
      id: uuidv4(),
      orderId,
      type: 'rework',
      title: `Переделка ${quantity} единиц`,
      description: `Исправить дефекты в ${quantity} изделиях`,
      assignedRole: 'brigade_leader',
      priority: 'high',
      status: TASK_STATUS.PENDING,
      estimatedHours: quantity * 1, // 1 час на переделку
      targetQuantity: quantity,
      createdAt: new Date().toISOString(),
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0] // Tomorrow
    };

    setTasks(prev => [...prev, reworkTask]);
  };

  // Start task
  const startTask = (taskId, startedBy) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId 
        ? {
            ...t,
            status: TASK_STATUS.IN_PROGRESS,
            startedAt: new Date().toISOString(),
            startedBy
          }
        : t
    ));
  };

  // Get tasks by role
  const getTasksByRole = (role) => {
    return tasks.filter(task => 
      task.assignedRole === role && 
      task.status !== TASK_STATUS.COMPLETED
    ).sort((a, b) => {
      // Priority sorting
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });
  };

  // Get tasks by order
  const getTasksByOrder = (orderId) => {
    return tasks.filter(task => task.orderId === orderId)
      .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  };

  // Get task statistics
  const getTaskStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === TASK_STATUS.COMPLETED).length;
    const inProgress = tasks.filter(t => t.status === TASK_STATUS.IN_PROGRESS).length;
    const pending = tasks.filter(t => t.status === TASK_STATUS.PENDING).length;
    const overdue = tasks.filter(t => 
      t.status !== TASK_STATUS.COMPLETED && 
      new Date(t.dueDate) < new Date()
    ).length;

    return { total, completed, inProgress, pending, overdue };
  };

  // Update task
  const updateTask = (taskId, updates) => {
    setTasks(prev => prev.map(t => 
      t.id === taskId ? { ...t, ...updates } : t
    ));
  };

  // Add manual task
  const addTask = (taskData) => {
    const newTask = {
      id: uuidv4(),
      ...taskData,
      createdAt: new Date().toISOString(),
      status: TASK_STATUS.PENDING
    };
    setTasks(prev => [...prev, newTask]);
    return newTask.id;
  };

  return (
    <TaskContext.Provider value={{
      tasks,
      TASK_TYPES,
      TASK_STATUS,
      
      // Core functions
      generateOrderTasks,
      completeTask,
      startTask,
      updateTask,
      addTask,
      
      // Query functions
      getTasksByRole,
      getTasksByOrder,
      getTaskStats,
      
      // Direct setters
      setTasks
    }}>
      {children}
    </TaskContext.Provider>
  );
};