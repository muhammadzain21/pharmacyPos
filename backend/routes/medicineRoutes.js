const express = require('express');
const router = express.Router();
const Medicine = require('../models/Medicine');

// POST /api/medicines - Add a new medicine
router.post('/', async (req, res) => {
  try {
    const { name, genericName } = req.body;
    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Name is required' });
    }
    const medicine = new Medicine({ name: name.trim(), genericName: genericName ? genericName.trim() : '' });
    await medicine.save();
    res.status(201).json(medicine);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add medicine', details: error.message });
  }
});

// GET /api/medicines - List all medicines
router.get('/', async (req, res) => {
  try {
    const medicines = await Medicine.find();
    res.json(medicines);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch medicines', details: error.message });
  }
});

module.exports = router;
