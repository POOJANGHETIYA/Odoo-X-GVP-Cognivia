import { useState } from 'react';
import { Table2, LayoutDashboard, Search, Plus, ChevronDown, ListFilter, AlertCircle } from 'lucide-react';
import { TripsTable } from './components/TripsTable';
import { CreateTripModal } from './components/CreateTripModal';
import { useTrips, useVehicles, useDrivers } from './hooks/useTripsData';
import { Skeleton } from '@/components/ui/Skeleton';

export function TripsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTripForm, setShowNewTripForm] = useState(false);
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const { data: trips, isLoading: tripsLoading } = useTrips();
  const { data: vehicles } = useVehicles();
  const { data: drivers } = useDrivers();

  const isLoading = tripsLoading;

  const pendingCount = trips?.filter(t =>
    t.status === 'Unassigned' || t.status === 'Draft'
  ).length || 0;

  // Filter trips based on search
  const filteredTrips = trips?.filter(trip =>
    trip.tracking_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (trip.pickup_address?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (trip.dropoff_address?.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  // Apply pagination
  const paginatedTrips = filteredTrips.slice(0, recordsPerPage);

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Trip Dispatcher</h1>
            <p className="text-sm text-zinc-500 mt-1">Orchestrate logistics delivery and movement across your fleet.</p>
          </div>

          <div className="hidden md:block h-10 w-[1px] bg-zinc-200" />

          {/* View Toggle */}
          <div className="flex bg-zinc-100/80 border border-zinc-200 rounded-lg p-1 shadow-sm h-10">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items - center gap - 2 px - 3 py - 1 text - xs font - bold rounded - md transition - all ${viewMode === 'table'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
                } `}
            >
              <Table2 className="w-3.5 h-3.5" />
              Logistics List
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items - center gap - 2 px - 3 py - 1 text - xs font - bold rounded - md transition - all ${viewMode === 'dashboard'
                  ? 'bg-white text-zinc-900 shadow-sm border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-900'
                } `}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              Gantt View
            </button>
          </div>
        </div>

        <button
          onClick={() => setShowNewTripForm(true)}
          className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-md text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4" />
          Create New Trip
        </button>
      </div>

      {/* New Trip Modal */}
      <CreateTripModal
        isOpen={showNewTripForm}
        onClose={() => setShowNewTripForm(false)}
      />

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between px-5 py-3 bg-amber-50 border border-amber-200 rounded-lg mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-amber-600 rounded-full p-1">
              <AlertCircle className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-amber-900 font-medium">
              Action Required: <span className="font-bold">{pendingCount} trips</span> are awaiting route optimization and asset assignment.
            </span>
          </div>
          <button className="px-4 py-1.5 bg-white border border-amber-200 text-amber-700 text-xs font-bold rounded-md hover:bg-amber-50 transition-all shadow-sm">
            Process Now
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/30 flex items-center justify-between gap-4">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                placeholder="Search tracking ID or location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
            </div>

            <button className="inline-flex items-center gap-2 border border-zinc-200 px-3 py-2 rounded-md bg-white text-xs font-semibold text-zinc-700 hover:bg-zinc-50 shadow-sm transition-all h-9">
              <ListFilter className="w-3.5 h-3.5" />
              Filters
              <ChevronDown className="w-3 h-3 text-zinc-400" />
            </button>
          </div>

          <div className="flex items-center gap-4 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="font-medium text-xs">Rows:</span>
              <select
                value={recordsPerPage}
                onChange={(e) => setRecordsPerPage(Number(e.target.value))}
                className="bg-white border border-zinc-200 rounded-md px-2 py-1 text-xs font-bold text-zinc-700 outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                {[10, 25, 50, 100].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div className="h-4 w-[1px] bg-zinc-200" />
            <span className="text-xs font-medium lowercase italic">
              Dispatching <span className="text-zinc-900 font-bold tabular-nums">1-{Math.min(recordsPerPage, filteredTrips.length)}</span> of <span className="text-zinc-900 font-bold tabular-nums">{filteredTrips.length}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-zinc-50 animate-pulse">
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
          ) : viewMode === 'table' ? (
            <TripsTable
              trips={paginatedTrips}
              vehicles={vehicles || []}
              drivers={drivers || []}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-[500px] text-center p-12">
              <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
                <LayoutDashboard className="w-8 h-8 text-zinc-300" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 mb-1">Interactive Gantt View</h3>
              <p className="text-zinc-500 text-sm max-w-[280px]">We're currently building the advanced logistics dashboard. Check back soon!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
