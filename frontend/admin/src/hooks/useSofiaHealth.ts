/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA HEALTH HOOK - Real-time AI monitoring                          ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { sofia } from '@services/sofia';
import { useSofiaStore } from '@store/sofiaStore';

export function useSofiaHealth() {
  const { startMonitoring, stopMonitoring } = useSofiaStore();

  const { data: health, isLoading, error, refetch } = useQuery({
    queryKey: ['sofia', 'health'],
    queryFn: () => sofia.getHealth(),
    refetchInterval: 30000, // Refetch every 30s
    retry: 3,
  });

  useEffect(() => {
    startMonitoring();
    return () => stopMonitoring();
  }, [startMonitoring, stopMonitoring]);

  return {
    health,
    isLoading,
    error,
    refetch,
  };
}
