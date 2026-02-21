import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { MaintenanceLog, Vehicle } from '@/types';

export function useMaintenanceLogs() {
    return useQuery<MaintenanceLog[]>({
        queryKey: ['maintenance'],
        queryFn: () => api.get('/maintenance').then((res: any) => res.data),
    });
}

export function useVehiclesForMaintenance() {
    return useQuery<Vehicle[]>({
        queryKey: ['vehicles'],
        queryFn: () => api.get('/vehicles').then((res: any) => res.data),
    });
}

export function useCreateMaintenanceLog() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: Omit<MaintenanceLog, 'id' | 'completed_date'>) =>
            api.post('/maintenance', data).then((res: any) => res.data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['maintenance'] });
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}
