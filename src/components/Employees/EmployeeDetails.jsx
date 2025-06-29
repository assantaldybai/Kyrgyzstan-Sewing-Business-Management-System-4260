import React, { useState } from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiUser, FiPhone, FiMail, FiMapPin, FiCalendar, FiDollarSign, FiEdit2, FiClock, FiAward } = FiIcons;

const EmployeeDetails = ({ employee, onClose, onEdit, formatCurrency }) => {
  const [activeTab, setActiveTab] = useState('overview');

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'vacation': return 'bg-blue-100 text-blue-800';
      case 'sick': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'active': return 'Активный';
      case 'inactive': return 'Неактивный';
      case 'vacation': return 'В отпуске';
      case 'sick': return 'На больничном';
      default: return status;
    }
  };

  const getRoleText = (role) => {
    const roleMap = {
      technologist: 'Технолог',
      procurement_manager: 'Менеджер по закупкам',
      cutter: 'Кройщик',
      brigade_leader: 'Бригадир',
      sewer: 'Швея',
      qc_specialist: 'Контролер ОТК',
      packer: 'Упаковщик',
      manager: 'Менеджер',
      accountant: 'Бухгалтер'
    };
    return roleMap[role] || role;
  };

  const getDepartmentText = (department) => {
    const deptMap = {
      production: 'Производство',
      management: 'Управление',
      procurement: 'Снабжение',
      quality: 'Контроль качества',
      logistics: 'Логистика'
    };
    return deptMap[department] || department;
  };

  const calculateWorkExperience = (hireDate) => {
    const hire = new Date(hireDate);
    const now = new Date();
    const diffTime = Math.abs(now - hire);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years > 0) {
      return `${years} лет ${months} месяцев`;
    } else {
      return `${months} месяцев`;
    }
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: FiUser },
    { id: 'skills', name: 'Навыки', icon: FiAward },
    { id: 'performance', name: 'Производительность', icon: FiClock }
  ];

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
          <div className="flex items-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
              <SafeIcon icon={FiUser} className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-gray-600">{employee.position}</p>
              <div className="flex items-center space-x-2 mt-1">
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employee.status)}`}>
                  {getStatusText(employee.status)}
                </span>
                <span className="text-sm text-gray-500">
                  ID: {employee.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onEdit(employee)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
            >
              <SafeIcon icon={FiEdit2} className="w-4 h-4 mr-2" />
              Редактировать
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Личная информация</h3>
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <SafeIcon icon={FiPhone} className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Телефон</p>
                        <p className="font-medium">{employee.phone}</p>
                      </div>
                    </div>
                    {employee.email && (
                      <div className="flex items-center">
                        <SafeIcon icon={FiMail} className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-medium">{employee.email}</p>
                        </div>
                      </div>
                    )}
                    {employee.address && (
                      <div className="flex items-start">
                        <SafeIcon icon={FiMapPin} className="w-5 h-5 text-gray-400 mr-3 mt-1" />
                        <div>
                          <p className="text-sm text-gray-600">Адрес</p>
                          <p className="font-medium">{employee.address}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Рабочая информация</h3>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Роль</p>
                      <p className="font-medium">{getRoleText(employee.role)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Отдел</p>
                      <p className="font-medium">{getDepartmentText(employee.department)}</p>
                    </div>
                    <div className="flex items-center">
                      <SafeIcon icon={FiCalendar} className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm text-gray-600">Дата найма</p>
                        <p className="font-medium">{new Date(employee.hireDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Стаж работы</p>
                      <p className="font-medium">{calculateWorkExperience(employee.hireDate)}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Salary Information */}
              <div className="bg-green-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
                  Финансовая информация
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Базовая зарплата</p>
                    <p className="text-2xl font-bold text-green-600">{formatCurrency(employee.salary)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Годовая зарплата</p>
                    <p className="text-xl font-semibold text-green-700">{formatCurrency(employee.salary * 12)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Статус выплат</p>
                    <p className="text-sm font-medium text-green-800">Актуально</p>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              {(employee.emergencyContact || employee.emergencyPhone) && (
                <div className="bg-red-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Экстренный контакт</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {employee.emergencyContact && (
                      <div>
                        <p className="text-sm text-gray-600">Контактное лицо</p>
                        <p className="font-medium">{employee.emergencyContact}</p>
                      </div>
                    )}
                    {employee.emergencyPhone && (
                      <div>
                        <p className="text-sm text-gray-600">Телефон</p>
                        <p className="font-medium">{employee.emergencyPhone}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {employee.notes && (
                <div className="bg-yellow-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Дополнительные заметки</h3>
                  <p className="text-gray-700">{employee.notes}</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'skills' && (
            <div className="space-y-6">
              {/* Skills */}
              {employee.skills && employee.skills.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Профессиональные навыки</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {employee.skills.map((skill, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-blue-200">
                        <p className="font-medium text-blue-900">{skill}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Machine Types */}
              {employee.machineTypes && employee.machineTypes.length > 0 && (
                <div className="bg-purple-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Оборудование</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {employee.machineTypes.map((machine, index) => (
                      <div key={index} className="bg-white p-3 rounded-lg border border-purple-200">
                        <p className="font-medium text-purple-900">{machine}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(!employee.skills || employee.skills.length === 0) && 
               (!employee.machineTypes || employee.machineTypes.length === 0) && (
                <div className="text-center py-12">
                  <SafeIcon icon={FiAward} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Навыки не указаны</h3>
                  <p className="text-gray-600">Добавьте навыки и оборудование для этого сотрудника</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="text-center py-12">
                <SafeIcon icon={FiClock} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Модуль производительности</h3>
                <p className="text-gray-600">Статистика производительности будет доступна в следующих версиях</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeDetails;