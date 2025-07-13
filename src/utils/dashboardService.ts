// All Firestore logic removed. Use backend API for metrics.

/**
 * Get today's total sales
 */
export const getTodaySales = async (): Promise<number> => {
  // TODO: Implement backend API call for today's sales
  return 0;
};

/**
 * Get total inventory quantity (sum of all quantities in stock)
 */
export const getTotalInventory = async (): Promise<number> => {
  try {
    const response = await fetch('http://localhost:5000/api/add-stock');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const items = await response.json();
    return items.reduce((sum: number, item: any) => sum + (item.quantity || 0), 0);
  } catch (error) {
    console.error('Error calculating total inventory:', error);
    return 0;
  }
};

/**
 * Get count of low stock items (stock < threshold)
 */
export const getLowStockItems = async (threshold = 10): Promise<number> => {
  try {
    const response = await fetch('http://localhost:5000/api/add-stock');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const items = await response.json();
    return items.filter((item: any) => {
      const min = item.minStock ?? threshold;
      return (item.quantity ?? 0) > 0 && (item.quantity ?? 0) < min;
    }).length;
  } catch (error) {
    console.error('Error calculating low stock items:', error);
    return 0;
  }
};

/**
 * Get count of out of stock items (stock === 0)
 */
export const getOutOfStockItems = async (): Promise<number> => {
  try {
    const response = await fetch('http://localhost:5000/api/add-stock');
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    const items = await response.json();
    return items.filter((item: any) => (item.quantity ?? 0) === 0).length;
  } catch (error) {
    console.error('Error calculating out of stock items:', error);
    return 0;
  }
};

/**
 * Get monthly profit (sales - expenses for current month)
 */
export const getMonthlyProfit = async (): Promise<number> => {
  try {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Get total sales
    // TODO: Replace with backend API call for sales and expenses summary
    // Example: const res = await axios.get('/api/dashboard/summary');
    // return res.data.totalSales - res.data.totalExpenses;
    return 0;
  } catch (error) {
    console.error('Error calculating monthly profit:', error);
    return 0;
  }
};
