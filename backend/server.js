const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/pharmacy';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

// Placeholder route
app.get('/', (req, res) => {
  res.json({ message: 'Pharmacy backend API is running.' });
});

// API Routes
app.use('/api/inventory', require('./routes/inventory'));
app.use('/api/sales', require('./routes/sales'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/suppliers', require('./routes/supplierRoutes'));
app.use('/api/medicines', require('./routes/medicineRoutes'));
app.use('/api/add-stock', require('./routes/addStock'));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
