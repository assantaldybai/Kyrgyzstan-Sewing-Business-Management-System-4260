import React from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import { useLanguage } from '../contexts/LanguageContext';

const { FiGlobe, FiDollarSign, FiUser, FiBell, FiShield } = FiIcons;

const Settings = () => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{t('settings')}</h1>

      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiGlobe} className="w-5 h-5 mr-2" />
            Язык / Language
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Текущий язык / Current Language</p>
              <p className="text-sm text-gray-500">
                {language === 'ru' ? 'Русский' : 'English'}
              </p>
            </div>
            <button
              onClick={toggleLanguage}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiDollarSign} className="w-5 h-5 mr-2" />
            Валюта / Currency
          </h2>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-700">Основная валюта</p>
              <p className="text-sm text-gray-500">Кыргызский сом (KGS)</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              Активна
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiUser} className="w-5 h-5 mr-2" />
            Профиль компании
          </h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название компании
              </label>
              <input
                type="text"
                defaultValue="Fabric SaaS Кыргызстан"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Адрес
              </label>
              <textarea
                rows={3}
                defaultValue="г. Бишкек, Кыргызская Республика"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Телефон
                </label>
                <input
                  type="tel"
                  defaultValue="+996 555 000 000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  defaultValue="info@fabric.kg"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Сохранить изменения
            </button>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiBell} className="w-5 h-5 mr-2" />
            Уведомления
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">Уведомления о низком остатке</p>
                <p className="text-sm text-gray-500">Получать уведомления когда товар заканчивается</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-700">Email уведомления</p>
                <p className="text-sm text-gray-500">Получать уведомления на email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" defaultChecked className="sr-only peer" />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.4}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <SafeIcon icon={FiShield} className="w-5 h-5 mr-2" />
            Безопасность
          </h2>
          
          <div className="space-y-4">
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Изменить пароль</p>
              <p className="text-sm text-gray-500">Обновите пароль для вашего аккаунта</p>
            </button>
            
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Двухфакторная аутентификация</p>
              <p className="text-sm text-gray-500">Добавьте дополнительный уровень безопасности</p>
            </button>
            
            <button className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <p className="font-medium text-gray-900">Резервное копирование данных</p>
              <p className="text-sm text-gray-500">Создайте резервную копию всех данных</p>
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Settings;