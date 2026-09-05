import React, { useState } from 'react';
import { Settings, Shuffle, SkipBack, Pause, Play, SkipForward, Menu, Cloud, Maximize } from 'lucide-react';
import '../index.css';
import './BottomBar.css';
import { useSpotify } from '../hooks/useSpotify';
import { formatTime, formatTemp, usePreferences } from '../utils/preferences';

export default function BottomBar({ cleanDashboard, toggleCleanDashboard, activePanel, setActivePanel }) {
  const { token, playerState, controls } = useSpotify();
  usePreferences(); // Trigger re-render when preferences change

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Fallback defaults
  let trackName = "Spotify Not Connected";
  let artistName = "Click to Connect";
  let albumArt = "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?auto=format&fit=crop&w=64&q=80";
  let isPlaying = false;

  if (token && playerState && playerState.item) {
    trackName = playerState.item.name;
    artistName = playerState.item.artists.map(a => a.name).join(', ');
    albumArt = playerState.item.album.images[0]?.url || albumArt;
    isPlaying = playerState.is_playing;
  } else if (token) {
    trackName = "No active playback";
    artistName = "Open Spotify to play";
  }

  return (
    <div className={`bottom-bar ${cleanDashboard ? 'hidden' : ''}`}>
      {/* Left Apps */}
      <div className="bottom-bar-left">
        <button 
          onClick={() => setActivePanel(activePanel === 'settings' ? null : 'settings')}
          className="bottom-bar-icon-button"
        >
          <Settings size={24} />
        </button>
        <button 
          onClick={toggleFullScreen}
          className="bottom-bar-icon-button"
          title="Toggle Fullscreen"
        >
          <Maximize size={24} />
        </button>
      </div>

      {/* Center Music (Mini Player) */}
      <div className="bottom-bar-center">
        <div className="bottom-bar-album-art-container" onClick={() => setActivePanel(activePanel === 'music' ? null : 'music')}>
          <img src={albumArt} alt="Album Art" className="bottom-bar-album-art" />
        </div>
        <div className="bottom-bar-track-info" onClick={() => setActivePanel(activePanel === 'music' ? null : 'music')}>
          <span className="bottom-bar-track-name">{trackName}</span>
          <span className="bottom-bar-artist-name">{artistName}</span>
        </div>

        <div className="bottom-bar-playback-controls">
          <button 
            onClick={() => token && controls.shuffle(!playerState?.shuffle_state)} 
            className={`bottom-bar-icon-button ${playerState?.shuffle_state ? 'active' : ''}`}
          >
            <Shuffle size={18} />
          </button>
          <button onClick={() => token && controls.previous()} className="bottom-bar-icon-button">
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={() => token ? (isPlaying ? controls.pause() : controls.play()) : null}
            className="bottom-bar-play-button"
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>

          <button onClick={() => token && controls.next()} className="bottom-bar-icon-button">
            <SkipForward size={20} />
          </button>
          <button className="bottom-bar-menu-button">
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Right Clock & Weather */}
      <div 
        className="bottom-bar-right"
        onClick={() => setActivePanel(activePanel === 'weather' ? null : 'weather')}
      >
        <span className="bottom-bar-time">
          {formatTime(new Date())}
        </span>
        <div className="bottom-bar-weather">
          <Cloud size={20} color="white" />
          <span className="bottom-bar-temp">{formatTemp(23)}</span>
        </div>
      </div>
    </div>
  );
}
