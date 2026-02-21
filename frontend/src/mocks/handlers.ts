import { http, HttpResponse, delay } from 'msw';
import { mockVehicles, mockDrivers, mockTrips, mockExpenses, mockMaintenanceLogs } from './mockData';
import { Vehicle, Driver, Trip, Expense } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

// Mutable copies for handler mutations
const vehicles: Vehicle[] = [...mockVehicles] as Vehicle[];
const drivers: Driver[] = [...mockDrivers] as Driver[];
const trips: Trip[] = [...mockTrips] as Trip[];
const expenses: Expense[] = [...mockExpenses] as Expense[];
const maintenanceLogs = [...mockMaintenanceLogs] as any[];

function generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

export const handlers = [
    // ===================== DASHBOARD =====================
    http.get('/api/dashboard/revenue-expenses', () => {
        const today = new Date();
        const data = Array.from({ length: 7 }).map((_, i) => {
            const targetDate = subDays(today, 6 - i);
            const start = startOfDay(targetDate);
            const end = endOfDay(targetDate);

            const dailyTrips = trips.filter(
                (t) =>
                    t.created_at &&
                    isWithinInterval(new Date(t.created_at), { start, end }) &&
                    t.status !== 'Cancelled' &&
                    t.status !== 'Draft'
            );

            const dailyExpenses = expenses.filter(
                (e) =>
                    e.logged_at &&
                    isWithinInterval(new Date(e.logged_at), { start, end })
            );

            const revenue = dailyTrips.reduce((sum, t) => sum + (t.expected_revenue || 0), 0);
            const expense = dailyExpenses.reduce((sum, e) => sum + (e.cost || 0), 0);

            return {
                date: format(targetDate, 'MMM dd'),
                revenue,
                expenses: expense,
            };
        });

        return HttpResponse.json({ success: true, data });
    }),

    // ===================== VEHICLES =====================
    http.get('/api/vehicles', async () => {
        await delay(300);
        return HttpResponse.json({ success: true, data: vehicles });
    }),

    http.post('/api/vehicles', async ({ request }) => {
        await delay(300);
        const body = (await request.json()) as Record<string, unknown>;
        const newVehicle = {
            id: generateId(),
            license_plate: body.license_plate as string,
            category: body.category as string,
            capacity_kg: Number(body.capacity_kg),
            capacity_volume_cft: Number(body.capacity_volume_cft || 0),
            current_odometer: Number(body.current_odometer),
            acquisition_cost: Number(body.acquisition_cost),
            status: 'Available' as const,
        };
        vehicles.push(newVehicle as any);
        return HttpResponse.json({ success: true, data: newVehicle }, { status: 201 });
    }),

    // ===================== DRIVERS =====================
    http.get('/api/drivers', async () => {
        await delay(300);
        return HttpResponse.json({ success: true, data: drivers });
    }),

    // ===================== TRIPS =====================
    http.get('/api/trips', async () => {
        await delay(300);
        return HttpResponse.json({ success: true, data: trips });
    }),

    http.get('/api/trips/:id', async ({ params }) => {
        await delay(200);
        const trip = trips.find((t) => t.id === params.id);
        if (!trip) {
            return HttpResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
        }
        return HttpResponse.json({ success: true, data: trip });
    }),

    http.post('/api/trips', async ({ request }) => {
        await delay(300);
        const body = (await request.json()) as Record<string, unknown>;
        const trackingNum = `TRP-${String(trips.length + 1).padStart(8, '0')}`;

        const newTrip = {
            id: generateId(),
            tracking_number: trackingNum,
            vehicle_id: (body.vehicle_id as string) || null,
            driver_id: (body.driver_id as string) || null,
            pickup_address: body.pickup_address as string,
            dropoff_address: body.dropoff_address as string,
            cargo_weight_kg: Number(body.cargo_weight_kg),
            expected_revenue: Number(body.expected_revenue),
            start_odometer: Number(body.start_odometer || 0),
            end_odometer: null,
            status: body.vehicle_id && body.driver_id ? ('Dispatched' as const) : ('Unassigned' as const),
            receiver_otp: null,
        };

        if (newTrip.vehicle_id) {
            const vehicle = vehicles.find((v) => v.id === newTrip.vehicle_id);
            if (vehicle) (vehicle as any).status = 'On_Trip';
        }
        if (newTrip.driver_id) {
            const driver = drivers.find((d) => d.id === newTrip.driver_id);
            if (driver) (driver as any).status = 'On_Duty';
        }

        trips.push(newTrip as any);
        return HttpResponse.json({ success: true, data: newTrip }, { status: 201 });
    }),

    http.put('/api/trips/:id', async ({ params, request }) => {
        await delay(300);
        const tripIndex = trips.findIndex((t) => t.id === params.id);
        if (tripIndex === -1) {
            return HttpResponse.json({ success: false, error: 'Trip not found' }, { status: 404 });
        }
        const body = (await request.json()) as Record<string, unknown>;
        const trip = trips[tripIndex];

        if (body.status) {
            (trip as any).status = body.status;
        }

        if (body.status === 'Completed') {
            if (body.end_odometer !== undefined) (trip as any).end_odometer = Number(body.end_odometer);
            if (body.receiver_otp) (trip as any).receiver_otp = body.receiver_otp as string;

            if (trip.vehicle_id) {
                const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
                if (vehicle) (vehicle as any).status = 'Available';
                if (body.end_odometer !== undefined && vehicle) {
                    (vehicle as any).current_odometer = Number(body.end_odometer);
                }
            }
            if (trip.driver_id) {
                const driver = drivers.find((d) => d.id === trip.driver_id);
                if (driver) (driver as any).status = 'Available';
            }
        }

        if (body.status === 'Cancelled') {
            if (trip.vehicle_id) {
                const vehicle = vehicles.find((v) => v.id === trip.vehicle_id);
                if (vehicle) (vehicle as any).status = 'Available';
            }
            if (trip.driver_id) {
                const driver = drivers.find((d) => d.id === trip.driver_id);
                if (driver) (driver as any).status = 'Available';
            }
        }

        trips[tripIndex] = trip;
        return HttpResponse.json({ success: true, data: trip });
    }),

    // ===================== EXPENSES =====================
    http.get('/api/expenses', async () => {
        await delay(300);
        return HttpResponse.json({ success: true, data: expenses });
    }),

    http.post('/api/expenses', async ({ request }) => {
        await delay(300);
        const body = (await request.json()) as Record<string, unknown>;

        const newExpense = {
            id: generateId(),
            vehicle_id: body.vehicle_id as string,
            category: body.category as string,
            cost: Number(body.cost),
            logged_at: new Date().toISOString(),
        };

        expenses.push(newExpense as any);

        if (newExpense.category === 'Maintenance') {
            const vehicle = vehicles.find((v) => v.id === newExpense.vehicle_id);
            if (vehicle) (vehicle as any).status = 'In_Shop';
        }

        return HttpResponse.json({ success: true, data: newExpense }, { status: 201 });
    }),

    // ===================== MAINTENANCE LOGS =====================
    http.get('/api/maintenance', async () => {
        await delay(300);
        return HttpResponse.json({ success: true, data: maintenanceLogs });
    }),

    http.post('/api/maintenance', async ({ request }) => {
        await delay(300);
        const body = (await request.json()) as Record<string, unknown>;

        const newLog = {
            id: generateId(),
            vehicle_id: body.vehicle_id as string,
            service_type: body.service_type as string,
            description: body.description as string,
            cost: Number(body.cost),
            odometer_at_service: Number(body.odometer_at_service),
            scheduled_date: body.scheduled_date as string,
            completed_date: null,
            next_service_due: (body.next_service_due as string) || null,
            status: (body.status as string) || 'Scheduled',
            technician_name: body.technician_name as string,
        };

        maintenanceLogs.push(newLog);

        if (newLog.status !== 'Completed' && newLog.status !== 'Cancelled') {
            const vehicle = vehicles.find((v) => v.id === newLog.vehicle_id);
            if (vehicle) (vehicle as any).status = 'In_Shop';
        }

        return HttpResponse.json({ success: true, data: newLog }, { status: 201 });
    }),
];
