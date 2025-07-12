import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Plus, 
  User, 
  Phone, 
  Mail,
  MapPin,
  Calendar,
  Edit,
  Trash2,
  Eye,
  Gift,
  Download,
  Star
} from 'lucide-react';
import CustomerForm from './CustomerForm';
import { offlineManager } from '../utils/offlineManager';
import { loyaltyManager } from '../utils/loyaltyManager';
import { reportExporter } from '../utils/reportExporter';

interface CustomerManagementProps {
  isUrdu: boolean;
}

const CustomerManagement: React.FC<CustomerManagementProps> = ({ isUrdu }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Ahmad Hassan',
      phone: '+92-300-1234567',
      email: 'ahmad.hassan@gmail.com',
      address: 'House 123, Block A, Gulshan-e-Iqbal, Karachi',
      cnic: '42101-1234567-1',
      notes: 'Regular customer, prefers generic medicines',
      mrNumber: 'MR-001',
      createdAt: '2023-01-15',
      totalPurchases: 25,
      loyaltyPoints: 1250
    },
    {
      id: 2,
      name: 'Fatima Khan',
      phone: '+92-333-9876543',
      email: 'fatima.khan@hotmail.com',
      address: 'Flat 42, Block C, DHA Phase 5, Lahore',
      cnic: '35202-7654321-9',
      notes: 'Allergic to penicillin',
      mrNumber: 'MR-002',
      createdAt: '2023-02-20',
      totalPurchases: 18,
      loyaltyPoints: 900
    }
  ]);

  const text = {
    en: {
      title: 'Customer Management',
      searchPlaceholder: 'Search customers...',
      addCustomer: 'Add Customer',
      exportReport: 'Export Report',
      name: 'Name',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      cnic: 'CNIC',
      notes: 'Notes',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View',
      customerSince: 'Customer Since',
      loyaltyPoints: 'Loyalty Points',
      totalPurchases: 'Total Purchases',
      viewLoyalty: 'View Loyalty',
      mrNumber: 'MR Number'
    },
    ur: {
      title: 'کسٹمر منیجمنٹ',
      searchPlaceholder: 'کسٹمر تلاش کریں...',
      addCustomer: 'کسٹمر شامل کریں',
      exportReport: 'رپورٹ ایکسپورٹ',
      name: 'نام',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      cnic: 'شناختی کارڈ',
      notes: 'نوٹس',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں',
      customerSince: 'کسٹمر بننے کی تاریخ',
      loyaltyPoints: 'لائلٹی پوائنٹس',
      totalPurchases: 'کل خریداریاں',
      viewLoyalty: 'لائلٹی دیکھیں',
      mrNumber: 'ایم آر نمبر'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Load customers from offline storage on mount
  useEffect(() => {
    const storedCustomers = offlineManager.getData('customers');
    if (storedCustomers && storedCustomers.length > 0) {
      setCustomers(storedCustomers);
    }
  }, []);

  // Save customers to offline storage whenever customers change
  useEffect(() => {
    offlineManager.saveData('customers', customers);
  }, [customers]);

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.phone.includes(searchTerm) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveCustomer = (customerData: any) => {
    if (editingCustomer) {
      setCustomers(customers.map(c => c.id === customerData.id ? customerData : c));
    } else {
      const newCustomer = {
        ...customerData,
        id: Math.max(...customers.map(c => c.id), 0) + 1,
        createdAt: new Date().toISOString().split('T')[0],
        totalPurchases: 0,
        loyaltyPoints: 0
      };
      setCustomers([...customers, newCustomer]);
    }
    setEditingCustomer(null);
    setShowForm(false);
  };

  const handleEditCustomer = (customer: any) => {
    setEditingCustomer(customer);
    setShowForm(true);
  };

  const handleDeleteCustomer = (customerId: number) => {
    setCustomers(customers.filter(c => c.id !== customerId));
    if (selectedCustomer?.id === customerId) {
      setSelectedCustomer(null);
    }
  };

  const handleExportReport = () => {
    const exportData = reportExporter.exportCustomerReport(customers);
    reportExporter.exportToExcel(exportData);
  };

  const getLoyaltyTier = (points: number) => {
    if (points >= 2000) return { tier: 'Platinum', color: 'bg-purple-500' };
    if (points >= 1000) return { tier: 'Gold', color: 'bg-yellow-500' };
    if (points >= 500) return { tier: 'Silver', color: 'bg-gray-400' };
    return { tier: 'Bronze', color: 'bg-orange-600' };
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-headline font-poppins text-gray-900">{t.title}</h1>
        <div className="flex space-x-2">
          <Button onClick={handleExportReport} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            {t.exportReport}
          </Button>
          <Button onClick={() => setShowForm(true)} className="touch-target">
            <Plus className="h-4 w-4 mr-2" />
            {t.addCustomer}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 font-poppins"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCustomers.map((customer) => {
          const loyaltyTier = getLoyaltyTier(customer.loyaltyPoints);
          
          return (
            <Card key={customer.id} className="hover:shadow-md transition-all animate-slide-in">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg font-poppins">{customer.name}</h3>
                      <p className="text-sm text-gray-600">{customer.cnic}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline" className={`${loyaltyTier.color} text-white text-xs`}>
                          <Star className="h-3 w-3 mr-1" />
                          {loyaltyTier.tier}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="font-poppins">{customer.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="font-poppins">{customer.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="truncate font-poppins">{customer.address}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="font-poppins">{t.customerSince}: {customer.createdAt}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600 font-poppins">{t.mrNumber}:</span>
                    <span className="font-poppins">{customer.mrNumber}</span>
                  </div>
                </div>

                {/* Loyalty and Purchase Stats */}
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600 font-poppins">{t.totalPurchases}:</span>
                      <p className="font-semibold font-poppins">{customer.totalPurchases}</p>
                    </div>
                    <div>
                      <span className="text-gray-600 font-poppins">{t.loyaltyPoints}:</span>
                      <p className="font-semibold text-primary font-poppins">
                        <Gift className="h-3 w-3 inline mr-1" />
                        {customer.loyaltyPoints}
                      </p>
                    </div>
                  </div>
                </div>

                {customer.notes && (
                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
                    <strong className="font-poppins">{t.notes}:</strong> 
                    <span className="font-poppins">{customer.notes}</span>
                  </div>
                )}

                <div className="flex justify-between items-center mt-4 pt-4 border-t">
                  <span className="text-xs text-gray-500 font-poppins">ID: {customer.id}</span>
                  <div className="flex space-x-1">
                    <Button size="sm" variant="outline" onClick={() => setSelectedCustomer(customer)} className="touch-target">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleEditCustomer(customer)} className="touch-target">
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => handleDeleteCustomer(customer.id)} className="touch-target">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {selectedCustomer && (
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <User className="h-4 w-4 text-gray-500" />
            <span className="font-medium">{selectedCustomer.name}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">{t.mrNumber}:</span>
            <span>{selectedCustomer.mrNumber}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Phone className="h-4 w-4 text-gray-500" />
            <span>{selectedCustomer.phone}</span>
          </div>
        </div>
      )}

      {showForm && (
        <CustomerForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowForm(false);
            setEditingCustomer(null);
          }}
          onSave={handleSaveCustomer}
          customer={editingCustomer}
        />
      )}
    </div>
  );
};

export default CustomerManagement;
