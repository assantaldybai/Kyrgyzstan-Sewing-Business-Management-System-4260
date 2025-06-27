import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useOrders } from '../../contexts/OrderContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiTrash2, FiX } = FiIcons;

const OrderForm = ({ order, onClose, onSave }) => {
  const { customers, fabrics, colors, teams, productFlows } = useOrders();
  const { t, formatCurrency } = useLanguage();
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors } } = useForm({
    defaultValues: order || {
      customerId: '',
      orderDate: new Date().toISOString().split('T')[0],
      deliveryDate: '',
      initialEconomics: {
        totalOrderValue: 0,
        advancePayment: 0
      },
      items: [
        {
          name: '',
          quantity: 1,
          unitPrice: 0,
          characteristics: {
            fabricId: '',
            colorId: '',
            size: 'M',
            flowId: '',
            teamId: ''
          },
          costBreakdown: {
            fabricCost: 0,
            laborCost: 0,
            overheadCost: 0,
            totalCostPerUnit: 0,
            profitMargin: 0
          }
        }
      ]
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const watchedEconomics = watch("initialEconomics");

  // Calculate totals
  const calculateItemTotal = (item) => {
    return (item.quantity || 0) * (item.unitPrice || 0);
  };

  const calculateOrderTotal = () => {
    return watchedItems?.reduce((total, item) => total + calculateItemTotal(item), 0) || 0;
  };

  // Update total order value when items change
  React.useEffect(() => {
    const total = calculateOrderTotal();
    setValue('initialEconomics.totalOrderValue', total);
  }, [watchedItems, setValue]);

  const onSubmit = (data) => {
    // Add production tracking to each item
    const processedData = {
      ...data,
      initialEconomics: {
        ...data.initialEconomics,
        remainingPayment: data.initialEconomics.totalOrderValue - (data.initialEconomics.advancePayment || 0)
      },
      items: data.items.map(item => ({
        ...item,
        production: {
          planned: item.quantity,
          cutQuantity: 0,
          sewn: 0,
          qualityPassed: 0,
          rejected: 0,
          delivered: 0
        }
      }))
    };
    
    onSave(processedData);
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
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            {order ? 'Редактировать заказ' : 'Новый заказ'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <SafeIcon icon={FiX} className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Заказчик
              </label>
              <select
                {...register('customerId', { required: true })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Выберите заказчика</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
              {errors.customerId && <p className="text-red-500 text-sm mt-1">Обязательное поле</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата заказа
              </label>
              <input
                {...register('orderDate', { required: true })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Дата доставки
              </label>
              <input
                {...register('deliveryDate', { required: true })}
                type="date"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Order Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Изделия</h3>
              <button
                type="button"
                onClick={() => append({
                  name: '',
                  quantity: 1,
                  unitPrice: 0,
                  characteristics: {
                    fabricId: '',
                    colorId: '',
                    size: 'M',
                    flowId: '',
                    teamId: ''
                  },
                  costBreakdown: {
                    fabricCost: 0,
                    laborCost: 0,
                    overheadCost: 0,
                    totalCostPerUnit: 0,
                    profitMargin: 0
                  }
                })}
                className="bg-blue-600 text-white px-3 py-1 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <SafeIcon icon={FiPlus} className="w-4 h-4 mr-1" />
                Добавить изделие
              </button>
            </div>

            {fields.map((field, index) => (
              <div key={field.id} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-medium text-gray-900">Изделие {index + 1}</h4>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Basic Item Info */}
                  <div className="md:col-span-2 lg:col-span-1">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Название изделия
                    </label>
                    <input
                      {...register(`items.${index}.name`, { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Например: Женское платье офисное"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Количество
                    </label>
                    <input
                      {...register(`items.${index}.quantity`, { required: true, min: 1 })}
                      type="number"
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цена за единицу ({t('kgs')})
                    </label>
                    <input
                      {...register(`items.${index}.unitPrice`, { required: true, min: 0 })}
                      type="number"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Characteristics */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ткань
                    </label>
                    <select
                      {...register(`items.${index}.characteristics.fabricId`, { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Выберите ткань</option>
                      {fabrics.map(fabric => (
                        <option key={fabric.id} value={fabric.id}>
                          {fabric.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Цвет
                    </label>
                    <select
                      {...register(`items.${index}.characteristics.colorId`, { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Выберите цвет</option>
                      {colors.map(color => (
                        <option key={color.id} value={color.id}>
                          {color.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Размер
                    </label>
                    <select
                      {...register(`items.${index}.characteristics.size`)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="XS">XS</option>
                      <option value="S">S</option>
                      <option value="M">M</option>
                      <option value="L">L</option>
                      <option value="XL">XL</option>
                      <option value="XXL">XXL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Тех. процесс
                    </label>
                    <select
                      {...register(`items.${index}.characteristics.flowId`, { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Выберите тех. процесс</option>
                      {productFlows.map(flow => (
                        <option key={flow.id} value={flow.id}>
                          {flow.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Ответственная бригада
                    </label>
                    <select
                      {...register(`items.${index}.characteristics.teamId`, { required: true })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Выберите бригаду</option>
                      {teams.map(team => (
                        <option key={team.id} value={team.id}>
                          {team.name} - {team.specialization}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Cost Breakdown */}
                <div className="mt-4">
                  <h5 className="font-medium text-gray-900 mb-3">Себестоимость</h5>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ткань ({t('kgs')})
                      </label>
                      <input
                        {...register(`items.${index}.costBreakdown.fabricCost`, { min: 0 })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Работа ({t('kgs')})
                      </label>
                      <input
                        {...register(`items.${index}.costBreakdown.laborCost`, { min: 0 })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Накладные ({t('kgs')})
                      </label>
                      <input
                        {...register(`items.${index}.costBreakdown.overheadCost`, { min: 0 })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Себестоимость ({t('kgs')})
                      </label>
                      <input
                        {...register(`items.${index}.costBreakdown.totalCostPerUnit`, { min: 0 })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Прибыль ({t('kgs')})
                      </label>
                      <input
                        {...register(`items.${index}.costBreakdown.profitMargin`, { min: 0 })}
                        type="number"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>

                {/* Item Total */}
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900">Итого по изделию:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {formatCurrency(calculateItemTotal(watchedItems?.[index] || {}))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Economics */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Экономика заказа</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Общая стоимость заказа
                </label>
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(calculateOrderTotal())}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Предоплата ({t('kgs')})
                </label>
                <input
                  {...register('initialEconomics.advancePayment', { min: 0 })}
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  К доплате
                </label>
                <div className="text-xl font-semibold text-orange-600">
                  {formatCurrency(calculateOrderTotal() - (watchedEconomics?.advancePayment || 0))}
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('save')}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default OrderForm;