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
}

// Inventory CRUD logic is now handled by the backend API.

// TODO: low stock logic should come from backend API

// TODO: search inventory via backend API

export const getInventory = async (): Promise<InventoryItem[]> => {
  try {
    const response = await fetch('/api/inventory');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    return await response.json();
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
    const response = await fetch(`/api/inventory/${itemId}/stock`, {
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
