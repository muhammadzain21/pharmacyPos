const mongoose = require('mongoose');

const InventorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String },
  stock: { type: Number, required: true },
  price: { type: Number, required: true },
  batchNumber: { type: String },
  expiryDate: { type: Date },
  supplierId: { type: String },
  lastPurchaseDate: { type: Date },
  lastPurchasePrice: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Inventory', InventorySchema);
