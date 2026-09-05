import React, { useEffect, useState } from 'react';
import './SplashScreen.css';
import { getRiderName } from '../../utils/preferences';
import icon from '../../assets/Icon/icon.png';

export default function SplashScreen({ onComplete }) {
  const [greeting, setGreeting] = useState('');
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Determine greeting based on time of day
    const hour = new Date().getHours();
    let timeGreeting = 'Evening';
    if (hour >= 5 && hour < 12) timeGreeting = 'Morning';
    else if (hour >= 12 && hour < 17) timeGreeting = 'Afternoon';

    const name = getRiderName();
    setGreeting(`Hi, ${name}. Good ${timeGreeting}.`);

    // Start fade out after 2.5s, complete at 3s
    const fadeOutTimer = setTimeout(() => setIsFadingOut(true), 2500);
    const completeTimer = setTimeout(() => onComplete(), 3000);

    return () => {
      clearTimeout(fadeOutTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div className={`splash-screen-container ${isFadingOut ? 'fade-out' : ''}`}>
      <div className="splash-screen-content">
        <img src={icon} alt="RiderOS Logo" className="splash-screen-logo" />
        <h1 className="splash-screen-greeting">
          {greeting.split('').map((char, index) => (
            <span 
              key={index} 
              className="typewriter-char" 
              style={{ animationDelay: `${0.5 + (index * 0.04)}s` }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}
