const db = require('../db');
const tripService = require('./tripService');
const expenseService = require('./expenseService');

/**
 * Dashboard Service - handles dashboard analytics and aggregations
 */
const dashboardService = {
  /**
   * Get revenue vs expenses data for the last N days
   */
  async getRevenueExpenses(days = 7) {
    // Get completed trips revenue by date
    const revenueQuery = await db.query(
      `SELECT 
        DATE(created_at) as date,
        COALESCE(SUM(expected_revenue), 0) as revenue
      FROM trips
      WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND status = 'Completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );

    // Get expenses by date
    const expensesQuery = await db.query(
      `SELECT 
        DATE(logged_at) as date,
        COALESCE(SUM(cost), 0) as expenses
      FROM expenses
      WHERE logged_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(logged_at)
      ORDER BY date ASC`
    );

    // Merge data by date
    const dateMap = new Map();
    
    // Initialize all dates in range
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      dateMap.set(dateStr, { date: dateStr, revenue: 0, expenses: 0 });
    }

    // Fill in revenue
    revenueQuery.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).revenue = parseFloat(row.revenue);
      }
    });

    // Fill in expenses
    expensesQuery.rows.forEach(row => {
      const dateStr = row.date.toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        dateMap.get(dateStr).expenses = parseFloat(row.expenses);
      }
    });

    return Array.from(dateMap.values());
  },

  /**
   * Get overview statistics
   */
  async getOverview() {
    const [
      vehicleStats,
      driverStats,
      tripStats,
      todayRevenue,
      todayExpenses,
    ] = await Promise.all([
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'Available') as available,
          COUNT(*) FILTER (WHERE status = 'On_Trip') as on_trip,
          COUNT(*) FILTER (WHERE status = 'In_Shop') as in_shop
        FROM vehicles
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'Available') as available,
          COUNT(*) FILTER (WHERE status = 'On_Trip') as on_trip
        FROM drivers
      `),
      db.query(`
        SELECT 
          COUNT(*) as total,
          COUNT(*) FILTER (WHERE status = 'Completed') as completed,
          COUNT(*) FILTER (WHERE status IN ('Dispatched', 'At_Pickup', 'In_Transit')) as active,
          COUNT(*) FILTER (WHERE DATE(created_at) = CURRENT_DATE) as today
        FROM trips
      `),
      db.query(`
        SELECT COALESCE(SUM(expected_revenue), 0) as total
        FROM trips
        WHERE DATE(created_at) = CURRENT_DATE AND status = 'Completed'
      `),
      db.query(`
        SELECT COALESCE(SUM(cost), 0) as total
        FROM expenses
        WHERE DATE(logged_at) = CURRENT_DATE
      `),
    ]);

    return {
      vehicles: vehicleStats.rows[0],
      drivers: driverStats.rows[0],
      trips: tripStats.rows[0],
      today: {
        revenue: parseFloat(todayRevenue.rows[0].total),
        expenses: parseFloat(todayExpenses.rows[0].total),
      },
    };
  },

  /**
   * Get recent activity
   */
  async getRecentActivity(limit = 10) {
    const result = await db.query(
      `SELECT 
        'trip' as type,
        t.id,
        t.tracking_number as title,
        t.status,
        t.created_at,
        d.full_name as driver_name,
        v.license_plate as vehicle_plate
      FROM trips t
      LEFT JOIN drivers d ON t.driver_id = d.id
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      ORDER BY t.created_at DESC
      LIMIT $1`,
      [limit]
    );
    return result.rows;
  },

  /**
   * Get fleet utilization
   */
  async getFleetUtilization() {
    const result = await db.query(`
      SELECT 
        category,
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'On_Trip') as active,
        ROUND(
          COUNT(*) FILTER (WHERE status = 'On_Trip')::numeric / 
          NULLIF(COUNT(*), 0) * 100, 
          2
        ) as utilization_percent
      FROM vehicles
      GROUP BY category
      ORDER BY category
    `);
    return result.rows;
  },

  /**
   * Get expense breakdown by category
   */
  async getExpenseBreakdown(days = 30) {
    const result = await db.query(
      `SELECT 
        category,
        SUM(cost) as total,
        COUNT(*) as count
      FROM expenses
      WHERE logged_at >= NOW() - INTERVAL '${days} days'
      GROUP BY category
      ORDER BY total DESC`
    );
    return result.rows;
  },
};

module.exports = dashboardService;
