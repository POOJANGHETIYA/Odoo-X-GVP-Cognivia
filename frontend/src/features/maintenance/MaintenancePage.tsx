import { useState, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
    Wrench, Plus, Search, Loader2, X, Calendar, Clock,
    CheckCircle2, XCircle, AlertTriangle, ChevronDown,
} from 'lucide-react';
import { useMaintenanceLogs, useVehiclesForMaintenance, useCreateMaintenanceLog } from './hooks/useMaintenanceData';
import type { Vehicle } from '@/types';

// ============================================================================
// Status & Service Type display helpers
// ============================================================================
const STATUS_CONFIG: Record<string, { label: string; className: string; icon: React.ElementType }> = {
    Scheduled: { label: 'Scheduled', className: 'bg-blue-100 text-blue-700', icon: Calendar },
    In_Progress: { label: 'In Progress', className: 'bg-amber-100 text-amber-700', icon: Clock },
    Completed: { label: 'Completed', className: 'bg-emerald-100 text-emerald-700', icon: CheckCircle2 },
    Cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700', icon: XCircle },
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
// Status Pill Component
// ============================================================================
function StatusPill({ status }: { status: string }) {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.Scheduled;
    const Icon = config.icon;
    return (
        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${config.className}`}>
            <Icon className="w-3 h-3" />
            {config.label}
        </span>
    );
}

// ============================================================================
// Summary Card
// ============================================================================
function SummaryCard({ title, count, icon: Icon, colorClass }: {
    title: string; count: number; icon: React.ElementType; colorClass: string;
}) {
    return (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4 transition-all hover:shadow-md">
            <div className={`p-3 rounded-lg ${colorClass}`}>
                <Icon className="w-5 h-5" />
            </div>
            <div>
                <p className="text-sm text-slate-500 font-medium">{title}</p>
                <p className="text-2xl font-bold text-slate-800 tracking-tight">{count}</p>
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

    // Build vehicle lookup map
    const vehicleMap = useMemo(() => {
        const map = new Map<string, Vehicle>();
        vehicles?.forEach(v => map.set(v.id, v));
        return map;
    }, [vehicles]);

    // Filter & search
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

    // Summary KPIs
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
        <div className="space-y-8 pb-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                        <Wrench className="w-6 h-6 text-[#3bb273]" />
                        Maintenance & Service Logs
                    </h1>
                    <p className="text-slate-500 text-sm mt-1">Track and manage vehicle maintenance records</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 bg-[#3bb273] hover:bg-[#329a63] text-white font-medium px-5 py-2.5 rounded-lg transition-colors shadow-sm"
                >
                    <Plus className="w-4 h-4" />
                    Log Service
                </button>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <SummaryCard title="Scheduled" count={scheduled} icon={Calendar} colorClass="bg-blue-50 text-blue-600" />
                <SummaryCard title="In Progress" count={inProgress} icon={AlertTriangle} colorClass="bg-amber-50 text-amber-600" />
                <SummaryCard title="Completed This Month" count={completedThisMonth} icon={CheckCircle2} colorClass="bg-emerald-50 text-emerald-600" />
            </div>

            {/* Filters & Search */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search by license plate, description, or technician..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-[#3bb273]/20 focus:border-[#3bb273] outline-none text-sm transition-colors"
                        />
                    </div>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 pr-9 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-[#3bb273]/20 focus:border-[#3bb273] outline-none cursor-pointer"
                        >
                            <option value="all">All Statuses</option>
                            <option value="Scheduled">Scheduled</option>
                            <option value="In_Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <div className="p-16 flex justify-center">
                        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-16 text-center text-slate-500">
                        <Wrench className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                        <p className="font-medium">No service logs found</p>
                        <p className="text-sm mt-1">Try adjusting your filters or log a new service.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/80 border-b border-slate-100">
                                <tr>
                                    <th className="px-5 py-3 font-medium">Vehicle</th>
                                    <th className="px-5 py-3 font-medium">Service Type</th>
                                    <th className="px-5 py-3 font-medium hidden lg:table-cell">Description</th>
                                    <th className="px-5 py-3 font-medium">Cost</th>
                                    <th className="px-5 py-3 font-medium hidden md:table-cell">Odometer</th>
                                    <th className="px-5 py-3 font-medium">Date</th>
                                    <th className="px-5 py-3 font-medium hidden xl:table-cell">Technician</th>
                                    <th className="px-5 py-3 font-medium">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredLogs.map((log) => {
                                    const vehicle = vehicleMap.get(log.vehicle_id);
                                    return (
                                        <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-5 py-4">
                                                <div className="font-medium text-slate-900">{vehicle?.license_plate || '—'}</div>
                                                <div className="text-xs text-slate-400 mt-0.5">{vehicle?.category?.replace(/_/g, ' ') || ''}</div>
                                            </td>
                                            <td className="px-5 py-4">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-xs font-medium">
                                                    {SERVICE_TYPE_LABELS[log.service_type] || log.service_type}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 hidden lg:table-cell max-w-[280px]">
                                                <p className="text-slate-600 truncate" title={log.description}>{log.description}</p>
                                            </td>
                                            <td className="px-5 py-4 font-semibold text-slate-800">{formatCurrency(log.cost)}</td>
                                            <td className="px-5 py-4 hidden md:table-cell text-slate-600">
                                                {log.odometer_at_service.toLocaleString('en-IN')} km
                                            </td>
                                            <td className="px-5 py-4">
                                                <div className="text-slate-700">
                                                    {log.scheduled_date ? format(parseISO(log.scheduled_date), 'dd MMM yyyy') : '—'}
                                                </div>
                                                {log.next_service_due && (
                                                    <div className="text-[10px] text-slate-400 mt-0.5">
                                                        Next: {format(parseISO(log.next_service_due), 'dd MMM yyyy')}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-5 py-4 hidden xl:table-cell text-slate-600">{log.technician_name}</td>
                                            <td className="px-5 py-4">
                                                <StatusPill status={log.status} />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Table Footer */}
                <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 text-xs text-slate-500 flex justify-between items-center">
                    <span>{filteredLogs.length} record{filteredLogs.length !== 1 ? 's' : ''}</span>
                    <span>Total cost: {formatCurrency(filteredLogs.reduce((sum, l) => sum + l.cost, 0))}</span>
                </div>
            </div>

            {/* Log Service Modal */}
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
        await createLog.mutateAsync(data);
        onClose();
    };

    const inputClass = (hasError: boolean) =>
        `w-full px-3 py-2 rounded-lg border text-sm focus:ring-2 focus:outline-none transition-colors ${hasError
            ? 'border-red-400 focus:ring-red-200 bg-red-50'
            : 'border-slate-200 focus:border-[#3bb273] focus:ring-[#3bb273]/20'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={onClose}>
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Log New Service</h2>
                        <p className="text-sm text-slate-500 mt-0.5">Record a maintenance or service entry</p>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                    {/* Vehicle */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Vehicle *</label>
                        <select {...register('vehicle_id')} className={inputClass(!!errors.vehicle_id)}>
                            <option value="">Select a vehicle</option>
                            {vehicles.map(v => (
                                <option key={v.id} value={v.id}>{v.license_plate} — {v.category.replace(/_/g, ' ')}</option>
                            ))}
                        </select>
                        {errors.vehicle_id && <p className="mt-1 text-xs text-red-500">{errors.vehicle_id.message}</p>}
                    </div>

                    {/* Service Type & Status — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Service Type *</label>
                            <select {...register('service_type')} className={inputClass(!!errors.service_type)}>
                                {Object.entries(SERVICE_TYPE_LABELS).map(([val, label]) => (
                                    <option key={val} value={val}>{label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status *</label>
                            <select {...register('status')} className={inputClass(!!errors.status)}>
                                <option value="Scheduled">Scheduled</option>
                                <option value="In_Progress">In Progress</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Description *</label>
                        <textarea
                            rows={2}
                            placeholder="Describe the service or repair..."
                            {...register('description')}
                            className={inputClass(!!errors.description)}
                        />
                        {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                    </div>

                    {/* Cost & Odometer — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Cost (₹) *</label>
                            <input type="number" step="1" placeholder="0" {...register('cost')} className={inputClass(!!errors.cost)} />
                            {errors.cost && <p className="mt-1 text-xs text-red-500">{errors.cost.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Odometer (km) *</label>
                            <input type="number" step="1" placeholder="0" {...register('odometer_at_service')} className={inputClass(!!errors.odometer_at_service)} />
                            {errors.odometer_at_service && <p className="mt-1 text-xs text-red-500">{errors.odometer_at_service.message}</p>}
                        </div>
                    </div>

                    {/* Technician Name */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Technician Name *</label>
                        <input type="text" placeholder="e.g. QuickFit Garage" {...register('technician_name')} className={inputClass(!!errors.technician_name)} />
                        {errors.technician_name && <p className="mt-1 text-xs text-red-500">{errors.technician_name.message}</p>}
                    </div>

                    {/* Dates — side by side */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Date *</label>
                            <input type="date" {...register('scheduled_date')} className={inputClass(!!errors.scheduled_date)} />
                            {errors.scheduled_date && <p className="mt-1 text-xs text-red-500">{errors.scheduled_date.message}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Next Service Due</label>
                            <input type="date" {...register('next_service_due')} className={inputClass(false)} />
                        </div>
                    </div>

                    {/* Error banner */}
                    {createLog.isError && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 font-medium">
                            Failed to create service log. Please try again.
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-5 py-2 text-sm font-medium bg-[#3bb273] hover:bg-[#329a63] text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Plus className="w-4 h-4" />
                                    Log Service
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
