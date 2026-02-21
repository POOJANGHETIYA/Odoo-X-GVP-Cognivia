import { Vehicle } from '@/types';
import { MoreHorizontal, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
import { useState } from 'react';

interface VehiclesTableProps {
    vehicles: Vehicle[];
}

const STATUS_STYLES: Record<string, string> = {
    Available: 'bg-green-100 text-green-700',
    On_Trip: 'bg-amber-100 text-amber-700',
    In_Shop: 'bg-red-100 text-red-700',
    Retired: 'bg-slate-100 text-slate-500',
};

type SortKey = 'brand' | 'license_plate' | 'capacity_kg' | 'current_odometer' | 'status';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    return (
        <span className="inline-flex flex-col ml-1 opacity-40 group-hover:opacity-80 transition-opacity">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && dir === 'asc' ? 'opacity-100 text-[#3bb273]' : ''}`} />
            <ChevronDownIcon className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'opacity-100 text-[#3bb273]' : ''}`} />
        </span>
    );
}


function RowMenu() {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded hover:bg-slate-100 transition-colors"
            >
                <MoreHorizontal className="w-4 h-4 text-slate-400" />
            </button>
            {open && (
                <div
                    className="absolute right-0 top-7 z-20 w-40 bg-white rounded-lg shadow-lg border border-slate-100 py-1 text-sm"
                    onMouseLeave={() => setOpen(false)}
                >
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">Edit Details</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">Service Log</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700 text-rose-600">Retire Vehicle</button>
                </div>
            )}
        </div>
    );
}

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
    { key: 'brand', label: 'Name/Model', sortable: true },
    { key: 'license_plate', label: 'License Plate', sortable: true },
    { key: 'capacity_kg', label: 'Max Load (kg)', sortable: true },
    { key: 'current_odometer', label: 'Odometer (km)', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: null, label: '', sortable: false },
];

export function VehiclesTable({ vehicles }: VehiclesTableProps) {
    const [sortKey, setSortKey] = useState<SortKey>('brand');
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    const handleSort = (key: SortKey | null) => {
        if (!key) return;
        if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortKey(key); setSortDir('asc'); }
    };

    const sorted = [...vehicles].sort((a, b) => {
        let av: any = (a as any)[sortKey] ?? '';
        let bv: any = (b as any)[sortKey] ?? '';
        if (typeof av === 'string') av = av.toLowerCase();
        if (typeof bv === 'string') bv = bv.toLowerCase();
        if (av < bv) return sortDir === 'asc' ? -1 : 1;
        if (av > bv) return sortDir === 'asc' ? 1 : -1;
        return 0;
    });


    if (vehicles.length === 0) {
        return (
            <div className="text-center py-16 text-slate-400">
                <p className="text-sm">No vehicles found.</p>
                <p className="text-xs mt-1">Try adjusting your filters or add a new vehicle.</p>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-white border-b border-slate-200">
                    <tr>
                        {COLUMNS.map((col) => (
                            <th
                                key={col.label}
                                onClick={() => col.sortable && col.key && handleSort(col.key)}
                                className={`px-4 py-3 text-xs font-semibold text-slate-500 whitespace-nowrap group select-none
                                    ${col.sortable ? 'cursor-pointer hover:text-slate-800' : ''}`}
                            >
                                <span className="inline-flex items-center gap-0.5">
                                    {col.label}
                                    {col.sortable && col.key && (
                                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {sorted.map((v) => {
                        return (
                            <tr
                                key={v.id}
                                className="bg-white hover:bg-slate-50/70 transition-colors group"
                            >
                                {/* Name/Model */}
                                <td className="px-4 py-3.5 font-medium text-slate-800 whitespace-nowrap">
                                    <div className="flex flex-col">
                                        <span className="font-bold">{v.brand ?? 'Generic'}</span>
                                        <span className="text-[11px] text-slate-400 lowercase">{v.category.replace('_', ' ')}</span>
                                    </div>
                                </td>

                                {/* Plate number */}
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-mono text-xs font-bold border border-slate-200">
                                        {v.license_plate}
                                    </div>
                                </td>

                                {/* Capacity */}
                                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap tabular-nums">
                                    {v.capacity_kg.toLocaleString()} <span className="text-[10px] text-slate-400 font-medium">KG</span>
                                </td>

                                {/* Odometer */}
                                <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap tabular-nums font-mono">
                                    {v.current_odometer.toLocaleString()} <span className="text-[10px] text-slate-400">km</span>
                                </td>

                                {/* Status badge */}
                                <td className="px-4 py-3.5 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${STATUS_STYLES[v.status]}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </td>

                                {/* Row actions */}
                                <td className="px-3 py-3.5 whitespace-nowrap text-right">
                                    <RowMenu />
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
