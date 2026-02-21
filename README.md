# FleetFlow v2.0 - Enterprise Fleet Management System

<div align="center">

![FleetFlow](https://img.shields.io/badge/FleetFlow-v2.0-10b981?style=for-the-badge&logo=truck&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18+-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?style=flat-square&logo=postgresql)
![PostGIS](https://img.shields.io/badge/PostGIS-Geospatial-336791?style=flat-square)

**Production-grade logistics fleet management platform**  
*Designed for the Indian market with Porter-like operational workflows*

[Architecture](#-system-architecture) • [Database](#-database-design) • [Backend](#-backend-architecture) • [Frontend](#-frontend-architecture) • [System Flow](#-system-flow)

</div>

---

## 📑 Table of Contents

1. [System Overview](#-system-overview)
2. [System Architecture](#-system-architecture)
3. [Database Design](#-database-design)
4. [Backend Architecture](#-backend-architecture)
5. [Frontend Architecture](#-frontend-architecture)
6. [System Flow](#-system-flow)
7. [API Reference](#-api-reference)
8. [Getting Started](#-getting-started)
9. [Business Rules Engine](#-business-rules-engine)

---

## 🎯 System Overview

FleetFlow is a full-stack enterprise logistics management system built with modern technologies, designed to handle:

| User Role | Responsibilities |
|-----------|-----------------|
| **Fleet Managers** | Vehicle lifecycle, maintenance scheduling, fleet utilization |
| **Dispatchers** | Trip creation, vehicle-driver assignment, real-time tracking |
| **Safety Officers** | Driver compliance, safety score monitoring, license tracking |
| **Finance Team** | Expense logging, revenue tracking, ROI analysis |

### Localization (India-First)
```
┌─────────────────────────────────────────────────────────────┐
│  Currency: ₹ (INR) │ Distance: km │ Weight: kg │ Volume: cft │
│  Timezone: IST (UTC+5:30) │ Locale: en-IN                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🏗 System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    React 18 + TypeScript + Vite                      │   │
│  │  ┌─────────┐  ┌─────────────┐  ┌──────────┐  ┌─────────────────┐   │   │
│  │  │ TanStack│  │   Shadcn/ui │  │  Leaflet │  │    Recharts     │   │   │
│  │  │ Router  │  │  Components │  │   Maps   │  │   Visualization │   │   │
│  │  └─────────┘  └─────────────┘  └──────────┘  └─────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST (JSON)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API LAYER                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                  Node.js + Express.js REST API                       │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  Helmet  │  │   Morgan   │  │   CORS   │  │  Express-Validator│   │   │
│  │  │ Security │  │  Logging   │  │  Policy  │  │    Validation    │   │   │
│  │  └──────────┘  └────────────┘  └──────────┘  └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ pg (node-postgres)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATA LAYER                                      │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │           PostgreSQL 14+ with PostGIS Extension                      │   │
│  │  ┌──────────┐  ┌────────────┐  ┌──────────┐  ┌──────────────────┐   │   │
│  │  │  ENUMs   │  │  Triggers  │  │ Indexes  │  │  Geography Type  │   │   │
│  │  │ Domains  │  │  Functions │  │   B-Tree │  │   SRID 4326      │   │   │
│  │  └──────────┘  └────────────┘  └──────────┘  └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack Matrix

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend** | React | 18.2 | UI Framework |
| | TypeScript | 5.2 | Type Safety |
| | Vite | 5.1 | Build Tool & Dev Server |
| | TanStack Router | 1.161 | Type-safe File-based Routing |
| | TanStack Query | 5.90 | Server State & Caching |
| | Tailwind CSS | 3.4 | Utility-first Styling |
| | Shadcn/ui | Latest | Accessible UI Components |
| | Leaflet | 1.9 | Interactive Maps |
| | Recharts | 3.7 | Data Visualization |
| | Zod | 4.3 | Runtime Schema Validation |
| **Backend** | Node.js | 18+ | Runtime Environment |
| | Express | 4.21 | Web Framework |
| | pg | 8.13 | PostgreSQL Client |
| | Helmet | 8.0 | Security Headers |
| | Morgan | 1.10 | HTTP Logging |
| **Database** | PostgreSQL | 14+ | RDBMS |
| | PostGIS | 3.x | Geospatial Extension |

---

## 🗄 Database Design

### Entity-Relationship Diagram

```
                                    ┌─────────────────────────────┐
                                    │        app_users            │
                                    ├─────────────────────────────┤
                                    │ id          UUID PK         │
                                    │ email       VARCHAR UNIQUE  │
                                    │ full_name   VARCHAR         │
                                    │ role        user_role ENUM  │
                                    │ is_active   BOOLEAN         │
                                    │ created_at  TIMESTAMPTZ     │
                                    │ updated_at  TIMESTAMPTZ     │
                                    └──────────────┬──────────────┘
                                                   │
                     ┌─────────────────────────────┼─────────────────────────────┐
                     │                             │                             │
                     ▼                             ▼                             ▼
┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐
│         vehicles            │   │          drivers            │   │          trips              │
├─────────────────────────────┤   ├─────────────────────────────┤   ├─────────────────────────────┤
│ id           UUID PK        │   │ id           UUID PK        │   │ id              UUID PK    │
│ license_plate VARCHAR UNIQUE│   │ full_name    VARCHAR        │   │ tracking_number VARCHAR UK │
│ category     vehicle_category│   │ phone_number VARCHAR UNIQUE │   │ vehicle_id      UUID FK    │◄─┐
│ capacity_kg  INTEGER        │   │ license_number VARCHAR UK   │   │ driver_id       UUID FK    │◄─┼─┐
│ capacity_volume_cft NUMERIC │   │ license_class vehicle_category│   │ dispatcher_id   UUID FK    │  │ │
│ current_odometer INTEGER    │   │ license_expiry DATE         │   │ pickup_location GEOGRAPHY  │  │ │
│ acquisition_cost NUMERIC    │   │ safety_score INTEGER (0-100)│   │ dropoff_location GEOGRAPHY │  │ │
│ status       vehicle_status │   │ status       driver_status  │   │ pickup_address  TEXT       │  │ │
│ brand        VARCHAR        │   │ created_at   TIMESTAMPTZ    │   │ dropoff_address TEXT       │  │ │
│ manufacturing_year INTEGER  │   │ updated_at   TIMESTAMPTZ    │   │ cargo_weight_kg INTEGER    │  │ │
│ registration_date DATE      │   └─────────────────────────────┘   │ estimated_distance_km NUM  │  │ │
│ created_at   TIMESTAMPTZ    │                                     │ expected_revenue NUMERIC   │  │ │
│ updated_at   TIMESTAMPTZ    │                                     │ start_odometer  INTEGER    │  │ │
└──────────────┬──────────────┘                                     │ end_odometer    INTEGER    │  │ │
               │                                                    │ status          trip_status│  │ │
               │                                                    │ receiver_otp    VARCHAR(6) │  │ │
               │                                                    │ pod_image_url   TEXT       │  │ │
               │                                                    │ created_at      TIMESTAMPTZ│  │ │
               │                                                    │ updated_at      TIMESTAMPTZ│  │ │
               │                                                    └──────────────┬──────────────┘  │ │
               │                                                                   │                 │ │
               │                         ┌─────────────────────────────────────────┼─────────────────┘ │
               │                         │                                         │                   │
               ▼                         ▼                                         ▼                   │
┌─────────────────────────────┐   ┌─────────────────────────────┐   ┌─────────────────────────────┐   │
│         expenses            │   │     trip_status_logs        │   │    (Referential Link)       │   │
├─────────────────────────────┤   ├─────────────────────────────┤   └─────────────────────────────┘   │
│ id          UUID PK         │   │ id            UUID PK       │                                     │
│ vehicle_id  UUID FK         │◄──┤ trip_id       UUID FK       │◄────────────────────────────────────┘
│ trip_id     UUID FK (null)  │   │ changed_by    UUID FK       │
│ logged_by   UUID FK         │   │ previous_status trip_status │
│ category    expense_category│   │ new_status    trip_status   │
│ cost        NUMERIC         │   │ location      GEOGRAPHY     │
│ volume_liters NUMERIC       │   │ notes         TEXT          │
│ invoice_image_url TEXT      │   │ created_at    TIMESTAMPTZ   │
│ description TEXT            │   └─────────────────────────────┘
│ logged_at   TIMESTAMPTZ     │
└─────────────────────────────┘
```

### ENUM Definitions (Domain Boundaries)

```sql
-- Role-Based Access Control
CREATE TYPE user_role AS ENUM (
    'Admin',           -- Full system access
    'Manager',         -- Fleet & Driver management
    'Dispatcher',      -- Trip creation & assignment
    'SafetyOfficer',   -- Driver compliance monitoring
    'Finance'          -- Expense & Revenue access
);

-- Vehicle Classification (Porter Model)
CREATE TYPE vehicle_category AS ENUM (
    'Bike',            -- 20kg capacity
    '3_Wheeler',       -- 500kg capacity
    'Mini_Truck',      -- 1-3 ton
    'Medium_Truck',    -- 5-8 ton
    'Heavy_Truck'      -- 15-20 ton
);

-- Vehicle Lifecycle Status
CREATE TYPE vehicle_status AS ENUM (
    'Available',       -- Ready for dispatch
    'On_Trip',         -- Currently assigned
    'In_Shop',         -- Under maintenance
    'Retired'          -- Decommissioned
);

-- Driver Availability Status
CREATE TYPE driver_status AS ENUM (
    'Off_Duty',        -- Not working
    'Available',       -- Ready for assignment
    'On_Trip',         -- Currently on trip
    'Suspended'        -- Compliance violation
);

-- Trip Lifecycle (State Machine)
CREATE TYPE trip_status AS ENUM (
    'Draft',           -- Created, not submitted
    'Unassigned',      -- Pending vehicle/driver
    'Dispatched',      -- Assigned, en route to pickup
    'At_Pickup',       -- Arrived at pickup location
    'In_Transit',      -- Cargo loaded, en route
    'Completed',       -- Delivered successfully
    'Cancelled'        -- Terminated
);

-- Expense Categorization
CREATE TYPE expense_category AS ENUM (
    'Fuel',            -- Petrol/Diesel
    'Maintenance',     -- Repairs & Service
    'Toll',            -- Highway charges
    'Fines',           -- Traffic violations
    'Other'            -- Miscellaneous
);
```

### Database Constraints & Integrity

```sql
-- Trip Dispatch Requirements (Critical Business Rule)
CONSTRAINT chk_dispatch_requirements CHECK (
    (status IN ('Draft', 'Unassigned', 'Cancelled')) OR
    (vehicle_id IS NOT NULL AND driver_id IS NOT NULL AND start_odometer IS NOT NULL)
)
-- Ensures: A trip can only be Dispatched if vehicle + driver + odometer are set

-- Odometer Progression (Prevents Data Corruption)
CONSTRAINT chk_odometer_progression CHECK (
    end_odometer IS NULL OR end_odometer >= start_odometer
)

-- Safety Score Range (0-100 Scale)
CHECK (safety_score BETWEEN 0 AND 100)

-- Positive Values Only
CHECK (capacity_kg > 0)
CHECK (cargo_weight_kg > 0)
CHECK (cost >= 0)
CHECK (expected_revenue >= 0)
```

### Triggers & Automation

```sql
-- Auto-update timestamps on every UPDATE
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Applied to all master tables
CREATE TRIGGER trg_update_vehicles BEFORE UPDATE ON vehicles 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_drivers BEFORE UPDATE ON drivers 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
CREATE TRIGGER trg_update_trips BEFORE UPDATE ON trips 
    FOR EACH ROW EXECUTE FUNCTION update_timestamp();
```

### Indexing Strategy

```sql
-- Status-based queries (frequent filter)
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_trips_status ON trips(status);

-- Time-series analytics
CREATE INDEX idx_trips_created_at ON trips(created_at);
CREATE INDEX idx_expenses_logged_at ON expenses(logged_at);

-- Category-based expense reports
CREATE INDEX idx_expenses_category ON expenses(category);
```

---

## ⚙️ Backend Architecture

### Directory Structure

```
backend/
├── src/
│   ├── config/
│   │   └── index.js              # Environment configuration
│   │
│   ├── db/
│   │   └── index.js              # PostgreSQL connection pool
│   │
│   ├── services/                 # Business Logic Layer
│   │   ├── vehicleService.js     # Vehicle CRUD + status management
│   │   ├── driverService.js      # Driver CRUD + availability
│   │   ├── tripService.js        # Trip lifecycle management
│   │   ├── expenseService.js     # Expense logging + analytics
│   │   ├── maintenanceService.js # Maintenance tracking
│   │   └── dashboardService.js   # Analytics aggregation
│   │
│   ├── controllers/              # Request Handlers (HTTP → Service)
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── tripController.js
│   │   ├── expenseController.js
│   │   ├── maintenanceController.js
│   │   └── dashboardController.js
│   │
│   ├── routes/                   # Express Route Definitions
│   │   ├── index.js              # Route aggregator
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── tripRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   └── dashboardRoutes.js
│   │
│   ├── middleware/
│   │   ├── errorHandler.js       # Global error handling
│   │   └── requestLogger.js      # Request logging
│   │
│   ├── scripts/
│   │   └── initDb.js             # Database initialization
│   │
│   └── index.js                  # Express app entry point
│
├── .env.example                  # Environment template
├── package.json
└── README.md
```

### Service Layer Pattern

```javascript
// Example: tripService.js - Business Logic Encapsulation

const tripService = {
  /**
   * Create trip with automatic status management
   * - Validates vehicle/driver availability
   * - Sets vehicle status to 'On_Trip'
   * - Sets driver status to 'On_Trip'
   * - Captures start odometer from vehicle
   */
  async create(tripData, dispatcherId) {
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      
      // 1. Get vehicle's current odometer
      const vehicle = await vehicleService.getById(tripData.vehicle_id);
      const start_odometer = vehicle.current_odometer;
      
      // 2. Update vehicle status to On_Trip
      await client.query(
        `UPDATE vehicles SET status = 'On_Trip' WHERE id = $1`,
        [tripData.vehicle_id]
      );
      
      // 3. Update driver status to On_Trip
      await client.query(
        `UPDATE drivers SET status = 'On_Trip' WHERE id = $1`,
        [tripData.driver_id]
      );
      
      // 4. Insert trip record
      const result = await client.query(
        `INSERT INTO trips (...) VALUES (...) RETURNING *`
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
   * Complete trip with automatic cleanup
   * - Updates vehicle odometer
   * - Releases vehicle to 'Available'
   * - Releases driver to 'Available'
   * - Logs status change audit trail
   */
  async complete(tripId, userId) {
    // ... transaction-wrapped status update
  }
};
```

### Database Connection Pool

```javascript
// db/index.js - Connection Pool Configuration
const pool = new Pool({
  host: config.db.host,
  port: config.db.port,
  database: config.db.database,
  user: config.db.user,
  password: config.db.password,
  max: 20,                    // Maximum pool size
  idleTimeoutMillis: 30000,   // Close idle connections after 30s
  connectionTimeoutMillis: 2000, // Fail fast on connection issues
});
```

---

## 🎨 Frontend Architecture

### Directory Structure (Feature-Sliced Design)

```
frontend/src/
├── components/                   # Shared UI Components
│   ├── layout/
│   │   ├── MainLayout.tsx        # App shell with sidebar
│   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   └── Header.tsx            # Top header bar
│   └── ui/                       # Shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── table.tsx
│       └── ...
│
├── features/                     # Domain Modules
│   ├── auth/                     # Authentication
│   │   └── LoginPage.tsx
│   │
│   ├── dashboard/                # Command Center
│   │   ├── DashboardPage.tsx
│   │   ├── components/
│   │   │   ├── KPICards.tsx
│   │   │   └── RevenueChart.tsx
│   │   └── hooks/
│   │       └── useDashboardData.ts
│   │
│   ├── vehicles/                 # Vehicle Registry
│   │   ├── VehiclesPage.tsx
│   │   ├── components/
│   │   │   ├── VehicleTable.tsx
│   │   │   └── VehicleForm.tsx
│   │   └── hooks/
│   │       └── useVehicles.ts
│   │
│   ├── drivers/                  # Driver Management
│   │   ├── DriversPage.tsx
│   │   ├── components/
│   │   │   ├── DriverTable.tsx
│   │   │   └── SafetyScoreBadge.tsx
│   │   └── hooks/
│   │       └── useDrivers.ts
│   │
│   ├── trips/                    # Trip Dispatcher
│   │   ├── TripsPage.tsx
│   │   ├── components/
│   │   │   ├── TripTable.tsx
│   │   │   ├── TripForm.tsx
│   │   │   └── NewTripModal.tsx
│   │   └── hooks/
│   │       └── useTrips.ts
│   │
│   ├── map/                      # Real-time Fleet Map
│   │   ├── MapPage.tsx
│   │   ├── components/
│   │   │   ├── LeafletMap.tsx
│   │   │   └── VehicleList.tsx
│   │   └── hooks/
│   │       └── useMapVehicles.ts
│   │
│   ├── financials/               # Expense Management
│   │   └── ExpensesPage.tsx
│   │
│   └── maintenance/              # Maintenance Logs
│       └── MaintenancePage.tsx
│
├── mocks/                        # MSW Mock Server
│   ├── browser.ts                # MSW browser setup
│   ├── handlers.ts               # API route handlers
│   └── mockData.ts               # In-memory data store
│
├── routes/                       # TanStack Router
│   └── router.tsx                # Route definitions
│
├── lib/
│   ├── api.ts                    # Axios instance
│   └── utils.ts                  # Utility functions
│
├── types/
│   └── index.ts                  # Zod schemas + TypeScript types
│
└── main.tsx                      # App entry point
```

### State Management Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STATE MANAGEMENT FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React Query   │────▶│  Query Cache    │────▶│   Component     │
│   useQuery()    │     │  (5 min stale)  │     │   Re-render     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
         │
         │ HTTP Request
         ▼
┌─────────────────┐     ┌─────────────────┐
│     Axios       │────▶│  MSW (Dev) or   │
│   API Client    │     │  Backend (Prod) │
└─────────────────┘     └─────────────────┘

Mutations:
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  useMutation()  │────▶│ Optimistic      │────▶│  Cache          │
│  POST/PUT/DEL   │     │ Update          │     │  Invalidation   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Type Safety with Zod

```typescript
// types/index.ts - Runtime Schema Validation

import { z } from 'zod';

// Enums matching PostgreSQL ENUMs
export const VehicleCategory = z.enum([
  'Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck'
]);

export const VehicleStatus = z.enum([
  'Available', 'On_Trip', 'In_Shop', 'Retired'
]);

export const TripStatus = z.enum([
  'Draft', 'Unassigned', 'Dispatched', 'At_Pickup', 
  'In_Transit', 'Completed', 'Cancelled'
]);

// Vehicle Schema with full validation
export const VehicleSchema = z.object({
  id: z.string().uuid(),
  license_plate: z.string().min(1),
  category: VehicleCategory,
  capacity_kg: z.number().positive(),
  capacity_volume_cft: z.number().optional(),
  current_odometer: z.number().min(0),
  acquisition_cost: z.number().min(0),
  status: VehicleStatus,
  brand: z.string().optional(),
  manufacturing_year: z.number().min(1990).max(2100).optional(),
});

// TypeScript type inference
export type Vehicle = z.infer<typeof VehicleSchema>;
export type VehicleCategoryType = z.infer<typeof VehicleCategory>;
```

---

## 🔄 System Flow

### Trip Lifecycle State Machine

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           TRIP STATE MACHINE                                 │
└─────────────────────────────────────────────────────────────────────────────┘

    ┌─────────┐
    │  START  │
    └────┬────┘
         │
         ▼
    ┌─────────┐     No Vehicle/Driver     ┌─────────────┐
    │  Draft  │─────────────────────────▶│ Unassigned  │
    └────┬────┘                          └──────┬──────┘
         │                                      │
         │ Assign Vehicle + Driver              │ Assign Vehicle + Driver
         │                                      │
         ▼                                      ▼
    ┌─────────────────────────────────────────────────┐
    │                  Dispatched                      │
    │  • Vehicle.status → 'On_Trip'                   │
    │  • Driver.status → 'On_Trip'                    │
    │  • Trip.start_odometer ← Vehicle.current_odometer│
    └────────────────────────┬────────────────────────┘
                             │
                             │ Driver arrives at pickup
                             ▼
    ┌─────────────────────────────────────────────────┐
    │                  At_Pickup                       │
    │  • Timestamp logged for SLA tracking            │
    │  • GPS location captured                        │
    └────────────────────────┬────────────────────────┘
                             │
                             │ Cargo loaded, departs
                             ▼
    ┌─────────────────────────────────────────────────┐
    │                  In_Transit                      │
    │  • Real-time GPS tracking                       │
    │  • ETA calculations                             │
    └───────────────────┬─────────────────┬───────────┘
                        │                 │
            OTP Verified│                 │ Customer/Business cancels
                        ▼                 ▼
    ┌─────────────────────────┐     ┌─────────────────────────┐
    │       Completed          │     │       Cancelled          │
    │  • POD image uploaded    │     │  • Reason logged         │
    │  • End odometer captured │     │  • Vehicle → Available   │
    │  • Vehicle → Available   │     │  • Driver → Available    │
    │  • Driver → Available    │     │  • No revenue recorded   │
    │  • Revenue recorded      │     └─────────────────────────┘
    └─────────────────────────┘
```

### Expense Logging Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        EXPENSE LOGGING FLOW                                  │
└─────────────────────────────────────────────────────────────────────────────┘

    User selects expense category
              │
              ▼
    ┌─────────────────┐
    │  Category Type  │
    └────────┬────────┘
             │
    ┌────────┼────────┬────────────┬────────────┐
    │        │        │            │            │
    ▼        ▼        ▼            ▼            ▼
┌──────┐ ┌──────┐ ┌───────┐ ┌─────────┐ ┌───────────┐
│ Fuel │ │ Toll │ │ Fines │ │  Other  │ │Maintenance│
└──┬───┘ └──┬───┘ └───┬───┘ └────┬────┘ └─────┬─────┘
   │        │         │          │            │
   │        │         │          │            │
   ▼        ▼         ▼          ▼            ▼
┌──────────────────────────────────────┐  ┌─────────────────────────┐
│     Standard Expense Logging         │  │  SIDE EFFECT TRIGGERED  │
│  • Vehicle ID selected               │  │  • Vehicle.status →     │
│  • Cost entered                      │  │    'In_Shop'            │
│  • Optional: Trip ID linked          │  │  • Maintenance alert    │
│  • Invoice image uploaded            │  │    generated            │
└──────────────────────────────────────┘  └─────────────────────────┘
```

### Data Flow: Frontend ↔ Backend

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    REQUEST/RESPONSE DATA FLOW                                │
└─────────────────────────────────────────────────────────────────────────────┘

                          FRONTEND                                    BACKEND
┌───────────────────────────────────────────┐     ┌───────────────────────────────────────────┐
│                                           │     │                                           │
│  ┌─────────────────┐                      │     │      ┌─────────────────┐                  │
│  │   Component     │                      │     │      │     Routes      │                  │
│  │ TripForm.tsx    │                      │     │      │ tripRoutes.js   │                  │
│  └────────┬────────┘                      │     │      └────────┬────────┘                  │
│           │                               │     │               │                           │
│           │ useMutation()                 │     │               │                           │
│           ▼                               │     │               ▼                           │
│  ┌─────────────────┐                      │     │      ┌─────────────────┐                  │
│  │  TanStack Query │  POST /api/trips     │     │      │   Controller    │                  │
│  │  Mutation       │─────────────────────────────────▶│tripController.js│                  │
│  └─────────────────┘                      │     │      └────────┬────────┘                  │
│           │                               │     │               │                           │
│           │ onSuccess()                   │     │               │ await tripService.create()│
│           ▼                               │     │               ▼                           │
│  ┌─────────────────┐                      │     │      ┌─────────────────┐                  │
│  │  Query Cache    │  JSON Response       │     │      │    Service      │                  │
│  │  Invalidation   │◀─────────────────────────────────│tripService.js   │                  │
│  └─────────────────┘                      │     │      └────────┬────────┘                  │
│           │                               │     │               │                           │
│           │ Re-render                     │     │               │ SQL Transaction           │
│           ▼                               │     │               ▼                           │
│  ┌─────────────────┐                      │     │      ┌─────────────────┐                  │
│  │   TripTable     │                      │     │      │   PostgreSQL    │                  │
│  │   Updated UI    │                      │     │      │   Database      │                  │
│  └─────────────────┘                      │     │      └─────────────────┘                  │
│                                           │     │                                           │
└───────────────────────────────────────────┘     └───────────────────────────────────────────┘
```

---

## 📡 API Reference

### Endpoints Overview

| Resource | Method | Endpoint | Description |
|----------|--------|----------|-------------|
| **Health** | GET | `/api/health` | System health check |
| **Dashboard** | GET | `/api/dashboard/revenue-expenses` | 7-day revenue vs expenses |
| | GET | `/api/dashboard/overview` | KPI summary |
| | GET | `/api/dashboard/fleet-utilization` | Fleet utilization metrics |
| **Vehicles** | GET | `/api/vehicles` | List all vehicles |
| | GET | `/api/vehicles/:id` | Get vehicle by ID |
| | POST | `/api/vehicles` | Create vehicle |
| | PUT | `/api/vehicles/:id` | Update vehicle |
| | PATCH | `/api/vehicles/:id/status` | Update status only |
| **Drivers** | GET | `/api/drivers` | List all drivers |
| | GET | `/api/drivers/:id` | Get driver by ID |
| | POST | `/api/drivers` | Create driver |
| | PUT | `/api/drivers/:id` | Update driver |
| | PATCH | `/api/drivers/:id/status` | Update status only |
| **Trips** | GET | `/api/trips` | List all trips |
| | GET | `/api/trips/:id` | Get trip by ID |
| | POST | `/api/trips` | Create trip |
| | PUT | `/api/trips/:id` | Update trip |
| | PATCH | `/api/trips/:id/status` | Update status only |
| **Expenses** | GET | `/api/expenses` | List all expenses |
| | POST | `/api/expenses` | Log expense |
| **Maintenance** | GET | `/api/maintenance` | List maintenance logs |
| | POST | `/api/maintenance` | Create maintenance log |
| | PATCH | `/api/maintenance/:id/complete` | Complete maintenance |

### Request/Response Examples

#### Create Trip
```http
POST /api/trips
Content-Type: application/json
X-User-Id: 00000000-0000-0000-0000-000000000001

{
  "vehicle_id": "uuid-of-vehicle",
  "driver_id": "uuid-of-driver",
  "pickup_address": "123 Ameerpet, Hyderabad",
  "dropoff_address": "456 Gachibowli, Hyderabad",
  "pickup_lat": 17.4375,
  "pickup_lng": 78.4483,
  "dropoff_lat": 17.4401,
  "dropoff_lng": 78.3489,
  "cargo_weight_kg": 500,
  "estimated_distance_km": 15.5,
  "expected_revenue": 2500
}
```

#### Response
```json
{
  "id": "uuid-generated",
  "tracking_number": "TRP-A1B2C3D4",
  "status": "Dispatched",
  "receiver_otp": "123456",
  "start_odometer": 45000,
  "created_at": "2026-02-21T10:30:00Z"
}
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **PostgreSQL** >= 14 with PostGIS
- **npm** >= 9.x

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/POOJANGHETIYA/Odoo-X-GVP-Cognivia.git
cd Odoo-X-GVP-Cognivia

# 2. Setup Backend
cd backend
npm install
cp .env.example .env
# Edit .env with your PostgreSQL credentials
npm run db:init      # Initialize database
npm run dev          # Start backend (port 3000)

# 3. Setup Frontend (new terminal)
cd ../frontend
npm install
npm run dev          # Start frontend (port 5173)
```

### Environment Variables

#### Backend (.env)
```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetflow
DB_USER=postgres
DB_PASSWORD=your_password
CORS_ORIGIN=http://localhost:5173
```

---

## ⚖️ Business Rules Engine

### Trip Assignment Constraints

| Rule | Validation | Error |
|------|------------|-------|
| Vehicle Available | `vehicle.status === 'Available'` | Vehicle is not available |
| Driver Available | `driver.status === 'Available'` | Driver is not available |
| Capacity Check | `cargo_weight <= vehicle.capacity_kg` | Cargo exceeds vehicle capacity |
| License Match | `driver.license_class >= vehicle.category` | Driver not qualified |

### Automatic Status Transitions

```javascript
// On Trip Creation (with vehicle + driver assigned)
vehicle.status = 'On_Trip';
driver.status = 'On_Trip';
trip.start_odometer = vehicle.current_odometer;

// On Trip Completion
vehicle.status = 'Available';
driver.status = 'Available';
vehicle.current_odometer = trip.end_odometer;

// On Trip Cancellation
vehicle.status = 'Available';
driver.status = 'Available';

// On Maintenance Expense
vehicle.status = 'In_Shop';
```

---

## 📄 License

This project is developed as part of the **Odoo x GVP Cognivia Hackathon**.

---

<div align="center">

**Built with ❤️ by Team Cognivia**

![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?style=flat-square&logo=node.js)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=flat-square&logo=react)
![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=flat-square&logo=postgresql)
![TypeScript](https://img.shields.io/badge/Language-TypeScript-3178C6?style=flat-square&logo=typescript)

</div>
