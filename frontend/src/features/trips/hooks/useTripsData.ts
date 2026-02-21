import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Trip, Vehicle, Driver } from '@/types';

export function useTrips() {
  return useQuery<Trip[]>({
    queryKey: ['trips'],
    queryFn: () => api.get('/trips').then((res: any) => res.data),
  });
}

export function useVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles'],
    queryFn: () => api.get('/vehicles').then((res: any) => res.data),
  });
}

export function useDrivers() {
  return useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: () => api.get('/drivers').then((res: any) => res.data),
  });
}

export function useAvailableVehicles() {
  return useQuery<Vehicle[]>({
    queryKey: ['vehicles', 'available'],
    queryFn: () => api.get('/vehicles').then((res: any) =>
      res.data.filter((v: Vehicle) => v.status === 'Available')
    ),
  });
}

export function useAvailableDrivers() {
  return useQuery<Driver[]>({
    queryKey: ['drivers', 'available'],
    queryFn: () => api.get('/drivers').then((res: any) =>
      res.data.filter((d: Driver) =>
        d.status === 'Available' &&
        new Date(d.license_expiry) > new Date()
      )
    ),
  });
}

export function useCreateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newTrip: Partial<Trip>) =>
      api.post('/trips', newTrip).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
    },
  });
}

export function useUpdateTrip() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Trip> & { id: string }) =>
      api.put(`/trips/${id}`, updates).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trips'] });
      queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}
