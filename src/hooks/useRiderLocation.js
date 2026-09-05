import { useState, useEffect } from 'react';

/**
 * Shared hook for a single source of truth for the rider's GPS location.
 * Uses watchPosition to provide continuous updates.
 */
export function useRiderLocation() {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    speed: null,
    heading: null,
    accuracy: null,
    timestamp: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation is not supported by your browser', loading: false }));
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          heading: position.coords.heading,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
          error: null,
          loading: false,
        });
      },
      (error) => {
        setLocation(prev => ({ ...prev, error: error.message, loading: false }));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
      }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, []);

  return location;
}
