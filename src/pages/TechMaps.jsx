import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTechMap } from '../contexts/TechMapContext';
import TechMapTemplateForm from '../components/TechMaps/TechMapTemplateForm';
import TechMapTemplateCard from '../components/TechMaps/TechMapTemplateCard';
import TechMapTemplateDetails from '../components/TechMaps/TechMapTemplateDetails';
import SafeIcon from '../common/SafeIcon';
import * as FiIcons from 'react-icons/fi';

const { FiPlus, FiSearch, FiFilter, FiBook, FiGrid, FiList, FiSettings } = FiIcons;

const TechMaps = () => {
  const { 
    techMapTemplates, 
    productModels,
    searchTemplates,
    deleteTechMapTemplate
  } = useTechMap();

  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterModel, setFilterModel] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Фильтрация шаблонов
  const filteredTemplates = techMapTemplates.filter(template => {
    const matchesSearch = searchTemplates(searchTerm).includes(template);
    const matchesModel = filterModel === 'all' || template.modelId === filterModel;
    return matchesSearch && matchesModel;
  });

  // Статистика
  const stats = {
    total: techMapTemplates.length,
    active: techMapTemplates.filter(t => t.isActive).length,
    models: [...new Set(techMapTemplates.map(t => t.modelId))].length,
    avgOperations: techMapTemplates.length > 0 
      ? Math.round(techMapTemplates.reduce((sum, t) => sum + (t.operations?.length || 0), 0) / techMapTemplates.length)
      : 0
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setShowForm(true);
  };

  const handleDelete = (templateId) => {
    if (window.confirm('Вы уверены, что хотите удалить этот шаблон?')) {
      deleteTechMapTemplate(templateId);
    }
  };

  const handleViewDetails = (template) => {
    setSelectedTemplate(template);
    setShowDetails(true);
  };

  const getModelName = (modelId) => {
    const model = productModels.find(m => m.id === modelId);
    return model ? model.name : 'Неизвестная модель';
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center">
            <SafeIcon icon={FiBook} className="w-8 h-8 mr-3 text-blue-600" />
            Библиотека Технологических Карт
          </h1>
          <p className="text-gray-600">
            Создавайте и применяйте готовые шаблоны технологических процессов
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="mt-4 md:mt-0 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-lg"
        >
          <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
          Создать шаблон
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Всего шаблонов</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <SafeIcon icon={FiBook} className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.1}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Активных</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
            </div>
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-green-600 rounded-full"></div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.2}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Моделей</p>
              <p className="text-3xl font-bold text-purple-600">{stats.models}</p>
            </div>
            <SafeIcon icon={FiGrid} className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          delay={0.3}
          className="bg-white rounded-xl shadow-sm border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Среднее операций</p>
              <p className="text-3xl font-bold text-orange-600">{stats.avgOperations}</p>
            </div>
            <SafeIcon icon={FiSettings} className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <SafeIcon icon={FiSearch} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Поиск шаблонов..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-4">
            <select
              value={filterModel}
              onChange={(e) => setFilterModel(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Все модели</option>
              {productModels.map(model => (
                <option key={model.id} value={model.id}>{model.name}</option>
              ))}
            </select>

            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SafeIcon icon={FiGrid} className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-white text-gray-900 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <SafeIcon icon={FiList} className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterModel !== 'all') && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <SafeIcon icon={FiFilter} className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">Активные фильтры:</span>
              {searchTerm && (
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Поиск: {searchTerm}
                </span>
              )}
              {filterModel !== 'all' && (
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  {getModelName(filterModel)}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterModel('all');
                }}
                className="text-xs text-gray-500 hover:text-gray-700 underline"
              >
                Очистить все
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          Показано {filteredTemplates.length} из {techMapTemplates.length} шаблонов
        </p>
      </div>

      {/* Templates Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <TechMapTemplateCard
              key={template.id}
              template={template}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onViewDetails={handleViewDetails}
              getModelName={getModelName}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Название шаблона
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Модель изделия
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Операций
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Статус
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Создан
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Действия
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTemplates.map((template) => (
                  <tr key={template.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{template.name}</p>
                        <p className="text-sm text-gray-500">{template.description}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getModelName(template.modelId)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {template.operations?.length || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        template.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {template.isActive ? 'Активный' : 'Неактивный'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(template.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(template)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Просмотр
                        </button>
                        <button
                          onClick={() => handleEdit(template)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => handleDelete(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Удалить
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty State */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <SafeIcon icon={FiBook} className="w-16 h-16 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {techMapTemplates.length === 0 ? 'Нет шаблонов' : 'Шаблоны не найдены'}
          </h3>
          <p className="text-gray-600 mb-4">
            {techMapTemplates.length === 0 
              ? 'Создайте первый шаблон технологической карты'
              : 'Попробуйте изменить параметры поиска или фильтры'
            }
          </p>
          {techMapTemplates.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors inline-flex items-center"
            >
              <SafeIcon icon={FiPlus} className="w-5 h-5 mr-2" />
              Создать шаблон
            </button>
          )}
        </div>
      )}

      {/* Template Form */}
      {showForm && (
        <TechMapTemplateForm
          template={editingTemplate}
          onClose={() => {
            setShowForm(false);
            setEditingTemplate(null);
          }}
        />
      )}

      {/* Template Details */}
      {showDetails && selectedTemplate && (
        <TechMapTemplateDetails
          template={selectedTemplate}
          onClose={() => {
            setShowDetails(false);
            setSelectedTemplate(null);
          }}
          onEdit={(template) => {
            setShowDetails(false);
            setSelectedTemplate(null);
            handleEdit(template);
          }}
          getModelName={getModelName}
        />
      )}
    </div>
  );
};

export default TechMaps;