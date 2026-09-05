import React, { useEffect, useState } from 'react';
import { Shuffle, SkipBack, Pause, Play, SkipForward, Menu } from 'lucide-react';
import { useSpotify } from '../../hooks/useSpotify';
import './MusicPanel.css';

export default function MusicPanel({ setActivePanel }) {
  const { token, login, playerState, controls } = useSpotify();
  
  // Local state for smooth progress bar between API polls
  const [localProgress, setLocalProgress] = useState(0);

  useEffect(() => {
    if (playerState && playerState.is_playing) {
      setLocalProgress(playerState.progress_ms);
      const interval = setInterval(() => {
        setLocalProgress(p => Math.min(p + 1000, playerState.item?.duration_ms || p));
      }, 1000);
      return () => clearInterval(interval);
    } else if (playerState) {
      setLocalProgress(playerState.progress_ms);
    }
  }, [playerState]);

  const formatTime = (ms) => {
    if (!ms) return '0:00';
    const sec = Math.floor(ms / 1000);
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const renderContent = () => {
    if (!token) {
      return (
        <div className="music-panel-empty-state">
          <p className="music-panel-connect-text">
            Connect to Spotify to control your music natively.
          </p>
          <button 
            onClick={login}
            className="music-panel-connect-button"
          >
            Connect Spotify
          </button>
        </div>
      );
    }

    if (!playerState || !playerState.item) {
      return (
        <div className="music-panel-empty-state">
          <p className="music-panel-empty-title">No active playback.</p>
          <p className="music-panel-empty-subtitle">Open Spotify on your phone and play a song.</p>
        </div>
      );
    }

    const { item, is_playing } = playerState;
    const albumArt = item.album?.images?.[0]?.url || 'https://via.placeholder.com/400';
    const duration = item.duration_ms;

    return (
      <>
        {/* Artwork */}
        <div className="music-panel-artwork-container">
          <img src={albumArt} alt="Album Art" className="music-panel-artwork" />
        </div>

        {/* Track Info */}
        <div className="music-panel-track-info">
          <h2 className="music-panel-track-title">
            {item.name}
          </h2>
          <p className="music-panel-track-artist">
            {item.artists.map(a => a.name).join(', ')}
          </p>
        </div>

        {/* Controls */}
        <div className="music-panel-controls">
          <button 
            onClick={() => controls.shuffle(!playerState.shuffle_state)}
            className={`music-panel-icon-button ${playerState.shuffle_state ? 'active' : ''}`}
          >
            <Shuffle size={20} />
          </button>
          <button onClick={controls.previous} className="music-panel-icon-button-primary">
            <SkipBack size={28} />
          </button>
          <button 
            onClick={is_playing ? controls.pause : controls.play}
            className="music-panel-play-button"
          >
            {is_playing ? <Pause size={32} /> : <Play size={32} />}
          </button>
          <button onClick={controls.next} className="music-panel-icon-button-primary">
            <SkipForward size={28} />
          </button>
          <button className="music-panel-icon-button">
            <Menu size={20} />
          </button>
        </div>

        {/* Progress */}
        <div className="music-panel-progress-container">
          <span className="music-panel-progress-time">{formatTime(localProgress)}</span>
          <div className="music-panel-progress-bar-bg">
            <div 
              className="music-panel-progress-bar-fill" 
              style={{ width: `${(localProgress / duration) * 100}%` }} 
            />
            <div 
              className="music-panel-progress-thumb"
              style={{ left: `calc(${(localProgress / duration) * 100}% - 6px)` }} 
            />
          </div>
          <span className="music-panel-progress-time">{formatTime(duration)}</span>
        </div>
      </>
    );
  };

  return (
    <div className="music-panel-container">
      {/* Top Nav */}
      <div className="music-panel-top-nav" onClick={() => setActivePanel('weather')}>
        <span className="music-panel-top-nav-text">Music &gt;</span>
      </div>

      {renderContent()}
    </div>
  );
}
