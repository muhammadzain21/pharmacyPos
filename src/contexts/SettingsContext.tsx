import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface Settings {
  companyName: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  taxRate: string;
  taxEnabled?: boolean;
  taxInclusive?: boolean;
  currency: string;
  dateFormat: string;
  notifications: boolean;
  autoBackup: boolean;
  printReceipts: boolean;
  barcodeScanning: boolean;
  language: string;
  // Billing slip fields
  template?: string;
  slipName?: string;
  footerText?: string;
  logo?: string;
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  isUrdu: boolean;
}

const defaultSettings: Settings = {
  companyName: 'PharmaCare',
  companyAddress: 'Main Boulevard, Gulshan-e-Iqbal, Karachi',
  companyPhone: '+92-21-1234567',
  companyEmail: 'info@pharmacare.com',
  taxRate: '17',
  taxEnabled: true,
  taxInclusive: false,
  currency: 'PKR',
  dateFormat: 'dd/mm/yyyy',
  notifications: true,
  autoBackup: true,
  printReceipts: true,
  barcodeScanning: true,
  language: 'en',
  template: 'default',
  slipName: '',
  footerText: '',
  logo: '',
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const savedSettings = localStorage.getItem('pharmacy_settings');
      return savedSettings ? JSON.parse(savedSettings) : defaultSettings;
    } catch (error) {
      console.error('Failed to load settings:', error);
      return defaultSettings;
    }
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    localStorage.setItem('pharmacy_settings', JSON.stringify(updatedSettings));
  };

  const isUrdu = settings.language === 'ur';

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, isUrdu }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
