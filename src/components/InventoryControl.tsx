import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Package, 
  AlertTriangle, 
  TrendingDown, 
  Calendar,
  Search,
  Filter,
  Download,
  RefreshCw,
  Plus,
  Barcode
} from 'lucide-react';
import BarcodeScanner from './BarcodeScanner';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { DoubleConfirmDialog } from './ui/DoubleConfirmDialog';
import { InventoryItem } from '@/utils/inventoryService';
import axios from 'axios';
import { useInventory } from '@/contexts/InventoryContext';

interface InventoryControlProps {
  isUrdu: boolean;
}

interface AddStockDialogProps {
  onStockAdded: () => void;
  onCancel: () => void;
}

export type SupplierType = { _id?: string; id?: string; name: string };

import { getMedicines } from '@/utils/medicineService';
import { getSuppliers } from '@/utils/supplierService';

const AddStockDialog: React.FC<AddStockDialogProps> = ({ onStockAdded, onCancel }) => {
  const [minStock, setMinStock] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [medicines, setMedicines] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [selectedMedicine, setSelectedMedicine] = useState<any | null>(null);
  const [stockQuantity, setStockQuantity] = useState<string>('');
  const [unitPrice, setUnitPrice] = useState<string>('');
  const [salePrice, setSalePrice] = useState<string>('');
  const [lastPurchasePrice, setLastPurchasePrice] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [selectedSupplier, setSelectedSupplier] = useState<string>('');
  const [newSupplierName, setNewSupplierName] = useState<string>('');
  const [showNewSupplierField, setShowNewSupplierField] = useState<boolean>(false);
  const [showNewMedicineField, setShowNewMedicineField] = useState<boolean>(false);
  const [newMedicineName, setNewMedicineName] = useState<string>('');
  const [newGenericName, setNewGenericName] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meds = await getMedicines();
        setMedicines(meds);
        const sups = await getSuppliers();
        setSuppliers(sups as SupplierType[]);
      } catch (e) {
        toast({ title: 'Error', description: 'Failed to fetch medicines or suppliers', variant: 'destructive' });
      }
    };
    fetchData();
  }, []);

  const handleAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const res = await axios.post('/api/suppliers', { name: newSupplierName });
      setSuppliers((prev: SupplierType[]) => [...prev, res.data]);
      setSelectedSupplier(res.data._id || res.data.id);
      setShowNewSupplierField(false);
      setNewSupplierName('');
      toast({ title: 'Success', description: 'Supplier added' });
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add supplier', variant: 'destructive' });
    }
  };

  const handleAddMedicine = async () => {
  if (!newMedicineName.trim() || !newGenericName.trim()) return;
  try {
    const res = await axios.post('/api/medicines', { name: newMedicineName, genericName: newGenericName });
    setMedicines(prev => [...prev, res.data]);
    setSelectedMedicine(res.data);
    setShowNewMedicineField(false);
    setNewMedicineName('');
    setNewGenericName('');
    toast({ title: 'Success', description: 'Medicine added' });
  } catch (e) {
    toast({ title: 'Error', description: 'Failed to add medicine', variant: 'destructive' });
  }
};

const handleAddStock = async () => {
    console.log("handleAddStock called", { selectedMedicine, stockQuantity, unitPrice });
    if (!selectedMedicine || !stockQuantity || !unitPrice) {
      toast({
        title: 'Error',
        description: 'Please fill all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      const supplier = showNewSupplierField ? newSupplierName : selectedSupplier;
      const medicineId = selectedMedicine._id || selectedMedicine.id;

      const payload = { medicine: medicineId, quantity: parseInt(stockQuantity), unitPrice: parseFloat(unitPrice), supplier, minStock: minStock ? parseInt(minStock) : undefined, expiryDate: expiryDate || undefined };
      console.log('POST-payload', payload);
      await axios.post('/api/add-stock', payload);
      console.log('POST-success');
      onStockAdded();
      
      toast({
        title: 'Success',
        description: 'Stock added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add stock',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="ml-2">
          <Plus className="mr-2 h-4 w-4" /> Add Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Stock</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {/* Medicine selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="medicine" className="text-right">
              Medicine
            </Label>
            <Select 
              value={selectedMedicine ? selectedMedicine._id || selectedMedicine.id : ''}
              onValueChange={val => {
                const med = medicines.find(m => m._id === val || m.id === val);
                setSelectedMedicine(med);
              }}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select medicine" />
              </SelectTrigger>
              <SelectContent>
                {medicines.map((item) => (
                  <SelectItem key={String(item._id || item.id)} value={String(item._id || item.id)}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="mt-2 flex gap-2 items-center">
              <Button variant="outline" size="sm" onClick={() => setShowNewMedicineField(true)}>
                + Add Medicine
              </Button>
            </div>
            {showNewMedicineField && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <Input
                  placeholder="Medicine Name"
                  value={newMedicineName}
                  onChange={e => setNewMedicineName(e.target.value)}
                />
                <Input
                  placeholder="Generic Name"
                  value={newGenericName}
                  onChange={e => setNewGenericName(e.target.value)}
                />
                <Button
                  className="col-span-2"
                  size="sm"
                  onClick={handleAddMedicine}
                >
                  Save Medicine
                </Button>
              </div>
            )}
          </div>
          
          {/* Quantity field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              className="col-span-3"
              value={stockQuantity}
              onChange={e => setStockQuantity(e.target.value)}
              placeholder="Enter quantity"
              required
            />
          </div>
          {/* Minimum Stock field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="minStock" className="text-right">
              Minimum Stock
            </Label>
            <Input
              id="minStock"
              type="number"
              min="0"
              className="col-span-3"
              value={minStock}
              onChange={e => setMinStock(e.target.value)}
              placeholder="Enter minimum stock"
            />
          </div>
          {/* Expiry Date field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="expiryDate" className="text-right">
              Expiry Date
            </Label>
            <Input
              id="expiryDate"
              type="date"
              className="col-span-3"
              value={expiryDate}
              onChange={e => setExpiryDate(e.target.value)}
              placeholder="Select expiry date"
            />
          </div>
          {/* Unit Price field */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unitPrice" className="text-right">
              Unit Price
            </Label>
            <Input
              id="unitPrice"
              type="number"
              min="0"
              step="0.01"
              className="col-span-3"
              value={unitPrice}
              onChange={e => setUnitPrice(e.target.value)}
              placeholder="Enter unit price"
              required
            />
          </div>
          
          {/* Supplier selection */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="supplier" className="text-right">
              Supplier
            </Label>
            <div className="col-span-3 flex items-center gap-2">
              {!showNewSupplierField ? (
                <>
                  <Select onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map((supplier) => {
                        const value = supplier._id ? String(supplier._id) : String(supplier.id);
                        return (
                          <SelectItem key={value} value={value}>
                            {supplier.name}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewSupplierField(true)}
                  >
                    + New
                  </Button>
                </>
              ) : (
                <div className="flex gap-2 w-full">
                  <Input
                    value={newSupplierName}
                    onChange={(e) => setNewSupplierName(e.target.value)}
                    placeholder="Enter new supplier name"
                  />
                  <Button size="sm" variant="default" onClick={handleAddSupplier}>
                    Add
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setShowNewSupplierField(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancel</Button>
          <Button onClick={handleAddStock}>Add Stock</Button>
        </div>
      </DialogContent>
      <DialogClose />
    </Dialog>
  );
};

const InventoryControl: React.FC<InventoryControlProps> = ({ isUrdu }) => {
  // --- Add Medicine Dialog State ---
  const [isAddMedicineDialogOpen, setIsAddMedicineDialogOpen] = useState(false);
  const [medicineForm, setMedicineForm] = useState({ name: '', genericName: '' });
  const { toast } = useToast();

  // Handler for submitting new medicine
  const handleAddMedicine = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicineForm.name.trim() || !medicineForm.genericName.trim()) {
      toast({ title: 'Error', description: 'Name and generic name are required', variant: 'destructive' });
      return;
    }
    try {
      await axios.post('/api/medicines', medicineForm);
      toast({ title: 'Success', description: 'Medicine added successfully' });
      setMedicineForm({ name: '', genericName: '' });
      setIsAddMedicineDialogOpen(false);
    } catch (error: any) {
      toast({ title: 'Error', description: error?.response?.data?.error || 'Failed to add medicine', variant: 'destructive' });
    }
  };

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  // Edit dialog state
  const [editItem, setEditItem] = useState<InventoryItem | null>(null);
  const [editForm, setEditForm] = useState({
    stock: '',
    unitPrice: '',
    minStock: '',
    expiryDate: '',
  });
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  // Initialize all state at the top
  const [searchTerm, setSearchTerm] = useState('');
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  // Use inventory from context
  const { inventory, addItemToInventory, refreshInventory } = useInventory();
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    category: '',
    batchNo: '',
    stock: '0',
    minStock: '10',
    maxStock: '100',
    purchasePrice: '0',
    salePrice: '0',
    totalStockPrice: '0',
    barcode: '',
    manufacturer: '',
    supplierName: '',
    expiryDate: '',
    manufacturingDate: '',
    _lastChanged: '', // tracks which field was last edited for auto-calc
  });

  // Supplier state for dropdown and add-new
  const [suppliers, setSuppliers] = useState<SupplierType[]>([]);
  const [showAddSupplierDialog, setShowAddSupplierDialog] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');

  // Load suppliers for dropdown on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        // Replace with actual supplier fetching logic
        const suppliersData = await fetch('/api/suppliers').then(res => res.json());
        setSuppliers(suppliersData);
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
      }
    };
    
    fetchSuppliers();
  }, []);

  const [showBarcodeScannerInForm, setShowBarcodeScannerInForm] = useState(false);
  
  // No need to fetch inventory here; handled by context

  
  // Auto-calculate totalStockPrice or purchasePrice based on user input
  useEffect(() => {
    const stock = Number(formData.stock) || 0;
    const purchasePrice = Number(formData.purchasePrice) || 0;
    // Only auto-calculate if user is editing stock or purchasePrice directly
    if (formData._lastChanged === 'stock' || formData._lastChanged === 'purchasePrice') {
      const totalStockPrice = (stock * purchasePrice).toFixed(2);
      if (formData.totalStockPrice !== totalStockPrice) {
        setFormData(prev => ({
          ...prev,
          totalStockPrice,
        }));
      }
    }
    // If user is editing totalStockPrice directly, update purchasePrice
    if (formData._lastChanged === 'totalStockPrice') {
      if (stock > 0) {
        const calculatedPurchasePrice = (Number(formData.totalStockPrice) / stock).toFixed(2);
        if (formData.purchasePrice !== calculatedPurchasePrice) {
          setFormData(prev => ({
            ...prev,
            purchasePrice: calculatedPurchasePrice,
          }));
        }
      }
    }
  }, [formData.stock, formData.purchasePrice, formData.totalStockPrice, formData._lastChanged]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Handle auto-calculation triggers
    if (name === 'stock' || name === 'purchasePrice') {
      setFormData(prev => ({
        ...prev,
        [name]: value,
        _lastChanged: name
      }));
    } else if (name === 'totalStockPrice') {
      setFormData(prev => ({
        ...prev,
        totalStockPrice: value,
        _lastChanged: 'totalStockPrice'
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  // Add new inventory item via backend API
  const handleSaveInventory = async (item: InventoryItem) => {
    try {
      await axios.post('/api/inventory', item);
      await loadInventory();
      setIsAddDialogOpen(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to add inventory', variant: 'destructive' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newItem: InventoryItem = {
      id: Date.now().toString(),
      name: formData.name,
      genericName: formData.genericName,
      category: formData.category,
      batchNo: formData.batchNo,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 10,
      maxStock: Number(formData.maxStock) || 100,
      purchasePrice: Number(formData.purchasePrice) || 0,
      salePrice: Number(formData.salePrice) || 0,
      price: Number(formData.salePrice) || 0, // For compatibility
      barcode: formData.barcode,
      manufacturer: formData.manufacturer,
      supplierName: formData.supplierName,
      expiryDate: formData.expiryDate,
      manufacturingDate: formData.manufacturingDate
    };

    handleSaveInventory(newItem);
    
    // Reset form
    setFormData({
      name: '',
      genericName: '',
      category: '',
      batchNo: '',
      stock: '0',
      minStock: '10',
      maxStock: '100',
      purchasePrice: '0',
      salePrice: '0',
      totalStockPrice: '0',
      barcode: '',
      manufacturer: '',
      supplierName: '',
      expiryDate: '',
      manufacturingDate: '',
      _lastChanged: '',
    });
    
    setIsAddDialogOpen(false);
  };

  // Add new supplier handler
  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplierName.trim()) return;
    const newSup = { id: Date.now().toString(), name: newSupplierName.trim() };
    setSuppliers((prev) => [...prev, newSup]);
    setFormData(prev => ({ ...prev, supplierName: newSup.name }));
    setShowAddSupplierDialog(false);
    setNewSupplierName('');
  };

  const handleBarcodeScanned = (barcode: string) => {
    setSearchTerm(barcode);
    setShowBarcodeScanner(false);
    
    // If we find a matching product, select it
    const matchingItem = inventory.find(item => 
      item.barcode?.toLowerCase() === barcode.toLowerCase()
    );
    
    if (matchingItem) {
      // You might want to handle the matching item (e.g., select it in the UI)
      console.log('Found matching item:', matchingItem);
      
      // Show a toast notification
      toast({
        title: isUrdu ? 'مصنوعات ملی' : 'Product Found',
        description: isUrdu 
          ? `${matchingItem.name} - ${matchingItem.stock || 0} دستیاب`
          : `${matchingItem.name} - ${matchingItem.stock || 0} in stock`,
        variant: 'default' as const
      });
    } else {
      // If no matching item found, offer to add it
      if (confirm(isUrdu 
        ? 'کوئی مماثل مصنوعات نہیں ملی۔ کیا آپ اسے نئی مصنوعات کے طور پر شامل کرنا چاہیں گے؟' 
        : 'No matching product found. Would you like to add it as a new item?')) {
        setFormData(prev => ({
          ...prev,
          barcode: barcode,
          name: '',
          stock: '0',
          price: '0',
          purchasePrice: '0',
          minStock: '0',
          maxStock: '0'
        }));
        setIsAddDialogOpen(true);
      }
    }
  };

  // Open edit dialog and populate form
  const handleEditItem = (item: InventoryItem) => {
    setEditItem(item);
    setEditForm({
      stock: String(item.stock ?? ''),
      unitPrice: String(item.price ?? ''),
      minStock: String(item.minStock ?? ''),
      expiryDate: item.expiryDate ? new Date(item.expiryDate).toISOString().split('T')[0] : '',
    });
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdateItem = async () => {
    if (!editItem) return;
    try {
      await axios.put(`/api/add-stock/${editItem.id}`, {
        quantity: Number(editForm.stock),
        unitPrice: Number(editForm.unitPrice),
        minStock: editForm.minStock ? Number(editForm.minStock) : undefined,
        expiryDate: editForm.expiryDate || undefined,
      });
      toast({ title: 'Success', description: 'Item updated' });
      setEditItem(null);
      await refreshInventory();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to update item', variant: 'destructive' });
    }
  };

  const categories = [
    'Tablets',
    'Syrups',
    'Capsules',
    'Injections',
    'Ointments',
    'Drops',
    'Inhalers',
    'Suppositories',
    'Analgesic',
    'Antibiotic',
    'Antacid',
    'Antihistamine',
    'Antidepressant',
    'Antidiabetic',
    'Antihypertensive',
    'Antiviral',
    'Antiseptic',
    'Antipyretic',
    'Other'
  ];

  const text = {
    en: {
      title: 'Inventory Control',
      searchPlaceholder: 'Search inventory...',
      all: 'All Items',
      lowStock: 'Low Stock',
      expiring: 'Expiring Soon',
      outOfStock: 'Out of Stock',
      stockValue: 'Total Stock Value',
      lowStockItems: 'Low Stock Items',
      expiringItems: 'Expiring Soon',
      outOfStockItems: 'Out of Stock',
      refresh: 'Refresh',
      export: 'Export',
      filter: 'Filter',
      medicine: 'Medicine',
      category: 'Category',
      stock: 'Stock',
      expiry: 'Expiry',
      value: 'Value',
      status: 'Status'
    },
    ur: {
      title: 'انوینٹری کنٹرول',
      searchPlaceholder: 'انوینٹری تلاش کریں...',
      all: 'تمام اشیاء',
      lowStock: 'کم اسٹاک',
      expiring: 'ختم ہونے والی',
      outOfStock: 'اسٹاک ختم',
      stockValue: 'کل اسٹاک کی قیمت',
      lowStockItems: 'کم اسٹاک کی اشیاء',
      expiringItems: 'ختم ہونے والی اشیاء',
      outOfStockItems: 'ختم شدہ اشیاء',
      refresh: 'تازہ کریں',
      export: 'ایکسپورٹ',
      filter: 'فلٹر',
      medicine: 'دوا',
      category: 'قسم',
      stock: 'اسٹاک',
      expiry: 'ختم ہونے کی تاریخ',
      value: 'قیمت',
      status: 'حالت'
    }
  };

  const t = isUrdu ? text.ur : text.en;

  // Helper functions
  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const today = new Date();
    const threeDaysFromNow = new Date(today.getTime() + (90 * 24 * 60 * 60 * 1000)); // 90 days
    return expiry <= threeDaysFromNow;
  };

  const getStockStatus = (stock: number, minStock: number) => {
    if (stock === 0) return { status: 'Out of Stock', color: 'destructive', icon: AlertTriangle };
    if (stock <= minStock) return { status: 'Low Stock', color: 'secondary', icon: TrendingDown };
    return { status: 'In Stock', color: 'default', icon: Package };
  };

  // Calculate inventory metrics
  const inventoryValue = inventory.reduce((sum, item) => sum + ((item.price || 0) * (item.stock || 0)), 0);
  const lowStockCount = inventory.filter(item => (item.stock || 0) > 0 && (item.stock || 0) <= (item.minStock || 0)).length;
  const expiringCount = inventory.filter(item => isExpiringSoon(item.expiryDate)).length;
  const outOfStockCount = inventory.filter(item => item.stock === 0).length;

  const filterInventory = () => {
    const filteredItems = inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (item.genericName?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                          (item.barcode?.includes(searchTerm) ?? false);
      
      if (activeTab === 'low') return matchesSearch && item.stock <= (item.minStock || 5);
      if (activeTab === 'expiring') return matchesSearch && isExpiringSoon(item.expiryDate || '');
      if (activeTab === 'out') return matchesSearch && item.stock === 0;
      
      return matchesSearch;
    });
    return filteredItems;
  };

  const filteredInventory = filterInventory();

  // Double confirmation dialog for deletion
  const deleteChecklist = [
    isUrdu ? 'میں تصدیق کرتا ہوں کہ یہ عمل ناقابل واپسی ہے۔' : 'I understand this action cannot be undone.',
    isUrdu ? 'میں نے اس اسٹاک آئٹم کو چیک کر لیا ہے اور مستقل طور پر حذف کرنا چاہتا ہوں۔' : 'I have reviewed the item and wish to permanently delete it.'
  ];

  const handleDeleteInventory = (id: number) => {
    setDeleteTargetId(String(id));
    setShowDeleteDialog(true);
  };

  const confirmDeleteInventory = () => {
    if (deleteTargetId === null) return;
    const updatedInventory = inventory.filter(item => String(item.id) !== String(deleteTargetId));
    
    // Delete inventory item via backend API
    axios.delete(`/api/add-stock/${deleteTargetId}`)
      .then(() => {
        loadInventory();
        setShowDeleteDialog(false);
        setDeleteTargetId(null);
        toast({
          title: isUrdu ? 'کامیابی' : 'Success',
          description: isUrdu 
            ? 'اسٹاک آئٹم کامیابی سے حذف ہو گیا' 
            : 'Inventory item deleted successfully',
        });
      })
      .catch(() => {
        toast({ title: 'Error', description: 'Failed to delete item', variant: 'destructive' });
      });
  };

  const cancelDeleteInventory = () => {
    setShowDeleteDialog(false);
    setDeleteTargetId(null);
  };

  const loadInventory = async () => {
    await refreshInventory();
  };

  return (
    <React.Fragment>
      <div>
        {/* Header */}
        <div className="flex justify-between items-center">
  <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
  <div className="flex space-x-2">
    {/* Add Inventory Button */}
    
    {/* Add New Stock Button */}
    <Dialog open={isAddMedicineDialogOpen} onOpenChange={setIsAddMedicineDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="default">
          {isUrdu ? 'نئی دوا شامل کریں' : 'Add New Stock'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUrdu ? 'نئی دوا شامل کریں' : 'Add New Medicine'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddMedicine} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="medicineName">{isUrdu ? 'ادویات کا نام' : 'Medicine Name'} <span className="text-red-500">*</span></Label>
            <Input
              id="medicineName"
              name="medicineName"
              value={medicineForm.name}
              onChange={e => setMedicineForm({ ...medicineForm, name: e.target.value })}
              placeholder={isUrdu ? 'ادویات کا نام درج کریں' : 'Enter medicine name'}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="genericName">{isUrdu ? 'جنیرک نام' : 'Generic Name'} <span className="text-red-500">*</span></Label>
            <Input
              id="genericName"
              name="genericName"
              value={medicineForm.genericName}
              onChange={e => setMedicineForm({ ...medicineForm, genericName: e.target.value })}
              placeholder={isUrdu ? 'جنیرک نام درج کریں' : 'Enter generic name'}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setIsAddMedicineDialogOpen(false)}>
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </Button>
            <Button type="submit">{isUrdu ? 'محفوظ کریں' : 'Save'}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
    {/* Add Stock Button */}
    <AddStockDialog 
      onStockAdded={loadInventory}
      onCancel={() => setIsAddDialogOpen(false)}
    />
    <Button variant="outline">
      <RefreshCw className="h-4 w-4 mr-2" />
      {t.refresh}
    </Button>
    <Button 
      variant="outline" 
      onClick={async () => {
        try {
                  // Get the button element to update its state
                  const exportButton = document.querySelector('button:has(> svg.download-icon)') as HTMLButtonElement;
                  if (exportButton) {
                    exportButton.disabled = true;
                    const originalContent = exportButton.innerHTML;
                    exportButton.innerHTML = isUrdu 
                      ? '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> برآمد ہو رہا ہے...'
                      : '<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-current inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> Exporting...';
                
                  // Get the current date for the filename
                  const today = new Date().toISOString().split('T')[0];
                  
                  // Define CSV headers with proper encoding
                  const headers = [
                    'ID', 'Medicine Name', 'Generic Name', 'Category', 'Manufacturer',
                    'Stock', 'Min Stock', 'Max Stock', 'Unit Price', 'Total Value',
                    'Barcode', 'Manufacturing Date', 'Expiry Date', 'Status', 'Expiry Status'
                  ];

                  // Format data for CSV
                  const rows = filteredInventory.map(item => {
                    const stockStatus = getStockStatus(item.stock, item.minStock);
                    const isExpiring = isExpiringSoon(item.expiryDate);
                    const expiryStatus = isExpiring ? 'Expiring Soon' : 
                                      (new Date(item.expiryDate) < new Date() ? 'Expired' : 'Valid');
                    
                    return {
                      id: item.id,
                      name: `"${(item.name || '').replace(/"/g, '""')}"`,
                      genericName: `"${(item.genericName || '').replace(/"/g, '""')}"`,
                      category: `"${(item.category || '').replace(/"/g, '""')}"`,
                      manufacturer: `"${(item.manufacturer || '').replace(/"/g, '""')}"`,
                      stock: item.stock || 0,
                      minStock: item.minStock || 0,
                      maxStock: item.maxStock || 0,
                      unitPrice: item.price || 0,
                      totalValue: (item.price || 0) * (item.stock || 0),
                      barcode: `"${(item.barcode || '').replace(/"/g, '""')}"`,
                      manufacturingDate: item.manufacturingDate || '',
                      expiryDate: item.expiryDate || '',
                      status: `"${stockStatus.status}"`,
                      expiryStatus: `"${expiryStatus}"`
                    };
                  });

                  // Create CSV content with BOM for Excel
                  const csvContent = [
                    '\uFEFF' + headers.join(','),
                    ...rows.map(row => [
                      row.id,
                      row.name,
                      row.genericName,
                      row.category,
                      row.manufacturer,
                      row.stock,
                      row.minStock,
                      row.maxStock,
                      row.unitPrice.toFixed(2),
                      row.totalValue.toFixed(2),
                      row.barcode,
                      row.manufacturingDate,
                      row.expiryDate,
                      row.status,
                      row.expiryStatus
                    ].join(','))
                  ].join('\r\n');

                  // Create and trigger download
                  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.setAttribute('href', url);
                  link.setAttribute('download', `inventory_export_${today}.csv`);
                  link.style.visibility = 'hidden';
                  document.body.appendChild(link);
                  link.click();
                  document.body.removeChild(link);
                  
                  // Clean up
                  setTimeout(() => URL.revokeObjectURL(url), 100);

                  // Show success message
                  toast({
                    title: isUrdu ? 'برآمدگی کامیاب' : 'Export Successful',
                    description: isUrdu 
                      ? `انوینٹری کی ${rows.length} اشیاء کامیابی سے برآمد ہو گئی ہیں` 
                      : `Successfully exported ${rows.length} items`,
                    duration: 3000
                  });

                  // Reset button state
                  if (exportButton) {
                    setTimeout(() => {
                      if (exportButton) {
                        exportButton.disabled = false;
                        exportButton.innerHTML = originalContent;
                      }
                    }, 500);
                  }
                }
              } catch (error) {
                console.error('Export failed:', error);
                toast({
                  title: isUrdu ? 'برآمدگی میں خرابی' : 'Export Failed',
                  description: isUrdu 
                    ? 'انوینٹری ڈیٹا برآمد کرتے وقت خرابی آئی ہے' 
                    : 'Failed to export inventory data',
                  variant: 'destructive',
                  duration: 3000
                });
                
                // Reset button state on error
                const exportButton = document.querySelector<HTMLButtonElement>('button:has(> svg.download-icon)');
                if (exportButton) {
                  exportButton.disabled = false;
                  exportButton.innerHTML = isUrdu 
                    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>برآمد کریں'
                    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download h-4 w-4 mr-1"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>Export';
                }
              }
            }}
          >
            <Download className="h-4 w-4 mr-2 download-icon" />
            {t.export}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.stockValue}</p>
                <p className="text-2xl font-bold text-green-600">PKR {inventoryValue.toLocaleString()}</p>
              </div>
              <Package className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.lowStockItems}</p>
                <p className="text-2xl font-bold text-yellow-600">{lowStockCount}</p>
              </div>
              <TrendingDown className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.expiringItems}</p>
                <p className="text-2xl font-bold text-orange-600">{expiringCount}</p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{t.outOfStockItems}</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex space-x-4">
        <div className="relative flex items-center w-full">
          <Input
            placeholder={isUrdu ? 'ادویات تلاش کریں یا بار کوڈ اسکین کریں...' : 'Search medicines or scan barcode...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-0 h-8 w-8"
            onClick={() => setShowBarcodeScanner(!showBarcodeScanner)}
            title={isUrdu ? 'بار کوڈ اسکین کریں' : 'Scan Barcode'}
          >
            <Barcode className="h-4 w-4" />
          </Button>
        </div>
        {showBarcodeScanner && (
          <div className="mt-2 p-3 border rounded-md bg-muted/20">
            <BarcodeScanner 
              onScan={handleBarcodeScanned} 
              isUrdu={isUrdu} 
            />
          </div>
        )}
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          {t.filter}
        </Button>
      </div>
      {showBarcodeScanner && (
        <div className="mt-2 p-3 border rounded-md bg-muted/20">
          <BarcodeScanner 
            onScan={handleBarcodeScanned} 
            isUrdu={isUrdu} 
          />
        </div>
      )}
      <Button variant="outline">
        <Filter className="h-4 w-4 mr-2" />
        {t.filter}
      </Button>
    </div>
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <TabsList>
        {[
          { id: 'all', label: t.all },
          { id: 'lowStock', label: t.lowStock },
          { id: 'expiring', label: t.expiring },
          { id: 'outOfStock', label: t.outOfStock }
        ].map(tab => (
          <TabsTrigger 
            key={`tab-${tab.id}`} 
            value={tab.id}
          >
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeTab} className="mt-6">
        <div className="space-y-4">
          {filteredInventory.map((item, index) => {
            const stockStatus = getStockStatus(item.stock, item.minStock);
            const isExpiring = isExpiringSoon(item.expiryDate);
            
            return (
              <Card key={item.id} className="transition-all hover:shadow-md">
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center" key={`item-grid-${index}`}>
                    <div className="md:col-span-2">
                      <h3 className="font-semibold text-gray-900">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-lg font-bold">{item.stock}</p>
                      <p className="text-xs text-gray-500">Min: {item.minStock}</p>
                      <p className="text-sm text-green-600">PKR {item.price?.toFixed(2) || '0.00'}</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-sm text-gray-600">
                        {item.manufacturingDate ? new Date(item.manufacturingDate).toLocaleDateString() : 'N/A'}
                      </p>
                      <div>
                        <p className={`text-sm ${isExpiring ? 'text-orange-600 font-semibold' : 'text-gray-600'}`}>
                          {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : 'N/A'}
                        </p>
                        {isExpiring && (
                          <Badge 
                            key={`expiring-badge-${item.id}`} 
                            variant="secondary"
                          >
                            Expiring
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <Button variant="outline" size="sm" onClick={() => handleEditItem(item)}>
                        {isUrdu ? 'ترمیم کریں' : 'Edit'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </TabsContent>
    </Tabs>
    
    {/* Add Supplier Dialog */}
    <Dialog open={showAddSupplierDialog} onOpenChange={setShowAddSupplierDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isUrdu ? 'نیا سپلائر شامل کریں' : 'Add New Supplier'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleAddSupplier}>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newSupplierName">{isUrdu ? 'سپلائر کا نام' : 'Supplier Name'} <span className="text-red-500">*</span></Label>
              <Input
                id="newSupplierName"
                name="newSupplierName"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                placeholder={isUrdu ? 'سپلائر کا نام درج کریں' : 'Enter supplier name'}
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" type="button" onClick={() => setShowAddSupplierDialog(false)}>
              {isUrdu ? 'منسوخ' : 'Cancel'}
            </Button>
            <Button type="submit">
              {isUrdu ? 'سپلائر شامل کریں' : 'Add Supplier'}
            </Button>
          </div>
        </form>
      </DialogContent>
      <DialogClose />
    </Dialog>
    {/* Double Confirm Dialog for Deletion */}
    <DoubleConfirmDialog
      open={showDeleteDialog}
      title={isUrdu ? 'کیا آپ واقعی یہ اسٹاک آئٹم حذف کرنا چاہتے ہیں؟' : 'Are you sure you want to delete this inventory item?'}
      description={isUrdu ? 'یہ عمل ناقابل واپسی ہے۔ براہ کرم تصدیق کریں کہ آپ اس اسٹاک آئٹم کو مستقل طور پر حذف کرنا چاہتے ہیں۔' : 'This action is irreversible. Please confirm you want to permanently delete this inventory item.'}
      checklist={deleteChecklist}
      confirmLabel={isUrdu ? 'حذف کریں' : 'Delete'}
      cancelLabel={isUrdu ? 'منسوخ' : 'Cancel'}
      onConfirm={confirmDeleteInventory}
      onCancel={cancelDeleteInventory}
    />
  </React.Fragment>
  );
};

export default InventoryControl;
