import React, { useState, useMemo } from 'react';
import { ChevronDown, Download, Calendar } from 'lucide-react';
import { mockTrips, mockVehicles, mockDrivers } from '../../mocks/mockData';

export const DetailedReportView: React.FC = () => {
  const [reportType, setReportType] = useState<'trips' | 'expenses' | 'maintenance'>('trips');

  const data = useMemo(() => {
    if (reportType === 'trips') {
      return mockTrips.map(t => ({
        id: t.id,
        date: t.created_at,
        asset: mockVehicles.find(v => v.id === t.vehicle_id)?.license_plate || t.vehicle_id,
        operator: mockDrivers.find(d => d.id === t.driver_id)?.full_name || t.driver_id,
        status: t.status,
        metric: `${t.estimated_distance_km} km`,
        value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.expected_revenue || 0)
      }));
    }
    return [];
  }, [reportType]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-bold text-[#111827]">Detailed Reports</h1>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 border border-[#E5E7EB] px-4 py-2 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors">
            <Calendar className="w-4 h-4 text-gray-400" />
            Last 30 Days
            <ChevronDown className="w-4 h-4 text-gray-400" />
          </button>
          <button className="bg-[#2CC197] text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-[#25a884] transition-colors shadow-sm">
            <Download className="w-4 h-4" />
            Export All
          </button>
        </div>
      </div>

      <div className="flex gap-1 border-b border-[#F3F4F6]">
        <ReportTab active={reportType === 'trips'} label="Trip Logs" onClick={() => setReportType('trips')} />
        <ReportTab active={reportType === 'expenses'} label="Expense Ledger" onClick={() => setReportType('expenses')} />
        <ReportTab active={reportType === 'maintenance'} label="Service History" onClick={() => setReportType('maintenance')} />
      </div>

      <div className="bg-white border border-[#F3F4F6] rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-left">
          <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider">
            <tr>
              <th className="px-6 py-4">Date / Time</th>
              <th className="px-6 py-4">Asset ID</th>
              <th className="px-6 py-4">Operator</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Primary Metric</th>
              <th className="px-6 py-4 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-[#F3F4F6]">
            {data.length > 0 ? data.map((item: any) => (
              <tr key={item.id} className="hover:bg-[#F9FAFB] transition-colors">
                <td className="px-6 py-4 text-xs font-medium text-[#6B7280]">{new Date(item.date).toLocaleString()}</td>
                <td className="px-6 py-4 font-bold text-[#111827]">{item.asset}</td>
                <td className="px-6 py-4 text-xs font-semibold text-[#111827]">{item.operator}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-tight ${item.status === 'Completed' ? 'bg-[#F0FDF4] text-[#166534]' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right font-bold text-xs text-[#111827]">{item.metric}</td>
                <td className="px-6 py-4 text-right font-bold text-[13px] text-[#2CC197]">{item.value}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-400 text-sm font-medium">No records found for this period.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ReportTab = ({ active, label, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-3 text-[11px] font-bold uppercase tracking-widest transition-all border-b-2 ${active ? 'border-[#2CC197] text-[#111827]' : 'border-transparent text-gray-400 hover:text-gray-600'
      }`}
  >
    {label}
  </button>
);
