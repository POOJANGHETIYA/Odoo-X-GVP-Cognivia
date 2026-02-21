const driverService = require('../services/driverService');

/**
 * Driver Controller - handles HTTP requests for drivers
 */
const driverController = {
  /**
   * GET /api/drivers
   * Get all drivers with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { status, license_class, search, limit, offset } = req.query;
      
      const drivers = await driverService.getAll({
        status,
        license_class,
        search,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json(drivers);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/drivers/:id
   * Get driver by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await driverService.getById(id);

      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json(driver);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/drivers
   * Create a new driver
   */
  async create(req, res, next) {
    try {
      const driver = await driverService.create(req.body);
      res.status(201).json(driver);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Phone number or license number already exists' });
      }
      next(error);
    }
  },

  /**
   * PUT /api/drivers/:id
   * Update a driver
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const driver = await driverService.update(id, req.body);

      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json(driver);
    } catch (error) {
      if (error.code === '23505') { // Unique violation
        return res.status(400).json({ error: 'Phone number or license number already exists' });
      }
      next(error);
    }
  },

  /**
   * PATCH /api/drivers/:id/status
   * Update driver status
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }

      const driver = await driverService.updateStatus(id, status);

      if (!driver) {
        return res.status(404).json({ error: 'Driver not found' });
      }

      res.json(driver);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/drivers/stats/by-status
   * Get driver count by status
   */
  async getStatsByStatus(req, res, next) {
    try {
      const stats = await driverService.getCountByStatus();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/drivers/available/:category
   * Get available drivers for a vehicle category
   */
  async getAvailableForCategory(req, res, next) {
    try {
      const { category } = req.params;
      const drivers = await driverService.getAvailableForCategory(category);
      res.json(drivers);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = driverController;
