const express = require('express');
const router = express.Router();
const AddStock = require('../models/AddStock');
const Medicine = require('../models/Medicine');
const Supplier = require('../models/Supplier');

// POST /api/add-stock - Add stock record
router.post('/', async (req, res) => {
  try {
    console.log('AddStock POST req.body:', req.body);
    const { medicine, quantity, unitPrice, supplier, expiryDate, minStock } = req.body;
    if (!medicine || !quantity || !unitPrice || !supplier) {
      return res.status(400).json({ error: 'All fields are required' });
    }
    // Optionally verify medicine and supplier exist
    const med = await Medicine.findById(medicine);
    if (!med) {
      return res.status(404).json({ error: 'Medicine not found' });
    }
    const sup = await Supplier.findById(supplier);
    if (!sup) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    const addStock = new AddStock({ medicine, quantity, unitPrice, supplier, expiryDate, minStock });
    await addStock.save();
    console.log('Saved AddStock doc:', addStock);
    res.status(201).json(addStock);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add stock', details: error.message });
  }
});

// GET /api/add-stock - List all stock additions
router.get('/', async (req, res) => {
  try {
    const records = await AddStock.find().populate('medicine supplier');
    res.json(records);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stock records', details: error.message });
  }
});

// PATCH /api/add-stock/:id/quantity - Adjust quantity (increment/decrement)
router.patch('/:id/quantity', async (req, res) => {
  try {
    const { id } = req.params;
    const { change } = req.body;
    if (typeof change !== 'number') {
      return res.status(400).json({ error: 'change must be a number' });
    }
    const updated = await AddStock.findByIdAndUpdate(id, { $inc: { quantity: change } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Record not found' });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to adjust quantity', details: error.message });
  }
});

// PUT /api/add-stock/:id - Update a stock record
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    const updated = await AddStock.findByIdAndUpdate(id, updateData, { new: true }).populate('medicine supplier');
    if (!updated) {
      return res.status(404).json({ error: 'Stock record not found' });
    }
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update stock record', details: error.message });
  }
});

// DELETE /api/add-stock/:id - Delete a stock record
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await AddStock.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Stock record not found' });
    }
    res.json({ message: 'Stock record deleted' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete stock record', details: error.message });
  }
});

// BULK IMPORT CSV/Excel converted JSON
router.post('/bulk', async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items array required' });
    }

    const inserted = [];

    let skipped = 0;
  for (const row of items) {
      // Support various header casings from CSV (e.g. exported file)
      const medicineName = row.medicine || row.Medicine || row['Medicine Name'] || row['medicine name'] || row.name || row.Name;
      const quantityVal = row.quantity || row.Quantity || row.stock || row.Stock;
      const unitPriceVal = row.unitPrice || row.UnitPrice || row['Unit Price'];
      let supplierName = row.supplier || row.Supplier || row['Supplier Name'];
      if (!supplierName || supplierName.trim() === '') {
        supplierName = 'Unknown Supplier';
      }
      const expiryDate = row.expiryDate || row.ExpiryDate || row['Expiry Date'] || row.expiry;
      const minStock = row.minStock || row.MinStock || row['Min Stock'] || row.min;

      // Ensure required
      if (!medicineName || !quantityVal || !unitPriceVal || !supplierName) {
        skipped++;
        continue; // skip invalid rows
      }

      // Find or create medicine
      let med = await Medicine.findOne({ name: medicineName.trim() });
      if (!med) {
        med = new Medicine({ name: medicineName.trim() });
        await med.save();
      }

      // Find or create supplier
      let sup = await Supplier.findOne({ name: supplierName.trim() });
      if (!sup) {
        sup = new Supplier({ name: supplierName.trim() });
        await sup.save();
      }

      const addStock = new AddStock({
        medicine: med._id,
        quantity: parseInt(quantityVal, 10) || 0,
        unitPrice: parseFloat(unitPriceVal) || 0,
        supplier: sup._id,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        minStock: minStock ? parseInt(minStock, 10) : undefined,
      });
      await addStock.save();
      inserted.push(addStock);
    }

    res.json({ inserted: inserted.length, skipped });
  } catch (error) {
    res.status(500).json({ error: 'Bulk import failed', details: error.message });
  }
});

// EXPORT to CSV
router.get('/export', async (_req, res) => {
  try {
    const records = await AddStock.find().populate('medicine supplier');

    let csv = 'Medicine,Quantity,UnitPrice,Supplier,ExpiryDate,MinStock\n';
    records.forEach(r => {
      csv += `${r.medicine.name},${r.quantity},${r.unitPrice},${r.supplier.name},${r.expiryDate ? new Date(r.expiryDate).toISOString().split('T')[0] : ''},${r.minStock || ''}\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="addstock_export.csv"');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ error: 'Export failed', details: error.message });
  }
});

module.exports = router;
