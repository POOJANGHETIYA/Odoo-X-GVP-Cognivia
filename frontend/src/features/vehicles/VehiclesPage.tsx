import { useState, useMemo } from 'react';
import { Plus, LayoutGrid, List, Search } from 'lucide-react';
import { useVehicles } from './hooks/useVehicles';
import { VehiclesTable } from './components/VehiclesTable';
import { FiltersPanel, VehicleFilters } from './components/FiltersPanel';
import { AddVehicleModal } from './components/AddVehicleModal';
import { Skeleton } from '@/components/ui/Skeleton';

const defaultFilters: VehicleFilters = {
    search: '',
    status: '',
    category: '',
    capacityMin: '',
    capacityMax: '',
    odometerMin: '',
    odometerMax: '',
};

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export function VehiclesPage() {
    const { data: vehicles, isLoading, isError } = useVehicles();
    const [filters, setFilters] = useState<VehicleFilters>(defaultFilters);
    const [showAddModal, setShowAddModal] = useState(false);
    const [pageSize, setPageSize] = useState(25);
    const [page, setPage] = useState(1);

    const filteredVehicles = useMemo(() => {
        if (!vehicles) return [];
        return vehicles.filter((v) => {
            if (filters.search && !v.license_plate.toLowerCase().includes(filters.search.toLowerCase())) return false;
            if (filters.status && v.status !== filters.status) return false;
            if (filters.category && v.category !== filters.category) return false;
            if (filters.capacityMin && v.capacity_kg < Number(filters.capacityMin)) return false;
            if (filters.capacityMax && v.capacity_kg > Number(filters.capacityMax)) return false;
            if (filters.odometerMin && v.current_odometer < Number(filters.odometerMin)) return false;
            if (filters.odometerMax && v.current_odometer > Number(filters.odometerMax)) return false;
            return true;
        });
    }, [vehicles, filters]);

    const totalCount = filteredVehicles.length;
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const currentPage = Math.min(page, totalPages);
    const pageStart = (currentPage - 1) * pageSize + 1;
    const pageEnd = Math.min(currentPage * pageSize, totalCount);
    const pagedVehicles = filteredVehicles.slice((currentPage - 1) * pageSize, currentPage * pageSize);

    const handlePageSizeChange = (size: number) => {
        setPageSize(size);
        setPage(1);
    };

    const handleFiltersChange = (f: VehicleFilters) => {
        setFilters(f);
        setPage(1);
    };

    return (
        <div className="flex flex-col h-full max-w-[1600px] mx-auto">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Vehicle Registry</h1>
                    <p className="text-sm text-zinc-500 mt-1">Manage and monitor your entire fleet assets and their operational status.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-md text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]"
                    >
                        <Plus className="w-4 h-4" />
                        Add Vehicle
                    </button>
                    <FiltersPanel filters={filters} onChange={handleFiltersChange} />
                </div>
            </div>

            {/* Main Content Area */}
            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm overflow-hidden flex flex-col flex-1 min-h-[500px]">
                {/* Table Header/Toolbar */}
                <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/30 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <input
                                type="text"
                                placeholder="Quick search plate..."
                                className="pl-9 pr-3 py-1.5 bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-64 transition-all"
                                value={filters.search}
                                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
                            />
                        </div>
                        <div className="h-4 w-[1px] bg-zinc-200" />
                        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-md">
                            <button className="p-1.5 bg-white shadow-sm rounded text-zinc-900"><List className="w-4 h-4" /></button>
                            <button className="p-1.5 text-zinc-500 hover:text-zinc-900"><LayoutGrid className="w-4 h-4" /></button>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 text-sm text-zinc-500">
                        <span className="font-medium">Rows per page:</span>
                        <select
                            value={pageSize}
                            onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                            className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs font-semibold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                        >
                            {PAGE_SIZE_OPTIONS.map((s) => (
                                <option key={s} value={s}>{s}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table or Loading Side */}
                <div className="flex-1 overflow-auto">
                    {isLoading ? (
                        <div className="p-0">
                            <div className="bg-zinc-50/50 border-b border-zinc-200 h-10 w-full" />
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4 border-b border-zinc-100 animate-pulse">
                                    <Skeleton className="h-10 w-10 rounded-md" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                    <Skeleton className="h-6 w-24 rounded-md" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            ))}
                        </div>
                    ) : isError ? (
                        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 bg-zinc-50/20">
                            <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">!</div>
                            <p className="font-semibold text-zinc-900">Failed to load vehicles</p>
                            <p className="text-sm mt-1">Please try refreshing your browser.</p>
                        </div>
                    ) : (
                        <VehiclesTable vehicles={pagedVehicles} />
                    )}
                </div>

                {/* Pagination footer */}
                {!isLoading && !isError && totalCount > 0 && (
                    <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 bg-zinc-50/30">
                        <span className="text-xs font-medium text-zinc-500">
                            Showing <span className="text-zinc-900 font-bold tabular-nums">{pageStart}</span> to <span className="text-zinc-900 font-bold tabular-nums">{pageEnd}</span> of <span className="text-zinc-900 font-bold tabular-nums">{totalCount}</span> entries
                        </span>

                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 mr-4">
                                <span className="text-xs text-zinc-400">Page</span>
                                <span className="text-xs font-bold text-zinc-900 tabular-nums">{currentPage}</span>
                                <span className="text-xs text-zinc-400">of</span>
                                <span className="text-xs font-bold text-zinc-900 tabular-nums">{totalPages}</span>
                            </div>

                            <div className="flex items-center gap-1">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1.5 text-xs font-semibold rounded-md border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
