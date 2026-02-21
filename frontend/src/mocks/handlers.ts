import { http, HttpResponse } from 'msw';
import { mockVehicles, mockDrivers, mockTrips, mockExpenses } from './data';
import { Vehicle, Driver, Trip, Expense } from '../types';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';

const vehicles: Vehicle[] = [...mockVehicles] as Vehicle[];
const drivers: Driver[] = [...mockDrivers] as Driver[];
const trips: Trip[] = [...mockTrips] as Trip[];
const expenses: Expense[] = [...mockExpenses] as Expense[];

export const handlers = [
  // --- Dashboard Aggregations ---
  http.get('/api/dashboard/revenue-expenses', () => {
    const today = new Date();
    const data = Array.from({ length: 7 }).map((_, i) => {
      const targetDate = subDays(today, 6 - i);
      const start = startOfDay(targetDate);
      const end = endOfDay(targetDate);

      // Filter trips within the day (excluding Draft/Cancelled)
      const dailyTrips = trips.filter(
        (t) =>
          t.created_at &&
          isWithinInterval(new Date(t.created_at), { start, end }) &&
          t.status !== 'Cancelled' &&
          t.status !== 'Draft'
      );

      // Filter expenses within the day
      const dailyExpenses = expenses.filter(
        (e) =>
          e.logged_at &&
          isWithinInterval(new Date(e.logged_at), { start, end })
      );

      // Sum expected revenue and costs
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

  // --- Vehicles ---
  http.get('/api/vehicles', () => {
    return HttpResponse.json({ success: true, data: vehicles });
  }),
  http.post('/api/vehicles', async ({ request }) => {
    const newVehicle = (await request.json()) as Vehicle;
    vehicles.push(newVehicle);
    return HttpResponse.json({ success: true, data: newVehicle }, { status: 201 });
  }),
  http.put('/api/vehicles/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<Vehicle>;
    const index = vehicles.findIndex((v) => v.id === id);
    if (index !== -1) {
      vehicles[index] = { ...vehicles[index], ...updates };
      return HttpResponse.json({ success: true, data: vehicles[index] });
    }
    return HttpResponse.json({ success: false, message: 'Vehicle not found' }, { status: 404 });
  }),

  // --- Drivers ---
  http.get('/api/drivers', () => {
    return HttpResponse.json({ success: true, data: drivers });
  }),
  http.post('/api/drivers', async ({ request }) => {
    const newDriver = (await request.json()) as Driver;
    drivers.push(newDriver);
    return HttpResponse.json({ success: true, data: newDriver }, { status: 201 });
  }),
  http.put('/api/drivers/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<Driver>;
    const index = drivers.findIndex((d) => d.id === id);
    if (index !== -1) {
      drivers[index] = { ...drivers[index], ...updates };
      return HttpResponse.json({ success: true, data: drivers[index] });
    }
    return HttpResponse.json({ success: false, message: 'Driver not found' }, { status: 404 });
  }),

  // --- Trips ---
  http.get('/api/trips', () => {
    return HttpResponse.json({ success: true, data: trips });
  }),
  http.post('/api/trips', async ({ request }) => {
    const newTrip = (await request.json()) as Trip;
    trips.push(newTrip);
    return HttpResponse.json({ success: true, data: newTrip }, { status: 201 });
  }),
  http.put('/api/trips/:id', async ({ request, params }) => {
    const { id } = params;
    const updates = (await request.json()) as Partial<Trip>;
    const index = trips.findIndex((t) => t.id === id);
    if (index !== -1) {
      trips[index] = { ...trips[index], ...updates };
      return HttpResponse.json({ success: true, data: trips[index] });
    }
    return HttpResponse.json({ success: false, message: 'Trip not found' }, { status: 404 });
  }),

  // --- Expenses ---
  http.get('/api/expenses', () => {
    return HttpResponse.json({ success: true, data: expenses });
  }),
  http.post('/api/expenses', async ({ request }) => {
    const newExpense = (await request.json()) as Expense;
    expenses.push(newExpense);

    // Logic from PRD: "If Expense Category is Maintenance, automatically set Vehicle status to In_Shop"
    if (newExpense.category === 'Maintenance') {
      const vIndex = vehicles.findIndex((v) => v.id === newExpense.vehicle_id);
      if (vIndex !== -1) {
        vehicles[vIndex] = { ...vehicles[vIndex], status: 'In_Shop' };
      }
    }

    return HttpResponse.json({ success: true, data: newExpense }, { status: 201 });
  }),
];
