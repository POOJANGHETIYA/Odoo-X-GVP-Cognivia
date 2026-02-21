import { useTrips } from '../hooks/useDashboardData';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function SLAWarningsTable() {
  const { data: trips, isLoading } = useTrips();

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
      </div>
    );
  }

  // PRD: trip in At_Pickup status for more than 2 hours.
  // We use created_at to check if trip is older than 2 hours as a proxy.
  const warningTrips = trips?.filter(t => {
    if (t.status !== 'At_Pickup') return false;
    if (!t.created_at) return false;

    // Check if more than 2 hours have passed since created_at
    const createdTime = new Date(t.created_at).getTime();
    const twoHoursInMs = 2 * 60 * 60 * 1000;
    return (Date.now() - createdTime) > twoHoursInMs;
  }) || [];

  if (warningTrips.length === 0) {
    return (
      <div className="p-6 text-center border-t border-slate-100">
        <p className="text-slate-500">No active SLA warnings.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-y border-slate-100">
          <tr>
            <th scope="col" className="px-6 py-3 font-medium">Tracking #</th>
            <th scope="col" className="px-6 py-3 font-medium">Location</th>
            <th scope="col" className="px-6 py-3 font-medium">Warning</th>
          </tr>
        </thead>
        <tbody>
          {warningTrips.map((trip) => (
            <tr key={trip.id} className="bg-white border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
              <td className="px-6 py-4 font-medium text-slate-900">
                {trip.tracking_number}
              </td>
              <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate" title={trip.pickup_address}>
                {trip.pickup_address}
              </td>
              <td className="px-6 py-4 py-4">
                <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                  <AlertTriangle className="w-3 h-3 mr-1" />
                  &gt; 2Hrs
                </span>
                <div className="mt-2 text-xs text-[#3bb273] hover:text-[#2da061] font-medium cursor-pointer transition-colors max-w-max">
                  Contact Driver
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
