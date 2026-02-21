import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Filter, Maximize, Plus, Minus } from 'lucide-react';
import { VehicleLocation } from '../hooks/useMapData';

// Fix for default marker icons in React-Leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom car icon based on speed
const createCarIcon = (speed: number, heading: number = 0) => {
  const color = speed > 0 ? '#4f46e5' : '#71717a';

  return L.divIcon({
    className: 'custom-car-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: white;
        border-radius: 10px;
        border: 2px solid ${color};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="transform: rotate(${heading}deg);">
          <polygon points="3 11 22 2 13 21 11 13 3 11"></polygon>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

interface MapControllerProps {
  selectedVehicle?: VehicleLocation;
}

function MapController({ selectedVehicle }: MapControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedVehicle) {
      map.flyTo([selectedVehicle.location.lat, selectedVehicle.location.lng], 16, {
        duration: 1.5,
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
  const defaultCenter: [number, number] = [17.4435, 78.3772];
  const defaultZoom = 13;

  return (
    <div className="flex-1 relative h-full w-full">
      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        className="h-full w-full z-0"
        style={{ background: '#f4f4f5' }}
        zoomControl={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />

        <MapController selectedVehicle={selectedVehicle} />

        {vehicles.map((vehicle) => (
          <Marker
            key={vehicle.id}
            position={[vehicle.location.lat, vehicle.location.lng]}
            icon={createCarIcon(vehicle.speed_kmh, vehicle.heading)}
            eventHandlers={{
              click: () => onVehicleSelect(vehicle),
            }}
          >
            <Popup className="custom-popup">
              <div className="min-w-[200px] p-1">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-black text-white bg-indigo-600 px-1.5 py-0.5 rounded uppercase tracking-widest">Active Asset</span>
                  <span className="text-[10px] font-bold text-zinc-400 tabular-nums">ID: {vehicle.id.slice(0, 8)}</span>
                </div>
                <div className="font-black text-zinc-900 text-sm mb-0.5 tracking-tight uppercase">
                  {vehicle.license_plate}
                </div>
                <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter mb-3 border-b border-zinc-100 pb-2">
                  {vehicle.brand || 'Asset Model'} · {vehicle.category.replace(/_/g, ' ')}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <p className="text-[8px] font-bold text-zinc-400 uppercase mb-1">Velocity</p>
                    <p className="text-xs font-black text-indigo-600 tabular-nums">{vehicle.speed_kmh} <span className="text-[8px] font-bold">KM/H</span></p>
                  </div>
                  <div className="bg-zinc-50 p-2 rounded-lg border border-zinc-100">
                    <p className="text-[8px] font-bold text-zinc-400 uppercase mb-1">Deployment</p>
                    <p className={`text-[9px] font-black uppercase ${vehicle.status === 'Available' ? 'text-emerald-600' : 'text-amber-600'
                      }`}>{vehicle.status.replace(/_/g, ' ')}</p>
                  </div>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Overlay Controls */}
      <div className="absolute top-6 right-6 z-[1000] flex flex-col gap-3">
        <button className="flex items-center gap-2.5 px-4 py-2 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-200/50 hover:bg-zinc-50 transition-all font-bold text-[11px] uppercase tracking-wider text-zinc-700 active:scale-95">
          <Filter className="w-3.5 h-3.5 text-indigo-600" />
          Layer Filtering
        </button>
      </div>

      <div className="absolute bottom-6 right-6 z-[1000] flex flex-col gap-2">
        <button className="w-10 h-10 bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-200/50 flex items-center justify-center hover:bg-zinc-50 transition-all active:scale-95">
          <Maximize className="w-4 h-4 text-zinc-600" />
        </button>
        <div className="flex flex-col bg-white border border-zinc-200 rounded-xl shadow-lg shadow-zinc-200/50 overflow-hidden">
          <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-all border-b border-zinc-100 active:scale-95">
            <Plus className="w-4 h-4 text-zinc-600" />
          </button>
          <button className="w-10 h-10 flex items-center justify-center hover:bg-zinc-50 transition-all active:scale-95">
            <Minus className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
