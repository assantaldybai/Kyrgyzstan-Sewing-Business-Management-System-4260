import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    tasks: 'Tasks',
    inventory: 'Inventory',
    employees: 'Employees',
    finances: 'Finances',
    orders: 'Orders',
    settings: 'Settings',
    
    // Common
    add: 'Add',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    import: 'Import',
    total: 'Total',
    status: 'Status',
    date: 'Date',
    name: 'Name',
    description: 'Description',
    price: 'Price',
    quantity: 'Quantity',
    actions: 'Actions',
    
    // Dashboard
    welcomeBack: 'Welcome back',
    totalRevenue: 'Total Revenue',
    activeOrders: 'Active Orders',
    lowStock: 'Low Stock Items',
    pendingTasks: 'Pending Tasks',
    recentOrders: 'Recent Orders',
    topProducts: 'Top Products',
    
    // Tasks
    newTask: 'New Task',
    taskTitle: 'Task Title',
    assignedTo: 'Assigned To',
    dueDate: 'Due Date',
    priority: 'Priority',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    pending: 'Pending',
    inProgress: 'In Progress',
    completed: 'Completed',
    
    // Inventory
    addProduct: 'Add Product',
    productName: 'Product Name',
    category: 'Category',
    stockLevel: 'Stock Level',
    reorderLevel: 'Reorder Level',
    supplier: 'Supplier',
    fabric: 'Fabric',
    thread: 'Thread',
    accessories: 'Accessories',
    
    // Employees
    addEmployee: 'Add Employee',
    firstName: 'First Name',
    lastName: 'Last Name',
    position: 'Position',
    department: 'Department',
    salary: 'Salary',
    hireDate: 'Hire Date',
    phone: 'Phone',
    email: 'Email',
    
    // Finances
    addTransaction: 'Add Transaction',
    income: 'Income',
    expense: 'Expense',
    amount: 'Amount',
    transactionCategory: 'Transaction Category',
    paymentMethod: 'Payment Method',
    cash: 'Cash',
    card: 'Card',
    bankTransfer: 'Bank Transfer',
    
    // Orders
    newOrder: 'New Order',
    orderNumber: 'Order Number',
    customer: 'Customer',
    orderDate: 'Order Date',
    deliveryDate: 'Delivery Date',
    orderTotal: 'Order Total',
    
    // Currency
    kgs: 'KGS'
  },
  ru: {
    // Navigation
    dashboard: 'Панель управления',
    tasks: 'Задачи',
    inventory: 'Склад',
    employees: 'Сотрудники',
    finances: 'Финансы',
    orders: 'Заказы',
    settings: 'Настройки',
    
    // Common
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    cancel: 'Отмена',
    search: 'Поиск',
    filter: 'Фильтр',
    export: 'Экспорт',
    import: 'Импорт',
    total: 'Итого',
    status: 'Статус',
    date: 'Дата',
    name: 'Название',
    description: 'Описание',
    price: 'Цена',
    quantity: 'Количество',
    actions: 'Действия',
    
    // Dashboard
    welcomeBack: 'Добро пожаловать',
    totalRevenue: 'Общая выручка',
    activeOrders: 'Активные заказы',
    lowStock: 'Мало на складе',
    pendingTasks: 'Задачи в ожидании',
    recentOrders: 'Последние заказы',
    topProducts: 'Топ товары',
    
    // Tasks
    newTask: 'Новая задача',
    taskTitle: 'Название задачи',
    assignedTo: 'Назначено',
    dueDate: 'Срок выполнения',
    priority: 'Приоритет',
    high: 'Высокий',
    medium: 'Средний',
    low: 'Низкий',
    pending: 'Ожидание',
    inProgress: 'В работе',
    completed: 'Завершено',
    
    // Inventory
    addProduct: 'Добавить товар',
    productName: 'Название товара',
    category: 'Категория',
    stockLevel: 'Остаток',
    reorderLevel: 'Уровень перезаказа',
    supplier: 'Поставщик',
    fabric: 'Ткань',
    thread: 'Нитки',
    accessories: 'Аксессуары',
    
    // Employees
    addEmployee: 'Добавить сотрудника',
    firstName: 'Имя',
    lastName: 'Фамилия',
    position: 'Должность',
    department: 'Отдел',
    salary: 'Зарплата',
    hireDate: 'Дата найма',
    phone: 'Телефон',
    email: 'Email',
    
    // Finances
    addTransaction: 'Добавить транзакцию',
    income: 'Доход',
    expense: 'Расход',
    amount: 'Сумма',
    transactionCategory: 'Категория транзакции',
    paymentMethod: 'Способ оплаты',
    cash: 'Наличные',
    card: 'Карта',
    bankTransfer: 'Банковский перевод',
    
    // Orders
    newOrder: 'Новый заказ',
    orderNumber: 'Номер заказа',
    customer: 'Клиент',
    orderDate: 'Дата заказа',
    deliveryDate: 'Дата доставки',
    orderTotal: 'Сумма заказа',
    
    // Currency
    kgs: 'сом'
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('ru');

  const t = (key) => {
    return translations[language][key] || key;
  };

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} ${t('kgs')}`;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, formatCurrency }}>
      {children}
    </LanguageContext.Provider>
  );
};