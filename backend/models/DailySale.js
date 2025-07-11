const mongoose = require('mongoose');

const DailySaleSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },
  totalAmount: { type: Number, default: 0 },
  numberOfSales: { type: Number, default: 0 },
  sales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }]
});

module.exports = mongoose.model('DailySale', DailySaleSchema);
