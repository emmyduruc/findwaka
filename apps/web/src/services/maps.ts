import { Loader } from '@googlemaps/js-api-loader';

let loader: Loader | null = null;
let mapsLoaded = false;

declare global {
  interface Window {
    google: typeof google;
  }
}

export const initGoogleMaps = async (): Promise<void> => {
  if (mapsLoaded) return;

  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    throw new Error('Google Maps API key is not configured');
  }

  loader = new Loader({
    apiKey,
    version: 'weekly',
    libraries: ['places', 'geometry'],
  });

  await loader.load();
  mapsLoaded = true;
};

export const calculateDistance = (
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number => {
  if (!window.google || !window.google.maps) {
    throw new Error('Google Maps not loaded');
  }

  const from = new window.google.maps.LatLng(lat1, lng1);
  const to = new window.google.maps.LatLng(lat2, lng2);
  return window.google.maps.geometry.spherical.computeDistanceBetween(from, to) / 1000; // Convert to km
};

export const getCurrentLocation = (): Promise<{ lat: number; lng: number }> => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
};

export { mapsLoaded };

