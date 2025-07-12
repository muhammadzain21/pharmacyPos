import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Download, Filter, Printer } from 'lucide-react';
import { reportExporter } from '@/utils/reportExporter';
import { useSettings } from '@/contexts/SettingsContext';

interface KPIValues {
  totalSales: number;
  totalPurchases: number;
  totalExpenses: number;
  totalProfit: number;
}

interface SummaryReportProps {
  isUrdu: boolean;
}

// Small helper to fetch an endpoint and gracefully fall back to localStorage
async function fetchOrCache(urls: string | string[], localKey: string): Promise<any[]> {
  const list = Array.isArray(urls) ? urls : [urls];
  for (const url of list) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length === 0) {
          // fallback to localStorage if remote returns empty array
          try {
            return JSON.parse(localStorage.getItem(localKey) || '[]');
          } catch {
            return [];
          }
        }
        return Array.isArray(data) ? data : [];
      }
    } catch {
      /* ignore */
    }
  }
  // fallback
  try {
    return JSON.parse(localStorage.getItem(localKey) || '[]');
  } catch {
    return [];
  }
}

const SummaryReportClean: React.FC<SummaryReportProps> = ({ isUrdu }) => {
  const reportRef = useRef<HTMLDivElement>(null);
  const { settings } = useSettings();

  /* -------------------- i18n strings -------------------- */
  const t = {
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
      ref: 'Reference',
      empty: '-',
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
      ref: 'حوالہ',
      empty: '-',
    },
  }[isUrdu ? 'ur' : 'en'];

  /* -------------------- state -------------------- */
  const today = new Date().toISOString().split('T')[0];
  const [range, setRange] = useState({ from: today, to: today });
  const [kpi, setKpi] = useState<KPIValues>({
    totalSales: 0,
    totalPurchases: 0,
    totalExpenses: 0,
    totalProfit: 0,
  });
  const [detail, setDetail] = useState<{ sales: any[]; purchases: any[]; expenses: any[] }>({
    sales: [],
    purchases: [],
    expenses: [],
  });

  /* -------------------- helpers -------------------- */
  const API_BASE = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:5000';
  const endpoints = {
    sales: [`${API_BASE}/api/sales`],
    stocks: [`${API_BASE}/api/add-stock`], // inventory additions
    expenses: [`${API_BASE}/api/expenses`],
  };

  const inRange = (iso: string) => iso >= range.from && iso <= range.to;

  const recalc = async () => {
    const sales = await fetchOrCache(endpoints.sales, 'pharmacy_sales');
    const stocksRaw = await fetchOrCache(endpoints.stocks, 'pharmacy_add_stock');
    // enrich with computed total value (quantity * unitPrice)
    const stocks = stocksRaw.map((r: any) => ({
      ...r,
      total: (r.unitPrice ?? r.price ?? 0) * (r.quantity ?? r.qty ?? 0),
    }));
    const expenses = await fetchOrCache(endpoints.expenses, 'pharmacy_expenses');

    const filtSales = sales.filter((s) => inRange((s.date || s.createdAt || s.saleDate || '').slice(0, 10)));
    const filtPurch = stocks.filter((p) => inRange((p.date || p.createdAt || p.stockDate || '').slice(0, 10)));
    const filtExp = expenses.filter((e) => inRange((e.date || e.createdAt || e.expenseDate || '').slice(0, 10)));

    const totalSales = filtSales.reduce((sum, s) => sum + (s.total || s.totalAmount || 0), 0);
    const totalPurch = filtPurch.reduce((sum, p) => sum + (p.total || 0), 0);
    const totalExp = filtExp.reduce((sum, e) => sum + (e.amount || 0), 0);

    setKpi({
      totalSales,
      totalPurchases: totalPurch,
      totalExpenses: totalExp,
      totalProfit: totalSales - totalPurch - totalExp,
    });
    setDetail({ sales: filtSales, purchases: filtPurch, expenses: filtExp });
  };

  /* -------------------- effects -------------------- */
  useEffect(() => {
    recalc();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [range]);

  // realtime
  useEffect(() => {
    const fn = () => recalc();
    window.addEventListener('saleCompleted', fn);
    window.addEventListener('expenseChanged', fn);
    window.addEventListener('storage', fn);
    return () => {
      window.removeEventListener('saleCompleted', fn);
      window.removeEventListener('expenseChanged', fn);
      window.removeEventListener('storage', fn);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* -------------------- actions -------------------- */
  const download = () => {
    reportExporter.exportToPDF({
      title: `Summary_Report_${range.from}_${range.to}`,
      headers: ['Metric', 'Amount'],
      data: [
        [t.totalSales, `PKR ${kpi.totalSales.toLocaleString()}`],
        [t.totalPurchases, `PKR ${kpi.totalPurchases.toLocaleString()}`],
        [t.totalExpenses, `PKR ${kpi.totalExpenses.toLocaleString()}`],
        [t.totalProfit, `PKR ${kpi.totalProfit.toLocaleString()}`],
      ],
      metadata: { Pharmacy: settings.companyName, Period: `${range.from} → ${range.to}` },
    });
  };

  const print = () => {
    const html = reportRef.current?.innerHTML;
    if (!html) return window.print();
    const w = window.open('', '_blank');
    if (!w) return;
    const stylesheet = '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" />';
    const extra = '<style>@media print{body{margin:0;padding:0}}</style>';
    w.document.write(`<html><head><title>${t.title}</title>${stylesheet}${extra}</head><body class="p-6 bg-white">${html}</body></html>`);
    w.document.close();
    w.focus();
    w.print();
    w.close();
  };

  /* -------------------- render helpers -------------------- */
  // Friendly reference resolver
  const getRef = (row: any): string => {
    // Expense -> show expense type / notes
    if (row.type) return row.type;
    // Purchase (add-stock) -> medicine name or invoice
    if (row.medicine?.name) return row.medicine.name;
    if (row.medicineName) return row.medicineName;
    if (row.invoiceNumber) return row.invoiceNumber;
    // Sale -> customer name or walk-in
    if (row.customerName) return row.customerName;
    if (row.customer?.name) return row.customer.name;
    if (row.customerId) return `Customer ${row.customerId}`;
    if (row.items) return 'Walk-in Customer';
    // fallback: description or short id
    if (row.description) return row.description;
    const id = row._id || row.id || '';
    return id ? id.toString().slice(0, 8) : t.empty;
  };

  // KPI card (colourful gradient)
  const Row = ({ label, value, color }: { label: string; value: number; color: string }) => (
    <Card className={`shadow-md text-white bg-gradient-to-r ${color}`}>
      <CardContent className="p-6">
        <p className="text-sm opacity-90">{label}</p>
        <p className="text-2xl font-bold">PKR {value.toLocaleString()}</p>
      </CardContent>
    </Card>
  );

  const Table = ({ data, title }: { data: any[]; title: string }) => (
    <div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <div className="overflow-x-auto">
        <table className="min-w-full border text-sm">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-800">
              <th className="px-4 py-2 border">{t.date}</th>
              <th className="px-4 py-2 border">{t.ref}</th>
              <th className="px-4 py-2 border">{t.amount}</th>
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr>
                <td className="px-4 py-2 border text-center" colSpan={3}>
                  {t.empty}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={i} className="odd:bg-gray-50 dark:odd:bg-gray-900">
                  <td className="px-4 py-2 border whitespace-nowrap">{new Date(row.date || row.createdAt || row.saleDate || row.orderDate).toLocaleDateString()}</td>
                  <td className="px-4 py-2 border whitespace-nowrap">{getRef(row)}</td>
                  <td className="px-4 py-2 border text-right">PKR {(row.total || row.totalAmount || row.amount || 0).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  /* -------------------- JSX -------------------- */
  return (
    <div className="p-6 space-y-10 print:space-y-6" ref={reportRef}>
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {settings.logo && <img src={settings.logo} alt="logo" className="h-8 w-8 object-contain" />}
            {settings.companyName}
          </h1>
          <p className="text-gray-600 dark:text-gray-300 font-semibold mt-1">{t.title}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={download}>
            <Download className="h-4 w-4 mr-2" /> {t.download}
          </Button>
          <Button variant="outline" onClick={print}>
            <Printer className="h-4 w-4 mr-2" /> {t.print}
          </Button>
        </div>
      </div>

      {/* filters */}
      <div className="flex items-center gap-4">
        <Filter className="h-4 w-4 text-gray-500" />
        <Input type="date" value={range.from} onChange={(e) => setRange({ ...range, from: e.target.value })} />
        <span>—</span>
        <Input type="date" value={range.to} onChange={(e) => setRange({ ...range, to: e.target.value })} />
        <Button variant="outline" onClick={recalc}>
          {t.apply}
        </Button>
      </div>

      {/* kpis */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 print:grid-cols-2">
        <Row label={t.totalSales} value={kpi.totalSales} color="from-green-400 to-green-600" />
        <Row label={t.totalPurchases} value={kpi.totalPurchases} color="from-blue-400 to-blue-600" />
        <Row label={t.totalExpenses} value={kpi.totalExpenses} color="from-red-400 to-red-600" />
        <Row label={t.totalProfit} value={kpi.totalProfit} color="from-purple-400 to-purple-600" />
      </div>

      {/* detail tables */}
      <div className="space-y-10 print:space-y-6">
        <Table data={detail.sales} title={t.salesDetails} />
        <Table data={detail.purchases} title={t.purchaseDetails} />
        <Table data={detail.expenses} title={t.expenseDetails} />
      </div>
    </div>
  );
};

export default SummaryReportClean;
