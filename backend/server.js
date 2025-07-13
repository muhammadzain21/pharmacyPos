const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection & Server start
const mongoURI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/pharmacy';

(async () => {
  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4, // Force IPv4 to avoid ECONNREFUSED on IPv6 (::1)
    });
    console.log('Connected to MongoDB');

    // Placeholder route
    app.get('/', (req, res) => {
      res.json({ message: 'Pharmacy backend API is running.' });
    });

    // API Routes
    app.use('/api/inventory', require('./routes/inventory'));
    app.use('/api/sales', require('./routes/sales'));
    app.use('/api/expenses', require('./routes/expenses'));
    app.use('/api/suppliers', require('./routes/supplierRoutes'));
    app.use('/api/staff', require('./routes/staffRoutes'));
    app.use('/api/customers', require('./routes/customerRoutes'));
    app.use('/api/medicines', require('./routes/medicineRoutes'));
    app.use('/api/inventory', require('./routes/inventory'));
    app.use('/api/add-stock', require('./routes/addStock'));
    // Global staff settings
    app.use('/api/staff-settings', require('./routes/staffSettings'));
    app.use('/api/staff', require('./routes/staffRoutes'));

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }
})();

