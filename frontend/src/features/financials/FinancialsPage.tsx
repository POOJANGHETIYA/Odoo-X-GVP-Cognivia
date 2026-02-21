import { useFinancialStats } from './hooks/useFinancials';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip as RechartsTooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';
import { ArrowDownRight, IndianRupee, TrendingUp, History, Download } from 'lucide-react';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#71717a'];

export function FinancialsPage() {
  const stats = useFinancialStats();

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center p-20 animate-pulse">
        <div className="w-12 h-12 bg-zinc-100 rounded-full mb-4" />
        <div className="h-4 w-32 bg-zinc-100 rounded" />
      </div>
    );
  }

  const { totalExpenses, totalRevenue, netMargin, categoryData, monthlyTrend } = stats;

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);

  return (
    <div className="flex flex-col gap-8 pb-10 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 mb-1">
            <IndianRupee className="w-4 h-4" />
            <span className="text-[11px] font-bold uppercase tracking-wider">Treasury & Audits</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Financial Insights</h1>
          <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
            <History className="w-3.5 h-3.5" />
            Fiscal summary for Q1 2026
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-white text-zinc-700 font-bold px-4 py-2.5 rounded-md text-xs shadow-sm shadow-zinc-100/50 hover:bg-zinc-50 transition-all">
            <Download className="w-3.5 h-3.5" />
            Download Ledger
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-md text-xs shadow-sm shadow-indigo-100 transition-all active:scale-[0.98]">
            <TrendingUp className="w-3.5 h-3.5" />
            Financial Forecast
          </button>
        </div>
      </div>

      {/* Premium KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2.5 bg-indigo-50 rounded-lg text-indigo-600 ring-1 ring-inset ring-indigo-600/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-emerald-600/20">
              +12.5% YoY
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight mb-2">Total Managed Revenue</p>
          <h3 className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
            {formatCurrency(totalRevenue)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2.5 bg-red-50 rounded-lg text-red-600 ring-1 ring-inset ring-red-600/20">
              <ArrowDownRight className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-red-700 bg-red-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-red-600/20">
              +4.2% Cost
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight mb-2">Operational Overhead</p>
          <h3 className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
            {formatCurrency(totalExpenses)}
          </h3>
        </div>

        <div className="bg-white p-6 rounded-lg border border-zinc-200 shadow-sm relative overflow-hidden group">
          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-600 ring-1 ring-inset ring-emerald-600/20">
              <IndianRupee className="w-5 h-5" />
            </div>
            <span className="flex items-center text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full ring-1 ring-inset ring-indigo-600/20">
              Safe Margin
            </span>
          </div>
          <p className="text-zinc-500 text-xs font-bold uppercase tracking-tight mb-2">Net Operational Margin</p>
          <h3 className="text-3xl font-bold text-zinc-900 tabular-nums tracking-tight">
            {formatCurrency(netMargin)}
          </h3>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Revenue vs Expenses Trend */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Performance Analytics</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Rolling 6-month gross revenue vs expenditures</p>
          </div>
          <div className="p-6 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#71717a', fontWeight: 500 }}
                  tickFormatter={(val) => `₹${val / 1000}k`}
                />
                <RechartsTooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px' }}
                  itemStyle={{ fontWeight: 600 }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="revenue" fill="#6366f1" radius={[4, 4, 0, 0]} name="Gross Revenue" barSize={32} />
                <Bar dataKey="expenses" fill="#e4e4e7" radius={[4, 4, 0, 0]} name="Expenses" barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Distribution */}
        <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-5 border-b border-zinc-100 bg-zinc-50/30">
            <h2 className="text-base font-bold text-zinc-900 tracking-tight">Resource Allocation</h2>
            <p className="text-zinc-500 text-xs mt-0.5">Component-wise expense distribution</p>
          </div>
          <div className="p-6 h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={75}
                  outerRadius={105}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                >
                  {categoryData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} className="outline-none focus:outline-none" />
                  ))}
                </Pie>
                <RechartsTooltip
                  formatter={(value: any) => formatCurrency(value)}
                  contentStyle={{ borderRadius: '8px', border: '1px solid #e4e4e7', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  iconType="circle"
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600, paddingTop: '30px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
