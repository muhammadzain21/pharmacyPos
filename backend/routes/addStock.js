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

module.exports = router;
