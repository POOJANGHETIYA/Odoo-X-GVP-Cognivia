import { useRef, useEffect, useState } from 'react';
import { SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { VehicleCategory, VehicleStatus } from '@/types';

export interface VehicleFilters {
    search: string;
    status: VehicleStatus | '';
    category: VehicleCategory | '';
    capacityMin: string;
    capacityMax: string;
    odometerMin: string;
    odometerMax: string;
}

interface FiltersPanelProps {
    filters: VehicleFilters;
    onChange: (filters: VehicleFilters) => void;
}

const defaultFilters: VehicleFilters = {
    search: '',
    status: '',
    category: '',
    capacityMin: '',
    capacityMax: '',
    odometerMin: '',
    odometerMax: '',
};

const inputClass =
    'w-full px-3 py-2 rounded-lg border border-slate-200 text-sm text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-[#3bb273] focus:ring-2 focus:ring-[#3bb273]/20 transition-colors';

export function FiltersPanel({ filters, onChange }: FiltersPanelProps) {
    const [open, setOpen] = useState(false);
    const panelRef = useRef<HTMLDivElement>(null);

    // Count active filters
    const activeCount = Object.values(filters).filter(Boolean).length;

    const set = (key: keyof VehicleFilters) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
            onChange({ ...filters, [key]: e.target.value });

    const reset = () => onChange({ ...defaultFilters });

    // Close on outside click
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [open]);

    return (
        <div className="relative" ref={panelRef}>
            {/* Trigger Button */}
            <button
                onClick={() => setOpen((o) => !o)}
                className={`inline-flex items-center gap-2 h-[42px] px-4 rounded-lg border text-sm font-medium transition-all
                    ${open
                        ? 'bg-[#3bb273] border-[#3bb273] text-white shadow-sm'
                        : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-50'
                    }`}
            >
                <SlidersHorizontal className="w-4 h-4 shrink-0" />
                <span>Filters</span>
                {activeCount > 0 && (
                    <span className={`inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full text-[11px] font-bold
                        ${open ? 'bg-white text-[#3bb273]' : 'bg-[#3bb273] text-white'}`}>
                        {activeCount}
                    </span>
                )}
                <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown — right-aligned to prevent overflow */}
            {open && (
                <div className="absolute right-0 top-full mt-2 z-40 w-[440px] bg-white rounded-xl border border-slate-200 shadow-2xl overflow-hidden">
                    {/* Panel Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50/60">
                        <div className="flex items-center gap-2">
                            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                            <span className="text-sm font-semibold text-slate-800">Filter Vehicles</span>
                            {activeCount > 0 && (
                                <span className="text-xs text-[#3bb273] font-medium bg-[#3bb273]/10 px-2 py-0.5 rounded-full">
                                    {activeCount} active
                                </span>
                            )}
                        </div>
                        <div className="flex items-center gap-1">
                            {activeCount > 0 && (
                                <button
                                    onClick={reset}
                                    className="text-xs text-slate-400 hover:text-red-500 font-medium transition-colors px-2 py-1 rounded hover:bg-red-50"
                                >
                                    Clear all
                                </button>
                            )}
                            <button
                                onClick={() => setOpen(false)}
                                className="p-1.5 rounded-lg hover:bg-slate-200 transition-colors"
                            >
                                <X className="w-3.5 h-3.5 text-slate-500" />
                            </button>
                        </div>
                    </div>

                    {/* Filter Fields */}
                    <div className="px-5 py-4 space-y-4">
                        {/* License Plate */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                License Plate
                            </label>
                            <input
                                type="text"
                                placeholder="Search e.g. IN-8254"
                                value={filters.search}
                                onChange={set('search')}
                                className={inputClass}
                            />
                        </div>

                        {/* Status + Category */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Status
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.status}
                                        onChange={set('status')}
                                        className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                    >
                                        <option value="">All Statuses</option>
                                        <option value="Available">Available</option>
                                        <option value="On_Trip">On Trip</option>
                                        <option value="In_Shop">In Shop</option>
                                        <option value="Retired">Retired</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                    Category
                                </label>
                                <div className="relative">
                                    <select
                                        value={filters.category}
                                        onChange={set('category')}
                                        className={`${inputClass} pr-8 appearance-none cursor-pointer`}
                                    >
                                        <option value="">All Categories</option>
                                        <option value="Bike">Bike</option>
                                        <option value="3_Wheeler">3 Wheeler</option>
                                        <option value="Mini_Truck">Mini Truck</option>
                                        <option value="Medium_Truck">Medium Truck</option>
                                        <option value="Heavy_Truck">Heavy Truck</option>
                                    </select>
                                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>

                        {/* Max Load Capacity */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                Max Load Capacity (kg)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.capacityMin}
                                    onChange={set('capacityMin')}
                                    className={inputClass}
                                    min={0}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.capacityMax}
                                    onChange={set('capacityMax')}
                                    className={inputClass}
                                    min={0}
                                />
                            </div>
                        </div>

                        {/* Odometer */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
                                Odometer (km)
                            </label>
                            <div className="grid grid-cols-2 gap-3">
                                <input
                                    type="number"
                                    placeholder="Min"
                                    value={filters.odometerMin}
                                    onChange={set('odometerMin')}
                                    className={inputClass}
                                    min={0}
                                />
                                <input
                                    type="number"
                                    placeholder="Max"
                                    value={filters.odometerMax}
                                    onChange={set('odometerMax')}
                                    className={inputClass}
                                    min={0}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-5 py-4 border-t border-slate-100 bg-slate-50/60">
                        <button
                            onClick={() => setOpen(false)}
                            className="w-full bg-[#3bb273] hover:bg-[#2da061] text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
                        >
                            Apply Filters{activeCount > 0 ? ` · ${activeCount} active` : ''}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
