import React from 'react';

export default function SpeedIndicator({ cleanDashboard }) {
  if (cleanDashboard) return null;

  return (
    <div 
      style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        backgroundColor: 'var(--panel-bg)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 100, // Above map
        border: '1px solid var(--glass-border)'
      }}
    >
      <span style={{ fontSize: '32px', fontWeight: 'bold', lineHeight: '1' }}>67</span>
      <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>km/h</span>
    </div>
  );
}
