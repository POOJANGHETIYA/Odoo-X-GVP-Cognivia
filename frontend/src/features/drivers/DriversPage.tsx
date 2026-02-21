import { useState } from 'react';
import { Search, Filter, UserPlus, Info, CheckCircle2, Clock, Ban } from 'lucide-react';
import { DriversTable } from './components/DriversTable';
import { useDrivers, useDriverStats } from './hooks/useDriversData';
import { Skeleton } from '@/components/ui/Skeleton';

export function DriversPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [recordsPerPage, setRecordsPerPage] = useState(25);
  const { data: drivers, isLoading } = useDrivers();
  const stats = useDriverStats();

  // Filter drivers based on search
  const filteredDrivers = drivers?.filter(driver =>
    driver.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    driver.phone_number.includes(searchQuery) ||
    driver.license_number.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  // Apply pagination
  const paginatedDrivers = filteredDrivers.slice(0, recordsPerPage);

  // Calculate sync needed count (mock value for UI)
  const syncNeededCount = Math.floor(stats.total * 0.7);

  return (
    <div className="flex flex-col h-full max-w-[1600px] mx-auto pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 font-sans">Human Resources</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage driver credentials, availability, and operational metrics.</p>
        </div>

        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center gap-2 bg-white border border-zinc-200 text-zinc-700 font-semibold px-4 py-2.5 rounded-md text-sm shadow-sm hover:bg-zinc-50 transition-all">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
          <button className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2.5 rounded-md text-sm shadow-sm transition-all focus:ring-2 focus:ring-indigo-500/20 active:scale-[0.98]">
            <UserPlus className="w-4 h-4" />
            Add New Driver
          </button>
        </div>
      </div>

      {/* Stats Quick Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1">Total Assets</div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">{stats.total}</div>
        </div>
        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg shadow-sm">
          <div className="text-emerald-700 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <CheckCircle2 className="w-3 h-3" />
            Available
          </div>
          <div className="text-2xl font-bold text-emerald-900 tabular-nums">{stats.available}</div>
        </div>
        <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-lg shadow-sm">
          <div className="text-indigo-700 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            Working
          </div>
          <div className="text-2xl font-bold text-indigo-900 tabular-nums">{stats.available + stats.onDuty}</div>
        </div>
        <div className="bg-zinc-50/80 border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-zinc-600 text-[11px] font-bold uppercase tracking-wider mb-1">Off Duty</div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">{stats.offDuty}</div>
        </div>
        <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg shadow-sm">
          <div className="text-red-700 text-[11px] font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5">
            <Ban className="w-3 h-3" />
            Suspended
          </div>
          <div className="text-2xl font-bold text-red-900 tabular-nums">{stats.suspended}</div>
        </div>
        <div className="bg-white border border-zinc-200 p-4 rounded-lg shadow-sm">
          <div className="text-zinc-500 text-[11px] font-bold uppercase tracking-wider mb-1">Utilization</div>
          <div className="text-2xl font-bold text-zinc-900 tabular-nums">84%</div>
        </div>
      </div>

      {/* Sync Alert Banner */}
      {syncNeededCount > 0 && (
        <div className="flex items-center justify-between px-5 py-4 bg-indigo-50 border border-indigo-100 rounded-lg mb-8 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 rounded-full p-1">
              <Info className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm text-indigo-900 font-medium">
              <span className="font-bold">{syncNeededCount} drivers</span> require profile synchronisation with enterprise ERP.
            </span>
          </div>
          <button className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 text-xs font-bold rounded-md hover:bg-indigo-50 transition-all shadow-sm">
            Launch Sync Assistant
          </button>
        </div>
      )}

      {/* Main Container */}
      <div className="bg-white border border-zinc-200 rounded-lg shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-200 bg-zinc-50/30 flex items-center justify-between gap-4">
          <div className="flex-1 relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Filter by name, phone or license..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
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
            <span className="text-xs font-medium lowercase">
              Result: <span className="text-zinc-900 font-bold tabular-nums">1-{Math.min(recordsPerPage, filteredDrivers.length)}</span> of <span className="text-zinc-900 font-bold tabular-nums">{filteredDrivers.length}</span>
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto min-h-[400px]">
          {isLoading ? (
            <div className="p-0">
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="flex items-center gap-6 px-6 py-4 border-b border-zinc-50 animate-pulse">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/4" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-20 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            <DriversTable
              drivers={paginatedDrivers}
            />
          )}
        </div>
      </div>
    </div>
  );
}
