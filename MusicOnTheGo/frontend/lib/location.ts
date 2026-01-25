// frontend/lib/location.ts
// Location utilities for getting user's location and reverse geocoding

import * as Location from 'expo-location';
import { Platform } from 'react-native';

export interface LocationData {
  city: string;
  state: string;
  country: string;
  location: string; // Formatted: "City, State, Country"
  latitude: number;
  longitude: number;
}

/**
 * Request location permission and get current location
 */
export async function requestLocationPermission(): Promise<boolean> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.error('[Location] Permission request error:', error);
    return false;
  }
}

/**
 * Get current location coordinates
 */
export async function getCurrentLocation(): Promise<Location.LocationObject | null> {
  try {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      console.warn('[Location] Permission denied');
      return null;
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Good balance between accuracy and speed
      timeout: 10000, // 10 seconds timeout
    });

    return location;
  } catch (error) {
    console.error('[Location] Get location error:', error);
    return null;
  }
}

/**
 * Reverse geocode coordinates to get address components
 * Uses Expo's built-in reverse geocoding
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<LocationData | null> {
  try {
    const addresses = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });

    if (!addresses || addresses.length === 0) {
      console.warn('[Location] No address found for coordinates');
      return null;
    }

    const address = addresses[0];

    // Extract city, state, and country
    const city = address.city || address.subAdministrativeArea || address.district || '';
    const state = address.region || address.administrativeArea || '';
    const country = address.country || '';

    // Format location string: "City, State, Country"
    const locationParts = [city, state, country].filter(Boolean);
    const location = locationParts.join(', ');

    return {
      city,
      state,
      country,
      location,
      latitude,
      longitude,
    };
  } catch (error) {
    console.error('[Location] Reverse geocode error:', error);
    return null;
  }
}

/**
 * Get current location and reverse geocode it
 * Returns standardized location data
 */
export async function getCurrentLocationData(): Promise<LocationData | null> {
  try {
    const location = await getCurrentLocation();
    if (!location) {
      return null;
    }

    const { latitude, longitude } = location.coords;
    const locationData = await reverseGeocode(latitude, longitude);

    return locationData;
  } catch (error) {
    console.error('[Location] Get location data error:', error);
    return null;
  }
}

/**
 * Format location for display
 */
export function formatLocation(locationData: LocationData | null): string {
  if (!locationData) {
    return 'Location not available';
  }

  return locationData.location || `${locationData.city}, ${locationData.state}`;
}
