
import { useState, useMemo, useEffect } from 'react';
import { AppState } from '../types';
import { calculateFinancials } from '../utils/calculations';
import { INITIAL_STATE } from '../constants';
import { useToastData } from './useToastData';
import { useToastActions } from './useToastActions';

const STORAGE_KEY = 'toast_master_state_v1';

export const useToastMasterApp = () => {
  // 1. Initialize State from LocalStorage (Instant Load)
  const [state, setState] = useState<AppState>(() => {
      try {
          const saved = localStorage.getItem(STORAGE_KEY);
          if (saved) {
              const parsed = JSON.parse(saved);
              if (parsed && parsed.menuItems) {
                  return parsed;
              }
          }
      } catch (e) {
          console.warn("Failed to load cached state", e);
      }
      return INITIAL_STATE;
  });

  const [isCacheLoaded, setIsCacheLoaded] = useState(() => {
      return !!localStorage.getItem(STORAGE_KEY);
  });

  // 3. Data Fetching & Subscriptions
  const { session, loading: backendLoading, fetchInventoryLayer } = useToastData(setState);

  const loading = !isCacheLoaded && backendLoading;

  // 4. Persistence Effect
  useEffect(() => {
      if (state !== INITIAL_STATE) {
          try {
              localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          } catch (e) {
              console.error("Storage Quota Exceeded or Error", e);
          }
      }
  }, [state]);

  // 5. Business Logic Actions (Pass stable ID)
  const userId = session?.user?.id;
  const actions = useToastActions(state, setState, userId, fetchInventoryLayer);

  // 6. Derived Calculations
  const results = useMemo(() => calculateFinancials(state), [state]);

  const saving = false; 

  return {
      state,
      setState,
      session,
      loading,
      saving,
      results,
      actions
  };
};
