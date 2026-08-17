import React, { useState } from 'react';
import { LayoutGrid, Phone, Bell, Shuffle, SkipBack, Pause, Play, SkipForward, Menu, Cloud } from 'lucide-react';
import '../index.css';
import { useSpotify } from '../hooks/useSpotify';

export default function BottomBar({ cleanDashboard, toggleCleanDashboard, activePanel, setActivePanel }) {
  const { token, playerState, controls } = useSpotify();

  if (cleanDashboard) return null;

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
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <button 
          onClick={toggleCleanDashboard} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}
        >
          <LayoutGrid size={24} />
        </button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
          <Phone size={24} />
        </button>
        <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
          <Bell size={24} />
        </button>
      </div>

      {/* Center Music (Mini Player) */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '16px' }}
      >
        <div style={{ width: '32px', height: '32px', borderRadius: '4px', overflow: 'hidden', backgroundColor: '#333', cursor: 'pointer' }} onClick={() => setActivePanel(activePanel === 'music' ? null : 'music')}>
          <img src={albumArt} alt="Album Art" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', cursor: 'pointer', maxWidth: '150px' }} onClick={() => setActivePanel(activePanel === 'music' ? null : 'music')}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trackName}</span>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{artistName}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '24px' }}>
          <button onClick={() => token && controls.shuffle(!playerState?.shuffle_state)} style={{ background: 'none', border: 'none', color: playerState?.shuffle_state ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer' }}>
            <Shuffle size={18} />
          </button>
          <button onClick={() => token && controls.previous()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <SkipBack size={20} />
          </button>
          
          <button 
            onClick={() => token ? (isPlaying ? controls.pause() : controls.play()) : null}
            style={{ width: '40px', height: '40px', borderRadius: '50%', backgroundColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer' }}
          >
            {isPlaying ? <Pause size={20} color="white" /> : <Play size={20} color="white" />}
          </button>

          <button onClick={() => token && controls.next()} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <SkipForward size={20} />
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)' }}>
            <Menu size={20} />
          </button>
        </div>
      </div>

      {/* Right Clock & Weather */}
      <div 
        style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}
        onClick={() => setActivePanel(activePanel === 'weather' ? null : 'weather')}
      >
        <span style={{ fontSize: '16px', fontWeight: 'bold' }}>
          {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Cloud size={20} color="white" />
          <span style={{ fontSize: '16px', fontWeight: 'bold' }}>23° C</span>
        </div>
      </div>
    </div>
  );
}
