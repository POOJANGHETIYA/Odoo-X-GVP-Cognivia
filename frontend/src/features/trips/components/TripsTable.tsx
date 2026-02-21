import { Trip, TripStatus, Vehicle, Driver } from '@/types';

interface TripsTableProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<TripStatus, { label: string; bg: string; text: string }> = {
  Draft: { label: 'Draft', bg: 'bg-slate-100', text: 'text-slate-600' },
  Unassigned: { label: 'Unassigned', bg: 'bg-orange-100', text: 'text-orange-700' },
  Dispatched: { label: 'On way', bg: 'bg-blue-100', text: 'text-blue-700' },
  At_Pickup: { label: 'At Pickup', bg: 'bg-purple-100', text: 'text-purple-700' },
  In_Transit: { label: 'In Transit', bg: 'bg-cyan-100', text: 'text-cyan-700' },
  Completed: { label: 'Completed', bg: 'bg-[#10b981]', text: 'text-white' },
  Cancelled: { label: 'Cancelled', bg: 'bg-red-100', text: 'text-red-700' },
};

function StatusBadge({ status }: { status: TripStatus }) {
  const config = STATUS_CONFIG[status];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  );
}

export function TripsTable({ trips, vehicles, drivers, isLoading }: TripsTableProps) {
  // Helper to get vehicle info by ID
  const getVehicle = (vehicleId: string | null | undefined) => 
    vehicles.find(v => v.id === vehicleId);

  // Helper to get driver info by ID
  const getDriver = (driverId: string | null | undefined) => 
    drivers.find(d => d.id === driverId);

  // Format vehicle category for display
  const formatCategory = (category: string) => 
    category.replace(/_/g, ' ');

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#10b981]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/50">
              <th className="text-left text-xs font-semibold text-red-500 italic px-6 py-4 w-[80px]">
                Trip
              </th>
              <th className="text-left text-xs font-semibold text-red-500 italic px-6 py-4">
                Fleet Type
              </th>
              <th className="text-left text-xs font-semibold text-slate-600 italic px-6 py-4">
                Driver
              </th>
              <th className="text-left text-xs font-semibold text-blue-500 italic px-6 py-4">
                Origin
              </th>
              <th className="text-left text-xs font-semibold text-cyan-500 italic px-6 py-4">
                Destination
              </th>
              <th className="text-left text-xs font-semibold text-red-500 italic px-6 py-4">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {trips.map((trip, index) => {
              const vehicle = getVehicle(trip.vehicle_id);
              const driver = getDriver(trip.driver_id);
              
              return (
                <tr key={trip.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <span className="text-red-500 font-medium">{index + 1}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-red-500 font-medium">
                      {vehicle ? formatCategory(vehicle.category) : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-slate-700 font-medium">
                      {driver ? driver.full_name : '—'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-blue-500 font-medium">
                      {trip.pickup_address.split(',')[1]?.trim() || trip.pickup_address.split(',')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-cyan-500 font-medium">
                      {trip.dropoff_address.split(',')[1]?.trim() || trip.dropoff_address.split(',')[0]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <StatusBadge status={trip.status} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {trips.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-slate-500">No trips found. Create your first trip to get started.</p>
        </div>
      )}
    </div>
  );
}
