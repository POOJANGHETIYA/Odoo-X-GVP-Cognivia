const express = require('express');
const vehicleController = require('../controllers/vehicleController');

const router = express.Router();

/**
 * @route   GET /api/vehicles
 * @desc    Get all vehicles with optional filters
 * @query   status, category, search, limit, offset
 */
router.get('/', vehicleController.getAll);

/**
 * @route   GET /api/vehicles/stats/by-status
 * @desc    Get vehicle count by status
 */
router.get('/stats/by-status', vehicleController.getStatsByStatus);

/**
 * @route   GET /api/vehicles/:id
 * @desc    Get vehicle by ID
 */
router.get('/:id', vehicleController.getById);

/**
 * @route   POST /api/vehicles
 * @desc    Create a new vehicle
 * @body    license_plate, category, capacity_kg, capacity_volume_cft,
 *          current_odometer, acquisition_cost, status, brand,
 *          manufacturing_year, registration_date
 */
router.post('/', vehicleController.create);

/**
 * @route   PUT /api/vehicles/:id
 * @desc    Update a vehicle
 */
router.put('/:id', vehicleController.update);

/**
 * @route   PATCH /api/vehicles/:id/status
 * @desc    Update vehicle status
 * @body    status
 */
router.patch('/:id/status', vehicleController.updateStatus);

module.exports = router;
