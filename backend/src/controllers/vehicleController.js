const vehicleService = require('../services/vehicleService');

/**
 * Vehicle Controller - handles HTTP requests for vehicles
 */
const vehicleController = {
  /**
   * GET /api/vehicles
   * Get all vehicles with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { status, category, search, limit, offset } = req.query;
      
      const vehicles = await vehicleService.getAll({
        status,
        category,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/vehicles/:id
   * Get vehicle by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.getById(id);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/vehicles
   * Create a new vehicle
   */
  async create(req, res, next) {
    try {
      const vehicle = await vehicleService.create(req.body);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'License plate already exists' });
      }
      next(error);
    }
  },

  /**
   * PUT /api/vehicles/:id
   * Update a vehicle
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const vehicle = await vehicleService.update(id, req.body);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'License plate already exists' });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/vehicles/:id/status
   * Update vehicle status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const vehicle = await vehicleService.updateStatus(id, status);

      if (!vehicle) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(vehicle);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/vehicles/stats/by-status
   * Get vehicle count by status
   */
  async getStatsByStatus(req, res, next) {
    try {
      const stats = await vehicleService.getCountByStatus();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = vehicleController;
