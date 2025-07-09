import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getInventory, addInventoryItem, InventoryItem } from '@/utils/inventoryService';

interface InventoryContextType {
  inventory: InventoryItem[];
  refreshInventory: () => Promise<void>;
  addItemToInventory: (item: Omit<InventoryItem, 'id'>) => Promise<void>;
}

const InventoryContext = createContext<InventoryContextType | undefined>(undefined);

export const InventoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);

  const refreshInventory = async () => {
    try {
      const data = await getInventory();
      setInventory(data);
    } catch (error) {
      console.error('Failed to refresh inventory:', error);
    }
  };

  const addItemToInventory = async (item: Omit<InventoryItem, 'id'>) => {
    try {
      await addInventoryItem(item);
      await refreshInventory();
    } catch (error) {
      console.error('Failed to add item to inventory:', error);
      throw error;
    }
  };

  // Load inventory on mount
  useEffect(() => {
    refreshInventory();
    // eslint-disable-next-line
  }, []);

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        refreshInventory,
        addItemToInventory,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
};

export const useInventory = (): InventoryContextType => {
  const context = useContext(InventoryContext);
  if (context === undefined) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
};
