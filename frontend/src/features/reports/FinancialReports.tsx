import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  DollarSign,
  TrendingUp,
  CreditCard,
  Download
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
  'Tata': '#3b82f6',
  'Mahindra': '#ef4444',
  'Ashok Leyland': '#10b981',
  'Eicher': '#f59e0b',
  'Force Motors': '#8b5cf6',
  'Toyota': '#06b6d4',
  'Ford': '#2563eb',
  'Bajaj': '#6366f1'
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
    ).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, value]) => ({ name, value }));

    return { stats, totalRevenue, totalOpCost, overallROI, brandData };
  }, []);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val);
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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-[32px] font-bold text-[#111827]">Financial Reports</h1>
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard label="Total Revenue" value={formatCurrency(financialsData.totalRevenue)} subLabel="All Completed Trips" icon={DollarSign} />
        <MetricCard label="Operational Cost" value={formatCurrency(financialsData.totalOpCost)} subLabel="Fuel + Maintenance" icon={CreditCard} />
        <MetricCard label="Fleet ROI" value={`${(financialsData.overallROI * 100).toFixed(2)}%`} subLabel="Performance yield" icon={TrendingUp} />
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h3 className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-6">Revenue Distribution by Brand</h3>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={financialsData.brandData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={5} dataKey="value">
                {financialsData.brandData.map((entry, index) => <Cell key={`cell-${index}`} fill={BRAND_COLORS[entry.name] || '#94a3b8'} />)}
              </Pie>
              <Tooltip formatter={(val: any) => formatCurrency(val)} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
              <Legend verticalAlign="bottom" height={36} iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between text-sm text-[#6B7280]">
          <span>Shown: 1-{paginated.length} of {filtered.length} records</span>
          <button className="text-[#3b82f6] font-bold text-xs flex items-center gap-1 hover:underline">
            <Download className="w-3 h-3" /> Export Detailed Ledger
          </button>
        </div>

        <div className="border border-[#F3F4F6] rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left">
            <thead className="bg-[#F9FAFB] border-b border-[#F3F4F6] text-[#9CA3AF] text-[11px] font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Brand</th>
                <th className="px-6 py-4 cursor-pointer text-[#3b82f6]" onClick={() => handleSort('license_plate')}>Plate number</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('revenue')}>Revenue</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('totalOpCost')}>Op. Cost</th>
                <th className="px-6 py-4 text-right cursor-pointer" onClick={() => handleSort('roi')}>ROI %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-[#F3F4F6]">
              {paginated.map((v) => (
                <tr key={v.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4 font-bold text-[#111827]">{v.brand}</td>
                  <td className="px-6 py-4">
                    <span className="text-[#3B82F6] font-bold hover:underline cursor-pointer">{v.license_plate}</span>
                  </td>
                  <td className="px-6 py-4 text-right text-[#111827] font-bold">{formatCurrency(v.revenue)}</td>
                  <td className="px-6 py-4 text-right text-[#6B7280] font-semibold text-xs">{formatCurrency(v.totalOpCost)}</td>
                  <td className="px-6 py-4 text-right">
                    <span className={`font-bold text-sm ${(v.roi * 100) > 15 ? 'text-[#2CC197]' : (v.roi * 100) > 0 ? 'text-[#3B82F6]' : 'text-rose-500'}`}>
                      {(v.roi * 100).toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-center gap-1.5 pb-8">
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
    <p className="text-2xl font-bold text-[#111827] tracking-tight">{value}</p>
    <p className="text-[10px] text-gray-400 mt-2 font-medium">{subLabel}</p>
  </div>
);
