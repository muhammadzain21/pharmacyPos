
import React from 'react';
import { useSettings } from '@/contexts/SettingsContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Globe, 
  Wifi, 
  WifiOff, 
  Moon, 
  Sun,
  Bell,
  Settings,
  User
} from 'lucide-react';

interface EnhancedHeaderProps {
  isUrdu: boolean;
  setIsUrdu: (value: boolean) => void;
  isDarkMode?: boolean;
  setIsDarkMode?: (value: boolean) => void;
  currentUser?: any;
  onProfileClick?: () => void;
  onNotificationsClick?: () => void;
  onSettingsClick?: () => void;
  notificationCount?: number;
}

const EnhancedHeader: React.FC<EnhancedHeaderProps> = ({
  isUrdu,
  setIsUrdu,
  isDarkMode = false,
  setIsDarkMode,
  currentUser,
  onProfileClick,
  onNotificationsClick,
  onSettingsClick
}) => {
  const { settings } = useSettings();
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);

  // --- Insert logo in header ---
  // Place this at the start of your main header render/return:
  // {settings.logo && (
  //   <img src={settings.logo} alt="Pharmacy Logo" className="h-10 mr-4 rounded bg-white border shadow" style={{objectFit: 'contain'}} />
  // )}


  React.useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const text = {
    en: {
      language: 'English',
      online: 'Online',
      offline: 'Offline',
      darkMode: 'Dark Mode',
      lightMode: 'Light Mode',
      notifications: 'Notifications',
      profile: 'Profile',
      settings: 'Settings'
    },
    ur: {
      language: 'اردو',
      online: 'آن لائن',
      offline: 'آف لائن',
      darkMode: 'ڈارک موڈ',
      lightMode: 'لائٹ موڈ',
      notifications: 'اطلاعات',
      profile: 'پروفائل',
      settings: 'سیٹنگز'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Notification dropdown state
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [notifications, setNotifications] = React.useState([
    { id: 1, text: isUrdu ? 'ادویات کم اسٹاک میں ہیں' : 'Low stock medicines', read: false },
    { id: 2, text: isUrdu ? 'رپورٹ ایکسپورٹ ہو گئی' : 'Report exported', read: false },
    { id: 3, text: isUrdu ? 'آج کی سیلز مکمل ہو گئی' : 'Today\'s sales completed', read: false }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleBellClick = () => setShowNotifications((s) => !s);
  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map(n => ({ ...n, read: true })));
    setShowNotifications(false);
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background border-b">
      <div className="flex items-center space-x-4">
        <h1 className="text-title font-poppins">
          <span className="text-xl font-bold truncate max-w-xs">
            {settings.companyName || 'Pharmacy'}
          </span>
        </h1>
        <Badge variant={isOnline ? "default" : "destructive"} className="flex items-center space-x-1">
          {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
          <span>{isOnline ? t.online : t.offline}</span>
        </Badge>
      </div>

      <div className="flex items-center space-x-2 relative">
        {/* Language Toggle */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsUrdu(!isUrdu)}
          className="flex items-center space-x-2"
        >
          <Globe className="h-4 w-4" />
          <span>{t.language}</span>
        </Button>

        {/* Dark Mode Toggle */}
        {setIsDarkMode && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="flex items-center space-x-2"
          >
            {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="hidden md:inline">
              {isDarkMode ? t.lightMode : t.darkMode}
            </span>
          </Button>
        )}

        {/* Notifications */}
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBellClick}
            className="relative"
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <Badge 
                variant="destructive" 
                className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
              >
                {unreadCount}
              </Badge>
            )}
          </Button>
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded shadow-lg z-50">
              <div className="p-2 border-b font-semibold flex justify-between items-center">
                <span>{isUrdu ? 'اطلاعات' : 'Notifications'}</span>
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-600 hover:underline focus:outline-none"
                >
                  {isUrdu ? 'سب کو پڑھا ہوا نشان زد کریں' : 'Mark all as read'}
                </button>
              </div>
              <ul className="max-h-48 overflow-y-auto">
                {notifications.length === 0 ? (
                  <li className="p-4 text-center text-gray-500">
                    {isUrdu ? 'کوئی اطلاع نہیں' : 'No notifications'}
                  </li>
                ) : (
                  notifications.map((n) => (
                    <li
                      key={n.id}
                      className={`px-4 py-2 border-b last:border-b-0 ${n.read ? 'text-gray-400' : 'text-gray-900 dark:text-white font-medium'}`}
                    >
                      {n.text}
                    </li>
                  ))
                )}
              </ul>
            </div>
          )}
        </div>

        {/* Settings */}
        {onSettingsClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onSettingsClick}
          >
            <Settings className="h-4 w-4" />
          </Button>
        )}

        {/* User Profile */}
        {currentUser && onProfileClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onProfileClick}
            className="flex items-center space-x-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden md:inline">{currentUser.name}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedHeader;
