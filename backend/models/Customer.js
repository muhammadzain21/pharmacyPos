const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  address: { type: String, required: true },
  cnic: { type: String, required: true, trim: true },
  notes: { type: String },
  mrNumber: { type: String },
  customerSince: { type: Date, default: Date.now },
  totalPurchases: { type: Number, default: 0 },
  loyaltyPoints: { type: Number, default: 0 },
  creditHistory: [
    {
      medicines: [
        {
          medicineId: { type: mongoose.Schema.Types.ObjectId, ref: 'Inventory' },
          name: String,
          quantity: Number,
          price: Number
        }
      ],
      amount: { type: Number },
      date: { type: Date, default: Date.now },
      paid: { type: Boolean, default: false }
    }
  ],
}, { timestamps: true });

module.exports = mongoose.model('Customer', customerSchema);
