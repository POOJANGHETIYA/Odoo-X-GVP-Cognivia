import { Trip, TripStatus, Vehicle, Driver } from '@/types';
import { ArrowRight, User, Truck } from 'lucide-react';
import { EmptyState } from '@/components/EmptyState';

interface TripsTableProps {
  trips: Trip[];
  vehicles: Vehicle[];
  drivers: Driver[];
}

const STATUS_CONFIG: Record<TripStatus, { label: string; className: string }> = {
  Draft: {
    label: 'Draft',
    className: 'bg-zinc-100 text-zinc-600 ring-1 ring-inset ring-zinc-500/10'
  },
  Unassigned: {
    label: 'Unassigned',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
  },
  Dispatched: {
    label: 'Dispatched',
    className: 'bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20'
  },
  At_Pickup: {
    label: 'At Pickup',
    className: 'bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20'
  },
  In_Transit: {
    label: 'In Transit',
    className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
  },
  Completed: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
  },
  Cancelled: {
    label: 'Cancelled',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
  },
};

export function TripsTable({ trips, vehicles, drivers }: TripsTableProps) {
  const getVehicle = (vehicleId: string | null | undefined) =>
    vehicles.find(v => v.id === vehicleId);

  const getDriver = (driverId: string | null | undefined) =>
    drivers.find(d => d.id === driverId);

  if (trips.length === 0) {
    return (
      <EmptyState
        title="No trips dispatched"
        description="Launch your logistical operations by creating your first transit manifestation."
        icon={Truck}
      />
    );
  }

  return (
    <div className="overflow-x-auto h-full">
      <table className="w-full text-sm text-left border-separate border-spacing-0">
        <thead className="bg-zinc-50/50 sticky top-0 z-10">
          <tr className="border-b border-zinc-200">
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              MANIFEST ID
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              LOGISTICS FLOW
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              RESOURCES
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              STATUS
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 text-right">
              REVENUE
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 bg-white">
          {trips.map((trip) => {
            const vehicle = getVehicle(trip.vehicle_id);
            const driver = getDriver(trip.driver_id);
            const status = STATUS_CONFIG[trip.status];

            return (
              <tr key={trip.id} className="hover:bg-zinc-50/80 transition-colors group cursor-pointer">
                <td className="px-6 py-4 border-b border-zinc-50">
                  <div className="flex flex-col">
                    <span className="font-bold text-zinc-900 tabular-nums font-mono text-xs tracking-tight">
                      {trip.tracking_number}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 uppercase font-semibold">
                      Created {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-zinc-50">
                  <div className="flex items-center gap-2 max-w-[300px]">
                    <div className="flex flex-col min-w-0">
                      <span className="text-zinc-700 font-medium truncate text-xs">
                        {trip.pickup_address?.split(',')[0]}
                      </span>
                    </div>
                    <ArrowRight className="w-3 h-3 text-zinc-300 shrink-0" />
                    <div className="flex flex-col min-0">
                      <span className="text-zinc-900 font-bold truncate text-xs">
                        {trip.dropoff_address?.split(',')[0]}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-zinc-50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                      <div className="w-7 h-7 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-zinc-600" title={driver?.full_name}>
                        <User className="w-3.5 h-3.5" />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-zinc-100 border-2 border-white flex items-center justify-center text-zinc-600" title={vehicle?.license_plate}>
                        <Truck className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-zinc-900 leading-tight truncate max-w-[120px]">
                        {driver?.full_name || 'Unassigned'}
                      </span>
                      <span className="text-[9px] text-zinc-400 font-medium uppercase truncate">
                        {vehicle?.license_plate || 'No Asset'}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 border-b border-zinc-50">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wide ${status.className}`}>
                    {status.label}
                  </span>
                </td>
                <td className="px-6 py-4 text-right border-b border-zinc-50">
                  <span className="text-zinc-900 font-bold tabular-nums tracking-tight">
                    {new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(trip.expected_revenue)}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
