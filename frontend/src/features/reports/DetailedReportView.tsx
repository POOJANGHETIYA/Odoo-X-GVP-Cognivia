import React, { useState, useMemo } from 'react';
import { Download, Calendar, History, Receipt, Wrench, Search } from 'lucide-react';
import { mockTrips, mockVehicles, mockDrivers, mockExpenses, mockMaintenanceLogs, mockUsers } from '../../mocks/mockData';

export const DetailedReportView: React.FC = () => {
  const [reportType, setReportType] = useState<'trips' | 'expenses' | 'maintenance'>('trips');
  const [searchTerm, setSearchTerm] = useState('');

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  const data = useMemo(() => {
    let rawData: any[] = [];

    if (reportType === 'trips') {
      rawData = mockTrips.map(t => ({
        id: t.id,
        date: t.created_at,
        asset: mockVehicles.find(v => v.id === t.vehicle_id)?.license_plate || 'Unknown',
        operator: mockDrivers.find(d => d.id === t.driver_id)?.full_name || 'Unassigned',
        status: t.status,
        metric: `${t.estimated_distance_km} km`,
        value: formatCurrency(t.expected_revenue || 0),
        raw_value: t.expected_revenue || 0
      }));
    } else if (reportType === 'expenses') {
      rawData = mockExpenses.map(e => ({
        id: e.id,
        date: e.logged_at,
        asset: mockVehicles.find(v => v.id === e.vehicle_id)?.license_plate || 'Unknown',
        operator: mockUsers.find(u => u.id === e.logged_by)?.full_name || 'System',
        status: e.category,
        metric: e.description || 'General Expense',
        value: formatCurrency(e.cost),
        raw_value: e.cost
      }));
    } else if (reportType === 'maintenance') {
      rawData = (mockMaintenanceLogs as any[]).map(l => ({
        id: l.id,
        date: l.completed_date || l.scheduled_date,
        asset: mockVehicles.find(v => v.id === l.vehicle_id)?.license_plate || 'Unknown',
        operator: l.technician_name || 'Vendor',
        status: l.status,
        metric: (l.service_type || 'Maintenance').replace(/_/g, ' '),
        value: formatCurrency(l.cost),
        raw_value: l.cost
      }));
    }

    if (searchTerm) {
      const lowSearch = searchTerm.toLowerCase();
      return rawData.filter(item =>
        item.asset.toLowerCase().includes(lowSearch) ||
        item.operator.toLowerCase().includes(lowSearch) ||
        item.metric.toLowerCase().includes(lowSearch)
      );
    }

    return rawData;
  }, [reportType, searchTerm]);

  const handleExport = () => {
    const headers = ["Date", "Asset", "Operator", "Status", "Metric", "Value"];
    const csvRows = [
      headers.join(","),
      ...data.map(item => [
        `"${new Date(item.date).toLocaleString('en-IN')}"`,
        `"${item.asset}"`,
        `"${item.operator}"`,
        `"${item.status}"`,
        `"${item.metric}"`,
        item.raw_value
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `fleet_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <History className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Detailed Manifests</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Operational Ledger</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            Activity logs for performance analysis
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search manifest..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 border border-zinc-200 rounded-md text-xs font-medium focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none w-48 transition-all"
            />
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-md text-xs shadow-sm transition-all active:scale-[0.98] h-9"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 border-b border-zinc-100">
        <ReportTab
          active={reportType === 'trips'}
          label="Trip Logs"
          icon={Calendar}
          onClick={() => setReportType('trips')}
        />
        <ReportTab
          active={reportType === 'expenses'}
          label="Expense Ledger"
          icon={Receipt}
          onClick={() => setReportType('expenses')}
        />
        <ReportTab
          active={reportType === 'maintenance'}
          label="Service History"
          icon={Wrench}
          onClick={() => setReportType('maintenance')}
        />
      </div>

      {/* Unified Table Container */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
        <div className="overflow-x-auto min-h-[400px]">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Asset</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Operator/Vendor</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Type/Status</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Primary Manifest</th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Audit Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {data.length > 0 ? data.map((item: any) => (
                <tr key={item.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                  <td className="px-6 py-4 text-[11px] font-medium text-zinc-500 tabular-nums">
                    {new Date(item.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                    <span className="block text-[9px] text-zinc-300 mt-0.5">{new Date(item.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-zinc-900 tabular-nums">{item.asset}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-semibold text-zinc-700">{item.operator}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-tight ring-1 ring-inset ${item.status === 'Completed' || item.status === 'Fuel' || item.status === 'Scheduled'
                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10'
                      : 'bg-zinc-50 text-zinc-600 ring-zinc-500/10'
                      }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[11px] font-medium text-zinc-600 truncate max-w-[180px] block" title={item.metric}>
                      {item.metric}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-black text-indigo-600 tabular-nums">{item.value}</span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
                        <Search className="w-6 h-6 text-zinc-300" />
                      </div>
                      <p className="text-zinc-500 text-sm font-medium">No records found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Audit Summary Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/10 flex justify-between items-center text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
          <span>Manifest Records: {data.length}</span>
          <div className="flex items-center gap-2">
            <span>Aggregated Audit Value:</span>
            <span className="text-xs text-zinc-900 font-black tabular-nums">
              {formatCurrency(data.reduce((sum, item) => sum + (item.raw_value || 0), 0))}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReportTab = ({ active, label, icon: Icon, onClick }: any) => (
  <button
    onClick={onClick}
    className={`px-5 py-3 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 ${active ? 'border-indigo-600 text-zinc-900 bg-indigo-50/30' : 'border-transparent text-zinc-400 hover:text-zinc-600 hover:bg-zinc-50'
      }`}
  >
    <Icon className={`w-3.5 h-3.5 ${active ? 'text-indigo-600' : 'text-zinc-300'}`} />
    {label}
  </button>
);
