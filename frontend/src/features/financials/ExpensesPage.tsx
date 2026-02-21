import { useState, useMemo } from 'react';
import { useExpenseLogs } from './hooks/useFinancials';
import { Search, Filter, ArrowUpDown, ChevronDown, Plus, Fuel, Receipt, MoreHorizontal } from 'lucide-react';
import { AddExpenseModal } from './components/AddExpenseModal';

export function ExpensesPage() {
    const { data: logs, isLoading } = useExpenseLogs();
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return (logs as any[]).filter(l =>
            l.tripId.toLowerCase().includes(search.toLowerCase()) ||
            l.driver.toLowerCase().includes(search.toLowerCase())
        );
    }, [logs, search]);

    const stats = useMemo(() => {
        if (!filteredLogs.length) return { distance: 0, fuel: 0, misc: 0 };
        return filteredLogs.reduce((acc, current: any) => ({
            distance: acc.distance + parseInt(current.distance.split(' ')[0]),
            fuel: acc.fuel + current.fuelExpense,
            misc: acc.misc + current.miscExpense,
        }), { distance: 0, fuel: 0, misc: 0 });
    }, [filteredLogs]);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Loading expenses...</div>;

    return (
        <div className="flex flex-col gap-6 pb-8">
            <div className="flex flex-col gap-1">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight text-[24px]">Expenses</h1>
                <p className="text-sm text-slate-500">Aggregated financial tracking for your fleet operations</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Total Distance</p>
                    <div className="flex items-end gap-2">
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{stats.distance.toLocaleString()}</h3>
                        <span className="text-xs font-bold text-slate-400 mb-1">km</span>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Fuel Expense</p>
                    <div className="flex items-end gap-2">
                        <span className="text-lg font-bold text-slate-400 mb-0.5">₹</span>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{stats.fuel.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm transition-all hover:shadow-md">
                    <p className="text-slate-500 text-[11px] font-bold uppercase tracking-wider mb-1">Misc. Expense</p>
                    <div className="flex items-end gap-2">
                        <span className="text-lg font-bold text-slate-400 mb-0.5">₹</span>
                        <h3 className="text-2xl font-black text-slate-900 leading-none">{stats.misc.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-2">
                <div className="flex-1 max-w-xl relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search trip number or driver..."
                        className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#3bb273]/20 focus:border-[#3bb273] shadow-sm transition-all"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            Group by <ChevronDown className="w-3 h-3" />
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <Filter className="w-3 h-3" /> Filter
                        </button>
                        <button className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-50">
                            <ArrowUpDown className="w-3 h-3" /> Sort by <ChevronDown className="w-3 h-3" />
                        </button>
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-[#3bb273] text-white text-xs font-bold rounded-lg hover:bg-[#329a63] shadow-md shadow-[#3bb273]/20 transition-all ml-4"
                    >
                        <Plus className="w-4 h-4" /> Add an Expense
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[11px] uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Trip ID</th>
                            <th className="px-6 py-4">Driver</th>
                            <th className="px-6 py-4">Distance</th>
                            <th className="px-6 py-4">Fuel Expense</th>
                            <th className="px-6 py-4">Misc. Expen</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4"></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {(filteredLogs as any[]).map((log) => (
                            <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4 font-bold text-slate-900">{log.tripId}</td>
                                <td className="px-6 py-4 text-slate-600 font-medium">{log.driver}</td>
                                <td className="px-6 py-4 text-slate-500 font-mono text-[13px]">{log.distance}</td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                        <Fuel className="w-3.5 h-3.5 text-slate-400" />
                                        ₹{log.fuelExpense.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                                        <Receipt className="w-3.5 h-3.5 text-slate-400" />
                                        ₹{log.miscExpense.toLocaleString()}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${log.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                        log.status === 'In_Transit' ? 'bg-blue-100 text-blue-700' :
                                            'bg-slate-100 text-slate-600'
                                        }`}>
                                        {log.status.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors opacity-0 group-hover:opacity-100">
                                        <MoreHorizontal className="w-4 h-4 text-slate-500" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredLogs.length === 0 && (
                    <div className="py-20 text-center flex flex-col items-center gap-3">
                        <div className="p-4 bg-slate-50 rounded-full">
                            <Receipt className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-400 font-medium">No expense entries found</p>
                    </div>
                )}
            </div>

            <AddExpenseModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={(data) => {
                    console.log('New Expense:', data);
                    // In a real app, this would call a mutation
                    alert('Expense created locally! (Mock)');
                }}
            />
        </div>
    );
}
