import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTask } from '../contexts/TaskContext';
import { useFactory } from '../contexts/FactoryContext';
import TaskBoard from '../components/Tasks/TaskBoard';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiFilter, FiUsers, FiList } = FiIcons;

const Tasks = () => {
  const { getTaskStats } = useTask();
  const { getEmployeesByRole } = useFactory();
  const [selectedRole, setSelectedRole] = useState('all');
  const [viewMode, setViewMode] = useState('board'); // 'board' or 'list'

  const stats = getTaskStats();

  const roles = [
    { value: 'all', label: 'Все задачи', count: stats.total },
    { value: 'technologist', label: 'Технолог', count: 0 },
    { value: 'procurement_manager', label: 'Снабжение', count: 0 },
    { value: 'cutter', label: 'Кройщик', count: 0 },
    { value: 'brigade_leader', label: 'Бригадир', count: 0 },
    { value: 'qc_specialist', label: 'ОТК', count: 0 },
    { value: 'packer', label: 'Упаковка', count: 0 }
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Управление задачами
          </h1>
          <p className="text-gray-600">
            Автоматически генерируемые задачи по производственному циклу
          </p>
        </div>
        
        <div className="flex items-center space-x-3 mt-4 md:mt-0">
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'board' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={FiList} className="w-4 h-4 mr-2" />
              Доска
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-gray-900 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <SafeIcon icon={FiUsers} className="w-4 h-4 mr-2" />
              Список
            </button>
          </div>
        </div>
      </div>

      {/* Task Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Всего задач</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Ожидание</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">В работе</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Завершено</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.4}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Просрочено</div>
        </motion.div>
      </div>

      {/* Role Filter */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-4">
          <SafeIcon icon={FiFilter} className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">Фильтр по ролям</h3>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {roles.map((role) => {
            const employees = role.value !== 'all' ? getEmployeesByRole(role.value) : [];
            
            return (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedRole === role.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {role.label}
                {role.value !== 'all' && employees.length > 0 && (
                  <span className="ml-2 text-xs opacity-75">
                    ({employees.length} чел.)
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Task Flow Explanation */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          🔄 Автоматический поток задач
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
          <div className="text-center">
            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">1</div>
            <p className="text-xs text-gray-600">Технолог</p>
            <p className="text-xs font-medium">Техпроцесс</p>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">2</div>
            <p className="text-xs text-gray-600">Снабжение</p>
            <p className="text-xs font-medium">Закупка</p>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">3</div>
            <p className="text-xs text-gray-600">Кройщик</p>
            <p className="text-xs font-medium">Раскрой</p>
          </div>
          <div className="hidden md:flex items-center justify-center">
            <div className="w-8 h-0.5 bg-gray-300"></div>
          </div>
          <div className="text-center">
            <div className="w-10 h-10 bg-orange-600 text-white rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold">4+</div>
            <p className="text-xs text-gray-600">Далее</p>
            <p className="text-xs font-medium">Пошив→ОТК→Упаковка</p>
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-4 text-center">
          Каждая завершенная задача автоматически разблокирует следующий этап производства
        </p>
      </div>

      {/* Task Board */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
      >
        <TaskBoard role={selectedRole} />
      </motion.div>
    </div>
  );
};

export default Tasks;