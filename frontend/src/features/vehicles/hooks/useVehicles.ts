import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Vehicle } from '@/types';
import { mockVehicles } from '@/mocks/mockData';

export function useVehicles() {
    return useQuery<Vehicle[]>({
        queryKey: ['vehicles'],
        queryFn: () => Promise.resolve(mockVehicles as any as Vehicle[]),
    });
}

export function useAddVehicle() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (newVehicle: Omit<Vehicle, 'id' | 'capacity_volume_cft'> & { capacity_volume_cft?: number }) => {
            const payload: Vehicle = {
                id: crypto.randomUUID(),
                capacity_volume_cft: 0,
                ...newVehicle,
            };
            return api.post('/vehicles', payload).then((res: any) => res.data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['vehicles'] });
        },
    });
}
