import { useTrips } from '../hooks/useDashboardData';
import { AlertTriangle, Loader2 } from 'lucide-react';

export function SLAWarningsTable() {
  const { data: trips, isLoading } = useTrips();

  if (isLoading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
        <p className="text-sm font-medium text-slate-500">Checking SLA status...</p>
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
      <div className="p-10 flex flex-col items-center text-center h-[300px] justify-center bg-slate-50/30">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 ring-1 ring-emerald-100">
          <AlertTriangle className="w-7 h-7 text-emerald-400" />
        </div>
        <h3 className="text-sm font-bold text-slate-700 uppercase tracking-widest">All Clear</h3>
        <p className="text-xs text-slate-500 mt-1 max-w-[200px]">No active SLA warnings requiring attention right now.</p>
      </div>
    );
  }

  return (
    <div className="overflow-y-auto max-h-[350px] custom-scrollbar">
      <table className="w-full text-sm text-left">
        <thead className="text-[10px] text-slate-400 uppercase tracking-wider bg-slate-50/80 sticky top-0 backdrop-blur-md z-10 border-b border-slate-100">
          <tr>
            <th scope="col" className="px-6 py-4 font-bold">Tracking #</th>
            <th scope="col" className="px-6 py-4 font-bold">Location</th>
            <th scope="col" className="px-6 py-4 font-bold text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100/50">
          {warningTrips.map((trip) => (
            <tr key={trip.id} className="bg-white hover:bg-rose-50/40 transition-colors group cursor-pointer">
              <td className="px-6 py-4 font-semibold text-slate-800">
                {trip.tracking_number}
              </td>
              <td className="px-6 py-4 text-slate-500 max-w-[150px] truncate" title={trip.pickup_address}>
                <div className="flex flex-col">
                  {trip.pickup_address}
                  <div className="flex items-center mt-1.5 space-x-1.5">
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-rose-100 text-rose-700 ring-1 ring-rose-200">
                      <AlertTriangle className="w-3 h-3 mr-1" />
                      &gt; 2Hrs
                    </span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 text-right">
                <button className="text-xs font-bold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-indigo-600 px-3 py-1.5 rounded-lg transition-all duration-300 ring-1 ring-indigo-200">
                  Contact
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
