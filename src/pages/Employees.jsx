import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

const { FiPlus, FiEdit2, FiTrash2, FiUser } = FiIcons;

const Employees = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useData();
  const { t, formatCurrency } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого сотрудника?')) {
      deleteEmployee(id);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('employees')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          {t('addEmployee')}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map((employee) => (
          <motion.div
            key={employee.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setEditingEmployee(employee);
                    setShowForm(true);
                  }}
                  className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                >
                  <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(employee.id)}
                  className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-blue-600 font-medium mb-2">{employee.position}</p>
            <p className="text-gray-600 text-sm mb-3">{employee.department}</p>
            
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Зарплата:</strong> {formatCurrency(employee.salary)}</p>
              <p><strong>Дата найма:</strong> {employee.hireDate}</p>
              <p><strong>Телефон:</strong> {employee.phone}</p>
              <p><strong>Email:</strong> {employee.email}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Employees;