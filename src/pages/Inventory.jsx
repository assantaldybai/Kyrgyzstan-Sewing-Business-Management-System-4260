import React, { useState } from 'react';
import { motion } from 'framer-motion';
import * as FiIcons from 'react-icons/fi';
import SafeIcon from '../common/SafeIcon';
import InventoryForm from '../components/Inventory/InventoryForm';
import { useData } from '../contexts/DataContext';
import { useLanguage } from '../contexts/LanguageContext';

const { FiPlus, FiEdit2, FiTrash2, FiAlertTriangle } = FiIcons;

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
  const { t, formatCurrency } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const handleSave = (itemData) => {
    if (editingItem) {
      updateInventoryItem(editingItem.id, itemData);
    } else {
      addInventoryItem(itemData);
    }
    setEditingItem(null);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этот товар?')) {
      deleteInventoryItem(id);
    }
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case 'fabric': return 'bg-blue-100 text-blue-800';
      case 'thread': return 'bg-green-100 text-green-800';
      case 'accessories': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">{t('inventory')}</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <SafeIcon icon={FiPlus} className="w-4 h-4 mr-2" />
          {t('addProduct')}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('productName')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('category')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('stockLevel')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('price')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('supplier')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('actions')}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {item.stockLevel <= item.reorderLevel && (
                        <SafeIcon icon={FiAlertTriangle} className="w-4 h-4 text-red-500 mr-2" />
                      )}
                      <span className="text-sm font-medium text-gray-900">{item.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(item.category)}`}>
                      {t(item.category)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm ${item.stockLevel <= item.reorderLevel ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                      {item.stockLevel}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatCurrency(item.price)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {item.supplier}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <SafeIcon icon={FiEdit2} className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <SafeIcon icon={FiTrash2} className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <InventoryForm
          item={editingItem}
          onClose={() => {
            setShowForm(false);
            setEditingItem(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Inventory;