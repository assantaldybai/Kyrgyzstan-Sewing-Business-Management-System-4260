import React, { createContext, useContext, useState } from 'react';

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: 'Пошив платья для свадьбы',
      description: 'Создать свадебное платье по индивидуальному дизайну',
      assignedTo: 'Айжан Сыдыкова',
      dueDate: '2024-01-15',
      priority: 'high',
      status: 'inProgress'
    },
    {
      id: 2,
      title: 'Закупка шелковой ткани',
      description: 'Заказать 50м шелковой ткани у поставщика',
      assignedTo: 'Нурбек Токтосунов',
      dueDate: '2024-01-10',
      priority: 'medium',
      status: 'pending'
    }
  ]);

  const [inventory, setInventory] = useState([
    {
      id: 1,
      name: 'Хлопковая ткань белая',
      category: 'fabric',
      stockLevel: 45,
      reorderLevel: 20,
      price: 350,
      supplier: 'ТД Текстиль Бишкек'
    },
    {
      id: 2,
      name: 'Шелк натуральный синий',
      category: 'fabric',
      stockLevel: 12,
      reorderLevel: 15,
      price: 1200,
      supplier: 'Импорт Азия'
    },
    {
      id: 3,
      name: 'Нитки полиэстер черные',
      category: 'thread',
      stockLevel: 150,
      reorderLevel: 50,
      price: 25,
      supplier: 'Швейные материалы КГ'
    }
  ]);

  const [employees, setEmployees] = useState([
    {
      id: 1,
      firstName: 'Айжан',
      lastName: 'Сыдыкова',
      position: 'Старший портной',
      department: 'Производство',
      salary: 35000,
      hireDate: '2023-03-15',
      phone: '+996 555 123 456',
      email: 'aizhan@fabric.kg'
    },
    {
      id: 2,
      firstName: 'Нурбек',
      lastName: 'Токтосунов',
      position: 'Менеджер по закупкам',
      department: 'Снабжение',
      salary: 40000,
      hireDate: '2023-01-10',
      phone: '+996 555 789 012',
      email: 'nurbek@fabric.kg'
    }
  ]);

  const [transactions, setTransactions] = useState([
    {
      id: 1,
      type: 'income',
      amount: 15000,
      category: 'Продажа готовых изделий',
      description: 'Продажа 3 платьев',
      date: '2024-01-08',
      paymentMethod: 'cash'
    },
    {
      id: 2,
      type: 'expense',
      amount: 8500,
      category: 'Закупка материалов',
      description: 'Покупка ткани и фурнитуры',
      date: '2024-01-07',
      paymentMethod: 'bankTransfer'
    }
  ]);

  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-2024-001',
      customer: 'Гульнара Асанова',
      orderDate: '2024-01-05',
      deliveryDate: '2024-01-20',
      status: 'inProgress',
      total: 12000,
      items: [
        { name: 'Свадебное платье', quantity: 1, price: 12000 }
      ]
    },
    {
      id: 2,
      orderNumber: 'ORD-2024-002',
      customer: 'Марат Жумабеков',
      orderDate: '2024-01-06',
      deliveryDate: '2024-01-15',
      status: 'pending',
      total: 5500,
      items: [
        { name: 'Мужской костюм', quantity: 1, price: 5500 }
      ]
    }
  ]);

  const addTask = (task) => {
    setTasks([...tasks, { ...task, id: Date.now() }]);
  };

  const updateTask = (id, updatedTask) => {
    setTasks(tasks.map(task => task.id === id ? { ...task, ...updatedTask } : task));
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const addInventoryItem = (item) => {
    setInventory([...inventory, { ...item, id: Date.now() }]);
  };

  const updateInventoryItem = (id, updatedItem) => {
    setInventory(inventory.map(item => item.id === id ? { ...item, ...updatedItem } : item));
  };

  const deleteInventoryItem = (id) => {
    setInventory(inventory.filter(item => item.id !== id));
  };

  const addEmployee = (employee) => {
    setEmployees([...employees, { ...employee, id: Date.now() }]);
  };

  const updateEmployee = (id, updatedEmployee) => {
    setEmployees(employees.map(emp => emp.id === id ? { ...emp, ...updatedEmployee } : emp));
  };

  const deleteEmployee = (id) => {
    setEmployees(employees.filter(emp => emp.id !== id));
  };

  const addTransaction = (transaction) => {
    setTransactions([...transactions, { ...transaction, id: Date.now() }]);
  };

  const addOrder = (order) => {
    setOrders([...orders, { ...order, id: Date.now() }]);
  };

  const updateOrder = (id, updatedOrder) => {
    setOrders(orders.map(order => order.id === id ? { ...order, ...updatedOrder } : order));
  };

  return (
    <DataContext.Provider value={{
      tasks, addTask, updateTask, deleteTask,
      inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem,
      employees, addEmployee, updateEmployee, deleteEmployee,
      transactions, addTransaction,
      orders, addOrder, updateOrder
    }}>
      {children}
    </DataContext.Provider>
  );
};