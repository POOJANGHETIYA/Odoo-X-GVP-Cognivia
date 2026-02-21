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
import { VehiclesPage } from '@/features/vehicles/VehiclesPage';
import { TripsPage } from '../features/trips/TripsPage';
import { DriversPage } from '../features/drivers/DriversPage';
import { FinancialsPage } from '../features/financials/FinancialsPage';
import { ExpensesPage } from '../features/financials/ExpensesPage';

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



const vehiclesRoute = createRoute({
    getParentRoute: () => appRoute,
    path: '/vehicles',
    component: VehiclesPage,
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
    component: () => <Outlet />,
});

const financialsIndexRoute = createRoute({
    getParentRoute: () => financialsRoute,
    path: '/',
    component: FinancialsPage,
});

const expensesRoute = createRoute({
    getParentRoute: () => financialsRoute,
    path: '/expenses',
    component: ExpensesPage,
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
        financialsRoute.addChildren([
            financialsIndexRoute,
            expensesRoute,
        ]),
        maintenanceRoute,
    ]),
]);

export const router = createRouter({
    routeTree,
    context: {
        auth: undefined!, // This will be provided at the highest level
    },
});
