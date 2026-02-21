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
      <div className="h-[calc(100vh-120px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#10b981]"></div>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-120px)] flex rounded-xl overflow-hidden border border-slate-200 shadow-sm">
      {/* Left Panel - Vehicle List */}
      <VehicleList
        vehicles={vehicles || []}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onVehicleSelect={handleVehicleSelect}
        selectedVehicleId={selectedVehicle?.id}
      />
      
      {/* Right Panel - Map */}
      <LeafletMap
        vehicles={vehicles || []}
        selectedVehicle={selectedVehicle}
        onVehicleSelect={handleVehicleSelect}
      />
    </div>
  );
}
