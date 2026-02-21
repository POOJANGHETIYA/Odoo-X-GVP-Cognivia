import { Driver, DriverStatus } from '@/types';
import { MoreHorizontal } from 'lucide-react';

interface DriversTableProps {
  drivers: Driver[];
}

const STATUS_CONFIG: Record<DriverStatus, { label: string; className: string }> = {
  Available: {
    label: 'Available',
    className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20'
  },
  On_Duty: {
    label: 'On Duty',
    className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20'
  },
  Off_Duty: {
    label: 'Off Duty',
    className: 'bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10'
  },
  Suspended: {
    label: 'Suspended',
    className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10'
  },
};

function StatusBadge({ status }: { status: DriverStatus }) {
  const config = STATUS_CONFIG[status];

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${config.className}`}>
      {config.label}
    </span>
  );
}

export function DriversTable({ drivers }: DriversTableProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left border-separate border-spacing-0">
        <thead className="bg-zinc-50/50 sticky top-0 z-10">
          <tr className="border-b border-zinc-200">
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              Driver Identity
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              Status
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              Contact
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              License Meta
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              Safety Score
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200">
              EXPIRY
            </th>
            <th className="px-6 py-4 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 text-right">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {drivers.map((driver) => (
            <tr key={driver.id} className="bg-white hover:bg-zinc-50 transition-colors group cursor-pointer">
              <td className="px-6 py-4 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-xs">
                    {driver.full_name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-900 leading-none">
                      {driver.full_name}
                    </span>
                    <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-tighter">ID: {driver.id.slice(0, 8)}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 border-b border-zinc-50">
                <StatusBadge status={driver.status} />
              </td>
              <td className="px-6 py-4 border-b border-zinc-50">
                <div className="flex flex-col">
                  <span className="text-zinc-700 font-medium tabular-nums text-xs">{driver.phone_number}</span>
                  <span className="text-[10px] text-zinc-400">Primary Contact</span>
                </div>
              </td>
              <td className="px-6 py-4 border-b border-zinc-50">
                <div className="flex flex-col">
                  <span className="text-zinc-700 font-bold text-xs font-mono">{driver.license_number}</span>
                  <span className="text-[10px] text-zinc-500 uppercase font-medium">{driver.license_class.replace(/_/g, ' ')}</span>
                </div>
              </td>
              <td className="px-6 py-4 border-b border-zinc-50">
                <div className="flex items-center gap-3">
                  <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${driver.safety_score > 80 ? 'bg-emerald-500' :
                        driver.safety_score > 60 ? 'bg-amber-500' : 'bg-red-500'
                        }`}
                      style={{ width: `${driver.safety_score}%` }}
                    ></div>
                  </div>
                  <span className="text-zinc-900 font-bold text-xs tabular-nums">{driver.safety_score}%</span>
                </div>
              </td>
              <td className="px-6 py-4 border-b border-zinc-50">
                <span className={`text-xs font-semibold tabular-nums ${new Date(driver.license_expiry) < new Date() ? 'text-red-600' : 'text-zinc-600'
                  }`}>
                  {formatDate(driver.license_expiry)}
                </span>
              </td>
              <td className="px-6 py-4 text-right border-b border-zinc-50">
                <button className="p-1.5 rounded-md hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {drivers.length === 0 && (
        <div className="p-12 text-center bg-zinc-50/50">
          <p className="text-zinc-500 text-sm font-medium">No drivers found in registry</p>
        </div>
      )}
    </div>
  );
}
