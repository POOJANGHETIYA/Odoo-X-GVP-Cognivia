const express = require('express');
const tripController = require('../controllers/tripController');

const router = express.Router();

/**
 * @route   GET /api/trips
 * @desc    Get all trips with optional filters
 * @query   status, vehicle_id, driver_id, search, limit, offset
 */
router.get('/', tripController.getAll);

/**
 * @route   GET /api/trips/stats/by-status
 * @desc    Get trip count by status
 */
router.get('/stats/by-status', tripController.getStatsByStatus);

/**
 * @route   GET /api/trips/:id
 * @desc    Get trip by ID
 */
router.get('/:id', tripController.getById);

/**
 * @route   POST /api/trips
 * @desc    Create a new trip
 * @body    vehicle_id, driver_id, pickup_address, dropoff_address,
 *          pickup_lat, pickup_lng, dropoff_lat, dropoff_lng,
 *          cargo_weight_kg, estimated_distance_km, expected_revenue
 * @header  x-user-id (dispatcher ID)
 */
router.post('/', tripController.create);

/**
 * @route   PUT /api/trips/:id
 * @desc    Update a trip
 */
router.put('/:id', tripController.update);

/**
 * @route   PATCH /api/trips/:id/status
 * @desc    Update trip status
 * @body    status
 * @header  x-user-id
 */
router.patch('/:id/status', tripController.updateStatus);

module.exports = router;
