import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from '../components/Auth/LoginForm';
import RegisterForm from '../components/Auth/RegisterForm';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiTool } = FiIcons;

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl flex items-center justify-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-center lg:text-left"
          >
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mr-4">
                <SafeIcon icon={FiTool} className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">KEMSEL SYSTEMS</h1>
                <p className="text-blue-600 font-medium">SaaS для швейных фабрик</p>
              </div>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Цифровизация вашего производства
            </h2>

            <p className="text-xl text-gray-600 mb-8">
              Полная автоматизация швейной фабрики: от заказа до отгрузки. 
              Управляйте производством, персоналом и финансами в одной системе.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🚀 Быстрый старт</h3>
                <p className="text-gray-600 text-sm">
                  Настройка за 5 минут. Готовые шаблоны и процессы.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">📊 Аналитика</h3>
                <p className="text-gray-600 text-sm">
                  Полная прозрачность финансов и производительности.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">👥 Команда</h3>
                <p className="text-gray-600 text-sm">
                  Управление персоналом и распределение задач.
                </p>
              </div>
              <div className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">🔒 Безопасность</h3>
                <p className="text-gray-600 text-sm">
                  Изоляция данных каждой фабрики. Полная конфиденциальность.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right Side - Auth Forms */}
          <div className="flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
              <AnimatePresence mode="wait">
                {isLogin ? (
                  <LoginForm 
                    key="login"
                    onSwitchToRegister={() => setIsLogin(false)} 
                  />
                ) : (
                  <RegisterForm 
                    key="register"
                    onSwitchToLogin={() => setIsLogin(true)} 
                  />
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;