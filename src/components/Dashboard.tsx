import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  Package, 
  AlertTriangle, 
  ShoppingCart,
  Users,
  Clock,
  RefreshCw,
  DollarSign
} from 'lucide-react';
import { 
  getTotalInventory,
  getLowStockItems,
  getOutOfStockItems,
} from '@/utils/dashboardService';
import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { 
  TrendingUp as TrendingUpIcon, 
  Package as PackageIcon, 
  AlertTriangle as AlertTriangleIcon, 
  ShoppingCart as ShoppingCartIcon,
  Users as UsersIcon,
  Calendar as CalendarIcon2,
  Clock as ClockIcon,
  RefreshCw as RefreshCwIcon,
  DollarSign as DollarSignIcon
} from 'lucide-react';
import { getRecentSales } from '@/utils/salesService';
import { getInventory } from '@/utils/inventoryService';

interface DashboardProps {
  isUrdu: boolean;
}

interface DashboardStats {
  todaySales: number;
  monthlySales: number;
  totalInventory: number;
  lowStockItems: number;
  outOfStockItems: number;
  totalStockValue: number;
  isLoading: boolean;
}

interface SaleItem {
  id: string;
  medicine: string;
  customer: string;
  amount: number;
  time: string;
  date: string;
}

interface FormData {
  customerName: string;
  productName: string;
  price: string;
  tax: string;
  discount: string;
  date: Date | undefined;
  time: string;
}

// Helper functions for localStorage
const STORAGE_KEY = 'pharmacy_recent_sales';

const saveToLocalStorage = (sales: SaleItem[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sales));
  } catch (error) {
    console.error('Error saving to localStorage:', error);
  }
};

const loadFromLocalStorage = (): SaleItem[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Error loading from localStorage:', error);
    return [];
  }
};

// StatCard component for better code organization
const StatCard = ({ stat }: { stat: { title: string; value: string; icon: any; color: string; bgColor: string } }) => {
  const Icon = stat.icon;
  return (
    <Card className="transition-all hover:shadow-lg h-full">
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-gray-500 truncate">{stat.title}</p>
            <p className="text-lg font-bold text-gray-900 truncate">{stat.value}</p>
          </div>
          <div className={`p-2 rounded-full ${stat.bgColor} ml-2 flex-shrink-0`}>
            <Icon className={`h-5 w-5 ${stat.color}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const Dashboard: React.FC<DashboardProps> = ({ isUrdu }) => {
  const [stats, setStats] = useState<DashboardStats>({
    todaySales: 0,
    monthlySales: 0,
    totalInventory: 0,
    lowStockItems: 0,
    outOfStockItems: 0,
    totalStockValue: 0,
    isLoading: true
  });
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [recentSales, setRecentSales] = useState<SaleItem[]>(() => loadFromLocalStorage());

  const fetchDashboardData = async () => {
    try {
      setStats(prev => ({...prev, isLoading: true}));
      
      const [summaryResponse, inventory, lowStock, outOfStock, inventoryItems] = await Promise.all([
        fetch('http://localhost:5000/api/sales/summary'),
        getTotalInventory(),
        getLowStockItems(),
        getOutOfStockItems(),
        fetch('http://localhost:5000/api/add-stock').then(res => res.ok ? res.json() : [])
      ]);

      if (!summaryResponse.ok) {
        throw new Error('Failed to fetch sales summary');
      }

      const summaryData = await summaryResponse.json();
      const totalStockValue = inventoryItems.reduce((sum: number, item: any) => 
        sum + ((item.quantity ?? item.stock ?? 0) * (item.unitPrice ?? item.price ?? 0)), 0);

      setStats({
        todaySales: summaryData.today.totalAmount,
        monthlySales: summaryData.month.totalAmount,
        totalInventory: inventory,
        lowStockItems: lowStock,
        outOfStockItems: outOfStock,
        totalStockValue,
        isLoading: false
      });
      
      setLastUpdated(new Date().toLocaleTimeString());
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setStats(prev => ({...prev, isLoading: false}));
    }
  };

  useEffect(() => {
    fetchDashboardData();
    
    const handleSaleCompleted = () => {
      fetchDashboardData();
      loadRecentSales();
    };
    window.addEventListener('saleCompleted', handleSaleCompleted);

    // Set up auto-refresh every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000);
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('saleCompleted', handleSaleCompleted);
    };
  }, []);

  const text = {
    en: {
      title: 'Dashboard',
      todaysSales: "Today's Sales",
      monthlySales: "This Month's Sales",
      totalInventory: "Total Inventory",
      lowStock: "Low Stock Items",
      recentSales: "Recent Sales",
      expiringMedicines: "Expiring Soon",
      topSelling: "Top Selling",
      quickActions: "Quick Actions"
    },
    ur: {
      title: 'ڈیش بورڈ',
      todaysSales: "آج کی سیلز",
      monthlySales: "اس مہینے کی سیلز",
      totalInventory: "کل انوینٹری",
      lowStock: "کم اسٹاک",
      recentSales: "حالیہ سیلز",
      expiringMedicines: "ختم ہونے والی",
      topSelling: "زیادہ فروخت",
      quickActions: "فوری اعمال"
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const statsData = [
    {
      title: t.todaysSales,
      value: `Rs. ${stats.todaySales.toLocaleString()}`,
      icon: ShoppingCartIcon,
      color: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      title: t.monthlySales,
      value: `Rs. ${stats.monthlySales.toLocaleString()}`,
      icon: TrendingUpIcon,
      color: "text-purple-600",
      bgColor: "bg-purple-50"
    },
    {
      title: t.totalInventory,
      value: stats.totalInventory.toLocaleString(),
      icon: PackageIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    },
    {
      title: t.lowStock,
      value: stats.lowStockItems.toLocaleString(),
      icon: AlertTriangleIcon,
      color: "text-amber-600",
      bgColor: "bg-amber-50"
    },
    {
      title: isUrdu ? "ختم ہو چکا" : "Out of Stock",
      value: stats.outOfStockItems.toLocaleString(),
      icon: AlertTriangleIcon,
      color: "text-red-600",
      bgColor: "bg-red-50"
    },
    {
      title: "Total Stock Value",
      value: `Rs. ${stats.totalStockValue.toLocaleString()}`,
      icon: DollarSignIcon,
      color: "text-blue-600",
      bgColor: "bg-blue-50"
    }
  ];

  // Load recent sales on component mount and set up refresh functionality
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const loadRecentSales = async () => {
    setIsRefreshing(true);
    try {
      try {
        const res = await fetch('http://localhost:5000/api/sales/recent');
        if (res.ok) {
          const apiSales = await res.json();
          setRecentSales(apiSales);
        } else {
          // fallback to localStorage if backend fails
          const savedSales = getRecentSales();
          setRecentSales(savedSales);
        }
      } catch (err) {
        console.error('Error fetching recent sales:', err);
        const savedSales = getRecentSales();
        setRecentSales(savedSales);
      }
    } finally {
      setIsRefreshing(false);
    }
  };

  // Load recent sales on component mount
  React.useEffect(() => {
    loadRecentSales();
  }, []);

  // Real-time expiring medicines state
  const [expiringMedicines, setExpiringMedicines] = useState<{
    id: number;
    medicine: string;
    expiry: string;
    stock: number;
  }[]>([]);

  // Helper: isExpiringSoon (90 days logic)
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date('2025-07-03T13:25:33+05:00'); // Use provided local time
    const ninetyDaysFromNow = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    return expiry <= ninetyDaysFromNow;
  };

  // Load expiring medicines from inventory
  React.useEffect(() => {
    const updateExpiring = async () => {
      try {
        const inventory = await getInventory();
        const expiring = inventory
          .filter((item: any) => isExpiringSoon(item.expiryDate))
          .map((item: any) => ({
            id: item.id,
            medicine: item.name,
            expiry: item.expiryDate,
            stock: item.quantity ?? item.stock
          }))
          .sort((a: any, b: any) => new Date(a.expiry).getTime() - new Date(b.expiry).getTime());
        setExpiringMedicines(expiring);
      } catch (e) {
        setExpiringMedicines([]);
      }
    };
    updateExpiring();
    // Listen for storage changes to update in real-time
    window.addEventListener('storage', updateExpiring);
    return () => window.removeEventListener('storage', updateExpiring);
  }, []);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <CalendarIcon2 className="h-4 w-4" />
            <span>{new Date().toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <ClockIcon className="h-4 w-4" />
            <span>{new Date().toLocaleTimeString()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Two rows of three cards each */}
      <div className="space-y-4">
        {/* First row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.slice(0, 3).map((stat, index) => (
            <StatCard key={index} stat={stat} />
          ))}
        </div>
        
        {/* Second row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {statsData.slice(3).map((stat, index) => (
            <StatCard key={index + 3} stat={stat} />
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Sales */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center space-x-2">
                <ShoppingCartIcon className="h-5 w-5" />
                <span>{t.recentSales}</span>
              </CardTitle>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={loadRecentSales}
                disabled={isRefreshing}
              >
                <RefreshCwIcon className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentSales.length > 0 ? (
                recentSales.map((sale) => (
                  <div key={sale.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div>
                      <p className="font-medium text-gray-900">{sale.medicine}</p>
                      <p className="text-sm text-gray-600">
                        {isUrdu ? 'گاہک:' : 'Customer:'} {sale.customer}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">
                        {isUrdu ? 'روپے ' : 'PKR '}
                        {sale.amount.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {sale.date} • {sale.time}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {isUrdu ? 'کوئی حالیہ فروخت نہیں ملی' : 'No recent sales found'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expiring Medicines */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangleIcon className="h-5 w-5 text-yellow-600" />
              <span>{t.expiringMedicines}</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {expiringMedicines.length > 0 ? (
                expiringMedicines.map((medicine) => (
                  <div key={medicine.id} className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div>
                      <p className="font-medium text-gray-900">{medicine.medicine}</p>
                      <p className="text-sm text-gray-600">Stock: {medicine.stock}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-yellow-600">
                        Exp: {medicine.expiry}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  {isUrdu ? 'کوئی ختم ہونے والی دوا نہیں' : 'No expiring medicines found'}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Updated and Refresh Button */}
      <div className="text-right text-sm text-muted-foreground">
        Last updated: {lastUpdated || 'Never'}
        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-2"
          onClick={fetchDashboardData}
          disabled={stats.isLoading}
        >
          <RefreshCwIcon className={`h-4 w-4 mr-2 ${stats.isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default Dashboard;
