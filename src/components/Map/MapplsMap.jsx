import React, { useEffect, useRef, useState } from 'react';
import { mappls, mappls_plugin } from 'mappls-web-maps';

const MAPPLS_TOKEN = import.meta.env.VITE_MAPPLS_TOKEN || 'dummy_mappls_token';

export default function MapplsMap({ location, cleanDashboard }) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [isMapLoaded, setIsMapLoaded] = useState(false);

  // 1. Initialize Map
  useEffect(() => {
    const mapplsClassObject = new mappls();
    const mapplsPluginObject = new mappls_plugin();

    const loadObject = { 
      map: true, 
      plugins: ['direction', 'placeSearch'] 
    };

    mapplsClassObject.initialize(MAPPLS_TOKEN, loadObject, () => {
      // Create Map
      const newMap = mapplsClassObject.Map({
        id: "mappls-map-container",
        properties: {
          center: [28.61, 77.23], // Default New Delhi fallback
          zoom: 14,
          zoomControl: true,
          location: true,
          compass: true,
          fullscreenControl: true,
        },
      });

      newMap.on("load", () => {
        setIsMapLoaded(true);
        mapRef.current = newMap;

        // Initialize Native Direction Plugin
        try {
          mapplsPluginObject.direction({
            map: newMap,
            start: location.latitude ? `${location.latitude},${location.longitude}` : '',
          });
        } catch(e) {
          console.warn("Mappls Direction init warning:", e);
        }
        
        // Handle dynamic resizing (when bottom bar is hidden/shown)
        if (mapContainerRef.current) {
          const resizeObserver = new ResizeObserver(() => {
            if (mapRef.current && typeof mapRef.current.resize === 'function') {
              mapRef.current.resize();
            }
          });
          resizeObserver.observe(mapContainerRef.current);
          
          // Attach observer to mapRef so we can disconnect it on unmount
          mapRef.current.__resizeObserver = resizeObserver;
        }
      });
    });

    return () => {
      if (mapRef.current) {
        if (mapRef.current.__resizeObserver) {
          mapRef.current.__resizeObserver.disconnect();
        }
        if(typeof mapRef.current.remove === 'function') {
          mapRef.current.remove();
        }
      }
    };
  }, []); // Run once on mount

  // 2. Update Rider Marker based on GPS (Shared Location Hook)
  useEffect(() => {
    if (!isMapLoaded || !mapRef.current || !location.latitude || !location.longitude) return;

    const coords = [location.latitude, location.longitude];

    if (!markerRef.current) {
      // Create Rider Marker
      const mapplsClassObject = new mappls();
      markerRef.current = mapplsClassObject.Marker({
        map: mapRef.current,
        position: coords,
        icon: 'https://apis.mapmyindia.com/map_v3/1.png', // Default icon
        width: 32,
        height: 32
      });
      // Pan to initial location using correct object syntax
      mapRef.current.setCenter({ lat: location.latitude, lng: location.longitude });
    } else {
      // Update existing marker position smoothly
      markerRef.current.setPosition(coords);
      // Optional: also pan map to follow rider
      mapRef.current.setCenter({ lat: location.latitude, lng: location.longitude });
    }
  }, [isMapLoaded, location.latitude, location.longitude]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div 
        id="mappls-map-container" 
        ref={mapContainerRef}
        className="mappls-map"
        style={{ width: "100%", height: "100%", position: 'absolute', top: 0, left: 0 }}
      ></div>
    </div>
  );
}
