import { z } from 'zod';

export const VehicleCategorySchema = z.enum(['Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck']);
export const VehicleStatusSchema = z.enum(['Available', 'On_Trip', 'In_Shop', 'Retired']);
export const GpsStatusSchema = z.enum(['Active', 'Inactive', 'No_GPS']);

export const VehicleSchema = z.object({
    id: z.string().uuid(),
    license_plate: z.string(),
    category: VehicleCategorySchema,
    capacity_kg: z.number().positive(),
    capacity_volume_cft: z.number().nonnegative(),
    current_odometer: z.number().nonnegative(),
    acquisition_cost: z.number().positive(),
    status: VehicleStatusSchema,
    // Optional extended fields
    brand: z.string().optional(),
    year: z.number().int().optional(),
    fleet: z.string().optional(),
    gps_status: GpsStatusSchema.optional(),
    has_photo: z.boolean().optional(),
    has_documents: z.boolean().optional(),
    registration_date: z.string().optional(),
    fuel_type: z.enum(['Petrol', 'Diesel', 'CNG', 'EV']).optional(),
    transmission_type: z.enum(['Manual', 'Automatic']).optional(),
    registration_certificate: z.string().optional(),
    vin: z.string().optional(),
    gps_tracker: z.string().optional(),
    gps_tracker_id: z.string().optional(),
    vehicle_owner: z.string().optional(),
    engine_number: z.string().optional(),
    chassis_number: z.string().optional(),
    comment: z.string().optional(),
});

export const DriverStatusSchema = z.enum(['Available', 'On_Duty', 'Suspended', 'Off_Duty']);

export const DriverSchema = z.object({
    id: z.string().uuid(),
    full_name: z.string(),
    phone_number: z.string(),
    license_number: z.string(),
    license_class: VehicleCategorySchema,
    license_expiry: z.string(),
    safety_score: z.number().min(0).max(100),
    status: DriverStatusSchema,
});

export const TripStatusSchema = z.enum(['Draft', 'Unassigned', 'Dispatched', 'At_Pickup', 'In_Transit', 'Completed', 'Cancelled']);

export const GeoLocationSchema = z.object({
    lat: z.number(),
    lon: z.number()
});

export const TripSchema = z.object({
    id: z.string().uuid(),
    tracking_number: z.string(),
    vehicle_id: z.string().uuid().nullable().optional(),
    driver_id: z.string().uuid().nullable().optional(),
    dispatcher_id: z.string().uuid().optional(),
    pickup_location: GeoLocationSchema.optional(),
    dropoff_location: GeoLocationSchema.optional(),
    pickup_address: z.string().optional(),
    dropoff_address: z.string().optional(),
    cargo_weight_kg: z.number().positive(),
    estimated_distance_km: z.number().nonnegative().optional(),
    expected_revenue: z.number().nonnegative(),
    start_odometer: z.number().nonnegative(),
    end_odometer: z.number().nonnegative().optional().nullable(),
    status: TripStatusSchema,
    receiver_otp: z.string().optional().nullable(),
    created_at: z.string().optional()
});

export const ExpenseCategorySchema = z.enum(['Fuel', 'Maintenance', 'Toll', 'Fines', 'Other']);

export const ExpenseSchema = z.object({
    id: z.string().uuid(),
    vehicle_id: z.string().uuid(),
    trip_id: z.string().uuid().optional(),
    logged_by: z.string().uuid().optional(),
    category: ExpenseCategorySchema,
    cost: z.number().positive(),
    volume_liters: z.number().nonnegative().optional(),
    description: z.string().optional(),
    logged_at: z.string(),
});

// ==================== MAINTENANCE & SERVICE LOGS ====================
export const MaintenanceStatusSchema = z.enum(['Scheduled', 'In_Progress', 'Completed', 'Cancelled']);
export const ServiceTypeSchema = z.enum([
  'Oil_Change', 'Tire_Replacement', 'Engine_Repair', 'Brake_Service',
  'General_Inspection', 'Battery_Replacement', 'Other',
]);

export const MaintenanceLogSchema = z.object({
  id: z.string().uuid(),
  vehicle_id: z.string().uuid(),
  service_type: ServiceTypeSchema,
  description: z.string(),
  cost: z.number().nonnegative(),
  odometer_at_service: z.number().nonnegative(),
  scheduled_date: z.string(),
  completed_date: z.string().nullable().optional(),
  next_service_due: z.string().nullable().optional(),
  status: MaintenanceStatusSchema,
  technician_name: z.string(),
});

// Infer TypeScript types from Zod schemas
export type VehicleCategory = z.infer<typeof VehicleCategorySchema>;
export type VehicleStatus = z.infer<typeof VehicleStatusSchema>;
export type GpsStatus = z.infer<typeof GpsStatusSchema>;
export type Vehicle = z.infer<typeof VehicleSchema>;

export type DriverStatus = z.infer<typeof DriverStatusSchema>;
export type Driver = z.infer<typeof DriverSchema>;

export type TripStatus = z.infer<typeof TripStatusSchema>;
export type Trip = z.infer<typeof TripSchema>;

export type ExpenseCategory = z.infer<typeof ExpenseCategorySchema>;
export type Expense = z.infer<typeof ExpenseSchema>;

export type MaintenanceStatus = z.infer<typeof MaintenanceStatusSchema>;
export type ServiceType = z.infer<typeof ServiceTypeSchema>;
export type MaintenanceLog = z.infer<typeof MaintenanceLogSchema>;
