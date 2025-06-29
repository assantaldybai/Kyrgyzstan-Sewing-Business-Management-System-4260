import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { FactoryProvider, useFactory } from './contexts/FactoryContext';
import { TaskProvider } from './contexts/TaskContext';
import { TechMapProvider } from './contexts/TechMapContext';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import FactorySetupForm from './components/Auth/FactorySetupForm';
import OnboardingWizard from './components/Onboarding/OnboardingWizard';
import AuthPage from './pages/AuthPage';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
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
  const { 
    user, 
    profile, 
    factory, 
    loading, 
    isSuperAdmin, 
    needsFactorySetup, 
    needsOnboarding,
    completeOnboarding,
    skipOnboarding
  } = useAuth();
  
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const handleOnboardingComplete = async (onboardingData) => {
    const result = await completeOnboarding(onboardingData);
    if (result.error) {
      alert('Ошибка при завершении настройки: ' + result.error.message);
    }
  };

  const handleOnboardingSkip = async () => {
    const result = await skipOnboarding();
    if (result.error) {
      alert('Ошибка при пропуске настройки: ' + result.error.message);
    }
  };

  // Show loading spinner
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show auth page if not logged in
  if (!user) {
    return <AuthPage />;
  }

  // Show superadmin dashboard for superadmins
  if (isSuperAdmin()) {
    return <SuperAdminDashboard />;
  }

  // Show factory setup if user needs to create a factory
  if (needsFactorySetup()) {
    return <FactorySetupForm />;
  }

  // Show onboarding wizard if factory owner hasn't completed onboarding
  if (needsOnboarding()) {
    return (
      <OnboardingWizard
        onComplete={handleOnboardingComplete}
        onSkip={handleOnboardingSkip}
      />
    );
  }

  // Show main app for factory users
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
    <AuthProvider>
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
    </AuthProvider>
  );
}

export default App;