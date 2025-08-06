/**
 * Entités localisation - Types relatifs aux lieux et géolocalisation
 */

/**
 * Coordonnées géographiques et informations de lieu
 */
export interface LocationInfo {
  name: string;
  address?: string;
  city?: string;
  state_province?: string;
  postal_code?: string;
  country: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  timezone?: string;
  port_code?: string;
  airport_code?: string;
}

/**
 * Information de port ou terminal
 */
export interface PortInfo extends LocationInfo {
  port_code: string;
  port_type: 'seaport' | 'airport' | 'inland_port';
  customs_office?: string;
  operating_hours?: {
    open_time: string;
    close_time: string;
    days_of_week: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
  };
}

/**
 * Coordonnées GPS avec métadonnées
 */
export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number; // En mètres
  altitude?: number;
  timestamp?: Date;
}