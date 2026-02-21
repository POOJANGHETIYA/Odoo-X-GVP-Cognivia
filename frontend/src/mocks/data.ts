import { Vehicle, Driver, Trip, Expense } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    license_plate: 'MH-12-AB-1234',
    category: 'Medium_Truck',
    capacity_kg: 2000,
    current_odometer: 15400,
    acquisition_cost: 1200000,
    status: 'Available',
  },
  {
    id: '11111111-1111-1111-1111-111111111112',
    license_plate: 'KA-01-XY-9876',
    category: 'Heavy_Truck',
    capacity_kg: 5000,
    current_odometer: 42000,
    acquisition_cost: 2500000,
    status: 'In_Shop',
  },
];

export const mockDrivers: Driver[] = [
  {
    id: '22222222-2222-2222-2222-222222222221',
    full_name: 'Rajesh Kumar',
    phone_number: '+91-9876543210',
    license_number: 'DL-1420110012345',
    license_class: 'Heavy_Truck',
    license_expiry: '2028-05-20',
    safety_score: 92,
    status: 'Available',
  },
];

export const mockTrips: Trip[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    tracking_number: 'TRP-00000001',
    vehicle_id: null,
    driver_id: null,
    pickup_address: 'Warehouse A, Mumbai',
    dropoff_address: 'Distributor B, Pune',
    cargo_weight_kg: 1500,
    expected_revenue: 8500,
    start_odometer: 0,
    status: 'Unassigned',
  },
];

export const mockExpenses: Expense[] = [
  {
    id: '44444444-4444-4444-4444-444444444441',
    vehicle_id: '11111111-1111-1111-1111-111111111111',
    category: 'Fuel',
    cost: 4500,
    logged_at: new Date().toISOString(),
  },
];
