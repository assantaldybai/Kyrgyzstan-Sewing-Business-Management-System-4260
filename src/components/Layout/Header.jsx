import React from 'react';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../../common/SafeIcon';
import { useLanguage } from '../../contexts/LanguageContext';
import { useAuth } from '../../contexts/AuthContext';

const { FiMenu, FiGlobe, FiLogOut, FiUser } = FiIcons;

const Header = ({ toggleSidebar }) => {
  const { language, setLanguage, t } = useLanguage();
  const { user, profile, factory, signOut } = useAuth();

  const toggleLanguage = () => {
    setLanguage(language === 'ru' ? 'en' : 'ru');
  };

  const handleSignOut = async () => {
    await signOut();
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
          <div className="ml-4 lg:ml-0">
            <h2 className="text-lg font-semibold text-gray-800">
              {factory?.name || 'KEMSEL SYSTEMS'}
            </h2>
            <p className="text-sm text-gray-600">
              {profile?.role === 'factory_owner' ? 'Владелец фабрики' : 
               profile?.role === 'superadmin' ? 'Суперадмин' : 
               profile?.position || 'Сотрудник'}
            </p>
          </div>
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
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                <SafeIcon icon={FiUser} className="w-4 h-4 text-white" />
              </div>
              <div className="ml-2">
                <span className="text-sm font-medium text-gray-700">
                  {profile?.first_name || user?.email?.split('@')[0] || 'Пользователь'}
                </span>
                {factory && (
                  <p className="text-xs text-gray-500">{factory.name}</p>
                )}
              </div>
            </div>
            
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100 transition-colors"
              title="Выйти"
            >
              <SafeIcon icon={FiLogOut} className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;