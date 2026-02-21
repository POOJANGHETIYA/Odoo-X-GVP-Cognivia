import { Search, Info, MapPin, Navigation } from 'lucide-react';
import { VehicleLocation } from '../hooks/useMapData';

interface VehicleListProps {
  vehicles: VehicleLocation[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onVehicleSelect: (vehicle: VehicleLocation) => void;
  selectedVehicleId?: string;
}

export function VehicleList({
  vehicles,
  searchQuery,
  onSearchChange,
  onVehicleSelect,
  selectedVehicleId
}: VehicleListProps) {
  const filteredVehicles = vehicles.filter(v =>
    v.license_plate.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.brand?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-[340px] bg-white border-r border-zinc-200 flex flex-col h-full shrink-0">
      {/* Search Header */}
      <div className="p-5 border-b border-zinc-100 bg-zinc-50/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-indigo-600" />
            <h2 className="text-sm font-bold text-zinc-900 uppercase tracking-tight">Active Assets</h2>
          </div>
          <span className="text-[9px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-widest shadow-sm shadow-indigo-100">Live</span>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search by manifest or brand..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-zinc-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* GPS Integrity Indicator */}
      <div className="px-5 py-2.5 bg-zinc-50/80 text-[10px] font-bold text-zinc-500 flex items-center gap-1.5 border-b border-zinc-200">
        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
        <span>GPS Integrity Check: Optimal</span>
        <Info className="w-3 h-3 ml-auto text-zinc-300" />
      </div>

      {/* Vehicle Registry List */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-100">
        {filteredVehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onVehicleSelect(vehicle)}
            className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-all ${selectedVehicleId === vehicle.id
                ? 'bg-indigo-50/50 border-r-4 border-r-indigo-600 shadow-inner'
                : 'hover:bg-zinc-50'
              }`}
          >
            {/* Asset Avatar */}
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-colors ${selectedVehicleId === vehicle.id ? 'bg-white border-indigo-200 shadow-sm' : 'bg-zinc-100 border-zinc-200 group-hover:bg-white'
              }`}>
              <Navigation className={`w-5 h-5 ${selectedVehicleId === vehicle.id ? 'text-indigo-600' : 'text-zinc-400'}`} style={{ transform: `rotate(${vehicle.heading || 0}deg)` }} />
            </div>

            {/* Asset Intelligence */}
            <div className="flex-1 min-w-0">
              <div className="font-black text-zinc-900 text-xs tracking-tight tabular-nums truncate">
                {vehicle.license_plate}
              </div>
              <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter truncate mt-0.5">
                {vehicle.brand || 'Asset Model'} · {vehicle.category.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Velocity Metrics */}
            <div className="flex flex-col items-end gap-1">
              <div className={`text-[11px] font-black tabular-nums ${vehicle.speed_kmh > 0 ? 'text-indigo-600' : 'text-zinc-300'}`}>
                {vehicle.speed_kmh} <span className="text-[9px] font-bold text-zinc-400 uppercase">KM/H</span>
              </div>
              <div className={`w-2 h-2 rounded-full ${vehicle.speed_kmh > 0 ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-zinc-300'}`} />
            </div>
          </button>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 px-10 gap-4 text-center">
            <div className="w-12 h-12 bg-zinc-50 rounded-full flex items-center justify-center">
              <Search className="w-6 h-6 text-zinc-200" />
            </div>
            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest">No matching assets found in registry</p>
          </div>
        )}
      </div>
    </div>
  );
}
