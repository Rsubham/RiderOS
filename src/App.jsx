import React, { useState } from 'react';
import { useRiderLocation } from './hooks/useRiderLocation';
import BottomBar from './components/BottomBar';
import MusicPanel from './components/Music/MusicPanel';
import WeatherPanel from './components/Weather/WeatherPanel';
import SettingsPanel from './components/Settings/SettingsPanel';
import SplashScreen from './components/SplashScreen/SplashScreen';
import './index.css';

function App() {
  const location = useRiderLocation();
  const [activePanel, setActivePanel] = useState(null); // 'music' | 'weather' | null
  const [cleanDashboard, setCleanDashboard] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [hideMusic, setHideMusic] = useState(false);

  const toggleCleanDashboard = () => setCleanDashboard(!cleanDashboard);
  const toggleHideMusic = () => {
    setHideMusic(!hideMusic);
    if (!hideMusic && activePanel === 'music') {
      setActivePanel(null);
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
      <div className="app-container">
        <div className="main-content">
        
        {/* Map Layer (Always rendering in background) */}
        <div className="map-container">
          {/* New map will go here */}
        </div>

        {/* Left Panel (Slides in over Map) */}
        <div className={`left-panel ${activePanel && !cleanDashboard && !(activePanel === 'music' && hideMusic) ? '' : 'hidden'}`}>
          {activePanel === 'music' && !hideMusic && (
            <MusicPanel setActivePanel={setActivePanel} />
          )}
          {activePanel === 'weather' && (
            <WeatherPanel setActivePanel={setActivePanel} location={location} />
          )}
          {activePanel === 'settings' && (
            <SettingsPanel setActivePanel={setActivePanel} />
          )}
        </div>
        
      </div>

      {/* Bottom Bar Layer */}
      <BottomBar 
        cleanDashboard={cleanDashboard} 
        toggleCleanDashboard={toggleCleanDashboard}
        activePanel={activePanel}
        setActivePanel={setActivePanel}
        location={location}
        hideMusic={hideMusic}
        toggleHideMusic={toggleHideMusic}
      />
    </div>
    </>
  );
}

export default App;
