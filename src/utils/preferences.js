export function getTimeFormat() {
  return localStorage.getItem('TIME_FORMAT') || '12h';
}

export function getUnitSystem() {
  return localStorage.getItem('UNIT_SYSTEM') || 'metric';
}

export function formatTime(dateObj) {
  const format = getTimeFormat();
  const is12Hour = format === '12h';
  return dateObj.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit', 
    hour12: is12Hour 
  });
}

export function formatTemp(celsiusValue) {
  const unit = getUnitSystem();
  if (unit === 'imperial') {
    const fahrenheit = (celsiusValue * 9/5) + 32;
    return `${Math.round(fahrenheit)}° F`;
  }
  return `${Math.round(celsiusValue)}° C`;
}

export function formatSpeed(metersPerSecond) {
  const unit = getUnitSystem();
  if (unit === 'imperial') {
    // m/s to mph
    return `${Math.round(metersPerSecond * 2.23694)} mph`;
  }
  // m/s to km/h
  return `${Math.round(metersPerSecond * 3.6)} km/h`;
}

export function formatDistance(meters) {
  const unit = getUnitSystem();
  if (unit === 'imperial') {
    const miles = meters / 1609.34;
    if (miles >= 10) return `>= 10.0 mi`;
    return `${miles.toFixed(1)} mi`;
  }
  const km = meters / 1000;
  if (km >= 10) return `>= 10.0 km`;
  return `${km.toFixed(1)} km`;
}

export function formatPrecipitation(mm) {
  const unit = getUnitSystem();
  if (unit === 'imperial') {
    return `${(mm / 25.4).toFixed(2)} in`;
  }
  return `${mm} mm`;
}

import { useState, useEffect } from 'react';

export function usePreferences() {
  const [prefs, setPrefs] = useState({
    timeFormat: getTimeFormat(),
    unitSystem: getUnitSystem()
  });

  useEffect(() => {
    const handlePrefsChange = () => {
      setPrefs({
        timeFormat: getTimeFormat(),
        unitSystem: getUnitSystem()
      });
    };
    window.addEventListener('preferencesChanged', handlePrefsChange);
    return () => window.removeEventListener('preferencesChanged', handlePrefsChange);
  }, []);

  return prefs;
}
