const dashboardService = require('../services/dashboardService');

/**
 * Dashboard Controller - handles HTTP requests for dashboard data
 */
const dashboardController = {
  /**
   * GET /api/dashboard/revenue-expenses
   * Get revenue vs expenses data for dashboard chart
   */
  async getRevenueExpenses(req, res, next) {
    try {
      const { days } = req.query;
      const data = await dashboardService.getRevenueExpenses(
        days ? parseInt(days, 10) : 7
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/overview
   * Get dashboard overview statistics
   */
  async getOverview(req, res, next) {
    try {
      const data = await dashboardService.getOverview();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/recent-activity
   * Get recent activity for dashboard
   */
  async getRecentActivity(req, res, next) {
    try {
      const { limit } = req.query;
      const data = await dashboardService.getRecentActivity(
        limit ? parseInt(limit, 10) : 10
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/fleet-utilization
   * Get fleet utilization by category
   */
  async getFleetUtilization(req, res, next) {
    try {
      const data = await dashboardService.getFleetUtilization();
      res.json(data);
    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/dashboard/expense-breakdown
   * Get expense breakdown by category
   */
  async getExpenseBreakdown(req, res, next) {
    try {
      const { days } = req.query;
      const data = await dashboardService.getExpenseBreakdown(
        days ? parseInt(days, 10) : 30
      );
      res.json(data);
    } catch (error) {
      next(error);
    }
  },
};

module.exports = dashboardController;
