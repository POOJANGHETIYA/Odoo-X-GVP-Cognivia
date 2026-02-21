const expenseService = require('../services/expenseService');

/**
 * Expense Controller - handles HTTP requests for expenses
 */
const expenseController = {
  /**
   * GET /api/expenses
   * Get all expenses with optional filters
   */
  async getAll(req, res, next) {
    try {
      const { category, vehicle_id, trip_id, start_date, end_date, limit, offset } = req.query;
      
      const expenses = await expenseService.getAll({
        category,
        vehicle_id,
        trip_id,
        startDate: start_date,
        endDate: end_date,
        limit: limit ? parseInt(limit, 10) : undefined,
        offset: offset ? parseInt(offset, 10) : undefined,
      });

      res.json(expenses);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/expenses/:id
   * Get expense by ID
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const expense = await expenseService.getById(id);

      if (!expense) {
        return res.status(404).json({ error: 'Expense not found' });
      }

      res.json(expense);
    } catch (error) {
      next(error);
    }
  },

  /**
   * POST /api/expenses
   * Create a new expense
   */
  async create(req, res, next) {
    try {
      // TODO: Get user ID from authenticated user
      const userId = req.body.logged_by || req.headers['x-user-id'];
      
      if (!userId) {
        return res.status(400).json({ error: 'User ID is required' });
      }

      const expense = await expenseService.create(req.body, userId);
      res.status(201).json(expense);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/expenses/stats/by-category
   * Get total expenses by category
   */
  async getStatsByCategory(req, res, next) {
    try {
      const { start_date, end_date } = req.query;
      const stats = await expenseService.getTotalByCategory(start_date, end_date);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/expenses/vehicle/:vehicleId
   * Get expenses by vehicle
   */
  async getByVehicle(req, res, next) {
    try {
      const { vehicleId } = req.params;
      const { limit } = req.query;
      const expenses = await expenseService.getByVehicle(
        vehicleId,
        limit ? parseInt(limit, 10) : undefined
      );
      res.json(expenses);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = expenseController;
