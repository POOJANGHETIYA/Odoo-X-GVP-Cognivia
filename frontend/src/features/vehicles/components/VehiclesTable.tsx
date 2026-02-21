import { Vehicle } from '@/types';
import { CheckCircle2, MoreHorizontal, ChevronUp, ChevronDown as ChevronDownIcon } from 'lucide-react';
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

const GPS_BADGE: Record<string, { dot: string; label: string }> = {
    Active: { dot: 'bg-green-500', label: 'Active' },
    Inactive: { dot: 'bg-red-500', label: 'Inactive' },
    No_GPS: { dot: 'bg-slate-300', label: 'No GPS' },
};

type SortKey = 'brand' | 'year' | 'license_plate' | 'current_odometer' | 'registration_date';
type SortDir = 'asc' | 'desc';

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
    return (
        <span className="inline-flex flex-col ml-1 opacity-40 group-hover:opacity-80 transition-opacity">
            <ChevronUp className={`w-2.5 h-2.5 -mb-0.5 ${active && dir === 'asc' ? 'opacity-100 text-[#3bb273]' : ''}`} />
            <ChevronDownIcon className={`w-2.5 h-2.5 ${active && dir === 'desc' ? 'opacity-100 text-[#3bb273]' : ''}`} />
        </span>
    );
}

function StatusDot({ active }: { active?: boolean }) {
    return (
        <span
            className={`inline-block w-3.5 h-3.5 rounded-full border-2 ${active
                ? 'bg-green-500 border-green-400'
                : 'bg-red-500 border-red-400'
                }`}
        />
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
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">Edit Status</button>
                    <button className="w-full text-left px-4 py-2 hover:bg-slate-50 text-slate-700">View Details</button>
                </div>
            )}
        </div>
    );
}

const COLUMNS: { key: SortKey | null; label: string; sortable: boolean }[] = [
    { key: 'brand', label: 'Brand', sortable: true },
    { key: 'year', label: 'Year', sortable: false },
    { key: 'license_plate', label: 'Plate number', sortable: true },
    { key: null, label: 'Fleet', sortable: false },
    { key: null, label: 'GPS Status', sortable: false },
    { key: null, label: 'Service', sortable: false },
    { key: null, label: 'Timetable events', sortable: true },
    { key: 'registration_date', label: 'Registration date', sortable: true },
    { key: null, label: 'Car photo', sortable: false },
    { key: null, label: 'Documents', sortable: false },
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
        let av: any = a[sortKey] ?? '';
        let bv: any = b[sortKey] ?? '';
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
                        const gps = GPS_BADGE[v.gps_status ?? 'No_GPS'];
                        return (
                            <tr
                                key={v.id}
                                className="bg-white hover:bg-slate-50/70 transition-colors group"
                            >
                                {/* Brand */}
                                <td className="px-4 py-2.5 font-medium text-slate-800 whitespace-nowrap">
                                    {v.brand ?? <span className="text-slate-300">—</span>}
                                </td>

                                {/* Year */}
                                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap tabular-nums">
                                    {v.year ?? <span className="text-slate-300">—</span>}
                                </td>

                                {/* Plate number */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <div className="inline-flex items-center gap-1.5">
                                        <CheckCircle2 className="w-3.5 h-3.5 text-green-500 shrink-0" />
                                        <span className="text-[#0ea5e9] font-semibold text-[13px] tracking-wide font-mono">
                                            {v.license_plate}
                                        </span>
                                    </div>
                                </td>

                                {/* Fleet */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    {v.fleet
                                        ? <span className="text-[#3bb273] font-medium text-[13px]">{v.fleet}</span>
                                        : <span className="text-slate-300">—</span>}
                                </td>

                                {/* GPS Status */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <div className="flex items-center gap-1.5">
                                        <span className={`w-2 h-2 rounded-full shrink-0 ${gps.dot}`} />
                                        <span className="text-slate-600 text-xs">{gps.label}</span>
                                    </div>
                                </td>

                                {/* Service (status badge) */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${STATUS_STYLES[v.status]}`}>
                                        {v.status.replace('_', ' ')}
                                    </span>
                                </td>

                                {/* Timetable Events */}
                                <td className="px-4 py-2.5 text-slate-300 whitespace-nowrap">—</td>

                                {/* Registration Date */}
                                <td className="px-4 py-2.5 text-slate-600 whitespace-nowrap tabular-nums text-[13px]">
                                    {v.registration_date ?? <span className="text-slate-300">—</span>}
                                </td>

                                {/* Car Photo */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <StatusDot active={v.has_photo} />
                                </td>

                                {/* Documents */}
                                <td className="px-4 py-2.5 whitespace-nowrap">
                                    <StatusDot active={v.has_documents} />
                                </td>

                                {/* Row actions */}
                                <td className="px-3 py-2.5 whitespace-nowrap">
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
