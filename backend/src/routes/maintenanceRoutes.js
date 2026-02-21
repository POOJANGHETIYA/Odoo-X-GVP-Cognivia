const express = require('express');
const maintenanceController = require('../controllers/maintenanceController');

const router = express.Router();

/**
 * @route   GET /api/maintenance
 * @desc    Get all maintenance logs with optional filters
 * @query   vehicle_id, status, service_type, limit, offset
 */
router.get('/', maintenanceController.getAll);

/**
 * @route   GET /api/maintenance/stats/by-service-type
 * @desc    Get maintenance costs by service type
 */
router.get('/stats/by-service-type', maintenanceController.getStatsByServiceType);

/**
 * @route   GET /api/maintenance/vehicles-in-shop
 * @desc    Get vehicles currently in maintenance
 */
router.get('/vehicles-in-shop', maintenanceController.getVehiclesInShop);

/**
 * @route   GET /api/maintenance/:id
 * @desc    Get maintenance log by ID
 */
router.get('/:id', maintenanceController.getById);

/**
 * @route   POST /api/maintenance
 * @desc    Create a new maintenance log
 * @body    vehicle_id, service_type, cost, description, scheduled_date
 * @header  x-user-id
 */
router.post('/', maintenanceController.create);

/**
 * @route   PATCH /api/maintenance/:id/complete
 * @desc    Mark maintenance as complete and release vehicle
 */
router.patch('/:id/complete', maintenanceController.complete);

module.exports = router;
