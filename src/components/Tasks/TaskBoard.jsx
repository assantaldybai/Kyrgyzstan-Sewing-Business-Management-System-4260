import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTask } from '../../contexts/TaskContext';
import { useFactory } from '../../contexts/FactoryContext';
import SafeIcon from '../../common/SafeIcon';
import TaskCompletionForm from './TaskCompletionForm';
import * as FiIcons from 'react-icons/fi';

const { FiClock, FiPlay, FiCheck, FiAlertTriangle, FiUser, FiPackage } = FiIcons;

const TaskBoard = ({ role = 'all' }) => {
  const { 
    tasks, 
    TASK_STATUS, 
    getTasksByRole, 
    startTask, 
    completeTask,
    getTaskStats 
  } = useTask();
  
  const { getEmployeesByRole } = useFactory();
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCompletionForm, setShowCompletionForm] = useState(false);

  const displayTasks = role === 'all' ? tasks : getTasksByRole(role);
  const stats = getTaskStats();

  const getStatusColor = (status) => {
    switch (status) {
      case TASK_STATUS.PENDING: return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case TASK_STATUS.IN_PROGRESS: return 'bg-blue-100 text-blue-800 border-blue-200';
      case TASK_STATUS.COMPLETED: return 'bg-green-100 text-green-800 border-green-200';
      case TASK_STATUS.BLOCKED: return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-orange-600';
      case 'low': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTaskTypeIcon = (type) => {
    switch (type) {
      case 'tech_spec': return FiUser;
      case 'procurement': return FiPackage;
      case 'cutting': return FiClock;
      case 'sewing': return FiUser;
      case 'qc': return FiCheck;
      case 'final_check': return FiUser;
      case 'packaging': return FiPackage;
      default: return FiClock;
    }
  };

  const handleStartTask = (taskId) => {
    startTask(taskId, 'current_user');
  };

  const handleCompleteTask = (task) => {
    setSelectedTask(task);
    setShowCompletionForm(true);
  };

  const handleTaskCompletion = (completionData) => {
    if (selectedTask) {
      completeTask(selectedTask.id, completionData);
      setShowCompletionForm(false);
      setSelectedTask(null);
    }
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-sm text-gray-600">Всего задач</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          <div className="text-sm text-gray-600">Ожидание</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress}</div>
          <div className="text-sm text-gray-600">В работе</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
          <div className="text-sm text-gray-600">Завершено</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <div className="text-sm text-gray-600">Просрочено</div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-4">
        {displayTasks.map((task) => {
          const TaskIcon = getTaskTypeIcon(task.type);
          const overdue = isOverdue(task.dueDate) && task.status !== TASK_STATUS.COMPLETED;
          
          return (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-shadow p-6 ${
                overdue ? 'border-l-red-500' : 
                task.priority === 'high' ? 'border-l-red-400' :
                task.priority === 'medium' ? 'border-l-orange-400' :
                'border-l-green-400'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <SafeIcon icon={TaskIcon} className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                    {overdue && (
                      <SafeIcon icon={FiAlertTriangle} className="w-5 h-5 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 mb-3">{task.description}</p>
                  
                  <div className="flex flex-wrap items-center gap-3 mb-4">
                    <span className={`px-3 py-1 rounded-full text-sm border ${getStatusColor(task.status)}`}>
                      {task.status === TASK_STATUS.PENDING && 'Ожидание'}
                      {task.status === TASK_STATUS.IN_PROGRESS && 'В работе'}
                      {task.status === TASK_STATUS.COMPLETED && 'Завершено'}
                      {task.status === TASK_STATUS.BLOCKED && 'Заблокировано'}
                    </span>
                    
                    <span className={`text-sm font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' && 'Высокий приоритет'}
                      {task.priority === 'medium' && 'Средний приоритет'}
                      {task.priority === 'low' && 'Низкий приоритет'}
                    </span>
                    
                    {task.orderNumber && (
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {task.orderNumber}
                      </span>
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Срок:</span>
                      <p className={overdue ? 'text-red-600 font-medium' : ''}>
                        {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <span className="font-medium">Время:</span>
                      <p>{task.estimatedHours}ч (план)</p>
                      {task.actualHours > 0 && <p>{task.actualHours}ч (факт)</p>}
                    </div>
                    <div>
                      <span className="font-medium">Роль:</span>
                      <p className="capitalize">{task.assignedRole?.replace('_', ' ')}</p>
                    </div>
                    {task.targetQuantity && (
                      <div>
                        <span className="font-medium">Количество:</span>
                        <p>{task.actualQuantity || 0}/{task.targetQuantity}</p>
                      </div>
                    )}
                  </div>
                  
                  {task.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="text-sm font-medium text-gray-700">Заметки:</span>
                      <p className="text-sm text-gray-600 mt-1">{task.notes}</p>
                    </div>
                  )}
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 ml-4">
                  {task.status === TASK_STATUS.PENDING && (
                    <button
                      onClick={() => handleStartTask(task.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
                    >
                      <SafeIcon icon={FiPlay} className="w-4 h-4 mr-2" />
                      Начать
                    </button>
                  )}
                  
                  {task.status === TASK_STATUS.IN_PROGRESS && (
                    <button
                      onClick={() => handleCompleteTask(task)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center text-sm"
                    >
                      <SafeIcon icon={FiCheck} className="w-4 h-4 mr-2" />
                      Завершить
                    </button>
                  )}
                  
                  {task.status === TASK_STATUS.BLOCKED && (
                    <span className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
                      Заблокировано
                    </span>
                  )}
                  
                  {task.status === TASK_STATUS.COMPLETED && (
                    <span className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm text-center">
                      ✓ Выполнено
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {displayTasks.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiCheck} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Нет активных задач</h3>
          <p className="text-gray-600">Все задачи выполнены или ожидают предыдущих этапов</p>
        </div>
      )}

      {/* Task Completion Form */}
      {showCompletionForm && selectedTask && (
        <TaskCompletionForm
          task={selectedTask}
          onClose={() => {
            setShowCompletionForm(false);
            setSelectedTask(null);
          }}
          onComplete={handleTaskCompletion}
        />
      )}
    </div>
  );
};

export default TaskBoard;