/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🌸 PÉTALAS HOOK - Vertical SaaS management                              ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@services/api';
import type { Petala } from '@types';

export function usePetalas() {
  const queryClient = useQueryClient();

  const {
    data: petalas,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['petalas'],
    queryFn: async () => {
      const response = await api.get<Petala>('petalas');
      return response.data;
    },
  });

  const createPetala = useMutation({
    mutationFn: (petala: Partial<Petala>) => api.create('petalas', petala),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petalas'] });
    },
  });

  const updatePetala = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Petala> }) =>
      api.update('petalas', id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petalas'] });
    },
  });

  const deletePetala = useMutation({
    mutationFn: (id: string) => api.delete('petalas', id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['petalas'] });
    },
  });

  return {
    petalas,
    isLoading,
    error,
    createPetala,
    updatePetala,
    deletePetala,
  };
}

export function usePetala(id: string) {
  return useQuery({
    queryKey: ['petalas', id],
    queryFn: async () => {
      const response = await api.getOne<Petala>('petalas', id);
      return response.data;
    },
    enabled: !!id,
  });
}
