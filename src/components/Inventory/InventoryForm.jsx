import React from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useLanguage } from '../../contexts/LanguageContext';

const InventoryForm = ({ item, onClose, onSave }) => {
  const { t } = useLanguage();
  
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: item || {
      name: '',
      category: 'fabric',
      stockLevel: 0,
      reorderLevel: 0,
      price: 0,
      supplier: ''
    }
  });

  const onSubmit = (data) => {
    onSave({
      ...data,
      stockLevel: parseInt(data.stockLevel),
      reorderLevel: parseInt(data.reorderLevel),
      price: parseFloat(data.price)
    });
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
        className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
      >
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {item ? t('edit') : t('addProduct')}
        </h2>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('productName')}
            </label>
            <input
              {...register('name', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('productName')}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('category')}
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="fabric">{t('fabric')}</option>
              <option value="thread">{t('thread')}</option>
              <option value="accessories">{t('accessories')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('stockLevel')}
              </label>
              <input
                {...register('stockLevel', { required: true, min: 0 })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.stockLevel && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('reorderLevel')}
              </label>
              <input
                {...register('reorderLevel', { required: true, min: 0 })}
                type="number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {errors.reorderLevel && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('price')} ({t('kgs')})
            </label>
            <input
              {...register('price', { required: true, min: 0 })}
              type="number"
              step="0.01"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('supplier')}
            </label>
            <input
              {...register('supplier', { required: true })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={t('supplier')}
            />
            {errors.supplier && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default InventoryForm;