import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Wrench, Plus, Search, X, Calendar, Clock,
    CheckCircle2, XCircle, AlertTriangle, ChevronDown,
    Filter, History, MoreHorizontal, Settings, ArrowRight
} from 'lucide-react';
import { useMaintenanceLogs, useVehiclesForMaintenance, useCreateMaintenanceLog } from './hooks/useMaintenanceData';
import type { Vehicle } from '@/types';
import { Skeleton } from '@/components/ui/Skeleton';

// ============================================================================
// Status & Service Type display helpers
// ============================================================================
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    Scheduled: { label: 'Scheduled', className: 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20', icon: Calendar },
    In_Progress: { label: 'In Progress', className: 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20', icon: Clock },
    Completed: { label: 'Completed', className: 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20', icon: CheckCircle2 },
    Cancelled: { label: 'Cancelled', className: 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10', icon: XCircle },
};

const SERVICE_TYPE_LABELS: Record<string, string> = {
    Oil_Change: 'Oil Change',
    Tire_Replacement: 'Tire Replacement',
    Engine_Repair: 'Engine Repair',
    Brake_Service: 'Brake Service',
    General_Inspection: 'General Inspection',
    Battery_Replacement: 'Battery Replacement',
    Other: 'Other',
};

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

// ============================================================================
// Form Schema
// ============================================================================
const createMaintenanceSchema = z.object({
    vehicle_id: z.string().min(1, 'Please select a vehicle'),
    service_type: z.enum(['Oil_Change', 'Tire_Replacement', 'Engine_Repair', 'Brake_Service', 'General_Inspection', 'Battery_Replacement', 'Other']),
    description: z.string().min(5, 'Description must be at least 5 characters'),
    cost: z.coerce.number().nonnegative('Cost must be 0 or more'),
    odometer_at_service: z.coerce.number().nonnegative('Odometer must be 0 or more'),
    scheduled_date: z.string().min(1, 'Scheduled date is required'),
    next_service_due: z.string().optional(),
    status: z.enum(['Scheduled', 'In_Progress']),
    technician_name: z.string().min(2, 'Technician name is required'),
});

// ============================================================================
// Summary Card Component
// ============================================================================
function SummaryCard({ title, count, description, icon: Icon, colorClass }: {
    title: string; count: number; description: string; icon: React.ElementType; colorClass: string;
}) {
    return (
        <div className="bg-white rounded-lg border border-zinc-200 p-6 flex flex-col shadow-sm transition-all hover:shadow-md group overflow-hidden relative">
            <div className="flex justify-between items-start mb-4 relative z-10">
                <div className={`p-2.5 rounded-lg ${colorClass} ring-1 ring-inset ring-black/5`}>
                    <Icon className="w-5 h-5" />
                </div>
            </div>
            <div className="relative z-10">
                <p className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1">{title}</p>
                <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold text-zinc-900 tabular-nums">{count}</p>
                    <p className="text-zinc-400 text-xs font-medium">{description}</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Main Page
// ============================================================================
export function MaintenancePage() {
    const { data: logs, isLoading } = useMaintenanceLogs();
    const { data: vehicles } = useVehiclesForMaintenance();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isModalOpen, setIsModalOpen] = useState(false);

    const vehicleMap = useMemo(() => {
        const map = new Map<string, Vehicle>();
        vehicles?.forEach(v => map.set(v.id, v));
        return map;
    }, [vehicles]);

    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        return logs.filter(log => {
            const vehicle = vehicleMap.get(log.vehicle_id);
            const matchesSearch = searchQuery === '' ||
                (vehicle?.license_plate || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                log.technician_name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = statusFilter === 'all' || log.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [logs, searchQuery, statusFilter, vehicleMap]);

    const scheduled = logs?.filter(l => l.status === 'Scheduled').length || 0;
    const inProgress = logs?.filter(l => l.status === 'In_Progress').length || 0;
    const completedThisMonth = logs?.filter(l => {
        if (l.status !== 'Completed' || !l.completed_date) return false;
        try {
            const d = parseISO(l.completed_date);
            const now = new Date();
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        } catch (e) { return false; }
    }).length || 0;

    return (
        <div className="flex flex-col gap-8 pb-10 max-w-[1600px] mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 text-indigo-600 mb-1">
                        <Wrench className="w-4 h-4" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Asset Reliability</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Maintenance Registry</h1>
                    <p className="text-zinc-500 text-sm mt-1 flex items-center gap-2">
                        <History className="w-3.5 h-3.5" />
                        Tracking lifecycle and service health for all fleet assets
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button className="inline-flex items-center justify-center gap-2 border border-zinc-200 bg-white text-zinc-700 font-bold px-4 py-2.5 rounded-md text-xs shadow-sm hover:bg-zinc-50 transition-all h-10">
                        <Settings className="w-3.5 h-3.5" />
                        Interval Settings
                    </button>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2.5 rounded-md text-sm shadow-sm transition-all active:scale-[0.98] h-10"
                    >
                        <Plus className="w-4 h-4" />
                        Log Service Entry
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SummaryCard
                    title="Scheduled"
                    count={scheduled}
                    description="Upcoming repairs"
                    icon={Calendar}
                    colorClass="bg-blue-50 text-blue-600"
                />
                <SummaryCard
                    title="In Workshop"
                    count={inProgress}
                    description="Active repairs"
                    icon={AlertTriangle}
                    colorClass="bg-amber-50 text-amber-600"
                />
                <SummaryCard
                    title="Completed"
                    count={completedThisMonth}
                    description="Success this month"
                    icon={CheckCircle2}
                    colorClass="bg-emerald-50 text-emerald-600"
                />
            </div>

            {/* Main Registry Container */}
            <div className="bg-white rounded-lg border border-zinc-200 shadow-sm flex flex-col overflow-hidden">
                {/* Filtration Toolbar */}
                <div className="px-6 py-4 border-b border-zinc-100 bg-zinc-50/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Search asset, service type, or vendor..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                        />
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <div className="relative w-full sm:w-48">
                            <select
                                value={statusFilter}
                                onChange={e => setStatusFilter(e.target.value)}
                                className="w-full appearance-none bg-white border border-zinc-200 rounded-md py-2 pl-3 pr-10 text-xs font-bold text-zinc-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 cursor-pointer"
                            >
                                <option value="all">ALL LIFECYCLES</option>
                                <option value="Scheduled">SCHEDULED</option>
                                <option value="In_Progress">WORK IN PROGRESS</option>
                                <option value="Completed">COMPLETED</option>
                                <option value="Cancelled">CANCELLED</option>
                            </select>
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
                        </div>
                        <button className="inline-flex items-center justify-center border border-zinc-200 p-2 rounded-md bg-white hover:bg-zinc-50 transition-all shadow-sm">
                            <Filter className="w-4 h-4 text-zinc-500" />
                        </button>
                    </div>
                </div>

                {/* Registry Table */}
                <div className="overflow-x-auto min-h-[400px]">
                    {isLoading ? (
                        <div className="p-0">
                            {Array.from({ length: 8 }).map((_, i) => (
                                <div key={i} className="flex items-center gap-6 px-6 py-5 border-b border-zinc-50 animate-pulse">
                                    <Skeleton className="h-4 w-24" />
                                    <div className="flex-1 space-y-2">
                                        <Skeleton className="h-4 w-1/4" />
                                        <Skeleton className="h-3 w-1/3" />
                                    </div>
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-6 w-20 rounded-md" />
                                </div>
                            ))}
                        </div>
                    ) : filteredLogs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-6">
                            <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                                <Wrench className="w-8 h-8 text-zinc-300" />
                            </div>
                            <h3 className="text-base font-bold text-zinc-900 mb-1">No service manifestations found</h3>
                            <p className="text-zinc-500 text-sm max-w-[280px]">Refine your filters or create a new service entry to track your fleet health.</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-separate border-spacing-0">
                            <thead>
                                <tr className="bg-zinc-50/50">
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Asset Identity</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Service Manifest</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Financials</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Odometer</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Timestamp</th>
                                    <th className="px-6 py-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest border-b border-zinc-100">Status</th>
                                    <th className="px-6 py-4 border-b border-zinc-100"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 bg-white">
                                {filteredLogs.map((log) => {
                                    const vehicle = vehicleMap.get(log.vehicle_id);
                                    const status = STATUS_CONFIG[log.status] || STATUS_CONFIG.Scheduled;
                                    const StatusIcon = status.icon;

                                    return (
                                        <tr key={log.id} className="hover:bg-zinc-50/50 transition-colors group cursor-pointer">
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-zinc-900 tabular-nums">
                                                        {vehicle?.license_plate || '—'}
                                                    </span>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight mt-0.5">
                                                        {vehicle?.category?.replace(/_/g, ' ') || 'Unknown asset'}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <div className="flex flex-col max-w-[240px]">
                                                    <span className="inline-flex items-center text-xs font-bold text-zinc-800">
                                                        {SERVICE_TYPE_LABELS[log.service_type] || log.service_type}
                                                    </span>
                                                    <span className="text-[11px] text-zinc-400 truncate mt-1" title={log.description}>
                                                        {log.description}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <span className="text-sm font-bold text-zinc-900 tabular-nums tracking-tight">
                                                    {formatCurrency(log.cost)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <span className="text-xs font-bold text-zinc-600 tabular-nums">
                                                    {log.odometer_at_service.toLocaleString('en-IN')} <span className="text-[10px] text-zinc-400 uppercase ml-0.5 font-medium tracking-tighter">km</span>
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-zinc-700">
                                                        {log.scheduled_date ? format(parseISO(log.scheduled_date), 'dd MMM yyyy') : '—'}
                                                    </span>
                                                    {log.next_service_due && (
                                                        <span className="text-[10px] text-zinc-400 font-bold mt-0.5 flex items-center gap-1">
                                                            Due: {format(parseISO(log.next_service_due), 'dd MMM yyyy')}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold tracking-tight ${status.className}`}>
                                                    <StatusIcon className="w-3 h-3" />
                                                    {status.label.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-5 border-b border-zinc-50 text-right">
                                                <button className="p-2 hover:bg-zinc-100 rounded-md text-zinc-400 transition-colors">
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Registry Footer */}
                <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/10 flex justify-between items-center">
                    <span className="text-[10px] text-zinc-400 uppercase font-black tracking-widest">
                        Discovery: {filteredLogs.length} Records found
                    </span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-tight">Aggregated Costs:</span>
                        <span className="text-xs font-black text-zinc-900 tabular-nums">
                            {formatCurrency(filteredLogs.reduce((sum, l) => sum + l.cost, 0))}
                        </span>
                    </div>
                </div>
            </div>

            {/* Log Service Entry Modal */}
            {isModalOpen && (
                <LogServiceModal
                    vehicles={vehicles || []}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
}

// ============================================================================
// Log Service Modal
// ============================================================================
function LogServiceModal({ vehicles, onClose }: { vehicles: Vehicle[]; onClose: () => void }) {
    const createLog = useCreateMaintenanceLog();

    const {
        register,
        handleSubmit,
        formState: { errors, isSubmitting },
    } = useForm({
        resolver: zodResolver(createMaintenanceSchema) as any,
        defaultValues: {
            vehicle_id: '',
            service_type: 'Oil_Change',
            description: '',
            cost: 0,
            odometer_at_service: 0,
            scheduled_date: '',
            next_service_due: '',
            status: 'Scheduled',
            technician_name: '',
        },
    });

    const onSubmit = async (data: any) => {
        try {
            await createLog.mutateAsync(data);
            onClose();
        } catch (err) {
            console.error('Submission failed', err);
        }
    };

    const inputClass = (hasError: boolean) =>
        `w-full px-4 py-2.5 rounded-md border text-sm font-medium focus:ring-4 focus:outline-none transition-all shadow-sm ${hasError
            ? 'border-red-500/50 focus:ring-red-500/10 bg-red-50/30'
            : 'border-zinc-200 focus:border-indigo-600 focus:ring-indigo-600/10 bg-white hover:border-zinc-300'
        }`;

    const labelClass = "block text-[11px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 ml-1";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300" onClick={onClose}>
            <div
                className="bg-white rounded-xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.14)] w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-zinc-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-8 py-6 border-b border-zinc-100 bg-zinc-50/30">
                    <div>
                        <h2 className="text-xl font-bold text-zinc-900 tracking-tight">Log Service Manifest</h2>
                        <p className="text-xs text-zinc-500 font-medium mt-1">Initialize a repair or maintenance registry entry</p>
                    </div>
                    <button onClick={onClose} className="p-2 border border-zinc-200 bg-white text-zinc-400 hover:text-zinc-600 transition-all rounded-lg shadow-sm">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hide">
                    <form id="service-form" onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-6">
                        {/* Section: Resource Identity */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-indigo-600 rounded-full" />
                                <span className="text-xs font-bold text-zinc-900">Resource Registry</span>
                            </div>

                            <div>
                                <label className={labelClass}>Vehicle Manifest Entry *</label>
                                <div className="relative">
                                    <select {...register('vehicle_id')} className={inputClass(!!errors.vehicle_id)}>
                                        <option value="">Select a registry asset</option>
                                        {vehicles.map(v => (
                                            <option key={v.id} value={v.id}>{v.license_plate} — {v.category.replace(/_/g, ' ')}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                </div>
                                {errors.vehicle_id && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.vehicle_id.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Service Classification *</label>
                                    <div className="relative">
                                        <select {...register('service_type')} className={inputClass(!!errors.service_type)}>
                                            {Object.entries(SERVICE_TYPE_LABELS).map(([val, label]) => (
                                                <option key={val} value={val}>{label}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Workflow Status *</label>
                                    <div className="relative">
                                        <select {...register('status')} className={inputClass(!!errors.status)}>
                                            <option value="Scheduled">Scheduled</option>
                                            <option value="In_Progress">In Progress</option>
                                        </select>
                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Section: Service Detail */}
                        <div className="pt-4 space-y-4 border-t border-zinc-100">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="h-4 w-1 bg-amber-600 rounded-full" />
                                <span className="text-xs font-bold text-zinc-900">Operational Particulars</span>
                            </div>

                            <div>
                                <label className={labelClass}>Technical Narrative *</label>
                                <textarea
                                    rows={3}
                                    placeholder="Describe the diagnostics and repair specifics..."
                                    {...register('description')}
                                    className={`${inputClass(!!errors.description)} resize-none`}
                                />
                                {errors.description && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.description.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Cost Manifest (₹) *</label>
                                    <input type="number" step="1" placeholder="0" {...register('cost')} className={inputClass(!!errors.cost)} />
                                    {errors.cost && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.cost.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Odometer (km) *</label>
                                    <input type="number" step="1" placeholder="0" {...register('odometer_at_service')} className={inputClass(!!errors.odometer_at_service)} />
                                    {errors.odometer_at_service && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.odometer_at_service.message}</p>}
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Technical Vendor/Technician *</label>
                                <input type="text" placeholder="e.g. Paramount Fleet Services" {...register('technician_name')} className={inputClass(!!errors.technician_name)} />
                                {errors.technician_name && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.technician_name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Logistics Date *</label>
                                    <input type="date" {...register('scheduled_date')} className={inputClass(!!errors.scheduled_date)} />
                                    {errors.scheduled_date && <p className="mt-1.5 text-xs text-red-600 font-bold ml-1">{errors.scheduled_date.message}</p>}
                                </div>
                                <div>
                                    <label className={labelClass}>Forecasted Next Service</label>
                                    <input type="date" {...register('next_service_due')} className={inputClass(false)} />
                                </div>
                            </div>
                        </div>

                        {createLog.isError && (
                            <div className="p-4 bg-red-50 border border-red-200 rounded-md text-xs text-red-700 font-bold flex items-center gap-2">
                                <XCircle className="w-4 h-4" />
                                Manifest creation failure. Sync with network and retry.
                            </div>
                        )}
                    </form>
                </div>

                {/* Modal Actions */}
                <div className="px-8 py-6 border-t border-zinc-100 bg-zinc-50/50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-5 py-2.5 text-xs font-bold text-zinc-500 hover:text-zinc-900 border border-zinc-200 rounded-md bg-white hover:bg-zinc-50 transition-all shadow-sm">
                        ABORT
                    </button>
                    <button
                        form="service-form"
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-md shadow-md shadow-indigo-100 transition-all flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed group active:scale-[0.98]"
                    >
                        {isSubmitting ? (
                            <ArrowRight className="w-4 h-4 animate-spin" />
                        ) : (
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        )}
                        COMMIT MANIFEST
                    </button>
                </div>
            </div>
        </div>
    );
}
