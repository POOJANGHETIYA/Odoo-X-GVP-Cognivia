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
import { MaintenancePage } from '../features/maintenance/MaintenancePage';
import { VehiclesPage } from '../features/vehicles/VehiclesPage';
import { TripsPage } from '../features/trips/TripsPage';
import { DriversPage } from '../features/drivers/DriversPage';
import type { AuthContextType } from '../features/auth/AuthContext';

interface RouterContext {
    auth: {
        isAuthenticated: boolean;
    };
}

const rootRoute = createRootRouteWithContext<RouterContext>()({
    component: () => <Outlet />,
});

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

const appRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'app',
    component: () => (
        <MainLayout>
            <Outlet />
        </MainLayout>
    ),
    beforeLoad: ({ context }) => {
        if (!context.auth.isAuthenticated) {
            throw redirect({ to: '/login' });
        }
    },
});

export const dashboardRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/',
    component: DashboardPage,
});

const PlaceholderPage = ({ title }: { title: string }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px] p-8 flex flex-col justify-center items-center text-center">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">{title}</h1>
        <p className="text-slate-500 max-w-sm">This module is scheduled for a future sprint. Stay tuned!</p>
    </div>
);

const vehiclesRoute = createRoute({
    getParentRoute: () => appRoute,
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
    getParentRoute: () => appRoute,
    path: '/drivers',
    component: DriversPage,
});

const tripsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/trips',
    component: TripsPage,
});

const financialsRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/financials',
    component: () => <PlaceholderPage title="Financial Operations" />,
});

const maintenanceRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/maintenance',
    component: MaintenancePage,
});

const routeTree = rootRoute.addChildren([
    loginRoute,
    appRoute.addChildren([
        dashboardRoute,
        vehiclesRoute,
        driversRoute,
        tripsRoute,
        financialsRoute,
        maintenanceRoute,
    ]),
]);

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!, // This will be provided at the highest level
    },
});

declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router;
    }
}
