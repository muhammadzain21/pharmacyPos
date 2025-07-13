import React, { useState } from 'react';
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
    Papa.parse<CsvRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: results => {
        setRows(results.data);
      },
    });
  };

  const handleConfirm = async () => {
    try {
      await axios.post('/api/inventory/bulk', { items: rows });
      toast({ title: 'Success', description: 'File imported, items awaiting approval' });
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
        <input type="file" accept=".csv" onChange={handleFileChange} />
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
