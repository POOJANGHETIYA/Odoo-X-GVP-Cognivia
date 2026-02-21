import React, { useState, useMemo } from 'react';
import {
  Droplet,
  Search,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Gauge
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  mockVehicles,
  mockTrips,
  mockExpenses,
} from '../../mocks/mockData';

const PRIMARY_MINT = '#2CC197';
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
      name: name.replace('_', ' '),
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-bold text-[#111827]">Operational Analytics</h1>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search plate..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-[#E5E7EB] rounded-lg text-sm focus:ring-1 focus:ring-[#2CC197] focus:border-[#2CC197] outline-none w-64 text-gray-900"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-[#E5E7EB] text-gray-700 font-bold text-xs rounded-lg hover:bg-gray-50 transition-all shadow-sm">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export (CSV/PDF)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Avg Efficiency" value={`${analyticsData.overallEfficiency.toFixed(2)} km/L`} subLabel="Fleet Average" icon={Gauge} />
        <MetricCard label="Total Distance" value={`${analyticsData.totalDistance.toLocaleString()} km`} subLabel="Completed Trips" icon={TrendingUp} />
        <MetricCard label="Fuel Consumed" value={`${analyticsData.totalFuelLiters.toLocaleString()} L`} subLabel="Operational Fuel" icon={Droplet} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Efficiency Trends by Category</h3>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analyticsData.categoryData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#FAFAFA" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 10 }} />
              <Tooltip cursor={{ fill: '#F9FAFB' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Bar dataKey="efficiency" radius={[4, 4, 0, 0]} fill={PRIMARY_MINT} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-[#6B7280]">
          <div className="flex items-center gap-4">
            <span>Shown: 1-{paginated.length} of {filtered.length}</span>
            <select
              value={categoryFilter}
              onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }}
              className="bg-white border border-[#E5E7EB] rounded-lg px-3 py-1.5 focus:outline-none text-[11px] font-bold text-gray-700"
            >
              <option value="All">All Categories</option>
              <option value="Bike">Bike</option>
              <option value="3_Wheeler">3 Wheeler</option>
              <option value="Mini_Truck">Mini Truck</option>
              <option value="Medium_Truck">Medium Truck</option>
              <option value="Heavy_Truck">Heavy Truck</option>
            </select>
          </div>
        </div>

        <div className="border border-[#F3F4F6] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4 cursor-pointer text-[#3b82f6]" onClick={() => handleSort('license_plate')}>Plate number</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('fuelEfficiency')}>Efficiency</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('revenue')}>Total Rev. (₹)</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('roi')}>ROI (%)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F3F4F6]">
              {paginated.map((v) => (
                <tr key={v.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#111827]">{v.brand}</td>
                  <td className="px-6 py-4">
                    <span className="text-[#3B82F6] font-bold cursor-pointer hover:underline">{v.license_plate}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-2">
                      <span className="text-gray-900 font-bold text-xs">{v.fuelEfficiency.toFixed(1)} <span className="text-[10px] text-gray-400 font-normal">km/L</span></span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-[#10b981] font-bold">
                    ₹{v.revenue.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${Number(v.roi) > 5 ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {v.roi}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-4">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border border-[#E5E7EB] rounded-lg disabled:opacity-30 hover:bg-gray-50"><ChevronLeft className="w-4 h-4 text-gray-600" /></button>
        {[...Array(totalPages)].map((_, i) => (
          <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-all border ${currentPage === i + 1 ? 'bg-[#2CC197] text-white border-[#2CC197]' : 'bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50'}`}>{i + 1}</button>
        ))}
        <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border border-[#E5E7EB] rounded-lg disabled:opacity-30 hover:bg-gray-50"><ChevronRight className="w-4 h-4 text-gray-600" /></button>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, subLabel, icon: Icon }: any) => (
  <div className="bg-white border border-[#E5E7EB] rounded-xl p-5 hover:border-[#2CC197] transition-all group">
    <div className="flex justify-between items-start mb-2">
      <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">{label}</p>
      <Icon className="w-4 h-4 text-gray-300 group-hover:text-[#2CC197]" />
    </div>
    <div className="flex items-baseline gap-2">
      <p className="text-2xl font-bold text-[#111827] tracking-tight">{value}</p>
    </div>
    <p className="text-[10px] text-gray-400 mt-1 font-medium">{subLabel}</p>
  </div>
);
