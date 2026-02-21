const express = require('express');
const dashboardController = require('../controllers/dashboardController');

const router = express.Router();

/**
 * @route   GET /api/dashboard/revenue-expenses
 * @desc    Get revenue vs expenses data for dashboard chart
 * @query   days (default: 7)
 */
router.get('/revenue-expenses', dashboardController.getRevenueExpenses);

/**
 * @route   GET /api/dashboard/overview
 * @desc    Get dashboard overview statistics
 */
router.get('/overview', dashboardController.getOverview);

/**
 * @route   GET /api/dashboard/recent-activity
 * @desc    Get recent activity for dashboard
 * @query   limit (default: 10)
 */
router.get('/recent-activity', dashboardController.getRecentActivity);

/**
 * @route   GET /api/dashboard/fleet-utilization
 * @desc    Get fleet utilization by category
 */
router.get('/fleet-utilization', dashboardController.getFleetUtilization);

/**
 * @route   GET /api/dashboard/expense-breakdown
 * @desc    Get expense breakdown by category
 * @query   days (default: 30)
 */
router.get('/expense-breakdown', dashboardController.getExpenseBreakdown);

module.exports = router;
