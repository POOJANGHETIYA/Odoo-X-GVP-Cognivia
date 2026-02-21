import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Driver } from '@/types';

export function useDrivers() {
  return useQuery<Driver[]>({
    queryKey: ['drivers'],
    queryFn: () => api.get('/drivers').then((res: any) => res.data),
  });
}

export function useDriver(id: string) {
  return useQuery<Driver>({
    queryKey: ['drivers', id],
    queryFn: () => api.get(`/drivers/${id}`).then((res: any) => res.data),
    enabled: !!id,
  });
}

export function useAvailableDrivers() {
  return useQuery<Driver[]>({
    queryKey: ['drivers', 'available'],
    queryFn: () => api.get('/drivers').then((res: any) => 
      res.data.filter((d: Driver) => d.status === 'Available')
    ),
  });
}

export function useCreateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (newDriver: Partial<Driver>) => 
      api.post('/drivers', newDriver).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

export function useUpdateDriver() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, ...updates }: Partial<Driver> & { id: string }) =>
      api.put(`/drivers/${id}`, updates).then((res: any) => res.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['drivers'] });
    },
  });
}

// Driver statistics helper
export function useDriverStats() {
  const { data: drivers } = useDrivers();
  
  const stats = {
    total: drivers?.length || 0,
    available: drivers?.filter(d => d.status === 'Available').length || 0,
    onDuty: drivers?.filter(d => d.status === 'On_Duty').length || 0,
    offDuty: drivers?.filter(d => d.status === 'Off_Duty').length || 0,
    suspended: drivers?.filter(d => d.status === 'Suspended').length || 0,
  };
  
  return stats;
}
