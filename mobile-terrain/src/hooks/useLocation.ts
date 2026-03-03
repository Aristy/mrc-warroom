import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import type { GpsSnapshot } from '../types/domain.js';

interface LocationState {
  coords: GpsSnapshot | null;
  error: string | null;
  loading: boolean;
}

export function useLocation() {
  const [state, setState] = useState<LocationState>({ coords: null, error: null, loading: false });

  const capture = useCallback(async (): Promise<GpsSnapshot | null> => {
    setState(s => ({ ...s, loading: true, error: null }));
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setState(s => ({ ...s, loading: false, error: 'Permission GPS refusée' }));
        return null;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const snap: GpsSnapshot = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        accuracy: loc.coords.accuracy ?? undefined,
        timestamp: new Date().toISOString(),
      };
      setState({ coords: snap, error: null, loading: false });
      return snap;
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur GPS';
      setState(s => ({ ...s, loading: false, error: msg }));
      return null;
    }
  }, []);

  const clear = useCallback(() => {
    setState({ coords: null, error: null, loading: false });
  }, []);

  return { ...state, capture, clear };
}
