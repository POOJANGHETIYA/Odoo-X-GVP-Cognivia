const express = require('express');
const expenseController = require('../controllers/expenseController');

const router = express.Router();

/**
 * @route   GET /api/expenses
 * @desc    Get all expenses with optional filters
 * @query   category, vehicle_id, trip_id, start_date, end_date, limit, offset
 */
router.get('/', expenseController.getAll);

/**
 * @route   GET /api/expenses/stats/by-category
 * @desc    Get total expenses by category
 * @query   start_date, end_date
 */
router.get('/stats/by-category', expenseController.getStatsByCategory);

/**
 * @route   GET /api/expenses/vehicle/:vehicleId
 * @desc    Get expenses by vehicle
 * @query   limit
 */
router.get('/vehicle/:vehicleId', expenseController.getByVehicle);

/**
 * @route   GET /api/expenses/:id
 * @desc    Get expense by ID
 */
router.get('/:id', expenseController.getById);

/**
 * @route   POST /api/expenses
 * @desc    Create a new expense
 * @body    vehicle_id, trip_id, category, cost, volume_liters,
 *          invoice_image_url, description
 * @header  x-user-id
 */
router.post('/', expenseController.create);

module.exports = router;
