// All Firestore logic removed. Use backend API for metrics.

/**
 * Get today's total sales
 */
export const getTodaySales = async (): Promise<number> => {
  // TODO: Implement backend API call for today's sales
  return 0;
};

/**
 * Get total inventory count
 */
export const getTotalInventory = async (): Promise<number> => {
  // TODO: Implement backend API call for total inventory count
  return 0;
};

/**
 * Get count of low stock items (stock < threshold)
 */
export const getLowStockItems = async (threshold = 10): Promise<number> => {
  // TODO: Implement backend API call for low stock items if needed.
  return 0;
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
