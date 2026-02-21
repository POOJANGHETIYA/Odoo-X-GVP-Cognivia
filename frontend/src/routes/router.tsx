import {
    createRouter,
    createRoute,
    createRootRouteWithContext,
    redirect,
    Outlet,
} from '@tanstack/react-router';
import { MainLayout } from '../components/layout/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { VehiclesPage } from '../features/vehicles/VehiclesPage';
import { TripsPage } from '../features/trips/TripsPage';
import { DriversPage } from '../features/drivers/DriversPage';
import type { AuthContextType } from '../features/auth/AuthContext';

// -----------------------------------------------------------
// Router context (carries the auth state)
// -----------------------------------------------------------
interface RouterContext {
    auth: AuthContextType;
}

// -----------------------------------------------------------
// Placeholder for pages not yet implemented
// -----------------------------------------------------------
function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 gap-2">
            <p className="text-lg font-semibold">{title}</p>
            <p className="text-sm">Coming soon…</p>
        </div>
    );
}

// -----------------------------------------------------------
// Routes
// -----------------------------------------------------------
const rootRoute = createRootRouteWithContext<RouterContext>()();

// Login route (public)
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/login',
    component: LoginPage,
    beforeLoad: ({ context }) => {
        if (context.auth.isAuthenticated) {
            throw redirect({ to: '/' });
        }
    },
});

// Auth-guarded layout route wrapper
function ProtectedLayout() {
    return (
        <MainLayout>
            <Outlet />
        </MainLayout>
    );
}

const protectedLayoutRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'protected',
    component: ProtectedLayout,
    beforeLoad: ({ context, location }) => {
        if (!context.auth.isAuthenticated) {
            throw redirect({ to: '/login', search: { redirect: location.href } });
        }
    },
});

// Dashboard
const dashboardRoute = createRoute({
    getParentRoute: () => protectedLayoutRoute,
    path: '/',
    component: DashboardPage,
});

// Vehicles Registry
const vehiclesRoute = createRoute({
    getParentRoute: () => protectedLayoutRoute,
    path: '/vehicles',
    component: VehiclesPage,
});

// Trips
const tripsRoute = createRoute({
    getParentRoute: () => protectedLayoutRoute,
    path: '/trips',
    component: TripsPage,
});

// Drivers
const driversRoute = createRoute({
    getParentRoute: () => protectedLayoutRoute,
    path: '/drivers',
    component: DriversPage,
});

// Financials (placeholder)
const financialsRoute = createRoute({
    getParentRoute: () => protectedLayoutRoute,
    path: '/financials',
    component: () => <PlaceholderPage title="Financial Operations" />,
});

// -----------------------------------------------------------
// Route tree & router
// -----------------------------------------------------------
const routeTree = rootRoute.addChildren([
    loginRoute,
    protectedLayoutRoute.addChildren([
        dashboardRoute,
        vehiclesRoute,
        tripsRoute,
        driversRoute,
        financialsRoute,
    ]),
]);

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!,
    },
});

// Register router types globally
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
