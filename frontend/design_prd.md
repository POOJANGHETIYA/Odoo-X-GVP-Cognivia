# DESIGN PRD: FleetFlow UI/UX Overhaul (Enterprise SaaS Standard)

## 1. Objective
Refactor the existing FleetFlow UI to meet 2026 "Stripe-tier" enterprise design standards. The UI must look premium, crisp, and highly functional for Indian logistics operations. 
**CRITICAL RULE:** Do NOT alter the underlying state management (TanStack Query), routing (TanStack Router), or MSW mock data logic. Only modify the Tailwind classes, Shadcn component configurations, and JSX layouts.

## 2. Global Design Tokens & Theming
*   **Base Theme:** Light mode by default, strictly using the `Zinc` color palette for neutrals. It provides a cooler, more professional slate look than default gray.
*   **Primary Accent:** `Indigo` (e.g., `bg-indigo-600` for primary buttons). It signifies trust and technology.
*   **Border Radius:** Use `rounded-lg` (0.5rem) for cards and modals, `rounded-md` (0.375rem) for buttons and inputs. Do not mix sharp and heavily rounded corners.
*   **Borders:** All borders must be subtle. Use `border-zinc-200` for light mode.
*   **Shadows & Depth:** 
    *   Cards/Panels: `shadow-sm border border-zinc-200`. No heavy drop shadows.
    *   Modals/Popovers: `shadow-xl border border-zinc-200`.

## 3. Typography (The Secret to Premium UI)
*   **Font Family:** Use `Inter` or `Geist` (Standard for modern SaaS).
*   **Tabular Numbers (Crucial):** Every single number in the app (Odometer, ₹ Revenue, Weights, KPI counts) MUST use the Tailwind class `tabular-nums` and `tracking-tight`. This ensures numbers align perfectly vertically in tables and don't "jiggle" when updating.
*   **Text Hierarchy:**
    *   Page Titles: `text-2xl font-semibold tracking-tight text-zinc-900`
    *   Section Headers: `text-sm font-medium tracking-wide text-zinc-500 uppercase`
    *   Body Text: `text-sm text-zinc-700`
    *   Muted Text (Addresses, timestamps): `text-xs text-zinc-500`

## 4. Component-Level Overhaul Rules

### A. Layout Shell (Sidebar & Header)
*   **Sidebar:** 
    *   Background: `bg-zinc-50 border-r border-zinc-200`.
    *   Active State: When a nav item is active, it must have `bg-white text-indigo-600 border border-zinc-200 shadow-sm`.
    *   Hover State: `hover:bg-zinc-100 text-zinc-700 transition-colors`.
*   **Top Header:** 
    *   Must be sticky with a glassmorphism effect: `sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200`.
    *   Include a "Global Search" mock input (CMD+K styling: `<kbd>` tags for the shortcut).

### B. Dashboard & KPI Cards
*   Do not just put numbers in boxes.
*   **Card Design:** `bg-white rounded-lg border border-zinc-200 shadow-sm p-5`.
*   **Metric Display:** 
    *   Title: `text-sm font-medium text-zinc-500`.
    *   Value: `text-3xl font-bold text-zinc-900 tabular-nums`.
    *   Trend Indicator: Add a small pill next to the number (e.g., `<span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">+12% from last week</span>`).

### C. Data Tables (The Core of the App)
Logistics apps live and die by their tables. They must be dense but readable.
*   **Table Header:** `bg-zinc-50/50`. Text should be `text-xs font-medium text-zinc-500 uppercase tracking-wider`.
*   **Row Hover:** Every row must have `hover:bg-zinc-50 transition-colors cursor-pointer`.
*   **Empty States:** If a table has no data, DO NOT just show a blank table. Create a beautiful empty state component: A faded Lucide icon (e.g., `Inbox`), a semi-bold title ("No trips found"), and a muted description.
*   **Alignment:** 
    *   Text (Names, Plates) -> Left aligned.
    *   Numbers (₹ Revenue, km, kg) -> Right aligned. (Crucial for financial readability).

### D. Status Badges & Pills
Do not use generic background colors. Use highly specific, low-opacity backgrounds with high-opacity text.
*   **Success (Completed/Available):** `bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20`
*   **Warning (On Trip/In Transit):** `bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20`
*   **Critical (In Shop/Suspended):** `bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10`
*   **Neutral (Draft/Off Duty):** `bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10`
*   *Font:* `text-xs font-medium px-2 py-1 rounded-md` (Not fully rounded).

### E. Forms, Modals & Inputs
*   **Inputs:** `bg-white border-zinc-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-shadow`.
*   **Form Layout:** Use a two-column grid for forms with more than 4 fields to save vertical space.
*   **Primary Button:** `bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium`.
*   **Secondary Button:** `bg-white border border-zinc-200 text-zinc-700 hover:bg-zinc-50`.
*   **Loading States:** When a button is clicked, it must disable and show a `LucideLoader2 className="animate-spin"` inside the button. Do not freeze the UI without feedback.

## 5. Micro-Interactions & UX Polish
*   **Skeleton Loaders:** Replace all "Loading..." text with Shadcn `<Skeleton />` components. A table should show 5 rows of shimmering skeletons while TanStack Query is fetching.
*   **Indian Formatting:** Ensure every financial value uses `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })`. Note: Format to 0 decimals for clean UI unless dealing with exact fuel costs.
*   **Tooltips:** Wrap truncated text (like long addresses) in Shadcn Tooltips. 

## 6. Execution Instructions for AI
1.  **Global Audit:** Open `tailwind.config.js` and ensure the Zinc color palette is the base.
2.  **Layout Refactor:** Rewrite `__root.tsx` to implement the glassmorphism header and the sticky sidebar with the new active/hover states.
3.  **Component Refactor:** Go file by file (Dashboard -> Vehicles -> Drivers -> Trips). Apply the `tabular-nums` to all metrics. Implement the strict Status Badge styling.
4.  **Table Polish:** Ensure all numerical columns in Shadcn DataTables are right-aligned. Add Skeleton loaders for `isLoading` states from React Query. 
5.  **Empty States:** Create a reusable `<EmptyState />` component and apply it to all tables.

