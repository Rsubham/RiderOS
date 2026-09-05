import React, { useState, useEffect } from 'react';
import { Key, Save, ChevronLeft, Sliders, Clock, Thermometer, X, User } from 'lucide-react';
import { getSpotifyClientId, getWeatherApiKey } from '../../utils/apiKeys';
import { getTimeFormat, getUnitSystem, getRiderName } from '../../utils/preferences';
import CustomDropdown from './CustomDropdown';
import './SettingsPanel.css';

export default function SettingsPanel({ setActivePanel }) {
  // Navigation State
  const [currentView, setCurrentView] = useState('main'); // 'main' | 'preferences' | 'api_keys'

  // API Key State
  const [spotifyId, setSpotifyId] = useState('');
  const [weatherKey, setWeatherKey] = useState('');

  // Preference State
  const [timeFormat, setTimeFormat] = useState('12h');
  const [unitSystem, setUnitSystem] = useState('metric');
  const [riderName, setRiderName] = useState('Rider');

  useEffect(() => {
    // Load initial state from local storage
    setSpotifyId(getSpotifyClientId());
    setWeatherKey(getWeatherApiKey());
    setTimeFormat(getTimeFormat());
    setUnitSystem(getUnitSystem());
    setRiderName(getRiderName());
  }, []);

  const handleSaveApiKeys = () => {
    localStorage.setItem('SPOTIFY_CLIENT_ID', spotifyId);
    localStorage.setItem('OPENWEATHER_API_KEY', weatherKey);
    window.location.reload();
  };

  const handleSavePreferences = () => {
    localStorage.setItem('TIME_FORMAT', timeFormat);
    localStorage.setItem('UNIT_SYSTEM', unitSystem);
    localStorage.setItem('RIDER_NAME', riderName);
    window.dispatchEvent(new Event('preferencesChanged'));
    // Return to main menu to show it saved successfully
    setCurrentView('main');
  };

  // --- Views ---

  const renderMainView = () => (
    <div className="settings-main-view">
      <div className="settings-header-main">
        <h2 className="settings-title-main">Settings</h2>
        <button onClick={() => setActivePanel(null)} className="settings-close-button">
          <X size={20} />
        </button>
      </div>
      
      <div 
        className="settings-menu-item"
        onClick={() => setCurrentView('preferences')}
      >
        <Sliders size={20} color="var(--accent-color)" />
        <div className="settings-menu-item-content">
          <div className="settings-menu-item-title">Preferences</div>
          <div className="settings-menu-item-subtitle">Time format, unit system</div>
        </div>
      </div>

      <div 
        className="settings-menu-item"
        onClick={() => setCurrentView('api_keys')}
      >
        <Key size={20} color="var(--accent-color)" />
        <div className="settings-menu-item-content">
          <div className="settings-menu-item-title">API Keys & Credentials</div>
          <div className="settings-menu-item-subtitle">Manage Spotify and Weather integrations</div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesView = () => (
    <div className="settings-sub-view">
      <div className="settings-header-sub">
        <div className="settings-header-sub-left">
          <button onClick={() => setCurrentView('main')} className="settings-back-button">
            <ChevronLeft size={20} />
          </button>
          <h2 className="settings-title-sub">Preferences</h2>
        </div>
        <button onClick={() => setActivePanel(null)} className="settings-close-button">
          <X size={20} />
        </button>
      </div>

      <div className="settings-card">
        
        <div className="settings-field-large-margin">
          <div className="settings-field-header">
            <Clock size={18} color="var(--text-secondary)" />
            <label className="settings-field-label-white">Time Format</label>
          </div>
          <CustomDropdown 
            value={timeFormat} 
            onChange={(value) => setTimeFormat(value)} 
            options={[
              { value: '12h', label: '12-Hour (1:00 PM)' },
              { value: '24h', label: '24-Hour (13:00)' }
            ]}
          />
        </div>

        <div className="settings-field-large-margin">
          <div className="settings-field-header">
            <User size={18} color="var(--text-secondary)" />
            <label className="settings-field-label-white">Rider Name</label>
          </div>
          <input 
            type="text" 
            value={riderName} 
            onChange={(e) => setRiderName(e.target.value)} 
            className="settings-input"
            placeholder="Enter your name"
          />
        </div>

        <div className="settings-field-large-margin">
          <div className="settings-field-header">
            <Thermometer size={18} color="var(--text-secondary)" />
            <label className="settings-field-label-white">Unit System</label>
          </div>
          <CustomDropdown 
            value={unitSystem} 
            onChange={(value) => setUnitSystem(value)} 
            options={[
              { value: 'metric', label: 'Metric (km, °C)' },
              { value: 'imperial', label: 'Imperial (mi, °F)' }
            ]}
          />
        </div>

        <button onClick={handleSavePreferences} className="settings-button">
          <Save size={20} /> Save
        </button>
      </div>
    </div>
  );

  const renderApiKeysView = () => (
    <div className="settings-sub-view">
      <div className="settings-header-sub">
        <div className="settings-header-sub-left">
          <button onClick={() => setCurrentView('main')} className="settings-back-button">
            <ChevronLeft size={20} />
          </button>
          <h2 className="settings-title-sub">API Keys</h2>
        </div>
        <button onClick={() => setActivePanel(null)} className="settings-close-button">
          <X size={20} />
        </button>
      </div>

      <div className="settings-card">
        
        <div className="settings-field-small-margin">
          <label className="settings-field-label-secondary">Spotify Client ID</label>
          <input 
            type="text" 
            value={spotifyId} 
            onChange={(e) => setSpotifyId(e.target.value)} 
            className="settings-input"
            placeholder="Enter your Spotify Client ID"
          />
        </div>

        <div className="settings-field-small-margin">
          <label className="settings-field-label-secondary">OpenWeather API Key</label>
          <input 
            type="text" 
            value={weatherKey} 
            onChange={(e) => setWeatherKey(e.target.value)} 
            className="settings-input"
            placeholder="Enter your OpenWeather API Key"
          />
        </div>

        <button onClick={handleSaveApiKeys} className="settings-button">
          <Save size={20} /> Save & Reload
        </button>
      </div>
    </div>
  );

  return (
    <div className="settings-panel-container">
      {currentView === 'main' && renderMainView()}
      {currentView === 'preferences' && renderPreferencesView()}
      {currentView === 'api_keys' && renderApiKeysView()}
    </div>
  );
}
