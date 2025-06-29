import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const { FiHome, FiShoppingCart, FiDollarSign, FiCheckSquare, FiPackage, FiUsers, FiSettings, FiTool, FiBook, FiLayers } = FiIcons;

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const { t } = useLanguage();
  const { factory } = useAuth();

  const menuItems = [
    { icon: FiHome, label: 'Главная', path: '/' },
    { icon: FiShoppingCart, label: 'Заказы', path: '/orders' },
    { icon: FiDollarSign, label: 'Финансы', path: '/finances' },
    { icon: FiCheckSquare, label: t('tasks'), path: '/tasks' },
    { icon: FiBook, label: 'Тех. карты', path: '/tech-maps' },
    { icon: FiLayers, label: 'Партии', path: '/production-lots' },
    { icon: FiPackage, label: t('inventory'), path: '/inventory' },
    { icon: FiUsers, label: t('employees'), path: '/employees' },
    { icon: FiSettings, label: t('settings'), path: '/settings' }
  ];

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={toggleSidebar} 
        />
      )}
      
      <motion.div
        initial={{ x: -300 }}
        animate={{ x: isOpen ? 0 : -300 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl z-50 lg:relative lg:translate-x-0 lg:z-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <SafeIcon icon={FiTool} className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-800">
                {factory?.name || 'KEMSEL SYSTEMS'}
              </h1>
              <p className="text-xs text-gray-600">
                Цифровая фабрика
              </p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center px-6 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors ${
                  isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600' : ''
                }`
              }
              onClick={() => window.innerWidth < 1024 && toggleSidebar()}
            >
              <SafeIcon icon={item.icon} className="w-5 h-5 mr-3" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Factory Info Badge */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-3 rounded-lg text-center text-sm">
            <p className="font-medium text-blue-900">SaaS MVP v2.0</p>
            <p className="text-xs text-blue-700">KEMSEL SYSTEMS</p>
            <p className="text-xs text-blue-600 mt-1">Мульти-арендность</p>
          </div>
        </div>
      </motion.div>
    </>
  );
};

export default Sidebar;