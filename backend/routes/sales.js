const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const DailySale = require('../models/DailySale');
const MonthlySale = require('../models/MonthlySale');
const Inventory = require('../models/Inventory');

// Get all sales
router.get('/', async (req, res) => {
  try {
    const sales = await Sale.find().sort({ date: -1 });
    res.json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new sale
router.post('/', async (req, res) => {
  try {
    const newSale = new Sale(req.body);
    const savedSale = await newSale.save();

    // Update inventory for each item in the sale
    for (const item of savedSale.items) {
      await Inventory.findByIdAndUpdate(item.medicineId, {
        $inc: { quantity: -item.quantity },
      });
    }

    // Get start of today for daily sales aggregation
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Update daily sales
    await DailySale.findOneAndUpdate(
      { date: today },
      {
        $inc: { totalAmount: savedSale.totalAmount, numberOfSales: 1 },
        $push: { sales: savedSale._id },
      },
      { upsert: true, new: true }
    );

    // Get month in YYYY-MM format for monthly sales aggregation
    const month = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);

    // Update monthly sales
    await MonthlySale.findOneAndUpdate(
      { month: month },
      {
        $inc: { totalAmount: savedSale.totalAmount, numberOfSales: 1 },
        $push: { sales: savedSale._id },
      },
      { upsert: true, new: true }
    );

    res.status(201).json(savedSale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get dashboard summary
router.get('/summary', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const month = today.getFullYear() + '-' + ('0' + (today.getMonth() + 1)).slice(-2);

    const todaySale = await DailySale.findOne({ date: today });
    const monthSale = await MonthlySale.findOne({ month: month });

    res.json({
      today: todaySale || { totalAmount: 0, numberOfSales: 0 },
      month: monthSale || { totalAmount: 0, numberOfSales: 0 },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all daily sales
router.get('/daily', async (req, res) => {
  try {
    const dailySales = await DailySale.find().sort({ date: -1 });
    res.json(dailySales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all monthly sales
router.get('/monthly', async (req, res) => {
  try {
    const monthlySales = await MonthlySale.find().sort({ month: -1 });
    res.json(monthlySales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
