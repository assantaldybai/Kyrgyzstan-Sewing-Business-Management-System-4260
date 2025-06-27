import React, { createContext, useContext, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

const OrderContext = createContext();

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider = ({ children }) => {
  // Customers (including factory as internal customer)
  const [customers, setCustomers] = useState([
    { 
      id: 'internal', 
      name: 'Фабрика (внутренний заказ)', 
      type: 'internal',
      contactPerson: 'Администратор',
      phone: '+996 555 000 000',
      email: 'admin@fabric.kg'
    },
    { 
      id: uuidv4(), 
      name: 'ООО "Мода Стиль"', 
      type: 'external',
      contactPerson: 'Айгуль Токтогулова',
      phone: '+996 555 123 456',
      email: 'info@modastyle.kg'
    }
  ]);

  // Fabrics
  const [fabrics, setFabrics] = useState([
    { id: uuidv4(), name: 'Хлопок белый', type: 'cotton', pricePerMeter: 250, inStock: 500 },
    { id: uuidv4(), name: 'Шелк синий', type: 'silk', pricePerMeter: 800, inStock: 200 },
    { id: uuidv4(), name: 'Лен бежевый', type: 'linen', pricePerMeter: 450, inStock: 300 }
  ]);

  // Colors
  const [colors, setColors] = useState([
    { id: uuidv4(), name: 'Белый', hex: '#FFFFFF' },
    { id: uuidv4(), name: 'Синий', hex: '#0066CC' },
    { id: uuidv4(), name: 'Черный', hex: '#000000' },
    { id: uuidv4(), name: 'Красный', hex: '#CC0000' },
    { id: uuidv4(), name: 'Зеленый', hex: '#00CC66' }
  ]);

  // Teams/Brigades
  const [teams, setTeams] = useState([
    { 
      id: uuidv4(), 
      name: 'Бригада А', 
      leader: 'Айжан Сыдыкова',
      members: ['Айжан Сыдыкова', 'Гульмира Токтогулова', 'Нурзат Асанова'],
      specialization: 'Платья и блузки'
    },
    { 
      id: uuidv4(), 
      name: 'Бригада Б', 
      leader: 'Салтанат Жумакеева',
      members: ['Салтанат Жумакеева', 'Мээрим Усенова', 'Жылдыз Токтосунова'],
      specialization: 'Брюки и юбки'
    }
  ]);

  // Operations for sewing process
  const [operations, setOperations] = useState([
    { id: uuidv4(), name: 'Раскрой', timeMinutes: 30, rate: 50 },
    { id: uuidv4(), name: 'Обметка', timeMinutes: 15, rate: 25 },
    { id: uuidv4(), name: 'Стачивание боковых швов', timeMinutes: 45, rate: 60 },
    { id: uuidv4(), name: 'Обработка горловины', timeMinutes: 25, rate: 35 },
    { id: uuidv4(), name: 'Обработка рукавов', timeMinutes: 35, rate: 45 },
    { id: uuidv4(), name: 'Подгибка низа', timeMinutes: 20, rate: 30 },
    { id: uuidv4(), name: 'Утюжка', timeMinutes: 10, rate: 15 },
    { id: uuidv4(), name: 'ОТК (контроль качества)', timeMinutes: 5, rate: 10 }
  ]);

  // Product flows (technical processes)
  const [productFlows, setProductFlows] = useState([
    {
      id: uuidv4(),
      name: 'Женское платье стандарт',
      operations: [
        { operationId: operations[0].id, sequence: 1 },
        { operationId: operations[1].id, sequence: 2 },
        { operationId: operations[2].id, sequence: 3 },
        { operationId: operations[3].id, sequence: 4 },
        { operationId: operations[4].id, sequence: 5 },
        { operationId: operations[5].id, sequence: 6 },
        { operationId: operations[6].id, sequence: 7 },
        { operationId: operations[7].id, sequence: 8 }
      ]
    }
  ]);

  // Orders with full characteristics and economics
  const [orders, setOrders] = useState([
    {
      id: uuidv4(),
      orderNumber: 'ORD-2024-001',
      customerId: customers[1].id,
      orderDate: '2024-01-10',
      deliveryDate: '2024-01-25',
      status: 'in_production', // pending, confirmed, in_production, quality_check, completed, delivered
      
      // Initial Economics
      initialEconomics: {
        totalOrderValue: 120000, // Total order value
        advancePayment: 60000,   // Advance payment received
        remainingPayment: 60000  // Remaining to be paid
      },
      
      // Order Items
      items: [
        {
          id: uuidv4(),
          name: 'Женское платье офисное',
          quantity: 10,
          unitPrice: 12000,
          
          // Product characteristics
          characteristics: {
            fabricId: fabrics[0].id,
            colorId: colors[0].id,
            size: 'M',
            flowId: productFlows[0].id,
            teamId: teams[0].id
          },
          
          // Cost calculation
          costBreakdown: {
            fabricCost: 2000,      // Cost of fabric per unit
            laborCost: 3000,       // Labor cost per unit
            overheadCost: 1000,    // Overhead per unit
            totalCostPerUnit: 6000, // Total cost per unit
            profitMargin: 6000     // Profit per unit
          },
          
          // Production tracking
          production: {
            planned: 10,           // Planned quantity
            cutQuantity: 0,        // Quantity cut by cutter
            sewn: 0,              // Quantity sewn
            qualityPassed: 0,      // Quantity passed QC
            rejected: 0,           // Quantity rejected
            delivered: 0           // Quantity delivered
          }
        }
      ],
      
      // Production stages
      stages: {
        cutting: {
          status: 'pending', // pending, in_progress, completed
          assignedTo: null,
          startDate: null,
          completedDate: null,
          actualQuantity: 0
        },
        sewing: {
          status: 'pending',
          assignedTeam: null,
          startDate: null,
          completedDate: null,
          timeTracking: [] // Array of time entries per operation
        },
        qualityControl: {
          status: 'pending',
          inspector: null,
          startDate: null,
          completedDate: null,
          passedQuantity: 0,
          rejectedQuantity: 0,
          rejectionReasons: []
        }
      },
      
      // Payment tracking
      payments: {
        received: 60000,
        pending: 60000,
        history: [
          {
            id: uuidv4(),
            amount: 60000,
            date: '2024-01-10',
            type: 'advance',
            method: 'bank_transfer'
          }
        ]
      }
    }
  ]);

  // Time tracking for operations
  const [timeEntries, setTimeEntries] = useState([]);

  // Functions for managing orders
  const addOrder = (orderData) => {
    const newOrder = {
      ...orderData,
      id: uuidv4(),
      orderNumber: `ORD-${Date.now()}`,
      status: 'pending',
      stages: {
        cutting: { status: 'pending', assignedTo: null, startDate: null, completedDate: null, actualQuantity: 0 },
        sewing: { status: 'pending', assignedTeam: null, startDate: null, completedDate: null, timeTracking: [] },
        qualityControl: { status: 'pending', inspector: null, startDate: null, completedDate: null, passedQuantity: 0, rejectedQuantity: 0, rejectionReasons: [] }
      },
      payments: { received: 0, pending: orderData.initialEconomics?.totalOrderValue || 0, history: [] }
    };
    setOrders([...orders, newOrder]);
  };

  const updateOrder = (orderId, updates) => {
    setOrders(orders.map(order => order.id === orderId ? { ...order, ...updates } : order));
  };

  const updateOrderStage = (orderId, stage, updates) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, stages: { ...order.stages, [stage]: { ...order.stages[stage], ...updates } } }
        : order
    ));
  };

  const addTimeEntry = (orderId, itemId, operationId, timeSpent, workerId) => {
    const timeEntry = {
      id: uuidv4(),
      orderId,
      itemId,
      operationId,
      workerId,
      timeSpent,
      timestamp: new Date().toISOString(),
      rate: operations.find(op => op.id === operationId)?.rate || 0
    };
    setTimeEntries([...timeEntries, timeEntry]);
  };

  const calculateLaborCosts = (orderId) => {
    const orderTimeEntries = timeEntries.filter(entry => entry.orderId === orderId);
    return orderTimeEntries.reduce((total, entry) => {
      return total + (entry.timeSpent * entry.rate / 60); // Convert minutes to hours
    }, 0);
  };

  const addPayment = (orderId, paymentData) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const newPayment = {
          id: uuidv4(),
          ...paymentData,
          date: new Date().toISOString().split('T')[0]
        };
        return {
          ...order,
          payments: {
            ...order.payments,
            received: order.payments.received + paymentData.amount,
            pending: order.payments.pending - paymentData.amount,
            history: [...order.payments.history, newPayment]
          }
        };
      }
      return order;
    }));
  };

  return (
    <OrderContext.Provider value={{
      // Data
      orders,
      customers,
      fabrics,
      colors,
      teams,
      operations,
      productFlows,
      timeEntries,
      
      // Order management
      addOrder,
      updateOrder,
      updateOrderStage,
      
      // Time tracking
      addTimeEntry,
      calculateLaborCosts,
      
      // Payment management
      addPayment,
      
      // Data management
      setCustomers,
      setFabrics,
      setColors,
      setTeams,
      setOperations,
      setProductFlows
    }}>
      {children}
    </OrderContext.Provider>
  );
};