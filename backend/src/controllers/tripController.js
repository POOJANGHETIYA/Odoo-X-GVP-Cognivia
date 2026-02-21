const tripService = require('../services/tripService');

/**
 * Trip Controller - handles HTTP requests for trips
 */
const tripController = {
  /**
   * GET /api/trips
   * Get all trips with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { status, vehicle_id, driver_id, search, limit, offset } = req.query;
      
      const trips = await tripService.getAll({
        status,
        vehicle_id,
        driver_id,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json(trips);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/trips/:id
   * Get trip by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const trip = await tripService.getById(id);

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/trips
   * Create a new trip
   */
  async create(req, res, next) {
    try {
      // TODO: Get dispatcher ID from authenticated user
      const dispatcherId = req.body.dispatcher_id || req.headers['x-user-id'];
      
      if (!dispatcherId) {
        return res.status(400).json({ error: 'Dispatcher ID is required' });
      }

      const trip = await tripService.create(req.body, dispatcherId);
      res.status(201).json(trip);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/trips/:id
   * Update a trip
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const trip = await tripService.update(id, req.body);

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/trips/:id/status
   * Update trip status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const userId = req.headers['x-user-id'];

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const trip = await tripService.updateStatus(id, status, userId);

      if (!trip) {
        return res.status(404).json({ error: 'Trip not found' });
      }

      res.json(trip);
    } catch (error) {
      if (error.message === 'Trip not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },

  /**
   * GET /api/trips/stats/by-status
   * Get trip count by status
   */
  async getStatsByStatus(req, res, next) {
    try {
      const stats = await tripService.getCountByStatus();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = tripController;
