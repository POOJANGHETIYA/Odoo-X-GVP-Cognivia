/**
 * Database Initialization Script
 * Creates tables and seeds initial data
 * 
 * Run with: npm run db:init
 */

require('dotenv').config();
const { Pool } = require('pg');
const config = require('../config');

const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
});

const createEnumsSQL = `
-- Drop existing types if they exist (careful in production!)
DO $$ BEGIN
    DROP TYPE IF EXISTS user_role CASCADE;
    DROP TYPE IF EXISTS vehicle_category CASCADE;
    DROP TYPE IF EXISTS vehicle_status CASCADE;
    DROP TYPE IF EXISTS driver_status CASCADE;
    DROP TYPE IF EXISTS trip_status CASCADE;
    DROP TYPE IF EXISTS expense_category CASCADE;
EXCEPTION
    WHEN others THEN null;
END $$;

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Dispatcher', 'SafetyOfficer', 'Finance');
CREATE TYPE vehicle_category AS ENUM ('Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck');
CREATE TYPE vehicle_status AS ENUM ('Available', 'On_Trip', 'In_Shop', 'Retired');
CREATE TYPE driver_status AS ENUM ('Off_Duty', 'Available', 'On_Trip', 'Suspended');
CREATE TYPE trip_status AS ENUM ('Draft', 'Unassigned', 'Dispatched', 'At_Pickup', 'In_Transit', 'Completed', 'Cancelled');
CREATE TYPE expense_category AS ENUM ('Fuel', 'Maintenance', 'Toll', 'Fines', 'Other');
`;

const createTablesSQL = `
-- Users table
CREATE TABLE IF NOT EXISTS app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    category vehicle_category NOT NULL,
    capacity_kg INTEGER NOT NULL CHECK (capacity_kg > 0),
    capacity_volume_cft NUMERIC(8,2),
    current_odometer INTEGER NOT NULL CHECK (current_odometer >= 0),
    acquisition_cost NUMERIC(12,2) NOT NULL CHECK (acquisition_cost >= 0),
    status vehicle_status NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    brand VARCHAR(100),
    manufacturing_year INTEGER CHECK (manufacturing_year > 1990 AND manufacturing_year <= 2100),
    registration_date DATE DEFAULT CURRENT_DATE
);

-- Drivers table
CREATE TABLE IF NOT EXISTS drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_class vehicle_category NOT NULL,
    license_expiry DATE NOT NULL,
    safety_score INTEGER NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status driver_status NOT NULL DEFAULT 'Off_Duty',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Trips table
CREATE TABLE IF NOT EXISTS trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL,
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
    dispatcher_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    pickup_location GEOGRAPHY(Point, 4326),
    dropoff_location GEOGRAPHY(Point, 4326),
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,
    cargo_weight_kg INTEGER NOT NULL CHECK (cargo_weight_kg > 0),
    estimated_distance_km NUMERIC(8,2),
    expected_revenue NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (expected_revenue >= 0),
    start_odometer INTEGER CHECK (start_odometer >= 0),
    end_odometer INTEGER,
    status trip_status NOT NULL DEFAULT 'Draft',
    receiver_otp VARCHAR(6),
    pod_image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_odometer_progression CHECK (end_odometer IS NULL OR end_odometer >= start_odometer)
);

-- Trip status logs table
CREATE TABLE IF NOT EXISTS trip_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES app_users(id),
    previous_status trip_status,
    new_status trip_status NOT NULL,
    location GEOGRAPHY(Point, 4326),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Expenses table
CREATE TABLE IF NOT EXISTS expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    logged_by UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,
    category expense_category NOT NULL,
    cost NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
    volume_liters NUMERIC(8,2) CHECK (volume_liters >= 0),
    invoice_image_url TEXT,
    description TEXT,
    logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Create update timestamp function
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers (drop first if exists)
DROP TRIGGER IF EXISTS trg_update_users ON app_users;
DROP TRIGGER IF EXISTS trg_update_vehicles ON vehicles;
DROP TRIGGER IF EXISTS trg_update_drivers ON drivers;
DROP TRIGGER IF EXISTS trg_update_trips ON trips;

CREATE TRIGGER trg_update_users BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_drivers BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_trips BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_timestamp();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
CREATE INDEX IF NOT EXISTS idx_trips_status ON trips(status);
CREATE INDEX IF NOT EXISTS idx_trips_created_at ON trips(created_at);
CREATE INDEX IF NOT EXISTS idx_expenses_logged_at ON expenses(logged_at);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
`;

const seedDataSQL = `
-- Insert default admin user
INSERT INTO app_users (id, email, full_name, role) 
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@fleetflow.com', 'System Admin', 'Admin')
ON CONFLICT (email) DO NOTHING;

-- Insert sample vehicles
INSERT INTO vehicles (license_plate, category, capacity_kg, capacity_volume_cft, current_odometer, acquisition_cost, status, brand, manufacturing_year)
VALUES 
    ('TN-01-AB-1234', 'Heavy_Truck', 15000, 800, 45000, 2500000, 'Available', 'Tata', 2022),
    ('TN-01-CD-5678', 'Medium_Truck', 8000, 500, 32000, 1800000, 'On_Trip', 'Ashok Leyland', 2021),
    ('TN-01-EF-9012', 'Mini_Truck', 3000, 200, 28000, 800000, 'Available', 'Mahindra', 2023),
    ('TN-01-GH-3456', '3_Wheeler', 500, 50, 15000, 250000, 'In_Shop', 'Piaggio', 2022),
    ('TN-01-IJ-7890', 'Bike', 20, 5, 8000, 80000, 'Available', 'Honda', 2023),
    ('TN-02-KL-1234', 'Heavy_Truck', 18000, 900, 62000, 2800000, 'Available', 'Volvo', 2021),
    ('TN-02-MN-5678', 'Medium_Truck', 7500, 450, 41000, 1600000, 'Available', 'Eicher', 2022)
ON CONFLICT (license_plate) DO NOTHING;

-- Insert sample drivers
INSERT INTO drivers (full_name, phone_number, license_number, license_class, license_expiry, safety_score, status)
VALUES 
    ('Rajesh Kumar', '+91-9876543210', 'DL-0420110012345', 'Heavy_Truck', '2026-12-31', 95, 'Available'),
    ('Suresh Babu', '+91-9876543211', 'DL-0420110012346', 'Medium_Truck', '2025-06-30', 88, 'On_Trip'),
    ('Venkat Rao', '+91-9876543212', 'DL-0420110012347', 'Mini_Truck', '2025-09-15', 92, 'Available'),
    ('Arun Kumar', '+91-9876543213', 'DL-0420110012348', '3_Wheeler', '2024-12-31', 78, 'Off_Duty'),
    ('Prasad Reddy', '+91-9876543214', 'DL-0420110012349', 'Bike', '2025-03-20', 85, 'Available'),
    ('Krishna Murthy', '+91-9876543215', 'DL-0420110012350', 'Heavy_Truck', '2026-01-15', 90, 'Available'),
    ('Ravi Teja', '+91-9876543216', 'DL-0420110012351', 'Medium_Truck', '2025-08-10', 82, 'Available')
ON CONFLICT (phone_number) DO NOTHING;
`;

async function initDatabase() {
  const client = await pool.connect();
  
  try {
    console.log('🔧 Starting database initialization...\n');

    // Enable PostGIS extension (for geography type)
    console.log('📦 Enabling PostGIS extension...');
    await client.query('CREATE EXTENSION IF NOT EXISTS postgis;');
    console.log('✅ PostGIS enabled\n');

    // Create ENUM types
    console.log('📦 Creating ENUM types...');
    try {
      await client.query(createEnumsSQL);
      console.log('✅ ENUM types created\n');
    } catch (err) {
      if (err.code === '42710') { // Type already exists
        console.log('ℹ️  ENUM types already exist, skipping...\n');
      } else {
        throw err;
      }
    }

    // Create tables
    console.log('📦 Creating tables...');
    await client.query(createTablesSQL);
    console.log('✅ Tables created\n');

    // Seed data
    console.log('🌱 Seeding initial data...');
    await client.query(seedDataSQL);
    console.log('✅ Data seeded\n');

    console.log('═══════════════════════════════════════════════════');
    console.log('✅ Database initialization completed successfully!');
    console.log('═══════════════════════════════════════════════════\n');

    // Show table counts
    const tables = ['app_users', 'vehicles', 'drivers', 'trips', 'expenses'];
    console.log('📊 Table counts:');
    for (const table of tables) {
      const result = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(`   ${table}: ${result.rows[0].count} rows`);
    }

  } catch (error) {
    console.error('❌ Database initialization failed:', error.message);
    console.error('\n📋 Error details:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

initDatabase();
