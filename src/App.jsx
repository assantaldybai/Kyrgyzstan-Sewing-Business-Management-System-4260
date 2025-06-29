import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FactoryProvider, useFactory } from './contexts/FactoryContext';
import { TaskProvider } from './contexts/TaskContext';
import { TechMapProvider } from './contexts/TechMapContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FactorySetup from './components/Setup/FactorySetup';
import Dashboard from './pages/Dashboard';
import Orders from './pages/Orders';
import Finances from './pages/Finances';
import Tasks from './pages/Tasks';
import Inventory from './pages/Inventory';
import Employees from './pages/Employees';
import Settings from './pages/Settings';
import TechMaps from './pages/TechMaps';
import ProductionLots from './pages/ProductionLots';
import { LanguageProvider } from './contexts/LanguageContext';
import { DataProvider } from './contexts/DataContext';
import './App.css';

const AppContent = () => {
  const { factoryConfig } = useFactory();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Show setup if factory is not configured
  if (!factoryConfig.isConfigured) {
    return <FactorySetup />;
  }

  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        <Sidebar isOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header toggleSidebar={toggleSidebar} />
          <motion.main
            className="flex-1 overflow-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/orders" element={<Orders />} />
              <Route path="/finances" element={<Finances />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/inventory" element={<Inventory />} />
              <Route path="/employees" element={<Employees />} />
              <Route path="/tech-maps" element={<TechMaps />} />
              <Route path="/production-lots" element={<ProductionLots />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </motion.main>
        </div>
      </div>
    </Router>
  );
};

function App() {
  return (
    <LanguageProvider>
      <DataProvider>
        <FactoryProvider>
          <TaskProvider>
            <TechMapProvider>
              <AppContent />
            </TechMapProvider>
          </TaskProvider>
        </FactoryProvider>
      </DataProvider>
    </LanguageProvider>
  );
}

export default App;