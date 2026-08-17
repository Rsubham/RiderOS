import React, { useState, useEffect } from 'react';
import { Cloud, Droplets, Wind, Eye, Info, Sunrise, Sunset } from 'lucide-react';
import { fetchWeather } from '../../utils/weatherApi';

export default function WeatherPanel({ setActivePanel, location }) {
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
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading Weather...
      </div>
    );
  }

  const { current, forecast } = weatherData;

  // Formatting values
  const temp = Math.round(current.main.temp);
  const feelsLike = Math.round(current.main.feels_like);
  const condition = current.weather[0].main;
  
  // Visibility logic (10km ceiling)
  let visibilityDisplay = 'N/A';
  if (current.visibility !== undefined) {
    if (current.visibility >= 10000) {
      visibilityDisplay = '>= 10.0 km';
    } else {
      visibilityDisplay = `${(current.visibility / 1000).toFixed(1)} km`;
    }
  }

  // Riding Conditions logic
  let ridingCondition = "Good riding conditions";
  let conditionColor = "var(--success-color)";
  if (current.weather[0].id < 700 || current.wind.speed > 10) {
    ridingCondition = "Poor riding conditions";
    conditionColor = "var(--danger-color)";
  }

  // Derive Today's temp range from forecast
  const todayForecasts = forecast.list.slice(0, 5); // Next few hours

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
      
      {/* Top Nav */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', cursor: 'pointer' }} onClick={() => setActivePanel('music')}>
        <span style={{ fontSize: '14px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>&lt; Music</span>
      </div>

      {/* Main Current Weather */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '32px' }}>
        <Cloud size={64} style={{ marginBottom: '16px' }} />
        <h1 style={{ fontSize: '64px', fontWeight: 'bold', lineHeight: '1', marginBottom: '8px' }}>{temp}°C</h1>
        <h2 style={{ fontSize: '24px', fontWeight: 'normal', marginBottom: '4px' }}>{condition}</h2>
        <span style={{ color: 'var(--text-secondary)' }}>Feels like {feelsLike}°C</span>
      </div>

      {/* Riding Conditions */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px', fontWeight: 'bold', letterSpacing: '1px' }}>RIDING CONDITIONS</div>
        <div style={{ color: conditionColor, fontWeight: 'bold' }}>{ridingCondition}</div>
      </div>

      {/* Detailed Grid */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Droplets size={24} color="var(--accent-color)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Rain</div>
            <div style={{ fontWeight: 'bold' }}>{current.rain ? current.rain['1h'] || 0 : 0} mm</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wind size={24} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Wind</div>
            <div style={{ fontWeight: 'bold' }}>{Math.round(current.wind.speed * 3.6)} km/h</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Wind size={24} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Gusts</div>
            <div style={{ fontWeight: 'bold' }}>{current.wind.gust ? Math.round(current.wind.gust * 3.6) : 0} km/h</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Eye size={24} color="var(--text-secondary)" />
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Visibility</div>
            <div style={{ fontWeight: 'bold' }}>{visibilityDisplay}</div>
          </div>
        </div>
      </div>

      {/* Today's Forecast */}
      <div className="glass-panel" style={{ padding: '16px', marginBottom: '16px' }}>
        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px', fontWeight: 'bold', letterSpacing: '1px' }}>TODAY</div>
        {todayForecasts.map((item, idx) => {
          const time = new Date(item.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
          return (
            <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', alignItems: 'center' }}>
              <span style={{ color: 'var(--text-secondary)' }}>{time}</span>
              <Cloud size={16} />
              <span style={{ fontWeight: 'bold', width: '40px', textAlign: 'right' }}>{Math.round(item.main.temp)}°C</span>
              <span style={{ color: 'var(--text-secondary)', width: '30px', textAlign: 'right' }}>{item.pop > 0 ? Math.round(item.pop * 100) + '%' : '0%'}</span>
            </div>
          )
        })}
      </div>

      {/* Sunrise / Sunset */}
      <div className="glass-panel" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sunrise size={20} color="#f1c40f" />
          <span style={{ fontWeight: 'bold' }}>{new Date(current.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sunset size={20} color="#e67e22" />
          <span style={{ fontWeight: 'bold' }}>{new Date(current.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

    </div>
  );
}
