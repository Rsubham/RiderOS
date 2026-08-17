import React, { useState } from 'react';
import { useRiderLocation } from './hooks/useRiderLocation';
import BottomBar from './components/BottomBar';
import SpeedIndicator from './components/SpeedIndicator';
import MusicPanel from './components/Music/MusicPanel';
import WeatherPanel from './components/Weather/WeatherPanel';
import MapplsMap from './components/Map/MapplsMap';
import './index.css';

function App() {
  const location = useRiderLocation();
  const [activePanel, setActivePanel] = useState(null); // 'music' | 'weather' | null
  const [cleanDashboard, setCleanDashboard] = useState(false);

  const toggleCleanDashboard = () => setCleanDashboard(!cleanDashboard);

  return (
    <div className="app-container">
      <div className="main-content">
        
        {/* Map Layer (Always rendering in background) */}
        <div className="map-container">
          <MapplsMap location={location} cleanDashboard={cleanDashboard} />
        </div>

        {/* Speed Indicator (Top Right) */}
        <SpeedIndicator cleanDashboard={cleanDashboard} />

        {/* Left Panel (Slides in over Map) */}
        <div className={`left-panel ${activePanel && !cleanDashboard ? '' : 'hidden'}`}>
          {activePanel === 'music' && (
            <MusicPanel setActivePanel={setActivePanel} />
          )}
          {activePanel === 'weather' && (
            <WeatherPanel setActivePanel={setActivePanel} location={location} />
          )}
        </div>
        
      </div>

      {/* Bottom Bar Layer */}
      <BottomBar 
        cleanDashboard={cleanDashboard} 
        toggleCleanDashboard={toggleCleanDashboard}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
      />
    </div>
  );
}

export default App;
