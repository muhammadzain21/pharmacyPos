const INVENTORY_STORAGE_KEY = 'pharmacy_inventory';

export interface InventoryItem {
  id: string;
  name: string;
  genericName: string;
  price: number;
  stock: number;
  barcode?: string;
  category?: string;
  manufacturer?: string;
  minStock?: number;
  maxStock?: number;
  purchasePrice?: number;
  salePrice?: number;
  batchNo?: string;
  expiryDate?: string;
  manufacturingDate?: string;
  supplierName?: string;
  status?: 'pending' | 'approved';
}

// Inventory CRUD logic is now handled by the backend API.

// TODO: low stock logic should come from backend API

// TODO: search inventory via backend API

export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    // Fetch inventory items
    const response = await fetch('/api/add-stock');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }

    const records = await response.json();
    // Transform AddStock records into InventoryItem shape for POS
    return records.map((record: any) => ({
      id: record._id,
      name: record.medicine?.name || record.name || '',
      genericName: record.medicine?.genericName || record.genericName || '',
      price: record.unitPrice || record.price || 0,
      stock: record.quantity || record.stock || 0,
      barcode: record.medicine?.barcode || record.barcode,
      category: record.medicine?.category || record.category,
      manufacturer: record.medicine?.manufacturer || record.manufacturer,
      minStock: record.minStock,
      maxStock: record.maxStock,
      purchasePrice: record.unitPrice,
      salePrice: record.salePrice ?? record.unitPrice ?? record.price,
      batchNo: record.batchNo || record.batchNumber,
      expiryDate: record.expiryDate,
      manufacturingDate: undefined,
      supplierName: undefined,
      status: record.status ?? 'approved'
    })) as InventoryItem[];
  } catch (error) {
    console.error('Error fetching inventory:', error);
    throw error;
  }
};

export const saveInventory = async (items: InventoryItem[]): Promise<void> => {
  try {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(items)
    });
    
    if (!response.ok) {
      throw new Error('Failed to save inventory');
    }
  } catch (error) {
    console.error('Error saving inventory:', error);
    throw error;
  }
};

export const searchInventory = async (query: string): Promise<InventoryItem[]> => {
  try {
    const response = await fetch(`/api/inventory/search?q=${encodeURIComponent(query)}`);
    if (!response.ok) {
      throw new Error('Failed to search inventory');
    }
    return await response.json();
  } catch (error) {
    console.error('Error searching inventory:', error);
    throw error;
  }
};

export const addInventoryItem = async (item: Omit<InventoryItem, 'id'>): Promise<InventoryItem> => {
  try {
    const response = await fetch('/api/inventory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) {
      throw new Error('Failed to add inventory item');
    }
    return await response.json();
  } catch (error) {
    console.error('Error adding inventory item:', error);
    throw error;
  }
};

export const updateItemStock = async (itemId: string, quantityChange: number): Promise<InventoryItem> => {
  try {
    const response = await fetch(`/api/add-stock/${itemId}/quantity`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ change: quantityChange })
    });
    
    if (!response.ok) {
      throw new Error('Failed to update item stock');
    }
    return await response.json();
  } catch (error) {
    console.error('Error updating item stock:', error);
    throw error;
  }
};
