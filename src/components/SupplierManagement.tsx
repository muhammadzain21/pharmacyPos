import React, { useState, useEffect } from 'react';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier, UISupplier } from '@/utils/supplierService';
import ConfirmDeleteDialog from './ConfirmDeleteDialog';
import { useAuditLog } from '@/contexts/AuditLogContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Plus, 
  Building, 
  Phone, 
  Mail,
  MapPin,
  DollarSign,
  Package,
  Calendar,
  Edit,
  Trash2,
  Eye,
  AlertCircle
} from 'lucide-react';
import SupplierForm from './SupplierForm';

interface SupplierManagementProps {
  isUrdu: boolean;
}

const SupplierManagement: React.FC<SupplierManagementProps> = ({ isUrdu }) => {
  const { logAction } = useAuditLog();
  // --- New state for adding supplies ---
  const [newSupply, setNewSupply] = useState<{ name: string; cost: number; quantity: number }>({
    name: '',
    cost: 0,
    quantity: 1,
  });

  // --- New state for adding orders ---
  const [newOrder, setNewOrder] = useState<{ items: string; amount: number; invoice: string }>({
    items: '',
    amount: 0,
    invoice: '',
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<any>(null);
  const [suppliers, setSuppliers] = useState<UISupplier[]>([]);

  // Load suppliers from backend on component mount
  useEffect(() => {
    const loadBackendSuppliers = async () => {
      try {
        const list = await getSuppliers();
        setSuppliers(list);
      } catch (err) {
        console.error('Failed to fetch suppliers from backend:', err);
      }
    };
    loadBackendSuppliers();
  }, []);

  // Save suppliers to localStorage whenever they change
  useEffect(() => {
    if (suppliers.length > 0) {
      localStorage.setItem('pharmacy_suppliers', JSON.stringify(suppliers));
    }
  }, [suppliers]);

  const text = {
    en: {
      title: 'Supplier Management',
      searchPlaceholder: 'Search suppliers...',
      addSupplier: 'Add Supplier',
      supplierProfile: 'Supplier Profile',
      purchaseHistory: 'Purchase History',
      outstandingDues: 'Outstanding Dues',
      companyName: 'Company Name',
      contactPerson: 'Contact Person',
      phone: 'Phone',
      email: 'Email',
      address: 'Address',
      taxId: 'Tax ID',
      totalPurchases: 'Total Purchases',
      pendingPayments: 'Pending Payments',
      lastOrder: 'Last Order',
      status: 'Status',
      active: 'Active',
      inactive: 'Inactive',
      edit: 'Edit',
      delete: 'Delete',
      view: 'View'
    },
    ur: {
      title: 'سپلائر منیجمنٹ',
      searchPlaceholder: 'سپلائر تلاش کریں...',
      addSupplier: 'سپلائر شامل کریں',
      supplierProfile: 'سپلائر پروفائل',
      purchaseHistory: 'خریداری کی تاریخ',
      outstandingDues: 'باقی واجبات',
      companyName: 'کمپنی کا نام',
      contactPerson: 'رابطہ کار',
      phone: 'فون',
      email: 'ای میل',
      address: 'پتہ',
      taxId: 'ٹیکس آئی ڈی',
      totalPurchases: 'کل خریداری',
      pendingPayments: 'بقایا ادائیگیاں',
      lastOrder: 'آخری آرڈر',
      status: 'حالت',
      active: 'فعال',
      inactive: 'غیر فعال',
      edit: 'تبدیل کریں',
      delete: 'حذف کریں',
      view: 'دیکھیں'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  const filteredSuppliers = suppliers.filter(supplier =>
    (supplier.companyName && supplier.companyName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.contactPerson && supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (supplier.phone && supplier.phone.includes(searchTerm))
  );

  const handleSaveSupplier = async (supplierData: any) => {
    if (editingSupplier) {
      // Update existing supplier via backend
      try {
        await updateSupplier(editingSupplier.id, supplierData);
        const refreshed = await getSuppliers();
        setSuppliers(refreshed);
      } catch (err) {
        console.error('Failed to update supplier:', err);
        window.alert('Error updating supplier.');
      }
      logAction('EDIT_SUPPLIER', 
        isUrdu ? `سپلائر اپ ڈیٹ کیا گیا: ${supplierData.companyName}` : `Updated supplier: ${supplierData.companyName}`,
        'supplier',
        editingSupplier.id
      );
    } else {
      // Add new supplier via backend
      try {
        await addSupplier(supplierData);
        const refreshed = await getSuppliers();
        setSuppliers(refreshed);
      } catch (err) {
        console.error('Failed to add supplier:', err);
        window.alert('Error adding supplier.');
      }
      
      logAction('ADD_SUPPLIER', 
        isUrdu ? `نیا سپلائر شامل کیا گیا: ${supplierData.companyName}` : `Added new supplier: ${supplierData.companyName}`,
        'supplier'
      );
    }
    
    setEditingSupplier(null);
    setShowForm(false);
  };

  // Delete dialog state
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<UISupplier | null>(null);

  const handleEditSupplier = (supplier: any) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const id = deleteTarget.id;
    try {
      await deleteSupplier(id);
      const refreshed = await getSuppliers();
      setSuppliers(refreshed);
      logAction('DELETE_SUPPLIER',
        isUrdu ? `سپلائر حذف کیا گیا: ${deleteTarget.companyName}` : `Deleted supplier: ${deleteTarget.companyName}`,
        'supplier',
        id);
      if (selectedSupplier?.id === id) setSelectedSupplier(null);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      window.alert('Error deleting supplier.');
    }
    setShowDeleteDialog(false);
    setDeleteTarget(null);
  };

  const handleDeleteSupplier = (supplier: UISupplier) => {
    setDeleteTarget(supplier);
    setShowDeleteDialog(true);
  };

  // --- Handler to add a new order to the supplier and update inventory ---
  const handleAddOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (!newOrder.items || newOrder.amount <= 0 || !newOrder.invoice) return;
    
    const itemsArr = newOrder.items.split(',').map(x => x.trim()).filter(Boolean);
    if (itemsArr.length === 0) return;

    // Append order to supplier's purchases
    const updatedSuppliers = suppliers.map(sup => {
      if (sup.id === selectedSupplier.id) {
        return {
          ...sup,
          purchases: [
            ...((sup.purchases) ?? []),
            {
              date: new Date().toISOString().split('T')[0],
              amount: newOrder.amount,
              items: newOrder.items,
              invoice: newOrder.invoice,
            },
          ],
        };
      }
      return sup;
    });
    setSuppliers(updatedSuppliers);
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updatedSuppliers));

    logAction('ORDER_ADD', 
      isUrdu ? `نیا آرڈر شامل کیا گیا: ${newOrder.invoice}` : `Added new order: ${newOrder.invoice}`,
      'supplier',
      selectedSupplier.id
    );

    // --- Inventory linkage: increase stock for each item ---
    try {
      const { getInventory, saveInventory } = require('@/utils/inventoryService');
      let inventory = getInventory();
      let updated = false;
      itemsArr.forEach((itemName: string) => {
        const inv = inventory.find((inv: any) => inv.name.toLowerCase() === itemName.toLowerCase());
        if (inv) {
          inv.stock += 1; // Default add 1 per item in order (for demo, real app would allow qty per item)
          updated = true;
        }
      });
      if (updated) saveInventory([...inventory]);
    } catch {}

    setNewOrder({ items: '', amount: 0, invoice: '' });
  };

  // --- Handler to add a supplied item to the supplier and inventory ---
  const handleAddSuppliedItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier) return;
    if (!newSupply.name || newSupply.cost <= 0 || newSupply.quantity <= 0) return;

    // Update supplier's supplies
    const updatedSuppliers = suppliers.map(sup => {
      if (sup.id === selectedSupplier.id) {
        return {
          ...sup,
          supplies: [...sup.supplies, { ...newSupply }],
        };
      }
      return sup;
    });
    setSuppliers(updatedSuppliers);
    localStorage.setItem('pharmacy_suppliers', JSON.stringify(updatedSuppliers));

    logAction('SUPPLY_ADD', 
      isUrdu ? `نیا سپلائی کا سامان شامل کیا گیا: ${newSupply.name}` : `Added new supplied item: ${newSupply.name}`,
      'supplier',
      selectedSupplier.id
    );

    // --- Inventory linkage ---
    try {
      const { getInventory, saveInventory } = require('@/utils/inventoryService');
      let inventory = getInventory();
      const existing = inventory.find((inv: any) => inv.name.toLowerCase() === newSupply.name.toLowerCase());
      if (existing) {
        // Update stock and price if item exists
        existing.stock += newSupply.quantity;
        existing.price = newSupply.cost;
        saveInventory([...inventory]);
        window.alert('Inventory updated: Stock increased for ' + newSupply.name);
      } else {
        // Add new inventory item
        const newItem = {
          id: Date.now(),
          name: newSupply.name,
          genericName: '',
          category: '',
          stock: newSupply.quantity,
          minStock: 0,
          maxStock: 0,
          purchasePrice: newSupply.cost,
          price: newSupply.cost,
          barcode: '',
          manufacturer: selectedSupplier.companyName,
          expiryDate: '',
          manufacturingDate: '',
        };
        saveInventory([...inventory, newItem]);
        window.alert('New item added to inventory: ' + newSupply.name);
      }
    } catch (err) {
      window.alert('Error updating inventory.');
    }

    setNewSupply({ name: '', cost: 0, quantity: 1 });
  };

  // --- Handler for "View in Inventory" ---
  const handleViewInInventory = (item: any) => {
    // For demo/local: just alert the user. In a full app, would scroll or highlight in inventory UI.
    window.alert('View in Inventory: ' + item.name);
  };

  // --- Handler for "Add to Inventory" ---
  const handleAddToInventory = (item: any) => {
    try {
      const { getInventory, saveInventory } = require('@/utils/inventoryService');
      let inventory = getInventory();
      const existing = inventory.find((inv: any) => inv.name.toLowerCase() === item.name.toLowerCase());
      if (existing) {
        existing.stock += item.quantity;
        existing.price = item.cost;
        saveInventory([...inventory]);
        window.alert('Inventory updated: Stock increased for ' + item.name);
      } else {
        const newItem = {
          id: Date.now(),
          name: item.name,
          genericName: '',
          category: '',
          stock: item.quantity,
          minStock: 0,
          maxStock: 0,
          purchasePrice: item.cost,
          price: item.cost,
          barcode: '',
          manufacturer: selectedSupplier ? selectedSupplier.companyName : '',
          expiryDate: '',
          manufacturingDate: '',
        };
        saveInventory([...inventory, newItem]);
        window.alert('New item added to inventory: ' + item.name);
      }
    } catch (err) {
      window.alert('Error updating inventory.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          {t.addSupplier}
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder={t.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="space-y-4">
            {filteredSuppliers.map((supplier) => (
              <Card key={supplier.id} className="cursor-pointer hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                          <Building className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{supplier.companyName}</h3>
                          <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span>{supplier.phone}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{supplier.email}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <span className="truncate">{supplier.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{t.lastOrder}: {supplier.lastOrder}</span>
                        </div>
                      </div>
                      <div className="mt-2">
                        <span className="font-medium">Supplies:</span>{' '}
                        {supplier.supplies && supplier.supplies.length > 0 ? (
                          <span>
                            {supplier.supplies.slice(0, 3).map((item: any, idx: number) => (
                              <span key={idx} className="inline-block mr-2">
                                {item.name} (PKR {item.cost}/qty {item.quantity})
                              </span>
                            ))}
                            {supplier.supplies.length > 3 && <span>...</span>}
                          </span>
                        ) : (
                          <span className="text-gray-400">No items listed</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4 mt-4">
                        <Badge variant="secondary">
                          {t.totalPurchases}: PKR {supplier.totalPurchases.toLocaleString()}
                        </Badge>
                        {supplier.pendingPayments > 0 ? (
                          <Badge variant="destructive">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Due: PKR {supplier.pendingPayments.toLocaleString()}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Paid</Badge>
                        )}
                        <Badge variant={supplier.status === 'active' ? 'default' : 'secondary'}>
                          {supplier.status === 'active' ? t.active : t.inactive}
                        </Badge>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setSelectedSupplier(supplier)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleEditSupplier(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => handleDeleteSupplier(supplier)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {selectedSupplier && (
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>{t.supplierProfile}</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="profile">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="profile">Profile</TabsTrigger>
                    <TabsTrigger value="history">Orders</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile" className="space-y-4">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building className="h-10 w-10 text-green-600" />
                      </div>
                      <h3 className="font-semibold text-lg">{selectedSupplier.companyName}</h3>
                      <p className="text-sm text-gray-600">{selectedSupplier.contactPerson}</p>
                    </div>

                    <div className="space-y-3 text-sm">
                      <div>
                        <label className="font-medium">{t.phone}:</label>
                        <p>{selectedSupplier.phone}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.email}:</label>
                        <p>{selectedSupplier.email}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.address}:</label>
                        <p>{selectedSupplier.address}</p>
                      </div>
                      <div>
                        <label className="font-medium">{t.taxId}:</label>
                        <p>{selectedSupplier.taxId}</p>
                      </div>
                    </div>

                    {/* Supplied Items Section */}
                    <div className="mt-6">
                      <h4 className="font-semibold mb-2">Supplied Items</h4>
                      <div className="space-y-2">
                        {selectedSupplier.supplies && selectedSupplier.supplies.length > 0 ? (
                          selectedSupplier.supplies.map((item: any, idx: number) => (
                            <div key={idx} className="flex items-center justify-between bg-gray-50 rounded px-3 py-2">
                              <div>
                                <span className="font-medium">{item.name}</span>
                                <span className="ml-2 text-xs text-gray-500">Cost: PKR {item.cost}</span>
                                <span className="ml-2 text-xs text-gray-500">Qty: {item.quantity}</span>
                              </div>
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => handleViewInInventory(item)}>
                                  View in Inventory
                                </Button>
                                <Button size="sm" variant="outline" onClick={() => handleAddToInventory(item)}>
                                  Add to Inventory
                                </Button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-xs text-gray-500">No items supplied yet.</div>
                        )}
                      </div>
                    </div>

                    {/* Add Item to Supplier Form */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold mb-2">Add Item to Supplier</h4>
                      <form className="flex flex-col gap-2" onSubmit={handleAddSuppliedItem}>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Item Name"
                            value={newSupply.name}
                            onChange={e => setNewSupply({ ...newSupply, name: e.target.value })}
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Cost"
                            value={newSupply.cost}
                            onChange={e => setNewSupply({ ...newSupply, cost: Number(e.target.value) })}
                            min={1}
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Quantity"
                            value={newSupply.quantity}
                            onChange={e => setNewSupply({ ...newSupply, quantity: Number(e.target.value) })}
                            min={1}
                            required
                          />
                        </div>
                        <Button type="submit" size="sm" className="w-fit">Add Item</Button>
                      </form>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <div className="space-y-3">
                      {/* Purchases List with Inventory Stock */}
                      {selectedSupplier.purchases.map((purchase: any, index: number) => {
                        // Parse items string into array (format: 'item1, item2')
                        const itemsArr = purchase.items.split(',').map((x: string) => x.trim());
                        // Fetch inventory for each item
                        let inventory: any[] = [];
                        try {
                          const { getInventory } = require('@/utils/inventoryService');
                          inventory = getInventory();
                        } catch {}
                        return (
                          <div key={index} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium">PKR {purchase.amount.toLocaleString()}</p>
                                <div className="text-xs text-gray-600">
                                  {itemsArr.map((itemName: string, idx: number) => {
                                    const inv = inventory.find((inv: any) => inv.name.toLowerCase() === itemName.toLowerCase());
                                    return (
                                      <div key={idx} className="flex items-center gap-2">
                                        <span>{itemName}</span>
                                        {inv ? (
                                          <span className="text-green-600">(Stock: {inv.stock})</span>
                                        ) : (
                                          <span className="text-red-500">(Not in inventory)</span>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                                <p className="text-xs text-blue-600">{purchase.invoice}</p>
                              </div>
                              <p className="text-xs text-gray-600">{purchase.date}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Add New Order Form */}
                    <div className="mt-6 border-t pt-4">
                      <h4 className="font-semibold mb-2">Add New Order</h4>
                      <form className="flex flex-col gap-2" onSubmit={handleAddOrder}>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Items (comma separated)"
                            value={newOrder.items}
                            onChange={e => setNewOrder({ ...newOrder, items: e.target.value })}
                            required
                          />
                          <Input
                            type="number"
                            placeholder="Total Amount"
                            value={newOrder.amount}
                            onChange={e => setNewOrder({ ...newOrder, amount: Number(e.target.value) })}
                            min={1}
                            required
                          />
                          <Input
                            placeholder="Invoice Number"
                            value={newOrder.invoice}
                            onChange={e => setNewOrder({ ...newOrder, invoice: e.target.value })}
                            required
                          />
                        </div>
                        <Button type="submit" size="sm" className="w-fit">Add Order</Button>
                      </form>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {showDeleteDialog && deleteTarget && (
        <ConfirmDeleteDialog
          isOpen={showDeleteDialog}
          supplierName={deleteTarget.companyName}
          isUrdu={isUrdu}
          onCancel={() => { setShowDeleteDialog(false); setDeleteTarget(null); }}
          onConfirm={confirmDelete}
        />
      )}

      {showForm && (
        <SupplierForm
          isUrdu={isUrdu}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
          onSave={handleSaveSupplier}
          supplier={editingSupplier}
        />
      )}
    </div>
  );
};

export default SupplierManagement;
