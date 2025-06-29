import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiShield, FiMail, FiLock, FiEye, FiEyeOff, FiUserPlus } = FiIcons;

const SuperAdminRegistration = ({ onSwitchToLogin }) => {
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Секретный ключ для создания суперадмина (в реальной системе должен быть в переменных окружения)
  const SUPERADMIN_SECRET = 'KEMSEL_SUPERADMIN_2024';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (secretKey !== SUPERADMIN_SECRET) {
      setError('Неверный секретный ключ суперадмина');
      setLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (password.length < 8) {
      setError('Пароль должен содержать минимум 8 символов');
      setLoading(false);
      return;
    }

    try {
      // Регистрируем пользователя
      const { data, error: signUpError } = await signUp(email, password);
      
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      // Если регистрация успешна, создаем профиль суперадмина
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            role: 'superadmin',
            first_name: 'Super',
            last_name: 'Admin',
            email: email,
            factory_id: null,
            is_active: true
          });

        if (profileError) {
          console.error('Error creating superadmin profile:', profileError);
          setError('Ошибка создания профиля суперадмина');
        } else {
          setSuccess(true);
        }
      }
    } catch (error) {
      console.error('Error during superadmin registration:', error);
      setError('Произошла ошибка при регистрации');
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md text-center"
      >
        <div className="bg-green-50 border border-green-200 rounded-lg p-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <SafeIcon icon={FiShield} className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Суперадмин создан!</h2>
          <p className="text-gray-600 mb-6">
            Аккаунт суперадмина успешно зарегистрирован. Теперь вы можете войти в систему.
          </p>
          <button
            onClick={onSwitchToLogin}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Войти в систему
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="w-full max-w-md"
    >
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <SafeIcon icon={FiShield} className="w-8 h-8 text-red-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Регистрация Суперадмина</h2>
        <p className="text-gray-600">Создание системного администратора KEMSEL SYSTEMS</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Секретный ключ суперадмина *
          </label>
          <div className="relative">
            <SafeIcon icon={FiShield} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={secretKey}
              onChange={(e) => setSecretKey(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Введите секретный ключ"
            />
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Секретный ключ: KEMSEL_SUPERADMIN_2024
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Email суперадмина *
          </label>
          <div className="relative">
            <SafeIcon icon={FiMail} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="superadmin@kemsel.systems"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Пароль *
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Минимум 8 символов"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <SafeIcon icon={showPassword ? FiEyeOff : FiEye} className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Подтвердите пароль *
          </label>
          <div className="relative">
            <SafeIcon icon={FiLock} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              placeholder="Повторите пароль"
            />
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-900 mb-2">⚠️ Важно!</h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Суперадмин имеет полный доступ ко всем фабрикам</li>
            <li>• Может управлять всеми пользователями системы</li>
            <li>• Создавайте только один аккаунт суперадмина</li>
            <li>• Храните данные доступа в безопасности</li>
          </ul>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
          ) : (
            <>
              <SafeIcon icon={FiUserPlus} className="w-5 h-5 mr-2" />
              Создать Суперадмина
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          Уже есть аккаунт?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Войти в систему
          </button>
        </p>
      </div>
    </motion.div>
  );
};

export default SuperAdminRegistration;