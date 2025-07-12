/*
import React, { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Download, Printer, Filter } from 'lucide-react';
import { useSettings } from '@/contexts/SettingsContext';
import { reportExporter } from '@/utils/reportExporter';

interface SummaryReportProps {
  isUrdu: boolean;
}

interface KPIValues {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalProfit: number;
}

const SummaryReport: React.FC<SummaryReportProps> = ({ isUrdu }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  const [details, setDetails] = useState<{ sales: any[]; purchases: any[]; expenses: any[] }>({
    sales: [],
    purchases: [],
    expenses: [],
  });
  const reportRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  const todayStr = new Date().toISOString().split('T')[0];

  const [dateRange, setDateRange] = useState({ from: todayStr, to: todayStr });
  const [kpi, setKpi] = useState<KPIValues>({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalProfit: 0,
  });

  const text = {
    en: {
      title: 'Daily Summary Report',
      totalSales: 'Total Sales',
      totalPurchases: 'Total Purchases',
      totalExpenses: 'Total Expenses',
      totalProfit: 'Total Profit',
      download: 'Download',
      print: 'Print',
      from: 'From',
      to: 'To',
      apply: 'Apply',
      salesDetails: 'Sales Details',
      purchaseDetails: 'Purchase Details',
      expenseDetails: 'Expense Details',
      date: 'Date',
      amount: 'Amount',
      reference: 'Reference',
    },
    ur: {
      title: 'یومیہ خلاصہ رپورٹ',
      totalSales: 'کل فروخت',
      totalPurchases: 'کل خریداری',
      totalExpenses: 'کل اخراجات',
      totalProfit: 'کل منافع',
      download: 'ڈاؤن لوڈ',
      print: 'پرنٹ',
      from: 'سے',
      to: 'تک',
      apply: 'لاگو کریں',
      salesDetails: 'فروخت کی تفصیل',
      purchaseDetails: 'خریداری کی تفصیل',
      expenseDetails: 'اخراجات کی تفصیل',
      date: 'تاریخ',
      amount: 'رقم',
      reference: 'حوالہ',
    },
  }[isUrdu ? 'ur' : 'en'];

  /* ------------------------- helpers ------------------------- */
  const isWithinRange = (dateISO: string) => {
    if (!dateISO) return false;
    return dateISO >= dateRange.from && dateISO <= dateRange.to;
  };

  const recalculate = async () => {
    try {
      /* Prefer backend; fall back to localStorage */
      

      /* ----------------- Fetch Helpers ----------------- */
      const fetchOrFallback = async (url: string, localKey: string) => {
        try {
          const res = await fetch(url);
          if (!res.ok) throw new Error('Network');
          return await res.json();
        } catch {
          return JSON.parse(localStorage.getItem(localKey) || '[]');
        }
      };

      /* ----------------------- Sales ----------------------- */
      const sales: any[] = await fetchOrFallback('http://localhost:5000/api/sales', 'pharmacy_sales');
      const filteredSales = sales.filter((s) => isWithinRange(s.date || s.createdAt || s.saleDate || ''));
      const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || s.totalAmount || 0), 0);

      /* --------------------- Purchases --------------------- */
      const purchaseOrders: any[] = await fetchOrFallback('http://localhost:5000/api/purchases', 'pharmacy_purchase_orders');
      const filteredPO = purchaseOrders.filter((po) => isWithinRange(po.date || po.createdAt || po.orderDate || ''));
      const totalPurchases = filteredPO.reduce((sum, po) => sum + (po.total || po.amount || 0), 0);

      /* --------------------- Expenses ---------------------- */
      const expenses: any[] = await fetchOrFallback('http://localhost:5000/api/expenses', 'pharmacy_expenses');
      const filteredExpenses = expenses.filter((e) => isWithinRange(e.date));
      const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

      const totalProfit = totalSales - totalExpenses - totalPurchases;

      setKpi({ totalSales, totalPurchases, totalExpenses, totalProfit });
      setDetails({ sales: filteredSales, purchases: filteredPO, expenses: filteredExpenses });
    } catch (err) {
      console.error('Failed to calculate KPIs', err);
    }
  };

  useEffect(() => {
    recalculate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  // Recalculate on saleCompleted or localStorage change (purchases/expenses)
  useEffect(() => {
    const handleRealtimeUpdate = () => recalculate();
    window.addEventListener('saleCompleted', handleRealtimeUpdate);
    window.addEventListener('storage', handleRealtimeUpdate);
    return () => {
      window.removeEventListener('saleCompleted', handleRealtimeUpdate);
      window.removeEventListener('storage', handleRealtimeUpdate);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ------------------------- export ------------------------- */
  const handleDownload = async () => {
    const exportData = {
      title: `Summary_Report_${dateRange.from}_${dateRange.to}`,
      headers: ['Metric', 'Amount'],
      data: [
        [text.totalSales, `PKR ${kpi.totalSales.toLocaleString()}`],
        [text.totalPurchases, `PKR ${kpi.totalPurchases.toLocaleString()}`],
        [text.totalExpenses, `PKR ${kpi.totalExpenses.toLocaleString()}`],
        [text.totalProfit, `PKR ${kpi.totalProfit.toLocaleString()}`],
      ],
      metadata: {
        Pharmacy: settings.companyName,
        Period: `${dateRange.from} → ${dateRange.to}`,
        GeneratedAt: new Date().toLocaleString(),
      },
    };

    reportExporter.exportToPDF(exportData);
  };

  const handlePrint = () => {
    if (!reportRef.current) {
      window.print();
      return;
    }
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`<!DOCTYPE html><html><head><title>${text.title}</title>
        <style>
          @media print { body { margin:0; } }
          body { font-family: Arial, sans-serif; padding:20px; }
        </style>
      </head><body>${reportRef.current.innerHTML}</body></html>`);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    }
  };

  return (
    <div className="p-6 space-y-6" ref={reportRef}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
            {settings.logo && (
              <img src={settings.logo} alt="logo" className="h-8 w-8 object-contain" />
            )}
            <span>{settings.companyName}</span>
          </h1>
          <h2 className="text-lg text-gray-600 dark:text-gray-300 font-semibold mt-1">
            {text.title}
          </h2>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDownload}>
            <Download className="h-4 w-4 mr-2" /> {text.download}
          </Button>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" /> {text.print}
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center space-x-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-200" htmlFor="from-date">
            {text.from}
          </label>
          <Input
            id="from-date"
            type="date"
            value={dateRange.from}
            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
            className="w-40"
          />
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-700 dark:text-gray-200" htmlFor="to-date">
            {text.to}
          </label>
          <Input
            id="to-date"
            type="date"
            value={dateRange.to}
            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
            className="w-40"
          />
        </div>
};

const recalculate = async () => {
  try {
    /* Prefer backend; fall back to localStorage */
    

    /* ----------------- Fetch Helpers ----------------- */
    const fetchOrFallback = async (url: string, localKey: string) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Network');
        return await res.json();
      } catch {
        return JSON.parse(localStorage.getItem(localKey) || '[]');
      }
    };

    /* ----------------------- Sales ----------------------- */
    const sales: any[] = await fetchOrFallback('http://localhost:5000/api/sales', 'pharmacy_sales');
    const filteredSales = sales.filter((s) => isWithinRange(s.date || s.createdAt || s.saleDate || ''));
    const totalSales = filteredSales.reduce((sum, s) => sum + (s.total || s.totalAmount || 0), 0);

    /* --------------------- Purchases --------------------- */
    const purchaseOrders: any[] = await fetchOrFallback('http://localhost:5000/api/purchases', 'pharmacy_purchase_orders');
    const filteredPO = purchaseOrders.filter((po) => isWithinRange(po.date || po.createdAt || po.orderDate || ''));
    const totalPurchases = filteredPO.reduce((sum, po) => sum + (po.total || po.amount || 0), 0);

    /* --------------------- Expenses ---------------------- */
    const expenses: any[] = await fetchOrFallback('http://localhost:5000/api/expenses', 'pharmacy_expenses');
    const filteredExpenses = expenses.filter((e) => isWithinRange(e.date));
    const totalExpenses = filteredExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

    const totalProfit = totalSales - totalExpenses - totalPurchases;

    setKpi({ totalSales, totalPurchases, totalExpenses, totalProfit });
    setDetails({ sales: filteredSales, purchases: filteredPO, expenses: filteredExpenses });
  } catch (err) {
    console.error('Failed to calculate KPIs', err);
  }
};

useEffect(() => {
  recalculate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [dateRange]);

// Recalculate on saleCompleted or localStorage change (purchases/expenses)
useEffect(() => {
  const handleRealtimeUpdate = () => recalculate();
  window.addEventListener('saleCompleted', handleRealtimeUpdate);
  window.addEventListener('storage', handleRealtimeUpdate);
  return () => {
    window.removeEventListener('saleCompleted', handleRealtimeUpdate);
    window.removeEventListener('storage', handleRealtimeUpdate);
  };
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);

/* ------------------------- export ------------------------- */
const handleDownload = async () => {
  const exportData = {
    title: `Summary_Report_${dateRange.from}_${dateRange.to}`,
    headers: ['Metric', 'Amount'],
    data: [
      [text.totalSales, `PKR ${kpi.totalSales.toLocaleString()}`],
      [text.totalPurchases, `PKR ${kpi.totalPurchases.toLocaleString()}`],
      [text.totalExpenses, `PKR ${kpi.totalExpenses.toLocaleString()}`],
      [text.totalProfit, `PKR ${kpi.totalProfit.toLocaleString()}`],
    ],
    metadata: {
      Pharmacy: settings.companyName,
      Period: `${dateRange.from} → ${dateRange.to}`,
      GeneratedAt: new Date().toLocaleString(),
    },
  };

  reportExporter.exportToPDF(exportData);
};

const handlePrint = () => {
  if (!reportRef.current) {
    window.print();
    return;
  }
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(`<!DOCTYPE html><html><head><title>${text.title}</title>
      <style>
        @media print { body { margin:0; } }
        body { font-family: Arial, sans-serif; padding:20px; }
      </style>
    </head><body>${reportRef.current.innerHTML}</body></html>`);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  }
};

return (
  <div className="p-6 space-y-6" ref={reportRef}>
    {/* Header */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
          {settings.logo && (
            <img src={settings.logo} alt="logo" className="h-8 w-8 object-contain" />
          )}
          <span>{settings.companyName}</span>
        </h1>
        <h2 className="text-lg text-gray-600 dark:text-gray-300 font-semibold mt-1">
          {text.title}
        </h2>
      </div>
      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleDownload}>
          <Download className="h-4 w-4 mr-2" /> {text.download}
        </Button>
        <Button variant="outline" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" /> {text.print}
        </Button>
      </div>
    </div>

    {/* Filter */}
    <div className="flex items-center space-x-4">
      <Filter className="h-4 w-4 text-gray-500" />
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700 dark:text-gray-200" htmlFor="from-date">
          {text.from}
        </label>
        <Input
          id="from-date"
          type="date"
          value={dateRange.from}
          onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
          className="w-40"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label className="text-sm text-gray-700 dark:text-gray-200" htmlFor="to-date">
          {text.to}
        </label>
        <Input
          id="to-date"
          type="date"
          value={dateRange.to}
          onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
          className="w-40"
        />
      </div>
      <Button variant="outline" onClick={recalculate}>
        {text.apply}
      </Button>
    </div>

    {/* KPI grid */}
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
      <Card className="shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">{text.totalSales}</p>
          <p className="text-2xl font-bold text-green-600">PKR {kpi.totalSales.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">{text.totalPurchases}</p>
          <p className="text-2xl font-bold text-blue-600">PKR {kpi.totalPurchases.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">{text.totalExpenses}</p>
          <p className="text-2xl font-bold text-red-600">PKR {kpi.totalExpenses.toLocaleString()}</p>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardContent className="p-6">
          <p className="text-sm text-gray-600">{text.totalProfit}</p>
          <p className="text-2xl font-bold text-purple-600">PKR {kpi.totalProfit.toLocaleString()}</p>
        </CardContent>
      </Card>
    </div>

    {/* Detailed Tables */}
    <div className="space-y-10 print:space-y-6">
      {/* Sales */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{text.salesDetails}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border">{text.date}</th>
                <th className="px-4 py-2 border">{text.reference}</th>
                <th className="px-4 py-2 border">{text.amount}</th>
              </tr>
            </thead>
            <tbody>
              {details.sales.length === 0 ? (
                <tr>
                  <td className="px-4 py-2 border text-center" colSpan={3}>
                    -
                  </td>
                </tr>
              ) : (
                details.sales.map((s, idx) => (
                  <tr key={idx} className="odd:bg-gray-50 dark:odd:bg-gray-900">
                    <td className="px-4 py-2 border whitespace-nowrap">{new Date(s.date || s.createdAt || s.saleDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{s.id || s._id || '—'}</td>
                    <td className="px-4 py-2 border text-right">PKR {(s.total || s.totalAmount || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Purchases */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{text.purchaseDetails}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border">{text.date}</th>
                <th className="px-4 py-2 border">{text.reference}</th>
                <th className="px-4 py-2 border">{text.amount}</th>
              </tr>
            </thead>
            <tbody>
              {details.purchases.length === 0 ? (
                <tr>
                  <td className="px-4 py-2 border text-center" colSpan={3}>
                    -
                  </td>
                </tr>
              ) : (
                details.purchases.map((p, idx) => (
                  <tr key={idx} className="odd:bg-gray-50 dark:odd:bg-gray-900">
                    <td className="px-4 py-2 border whitespace-nowrap">{new Date(p.date || p.createdAt || p.orderDate).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{p.id || p._id || '—'}</td>
                    <td className="px-4 py-2 border text-right">PKR {(p.total || p.amount || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expenses */}
      <div>
        <h3 className="text-lg font-semibold mb-2">{text.expenseDetails}</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full border text-sm">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-800">
                <th className="px-4 py-2 border">{text.date}</th>
                <th className="px-4 py-2 border">{text.reference}</th>
                <th className="px-4 py-2 border">{text.amount}</th>
              </tr>
            </thead>
            <tbody>
              {details.expenses.length === 0 ? (
                <tr>
                  <td className="px-4 py-2 border text-center" colSpan={3}>
                    -
                  </td>
                </tr>
              ) : (
                details.expenses.map((e, idx) => (
                  <tr key={idx} className="odd:bg-gray-50 dark:odd:bg-gray-900">
                    <td className="px-4 py-2 border whitespace-nowrap">{new Date(e.date).toLocaleDateString()}</td>
                    <td className="px-4 py-2 border whitespace-nowrap">{e.description || e.category || '—'}</td>
                    <td className="px-4 py-2 border text-right">PKR {(e.amount || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
);

export default SummaryReport; */
export { default } from './SummaryReportClean';
