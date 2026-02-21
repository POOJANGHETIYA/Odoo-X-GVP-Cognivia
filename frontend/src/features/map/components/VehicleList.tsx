import { Search, Info } from 'lucide-react';
import { VehicleLocation } from '../hooks/useMapData';

interface VehicleListProps {
  vehicles: VehicleLocation[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onVehicleSelect: (vehicle: VehicleLocation) => void;
  selectedVehicleId?: string;
}

function getSpeedColor(speed: number): string {
  if (speed > 50) return 'text-green-500';
  if (speed > 0) return 'text-blue-500';
  return 'text-slate-400';
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
    <div className="w-[320px] bg-white border-r border-slate-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-semibold text-slate-800">Map</h2>
          <span className="text-xs text-slate-400 bg-slate-100 px-2 py-0.5 rounded">(Beta)</span>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Find car"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981]"
          />
        </div>
      </div>

      {/* GPS Info */}
      <div className="px-4 py-2 text-xs text-[#10b981] flex items-center gap-1 border-b border-slate-100">
        <span>Cars with GPS integration</span>
        <Info className="w-3 h-3" />
      </div>

      {/* Vehicle List */}
      <div className="flex-1 overflow-y-auto">
        {filteredVehicles.map((vehicle) => (
          <button
            key={vehicle.id}
            onClick={() => onVehicleSelect(vehicle)}
            className={`w-full flex items-center gap-3 px-4 py-3 border-b border-slate-100 hover:bg-slate-50 transition-colors text-left ${
              selectedVehicleId === vehicle.id ? 'bg-slate-50 border-l-4 border-l-[#10b981]' : ''
            }`}
          >
            {/* Vehicle Icon */}
            <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-500" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
              </svg>
            </div>

            {/* Vehicle Info */}
            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">
                {vehicle.license_plate}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {vehicle.brand || vehicle.category.replace(/_/g, ' ')}
              </div>
            </div>

            {/* Speed */}
            <div className={`flex items-center gap-1 text-sm font-medium ${getSpeedColor(vehicle.speed_kmh)}`}>
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {vehicle.speed_kmh} km/h
            </div>
          </button>
        ))}

        {filteredVehicles.length === 0 && (
          <div className="p-8 text-center text-slate-400 text-sm">
            No vehicles found
          </div>
        )}
      </div>
    </div>
  );
}
