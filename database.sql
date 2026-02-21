-- ==============================================================================
-- 1. ENUMS (Strict domain boundaries)
-- ==============================================================================
CREATE TYPE user_role AS ENUM ('Admin', 'Manager', 'Dispatcher', 'SafetyOfficer', 'Finance');
CREATE TYPE vehicle_category AS ENUM ('Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck');
CREATE TYPE vehicle_status AS ENUM ('Available', 'On_Trip', 'In_Shop', 'Retired');
CREATE TYPE driver_status AS ENUM ('Off_Duty', 'Available', 'On_Trip', 'Suspended');
CREATE TYPE trip_status AS ENUM (
    'Draft',
    'Unassigned',
    'Dispatched',
    'At_Pickup',
    'In_Transit',
    'Completed',
    'Cancelled'
);
CREATE TYPE expense_category AS ENUM ('Fuel', 'Maintenance', 'Toll', 'Fines', 'Other');

-- ==============================================================================
-- 2. CORE MASTER TABLES
-- ==============================================================================

-- USERS (Backoffice Staff)
CREATE TABLE app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role user_role NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- VEHICLES (The physical assets)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    category vehicle_category NOT NULL,
    capacity_kg INTEGER NOT NULL CHECK (capacity_kg > 0),
    capacity_volume_cft NUMERIC(8,2), -- Cubic feet (Crucial for Porter-like logistics)
    current_odometer INTEGER NOT NULL CHECK (current_odometer >= 0),
    acquisition_cost NUMERIC(12,2) NOT NULL CHECK (acquisition_cost >= 0),
    status vehicle_status NOT NULL DEFAULT 'Available',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- DRIVERS (The human resource)
CREATE TABLE drivers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(100) NOT NULL,
    phone_number VARCHAR(20) UNIQUE NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_class vehicle_category NOT NULL, -- Ties directly to what they can drive
    license_expiry DATE NOT NULL,
    safety_score INTEGER NOT NULL DEFAULT 100 CHECK (safety_score BETWEEN 0 AND 100),
    status driver_status NOT NULL DEFAULT 'Off_Duty',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 3. OPERATIONAL TABLES (The Porter-level workflow)
-- ==============================================================================

-- TRIPS (The Order/Lifecycle)
CREATE TABLE trips (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tracking_number VARCHAR(50) UNIQUE NOT NULL DEFAULT ('TRP-' || UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8))),

    -- Foreign Keys (Nullable initially if Draft, strict if Dispatched)
    vehicle_id UUID REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id UUID REFERENCES drivers(id) ON DELETE RESTRICT,
    dispatcher_id UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,

    -- Geospatial Data (Industry standard for distance/routing)
    pickup_location GEOGRAPHY(Point, 4326) NOT NULL,
    dropoff_location GEOGRAPHY(Point, 4326) NOT NULL,
    pickup_address TEXT NOT NULL,
    dropoff_address TEXT NOT NULL,

    -- Load Specs
    cargo_weight_kg INTEGER NOT NULL CHECK (cargo_weight_kg > 0),

    -- Financials (Porter Model calculates base + distance + time)
    estimated_distance_km NUMERIC(8,2),
    expected_revenue NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (expected_revenue >= 0),

    -- Telemetry
    start_odometer INTEGER CHECK (start_odometer >= 0),
    end_odometer INTEGER,

    -- State & Verification
    status trip_status NOT NULL DEFAULT 'Draft',
    receiver_otp VARCHAR(6), -- Required to complete delivery
    pod_image_url TEXT,      -- Proof of Delivery photo

    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,

    -- Absolute Data Integrity Constraints
    CONSTRAINT chk_odometer_progression CHECK (end_odometer IS NULL OR end_odometer >= start_odometer),
    CONSTRAINT chk_dispatch_requirements CHECK (
        (status IN ('Draft', 'Unassigned', 'Cancelled')) OR
        (vehicle_id IS NOT NULL AND driver_id IS NOT NULL AND start_odometer IS NOT NULL)
    )
);

-- TRIP STATUS AUDIT LOG (The secret to Analytics & SLAs)
-- *This is how Porter tracks if a driver is taking too long at a pickup*
CREATE TABLE trip_status_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE,
    changed_by UUID NOT NULL REFERENCES app_users(id), -- Who clicked the button
    previous_status trip_status,
    new_status trip_status NOT NULL,
    location GEOGRAPHY(Point, 4326), -- GPS ping of where the status was changed
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSES (Operational Cost Tracking for ROI)
CREATE TABLE expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    trip_id UUID REFERENCES trips(id) ON DELETE SET NULL,
    logged_by UUID NOT NULL REFERENCES app_users(id) ON DELETE RESTRICT,

    category expense_category NOT NULL,
    cost NUMERIC(10,2) NOT NULL CHECK (cost >= 0),
    volume_liters NUMERIC(8,2) CHECK (volume_liters >= 0), -- Only for Fuel

    invoice_image_url TEXT,
    description TEXT,
    logged_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 4. DATABASE TRIGGERS & AUTOMATION
-- ==============================================================================

-- Auto-update timestamps (Standard Postgres)
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_update_users BEFORE UPDATE ON app_users FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_vehicles BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_drivers BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_trips BEFORE UPDATE ON trips FOR EACH ROW EXECUTE FUNCTION update_timestamp();
