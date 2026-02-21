# FleetFlow Backend API

Node.js/Express REST API for the FleetFlow fleet management system.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ with PostGIS extension
- npm or yarn

### Installation

1. **Install dependencies**
   ```bash
   cd backend
   npm install
   ```

2. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Initialize database**
   ```bash
   npm run db:init
   ```

4. **Start the server**
   ```bash
   # Development (with auto-reload)
   npm run dev

   # Production
   npm start
   ```

The server will start at `http://localhost:3000`

## 📁 Project Structure

```
backend/
├── src/
│   ├── config/           # Configuration
│   │   └── index.js      # Environment config
│   ├── controllers/      # Request handlers
│   │   ├── dashboardController.js
│   │   ├── driverController.js
│   │   ├── expenseController.js
│   │   ├── maintenanceController.js
│   │   ├── tripController.js
│   │   └── vehicleController.js
│   ├── db/               # Database connection
│   │   └── index.js      # PostgreSQL pool
│   ├── middleware/       # Express middleware
│   │   ├── errorHandler.js
│   │   └── requestLogger.js
│   ├── routes/           # API routes
│   │   ├── index.js
│   │   ├── dashboardRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── expenseRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── tripRoutes.js
│   │   └── vehicleRoutes.js
│   ├── services/         # Business logic
│   │   ├── dashboardService.js
│   │   ├── driverService.js
│   │   ├── expenseService.js
│   │   ├── maintenanceService.js
│   │   ├── tripService.js
│   │   └── vehicleService.js
│   ├── scripts/          # Utility scripts
│   │   └── initDb.js     # Database initialization
│   └── index.js          # Entry point
├── .env.example          # Environment template
├── .gitignore
├── package.json
└── README.md
```

## 🔌 API Endpoints

### Health Check
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/health` | Health check |

### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard/revenue-expenses` | Revenue vs expenses (7 days) |
| GET | `/api/dashboard/overview` | Overview statistics |
| GET | `/api/dashboard/recent-activity` | Recent activity |
| GET | `/api/dashboard/fleet-utilization` | Fleet utilization by category |
| GET | `/api/dashboard/expense-breakdown` | Expense breakdown by category |

### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/vehicles` | List all vehicles |
| GET | `/api/vehicles/:id` | Get vehicle by ID |
| POST | `/api/vehicles` | Create vehicle |
| PUT | `/api/vehicles/:id` | Update vehicle |
| PATCH | `/api/vehicles/:id/status` | Update vehicle status |
| GET | `/api/vehicles/stats/by-status` | Vehicle count by status |

### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/drivers` | List all drivers |
| GET | `/api/drivers/:id` | Get driver by ID |
| POST | `/api/drivers` | Create driver |
| PUT | `/api/drivers/:id` | Update driver |
| PATCH | `/api/drivers/:id/status` | Update driver status |
| GET | `/api/drivers/stats/by-status` | Driver count by status |
| GET | `/api/drivers/available/:category` | Available drivers for category |

### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/trips` | List all trips |
| GET | `/api/trips/:id` | Get trip by ID |
| POST | `/api/trips` | Create trip |
| PUT | `/api/trips/:id` | Update trip |
| PATCH | `/api/trips/:id/status` | Update trip status |
| GET | `/api/trips/stats/by-status` | Trip count by status |

### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/expenses` | List all expenses |
| GET | `/api/expenses/:id` | Get expense by ID |
| POST | `/api/expenses` | Create expense |
| GET | `/api/expenses/stats/by-category` | Expenses by category |
| GET | `/api/expenses/vehicle/:vehicleId` | Expenses by vehicle |

### Maintenance
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/maintenance` | List maintenance logs |
| GET | `/api/maintenance/:id` | Get log by ID |
| POST | `/api/maintenance` | Create maintenance log |
| PATCH | `/api/maintenance/:id/complete` | Complete maintenance |
| GET | `/api/maintenance/vehicles-in-shop` | Vehicles in maintenance |

## 📊 Data Models

### Vehicle Categories
- `Bike`
- `3_Wheeler`
- `Mini_Truck`
- `Medium_Truck`
- `Heavy_Truck`

### Vehicle Status
- `Available`
- `On_Trip`
- `In_Shop`
- `Retired`

### Driver Status
- `Off_Duty`
- `Available`
- `On_Trip`
- `Suspended`

### Trip Status
- `Draft`
- `Unassigned`
- `Dispatched`
- `At_Pickup`
- `In_Transit`
- `Completed`
- `Cancelled`

### Expense Categories
- `Fuel`
- `Maintenance`
- `Toll`
- `Fines`
- `Other`

## 🔐 Headers

For authenticated requests, include:
```
X-User-Id: <user-uuid>
```

## 📝 Example Requests

### Create Vehicle
```bash
curl -X POST http://localhost:3000/api/vehicles \
  -H "Content-Type: application/json" \
  -d '{
    "license_plate": "TN-01-XX-1234",
    "category": "Medium_Truck",
    "capacity_kg": 5000,
    "current_odometer": 10000,
    "acquisition_cost": 1500000,
    "brand": "Tata",
    "manufacturing_year": 2023
  }'
```

### Create Trip
```bash
curl -X POST http://localhost:3000/api/trips \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{
    "vehicle_id": "<vehicle-uuid>",
    "driver_id": "<driver-uuid>",
    "pickup_address": "123 Main St, Hyderabad",
    "dropoff_address": "456 Park Ave, Secunderabad",
    "cargo_weight_kg": 1000,
    "estimated_distance_km": 25,
    "expected_revenue": 5000
  }'
```

### Update Trip Status
```bash
curl -X PATCH http://localhost:3000/api/trips/<trip-id>/status \
  -H "Content-Type: application/json" \
  -H "X-User-Id: 00000000-0000-0000-0000-000000000001" \
  -d '{"status": "Completed"}'
```

## 🔧 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `NODE_ENV` | Environment | `development` |
| `DB_HOST` | PostgreSQL host | `localhost` |
| `DB_PORT` | PostgreSQL port | `5432` |
| `DB_NAME` | Database name | `fleetflow` |
| `DB_USER` | Database user | `postgres` |
| `DB_PASSWORD` | Database password | - |
| `CORS_ORIGIN` | Allowed CORS origin | `http://localhost:5173` |

## 🧪 Development

### Scripts
```bash
npm start      # Start production server
npm run dev    # Start with nodemon (auto-reload)
npm run db:init # Initialize database and seed data
```

### Database Setup
1. Create PostgreSQL database: `createdb fleetflow`
2. Enable PostGIS: `CREATE EXTENSION postgis;`
3. Run `npm run db:init` to create tables and seed data

## 📄 License

ISC
