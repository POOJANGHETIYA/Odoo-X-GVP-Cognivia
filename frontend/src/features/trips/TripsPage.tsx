import { useState } from 'react';
import { Table2, LayoutDashboard, Search } from 'lucide-react';
import { TripsTable } from './components/TripsTable';
import { NewTripForm } from './components/NewTripForm';
import { useTrips, useVehicles, useDrivers } from './hooks/useTripsData';

export function TripsPage() {
  const [viewMode, setViewMode] = useState<'table' | 'dashboard'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewTripForm, setShowNewTripForm] = useState(false);
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
    trip.pickup_address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trip.dropoff_address.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Trip Dispatcher & Management</h1>
          
          {/* Pending Count Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-50 border border-amber-200 rounded-full">
            <span className="text-amber-600 font-semibold text-sm">{pendingCount}</span>
            <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>

          {/* View Toggle */}
          <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-sm">
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'table'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <Table2 className="w-4 h-4" />
              Table
            </button>
            <button
              onClick={() => setViewMode('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'dashboard'
                  ? 'bg-[#2563eb] text-white'
                  : 'text-slate-600 hover:text-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Search Bar and Filters Row */}
      <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            placeholder="Search bar ......"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
          />
        </div>
        
        {/* Filter Buttons */}
        <div className="flex items-center gap-2">
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Group by
          </button>
          <button className="px-4 py-2.5 bg-white border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Filter
          </button>
          <button className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition-colors">
            Sort by...
          </button>
        </div>
      </div>

      {/* Records Info */}
      <div className="flex items-center gap-4 text-sm text-slate-500">
        <span>Records on the page</span>
        <select className="border border-slate-200 rounded-md px-2 py-1 text-slate-700 bg-white">
          <option>25</option>
          <option>50</option>
          <option>100</option>
        </select>
        <span>Shown: 1-{Math.min(25, filteredTrips.length)} of {filteredTrips.length}</span>
      </div>

      {/* Pending Alert Banner */}
      {pendingCount > 0 && (
        <div className="flex items-center justify-between px-4 py-3 bg-[#fef9c3] border border-[#fde047] rounded-lg">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-slate-800 font-medium">You have trips pending processing</span>
          </div>
          <button className="px-4 py-1.5 bg-slate-800 text-white text-sm font-medium rounded-md hover:bg-slate-700 transition-colors">
            Show
          </button>
        </div>
      )}

      {/* Main Content - Trips Table */}
      {viewMode === 'table' ? (
        <TripsTable 
          trips={filteredTrips} 
          vehicles={vehicles || []} 
          drivers={drivers || []} 
          isLoading={isLoading} 
        />
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center">
          <p className="text-slate-500">Dashboard view coming soon...</p>
        </div>
      )}

      {/* New Trip Form Section */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <button
          onClick={() => setShowNewTripForm(!showNewTripForm)}
          className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors"
        >
          <span className="text-lg font-semibold text-[#10b981] border-2 border-[#10b981] px-4 py-2 rounded-lg">
            New Trip Form
          </span>
          <svg 
            className={`w-5 h-5 text-slate-500 transition-transform ${showNewTripForm ? 'rotate-180' : ''}`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        
        {showNewTripForm && <NewTripForm onSuccess={() => setShowNewTripForm(false)} />}
      </div>
    </div>
  );
}
