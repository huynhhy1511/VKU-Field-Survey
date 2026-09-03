export type FacilityCategory = 
  | 'Phần cứng'
  | 'Máy chiếu'
  | 'Điều hòa'
  | 'Điện'
  | 'Nội thất';

export type CampusArea = 'Khu K' | 'Khu V';

export interface GeoLocationData {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface SurveyFormData {
  campusArea: CampusArea;
  building: string;
  floor: string;
  room: string;
  category: FacilityCategory;
  rating: number; // 1 - 5 sao
  notes: string;
  photoBase64: string | null;
  photoTimestamp?: number;
  location: GeoLocationData | null;
  auditorName: string;
  updatedAt: number;
}

export type SyncStatus = 'PENDING_SYNC' | 'SYNCING' | 'SYNCED' | 'FAILED';

export interface SyncRecord {
  id: string; // UUID v4
  timestamp: number;
  status: SyncStatus;
  payload: SurveyFormData;
  retryCount: number;
  lastAttempt?: number;
  errorMessage?: string;
}

export interface NetworkState {
  connected: boolean;
  connectionType: string;
}
