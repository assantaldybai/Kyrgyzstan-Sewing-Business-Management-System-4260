import React from 'react';
import { motion } from 'framer-motion';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiUser, FiPhone, FiMail, FiCalendar, FiEdit2, FiTrash2, FiMoreVertical } = FiIcons;

const EmployeeCard = ({ employee, onEdit, onDelete, onViewDetails, formatCurrency }) => {
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

  const getRoleColor = (role) => {
    switch (role) {
      case 'technologist': return 'bg-purple-100 text-purple-800';
      case 'procurement_manager': return 'bg-orange-100 text-orange-800';
      case 'cutter': return 'bg-blue-100 text-blue-800';
      case 'brigade_leader': return 'bg-indigo-100 text-indigo-800';
      case 'sewer': return 'bg-green-100 text-green-800';
      case 'qc_specialist': return 'bg-yellow-100 text-yellow-800';
      case 'packer': return 'bg-pink-100 text-pink-800';
      default: return 'bg-gray-100 text-gray-800';
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
            <SafeIcon icon={FiUser} className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {employee.firstName} {employee.lastName}
            </h3>
            <p className="text-sm text-gray-600">{employee.position}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(employee.status)}`}>
            {getStatusText(employee.status)}
          </span>
          <div className="relative group">
            <button className="p-1 text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiMoreVertical} className="w-4 h-4" />
            </button>
            <div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button
                onClick={() => onEdit(employee)}
                className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center"
              >
                <SafeIcon icon={FiEdit2} className="w-4 h-4 mr-2" />
                Редактировать
              </button>
              <button
                onClick={() => onDelete(employee.id)}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
              >
                <SafeIcon icon={FiTrash2} className="w-4 h-4 mr-2" />
                Удалить
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Role and Department */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(employee.role)}`}>
          {getRoleText(employee.role)}
        </span>
        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
          {employee.department}
        </span>
      </div>

      {/* Contact Info */}
      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <SafeIcon icon={FiPhone} className="w-4 h-4 mr-2" />
          {employee.phone}
        </div>
        {employee.email && (
          <div className="flex items-center text-sm text-gray-600">
            <SafeIcon icon={FiMail} className="w-4 h-4 mr-2" />
            {employee.email}
          </div>
        )}
        <div className="flex items-center text-sm text-gray-600">
          <SafeIcon icon={FiCalendar} className="w-4 h-4 mr-2" />
          Принят: {new Date(employee.hireDate).toLocaleDateString()}
        </div>
      </div>

      {/* Salary */}
      <div className="bg-green-50 rounded-lg p-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-green-900">Зарплата</span>
          <span className="text-lg font-bold text-green-600">
            {formatCurrency(employee.salary)}
          </span>
        </div>
      </div>

      {/* Skills (for production roles) */}
      {employee.skills && employee.skills.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Навыки</h4>
          <div className="flex flex-wrap gap-1">
            {employee.skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded">
                {skill}
              </span>
            ))}
            {employee.skills.length > 3 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{employee.skills.length - 3} еще
              </span>
            )}
          </div>
        </div>
      )}

      {/* Machine Types (for production roles) */}
      {employee.machineTypes && employee.machineTypes.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Оборудование</h4>
          <div className="flex flex-wrap gap-1">
            {employee.machineTypes.slice(0, 2).map((machine, index) => (
              <span key={index} className="px-2 py-1 text-xs bg-purple-50 text-purple-700 rounded">
                {machine}
              </span>
            ))}
            {employee.machineTypes.length > 2 && (
              <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                +{employee.machineTypes.length - 2} еще
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Button */}
      <button
        onClick={() => onViewDetails(employee)}
        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
      >
        Подробнее
      </button>
    </motion.div>
  );
};

export default EmployeeCard;