import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { VehicleLocation } from '../hooks/useMapData';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom car icon based on speed
const createCarIcon = (speed: number) => {
  const color = speed > 50 ? '#10b981' : speed > 0 ? '#3b82f6' : '#94a3b8';
  
  return L.divIcon({
    className: 'custom-car-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background: ${color};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

interface MapControllerProps {
  selectedVehicle?: VehicleLocation;
}

function MapController({ selectedVehicle }: MapControllerProps) {
  const map = useMap();
  
  useEffect(() => {
    if (selectedVehicle) {
      map.flyTo([selectedVehicle.location.lat, selectedVehicle.location.lng], 15, {
        duration: 1,
      });
    }
  }, [selectedVehicle, map]);
  
  return null;
}

interface LeafletMapProps {
  vehicles: VehicleLocation[];
  selectedVehicle?: VehicleLocation;
  onVehicleSelect: (vehicle: VehicleLocation) => void;
}

export function LeafletMap({ vehicles, selectedVehicle, onVehicleSelect }: LeafletMapProps) {
  // Hyderabad center coordinates (HITEC City area)
  const defaultCenter: [number, number] = [17.4435, 78.3772];
  const defaultZoom = 13;

  return (
    <div className="flex-1 relative">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full"
        style={{ background: '#e5e7eb' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapController selectedVehicle={selectedVehicle} />
        
        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.location.lat, vehicle.location.lng]}
            icon={createCarIcon(vehicle.speed_kmh)}
            eventHandlers={{
              click: () => onVehicleSelect(vehicle),
            }}
          >
            <Popup>
              <div className="min-w-[180px]">
                <div className="font-semibold text-slate-800 mb-1">
                  {vehicle.license_plate}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  {vehicle.brand || vehicle.category.replace(/_/g, ' ')}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className={`font-medium ${
                    vehicle.speed_kmh > 50 ? 'text-green-500' : 
                    vehicle.speed_kmh > 0 ? 'text-blue-500' : 'text-slate-400'
                  }`}>
                    {vehicle.speed_kmh} km/h
                  </span>
                  <span className="text-slate-300">|</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                    vehicle.status === 'Available' ? 'bg-green-100 text-green-700' :
                    vehicle.status === 'On_Trip' ? 'bg-blue-100 text-blue-700' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {vehicle.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      
      {/* Filters button */}
      <button className="absolute top-4 right-4 z-[1000] flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm hover:bg-slate-50 transition-colors">
        <svg className="w-4 h-4 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
        </svg>
        <span className="text-sm font-medium text-slate-700">Filters</span>
      </button>
      
      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 z-[1000] flex flex-col gap-1">
        <button className="w-8 h-8 bg-white border border-slate-200 rounded shadow-sm flex items-center justify-center hover:bg-slate-50">
          <svg className="w-4 h-4 text-slate-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>
        <button className="w-8 h-8 bg-white border border-slate-200 rounded shadow-sm flex items-center justify-center hover:bg-slate-50 text-lg font-bold text-slate-600">
          +
        </button>
        <button className="w-8 h-8 bg-white border border-slate-200 rounded shadow-sm flex items-center justify-center hover:bg-slate-50 text-lg font-bold text-slate-600">
          −
        </button>
      </div>
    </div>
  );
}
