/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║ 🧠 SOFIA AI STORE - AI State Management                                 ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import { create } from 'zustand';
import type { SofiaHealth, SofiaMetrics } from '@types';
import { sofia } from '@services/sofia';

interface SofiaStore {
  health: SofiaHealth | null;
  metrics: SofiaMetrics | null;
  loading: boolean;
  error: string | null;

  fetchHealth: () => Promise<void>;
  fetchMetrics: () => Promise<void>;
  startMonitoring: () => void;
  stopMonitoring: () => void;
}

export const useSofiaStore = create<SofiaStore>((set, get) => ({
  health: null,
  metrics: null,
  loading: false,
  error: null,

  fetchHealth: async () => {
    set({ loading: true, error: null });
    try {
      const health = await sofia.getHealth();
      set({ health, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch Sofia health',
        loading: false,
      });
    }
  },

  fetchMetrics: async () => {
    set({ loading: true, error: null });
    try {
      const metrics = await sofia.getMetrics();
      set({ metrics, loading: false });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch Sofia metrics',
        loading: false,
      });
    }
  },

  startMonitoring: () => {
    sofia.startHealthCheck((health) => {
      set({ health });
    }, 30000); // Every 30 seconds
  },

  stopMonitoring: () => {
    sofia.stopHealthCheck();
  },
}));
