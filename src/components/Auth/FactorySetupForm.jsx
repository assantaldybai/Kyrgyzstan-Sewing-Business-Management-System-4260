import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTool, FiArrowRight, FiCheck } = FiIcons;

const FactorySetupForm = () => {
  const { createFactory } = useAuth();
  const [factoryName, setFactoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!factoryName.trim()) {
      setError('Название фабрики обязательно');
      setLoading(false);
      return;
    }

    const { error } = await createFactory(factoryName.trim());
    
    if (error) {
      setError(error.message || 'Ошибка создания фабрики');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiTool} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Создайте вашу цифровую фабрику
          </h1>
          <p className="text-gray-600">
            Добро пожаловать в KEMSEL SYSTEMS! Давайте настроим вашу фабрику.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4 mb-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiCheck} className="w-4 h-4 text-white" />
              </div>
              <span className="ml-2 text-sm text-green-600 font-medium">Регистрация</span>
            </div>
            <div className="w-8 h-0.5 bg-blue-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">2</span>
              </div>
              <span className="ml-2 text-sm text-blue-600 font-medium">Создание фабрики</span>
            </div>
            <div className="w-8 h-0.5 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-gray-500 text-sm font-bold">3</span>
              </div>
              <span className="ml-2 text-sm text-gray-500">Готово</span>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Название вашей фабрики *
            </label>
            <input
              type="text"
              value={factoryName}
              onChange={(e) => setFactoryName(e.target.value)}
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              placeholder="Например: Швейная фабрика 'Ак-Орго'"
              maxLength={100}
            />
            <p className="text-sm text-gray-500 mt-1">
              Это название будет отображаться в системе и документах
            </p>
          </div>

          {/* Features Preview */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Что вы получите:
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Управление заказами</p>
                  <p className="text-sm text-gray-600">Полный цикл от заказа до отгрузки</p>
                </div>
              </div>
              <div className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Технологические карты</p>
                  <p className="text-sm text-gray-600">Шаблоны производственных процессов</p>
                </div>
              </div>
              <div className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Управление персоналом</p>
                  <p className="text-sm text-gray-600">Сотрудники, роли и зарплаты</p>
                </div>
              </div>
              <div className="flex items-start">
                <SafeIcon icon={FiCheck} className="w-5 h-5 text-green-500 mr-3 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Финансовая аналитика</p>
                  <p className="text-sm text-gray-600">Доходы, расходы и прибыльность</p>
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !factoryName.trim()}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <>
                Создать фабрику
                <SafeIcon icon={FiArrowRight} className="w-5 h-5 ml-2" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>После создания фабрики вы станете её владельцем и сможете добавлять сотрудников</p>
        </div>
      </motion.div>
    </div>
  );
};

export default FactorySetupForm;