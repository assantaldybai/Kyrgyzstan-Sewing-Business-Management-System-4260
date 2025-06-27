import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../../contexts/FactoryContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiSettings, FiUsers, FiTool, FiArrowRight } = FiIcons;

const FactorySetup = () => {
  const { configureFactory } = useFactory();
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState({
    name: 'KEMSEL SYSTEMS',
    type: 'individual'
  });

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      configureFactory(config);
    }
  };

  const handlePrevious = () => {
    if (step > 1) {
      setStep(step - 1);
    }
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
            <SafeIcon icon={FiSettings} className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Добро пожаловать в KEMSEL SYSTEMS
          </h1>
          <p className="text-gray-600">
            Настроим вашу цифровую фабрику за несколько простых шагов
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Шаг {step} из 3</span>
            <span className="text-sm text-gray-500">{Math.round((step / 3) * 100)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Название вашей фабрики
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Введите название фабрики
                </label>
                <input
                  type="text"
                  value={config.name}
                  onChange={(e) => setConfig({...config, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  placeholder="Например: KEMSEL SYSTEMS"
                />
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                Выберите тип производственного потока
              </h2>
              <p className="text-gray-600 mb-6">
                Этот выбор определит, как будет организован труд и рассчитываться заработная плата
              </p>
              
              <div className="space-y-4">
                <div
                  onClick={() => setConfig({...config, type: 'individual'})}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    config.type === 'individual' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                      <SafeIcon icon={FiTool} className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Индивидуальный (Универсальный) Поток
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Каждый швея работает на своем оборудовании. Оплата привязана к объему работы и типу машинки.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Гибкость в производстве</p>
                        <p>• Индивидуальная ответственность</p>
                        <p>• Оплата по результату работы</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  onClick={() => setConfig({...config, type: 'flow'})}
                  className={`p-6 border-2 rounded-xl cursor-pointer transition-all ${
                    config.type === 'flow' 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                      <SafeIcon icon={FiUsers} className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Поточный Поток
                      </h3>
                      <p className="text-gray-600 mb-3">
                        Бригадная работа с разделением операций. Оплата делится между всей бригадой.
                      </p>
                      <div className="text-sm text-gray-500">
                        <p>• Высокая производительность</p>
                        <p>• Командная работа</p>
                        <p>• Равномерное распределение нагрузки</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6 text-center"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <SafeIcon icon={FiSettings} className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-900">
                Настройка завершена!
              </h2>
              <div className="bg-gray-50 rounded-lg p-6 text-left">
                <h3 className="font-semibold text-gray-900 mb-3">Ваши настройки:</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Название фабрики:</strong> {config.name}</p>
                  <p><strong>Тип производства:</strong> {
                    config.type === 'individual' ? 'Индивидуальный поток' : 'Поточный поток'
                  }</p>
                </div>
              </div>
              <p className="text-gray-600">
                Система готова к работе. Вы можете изменить эти настройки позже в разделе "Настройки".
              </p>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={step === 1}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              step === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Назад
          </button>

          <button
            onClick={handleNext}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center"
          >
            {step === 3 ? 'Начать работу' : 'Далее'}
            <SafeIcon icon={FiArrowRight} className="w-4 h-4 ml-2" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FactorySetup;