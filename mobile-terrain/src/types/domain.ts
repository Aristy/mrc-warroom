// Must match backend TERRAIN_MODULE_IDS exactly
export type ModuleKey = 'campaign' | 'sondage' | 'incident' | 'events' | 'mission' | 'digital' | 'logistique' | 'adherent';

export interface MobileUser {
  id: string;
  login: string;
  name?: string;
  role: string;
  terrainModules?: ModuleKey[];
  department?: string;
  arrondissement?: string;
  zone?: string;
  geographicScope?: string;
}

export interface GpsSnapshot {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: string;
}

export interface QueueItem {
  id: string;
  url: string;
  body: string;
  createdAt: string;
  attempts: number;
}

export interface TerritoryZone {
  name: string;
  centers?: string[];
}

export interface TerritoryArrondissement {
  name: string;
  zones?: TerritoryZone[];
}

export interface TerritoryDepartment {
  name: string;
  arrondissements?: TerritoryArrondissement[];
}

export interface LoginResponse {
  token: string;
  user: MobileUser;
}
