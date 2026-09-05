import axios from 'axios';

const CACHE_KEY = 'rideros_weather_cache';
const CACHE_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes

import { getWeatherApiKey } from './apiKeys';

const API_KEY = getWeatherApiKey();

export async function fetchWeather(lat, lon) {
  if (!lat || !lon) return null;

  // Check cache first
  const cachedStr = localStorage.getItem(CACHE_KEY);
  if (cachedStr) {
    try {
      const cached = JSON.parse(cachedStr);
      if (
        Date.now() - cached.timestamp < CACHE_EXPIRY_MS &&
        Math.abs(cached.lat - lat) < 0.1 && 
        Math.abs(cached.lon - lon) < 0.1
      ) {
        return cached.data;
      }
    } catch (e) {
      console.warn("Weather cache read error", e);
    }
  }

  // Fetch new data (Using OpenWeather OneCall API for current + forecast if possible, or standard)
  // Since OneCall requires subscription for newer versions, we'll use current weather and forecast endpoints.
  try {
    const [currentRes, forecastRes] = await Promise.all([
      axios.get(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`),
      axios.get(`https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`)
    ]);

    const data = {
      current: currentRes.data,
      forecast: forecastRes.data,
    };

    localStorage.setItem(CACHE_KEY, JSON.stringify({
      timestamp: Date.now(),
      lat,
      lon,
      data
    }));

    return data;
  } catch (err) {
    console.error("OpenWeather API Error:", err);
    return null;
  }
}
