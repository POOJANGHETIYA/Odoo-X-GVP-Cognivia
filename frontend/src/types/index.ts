import { z } from 'zod';

export const VehicleCategorySchema = z.enum(['Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck']);
export const VehicleStatusSchema = z.enum(['Available', 'On_Trip', 'In_Shop', 'Retired']);

export const VehicleSchema = z.object({
  id: z.string().uuid(),
  license_plate: z.string(),
  category: VehicleCategorySchema,
  capacity_kg: z.number().positive(),
  current_odometer: z.number().nonnegative(),
  acquisition_cost: z.number().positive(),
  status: VehicleStatusSchema,
});

export const DriverStatusSchema = z.enum(['Available', 'On_Duty', 'Suspended', 'Off_Duty']);

export const DriverSchema = z.object({
  id: z.string().uuid(),
  full_name: z.string(),
  phone_number: z.string().regex(/^\+91-\d{10}$/, 'Format must be +91-XXXXXXXXXX'),
  license_number: z.string(),
  license_class: VehicleCategorySchema,
  license_expiry: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Format must be YYYY-MM-DD'),
  safety_score: z.number().min(0).max(100),
  status: DriverStatusSchema,
});

export const TripStatusSchema = z.enum(['Draft', 'Unassigned', 'Dispatched', 'At_Pickup', 'In_Transit', 'Completed', 'Cancelled']);

export const TripSchema = z.object({
  id: z.string().uuid(),
  tracking_number: z.string().regex(/^TRP-\d{8}$/, 'Format: TRP-XXXXXXXX'),
  vehicle_id: z.string().uuid().nullable().optional(),
  driver_id: z.string().uuid().nullable().optional(),
  pickup_address: z.string(),
  dropoff_address: z.string(),
  cargo_weight_kg: z.number().positive(),
  expected_revenue: z.number().nonnegative(),
  start_odometer: z.number().nonnegative(),
  end_odometer: z.number().nonnegative().optional().nullable(),
  status: TripStatusSchema,
  receiver_otp: z.string().length(6).regex(/^\d{6}$/).optional().nullable(),
});

export const ExpenseCategorySchema = z.enum(['Fuel', 'Maintenance', 'Toll', 'Fines', 'Other']);

export const ExpenseSchema = z.object({
  id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  category: ExpenseCategorySchema,
  cost: z.number().positive(),
  logged_at: z.string(),
});

// Infer TypeScript types from Zod schemas
export type VehicleCategory = z.infer<typeof VehicleCategorySchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;

export type DriverStatus = z.infer<typeof DriverStatusSchema>;
export type Driver = z.infer<typeof DriverSchema>;

export type TripStatus = z.infer<typeof TripStatusSchema>;
export type Trip = z.infer<typeof TripSchema>;

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;
