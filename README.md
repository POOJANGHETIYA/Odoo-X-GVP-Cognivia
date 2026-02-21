# FleetFlow - Enterprise Logistics Management System

<div align="center">

![FleetFlow](https://img.shields.io/badge/FleetFlow-Logistics%20Management-10b981?style=for-the-badge&logo=truck&logoColor=white)
![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-3178C6?style=flat-square&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5.1-646CFF?style=flat-square&logo=vite)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=flat-square&logo=tailwindcss)

**A production-grade, rule-based digital hub for logistics fleet management**  
*Modeled after industry leaders like Porter, designed for the Indian market*

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Features](#-features)
- [Database Schema](#-database-schema)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [API Reference](#-api-reference)
- [Business Logic Rules](#-business-logic-rules)
- [Contributing](#-contributing)

---

## 🎯 Overview

FleetFlow is an enterprise-grade logistics management system designed for backoffice operations including:

- **Fleet Managers** - Monitor vehicle status, maintenance, and utilization
- **Dispatchers** - Create and manage trip assignments with real-time status tracking
- **Safety Officers** - Track driver compliance and safety scores
- **Financial Analysts** - Monitor expenses, revenue, and ROI metrics

### Localization (India)
| Setting | Value |
|---------|-------|
| Currency | Indian Rupee (₹) - `en-IN` format |
| Distance | Kilometers (km) |
| Weight | Kilograms (kg) |
| Volume | Cubic Feet (cft) |
| Timezone | Indian Standard Time (IST) |

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose | Version |
|------------|---------|---------|
| **React** | UI Framework | 18.2 |
| **TypeScript** | Type Safety | 5.2 |
| **Vite** | Build Tool | 5.1 |
| **TanStack Router** | Type-safe Routing | 1.161 |
| **TanStack Query** | Server State Management | 5.90 |
| **Tailwind CSS** | Utility-first Styling | 3.4 |
| **Shadcn/ui** | UI Component Library | Latest |
| **React Hook Form** | Form Management | 7.71 |
| **Zod** | Schema Validation | 4.3 |
| **Recharts** | Data Visualization | 3.7 |
| **Lucide React** | Icon Library | 0.575 |
| **MSW** | API Mocking | 2.12 |
| **Axios** | HTTP Client | 1.13 |
| **date-fns** | Date Utilities | 4.1 |

### Database
| Technology | Purpose |
|------------|---------|
| **PostgreSQL** | Primary Database |
| **PostGIS** | Geospatial Extensions |
| **UUID** | Primary Key Generation |

---

## 🏗 Architecture

### Feature-Sliced Design Pattern

```
src/
├── components/          # Shared UI components
│   └── layout/          # App shell (Sidebar, MainLayout, Header)
├── features/            # Business domain modules
│   ├── auth/            # Authentication & RBAC
│   ├── dashboard/       # Command center KPIs & charts
│   ├── drivers/         # Driver management & compliance
│   ├── trips/           # Trip dispatcher workflow
│   ├── vehicle-registry/# Vehicle CRUD operations
│   └── financials/      # Expense tracking & ROI
├── mocks/               # MSW mock server
│   ├── handlers.ts      # API route handlers
│   ├── data.ts          # Mock data store
│   └── browser.ts       # MSW browser setup
├── routes/              # TanStack Router configuration
├── lib/                 # Utilities (API client, helpers)
└── types/               # TypeScript/Zod schemas
```

### Data Flow
```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   React     │────▶│  TanStack   │────▶│    MSW      │
│ Components  │     │   Query     │     │  Handlers   │
└─────────────┘     └─────────────┘     └─────────────┘
       │                   │                   │
       ▼                   ▼                   ▼
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│ React Hook  │     │   Axios     │     │  Mock Data  │
│    Form     │     │  Instance   │     │   Store     │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## ✨ Features

### 🎛 Command Center Dashboard
- **Real-time KPIs**: Active Fleet, Maintenance Alerts, Idle Fleet, Pending Trips
- **Revenue vs Expenses Chart**: 7-day trend visualization
- **SLA Warnings**: Trips stuck at pickup for >2 hours

### 🚗 Vehicle Registry
- Full CRUD operations with validation
- Status tracking: `Available` | `On_Trip` | `In_Shop` | `Retired`
- Categories: Bike, 3-Wheeler, Mini Truck, Medium Truck, Heavy Truck
- Capacity management (weight & volume)

### 👷 Driver Management
- Driver profiles with license tracking
- Safety score visualization (0-100 scale)
- License expiry alerts
- Status management: `Available` | `On_Duty` | `Off_Duty` | `Suspended`

### 📦 Trip Dispatcher
- Trip creation with intelligent vehicle/driver matching
- Status workflow: `Draft` → `Unassigned` → `Dispatched` → `At_Pickup` → `In_Transit` → `Completed`
- Cargo weight validation against vehicle capacity
- OTP-based delivery verification

### 💰 Financial Operations
- Expense logging by category (Fuel, Maintenance, Toll, Fines, Other)
- Vehicle ROI calculation
- Automated status updates (Maintenance → Vehicle `In_Shop`)

---

## 🗄 Database Schema

### Entity Relationship

```
┌──────────────┐       ┌──────────────┐       ┌──────────────┐
│   app_users  │       │   vehicles   │       │   drivers    │
├──────────────┤       ├──────────────┤       ├──────────────┤
│ id (PK)      │       │ id (PK)      │       │ id (PK)      │
│ email        │       │ license_plate│       │ full_name    │
│ full_name    │       │ category     │       │ phone_number │
│ role         │       │ capacity_kg  │       │ license_class│
│ is_active    │       │ status       │       │ safety_score │
└──────────────┘       └──────────────┘       └──────────────┘
        │                     │                      │
        │                     │                      │
        ▼                     ▼                      ▼
┌─────────────────────────────────────────────────────────────┐
│                          trips                               │
├─────────────────────────────────────────────────────────────┤
│ id (PK) │ tracking_number │ vehicle_id (FK) │ driver_id (FK)│
│ dispatcher_id (FK) │ pickup_location │ dropoff_location     │
│ cargo_weight_kg │ expected_revenue │ status                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────┐    ┌──────────────────┐
│ trip_status_logs │    │     expenses     │
├──────────────────┤    ├──────────────────┤
│ trip_id (FK)     │    │ vehicle_id (FK)  │
│ changed_by (FK)  │    │ trip_id (FK)     │
│ previous_status  │    │ category         │
│ new_status       │    │ cost             │
└──────────────────┘    └──────────────────┘
```

### Enums

| Enum | Values |
|------|--------|
| `user_role` | Admin, Manager, Dispatcher, SafetyOfficer, Finance |
| `vehicle_category` | Bike, 3_Wheeler, Mini_Truck, Medium_Truck, Heavy_Truck |
| `vehicle_status` | Available, On_Trip, In_Shop, Retired |
| `driver_status` | Off_Duty, Available, On_Trip, Suspended |
| `trip_status` | Draft, Unassigned, Dispatched, At_Pickup, In_Transit, Completed, Cancelled |
| `expense_category` | Fuel, Maintenance, Toll, Fines, Other |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18.x
- **npm** >= 9.x
- **Git**

### Installation

```bash
# Clone the repository
git clone https://github.com/POOJANGHETIYA/Odoo-X-GVP-Cognivia.git

# Navigate to project directory
cd Odoo-X-GVP-Cognivia

# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check and build for production |
| `npm run lint` | Run ESLint checks |
| `npm run preview` | Preview production build |

### Environment Setup

The application uses MSW (Mock Service Worker) for API mocking during development. No additional environment configuration required.

---

## 📁 Project Structure

```
Odoo-X-GVP-Cognivia/
├── backend/                    # Backend services (future)
├── frontend/                   # React application
│   ├── public/                 # Static assets
│   │   └── mockServiceWorker.js
│   ├── src/
│   │   ├── components/
│   │   │   └── layout/
│   │   │       ├── MainLayout.tsx
│   │   │       ├── Sidebar.tsx
│   │   │       └── Header.tsx
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   │   └── LoginPage.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── DashboardPage.tsx
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   ├── drivers/
│   │   │   │   ├── DriversPage.tsx
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   ├── trips/
│   │   │   │   ├── TripsPage.tsx
│   │   │   │   ├── components/
│   │   │   │   └── hooks/
│   │   │   └── vehicle-registry/
│   │   ├── lib/
│   │   │   └── api.ts
│   │   ├── mocks/
│   │   │   ├── browser.ts
│   │   │   ├── data.ts
│   │   │   └── handlers.ts
│   │   ├── routes/
│   │   │   └── router.tsx
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── main.tsx
│   ├── package.json
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
├── database.sql                # PostgreSQL schema
└── README.md
```

---

## 📡 API Reference

### Base URL
```
/api
```

### Endpoints

#### Vehicles
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/vehicles` | List all vehicles |
| `POST` | `/api/vehicles` | Create new vehicle |
| `PUT` | `/api/vehicles/:id` | Update vehicle |

#### Drivers
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/drivers` | List all drivers |
| `POST` | `/api/drivers` | Create new driver |
| `PUT` | `/api/drivers/:id` | Update driver |

#### Trips
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/trips` | List all trips |
| `POST` | `/api/trips` | Create new trip |
| `PUT` | `/api/trips/:id` | Update trip status |

#### Dashboard
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/dashboard/revenue-expenses` | 7-day revenue vs expenses |

#### Expenses
| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/expenses` | List all expenses |
| `POST` | `/api/expenses` | Log new expense |

---

## ⚖️ Business Logic Rules

### Trip Creation Constraints
1. **Vehicle Availability**: Only vehicles with `status === 'Available'` can be assigned
2. **Driver Availability**: Only drivers with `status === 'Available'` can be assigned
3. **Capacity Check**: `cargo_weight_kg` must be `≤ vehicle.capacity_kg`
4. **License Matching**: `driver.license_class` must be capable of driving `vehicle.category`

### Status Transitions

```
Trip Lifecycle:
Draft → Unassigned → Dispatched → At_Pickup → In_Transit → Completed
                                                      ↓
                                                 Cancelled
```

### Automatic Status Updates
- Logging a `Maintenance` expense automatically sets vehicle status to `In_Shop`
- Completing a trip releases vehicle and driver back to `Available`

---

## 🎨 UI Design System

### Color Palette

| Status Type | Colors | Examples |
|-------------|--------|----------|
| **Success** | Green (`#10b981`) | Available, Completed, On_Duty |
| **Warning** | Amber/Orange | On_Trip, In_Transit, At_Pickup |
| **Critical** | Red | In_Shop, Suspended, Cancelled |
| **Neutral** | Slate/Gray | Draft, Unassigned, Off_Duty |

### Component Library
- **Tables**: Paginated data tables with search/filter
- **Forms**: React Hook Form with Zod validation
- **Modals**: Dialog components for CRUD operations
- **Charts**: Recharts for data visualization

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is part of **Odoo x GVP Cognivia Hackathon**.

---

<div align="center">

**Built with ❤️ by Team Cognivia**

![Made with React](https://img.shields.io/badge/Made%20with-React-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Styled%20with-Tailwind-06B6D4?style=flat-square&logo=tailwindcss)

</div>