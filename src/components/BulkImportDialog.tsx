import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import * as Papa from 'papaparse';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/components/ui/use-toast';
import axios from 'axios';

interface BulkImportDialogProps {
  onImported: () => void;
}

interface CsvRow {
  medicine: string;
  quantity: string;
  unitPrice: string;
  salePrice?: string;
  supplier?: string;
  minStock?: string;
  expiryDate?: string;
}

const BulkImportDialog: React.FC<BulkImportDialogProps> = ({ onImported }) => {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvRow[]>([]);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const extension = file.name.split('.').pop()?.toLowerCase();

    if (extension === 'csv') {
      Papa.parse<CsvRow>(file, {
        header: true,
        skipEmptyLines: true,
        complete: results => setRows(results.data as CsvRow[]),
      });
    } else if (extension === 'xlsx' || extension === 'xls') {
      const reader = new FileReader();
      reader.onload = evt => {
        const data = evt.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: 'array' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const json: CsvRow[] = XLSX.utils.sheet_to_json(sheet, { defval: '' });
        setRows(json);
      };
      reader.readAsArrayBuffer(file);
    } else {
      toast({ title: 'Unsupported file', description: 'Please select a CSV or Excel (.xlsx) file', variant: 'destructive' });
    }
  }

  const handleConfirm = async () => {
    try {
      const res = await axios.post('/api/add-stock/bulk', { items: rows });
      const { inserted, skipped } = res.data;
      if (inserted === 0) {
        toast({ title: 'Nothing imported', description: 'No valid rows found to import', variant: 'destructive' });
      } else {
        toast({ title: 'Import complete', description: `${inserted} row(s) imported (${skipped} skipped)` });
      }
      setRows([]);
      setOpen(false);
      onImported();
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to import file', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Bulk Import</Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Bulk Import Inventory</DialogTitle>
        </DialogHeader>
        <input type="file" accept=".csv,.xlsx" onChange={handleFileChange} />
        {rows.length > 0 && (
          <div className="max-h-64 overflow-auto border rounded-md mt-4">
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(rows[0]).map(h => (
                    <TableHead key={h}>{h}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, idx) => (
                  <TableRow key={idx} className="odd:bg-muted/20">
                    {Object.values(r).map((v, i) => (
                      <TableCell key={i}>{v as string}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button disabled={rows.length === 0} onClick={handleConfirm}>
            Confirm &amp; Upload
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkImportDialog;
