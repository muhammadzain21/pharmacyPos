const mongoose = require('mongoose');

const SupplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  contactPerson: {
    type: String,
  },
  phone: {
    type: String,
  },
  email: {
    type: String,
  },
  address: {
    type: String
  },
  taxId: {
    type: String,
  },
  totalPurchases: {
    type: Number,
    default: 0,
  },
  pendingPayments: {
    type: Number,
    default: 0,
  },
  lastOrder: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  supplies: [
    {
      name: String,
      cost: Number,
      quantity: Number,
      inventoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Inventory',
      },
    },
  ],
  purchases: [
    {
      date: Date,
      amount: Number,
      items: String,
      invoice: String,
    },
  ],

}, { timestamps: true });

module.exports = mongoose.model('Supplier', SupplierSchema);
