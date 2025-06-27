import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useFactory } from '../contexts/FactoryContext';
import QuickOrderForm from '../components/Orders/QuickOrderForm';
import ProductionStages from '../components/Production/ProductionStages';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiEye, FiEdit2, FiClock, FiDollarSign, FiX } = FiIcons;

const Orders = () => {
  const { orders, updateOrder } = useFactory();
  const [showForm, setShowForm] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const formatCurrency = (amount) => {
    return `${amount.toLocaleString()} сом`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_production': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Ожидание';
      case 'in_production': return 'В производстве';
      case 'completed': return 'Завершен';
      case 'delivered': return 'Доставлен';
      default: return status;
    }
  };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetails(true);
  };

  const handleStageUpdate = (stageId, action) => {
    // Update order status based on stage completion
    if (stageId === 'design' && action === 'complete') {
      updateOrder(selectedOrder.id, { status: 'in_production' });
    }
    // Add more logic as needed
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Управление заказами</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          Новый заказ
        </button>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказ
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Заказчик
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Изделие
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Кол-во
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Стоимость
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Срок
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(order)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.customerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{order.model}</p>
                      <p className="text-sm text-gray-500">{order.color}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {order.quantity} шт.
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatCurrency(order.finances.totalValue)}
                      </p>
                      {order.finances.advancePayment > 0 && (
                        <p className="text-sm text-green-600">
                          Предоплата: {formatCurrency(order.finances.advancePayment)}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {order.deliveryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                      {getStatusText(order.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewDetails(order);
                        }}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                        title="Просмотр деталей"
                      >
                        <SafeIcon icon={FiEye} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle edit
                        }}
                        className="text-gray-400 hover:text-green-600 transition-colors"
                        title="Редактировать"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {orders.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiClock} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Заказов пока нет</h3>
          <p className="text-gray-600 mb-4">Создайте первый заказ для начала работы</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
          >
            <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
            Создать заказ
          </button>
        </div>
      )}

      {/* Order Form */}
      {showForm && (
        <QuickOrderForm
          onClose={() => setShowForm(false)}
          onSuccess={() => setShowForm(false)}
        />
      )}

      {/* Order Details Modal */}
      {showDetails && selectedOrder && (
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
            className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex justify-between items-center p-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {selectedOrder.orderNumber}
                </h2>
                <p className="text-gray-600">{selectedOrder.customerName}</p>
              </div>
              <button 
                onClick={() => setShowDetails(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <SafeIcon icon={FiX} className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Order Info */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Информация о заказе</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Изделие:</span>
                      <span className="font-medium">{selectedOrder.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Цвет:</span>
                      <span className="font-medium">{selectedOrder.color}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Количество:</span>
                      <span className="font-medium">{selectedOrder.quantity} шт.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Срок доставки:</span>
                      <span className="font-medium">{selectedOrder.deliveryDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Расход ткани:</span>
                      <span className="font-medium">{selectedOrder.fabricConsumption} м/шт</span>
                    </div>
                  </div>

                  {/* Finances */}
                  <div className="mt-6 p-4 bg-green-50 rounded-lg">
                    <h4 className="font-semibold text-green-900 mb-3">Финансы</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-green-700">Общая стоимость:</span>
                        <span className="font-bold text-green-900">
                          {formatCurrency(selectedOrder.finances.totalValue)}
                        </span>
                      </div>
                      {selectedOrder.finances.advancePayment > 0 && (
                        <div className="flex justify-between">
                          <span className="text-green-700">Предоплата:</span>
                          <span className="font-medium text-green-800">
                            {formatCurrency(selectedOrder.finances.advancePayment)}
                          </span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-green-700">К доплате:</span>
                        <span className="font-bold text-orange-600">
                          {formatCurrency(selectedOrder.finances.totalValue - selectedOrder.finances.advancePayment)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Production Stages */}
                <div>
                  <ProductionStages 
                    orderId={selectedOrder.id}
                    onStageUpdate={handleStageUpdate}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default Orders;