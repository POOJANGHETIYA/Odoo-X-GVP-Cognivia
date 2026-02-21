const maintenanceService = require('../services/maintenanceService');

/**
 * Maintenance Controller - handles HTTP requests for maintenance logs
 */
const maintenanceController = {
  /**
   * GET /api/maintenance
   * Get all maintenance logs with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { vehicle_id, status, service_type, limit, offset } = req.query;
      
      const logs = await maintenanceService.getAll({
        vehicle_id,
        status,
        service_type,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json(logs);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/maintenance/:id
   * Get maintenance log by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const log = await maintenanceService.getById(id);

      if (!log) {
        return res.status(404).json({ error: 'Maintenance log not found' });
      }

      res.json(log);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/maintenance
   * Create a new maintenance log
   */
  async create(req, res, next) {
    try {
      // TODO: Get user ID from authenticated user
      const userId = req.body.logged_by || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const log = await maintenanceService.create(req.body, userId);
      res.status(201).json(log);
    } catch (error) {
      next(error);
    }
  },

  /**
   * PATCH /api/maintenance/:id/complete
   * Mark maintenance as complete and release vehicle
   */
  async complete(req, res, next) {
    try {
      const { id } = req.params;
      const log = await maintenanceService.complete(id);

      if (!log) {
        return res.status(404).json({ error: 'Maintenance log not found' });
      }

      res.json(log);
    } catch (error) {
      if (error.message === 'Maintenance record not found') {
        return res.status(404).json({ error: error.message });
      }
      next(error);
    }
  },

  /**
   * GET /api/maintenance/stats/by-service-type
   * Get maintenance costs by service type
   */
  async getStatsByServiceType(req, res, next) {
    try {
      const stats = await maintenanceService.getCostsByServiceType();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/maintenance/vehicles-in-shop
   * Get vehicles currently in maintenance
   */
  async getVehiclesInShop(req, res, next) {
    try {
      const vehicles = await maintenanceService.getVehiclesInMaintenance();
      res.json(vehicles);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = maintenanceController;
