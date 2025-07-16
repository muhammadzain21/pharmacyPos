const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Create a new user
router.post('/', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ message: 'Email, password, and role are required.' });
    }
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: 'User already exists.' });
    }
    const user = new User({ email, password, role });
    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.status(201).json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all users (excluding passwords)
router.get('/', async (_req, res) => {
  try {
    const users = await User.find({}, '-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get a user by ID (excluding password)
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update a user by ID
router.put('/:id', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const update = {};
    if (email) update.email = email;
    if (role) update.role = role;
    if (password) update.password = password;
    let user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    Object.assign(user, update);
    await user.save();
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a user by ID
router.delete('/:id', async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    res.json({ message: 'User deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }
    const { password: _, ...userData } = user.toObject();
    res.json(userData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router; 