import axios from 'axios';

export interface UISupplier {
  id: string;
  companyName: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  totalPurchases?: number;
  pendingPayments?: number;
  lastOrder?: string;
  status?: 'active' | 'inactive';
  supplies?: Array<{
    name: string;
    cost: number;
    quantity: number;
    inventoryId?: string;
  }>;
  purchases?: Array<{
    date: string;
    amount: number;
    items: string;
    invoice: string;
  }>;
}

export const getSuppliers = async (): Promise<UISupplier[]> => {
  const res = await axios.get('/api/suppliers');
  // Normalize: ensure each supplier has _id or id
  return (res.data || []).map((s: any) => ({
    id: s._id || s.id,
    companyName: s.name,
    contactPerson: s.contactPerson,
    phone: s.phone,
    email: s.email,
    address: s.address,
    taxId: s.taxId,
    totalPurchases: s.totalPurchases,
    pendingPayments: s.pendingPayments,
    lastOrder: s.lastOrder ? new Date(s.lastOrder).toISOString().split('T')[0] : '',
    status: s.status,
    supplies: s.supplies || [],
    purchases: s.purchases || [],
  }));
};

// Add new supplier
export const addSupplier = async (supplier: UISupplier) => {
  const payload = {
    name: supplier.companyName,
    contactPerson: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    taxId: supplier.taxId,
    status: supplier.status,
  };
  return axios.post('/api/suppliers', payload);
};

// Update existing supplier
export const updateSupplier = async (id: string, supplier: Partial<UISupplier>) => {
  const payload = {
    name: supplier.companyName,
    contactPerson: supplier.contactPerson,
    phone: supplier.phone,
    email: supplier.email,
    address: supplier.address,
    taxId: supplier.taxId,
    status: supplier.status,
  };
  return axios.put(`/api/suppliers/${id}`, payload);
};

// Delete supplier
export const deleteSupplier = async (id: string) => {
  return axios.delete(`/api/suppliers/${id}`);
};
