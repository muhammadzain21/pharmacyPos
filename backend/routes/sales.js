const express = require('express');
const router = express.Router();
const Sale = require('../models/Sale');
const DailySale = require('../models/DailySale');
const MonthlySale = require('../models/MonthlySale');
const Inventory = require('../models/Inventory');
const Customer = require('../models/Customer');

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
        $inc: { stock: -item.quantity },
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

    // If credit sale, add credit history to customer
    if (savedSale.paymentMethod === 'credit' && savedSale.customerId) {
      try {
        await Customer.findByIdAndUpdate(savedSale.customerId, {
          $push: {
            creditHistory: {
              medicines: savedSale.items.map(it => ({ medicineId: it.medicineId, quantity: it.quantity, price: it.price })),
              amount: savedSale.totalAmount,
              date: savedSale.date,
              paid: false
            }
          }
        });
      } catch (err) {
        console.error('Failed to add credit history:', err);
      }
    }

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

// Get recent sales (latest 5)
router.get('/recent', async (req, res) => {
  try {
    const sales = await Sale.find()
      .sort({ date: -1 })
      .limit(5)
      .populate('items.medicineId', 'name')
      .lean();

    const formatted = sales.map(s => ({
      id: s._id,
      medicine: s.items.map(it => it.medicineId?.name || 'Unknown').join(', '),
      customer: s.customerId || 'Walk-in',
      amount: s.totalAmount,
      date: new Date(s.date).toLocaleDateString(),
      time: new Date(s.date).toLocaleTimeString()
    }));

    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
