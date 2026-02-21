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
import { ArrowDownRight, DollarSign, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

const COLORS = ['#3bb273', '#4d9de0', '#e15554', '#7768ae', '#eb9486'];

export function FinancialsPage() {
    const stats = useFinancialStats();

    if (!stats) {
        return <div className="p-8 text-center text-slate-500">Loading financials...</div>;
    }

    const { totalExpenses, totalRevenue, netMargin, categoryData, monthlyTrend } = stats;

    return (
        <div className="flex flex-col gap-6 pb-8">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">Financial Operations</h1>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">Last 6 Months Data</span>
                </div>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-green-50 rounded-lg text-[#3bb273]">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-[11px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded">
                            +12.5%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Revenue</p>
                    <h3 className="text-2xl font-bold text-slate-900">₹{totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-red-50 rounded-lg text-[#e15554]">
                            <ArrowDownRight className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-[11px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                            +4.2%
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Total Expenses</p>
                    <h3 className="text-2xl font-bold text-slate-900">₹{totalExpenses.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                </div>

                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-[#4d9de0]">
                            <DollarSign className="w-5 h-5" />
                        </div>
                        <span className="flex items-center text-[11px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                            Stable
                        </span>
                    </div>
                    <p className="text-slate-500 text-xs font-medium uppercase tracking-wider mb-1">Net Margin</p>
                    <h3 className="text-2xl font-bold text-slate-900">₹{netMargin.toLocaleString(undefined, { maximumFractionDigits: 0 })}</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue vs Expenses Trend */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Monthly Cash Flow</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                                    tickFormatter={(val) => `₹${val / 1000}k`}
                                />
                                <RechartsTooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                                />
                                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                                <Bar dataKey="revenue" fill="#3bb273" radius={[4, 4, 0, 0]} name="Revenue" />
                                <Bar dataKey="expenses" fill="#e15554" radius={[4, 4, 0, 0]} name="Expenses" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Expense Distribution */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="w-4 h-4 text-slate-400" />
                        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">Expense Distribution</h2>
                    </div>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((_entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    formatter={(value: any) => `₹${Number(value).toLocaleString()}`}
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend
                                    verticalAlign="bottom"
                                    align="center"
                                    layout="horizontal"
                                    wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
