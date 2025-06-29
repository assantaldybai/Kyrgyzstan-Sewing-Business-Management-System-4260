import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiUser } = FiIcons;

const EmployeeForm = ({ employee, onClose, onSave }) => {
  const { t, formatCurrency } = useLanguage();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: employee || {
      firstName: '',
      lastName: '',
      position: '',
      department: 'production',
      role: 'sewer',
      salary: 0,
      hireDate: new Date().toISOString().split('T')[0],
      phone: '',
      email: '',
      address: '',
      emergencyContact: '',
      emergencyPhone: '',
      skills: [],
      machineTypes: [],
      teamId: '',
      status: 'active',
      notes: ''
    }
  });

  const watchedRole = watch('role');

  const departments = [
    { value: 'production', label: 'Производство' },
    { value: 'management', label: 'Управление' },
    { value: 'procurement', label: 'Снабжение' },
    { value: 'quality', label: 'Контроль качества' },
    { value: 'logistics', label: 'Логистика' }
  ];

  const roles = [
    { value: 'technologist', label: 'Технолог', department: 'management' },
    { value: 'procurement_manager', label: 'Менеджер по закупкам', department: 'procurement' },
    { value: 'cutter', label: 'Кройщик', department: 'production' },
    { value: 'brigade_leader', label: 'Бригадир', department: 'production' },
    { value: 'sewer', label: 'Швея', department: 'production' },
    { value: 'qc_specialist', label: 'Контролер ОТК', department: 'quality' },
    { value: 'packer', label: 'Упаковщик', department: 'logistics' },
    { value: 'manager', label: 'Менеджер', department: 'management' },
    { value: 'accountant', label: 'Бухгалтер', department: 'management' }
  ];

  const machineTypes = [
    'Универсальная',
    'Оверлок',
    'Плоскошовная',
    'Петельная',
    'Пуговичная',
    'Раскройная',
    'Утюжильная'
  ];

  const skills = [
    'Пошив платьев',
    'Пошив брюк',
    'Пошив рубашек',
    'Пошив верхней одежды',
    'Работа с трикотажем',
    'Работа с кожей',
    'Вышивка',
    'Аппликация',
    'Ремонт одежды'
  ];

  const onSubmit = (data) => {
    const processedData = {
      ...data,
      salary: parseFloat(data.salary),
      skills: Array.isArray(data.skills) ? data.skills : [],
      machineTypes: Array.isArray(data.machineTypes) ? data.machineTypes : []
    };
    
    onSave(processedData);
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <SafeIcon icon={FiUser} className="w-6 h-6 mr-3" />
            {employee ? 'Редактировать сотрудника' : 'Новый сотрудник'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Personal Information */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Личная информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Имя *
                </label>
                <input
                  {...register('firstName', { required: 'Обязательное поле' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Имя"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-sm mt-1">{errors.firstName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Фамилия *
                </label>
                <input
                  {...register('lastName', { required: 'Обязательное поле' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Фамилия"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-sm mt-1">{errors.lastName.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон *
                </label>
                <input
                  {...register('phone', { required: 'Обязательное поле' })}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+996 555 123 456"
                />
                {errors.phone && (
                  <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  {...register('email')}
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Адрес
                </label>
                <textarea
                  {...register('address')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Адрес проживания"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Экстренный контакт
                </label>
                <input
                  {...register('emergencyContact')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="ФИО контактного лица"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон экстренного контакта
                </label>
                <input
                  {...register('emergencyPhone')}
                  type="tel"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+996 555 123 456"
                />
              </div>
            </div>
          </div>

          {/* Work Information */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Рабочая информация</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Должность *
                </label>
                <input
                  {...register('position', { required: 'Обязательное поле' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Например: Старший швея"
                />
                {errors.position && (
                  <p className="text-red-500 text-sm mt-1">{errors.position.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Отдел *
                </label>
                <select
                  {...register('department', { required: 'Обязательное поле' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {departments.map(dept => (
                    <option key={dept.value} value={dept.value}>
                      {dept.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Роль в системе *
                </label>
                <select
                  {...register('role', { required: 'Обязательное поле' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {roles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Зарплата (сом) *
                </label>
                <input
                  {...register('salary', { 
                    required: 'Обязательное поле',
                    min: { value: 0, message: 'Минимум 0' }
                  })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {errors.salary && (
                  <p className="text-red-500 text-sm mt-1">{errors.salary.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Дата найма *
                </label>
                <input
                  {...register('hireDate', { required: 'Обязательное поле' })}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Статус
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="active">Активный</option>
                  <option value="inactive">Неактивный</option>
                  <option value="vacation">В отпуске</option>
                  <option value="sick">На больничном</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills and Equipment (for production roles) */}
          {(watchedRole === 'sewer' || watchedRole === 'brigade_leader' || watchedRole === 'cutter') && (
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Навыки и оборудование</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Навыки
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {skills.map(skill => (
                      <label key={skill} className="flex items-center">
                        <input
                          {...register('skills')}
                          type="checkbox"
                          value={skill}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Типы машин
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {machineTypes.map(machine => (
                      <label key={machine} className="flex items-center">
                        <input
                          {...register('machineTypes')}
                          type="checkbox"
                          value={machine}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm text-gray-700">{machine}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Дополнительные заметки
            </label>
            <textarea
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Дополнительная информация о сотруднике..."
            />
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Отмена
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {employee ? 'Обновить' : 'Создать'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default EmployeeForm;