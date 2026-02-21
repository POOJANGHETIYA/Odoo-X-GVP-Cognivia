const express = require('express');
const driverController = require('../controllers/driverController');

const router = express.Router();

/**
 * @route   GET /api/drivers
 * @desc    Get all drivers with optional filters
 * @query   status, license_class, search, limit, offset
 */
router.get('/', driverController.getAll);

/**
 * @route   GET /api/drivers/stats/by-status
 * @desc    Get driver count by status
 */
router.get('/stats/by-status', driverController.getStatsByStatus);

/**
 * @route   GET /api/drivers/available/:category
 * @desc    Get available drivers for a vehicle category
 */
router.get('/available/:category', driverController.getAvailableForCategory);

/**
 * @route   GET /api/drivers/:id
 * @desc    Get driver by ID
 */
router.get('/:id', driverController.getById);

/**
 * @route   POST /api/drivers
 * @desc    Create a new driver
 * @body    full_name, phone_number, license_number, license_class,
 *          license_expiry, safety_score, status
 */
router.post('/', driverController.create);

/**
 * @route   PUT /api/drivers/:id
 * @desc    Update a driver
 */
router.put('/:id', driverController.update);

/**
 * @route   PATCH /api/drivers/:id/status
 * @desc    Update driver status
 * @body    status
 */
router.patch('/:id/status', driverController.updateStatus);

module.exports = router;
