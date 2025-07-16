import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard,
  Package,
  ShoppingCart,
  Warehouse,
  Users,
  Building,
  ShieldCheck,
  Settings,
  LogOut,
  Clock,
  Calculator,
  UserCheck,
  Building2,
  Receipt,
  FileText,
  BarChart3,
  Database,
  ArrowLeftRight,
  LineChart
} from 'lucide-react';

interface SidebarProps {
  activeModule: string;
  setActiveModule: (module: string) => void;
  currentUser: any;
  onLogout: () => void;
  isUrdu: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  activeModule, 
  setActiveModule, 
  currentUser, 
  onLogout, 
  isUrdu 
}) => {
  const { settings } = useSettings();
  const text = {
    en: {
      dashboard: 'Dashboard',
      medicines: 'Medicines',
      medicineDatabase: '50K Database',
      pos: 'Point of Sale',
      inventory: 'Inventory',
      customers: 'Customers',
      suppliers: 'Suppliers',
      
      staffAttendance: 'Staff Attendance',
      taxModule: 'Tax Module',
      reports: 'Reports',
      auditLogs: 'Audit Logs',
      expenses: 'Expenses',
      licenseManagement: 'Licenses',
      settings: 'Settings',
      logout: 'Logout',
      welcome: 'Welcome',
      prescriptions: 'Prescriptions',
      enhancedReports: 'Analytics',
      returns: 'Returns'
    },
    ur: {
      dashboard: 'ڈیش بورڈ',
      medicines: 'ادویات',
      medicineDatabase: '50 ہزار ڈیٹابیس',
      pos: 'پوائنٹ آف سیل',
      inventory: 'انوینٹری',
      customers: 'کسٹمرز',
      suppliers: 'سپلائرز',
      
      staffAttendance: 'عملے کی حاضری',
      taxModule: 'ٹیکس ماڈیول',
      reports: 'رپورٹس',
      auditLogs: 'آڈٹ لاگز',
      expenses: 'اخراجات',
      licenseManagement: 'لائسنس',
      settings: 'سیٹنگز',
      logout: 'لاگ آؤٹ',
      welcome: 'خوش آمدید',
      prescriptions: 'نسخے',
      enhancedReports: 'تجزیات',
      returns: 'واپسی'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Define all possible menu items
  const allMenuItems = [
    { id: 'dashboard', label: t.dashboard, icon: LayoutDashboard },
    { id: 'medicine-database', label: t.medicineDatabase, icon: Database },
    { id: 'pos', label: t.pos, icon: ShoppingCart },
    { id: 'inventory', label: t.inventory, icon: Warehouse },
    { id: 'prescriptions', label: t.prescriptions, icon: FileText },
    { id: 'customers', label: t.customers, icon: Users },
    { id: 'suppliers', label: t.suppliers, icon: Building },
   
    { id: 'staff-attendance', label: t.staffAttendance, icon: UserCheck },
    { id: 'tax-module', label: t.taxModule, icon: Receipt },
    { id: 'reports', label: t.reports, icon: LineChart },
    { id: 'enhanced-reports', label: t.enhancedReports, icon: BarChart3 },
    { id: 'returns', label: t.returns, icon: ArrowLeftRight },
    { id: 'audit-logs', label: t.auditLogs, icon: Clock },
    { id: 'expenses', label: t.expenses, icon: Calculator },
    { id: 'license-management', label: t.licenseManagement, icon: ShieldCheck },
    { id: 'settings', label: t.settings, icon: Settings }
  ];

  // Role-based menu filtering
  let allowedIds: string[] = [];
  let showLogoutAfterId: string | null = null;
  switch ((currentUser?.role || '').toLowerCase()) {
    case 'cashier':
      allowedIds = ['dashboard', 'pos', 'inventory'];
      showLogoutAfterId = 'inventory';
      break;
    case 'pharmacist':
      allowedIds = [
        'dashboard',
        'pos',
        'inventory',
        'customers',
        'suppliers',
        'reports'
      ];
      showLogoutAfterId = 'reports';
      break;
    case 'admin':
      allowedIds = allMenuItems.map(item => item.id);
      break;
    default:
      allowedIds = ['dashboard']; // fallback: minimal access
  }

  let menu = allMenuItems.filter(item => allowedIds.includes(item.id));
  // Add User Management for admin
  if ((currentUser?.role || '').toLowerCase() === 'admin') {
    menu = [
      ...menu,
      { id: 'user-management', label: isUrdu ? 'یوزر مینجمنٹ' : 'User Management', icon: Users }
    ];
  }
  const menuItems = menu;

  // Helper to handle logout and redirect
  const handleLogoutClick = () => {
    onLogout();
    window.location.hash = '#/login';
  };

  return (
    <div className="w-64 bg-white shadow-lg border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white truncate">
          {settings.companyName || 'Pharmacy'}
        </h2>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {currentUser?.name || 'Admin'}
          </p>
          <p className="text-xs text-gray-400">
            {currentUser?.role || 'User'}
          </p>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <React.Fragment key={item.id}>
              <Button
                variant={activeModule === item.id ? "default" : "ghost"}
                className={`w-full justify-start ${isUrdu ? 'flex-row-reverse' : ''}`}
                onClick={() => setActiveModule(item.id)}
              >
                <Icon className={`h-4 w-4 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                {item.label}
              </Button>
              {/* Insert logout button after the specified menu item for cashier/pharmacist */}
              {showLogoutAfterId === item.id && (
                <Button
                  variant="outline"
                  className={`w-full mt-2 ${isUrdu ? 'flex-row-reverse' : ''}`}
                  onClick={handleLogoutClick}
                >
                  <LogOut className={`h-4 w-4 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
                  {t.logout}
                </Button>
              )}
            </React.Fragment>
          );
        })}
      </nav>

      {/* Logout Button for admin at the bottom */}
      {((currentUser?.role || '').toLowerCase() === 'admin') && (
        <div className="p-4 border-t border-gray-200">
          <Button 
            variant="outline" 
            className={`w-full ${isUrdu ? 'flex-row-reverse' : ''}`}
            onClick={handleLogoutClick}
          >
            <LogOut className={`h-4 w-4 ${isUrdu ? 'ml-2' : 'mr-2'}`} />
            {t.logout}
          </Button>
        </div>
      )}
    </div>
  );
};

export default Sidebar;
