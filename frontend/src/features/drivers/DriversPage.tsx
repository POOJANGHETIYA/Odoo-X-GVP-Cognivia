import { useState } from 'react';
import { Search, Filter, UserPlus } from 'lucide-react';
import { DriversTable } from './components/DriversTable';
import { useDrivers, useDriverStats } from './hooks/useDriversData';

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
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Drivers</h1>
          <button className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50">
            <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#10b981] text-white font-semibold rounded-lg hover:bg-[#059669] transition-colors shadow-sm">
            <UserPlus className="w-5 h-5" />
            Add driver
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Total drivers</div>
          <div className="text-2xl font-bold text-slate-800">{stats.total}</div>
        </div>
        <div className="bg-[#fef9c3] rounded-lg border border-[#fde047] p-4">
          <div className="text-slate-600 text-sm mb-1">Without status</div>
          <div className="text-2xl font-bold text-slate-800">{stats.offDuty}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Working</div>
          <div className="text-2xl font-bold text-slate-800">{stats.available + stats.onDuty}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Off Duty</div>
          <div className="text-2xl font-bold text-slate-800">{stats.offDuty}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Suspended</div>
          <div className="text-2xl font-bold text-slate-800">{stats.suspended}</div>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 p-4">
          <div className="text-slate-500 text-sm mb-1">Available</div>
          <div className="text-2xl font-bold text-slate-800">{stats.available}</div>
        </div>
      </div>

      {/* Sync Alert Banner */}
      {syncNeededCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#fef9c3] border border-[#fde047] rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-800">
              <span className="font-semibold">{syncNeededCount} drivers</span> require synchronisation. These drivers exist in integrations but are not linked to CRM.
            </span>
          </div>
          <button className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors">
            Go to drivers sync
          </button>
        </div>
      )}

      {/* Records Info */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Records on the page</span>
        <select 
          value={recordsPerPage}
          onChange={(e) => setRecordsPerPage(Number(e.target.value))}
          className="border border-slate-200 rounded-md px-2 py-1 text-slate-700 bg-white"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>Shown: 1-{Math.min(recordsPerPage, filteredDrivers.length)} of {filteredDrivers.length}</span>
      </div>

      {/* Search Bar */}
      <div className="flex-1 relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          placeholder="Search drivers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
        />
      </div>

      {/* Drivers Table */}
      <DriversTable 
        drivers={paginatedDrivers} 
        isLoading={isLoading} 
      />
    </div>
  );
}
