const db = require('../db');

/**
 * Maintenance Service - handles all maintenance-related database operations
 * Note: This uses the expenses table with category='Maintenance' plus additional tracking
 */
const maintenanceService = {
  /**
   * Maintenance Logs Table (Custom - not in original schema, but needed for frontend)
   * We'll create this as a separate concept from expenses
   */

  /**
   * Get all maintenance logs with optional filters
   */
  async getAll({ vehicle_id, status, service_type, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        e.id,
        e.vehicle_id,
        e.category,
        e.cost,
        e.description,
        e.logged_at,
        e.invoice_image_url,
        v.license_plate as vehicle_license_plate,
        v.category as vehicle_category
      FROM expenses e
      LEFT JOIN vehicles v ON e.vehicle_id = v.id
      WHERE e.category = 'Maintenance'
    `;
    const params = [];
    let paramCount = 0;

    if (vehicle_id) {
      paramCount++;
      query += ` AND e.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
    }

    query += ` ORDER BY e.logged_at DESC`;
    
    paramCount++;
    query += ` LIMIT $${paramCount}`;
    params.push(limit);

    paramCount++;
    query += ` OFFSET $${paramCount}`;
    params.push(offset);

    const result = await db.query(query, params);
    
    // Transform to match frontend expectations
    return result.rows.map(row => ({
      id: row.id,
      vehicle_id: row.vehicle_id,
      vehicle_license_plate: row.vehicle_license_plate,
      service_type: this.extractServiceType(row.description),
      status: 'Completed', // Default since expenses are logged after completion
      cost: parseFloat(row.cost),
      description: row.description,
      scheduled_date: row.logged_at,
      completed_date: row.logged_at,
      created_at: row.logged_at,
    }));
  },

  /**
   * Extract service type from description
   */
  extractServiceType(description) {
    if (!description) return 'Other';
    const desc = description.toLowerCase();
    if (desc.includes('oil')) return 'Oil_Change';
    if (desc.includes('tire')) return 'Tire_Replacement';
    if (desc.includes('engine')) return 'Engine_Repair';
    if (desc.includes('brake')) return 'Brake_Service';
    if (desc.includes('transmission')) return 'Transmission';
    if (desc.includes('battery')) return 'Battery_Replacement';
    if (desc.includes('ac') || desc.includes('air condition')) return 'AC_Service';
    if (desc.includes('inspection')) return 'General_Inspection';
    return 'Other';
  },

  /**
   * Get maintenance log by ID
   */
  async getById(id) {
    const result = await db.query(
      `SELECT e.*, v.license_plate as vehicle_license_plate
       FROM expenses e
       LEFT JOIN vehicles v ON e.vehicle_id = v.id
       WHERE e.id = $1 AND e.category = 'Maintenance'`,
      [id]
    );
    
    if (!result.rows[0]) return null;
    
    const row = result.rows[0];
    return {
      id: row.id,
      vehicle_id: row.vehicle_id,
      vehicle_license_plate: row.vehicle_license_plate,
      service_type: this.extractServiceType(row.description),
      status: 'Completed',
      cost: parseFloat(row.cost),
      description: row.description,
      scheduled_date: row.logged_at,
      completed_date: row.logged_at,
      created_at: row.logged_at,
    };
  },

  /**
   * Create a new maintenance log (creates an expense with category=Maintenance)
   */
  async create(maintenanceData, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const {
        vehicle_id,
        service_type,
        cost,
        description,
        scheduled_date,
      } = maintenanceData;

      // Update vehicle status to In_Shop
      await client.query(
        `UPDATE vehicles SET status = 'In_Shop' WHERE id = $1`,
        [vehicle_id]
      );

      // Create expense record
      const fullDescription = `[${service_type}] ${description || ''}`.trim();
      
      const result = await client.query(
        `INSERT INTO expenses (
          vehicle_id, logged_by, category, cost, description, logged_at
        ) VALUES ($1, $2, 'Maintenance', $3, $4, $5)
        RETURNING *`,
        [vehicle_id, userId, cost, fullDescription, scheduled_date || new Date()]
      );

      await client.query('COMMIT');
      
      const row = result.rows[0];
      return {
        id: row.id,
        vehicle_id: row.vehicle_id,
        service_type,
        status: 'Scheduled',
        cost: parseFloat(row.cost),
        description: row.description,
        scheduled_date: row.logged_at,
        created_at: row.logged_at,
      };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Complete maintenance and release vehicle
   */
  async complete(id) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      // Get the maintenance record
      const expense = await db.query(
        `SELECT vehicle_id FROM expenses WHERE id = $1 AND category = 'Maintenance'`,
        [id]
      );

      if (!expense.rows[0]) {
        throw new Error('Maintenance record not found');
      }

      // Release vehicle back to Available
      await client.query(
        `UPDATE vehicles SET status = 'Available' WHERE id = $1`,
        [expense.rows[0].vehicle_id]
      );

      await client.query('COMMIT');
      
      return this.getById(id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  },

  /**
   * Get maintenance costs by service type
   */
  async getCostsByServiceType() {
    const result = await db.query(`
      SELECT 
        description,
        SUM(cost) as total_cost,
        COUNT(*) as count
      FROM expenses
      WHERE category = 'Maintenance'
      GROUP BY description
      ORDER BY total_cost DESC
    `);
    return result.rows;
  },

  /**
   * Get vehicles currently in maintenance
   */
  async getVehiclesInMaintenance() {
    const result = await db.query(`
      SELECT v.*, e.description as maintenance_description, e.logged_at as maintenance_date
      FROM vehicles v
      LEFT JOIN expenses e ON v.id = e.vehicle_id AND e.category = 'Maintenance'
      WHERE v.status = 'In_Shop'
      ORDER BY e.logged_at DESC
    `);
    return result.rows;
  },
};

module.exports = maintenanceService;
