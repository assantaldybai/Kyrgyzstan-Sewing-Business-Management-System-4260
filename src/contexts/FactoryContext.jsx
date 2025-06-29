import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

const FactoryContext = createContext();

export const useFactory = () => {
  const context = useContext(FactoryContext);
  if (!context) {
    throw new Error('useFactory must be used within a FactoryProvider');
  }
  return context;
};

export const FactoryProvider = ({ children }) => {
  // Factory Configuration
  const [factoryConfig, setFactoryConfig] = useState({
    name: 'KEMSEL SYSTEMS',
    type: 'individual', // 'individual' или 'flow'
    isConfigured: false
  });

  // Employees and Teams
  const [employees, setEmployees] = useState([
    {
      id: uuidv4(),
      firstName: 'Айжан',
      lastName: 'Сыдыкова',
      position: 'Старший технолог',
      department: 'management',
      role: 'technologist',
      salary: 45000,
      hireDate: '2023-03-15',
      phone: '+996 555 123 456',
      email: 'aizhan@fabric.kg',
      address: 'г. Бишкек, ул. Чуй 123',
      emergencyContact: 'Сыдыков Марат',
      emergencyPhone: '+996 555 123 457',
      status: 'active',
      skills: ['Разработка техпроцессов', 'Контроль качества', 'Обучение персонала'],
      machineTypes: [],
      teamId: null,
      notes: 'Опытный технолог с 10-летним стажем'
    },
    {
      id: uuidv4(),
      firstName: 'Марат',
      lastName: 'Жумабеков',
      position: 'Кройщик',
      department: 'production',
      role: 'cutter',
      salary: 35000,
      hireDate: '2023-01-10',
      phone: '+996 555 789 012',
      email: 'marat@fabric.kg',
      address: 'г. Бишкек, ул. Манаса 45',
      emergencyContact: 'Жумабекова Гульнара',
      emergencyPhone: '+996 555 789 013',
      status: 'active',
      skills: ['Раскрой платьев', 'Раскрой брюк', 'Работа с трикотажем'],
      machineTypes: ['Раскройная'],
      teamId: null,
      notes: 'Точный и быстрый кройщик'
    },
    {
      id: uuidv4(),
      firstName: 'Нурзат',
      lastName: 'Асанова',
      position: 'Бригадир швейного цеха',
      department: 'production',
      role: 'brigade_leader',
      salary: 40000,
      hireDate: '2022-11-20',
      phone: '+996 555 345 678',
      email: 'nurzat@fabric.kg',
      address: 'г. Бишкек, ул. Токтогула 67',
      emergencyContact: 'Асанов Бекболот',
      emergencyPhone: '+996 555 345 679',
      status: 'active',
      skills: ['Управление бригадой', 'Пошив платьев', 'Контроль качества'],
      machineTypes: ['Универсальная', 'Оверлок'],
      teamId: 'team-1',
      notes: 'Опытный руководитель с хорошими организаторскими способностями'
    },
    {
      id: uuidv4(),
      firstName: 'Гульмира',
      lastName: 'Токтогулова',
      position: 'Швея',
      department: 'production',
      role: 'sewer',
      salary: 30000,
      hireDate: '2023-05-15',
      phone: '+996 555 456 789',
      email: 'gulmira@fabric.kg',
      address: 'г. Бишкек, ул. Ибраимова 89',
      emergencyContact: 'Токтогулов Азамат',
      emergencyPhone: '+996 555 456 790',
      status: 'active',
      skills: ['Пошив платьев', 'Работа с оверлоком', 'Обработка швов'],
      machineTypes: ['Универсальная', 'Оверлок'],
      teamId: 'team-1',
      notes: 'Аккуратная и внимательная к деталям'
    },
    {
      id: uuidv4(),
      firstName: 'Бакыт',
      lastName: 'Орозов',
      position: 'Контролер ОТК',
      department: 'quality',
      role: 'qc_specialist',
      salary: 32000,
      hireDate: '2023-02-01',
      phone: '+996 555 567 890',
      email: 'bakyt@fabric.kg',
      address: 'г. Бишкек, ул. Киевская 12',
      emergencyContact: 'Орозова Жамила',
      emergencyPhone: '+996 555 567 891',
      status: 'active',
      skills: ['Контроль качества', 'Выявление дефектов', 'Документооборот'],
      machineTypes: [],
      teamId: null,
      notes: 'Внимательный и принципиальный контролер'
    },
    {
      id: uuidv4(),
      firstName: 'Салтанат',
      lastName: 'Жумакеева',
      position: 'Упаковщик',
      department: 'logistics',
      role: 'packer',
      salary: 25000,
      hireDate: '2023-06-10',
      phone: '+996 555 678 901',
      email: 'saltanat@fabric.kg',
      address: 'г. Бишкек, ул. Горького 34',
      emergencyContact: 'Жумакеев Талант',
      emergencyPhone: '+996 555 678 902',
      status: 'active',
      skills: ['Упаковка изделий', 'Складские операции', 'Логистика'],
      machineTypes: [],
      teamId: null,
      notes: 'Ответственная и организованная'
    },
    {
      id: uuidv4(),
      firstName: 'Нурбек',
      lastName: 'Токтосунов',
      position: 'Менеджер по закупкам',
      department: 'procurement',
      role: 'procurement_manager',
      salary: 42000,
      hireDate: '2022-09-15',
      phone: '+996 555 789 012',
      email: 'nurbek@fabric.kg',
      address: 'г. Бишкек, ул. Панфилова 56',
      emergencyContact: 'Токтосунова Айгуль',
      emergencyPhone: '+996 555 789 013',
      status: 'active',
      skills: ['Закупки материалов', 'Работа с поставщиками', 'Переговоры'],
      machineTypes: [],
      teamId: null,
      notes: 'Опытный закупщик с хорошими связями'
    }
  ]);

  const [teams, setTeams] = useState([
    {
      id: 'team-1',
      name: 'Бригада А',
      members: ['team-1-member-1', 'team-1-member-2', 'team-1-member-3']
    }
  ]);

  // Materials and Inventory
  const [materials, setMaterials] = useState([
    {
      id: uuidv4(),
      name: 'Хлопок белый',
      type: 'fabric',
      unit: 'метр',
      stockQuantity: 500,
      pricePerUnit: 250,
      supplier: 'ТД Текстиль',
      reorderLevel: 100
    },
    {
      id: uuidv4(),
      name: 'Хлопок синий',
      type: 'fabric',
      unit: 'метр',
      stockQuantity: 300,
      pricePerUnit: 250,
      supplier: 'ТД Текстиль',
      reorderLevel: 100
    },
    {
      id: uuidv4(),
      name: 'Фурнитура стандарт',
      type: 'accessories',
      unit: 'комплект',
      stockQuantity: 1000,
      pricePerUnit: 50,
      supplier: 'Швейные материалы',
      reorderLevel: 200
    }
  ]);

  // Orders
  const [orders, setOrders] = useState([]);

  // Productions
  const [productions, setProductions] = useState([]);

  // Finance Data
  const [finances, setFinances] = useState({
    revenue: 0,
    materialCosts: 0,
    laborCosts: 0,
    overheadCosts: 0,
    profit: 0,
    transactions: []
  });

  // Operations (for sew flow)
  const [operations, setOperations] = useState([
    { id: uuidv4(), name: 'Раскрой', timeMinutes: 30, rate: 100 },
    { id: uuidv4(), name: 'Обметка', timeMinutes: 15, rate: 35 },
    { id: uuidv4(), name: 'Стачивание', timeMinutes: 45, rate: 50 },
    { id: uuidv4(), name: 'Обработка горловины', timeMinutes: 25, rate: 40 },
    { id: uuidv4(), name: 'Рукава', timeMinutes: 35, rate: 45 },
    { id: uuidv4(), name: 'Подгибка', timeMinutes: 20, rate: 30 },
    { id: uuidv4(), name: 'Утюжка', timeMinutes: 10, rate: 25 },
    { id: uuidv4(), name: 'ОТК', timeMinutes: 5, rate: 15 }
  ]);

  // Factory Configuration
  const configureFactory = (config) => {
    setFactoryConfig({ ...config, isConfigured: true });
  };

  // Order Management with Task Integration
  const addOrder = (orderData, taskGenerator = null) => {
    const newOrder = {
      id: uuidv4(),
      orderNumber: `ORD-${Date.now()}`,
      ...orderData,
      status: 'pending',
      createdAt: new Date().toISOString(),
      stages: {
        tech_spec: { status: 'pending', assignedTo: null, completedAt: null },
        procurement: { status: 'blocked', assignedTo: null, completedAt: null },
        cutting: { status: 'blocked', assignedTo: null, actualQuantity: 0, completedAt: null },
        sewing: { status: 'blocked', assignedTeam: null, completedAt: null },
        qc: { status: 'blocked', passedQuantity: 0, rejectedQuantity: 0, completedAt: null },
        final_check: { status: 'blocked', assignedTo: null, completedAt: null },
        packaging: { status: 'blocked', assignedTo: null, completedAt: null }
      },
      finances: {
        totalValue: orderData.quantity * orderData.pricePerUnit,
        advancePayment: orderData.advancePayment || 0,
        materialCosts: 0,
        laborCosts: 0,
        actualCosts: 0,
        profit: 0
      },
      techSpec: {
        completed: false,
        fabricConsumption: orderData.fabricConsumption || 1.2,
        operations: [],
        specialInstructions: '',
        estimatedTime: 0
      },
      procurement: {
        completed: false,
        requiredMaterials: [
          {
            materialId: materials.find(m => m.type === 'fabric')?.id,
            quantity: orderData.quantity * (orderData.fabricConsumption || 1.2),
            unit: 'метр',
            purchased: false
          },
          {
            materialId: materials.find(m => m.type === 'accessories')?.id,
            quantity: orderData.quantity,
            unit: 'комплект',
            purchased: false
          }
        ]
      },
      production: {
        cutting: { planned: orderData.quantity, actual: 0, waste: 0 },
        sewing: { planned: orderData.quantity, completed: 0, inProgress: 0 },
        qc: { checked: 0, passed: 0, rejected: 0, reworked: 0 },
        packaging: { packed: 0 }
      }
    };

    setOrders(prev => [...prev, newOrder]);
    
    // Update finance revenue
    updateFinances('revenue', newOrder.finances.totalValue);
    
    // Auto-generate tasks if task generator is provided
    if (taskGenerator && typeof taskGenerator === 'function') {
      taskGenerator(newOrder);
    }
    
    return newOrder.id;
  };

  const updateOrder = (orderId, updates) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId ? { ...order, ...updates } : order
    ));
  };

  const updateOrderStage = (orderId, stage, updates) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            stages: { 
              ...order.stages, 
              [stage]: { ...order.stages[stage], ...updates } 
            } 
          }
        : order
    ));
  };

  // Update order tech spec
  const updateOrderTechSpec = (orderId, techSpec) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            techSpec: { ...order.techSpec, ...techSpec, completed: true },
            stages: {
              ...order.stages,
              tech_spec: { ...order.stages.tech_spec, status: 'completed', completedAt: new Date().toISOString() }
            }
          }
        : order
    ));
  };

  // Update order procurement
  const updateOrderProcurement = (orderId, procurementData) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            procurement: { ...order.procurement, ...procurementData, completed: true },
            stages: {
              ...order.stages,
              procurement: { ...order.stages.procurement, status: 'completed', completedAt: new Date().toISOString() }
            }
          }
        : order
    ));

    // Update material stock levels
    if (procurementData.requiredMaterials) {
      procurementData.requiredMaterials.forEach(material => {
        if (material.purchased) {
          setMaterials(prev => prev.map(m => 
            m.id === material.materialId 
              ? { ...m, stockQuantity: m.stockQuantity + material.quantity }
              : m
          ));
        }
      });
    }
  };

  // Update production data
  const updateOrderProduction = (orderId, stage, productionData) => {
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            production: { 
              ...order.production, 
              [stage]: { ...order.production[stage], ...productionData } 
            },
            stages: {
              ...order.stages,
              [stage]: { 
                ...order.stages[stage], 
                status: productionData.completed ? 'completed' : 'in_progress',
                completedAt: productionData.completed ? new Date().toISOString() : null
              }
            }
          }
        : order
    ));
  };

  // Material Management
  const consumeMaterial = (materialId, quantity, orderId) => {
    const material = materials.find(m => m.id === materialId);
    if (!material || material.stockQuantity < quantity) {
      throw new Error('Недостаточно материала на складе');
    }

    // Update stock
    setMaterials(prev => prev.map(m => 
      m.id === materialId 
        ? { ...m, stockQuantity: m.stockQuantity - quantity }
        : m
    ));

    // Calculate cost
    const cost = quantity * material.pricePerUnit;
    
    // Update order material costs
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            finances: { 
              ...order.finances, 
              materialCosts: order.finances.materialCosts + cost 
            } 
          }
        : order
    ));

    // Update global finances
    updateFinances('materialCosts', cost);

    return cost;
  };

  const addMaterial = (materialData) => {
    const newMaterial = {
      id: uuidv4(),
      ...materialData
    };
    setMaterials(prev => [...prev, newMaterial]);
  };

  // Check material availability
  const checkMaterialAvailability = (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { available: false, shortages: [] };

    const shortages = [];
    let allAvailable = true;

    order.procurement.requiredMaterials.forEach(reqMaterial => {
      const material = materials.find(m => m.id === reqMaterial.materialId);
      if (!material || material.stockQuantity < reqMaterial.quantity) {
        allAvailable = false;
        shortages.push({
          ...reqMaterial,
          materialName: material?.name || 'Unknown',
          available: material?.stockQuantity || 0,
          shortage: reqMaterial.quantity - (material?.stockQuantity || 0)
        });
      }
    });

    return { available: allAvailable, shortages };
  };

  // Finance Management
  const updateFinances = (type, amount) => {
    setFinances(prev => ({
      ...prev,
      [type]: prev[type] + amount,
      transactions: [
        ...prev.transactions,
        {
          id: uuidv4(),
          type,
          amount,
          timestamp: new Date().toISOString()
        }
      ]
    }));
  };

  const calculateLaborCosts = (orderId, timeEntries) => {
    let totalCost = 0;

    if (factoryConfig.type === 'individual') {
      // Individual flow: pay per piece per machine type
      timeEntries.forEach(entry => {
        const employee = employees.find(e => e.id === entry.employeeId);
        if (employee) {
          totalCost += employee.rate * entry.quantity;
        }
      });
    } else {
      // Flow production: distribute total among team
      const totalTime = timeEntries.reduce((sum, entry) => sum + entry.timeSpent, 0);
      const teamRate = 50; // base rate per hour for team
      totalCost = (totalTime / 60) * teamRate;
    }

    // Update order labor costs
    setOrders(prev => prev.map(order => 
      order.id === orderId 
        ? { 
            ...order, 
            finances: { 
              ...order.finances, 
              laborCosts: totalCost 
            } 
          }
        : order
    ));

    // Update global finances
    updateFinances('laborCosts', totalCost);

    return totalCost;
  };

  // Calculate real-time metrics
  const getMetrics = () => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.finances.totalValue, 0);
    const totalMaterialCosts = orders.reduce((sum, order) => sum + order.finances.materialCosts, 0);
    const totalLaborCosts = orders.reduce((sum, order) => sum + order.finances.laborCosts, 0);
    const totalProfit = totalRevenue - totalMaterialCosts - totalLaborCosts;

    const activeOrders = orders.filter(o => ['pending', 'in_production'].includes(o.status)).length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return {
      totalRevenue,
      totalMaterialCosts,
      totalLaborCosts,
      totalProfit,
      activeOrders,
      completedOrders,
      profitMargin: totalRevenue ? ((totalProfit / totalRevenue) * 100).toFixed(1) : 0
    };
  };

  // Get orders by status for dashboard
  const getOrdersByStatus = () => {
    return orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});
  };

  // Get employees by role
  const getEmployeesByRole = (role) => {
    return employees.filter(emp => emp.role === role);
  };

  // Employee Management Functions
  const addEmployee = (employeeData) => {
    const newEmployee = {
      id: uuidv4(),
      ...employeeData,
      createdAt: new Date().toISOString()
    };
    setEmployees(prev => [...prev, newEmployee]);
    return newEmployee.id;
  };

  const updateEmployee = (employeeId, updates) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, ...updates } : emp
    ));
  };

  const deleteEmployee = (employeeId) => {
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
  };

  return (
    <FactoryContext.Provider value={{
      // Configuration
      factoryConfig,
      configureFactory,
      
      // Data
      employees,
      teams,
      materials,
      orders,
      productions,
      finances,
      operations,
      
      // Order Management
      addOrder,
      updateOrder,
      updateOrderStage,
      updateOrderTechSpec,
      updateOrderProcurement,
      updateOrderProduction,
      
      // Material Management
      consumeMaterial,
      addMaterial,
      checkMaterialAvailability,
      
      // Finance Management
      updateFinances,
      calculateLaborCosts,
      
      // Employee Management
      addEmployee,
      updateEmployee,
      deleteEmployee,
      
      // Analytics
      getMetrics,
      getOrdersByStatus,
      getEmployeesByRole,
      
      // Setters for direct updates
      setEmployees,
      setTeams,
      setMaterials,
      setOrders
    }}>
      {children}
    </FactoryContext.Provider>
  );
};