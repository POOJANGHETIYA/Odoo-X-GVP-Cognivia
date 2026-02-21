import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vehicle, Trip } from '@/types';

export interface ChartDataPoint {
  date: string;
  revenue: number;
  expenses: number;
}

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((res: any) => res.data),
  });
}

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then((res: any) => res.data),
  });
}

export function useRevenueExpenseChart() {
  return useQuery<ChartDataPoint[]>({
    queryKey: ['dashboard', 'revenue-expenses'],
    queryFn: () => api.get('/dashboard/revenue-expenses').then((res: any) => res.data),
  });
}

export function useDashboardKPIs() {
  const { data: vehicles } = useVehicles();
  const { data: trips } = useTrips();

  const activeFleet = vehicles?.filter(v => v.status === 'On_Trip').length || 0;
  const maintenanceAlerts = vehicles?.filter(v => v.status === 'In_Shop').length || 0;
  const idleFleet = vehicles?.filter(v => v.status === 'Available').length || 0;
  const pendingTrips = trips?.filter(t => t.status === 'Unassigned').length || 0;

  return {
    activeFleet,
    maintenanceAlerts,
    idleFleet,
    pendingTrips,
    isLoading: !vehicles || !trips
  };
}
