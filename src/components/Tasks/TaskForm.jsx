import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useData } from '../../contexts/DataContext';
import { useLanguage } from '../../contexts/LanguageContext';

const TaskForm = ({ task, onClose, onSave }) => {
  const { employees } = useData();
  const { t } = useLanguage();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: task || {
      title: '',
      description: '',
      assignedTo: '',
      dueDate: '',
      priority: 'medium',
      status: 'pending'
    }
  });

  const onSubmit = (data) => {
    onSave(data);
    onClose();
  };

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
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {task ? t('edit') : t('newTask')}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('taskTitle')}
            </label>
            <input
              {...register('title', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('taskTitle')}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('description')}
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('description')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('assignedTo')}
            </label>
            <select
              {...register('assignedTo', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Выберите сотрудника</option>
              {employees.map((emp) => (
                <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
            {errors.assignedTo && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('dueDate')}
              </label>
              <input
                {...register('dueDate', { required: true })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.dueDate && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('priority')}
              </label>
              <select
                {...register('priority')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="low">{t('low')}</option>
                <option value="medium">{t('medium')}</option>
                <option value="high">{t('high')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('status')}
            </label>
            <select
              {...register('status')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pending">{t('pending')}</option>
              <option value="inProgress">{t('inProgress')}</option>
              <option value="completed">{t('completed')}</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TaskForm;