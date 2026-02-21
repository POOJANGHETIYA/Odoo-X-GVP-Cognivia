# PRD: FleetFlow - Enterprise Logistics Management System (Frontend)

## 1. Project Overview & Context
*   **System Name:** FleetFlow
*   **Business Context:** A production-grade, rule-based digital hub for logistics fleet management, modeled after industry leaders like Porter. Designed specifically for the Indian market.
*   **Target Users:** Backoffice staff (Fleet Managers, Dispatchers, Safety Officers, Financial Analysts).
*   **Localization:**
    *   Currency: Indian Rupee (₹) formatted as `en-IN`.
    *   Metrics: Kilometers (km), Kilograms (kg), Cubic Feet (cft).
    *   Timezone: Indian Standard Time (IST).

## 2. Strict Technology Stack (2026 Standards)
**CRITICAL INSTRUCTION FOR AI:** Do not deviate from these libraries. Do not use legacy alternatives (e.g., do NOT use React Router, do NOT use plain JavaScript).
*   **Core:** React 19 + Vite (TypeScript Strict Mode).
*   **Routing:** TanStack Router (File-based, 100% type-safe routing).
*   **State & Data Fetching:** TanStack Query v5 (React Query) + Axios.
*   **Mocking (Phase 1 Backend):** MSW (Mock Service Worker v2). All API calls must be intercepted by MSW. No hardcoded arrays in UI components.
*   **Styling:** Tailwind CSS + Shadcn UI (using Lucide React icons).
*   **Forms & Validation:** React Hook Form + Zod.
*   **Charts:** Recharts.
*   **Date/Time:** `date-fns`.

## 3. Architecture: Feature-Sliced Design
The codebase must strictly follow this directory structure to prevent spaghetti code:
```text
src/
├── components/      # UI components (Shadcn tables, buttons, dialogs, cards)
├── features/        # Isolated business logic domains
│   ├── auth/        # Login screen, RBAC Context Provider
│   ├── dashboard/   # Command center KPIs and charts
│   ├── vehicles/    # Vehicle registry CRUD
│   ├── drivers/     # Driver profiles & compliance
│   ├── trips/       # Dispatcher workflow, Kanban/Tables
│   └── financials/  # Expenses and ROI tracking
├── mocks/           # MSW handlers.ts, data.ts, browser.ts
├── routes/          # TanStack Router file-based route definitions
├── lib/             # Axios instance, utility functions (cn, currency formatter)
└── types/           # Global TypeScript interfaces (Zod inferred types)
```

## 4. UI/UX Design System Rules
*   **Theme:** Professional enterprise dashboard (Slate/Zinc neutral backgrounds, Indigo/Blue primary actions).
*   **Status Pills (Strict Color Codes):**
    *   *Green (Success):* `Available`, `Completed`, `On_Duty`
    *   *Yellow/Orange (Warning):* `On_Trip`, `In_Transit`, `At_Pickup`
    *   *Red (Critical):* `In_Shop`, `Suspended`, `Cancelled`, `Retired`
    *   *Gray (Neutral):* `Draft`, `Unassigned`, `Off_Duty`
*   **Tables:** Use Shadcn `DataTable`. Must include pagination and search/filter inputs for at least the primary identifier (e.g., License Plate, Tracking Number).

## 5. Mock Data Models (TypeScript/Zod Schemas)
The UI forms and MSW mock database must adhere strictly to these data shapes based on our PostGIS/PostgreSQL schema:

*   **Vehicle:** `id`, `license_plate`, `category` ('Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck'), `capacity_kg`, `current_odometer`, `acquisition_cost`, `status`.
*   **Driver:** `id`, `full_name`, `phone_number` (format: +91-XXXXXXXXXX), `license_number`, `license_class` (matches vehicle categories), `license_expiry` (YYYY-MM-DD), `safety_score` (0-100), `status`.
*   **Trip:** `id`, `tracking_number` (TRP-XXXXXXXX), `vehicle_id`, `driver_id`, `pickup_address`, `dropoff_address`, `cargo_weight_kg`, `expected_revenue`, `start_odometer`, `end_odometer`, `status` ('Draft', 'Unassigned', 'Dispatched', 'At_Pickup', 'In_Transit', 'Completed', 'Cancelled'), `receiver_otp` (6-digits).
*   **Expense:** `id`, `vehicle_id`, `category` ('Fuel', 'Maintenance', 'Toll', 'Fines', 'Other'), `cost`, `logged_at`.

## 6. Core Pages & Feature Specifications

### A. Layout Shell (`/__root.tsx`)
*   Persistent Left Sidebar navigation: Dashboard, Vehicles, Drivers, Trips, Financials.
*   Top Header: Shows mock logged-in user ("Dispatcher Admin").

### B. Command Center (`/`)
*   **Top KPIs:**
    1. Active Fleet (Count of vehicles `status === 'On_Trip'`)
    2. Maintenance Alerts (Count of vehicles `status === 'In_Shop'`)
    3. Idle Fleet (Count of vehicles `status === 'Available'`)
    4. Pending Trips (Count of trips `status === 'Unassigned'`)
*   **Charts:** Recharts bar chart showing mock Revenue vs Expenses for the last 7 days.
*   **SLA Warnings:** A small table highlighting any trip in `At_Pickup` status for more than 2 hours.

### C. Vehicle Registry (`/vehicles`)
*   **View:** Shadcn Data Table of all vehicles.
*   **Action:** "Add Vehicle" Modal.
*   **Validation:** `capacity_kg` > 0, `acquisition_cost` > 0, `current_odometer` >= 0.

### D. Driver Management (`/drivers`)
*   **View:** Shadcn Data Table.
*   **Logic:** Highlight `license_expiry` in RED if the date is before today.
*   **Visual:** Show `safety_score` as a colored progress bar (Green > 80, Yellow 50-80, Red < 50).

### E. Trip Dispatcher (`/trips`)
*   **View:** Data table of trips.
*   **Action:** "Create Trip" Modal.
*   **CRITICAL BUSINESS LOGIC (Enforce in Zod Schema & Form):**
    1. Only show vehicles where `status === 'Available'`.
    2. Only show drivers where `status === 'Available'`.
    3. `cargo_weight_kg` MUST be `<= selected_vehicle.capacity_kg`. Form blocks submission if overweight.
    4. `driver.license_class` MUST be capable of driving the `selected_vehicle.category`.

### F. Trip Execution & PoD (`/trips/$tripId`)
*   **View:** Detailed view of a specific trip.
*   **Action:** "Update Status" buttons (Dispatched -> At Pickup -> In Transit -> Completed).
*   **Action:** "Mark Completed". Opens a modal demanding:
    1. `end_odometer` (Validation: MUST be `>= start_odometer`).
    2. `receiver_otp` (Must be exactly 6 digits).

### G. Financials (`/financials`)
*   **Action:** "Log Expense" Modal (Select Vehicle, Category, Amount).
*   **Logic:** If Expense Category is `Maintenance`, hitting submit should trigger a mutation that automatically sets that Vehicle's status to `In_Shop` in the MSW mock database.
*   **View:** Table showing Vehicle ROI: `(Total Trip Revenue - Total Expenses) / Acquisition Cost`.

## 7. AI Implementation Steps (Start Here)
1. Initialize Vite React TypeScript project.
2. Install dependencies: Tailwind, Shadcn, TanStack Router, TanStack Query, React Hook Form, Zod, Lucide, Recharts, MSW, Axios.
3. Setup `src/types/index.ts` containing the Zod schemas and inferred TypeScript types.
4. Setup `src/mocks/data.ts` with initial mock data arrays and `src/mocks/handlers.ts` to intercept standard REST API calls (GET/POST/PUT) and mutate the arrays in memory.
5. Setup the TanStack Router file structure and build the `__root.tsx` layout.
6. Build out the pages one by one, using React Query to fetch data from the MSW handlers.

***

### Your Next Step

Now that you have the exact PRD, here is the command you need to run in your terminal to create the correct TypeScript foundation (since your previous one was plain JavaScript). Run this in your root folder:

```bash
npm create vite@latest frontend -- --template react-ts
```

Once that is done, put the `prd.md` inside that new `frontend` folder, open your AI tool (Cursor/Copilot), and say:
**"Read the prd.md file. Follow the AI Implementation Steps (Step 7) exactly. Start by installing the dependencies."**

Let me know when the AI finishes Step 4 (the mock DB setup) and I will review it for you to ensure it didn't hallucinate!