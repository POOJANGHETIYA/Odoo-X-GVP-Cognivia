import { Vehicle } from '@/types';
import { MoreHorizontal, ChevronUp, ChevronDown as ChevronDownIcon, Truck } from 'lucide-react';
import { useState } from 'react';
import { EmptyState } from '@/components/EmptyState';

interface VehiclesTableProps {
    vehicles: Vehicle[];
}

const STATUS_STYLES: Record<string, string> = {
    Available: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20',
    On_Trip: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20',
    In_Shop: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10',
    Retired: 'bg-zinc-100 text-zinc-700 ring-1 ring-inset ring-zinc-500/10',
};

type SortKey = 'brand' | 'license_plate' | 'capacity_kg' | 'current_odometer' | 'status';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    return (
        <span className="inline-flex flex-col ml-1 opacity-40 group-hover:opacity-80 transition-opacity">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && dir === 'asc' ? 'opacity-100 text-indigo-600' : ''}`} />
            <ChevronDownIcon className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'opacity-100 text-indigo-600' : ''}`} />
        </span>
    );
}

function RowMenu() {
    const [open, setOpen] = useState(false);
    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded-md hover:bg-zinc-100 transition-colors text-zinc-400 hover:text-zinc-600"
            >
                <MoreHorizontal className="w-4 h-4" />
            </button>
            {open && (
                <div
                    className="absolute right-0 top-7 z-20 w-40 bg-white rounded-lg shadow-xl border border-zinc-200 py-1 text-sm overflow-hidden"
                    onMouseLeave={() => setOpen(false)}
                >
                    <button className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 transition-colors">Edit Details</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-zinc-700 transition-colors">Service Log</button>
                    <hr className="my-1 border-zinc-100" />
                    <button className="w-full text-left px-4 py-2 hover:bg-zinc-50 text-red-600 transition-colors">Retire Vehicle</button>
                </div>
            )}
        </div>
    );
}

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean; align?: 'left' | 'right' }[] = [
    { key: 'brand', label: 'Name/Model', sortable: true, align: 'left' },
    { key: 'license_plate', label: 'License Plate', sortable: true, align: 'left' },
    { key: 'capacity_kg', label: 'Max Load', sortable: true, align: 'right' },
    { key: 'current_odometer', label: 'Odometer', sortable: true, align: 'right' },
    { key: 'status', label: 'Status', sortable: true, align: 'left' },
    { key: null, label: '', sortable: false, align: 'right' },
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
            <div className="py-12 px-6">
                <EmptyState
                    icon={Truck}
                    title="No vehicles found"
                    description="No vehicles match your current filter criteria. Try adjusting the filters or add a new vehicle to the registry."
                />
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="w-full text-sm text-left border-separate border-spacing-0">
                <thead className="bg-zinc-50/50 sticky top-0 z-10">
                    <tr>
                        {COLUMNS.map((col) => (
                            <th
                                key={col.label}
                                onClick={() => col.sortable && col.key && handleSort(col.key)}
                                className={`px-4 py-3 text-xs font-medium text-zinc-500 uppercase tracking-wider border-b border-zinc-200 group select-none
                                    ${col.sortable ? 'cursor-pointer hover:bg-zinc-100/50' : ''}
                                    ${col.align === 'right' ? 'text-right' : 'text-left'}`}
                            >
                                <span className={`inline-flex items-center gap-1 ${col.align === 'right' ? 'flex-row-reverse' : ''}`}>
                                    {col.label}
                                    {col.sortable && col.key && (
                                        <SortIcon active={sortKey === col.key} dir={sortDir} />
                                    )}
                                </span>
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200">
                    {sorted.map((v) => {
                        return (
                            <tr
                                key={v.id}
                                className="bg-white hover:bg-zinc-50 transition-colors cursor-pointer group"
                            >
                                {/* Name/Model */}
                                <td className="px-4 py-4 border-b border-zinc-100">
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-zinc-900">{v.brand ?? 'Generic'}</span>
                                        <span className="text-[11px] text-zinc-500 uppercase tracking-wide font-medium mt-0.5">{v.category.replace('_', ' ')}</span>
                                    </div>
                                </td>

                                {/* Plate number */}
                                <td className="px-4 py-4 border-b border-zinc-100">
                                    <div className="inline-flex items-center px-2 py-0.5 bg-zinc-100 rounded-md text-zinc-700 font-mono text-xs font-bold ring-1 ring-inset ring-zinc-300/30">
                                        {v.license_plate}
                                    </div>
                                </td>

                                {/* Capacity */}
                                <td className="px-4 py-4 text-right border-b border-zinc-100">
                                    <span className="text-zinc-700 font-medium tabular-nums tracking-tight">
                                        {v.capacity_kg.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-bold ml-1 uppercase">kg</span>
                                </td>

                                {/* Odometer */}
                                <td className="px-4 py-4 text-right border-b border-zinc-100">
                                    <span className="text-zinc-700 font-medium tabular-nums tracking-tight">
                                        {v.current_odometer.toLocaleString()}
                                    </span>
                                    <span className="text-[10px] text-zinc-400 font-bold ml-1 uppercase">km</span>
                                </td>

                                {/* Status badge */}
                                <td className="px-4 py-4 border-b border-zinc-100">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold tracking-wide ${STATUS_STYLES[v.status] || STATUS_STYLES.Retired}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </td>

                                {/* Row actions */}
                                <td className="px-4 py-4 text-right border-b border-zinc-100">
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
