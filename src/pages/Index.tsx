import React, { useState, useEffect } from 'react';
import Sidebar from '../components/Sidebar';
import Dashboard from '../components/Dashboard';
import MedicineManagement from '../components/MedicineManagement';
import POSSystem from '../components/POSSystem';
import SummaryReport from '@/components/SummaryReportClean';
import Settings from '../components/Settings';
import Login from '../components/Login';
import Footer from '../components/Footer';
import AuditLogs from '../components/AuditLogs';
import ExpenseTracker from '../components/ExpenseTracker';
import CustomerManagement from '../components/CustomerManagement';
import SupplierManagement from '../components/SupplierManagement';
import BranchManagement from '../components/BranchManagement';
import StaffAttendance from '../components/StaffAttendance';
import TaxModule from '../components/TaxModule';
import PrescriptionTracking from '../components/PrescriptionTracking';
import EnhancedReports from '../components/EnhancedReports';
import MedicineDatabase from '../components/MedicineDatabase';
import EnhancedHeader from '../components/EnhancedHeader';
import LicenseManagement from '../components/LicenseManagement';
import InventoryAndReturns from '../components/InventoryAndReturns';
import ReturnsPage from '../components/ReturnsPage';
import UserManagement from '../components/UserManagement';
import { offlineManager } from '../utils/offlineManager';
import { useAuditLog } from '../contexts/AuditLogContext';

const Index = () => {
  // Load user from localStorage on initial render
  const [currentUser, setCurrentUser] = useState(() => {
    const savedUser = localStorage.getItem('pharmacy_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  
  const { logAction } = useAuditLog();
  
  const [activeModule, setActiveModule] = useState('dashboard');
  const [isUrdu, setIsUrdu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Handle user login
  const handleLogin = (user: any) => {
    setCurrentUser(user);
    localStorage.setItem('pharmacy_user', JSON.stringify(user));
  };

  // Handle user logout
  const handleLogout = () => {
    // Log the logout action before clearing user data
    if (currentUser) {
      logAction('LOGOUT', 
        isUrdu ? `${currentUser.name} نے لاگ آؤٹ کیا` : `${currentUser.name} logged out`,
        'user',
        currentUser.id.toString()
      );
    }
    
    localStorage.removeItem('pharmacy_user');
    setCurrentUser(null);
    setActiveModule('dashboard');
  };

  // Initialize offline capabilities
  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('pharmacy_language');
    if (savedLanguage) {
      setIsUrdu(savedLanguage === 'ur');
    }

    // Check for saved theme preference
    const savedTheme = localStorage.getItem('pharmacy_theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    }

    // Auto-detect language based on browser settings
    if (!savedLanguage) {
      const browserLanguage = navigator.language || navigator.languages[0];
      if (browserLanguage.includes('ur') || browserLanguage.includes('pk')) {
        setIsUrdu(true);
      }
    }
  }, []);

  // Save language preference
  useEffect(() => {
    localStorage.setItem('pharmacy_language', isUrdu ? 'ur' : 'en');
  }, [isUrdu]);

  // Save theme preference and apply to document
  useEffect(() => {
    localStorage.setItem('pharmacy_theme', isDarkMode ? 'dark' : 'light');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Enhanced login component with offline support
  if (!currentUser) {
    return (
      <>
        <div className={`min-h-screen ${isUrdu ? 'rtl' : 'ltr'}`}>
          <EnhancedHeader 
            isUrdu={isUrdu} 
            setIsUrdu={setIsUrdu}
            isDarkMode={isDarkMode}
            setIsDarkMode={setIsDarkMode}
          />
          <Login onLogin={handleLogin} isUrdu={isUrdu} setIsUrdu={setIsUrdu} />
        </div>
        <Footer />
      </>
    );
  }

  const renderActiveModule = () => {
    switch (activeModule) {
      case 'dashboard':
        return <Dashboard isUrdu={isUrdu} />;
      case 'medicines':
        return <MedicineManagement isUrdu={isUrdu} />;
      case 'medicine-database':
        return <MedicineDatabase isUrdu={isUrdu} />;
      case 'pos':
        return <POSSystem isUrdu={isUrdu} />;
      case 'inventory':
        return <InventoryAndReturns isUrdu={isUrdu} />;
      case 'customers':
        return <CustomerManagement isUrdu={isUrdu} />;
      case 'suppliers':
        return <SupplierManagement isUrdu={isUrdu} />;
      case 'branches':
        return <BranchManagement isUrdu={isUrdu} />;
      case 'staff-attendance':
        return <StaffAttendance isUrdu={isUrdu} />;
      case 'tax-module':
        return <TaxModule isUrdu={isUrdu} />;
      case 'prescriptions':
        return <PrescriptionTracking isUrdu={isUrdu} />;
      case 'enhanced-reports':
        return <EnhancedReports isUrdu={isUrdu} />;
      case 'reports':
        return <SummaryReport isUrdu={isUrdu} />;
      case 'audit-logs':
        return <AuditLogs isUrdu={isUrdu} />;
      case 'expenses':
        return <ExpenseTracker isUrdu={isUrdu} />;
      case 'license-management':
        return <LicenseManagement isUrdu={isUrdu} />;
      case 'settings':
        return <Settings isUrdu={isUrdu} setIsUrdu={setIsUrdu} />;
      case 'returns':
        return <ReturnsPage isUrdu={isUrdu} />;
      case 'user-management':
        // Only admin can access
        if (currentUser?.role === 'admin') {
          return <UserManagement currentUser={currentUser} />;
        } else {
          return <div className="p-8 text-red-600 font-bold">Access Denied</div>;
        }
      default:
        return <Dashboard isUrdu={isUrdu} />;
    }
  };

  const handleProfileClick = () => {
    setActiveModule('settings');
  };

  const handleNotificationsClick = () => {
    // Show notifications modal or navigate to notifications
    console.log('Show notifications');
  };

  const handleSettingsClick = () => {
    setActiveModule('settings');
  };

  return (
    <div className={`min-h-screen flex bg-gray-50 dark:bg-gray-900 ${isUrdu ? 'rtl' : 'ltr'}`}>
      <Sidebar 
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        currentUser={currentUser}
        onLogout={handleLogout}
        isUrdu={isUrdu}
      />
      <div className="flex-1 overflow-hidden">
        <EnhancedHeader 
          isUrdu={isUrdu} 
          setIsUrdu={setIsUrdu}
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentUser={currentUser}
          onProfileClick={handleProfileClick}
          onNotificationsClick={handleNotificationsClick}
          onSettingsClick={handleSettingsClick}
        />
        <div className="p-1">
          {renderActiveModule()}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Index;
