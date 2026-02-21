const db = require('../db');

/**
 * Driver Service - handles all driver-related database operations
 */
const driverService = {
  /**
   * Get all drivers with optional filters
   */
  async getAll({ status, license_class, search, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        id,
        full_name,
        phone_number,
        license_number,
        license_class,
        license_expiry,
        safety_score,
        status,
        created_at,
        updated_at
      FROM drivers
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (license_class) {
      paramCount++;
      query += ` AND license_class = $${paramCount}`;
      params.push(license_class);
    }

    if (search) {
      paramCount++;
      query += ` AND (full_name ILIKE $${paramCount} OR phone_number ILIKE $${paramCount} OR license_number ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY full_name ASC`;
    
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
   * Get driver by ID
   */
  async getById(id) {
    const result = await db.query(
      `SELECT * FROM drivers WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Create a new driver
   */
  async create(driverData) {
    const {
      full_name,
      phone_number,
      license_number,
      license_class,
      license_expiry,
      safety_score = 100,
      status = 'Off_Duty',
    } = driverData;

    const result = await db.query(
      `INSERT INTO drivers (
        full_name, phone_number, license_number, license_class,
        license_expiry, safety_score, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        full_name, phone_number, license_number, license_class,
        license_expiry, safety_score, status,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update driver status
   */
  async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  /**
   * Update driver safety score
   */
  async updateSafetyScore(id, safetyScore) {
    const result = await db.query(
      `UPDATE drivers SET safety_score = $1 WHERE id = $2 RETURNING *`,
      [safetyScore, id]
    );
    return result.rows[0];
  },

  /**
   * Update driver
   */
  async update(id, driverData) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = [
      'full_name', 'phone_number', 'license_number', 'license_class',
      'license_expiry', 'safety_score', 'status',
    ];

    for (const field of allowedFields) {
      if (driverData[field] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        params.push(driverData[field]);
      }
    }

    if (fields.length === 0) return null;

    paramCount++;
    params.push(id);

    const result = await db.query(
      `UPDATE drivers SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  /**
   * Get driver count by status
   */
  async getCountByStatus() {
    const result = await db.query(`
      SELECT status, COUNT(*) as count
      FROM drivers
      GROUP BY status
    `);
    return result.rows;
  },

  /**
   * Get available drivers for a specific vehicle category
   */
  async getAvailableForCategory(category) {
    const result = await db.query(
      `SELECT * FROM drivers 
       WHERE status = 'Available' AND license_class = $1
       ORDER BY safety_score DESC`,
      [category]
    );
    return result.rows;
  },
};

module.exports = driverService;
