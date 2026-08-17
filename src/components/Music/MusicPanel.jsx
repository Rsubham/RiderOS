import React, { useEffect, useState } from 'react';
import { Shuffle, SkipBack, Pause, Play, SkipForward, Menu } from 'lucide-react';
import { useSpotify } from '../../hooks/useSpotify';

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
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ marginBottom: '24px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Connect to Spotify to control your music natively.
          </p>
          <button 
            onClick={login}
            style={{ 
              padding: '12px 24px', borderRadius: '24px', backgroundColor: '#1DB954', 
              color: 'white', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: '16px' 
            }}
          >
            Connect Spotify
          </button>
        </div>
      );
    }

    if (!playerState || !playerState.item) {
      return (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No active playback.</p>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', fontSize: '14px', marginTop: '8px' }}>Open Spotify on your phone and play a song.</p>
        </div>
      );
    }

    const { item, is_playing } = playerState;
    const albumArt = item.album?.images?.[0]?.url || 'https://via.placeholder.com/400';
    const duration = item.duration_ms;

    return (
      <>
        {/* Artwork */}
        <div style={{ width: '100%', height: '240px', borderRadius: '16px', overflow: 'hidden', marginBottom: '32px', flexShrink: 0 }}>
          <img src={albumArt} alt="Album Art" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        </div>

        {/* Track Info */}
        <div style={{ textAlign: 'center', marginBottom: '40px', flexShrink: 0 }}>
          <h2 style={{ fontSize: '28px', marginBottom: '8px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.name}
          </h2>
          <p style={{ fontSize: '18px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {item.artists.map(a => a.name).join(', ')}
          </p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '40px', padding: '0 16px', flexShrink: 0 }}>
          <button 
            onClick={() => controls.shuffle(!playerState.shuffle_state)}
            style={{ background: 'none', border: 'none', color: playerState.shuffle_state ? 'var(--accent-color)' : 'var(--text-secondary)', cursor: 'pointer' }}
          >
            <Shuffle size={20} />
          </button>
          <button onClick={controls.previous} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <SkipBack size={28} />
          </button>
          <button 
            onClick={is_playing ? controls.pause : controls.play}
            style={{ 
              width: '64px', height: '64px', borderRadius: '50%', 
              backgroundColor: 'var(--accent-color)', display: 'flex', 
              alignItems: 'center', justifyContent: 'center', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(85, 123, 248, 0.4)'
            }}
          >
            {is_playing ? <Pause size={28} color="white" /> : <Play size={28} color="white" />}
          </button>
          <button onClick={controls.next} style={{ background: 'none', border: 'none', color: 'var(--text-primary)', cursor: 'pointer' }}>
            <SkipForward size={28} />
          </button>
          <button style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
            <Menu size={20} />
          </button>
        </div>

        {/* Progress */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(localProgress)}</span>
          <div style={{ flex: 1, height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '2px', position: 'relative' }}>
            <div style={{ width: `${(localProgress / duration) * 100}%`, height: '100%', backgroundColor: 'white', borderRadius: '2px' }} />
            <div style={{ 
              width: '12px', height: '12px', backgroundColor: 'white', borderRadius: '50%', 
              position: 'absolute', top: '-4px', left: `calc(${(localProgress / duration) * 100}% - 6px)` 
            }} />
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{formatTime(duration)}</span>
        </div>
      </>
    );
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px', overflowY: 'auto' }}>
      {/* Top Nav */}
      <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '24px', cursor: 'pointer', flexShrink: 0 }} onClick={() => setActivePanel('weather')}>
        <span style={{ fontSize: '14px', fontWeight: 'bold' }}>Music &gt;</span>
      </div>

      {renderContent()}
    </div>
  );
}
