import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';

export interface VehicleLocation {
  id: string;
  license_plate: string;
  category: string;
  brand?: string;
  speed_kmh: number;
  location: {
    lat: number;
    lng: number;
  };
  status: string;
  driver_name?: string;
}

// Predefined locations around Hyderabad, India for consistent vehicle positions
const vehicleLocations: Record<string, { lat: number; lng: number }> = {};

// Generate consistent GPS location for a vehicle based on its ID
const getVehicleLocation = (vehicleId: string, index: number) => {
  // If we already have a location for this vehicle, return it
  if (vehicleLocations[vehicleId]) {
    return vehicleLocations[vehicleId];
  }
  
  // Hyderabad area coordinates (center around HITEC City / Gachibowli area)
  const hyderabadCenter = { lat: 17.4435, lng: 78.3772 };
  
  // Generate a deterministic but spread out position based on index
  const angle = (index * 137.5) * (Math.PI / 180); // Golden angle for even distribution
  const radius = 0.02 + (index % 10) * 0.008; // Varying radius
  
  const location = {
    lat: hyderabadCenter.lat + radius * Math.cos(angle),
    lng: hyderabadCenter.lng + radius * Math.sin(angle),
  };
  
  // Store for consistency
  vehicleLocations[vehicleId] = location;
  return location;
};

// Map category to brand names
const categoryBrands: Record<string, string[]> = {
  'Bike': ['Hero Splendor', 'Bajaj Pulsar', 'Honda Activa', 'TVS Jupiter'],
  '3_Wheeler': ['Bajaj RE', 'Piaggio Ape', 'Mahindra Treo'],
  'Mini_Truck': ['Tata Ace', 'Mahindra Bolero Pickup', 'Ashok Leyland Dost'],
  'Medium_Truck': ['Tata 407', 'Eicher Pro', 'BharatBenz'],
  'Heavy_Truck': ['Tata Prima', 'Ashok Leyland', 'Volvo FM'],
};

const getBrandForVehicle = (category: string, index: number): string => {
  const brands = categoryBrands[category] || ['Unknown'];
  return brands[index % brands.length];
};

// Generate locations from actual vehicle data
const generateLocationsFromVehicles = (vehicles: Vehicle[]): VehicleLocation[] => {
  return vehicles.map((vehicle, index) => {
    // Determine speed based on status
    let speed = 0;
    if (vehicle.status === 'On_Trip') {
      // Random speed between 20-90 for vehicles on trip
      speed = 20 + Math.floor(Math.random() * 70);
    } else if (vehicle.status === 'Available') {
      // Some available vehicles might be moving slowly (returning)
      speed = Math.random() > 0.7 ? Math.floor(Math.random() * 30) : 0;
    }
    
    return {
      id: vehicle.id,
      license_plate: vehicle.license_plate,
      category: vehicle.category,
      brand: getBrandForVehicle(vehicle.category, index),
      speed_kmh: speed,
      location: getVehicleLocation(vehicle.id, index),
      status: vehicle.status,
    };
  });
};

export function useVehicleLocations() {
  return useQuery<VehicleLocation[]>({
    queryKey: ['vehicle-locations'],
    queryFn: async () => {
      const response = await api.get('/vehicles');
      const vehicles = response.data as Vehicle[];
      return generateLocationsFromVehicles(vehicles);
    },
    refetchInterval: 10000, // Refresh every 10 seconds for live tracking
  });
}

export function useMapStats() {
  const { data: locations } = useVehicleLocations();
  
  const stats = {
    totalVehicles: locations?.length || 0,
    moving: locations?.filter(v => v.speed_kmh > 0).length || 0,
    parked: locations?.filter(v => v.speed_kmh === 0).length || 0,
    gpsEnabled: locations?.length || 0,
  };
  
  return stats;
}
