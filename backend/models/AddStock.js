const mongoose = require('mongoose');

const AddStockSchema = new mongoose.Schema({
  medicine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Medicine',
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  unitPrice: {
    type: Number,
    required: true
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: true
  },
  expiryDate: {
    type: Date,
    required: false
  },
  minStock: {
    type: Number,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'approved'],
    default: 'pending'
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('AddStock', AddStockSchema);
