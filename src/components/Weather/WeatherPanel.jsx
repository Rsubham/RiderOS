import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Info, Sunrise, Sunset } from 'lucide-react';
import { fetchWeather } from '../../utils/weatherApi';
import { formatTime, formatTemp, formatSpeed, formatDistance, formatPrecipitation, usePreferences } from '../../utils/preferences';
import './WeatherPanel.css';

export default function WeatherPanel({ setActivePanel, location }) {
  usePreferences(); // Trigger re-render when preferences change
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    if (location.latitude && location.longitude) {
      setLoading(true);
      fetchWeather(location.latitude, location.longitude).then((data) => {
        if (isMounted) {
          setWeatherData(data);
          setLoading(false);
        }
      });
    }
    return () => { isMounted = false; };
  }, [location.latitude, location.longitude]); // Only trigger if lat/lon change

  if (loading || !weatherData) {
    return (
      <div className="weather-panel-loading">
        Loading Weather...
      </div>
    );
  }

  const { current, forecast } = weatherData;

  // Formatting values
  const tempStr = formatTemp(current.main.temp);
  const feelsLikeStr = formatTemp(current.main.feels_like);
  const condition = current.weather[0].main;
  
  // Visibility logic (10km ceiling)
  let visibilityDisplay = 'N/A';
  if (current.visibility !== undefined) {
    visibilityDisplay = formatDistance(current.visibility);
  }

  // Riding Conditions logic
  let ridingCondition = "Good riding conditions";
  let conditionClass = "good";
  if (current.weather[0].id < 700 || current.wind.speed > 10) {
    ridingCondition = "Poor riding conditions";
    conditionClass = "poor";
  }

  // Derive Today's temp range from forecast
  const todayForecasts = forecast.list.slice(0, 5); // Next few hours

  return (
    <div className="weather-panel-container">
      
      {/* Top Nav */}
      <div className="weather-panel-top-nav" onClick={() => setActivePanel('music')}>
        <span className="weather-panel-top-nav-text">&lt; Music</span>
      </div>

      {/* Main Current Weather */}
      <div className="weather-panel-main">
        <Cloud size={64} className="weather-panel-main-icon" />
        <h1 className="weather-panel-main-temp">{tempStr}</h1>
        <h2 className="weather-panel-main-condition">{condition}</h2>
        <span className="weather-panel-main-feels-like">Feels like {feelsLikeStr}</span>
      </div>

      {/* Riding Conditions */}
      <div className="glass-panel weather-panel-card">
        <div className="weather-panel-section-title">RIDING CONDITIONS</div>
        <div className={`weather-panel-riding-condition ${conditionClass}`}>{ridingCondition}</div>
      </div>

      {/* Detailed Grid */}
      <div className="glass-panel weather-panel-grid">
        <div className="weather-panel-grid-item">
          <Droplets size={24} color="var(--accent-color)" />
          <div>
            <div className="weather-panel-grid-label">Rain</div>
            <div className="weather-panel-grid-value">{current.rain ? formatPrecipitation(current.rain['1h'] || 0) : formatPrecipitation(0)}</div>
          </div>
        </div>
        <div className="weather-panel-grid-item">
          <Wind size={24} color="var(--text-secondary)" />
          <div>
            <div className="weather-panel-grid-label">Wind</div>
            <div className="weather-panel-grid-value">{formatSpeed(current.wind.speed)}</div>
          </div>
        </div>
        <div className="weather-panel-grid-item">
          <Wind size={24} color="var(--text-secondary)" />
          <div>
            <div className="weather-panel-grid-label">Gusts</div>
            <div className="weather-panel-grid-value">{current.wind.gust ? formatSpeed(current.wind.gust) : formatSpeed(0)}</div>
          </div>
        </div>
        <div className="weather-panel-grid-item">
          <Eye size={24} color="var(--text-secondary)" />
          <div>
            <div className="weather-panel-grid-label">Visibility</div>
            <div className="weather-panel-grid-value">{visibilityDisplay}</div>
          </div>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="glass-panel weather-panel-card">
        <div className="weather-panel-section-title-large">TODAY</div>
        {todayForecasts.map((item, idx) => {
          const time = formatTime(new Date(item.dt * 1000));
          return (
            <div key={idx} className="weather-panel-forecast-row">
              <span className="weather-panel-forecast-time">{time}</span>
              <Cloud size={16} />
              <span className="weather-panel-forecast-temp">{formatTemp(item.main.temp)}</span>
              <span className="weather-panel-forecast-pop">{item.pop > 0 ? Math.round(item.pop * 100) + '%' : '0%'}</span>
            </div>
          )
        })}
      </div>

      {/* Sunrise / Sunset */}
      <div className="glass-panel weather-panel-card-row">
        <div className="weather-panel-sun-item">
          <Sunrise size={20} color="#f1c40f" />
          <span className="weather-panel-sun-time">{formatTime(new Date(current.sys.sunrise * 1000))}</span>
        </div>
        <div className="weather-panel-sun-item">
          <Sunset size={20} color="#e67e22" />
          <span className="weather-panel-sun-time">{formatTime(new Date(current.sys.sunset * 1000))}</span>
        </div>
      </div>

    </div>
  );
}
