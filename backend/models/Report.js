const mongoose = require('mongoose');

const ReportSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'sales', 'inventory', 'profit', etc.
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  generatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Report', ReportSchema);
