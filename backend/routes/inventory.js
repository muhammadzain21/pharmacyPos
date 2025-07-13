const express = require('express');
const router = express.Router();
const Inventory = require('../models/Inventory');

// Search inventory items
router.get('/search', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || typeof q !== 'string') {
      return res.status(400).json({ error: 'q query param required' });
    }
    const regex = new RegExp(q, 'i');
    const items = await Inventory.find({ name: regex });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all inventory items
router.get('/', async (req, res) => {
  try {
    const items = await Inventory.find();
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get count of out of stock items
router.get('/out-of-stock', async (req, res) => {
  try {
    const count = await Inventory.countDocuments({ stock: 0 });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new inventory item
router.post('/', async (req, res) => {
  try {
    const newItem = new Inventory(req.body);
    const savedItem = await newItem.save();
    res.status(201).json(savedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Patch stock quantity for an item
router.patch('/:id/stock', async (req, res) => {
  try {
    const { id } = req.params;
    const { change } = req.body;
    if (typeof change !== 'number') {
      return res.status(400).json({ error: 'change must be a number' });
    }
    const updated = await Inventory.findByIdAndUpdate(id, { $inc: { stock: change } }, { new: true });
    if (!updated) return res.status(404).json({ error: 'Item not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Update inventory item
router.put('/:id', async (req, res) => {
  try {
    const updatedItem = await Inventory.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedItem);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Delete inventory item
router.delete('/:id', async (req, res) => {
  try {
    await Inventory.findByIdAndDelete(req.params.id);
    res.json({ message: 'Item deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
