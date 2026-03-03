import { useMemo } from 'react';
import type { MobileUser, ModuleKey } from '../types/domain.js';

const MODULE_LABELS: Record<ModuleKey, string> = {
  sondage: 'Sondage',
  campaign: 'Campagne',
  incident: 'Incident',
  events: 'Événement',
  mission: 'Mission',
  digital: 'Digital',
  logistique: 'Logistique',
  adherent: 'Adhérent',
};

const MODULE_ICONS: Record<ModuleKey, string> = {
  sondage: '📊',
  campaign: '📣',
  incident: '⚠️',
  events: '🎪',
  mission: '🎯',
  digital: '📱',
  logistique: '🚛',
  adherent: '👥',
};

const MODULE_COLORS: Record<ModuleKey, string> = {
  sondage: '#2563eb',
  campaign: '#7c3aed',
  incident: '#dc2626',
  events: '#059669',
  mission: '#d97706',
  digital: '#0891b2',
  logistique: '#65a30d',
  adherent: '#db2777',
};

export function useModules(user: MobileUser | null) {
  const modules = useMemo(() => {
    if (!user) return [];
    return (user.terrainModules ?? []).map(key => ({
      key,
      label: MODULE_LABELS[key] ?? key,
      icon: MODULE_ICONS[key] ?? '📋',
      color: MODULE_COLORS[key] ?? '#6b7280',
    }));
  }, [user]);

  return modules;
}
