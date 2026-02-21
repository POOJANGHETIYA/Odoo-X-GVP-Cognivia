import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useRevenueExpenseChart } from '../hooks/useDashboardData';
import { Loader2 } from 'lucide-react';

export function RevenueExpenseChart() {
  const { data, isLoading, isError } = useRevenueExpenseChart();

  if (isLoading) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center bg-slate-50/50 rounded-lg">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="w-full h-[350px] flex items-center justify-center bg-red-50/50 rounded-lg border border-red-100">
        <p className="text-red-500 font-medium">Failed to load chart data.</p>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="w-full h-[350px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 13 }}
            dy={10}
          />
          <YAxis
            tickFormatter={(value) => `₹${value / 1000}k`}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#64748b', fontSize: 13 }}
          />
          <Tooltip
            cursor={{ fill: '#f8fafc' }}
            formatter={(value: any) => [formatCurrency(value), undefined]}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Legend wrapperStyle={{ paddingTop: '20px' }} />
          <Bar dataKey="revenue" name="Revenue" fill="#3bb273" radius={[4, 4, 0, 0]} maxBarSize={40} />
          <Bar dataKey="expenses" name="Expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
