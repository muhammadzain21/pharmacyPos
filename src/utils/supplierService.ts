import axios from 'axios';

import type { SupplierType } from '../components/InventoryControl';

export const getSuppliers = async (): Promise<SupplierType[]> => {
  const res = await axios.get('/api/suppliers');
  // Normalize: ensure each supplier has _id or id
  return (res.data || []).map((s: any) => ({
    _id: s._id ?? undefined,
    id: s.id ?? s._id ?? undefined,
    name: s.name,
  }));
};
