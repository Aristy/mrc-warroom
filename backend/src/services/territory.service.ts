import { readJsonFile, writeJsonFile, ensureRuntimeJsonFile, TERRITORY_RUNTIME_FILE, TERRITORY_SEED_FILE } from '../db/index.js';

export interface TerritoryCenter { id: string; name: string; zoneId: string; zoneName: string; arrondissementId: string; arrondissementName: string; departmentId: string; departmentName: string; }
export interface TerritoryZone { id: string; name: string; arrondissementId: string; arrondissementName: string; departmentId: string; departmentName: string; centers?: TerritoryCenter[]; }
export interface TerritoryArrondissement { id: string; name: string; departmentId: string; departmentName: string; zones?: TerritoryZone[]; }
export interface TerritoryDepartment { id: string; name: string; arrondissements?: TerritoryArrondissement[]; }
export interface TerritoryResponse { updatedAt: string; departments: TerritoryDepartment[]; arrondissements: TerritoryArrondissement[]; zones: TerritoryZone[]; centers: TerritoryCenter[]; summary: { departments: number; arrondissements: number; zones: number; centers: number; }; }

export function normalizeKey(value: string): string {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

export function titleCaseWords(value: string): string {
  return String(value || '').split(/[\s_-]+/).filter(Boolean).map(c => c.charAt(0).toUpperCase() + c.slice(1).toLowerCase()).join(' ');
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function buildTerritoryResponse(data: any): TerritoryResponse {
  const departments: TerritoryDepartment[] = Array.isArray(data?.departments) ? data.departments : [];
  const arrondissements: TerritoryArrondissement[] = [];
  const zones: TerritoryZone[] = [];
  const centers: TerritoryCenter[] = [];

  departments.forEach(dept => {
    (dept.arrondissements || []).forEach((arr: TerritoryArrondissement) => {
      arrondissements.push({ id: arr.id, name: arr.name, departmentId: dept.id, departmentName: dept.name });
      (arr.zones || []).forEach((zone: TerritoryZone) => {
        zones.push({ id: zone.id, name: zone.name, arrondissementId: arr.id, arrondissementName: arr.name, departmentId: dept.id, departmentName: dept.name });
        (zone.centers || []).forEach((center: TerritoryCenter) => {
          centers.push({ id: center.id, name: center.name, zoneId: zone.id, zoneName: zone.name, arrondissementId: arr.id, arrondissementName: arr.name, departmentId: dept.id, departmentName: dept.name });
        });
      });
    });
  });

  return { updatedAt: data?.updatedAt || new Date().toISOString(), departments, arrondissements, zones, centers, summary: { departments: departments.length, arrondissements: arrondissements.length, zones: zones.length, centers: centers.length } };
}

export function readTerritoryData(): TerritoryResponse {
  ensureRuntimeJsonFile(TERRITORY_RUNTIME_FILE, TERRITORY_SEED_FILE);
  return buildTerritoryResponse(readJsonFile(TERRITORY_RUNTIME_FILE));
}

export function writeTerritoryData(data: unknown): void {
  writeJsonFile(TERRITORY_RUNTIME_FILE, { ...(data as object), updatedAt: new Date().toISOString() });
}
