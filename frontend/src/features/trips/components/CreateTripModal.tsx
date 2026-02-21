import { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTrip, useAvailableVehicles, useAvailableDrivers } from '../hooks/useTripsData';

const createTripSchema = z.object({
  pickup_address: z.string().min(1, 'Pickup address is required'),
  dropoff_address: z.string().min(1, 'Dropoff address is required'),
  cargo_weight_kg: z.number().min(1, 'Cargo weight must be at least 1 kg'),
  expected_revenue: z.number().min(0, 'Revenue must be positive'),
  vehicle_id: z.string().optional(),
  driver_id: z.string().optional(),
});

type CreateTripFormValues = z.infer<typeof createTripSchema>;

interface CreateTripModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateTripModal({ isOpen, onClose }: CreateTripModalProps) {
  const [error, setError] = useState<string | null>(null);
  const { data: vehicles } = useAvailableVehicles();
  const { data: drivers } = useAvailableDrivers();
  const createTrip = useCreateTrip();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateTripFormValues>({
    resolver: zodResolver(createTripSchema),
    defaultValues: {
      pickup_address: '',
      dropoff_address: '',
      cargo_weight_kg: 0,
      expected_revenue: 0,
    },
  });

  const selectedVehicleId = watch('vehicle_id');
  const cargoWeight = watch('cargo_weight_kg');
  
  // Find selected vehicle to check capacity
  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);
  const isOverCapacity = selectedVehicle && cargoWeight > selectedVehicle.capacity_kg;

  const onSubmit = async (data: CreateTripFormValues) => {
    setError(null);
    
    // Validation: Check if cargo exceeds vehicle capacity
    if (isOverCapacity) {
      setError(`Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${selectedVehicle?.capacity_kg}kg)`);
      return;
    }

    try {
      const newTrip = {
        id: crypto.randomUUID(),
        tracking_number: `TRP-${String(Date.now()).slice(-8)}`,
        ...data,
        vehicle_id: data.vehicle_id || null,
        driver_id: data.driver_id || null,
        start_odometer: selectedVehicle?.current_odometer || 0,
        status: data.vehicle_id && data.driver_id ? 'Dispatched' : 'Unassigned',
      };
      
      await createTrip.mutateAsync(newTrip as any);
      reset();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Create New Trip</h2>
          <button 
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-200 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          {/* Pickup Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Pickup Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter pickup location"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                errors.pickup_address 
                  ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                  : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
              }`}
              {...register('pickup_address')}
            />
            {errors.pickup_address && (
              <p className="mt-1 text-sm text-red-500">{errors.pickup_address.message}</p>
            )}
          </div>

          {/* Dropoff Address */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Dropoff Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Enter dropoff location"
              className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                errors.dropoff_address 
                  ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                  : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
              }`}
              {...register('dropoff_address')}
            />
            {errors.dropoff_address && (
              <p className="mt-1 text-sm text-red-500">{errors.dropoff_address.message}</p>
            )}
          </div>

          {/* Cargo Weight & Revenue Row */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Cargo Weight (kg) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="0"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                  errors.cargo_weight_kg || isOverCapacity
                    ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                    : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
                }`}
                {...register('cargo_weight_kg', { valueAsNumber: true })}
              />
              {errors.cargo_weight_kg && (
                <p className="mt-1 text-sm text-red-500">{errors.cargo_weight_kg.message}</p>
              )}
              {isOverCapacity && (
                <p className="mt-1 text-sm text-red-500">
                  Exceeds vehicle capacity ({selectedVehicle?.capacity_kg}kg)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Expected Revenue (INR)
              </label>
              <input
                type="number"
                placeholder="0.00"
                className={`w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
                  errors.expected_revenue 
                    ? 'border-red-400 focus:ring-red-200 bg-red-50' 
                    : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
                }`}
                {...register('expected_revenue', { valueAsNumber: true })}
              />
            </div>
          </div>

          {/* Vehicle Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Assign Vehicle (Optional)
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 focus:outline-none transition-colors bg-white"
              {...register('vehicle_id')}
            >
              <option value="">— Select a vehicle —</option>
              {vehicles?.map((vehicle) => (
                <option key={vehicle.id} value={vehicle.id}>
                  {vehicle.license_plate} ({vehicle.category}) - {vehicle.capacity_kg}kg max
                </option>
              ))}
            </select>
            {vehicles?.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No vehicles available</p>
            )}
          </div>

          {/* Driver Selection */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Assign Driver (Optional)
            </label>
            <select
              className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/20 focus:outline-none transition-colors bg-white"
              {...register('driver_id')}
            >
              <option value="">— Select a driver —</option>
              {drivers?.map((driver) => (
                <option key={driver.id} value={driver.id}>
                  {driver.full_name} ({driver.license_class})
                </option>
              ))}
            </select>
            {drivers?.length === 0 && (
              <p className="mt-1 text-sm text-amber-600">No drivers available</p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-700 font-medium hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isOverCapacity}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Trip'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
