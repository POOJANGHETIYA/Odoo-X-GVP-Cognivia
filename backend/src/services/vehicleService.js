const db = require('../db');

/**
 * Vehicle Service - handles all vehicle-related database operations
 */
const vehicleService = {
  /**
   * Get all vehicles with optional filters
   */
  async getAll({ status, category, search, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        id,
        license_plate,
        category,
        capacity_kg,
        capacity_volume_cft,
        current_odometer,
        acquisition_cost,
        status,
        brand,
        manufacturing_year,
        registration_date,
        created_at,
        updated_at
      FROM vehicles
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND status = $${paramCount}`;
      params.push(status);
    }

    if (category) {
      paramCount++;
      query += ` AND category = $${paramCount}`;
      params.push(category);
    }

    if (search) {
      paramCount++;
      query += ` AND (license_plate ILIKE $${paramCount} OR brand ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;
    
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
   * Get vehicle by ID
   */
  async getById(id) {
    const result = await db.query(
      `SELECT * FROM vehicles WHERE id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Create a new vehicle
   */
  async create(vehicleData) {
    const {
      license_plate,
      category,
      capacity_kg,
      capacity_volume_cft,
      current_odometer,
      acquisition_cost,
      status = 'Available',
      brand,
      manufacturing_year,
      registration_date,
    } = vehicleData;

    const result = await db.query(
      `INSERT INTO vehicles (
        license_plate, category, capacity_kg, capacity_volume_cft,
        current_odometer, acquisition_cost, status, brand,
        manufacturing_year, registration_date
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        license_plate, category, capacity_kg, capacity_volume_cft,
        current_odometer, acquisition_cost, status, brand,
        manufacturing_year, registration_date,
      ]
    );
    return result.rows[0];
  },

  /**
   * Update vehicle status
   */
  async updateStatus(id, status) {
    const result = await db.query(
      `UPDATE vehicles SET status = $1 WHERE id = $2 RETURNING *`,
      [status, id]
    );
    return result.rows[0];
  },

  /**
   * Update vehicle odometer
   */
  async updateOdometer(id, odometer) {
    const result = await db.query(
      `UPDATE vehicles SET current_odometer = $1 WHERE id = $2 RETURNING *`,
      [odometer, id]
    );
    return result.rows[0];
  },

  /**
   * Update vehicle
   */
  async update(id, vehicleData) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = [
      'license_plate', 'category', 'capacity_kg', 'capacity_volume_cft',
      'current_odometer', 'acquisition_cost', 'status', 'brand',
      'manufacturing_year', 'registration_date',
    ];

    for (const field of allowedFields) {
      if (vehicleData[field] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        params.push(vehicleData[field]);
      }
    }

    if (fields.length === 0) return null;

    paramCount++;
    params.push(id);

    const result = await db.query(
      `UPDATE vehicles SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  /**
   * Get vehicle count by status
   */
  async getCountByStatus() {
    const result = await db.query(`
      SELECT status, COUNT(*) as count
      FROM vehicles
      GROUP BY status
    `);
    return result.rows;
  },
};

module.exports = vehicleService;
