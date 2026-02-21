import React, { useState, useMemo } from 'react';
import {
  Droplet,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Gauge,
  History,
  Download,
  Activity
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from 'recharts';
import {
  mockVehicles,
  mockTrips,
  mockExpenses,
} from '../../mocks/mockData';

const PRIMARY_INDIGO = '#4f46e5';
const ITEMS_PER_PAGE = 25;

export const OperationalAnalytics: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<string>('fuelEfficiency');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const analyticsData = useMemo(() => {
    const stats = mockVehicles.map(vehicle => {
      const trips = mockTrips.filter(t => t.vehicle_id === vehicle.id && t.status === 'Completed');
      const distance = trips.reduce((acc, t) => acc + (t.estimated_distance_km || 0), 0);
      const revenue = trips.reduce((acc, t) => acc + (t.expected_revenue || 0), 0);

      const expenses = mockExpenses.filter(e => e.vehicle_id === vehicle.id);
      const fuelExpenses = expenses.filter(e => e.category === 'Fuel');
      const maintenanceExpenses = expenses.filter(e => e.category === 'Maintenance');

      const fuelLiters = fuelExpenses.reduce((acc, e) => acc + (e.volume_liters || 0), 0);
      const fuelCost = fuelExpenses.reduce((acc, e) => acc + e.cost, 0);
      const maintenanceCost = maintenanceExpenses.reduce((acc, e) => acc + e.cost, 0);

      const fuelEfficiency = fuelLiters > 0 ? (distance / fuelLiters) : 0;

      const operationalCost = fuelCost + maintenanceCost;
      const netProfit = revenue - operationalCost;
      const roi = vehicle.acquisition_cost > 0 ? (netProfit / vehicle.acquisition_cost) : 0;

      return {
        id: vehicle.id,
        license_plate: vehicle.license_plate,
        category: vehicle.category,
        brand: vehicle.brand || 'Other',
        distance,
        fuelLiters,
        fuelEfficiency,
        revenue,
        operationalCost,
        roi: (roi * 100).toFixed(2), // Percentage
      };
    });

    const totalDistance = stats.reduce((acc, v) => acc + v.distance, 0);
    const totalFuelLiters = stats.reduce((acc, v) => acc + v.fuelLiters, 0);
    const overallEfficiency = totalFuelLiters > 0 ? totalDistance / totalFuelLiters : 0;

    const categoryData = Object.entries(
      stats.reduce((acc, v) => {
        if (!acc[v.category]) acc[v.category] = { dist: 0, fuel: 0 };
        acc[v.category].dist += v.distance;
        acc[v.category].fuel += v.fuelLiters;
        return acc;
      }, {} as Record<string, { dist: number, fuel: number }>)
    ).map(([name, data]) => ({
      name: name.replace(/_/g, ' '),
      efficiency: data.fuel > 0 ? Number((data.dist / data.fuel).toFixed(2)) : 0
    }));

    return { stats, overallEfficiency, totalDistance, totalFuelLiters, categoryData };
  }, []);

  const filtered = useMemo(() => {
    return analyticsData.stats
      .filter(v => {
        const matchesSearch = v.license_plate.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'All' || v.category === categoryFilter;
        return matchesSearch && matchesCategory;
      })
      .sort((a, b) => {
        const valA = (a as any)[sortField];
        const valB = (b as any)[sortField];
        if (sortDirection === 'asc') return valA > valB ? 1 : -1;
        return valA < valB ? 1 : -1;
      });
  }, [analyticsData, searchTerm, categoryFilter, sortField, sortDirection]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  const handleSort = (field: string) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('desc'); }
  };

  const handleExport = () => {
    const headers = ["Vehicle", "Category", "Brand", "Distance (km)", "Efficiency (km/L)", "Revenue", "ROI %"];
    const csvRows = [
      headers.join(","),
      ...filtered.map(v => [
        v.license_plate,
        v.category,
        v.brand,
        v.distance,
        v.fuelEfficiency.toFixed(2),
        v.revenue,
        v.roi
      ].join(","))
    ];

    const csvContent = csvRows.join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `operational_analytics_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <Activity className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Fleet Performance</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Operational Insights</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Live efficiency tracking across the fleet
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search plate..."
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
            Export Data
          </button>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <MetricCard label="Avg Efficiency" value={`${analyticsData.overallEfficiency.toFixed(2)} km/L`} subLabel="Fleet Average Efficiency" icon={Gauge} />
        <MetricCard label="Total Distance" value={`${analyticsData.totalDistance.toLocaleString()} km`} subLabel="Cumulative completed trips" icon={TrendingUp} />
        <MetricCard label="Fuel Consumed" value={`${analyticsData.totalFuelLiters.toLocaleString()} L`} subLabel="Fleet-wide fuel consumption" icon={Droplet} />
      </div>

      {/* Charts Section */}
      <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-zinc-900">Efficiency Trends</h3>
            <p className="text-[11px] text-zinc-500">Resource efficiency across vehicle categories</p>
          </div>
          <div className="flex items-center gap-2 bg-zinc-50 p-1 rounded-md border border-zinc-200">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-tighter">Efficiency KM/L</span>
          </div>
        </div>
        <div className="p-6 h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#71717a', fontSize: 10, fontWeight: 600 }}
              />
              <Tooltip
                cursor={{ fill: '#F4F4F5' }}
                contentStyle={{ borderRadius: '8px', border: '1px solid #E4E4E7', boxShadow: 'none', fontSize: '11px', fontWeight: 'bold' }}
              />
              <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} fill={PRIMARY_INDIGO}>
                {analyticsData.categoryData.map((_, index) => (
                  <Cell key={`cell-${index}`} fillOpacity={0.9} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-white border border-zinc-200 p-1 rounded-md shadow-sm">
          <button
            onClick={() => setCategoryFilter('All')}
            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${categoryFilter === 'All' ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
          >
            All Categories
          </button>
          {['Bike', '3_Wheeler', 'Mini_Truck', 'Medium_Truck', 'Heavy_Truck'].map(cat => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase transition-all ${categoryFilter === cat ? 'bg-indigo-600 text-white' : 'text-zinc-500 hover:text-zinc-900'}`}
            >
              {cat.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead>
              <tr className="bg-zinc-50/50">
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Brand / Registry</th>
                <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('license_plate')}>
                  Plate Identifier
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('fuelEfficiency')}>
                  Efficiency
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('revenue')}>
                  Total Gross (₹)
                </th>
                <th className="px-6 py-4 text-right text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100 cursor-pointer" onClick={() => handleSort('roi')}>
                  ROI Yield
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
                  <td className="px-6 py-4 text-right">
                    <span className="text-xs font-bold text-zinc-900 tabular-nums">{v.fuelEfficiency.toFixed(1)}</span>
                    <span className="text-[9px] text-zinc-400 ml-1 font-bold uppercase tracking-tighter">km/L</span>
                  </td>
                  <td className="px-6 py-4 text-right text-emerald-600 text-xs font-black tabular-nums">
                    ₹{v.revenue.toLocaleString('en-IN')}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-black tabular-nums ring-1 ring-inset ${Number(v.roi) > 5 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/10' : 'bg-amber-50 text-amber-700 ring-amber-600/10'
                      }`}>
                      {v.roi}%
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
