import { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import { useVehicles } from './hooks/useVehicles';
import { VehiclesTable } from './components/VehiclesTable';
import { FiltersPanel, VehicleFilters } from './components/FiltersPanel';
import { AddVehicleModal } from './components/AddVehicleModal';

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
        <div className="flex flex-col h-full pb-6">
            {/* Top Bar */}
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight text-[24px]">Vehicle Registry</h1>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-1.5 bg-[#3bb273] hover:bg-[#2da061] text-white font-semibold px-4 py-2 rounded-lg text-sm shadow-sm transition-colors"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add Vehicle
                    </button>
                    <FiltersPanel filters={filters} onChange={handleFiltersChange} />
                </div>
            </div>

            {/* Sub-bar: Records per page + Pagination info */}
            {!isLoading && !isError && (
                <div className="flex items-center gap-3 mb-3 text-sm text-slate-500">
                    <span>Records on the page:</span>
                    <select
                        value={pageSize}
                        onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                        className="border border-slate-300 rounded-md px-2 py-0.5 text-sm text-slate-700 bg-white focus:outline-none focus:border-[#3bb273] cursor-pointer"
                    >
                        {PAGE_SIZE_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                        ))}
                    </select>
                    {totalCount > 0 && (
                        <span className="text-slate-400">
                            Showing {pageStart}–{pageEnd} of {totalCount}
                        </span>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex-1">
                {isLoading ? (
                    <div className="flex items-center justify-center py-24 text-slate-400 gap-3">
                        <div className="w-5 h-5 rounded-full border-2 border-slate-300 border-t-[#3bb273] animate-spin" />
                        <span className="text-sm">Loading vehicles…</span>
                    </div>
                ) : isError ? (
                    <div className="flex flex-col items-center justify-center py-24 text-red-500 gap-2">
                        <p className="font-medium text-sm">Failed to load vehicles.</p>
                        <p className="text-xs text-slate-400">Please refresh the page and try again.</p>
                    </div>
                ) : (
                    <>
                        <VehiclesTable vehicles={pagedVehicles} />

                        {/* Pagination footer */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/60">
                                <span className="text-xs text-slate-500">
                                    Page {currentPage} of {totalPages}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setPage(1)}
                                        disabled={currentPage === 1}
                                        className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >«</button>
                                    <button
                                        onClick={() => setPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >‹</button>
                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        const p = Math.max(1, Math.min(totalPages - 4, currentPage - 2)) + i;
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`px-2.5 py-1 text-xs rounded border transition-colors ${p === currentPage
                                                    ? 'bg-[#3bb273] border-[#3bb273] text-white font-semibold'
                                                    : 'border-slate-200 text-slate-600 hover:bg-slate-100'
                                                    }`}
                                            >{p}</button>
                                        );
                                    })}
                                    <button
                                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >›</button>
                                    <button
                                        onClick={() => setPage(totalPages)}
                                        disabled={currentPage === totalPages}
                                        className="px-2.5 py-1 text-xs rounded border border-slate-200 text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >»</button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {showAddModal && <AddVehicleModal onClose={() => setShowAddModal(false)} />}
        </div>
    );
}
