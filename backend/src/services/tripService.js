const db = require('../db');
const vehicleService = require('./vehicleService');
const driverService = require('./driverService');

/**
 * Trip Service - handles all trip-related database operations
 */
const tripService = {
  /**
   * Generate tracking number
   */
  generateTrackingNumber() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = 'TRP-';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },

  /**
   * Generate OTP
   */
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  /**
   * Get all trips with optional filters
   */
  async getAll({ status, vehicle_id, driver_id, search, limit = 50, offset = 0 }) {
    let query = `
      SELECT 
        t.id,
        t.tracking_number,
        t.vehicle_id,
        t.driver_id,
        t.dispatcher_id,
        t.pickup_address,
        t.dropoff_address,
        t.cargo_weight_kg,
        t.estimated_distance_km,
        t.expected_revenue,
        t.start_odometer,
        t.end_odometer,
        t.status,
        t.receiver_otp,
        t.pod_image_url,
        t.created_at,
        t.updated_at,
        v.license_plate as vehicle_license_plate,
        v.category as vehicle_category,
        d.full_name as driver_name,
        d.phone_number as driver_phone
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND t.status = $${paramCount}`;
      params.push(status);
    }

    if (vehicle_id) {
      paramCount++;
      query += ` AND t.vehicle_id = $${paramCount}`;
      params.push(vehicle_id);
    }

    if (driver_id) {
      paramCount++;
      query += ` AND t.driver_id = $${paramCount}`;
      params.push(driver_id);
    }

    if (search) {
      paramCount++;
      query += ` AND (t.tracking_number ILIKE $${paramCount} OR t.pickup_address ILIKE $${paramCount} OR t.dropoff_address ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY t.created_at DESC`;
    
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
   * Get trip by ID
   */
  async getById(id) {
    const result = await db.query(
      `SELECT 
        t.*,
        v.license_plate as vehicle_license_plate,
        v.category as vehicle_category,
        d.full_name as driver_name,
        d.phone_number as driver_phone
      FROM trips t
      LEFT JOIN vehicles v ON t.vehicle_id = v.id
      LEFT JOIN drivers d ON t.driver_id = d.id
      WHERE t.id = $1`,
      [id]
    );
    return result.rows[0];
  },

  /**
   * Create a new trip
   */
  async create(tripData, dispatcherId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const {
        vehicle_id,
        driver_id,
        pickup_address,
        dropoff_address,
        pickup_lat,
        pickup_lng,
        dropoff_lat,
        dropoff_lng,
        cargo_weight_kg,
        estimated_distance_km,
        expected_revenue,
        status = 'Draft',
      } = tripData;

      const tracking_number = this.generateTrackingNumber();
      const receiver_otp = this.generateOTP();

      // Determine initial status based on assignment
      let initialStatus = status;
      if (vehicle_id && driver_id && status === 'Draft') {
        initialStatus = 'Dispatched';
      } else if (!vehicle_id || !driver_id) {
        initialStatus = 'Unassigned';
      }

      // Get start odometer if vehicle is assigned
      let start_odometer = null;
      if (vehicle_id) {
        const vehicle = await vehicleService.getById(vehicle_id);
        if (vehicle) {
          start_odometer = vehicle.current_odometer;
          // Update vehicle status to On_Trip
          await client.query(
            `UPDATE vehicles SET status = 'On_Trip' WHERE id = $1`,
            [vehicle_id]
          );
        }
      }

      // Update driver status to On_Trip if assigned
      if (driver_id) {
        await client.query(
          `UPDATE drivers SET status = 'On_Trip' WHERE id = $1`,
          [driver_id]
        );
      }

      const result = await client.query(
        `INSERT INTO trips (
          tracking_number, vehicle_id, driver_id, dispatcher_id,
          pickup_location, dropoff_location, pickup_address, dropoff_address,
          cargo_weight_kg, estimated_distance_km, expected_revenue,
          start_odometer, status, receiver_otp
        ) VALUES (
          $1, $2, $3, $4,
          ST_SetSRID(ST_MakePoint($5, $6), 4326)::geography,
          ST_SetSRID(ST_MakePoint($7, $8), 4326)::geography,
          $9, $10, $11, $12, $13, $14, $15, $16
        )
        RETURNING *`,
        [
          tracking_number, vehicle_id, driver_id, dispatcherId,
          pickup_lng || 0, pickup_lat || 0,
          dropoff_lng || 0, dropoff_lat || 0,
          pickup_address, dropoff_address,
          cargo_weight_kg, estimated_distance_km, expected_revenue,
          start_odometer, initialStatus, receiver_otp,
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
   * Update trip status
   */
  async updateStatus(id, newStatus, userId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');

      const trip = await this.getById(id);
      if (!trip) {
        throw new Error('Trip not found');
      }

      const previousStatus = trip.status;

      // Handle status-specific logic
      if (newStatus === 'Completed') {
        // Update vehicle odometer and release
        if (trip.vehicle_id) {
          const endOdometer = trip.start_odometer + (trip.estimated_distance_km || 0);
          await client.query(
            `UPDATE vehicles SET status = 'Available', current_odometer = $1 WHERE id = $2`,
            [endOdometer, trip.vehicle_id]
          );
          
          // Update trip with end odometer
          await client.query(
            `UPDATE trips SET end_odometer = $1 WHERE id = $2`,
            [endOdometer, id]
          );
        }

        // Release driver
        if (trip.driver_id) {
          await client.query(
            `UPDATE drivers SET status = 'Available' WHERE id = $1`,
            [trip.driver_id]
          );
        }
      } else if (newStatus === 'Cancelled') {
        // Release vehicle
        if (trip.vehicle_id) {
          await client.query(
            `UPDATE vehicles SET status = 'Available' WHERE id = $1`,
            [trip.vehicle_id]
          );
        }

        // Release driver
        if (trip.driver_id) {
          await client.query(
            `UPDATE drivers SET status = 'Available' WHERE id = $1`,
            [trip.driver_id]
          );
        }
      }

      // Update trip status
      const result = await client.query(
        `UPDATE trips SET status = $1 WHERE id = $2 RETURNING *`,
        [newStatus, id]
      );

      // Log status change
      await client.query(
        `INSERT INTO trip_status_logs (trip_id, changed_by, previous_status, new_status)
         VALUES ($1, $2, $3, $4)`,
        [id, userId, previousStatus, newStatus]
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
   * Update trip
   */
  async update(id, tripData) {
    const fields = [];
    const params = [];
    let paramCount = 0;

    const allowedFields = [
      'vehicle_id', 'driver_id', 'pickup_address', 'dropoff_address',
      'cargo_weight_kg', 'estimated_distance_km', 'expected_revenue',
      'start_odometer', 'end_odometer', 'status', 'pod_image_url',
    ];

    for (const field of allowedFields) {
      if (tripData[field] !== undefined) {
        paramCount++;
        fields.push(`${field} = $${paramCount}`);
        params.push(tripData[field]);
      }
    }

    if (fields.length === 0) return null;

    paramCount++;
    params.push(id);

    const result = await db.query(
      `UPDATE trips SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );
    return result.rows[0];
  },

  /**
   * Get trip count by status
   */
  async getCountByStatus() {
    const result = await db.query(`
      SELECT status, COUNT(*) as count
      FROM trips
      GROUP BY status
    `);
    return result.rows;
  },

  /**
   * Get recent trips with revenue (for dashboard)
   */
  async getRecentWithRevenue(days = 7) {
    const result = await db.query(
      `SELECT 
        DATE(created_at) as date,
        SUM(expected_revenue) as revenue,
        COUNT(*) as trip_count
      FROM trips
      WHERE created_at >= NOW() - INTERVAL '${days} days'
        AND status = 'Completed'
      GROUP BY DATE(created_at)
      ORDER BY date ASC`
    );
    return result.rows;
  },
};

module.exports = tripService;
