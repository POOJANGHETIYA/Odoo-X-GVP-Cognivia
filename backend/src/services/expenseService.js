const db = require('../db');

/**
 * Expense Service - handles all expense-related database operations
 */
const expenseService = {
  /**
   * Get all expenses with optional filters
   */
  async getAll({ category, vehicle_id, trip_id, startDate, endDate, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        e.id,
        e.vehicle_id,
        e.trip_id,
        e.logged_by,
        e.category,
        e.cost,
        e.volume_liters,
        e.invoice_image_url,
        e.description,
        e.logged_at,
        v.license_plate as vehicle_license_plate,
        t.tracking_number as trip_tracking_number,
        u.full_name as logged_by_name
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      LEFT JOIN trips t ON e.trip_id = t.id
      LEFT JOIN app_users u ON e.logged_by = u.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (category) {
      paramCount++;
      query += ` AND e.category = $${paramCount}`;
      params.push(category);
    }

    if (vehicle_id) {
      paramCount++;
      query += ` AND e.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
    }

    if (trip_id) {
      paramCount++;
      query += ` AND e.trip_id = $${paramCount}`;
      params.push(trip_id);
    }

    if (startDate) {
      paramCount++;
      query += ` AND e.logged_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND e.logged_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` ORDER BY e.logged_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Get expense by ID
   */
  async getById(id) {
    const result = await db.query(
      `SELECT e.*, v.license_plate as vehicle_license_plate
       FROM expenses e
       LEFT JOIN vehicles v ON e.vehicle_id = v.id
       WHERE e.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Create a new expense
   */
  async create(expenseData, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const {
        vehicle_id,
        trip_id,
        category,
        cost,
        volume_liters,
        invoice_image_url,
        description,
      } = expenseData;

      // If maintenance expense, update vehicle status
      if (category === 'Maintenance' && vehicle_id) {
        await client.query(
          `UPDATE vehicles SET status = 'In_Shop' WHERE id = $1`,
          [vehicle_id]
        );
      }

      const result = await client.query(
        `INSERT INTO expenses (
          vehicle_id, trip_id, logged_by, category, cost,
          volume_liters, invoice_image_url, description
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *`,
        [
          vehicle_id, trip_id, userId, category, cost,
          volume_liters, invoice_image_url, description,
        ]
      );

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get total expenses by category
   */
  async getTotalByCategory(startDate, endDate) {
    let query = `
      SELECT category, SUM(cost) as total
      FROM expenses
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (startDate) {
      paramCount++;
      query += ` AND logged_at >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      query += ` AND logged_at <= $${paramCount}`;
      params.push(endDate);
    }

    query += ` GROUP BY category`;

    const result = await db.query(query, params);
    return result.rows;
  },

  /**
   * Get daily expenses (for dashboard)
   */
  async getDailyExpenses(days = 7) {
    const result = await db.query(
      `SELECT 
        DATE(logged_at) as date,
        SUM(cost) as total
      FROM expenses
      WHERE logged_at >= NOW() - INTERVAL '${days} days'
      GROUP BY DATE(logged_at)
      ORDER BY date ASC`
    );
    return result.rows;
  },

  /**
   * Get expenses by vehicle
   */
  async getByVehicle(vehicleId, limit = 50) {
    const result = await db.query(
      `SELECT * FROM expenses 
       WHERE vehicle_id = $1 
       ORDER BY logged_at DESC 
       LIMIT $2`,
      [vehicleId, limit]
    );
    return result.rows;
  },
};

module.exports = expenseService;
