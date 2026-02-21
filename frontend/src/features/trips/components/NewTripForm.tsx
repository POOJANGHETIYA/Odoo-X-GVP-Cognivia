import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateTrip, useAvailableVehicles, useAvailableDrivers } from '../hooks/useTripsData';

const newTripSchema = z.object({
  vehicle_id: z.string().min(1, 'Please select a vehicle'),
  cargo_weight_kg: z.number().min(1, 'Cargo weight must be at least 1 kg'),
  driver_id: z.string().min(1, 'Please select a driver'),
  pickup_address: z.string().min(1, 'Origin address is required'),
  dropoff_address: z.string().min(1, 'Destination is required'),
  expected_revenue: z.number().min(0, 'Estimated fuel cost must be positive'),
});

type NewTripFormValues = z.infer<typeof newTripSchema>;

interface NewTripFormProps {
  onSuccess?: () => void;
}

export function NewTripForm({ onSuccess }: NewTripFormProps) {
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
  } = useForm<NewTripFormValues>({
    resolver: zodResolver(newTripSchema),
    defaultValues: {
      vehicle_id: '',
      cargo_weight_kg: 0,
      driver_id: '',
      pickup_address: '',
      dropoff_address: '',
      expected_revenue: 0,
    },
  });

  const selectedVehicleId = watch('vehicle_id');
  const cargoWeight = watch('cargo_weight_kg');
  
  // Find selected vehicle to check capacity
  const selectedVehicle = vehicles?.find(v => v.id === selectedVehicleId);
  const isOverCapacity = selectedVehicle && cargoWeight > selectedVehicle.capacity_kg;

  const onSubmit = async (data: NewTripFormValues) => {
    setError(null);
    
    // Validation: Check if cargo exceeds vehicle capacity
    if (isOverCapacity) {
      setError(`Too heavy! Cargo weight (${cargoWeight}kg) exceeds vehicle capacity (${selectedVehicle?.capacity_kg}kg)`);
      return;
    }

    try {
      const newTrip = {
        id: crypto.randomUUID(),
        tracking_number: `TRP-${String(Date.now()).slice(-8)}`,
        ...data,
        start_odometer: selectedVehicle?.current_odometer || 0,
        status: 'Dispatched' as const,
      };
      
      await createTrip.mutateAsync(newTrip as any);
      reset();
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to create trip');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="px-6 pb-6 space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      {/* Select Vehicle */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Select Vehicle:
        </label>
        <select
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors bg-white ${
            errors.vehicle_id 
              ? 'border-red-400 focus:ring-red-200' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('vehicle_id')}
        >
          <option value="">— Select a vehicle —</option>
          {vehicles?.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.license_plate} ({vehicle.category.replace('_', ' ')}) - Max {vehicle.capacity_kg}kg
            </option>
          ))}
        </select>
      </div>

      {/* Cargo Weight */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Cargo Weight (Kg):
        </label>
        <input
          type="number"
          placeholder="Enter cargo weight"
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
            errors.cargo_weight_kg || isOverCapacity
              ? 'border-red-400 focus:ring-red-200 bg-red-50' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('cargo_weight_kg', { valueAsNumber: true })}
        />
      </div>
      {isOverCapacity && (
        <p className="ml-44 text-sm text-red-500 font-medium">
          ⚠️ Too heavy! Max capacity is {selectedVehicle?.capacity_kg}kg
        </p>
      )}

      {/* Select Driver */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Select Driver:
        </label>
        <select
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors bg-white ${
            errors.driver_id 
              ? 'border-red-400 focus:ring-red-200' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('driver_id')}
        >
          <option value="">— Select a driver —</option>
          {drivers?.map((driver) => (
            <option key={driver.id} value={driver.id}>
              {driver.full_name} ({driver.license_class.replace('_', ' ')})
            </option>
          ))}
        </select>
      </div>

      {/* Origin Address */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Origin Address:
        </label>
        <input
          type="text"
          placeholder="Enter pickup location"
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
            errors.pickup_address 
              ? 'border-red-400 focus:ring-red-200 bg-red-50' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('pickup_address')}
        />
      </div>

      {/* Destination */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Destination:
        </label>
        <input
          type="text"
          placeholder="Enter dropoff location"
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
            errors.dropoff_address 
              ? 'border-red-400 focus:ring-red-200 bg-red-50' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('dropoff_address')}
        />
      </div>

      {/* Estimated Fuel Cost */}
      <div className="flex items-center gap-4">
        <label className="w-40 text-sm font-medium text-slate-700 shrink-0">
          Estimated Fuel Cost:
        </label>
        <input
          type="number"
          placeholder="Enter estimated cost"
          className={`flex-1 px-4 py-2.5 rounded-lg border focus:ring-2 focus:outline-none transition-colors ${
            errors.expected_revenue 
              ? 'border-red-400 focus:ring-red-200 bg-red-50' 
              : 'border-slate-300 focus:border-[#10b981] focus:ring-[#10b981]/20'
          }`}
          {...register('expected_revenue', { valueAsNumber: true })}
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting || isOverCapacity}
          className="inline-flex items-center gap-2 px-6 py-2.5 bg-white border-2 border-[#10b981] text-[#10b981] font-semibold rounded-lg hover:bg-[#10b981] hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Dispatching...
            </>
          ) : (
            'Confirm & Dispatch Trip'
          )}
        </button>
      </div>
    </form>
  );
}
