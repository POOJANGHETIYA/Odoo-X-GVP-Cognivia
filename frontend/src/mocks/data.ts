import { Vehicle, Driver, Trip, Expense } from '../types';

export const mockVehicles: Vehicle[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    license_plate: 'MH-12-AB-1234',
    category: 'Medium_Truck',
    capacity_kg: 2000,
    current_odometer: 15400,
    acquisition_cost: 1200000,
    status: 'On_Trip',
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
  {
    id: '11111111-1111-1111-1111-111111111113',
    license_plate: 'DL-04-CZ-1020',
    category: 'Mini_Truck',
    capacity_kg: 800,
    current_odometer: 8500,
    acquisition_cost: 450000,
    status: 'Available',
  },
  {
    id: '11111111-1111-1111-1111-111111111114',
    license_plate: 'TS-08-EF-5566',
    category: 'Bike',
    capacity_kg: 50,
    current_odometer: 1200,
    acquisition_cost: 85000,
    status: 'Available',
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
  {
    id: '33333333-3333-3333-3333-333333333332',
    tracking_number: 'TRP-00000002',
    vehicle_id: null,
    driver_id: null,
    pickup_address: 'Supplier C, Bengaluru',
    dropoff_address: 'Retailer D, Mysuru',
    cargo_weight_kg: 800,
    expected_revenue: 3200,
    start_odometer: 0,
    status: 'Unassigned',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    tracking_number: 'TRP-00000003',
    vehicle_id: '11111111-1111-1111-1111-111111111111',
    driver_id: '22222222-2222-2222-2222-222222222221',
    pickup_address: 'Factory E, Chennai',
    dropoff_address: 'Port F, Chennai',
    cargo_weight_kg: 2000,
    expected_revenue: 12000,
    start_odometer: 15000,
    status: 'At_Pickup',
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
