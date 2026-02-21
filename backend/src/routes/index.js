const express = require('express');

const vehicleRoutes = require('./vehicleRoutes');
const driverRoutes = require('./driverRoutes');
const tripRoutes = require('./tripRoutes');
const expenseRoutes = require('./expenseRoutes');
const maintenanceRoutes = require('./maintenanceRoutes');
const dashboardRoutes = require('./dashboardRoutes');

const router = express.Router();

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
router.use('/vehicles', vehicleRoutes);
router.use('/drivers', driverRoutes);
router.use('/trips', tripRoutes);
router.use('/expenses', expenseRoutes);
router.use('/maintenance', maintenanceRoutes);
router.use('/dashboard', dashboardRoutes);

module.exports = router;
