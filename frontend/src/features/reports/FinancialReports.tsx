import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  CreditCard,
  Download,
  IndianRupee,
  History,
  PieChart as PieChartIcon,
  BarChart3
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';
import {
  mockVehicles,
  mockTrips,
  mockExpenses,
  mockMaintenanceLogs
} from '../../mocks/mockData';

const BRAND_COLORS: Record<string, string> = {
  'Tata': '#4f46e5',
  'Mahindra': '#6366f1',
  'Ashok Leyland': '#818cf8',
  'Eicher': '#a5b4fc',
  'Force Motors': '#c7d2fe',
  'Toyota': '#e0e7ff',
  'Ford': '#312e81',
  'Bajaj': '#3730a3'
};

const ITEMS_PER_PAGE = 25;

export const FinancialReports: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('roi');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const financialsData = useMemo(() => {
    const stats = mockVehicles.map(vehicle => {
      const trips = mockTrips.filter(t => t.vehicle_id === vehicle.id && t.status === 'Completed');
      const revenue = trips.reduce((acc, t) => acc + (t.expected_revenue || 0), 0);

      const fuelCost = mockExpenses.filter(e => e.vehicle_id === vehicle.id && e.category === 'Fuel')
        .reduce((acc, e) => acc + (e.cost || 0), 0);

      const maintenanceCost = mockMaintenanceLogs.filter(m => m.vehicle_id === vehicle.id)
        .reduce((acc, m) => acc + (m.cost || 0), 0);

      const acquisitionCost = vehicle.acquisition_cost || 0;
      const totalOpCost = fuelCost + maintenanceCost;
      const roi = acquisitionCost > 0 ? ((revenue - totalOpCost) / acquisitionCost) : 0;

      return {
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        brand: vehicle.brand || 'Other',
        revenue,
        totalOpCost,
        acquisitionCost,
        roi
      };
    });

    const totalRevenue = stats.reduce((acc, v) => acc + v.revenue, 0);
    const totalOpCost = stats.reduce((acc, v) => acc + v.totalOpCost, 0);
    const totalAcquisition = stats.reduce((acc, v) => acc + v.acquisitionCost, 0);
    const overallROI = totalAcquisition > 0 ? (totalRevenue - totalOpCost) / totalAcquisition : 0;

    const brandData = Object.entries(
      stats.reduce((acc, v) => {
        acc[v.brand] = (acc[v.brand] || 0) + v.revenue;
        return acc;
      }, {} as Record<string, number>)
    ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([name, value]) => ({ name, value }));

    return { stats, totalRevenue, totalOpCost, overallROI, brandData };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  const filtered = useMemo(() => {
    return financialsData.stats
      .filter(v => v.license_plate.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort((a, b) => {
        const valA = (a as any)[sortField];
        const valB = (b as any)[sortField];
        if (sortDirection === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [financialsData, searchTerm, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const handleExport = () => {
    const headers = ["Asset", "Brand", "Gross Revenue", "Operational Cost", "Acquisition Cost", "ROI %"];
    const csvRows = [
      headers.join(","),
      ...filtered.map(v => [
        v.license_plate,
        v.brand,
        v.revenue,
        v.totalOpCost,
        v.acquisitionCost,
        (v.roi * 100).toFixed(2)
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `financial_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Treasury Audits</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Capital Analytics</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Fiscal performance and ROI tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search assets..."
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
            Export Ledger
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard label="Total Revenue" value={formatCurrency(financialsData.totalRevenue)} subLabel="All-time gross revenue" icon={BarChart3} />
        <MetricCard label="Operational Cost" value={formatCurrency(financialsData.totalOpCost)} subLabel="Fuel + Maintenance overhead" icon={CreditCard} />
        <MetricCard label="Fleet ROI" value={`${(financialsData.overallROI * 100).toFixed(2)}%`} subLabel="Performance yield on capital" icon={TrendingUp} />
      </div>

      {/* Brand Distribution Chart */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Revenue Contribution</h3>
            <p className="text-[11px] text-zinc-500">Gross revenue distribution by manufacturing brand</p>
          </div>
          <div className="p-1.5 bg-zinc-50 rounded-md border border-zinc-200">
            <PieChartIcon className="w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>
        <div className="p-6 h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={financialsData.brandData}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={100}
                paddingAngle={8}
                dataKey="value"
                stroke="none"
              >
                {financialsData.brandData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={BRAND_COLORS[entry.name] || '#94a3b8'} />
                ))}
              </Pie>
              <Tooltip
                formatter={(val: any) => formatCurrency(val)}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E4E4E7', boxShadow: 'none', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                formatter={(value) => <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter ml-1">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Financial Ledger Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden mb-8">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Asset Identity</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('license_plate')}>
                  Registry Number
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('revenue')}>
                  Gross Revenue
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('totalOpCost')}>
                  Op. Overhead
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('roi')}>
                  ROI Performance
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {paginated.map((v) => (
                <tr key={v.id} className="hover:bg-zinc-50/50 transition-colors cursor-pointer group">
                  <td className="px-6 py-4 font-bold text-zinc-900 text-xs">{v.brand}</td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-bold text-indigo-600 tabular-nums">{v.license_plate}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 text-xs font-black tabular-nums">{formatCurrency(v.revenue)}</td>
                  <td className="px-6 py-4 text-right font-bold text-[11px] text-zinc-400 tabular-nums">{formatCurrency(v.totalOpCost)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tabular-nums ring-1 ring-inset ${(v.roi * 100) > 15 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : (v.roi * 100) > 0 ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/10' : 'bg-rose-50 text-rose-700 ring-rose-600/10'
                      }`}>
                      {(v.roi * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-1 pb-10">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(p => p - 1)}
          className="p-2 border border-zinc-200 rounded-md disabled:opacity-30 hover:bg-zinc-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-zinc-600" />
        </button>
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`w-9 h-9 rounded-md text-[11px] font-bold transition-all border ${currentPage === i + 1 ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-200' : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
              }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(p => p + 1)}
          className="p-2 border border-zinc-200 rounded-md disabled:opacity-30 hover:bg-zinc-50 transition-colors"
        >
          <ChevronRight className="w-4 h-4 text-zinc-600" />
        </button>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon }: any) => (
  <div className="bg-white border border-zinc-200 rounded-lg p-5 hover:border-indigo-500 shadow-sm transition-all group relative overflow-hidden">
    <div className="absolute right-0 top-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
      <Icon className="w-16 h-16" />
    </div>
    <div className="flex justify-between items-start mb-3">
      <p className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <div className="p-1.5 bg-zinc-50 rounded-md border border-zinc-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 transition-colors">
        <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-indigo-600" />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-black text-zinc-900 tracking-tight tabular-nums">{value}</p>
    </div>
    <p className="text-[10px] text-zinc-500 mt-1 font-bold">{subLabel}</p>
  </div>
);
