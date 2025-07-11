const mongoose = require('mongoose');

const MonthlySaleSchema = new mongoose.Schema({
  month: { type: String, required: true, unique: true }, // Format: YYYY-MM
  totalAmount: { type: Number, default: 0 },
  numberOfSales: { type: Number, default: 0 },
  sales: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Sale' }]
});

module.exports = mongoose.model('MonthlySale', MonthlySaleSchema);
