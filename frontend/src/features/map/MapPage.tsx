import { useState } from 'react';
import { VehicleList } from './components/VehicleList';
import { LeafletMap } from './components/LeafletMap';
import { useVehicleLocations, VehicleLocation } from './hooks/useMapData';

export function MapPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVehicle, setSelectedVehicle] = useState<VehicleLocation | undefined>();
  const { data: vehicles, isLoading } = useVehicleLocations();

  const handleVehicleSelect = (vehicle: VehicleLocation) => {
    setSelectedVehicle(vehicle);
  };

  if (isLoading) {
    return (
      <div className="h-[calc(100vh-140px)] flex flex-col items-center justify-center gap-4 bg-zinc-50/50 rounded-2xl border border-zinc-200 border-dashed m-4">
        <div className="relative flex h-10 w-10">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-10 w-10 bg-indigo-600 border-2 border-white shadow-sm flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          </span>
        </div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest animate-pulse">Initializing Global Positioning...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-100px)] flex bg-white rounded-xl overflow-hidden border border-zinc-200 shadow-sm shadow-zinc-100">
      {/* Left Panel - Vehicle List */}
      <VehicleList
        vehicles={vehicles || []}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onVehicleSelect={handleVehicleSelect}
        selectedVehicleId={selectedVehicle?.id}
      />

      {/* Right Panel - Map */}
      <div className="flex-1 relative bg-zinc-50">
        <LeafletMap
          vehicles={vehicles || []}
          selectedVehicle={selectedVehicle}
          onVehicleSelect={handleVehicleSelect}
        />
      </div>
    </div>
  );
}
