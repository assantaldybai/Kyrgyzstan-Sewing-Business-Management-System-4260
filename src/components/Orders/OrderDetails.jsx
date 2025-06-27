import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useOrders } from '../../contexts/OrderContext';
import { useLanguage } from '../../contexts/LanguageContext';
import SafeIcon from '../../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiX, FiEdit2, FiCheck, FiClock, FiPackage, FiDollarSign, FiUsers, FiScissors } = FiIcons;

const OrderDetails = ({ order, onClose }) => {
  const { customers, fabrics, colors, teams, operations, updateOrderStage, addTimeEntry, addPayment } = useOrders();
  const { t, formatCurrency } = useLanguage();
  const [activeTab, setActiveTab] = useState('overview');
  const [showPaymentForm, setShowPaymentForm] = useState(false);

  const customer = customers.find(c => c.id === order.customerId);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'in_production': return 'bg-purple-100 text-purple-800';
      case 'quality_check': return 'bg-orange-100 text-orange-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStageStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-gray-500';
      case 'in_progress': return 'text-blue-600';
      case 'completed': return 'text-green-600';
      default: return 'text-gray-500';
    }
  };

  const handleStageUpdate = (stage, updates) => {
    updateOrderStage(order.id, stage, updates);
  };

  const handlePayment = (paymentData) => {
    addPayment(order.id, paymentData);
    setShowPaymentForm(false);
  };

  const tabs = [
    { id: 'overview', name: 'Обзор', icon: FiPackage },
    { id: 'production', name: 'Производство', icon: FiUsers },
    { id: 'quality', name: 'ОТК', icon: FiCheck },
    { id: 'economics', name: 'Экономика', icon: FiDollarSign }
  ];

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
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900">
              Заказ {order.orderNumber}
            </h2>
            <p className="text-gray-600">{customer?.name}</p>
          </div>
          <div className="flex items-center space-x-4">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <SafeIcon icon={FiX} className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b">
          <nav className="flex space-x-8 px-6">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <SafeIcon icon={tab.icon} className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Информация о заказе</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Номер:</strong> {order.orderNumber}</p>
                    <p><strong>Дата заказа:</strong> {order.orderDate}</p>
                    <p><strong>Дата доставки:</strong> {order.deliveryDate}</p>
                    <p><strong>Статус:</strong> {order.status}</p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Заказчик</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Название:</strong> {customer?.name}</p>
                    <p><strong>Тип:</strong> {customer?.type === 'internal' ? 'Внутренний' : 'Внешний'}</p>
                    <p><strong>Контактное лицо:</strong> {customer?.contactPerson}</p>
                    <p><strong>Телефон:</strong> {customer?.phone}</p>
                  </div>
                </div>

                <div className="bg-green-50 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Экономика</h3>
                  <div className="space-y-2 text-sm">
                    <p><strong>Стоимость:</strong> {formatCurrency(order.initialEconomics.totalOrderValue)}</p>
                    <p><strong>Получено:</strong> {formatCurrency(order.payments.received)}</p>
                    <p className="text-orange-600"><strong>К доплате:</strong> {formatCurrency(order.payments.pending)}</p>
                  </div>
                </div>
              </div>

              {/* Items */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Изделия в заказе</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => {
                    const fabric = fabrics.find(f => f.id === item.characteristics.fabricId);
                    const color = colors.find(c => c.id === item.characteristics.colorId);
                    const team = teams.find(t => t.id === item.characteristics.teamId);

                    return (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <h4 className="font-medium text-gray-900">{item.name}</h4>
                            <p className="text-sm text-gray-600">Количество: {item.quantity}</p>
                            <p className="text-sm text-gray-600">Цена: {formatCurrency(item.unitPrice)}</p>
                          </div>
                          
                          <div>
                            <p className="text-sm font-medium text-gray-900">Характеристики</p>
                            <p className="text-sm text-gray-600">Ткань: {fabric?.name}</p>
                            <p className="text-sm text-gray-600">Цвет: {color?.name}</p>
                            <p className="text-sm text-gray-600">Размер: {item.characteristics.size}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">Производство</p>
                            <p className="text-sm text-gray-600">Бригада: {team?.name}</p>
                            <p className="text-sm text-gray-600">Раскроено: {item.production?.cutQuantity || 0}</p>
                            <p className="text-sm text-gray-600">Отшито: {item.production?.sewn || 0}</p>
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">Итого</p>
                            <p className="text-lg font-bold text-blue-600">
                              {formatCurrency(item.quantity * item.unitPrice)}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'production' && (
            <div className="space-y-6">
              {/* Production Stages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cutting Stage */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <SafeIcon icon={FiScissors} className="w-5 h-5 mr-2" />
                      Раскрой
                    </h3>
                    <span className={`text-sm font-medium ${getStageStatusColor(order.stages.cutting.status)}`}>
                      {order.stages.cutting.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Исполнитель:</strong> {order.stages.cutting.assignedTo || 'Не назначен'}</p>
                    <p><strong>Раскроено:</strong> {order.stages.cutting.actualQuantity}</p>
                    {order.stages.cutting.startDate && (
                      <p><strong>Начато:</strong> {order.stages.cutting.startDate}</p>
                    )}
                    {order.stages.cutting.completedDate && (
                      <p><strong>Завершено:</strong> {order.stages.cutting.completedDate}</p>
                    )}
                  </div>

                  {order.stages.cutting.status === 'pending' && (
                    <button
                      onClick={() => handleStageUpdate('cutting', { 
                        status: 'in_progress', 
                        startDate: new Date().toISOString().split('T')[0],
                        assignedTo: 'Кройщик'
                      })}
                      className="mt-3 w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Начать раскрой
                    </button>
                  )}
                </div>

                {/* Sewing Stage */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <SafeIcon icon={FiUsers} className="w-5 h-5 mr-2" />
                      Пошив
                    </h3>
                    <span className={`text-sm font-medium ${getStageStatusColor(order.stages.sewing.status)}`}>
                      {order.stages.sewing.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Бригада:</strong> {order.stages.sewing.assignedTeam || 'Не назначена'}</p>
                    {order.stages.sewing.startDate && (
                      <p><strong>Начато:</strong> {order.stages.sewing.startDate}</p>
                    )}
                    {order.stages.sewing.completedDate && (
                      <p><strong>Завершено:</strong> {order.stages.sewing.completedDate}</p>
                    )}
                  </div>
                </div>

                {/* Quality Control Stage */}
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <SafeIcon icon={FiCheck} className="w-5 h-5 mr-2" />
                      ОТК
                    </h3>
                    <span className={`text-sm font-medium ${getStageStatusColor(order.stages.qualityControl.status)}`}>
                      {order.stages.qualityControl.status}
                    </span>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <p><strong>Контролер:</strong> {order.stages.qualityControl.inspector || 'Не назначен'}</p>
                    <p><strong>Принято:</strong> {order.stages.qualityControl.passedQuantity}</p>
                    <p><strong>Отклонено:</strong> {order.stages.qualityControl.rejectedQuantity}</p>
                  </div>
                </div>
              </div>

              {/* Time Tracking */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Хронометраж операций</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-gray-600">Здесь будет отображаться информация о затраченном времени на каждую операцию</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'quality' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Контроль качества</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600">Модуль контроля качества в разработке</p>
              </div>
            </div>
          )}

          {activeTab === 'economics' && (
            <div className="space-y-6">
              {/* Payment Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-green-50 rounded-lg p-6">
                  <h3 className="font-semibold text-green-900 mb-2">Получено</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(order.payments.received)}
                  </p>
                </div>

                <div className="bg-orange-50 rounded-lg p-6">
                  <h3 className="font-semibold text-orange-900 mb-2">К доплате</h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(order.payments.pending)}
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-6">
                  <h3 className="font-semibold text-blue-900 mb-2">Общая стоимость</h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(order.initialEconomics.totalOrderValue)}
                  </p>
                </div>
              </div>

              {/* Payment History */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">История платежей</h3>
                  {order.payments.pending > 0 && (
                    <button
                      onClick={() => setShowPaymentForm(true)}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Добавить платеж
                    </button>
                  )}
                </div>

                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Тип</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Способ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {order.payments.history.map(payment => (
                        <tr key={payment.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {payment.date}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.type === 'advance' ? 'Предоплата' : 'Доплата'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                            {formatCurrency(payment.amount)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {payment.method}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Cost Breakdown */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Детализация затрат</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{item.name}</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Ткань</p>
                          <p className="font-medium">{formatCurrency(item.costBreakdown.fabricCost)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Работа</p>
                          <p className="font-medium">{formatCurrency(item.costBreakdown.laborCost)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Накладные</p>
                          <p className="font-medium">{formatCurrency(item.costBreakdown.overheadCost)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Себестоимость</p>
                          <p className="font-medium">{formatCurrency(item.costBreakdown.totalCostPerUnit)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Прибыль</p>
                          <p className="font-medium text-green-600">{formatCurrency(item.costBreakdown.profitMargin)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Payment Form Modal */}
        {showPaymentForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Добавить платеж</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handlePayment({
                  amount: parseFloat(formData.get('amount')),
                  type: 'payment',
                  method: formData.get('method')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Сумма ({t('kgs')})
                    </label>
                    <input
                      name="amount"
                      type="number"
                      step="0.01"
                      max={order.payments.pending}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Способ оплаты
                    </label>
                    <select
                      name="method"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="cash">Наличные</option>
                      <option value="bank_transfer">Банковский перевод</option>
                      <option value="card">Карта</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    type="button"
                    onClick={() => setShowPaymentForm(false)}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    Отмена
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Добавить
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default OrderDetails;