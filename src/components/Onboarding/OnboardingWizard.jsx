import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import WelcomeStep from './steps/WelcomeStep';
import TechnologistStep from './steps/TechnologistStep';
import EquipmentStep from './steps/EquipmentStep';
import TeamStep from './steps/TeamStep';
import FirstClientStep from './steps/FirstClientStep';
import CompletionStep from './steps/CompletionStep';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiArrowLeft, FiArrowRight } = FiIcons;

const OnboardingWizard = ({ onComplete, onSkip }) => {
  const { factory } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  
  // Данные, собираемые в процессе онбординга
  const [wizardData, setWizardData] = useState({
    technologist: { name: '', email: '', phone: '' },
    equipment: [],
    team: { cutter: '', brigadier: '' },
    client: { name: '', productName: '', articleNumber: '' }
  });

  const steps = [
    { id: 'welcome', title: 'Добро пожаловать', component: WelcomeStep },
    { id: 'technologist', title: 'Технолог', component: TechnologistStep },
    { id: 'equipment', title: 'Оборудование', component: EquipmentStep },
    { id: 'team', title: 'Команда', component: TeamStep },
    { id: 'client', title: 'Первый клиент', component: FirstClientStep },
    { id: 'completion', title: 'Завершение', component: CompletionStep }
  ];

  const CurrentStepComponent = steps[currentStep].component;

  const handleNext = async (stepData) => {
    // Обновляем данные визарда
    if (stepData) {
      setWizardData(prev => ({ ...prev, ...stepData }));
    }

    // Если это последний шаг, завершаем онбординг
    if (currentStep === steps.length - 1) {
      await handleComplete();
      return;
    }

    // Переходим к следующему шагу
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    setIsCompleting(true);
    try {
      await onSkip();
    } finally {
      setIsCompleting(false);
    }
  };

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(wizardData);
    } finally {
      setIsCompleting(false);
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 z-50 overflow-y-auto"
    >
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                  <span className="text-white font-bold text-lg">K</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Настройка фабрики "{factory?.name}"
                  </h1>
                  <p className="text-sm text-gray-600">
                    {steps[currentStep].title} • Шаг {currentStep + 1} из {steps.length}
                  </p>
                </div>
              </div>
              
              <button
                onClick={handleSkip}
                disabled={isCompleting}
                className="text-gray-500 hover:text-gray-700 text-sm underline disabled:opacity-50"
              >
                Пропустить пока
              </button>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <motion.div
                  className="bg-blue-600 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-2xl">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-2xl shadow-xl p-8"
              >
                <CurrentStepComponent
                  data={wizardData}
                  onNext={handleNext}
                  onBack={currentStep > 0 ? handleBack : null}
                  isLoading={isCompleting}
                  isLastStep={currentStep === steps.length - 1}
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Step Indicators */}
        <div className="bg-white border-t">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <div className="flex justify-center space-x-2">
              {steps.map((step, index) => (
                <div
                  key={step.id}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default OnboardingWizard;