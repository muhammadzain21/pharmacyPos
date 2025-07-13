const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// POST /api/suppliers - Add a new supplier
router.post('/', async (req, res) => {
  try {
    const {
    name,
    contactPerson,
    phone,
    email,
    address,
    taxId,
    totalPurchases,
    pendingPayments,
    lastOrder,
    status,
    supplies = [],
    purchases = [],
  } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }
    const supplier = new Supplier({
      name,
      contactPerson,
      phone,
      email,
      address,
      taxId,
      totalPurchases,
      pendingPayments,
      lastOrder,
      status,
      supplies,
      purchases,
    });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add supplier', details: error.message });
  }
});

// PUT /api/suppliers/:id - Update supplier
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const update = req.body;
    const supplier = await Supplier.findByIdAndUpdate(id, update, { new: true });
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json(supplier);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update supplier', details: err.message });
  }
});

// GET /api/suppliers - List all suppliers
router.get('/', async (req, res) => {
  try {
    const suppliers = await Supplier.find();
    res.json(suppliers);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch suppliers', details: error.message });
  }
});

// DELETE /api/suppliers/:id - Remove supplier
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const supplier = await Supplier.findByIdAndDelete(id);
    if (!supplier) {
      return res.status(404).json({ error: 'Supplier not found' });
    }
    res.json({ message: 'Supplier deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete supplier', details: err.message });
  }
});

module.exports = router;
