import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useLanguage } from '../../contexts/LanguageContext';

const { FiMenu, FiGlobe } = FiIcons;

const Header = ({ toggleSidebar }) => {
  const { language, setLanguage, t } = useLanguage();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md hover:bg-gray-100"
          >
            <SafeIcon icon={FiMenu} className="w-6 h-6" />
          </button>
          <h2 className="ml-4 lg:ml-0 text-lg font-semibold text-gray-800">
            {t('dashboard')}
          </h2>
        </div>
        
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleLanguage}
            className="flex items-center px-3 py-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <SafeIcon icon={FiGlobe} className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">
              {language === 'ru' ? 'РУС' : 'ENG'}
            </span>
          </button>
          
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">A</span>
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">
              Администратор
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;