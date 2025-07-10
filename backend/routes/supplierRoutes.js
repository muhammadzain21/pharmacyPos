const express = require('express');
const router = express.Router();
const Supplier = require('../models/Supplier');

// POST /api/suppliers - Add a new supplier
router.post('/', async (req, res) => {
  try {
    const { name, contact, address } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Supplier name is required' });
    }
    const supplier = new Supplier({ name, contact, address });
    await supplier.save();
    res.status(201).json(supplier);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add supplier', details: error.message });
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

module.exports = router;
