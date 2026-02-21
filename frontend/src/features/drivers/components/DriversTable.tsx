import { Driver, DriverStatus } from '@/types';
import { ChevronDown, FileText, Plus, Share2 } from 'lucide-react';

interface DriversTableProps {
  drivers: Driver[];
  isLoading: boolean;
}

const STATUS_CONFIG: Record<DriverStatus, { label: string; dotColor: string; bg: string; text: string }> = {
  Available: { label: 'Working', dotColor: 'bg-green-500', bg: 'bg-white', text: 'text-slate-700' },
  On_Duty: { label: 'Working', dotColor: 'bg-green-500', bg: 'bg-white', text: 'text-slate-700' },
  Off_Duty: { label: 'Without status', dotColor: 'bg-yellow-500', bg: 'bg-white', text: 'text-slate-700' },
  Suspended: { label: 'Blocked', dotColor: 'bg-red-500', bg: 'bg-white', text: 'text-slate-700' },
};

function StatusDropdown({ status }: { status: DriverStatus }) {
  const config = STATUS_CONFIG[status];
  
  return (
    <button className={`inline-flex items-center gap-2 px-3 py-1.5 rounded border border-slate-200 ${config.bg} ${config.text} text-sm`}>
      <span className={`w-2 h-2 rounded-full ${config.dotColor}`}></span>
      {config.label}
      <ChevronDown className="w-4 h-4 text-slate-400" />
    </button>
  );
}

export function DriversTable({ drivers, isLoading }: DriversTableProps) {
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  };

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
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">↕</span> Name
                </div>
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">↕</span> Status
                </div>
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">↕</span> Phone
                </div>
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">↕</span> License
                </div>
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                Safety Score
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                Documents
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                License Class
              </th>
              <th className="text-left text-xs font-medium text-slate-500 px-6 py-4">
                <div className="flex items-center gap-1">
                  <span className="text-slate-400">↕</span> License Expiry
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {drivers.map((driver) => (
              <tr key={driver.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <span className="text-[#10b981] font-medium cursor-pointer hover:underline">
                      {driver.full_name}
                    </span>
                    <Share2 className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" />
                  </div>
                </td>
                <td className="px-6 py-4">
                  <StatusDropdown status={driver.status} />
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{driver.phone_number}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{driver.license_number}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-[#10b981] h-2 rounded-full" 
                        style={{ width: `${driver.safety_score}%` }}
                      ></div>
                    </div>
                    <span className="text-slate-600 text-sm">{driver.safety_score}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-600">0/5</span>
                    <button className="w-6 h-6 rounded-full bg-slate-800 text-white flex items-center justify-center">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{driver.license_class.replace(/_/g, ' ')}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-slate-700">{formatDate(driver.license_expiry)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {drivers.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-slate-500">No drivers found</p>
        </div>
      )}
    </div>
  );
}
