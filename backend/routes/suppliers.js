const express = require('express');
const router = express.Router();

// Mock suppliers data for now
router.get('/', (req, res) => {
  res.json([
    { id: '1', name: 'Supplier A' },
    { id: '2', name: 'Supplier B' }
  ]);
});

module.exports = router;
