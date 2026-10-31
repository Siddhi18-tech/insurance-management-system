const express = require('express');
const router = express.Router();

const userRoutes = require('./userRoutes');
const policyRoutes = require('./policyRoutes');
const claimRoutes = require('./claimRoutes');
const reminderRoutes = require('./reminderRoutes');

// API Health / Status
router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// API Info & Directory
router.get('/', (req, res) => {
  res.status(200).json({
    message: 'Insurance Management System API',
    version: '1.0.0',
    endpoints: {
      users: '/api/users',
      policies: '/api/policies',
      claims: '/api/claims',
      reminders: '/api/reminders',
      health: '/api/health'
    }
  });
});

// Resource Routers
router.use('/users', userRoutes);
router.use('/policies', policyRoutes);
router.use('/claims', claimRoutes);
router.use('/reminders', reminderRoutes);

module.exports = router;

