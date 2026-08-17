import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const REDIRECT_URI = window.location.origin + '/'; 
const SCOPES = [
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
].join(' ');

// PKCE Helper Functions
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

const sha256 = async (plain) => {
  const encoder = new TextEncoder()
  const data = encoder.encode(plain)
  return window.crypto.subtle.digest('SHA-256', data)
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

export function useSpotify() {
  const [token, setToken] = useState(localStorage.getItem('spotify_token'));
  const [playerState, setPlayerState] = useState(null);
  const [error, setError] = useState(null);
  const intervalRef = useRef(null);

  // Handle Auth Code Redirect
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    
    if (code) {
      const exchangeCodeForToken = async () => {
        const codeVerifier = localStorage.getItem('code_verifier');
        if (!codeVerifier) return;
        
        const payload = {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: REDIRECT_URI,
            code_verifier: codeVerifier,
          }),
        };
        
        try {
          const body = await fetch("https://accounts.spotify.com/api/token", payload);
          const response = await body.json();
          
          if (response.access_token) {
            localStorage.setItem('spotify_token', response.access_token);
            setToken(response.access_token);
            // Clean the URL to remove the code
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            console.error("No access token in response:", response);
          }
        } catch (err) {
          console.error("Token exchange failed", err);
        }
      };
      
      exchangeCodeForToken();
    }
  }, []);

  const login = async () => {
    // Generate PKCE Challenge
    const codeVerifier = generateRandomString(64);
    window.localStorage.setItem('code_verifier', codeVerifier);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    
    const authUrl = new URL("https://accounts.spotify.com/authorize");
    const params = {
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: SCOPES,
      code_challenge_method: 'S256',
      code_challenge: codeChallenge,
      redirect_uri: REDIRECT_URI,
    };
    
    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
  };

  const logout = () => {
    setToken(null);
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('code_verifier');
    setPlayerState(null);
  };

  // Fetch player state
  const fetchPlayerState = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.status === 204) {
        setPlayerState(null);
      } else if (response.data) {
        setPlayerState(response.data);
      }
      setError(null);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        logout(); // Token expired
      } else {
        setError(err.message);
      }
    }
  }, [token]);

  // Poll every 3 seconds
  useEffect(() => {
    if (token) {
      fetchPlayerState();
      intervalRef.current = setInterval(fetchPlayerState, 3000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, fetchPlayerState]);

  // Controls
  const sendControl = async (endpoint, method = 'POST') => {
    if (!token) return;
    try {
      await axios({
        method,
        url: `https://api.spotify.com/v1/me/player/${endpoint}`,
        headers: { Authorization: `Bearer ${token}` }
      });
      setTimeout(fetchPlayerState, 500); // Optimistic fetch
    } catch (err) {
      console.error("Spotify Control Error:", err);
    }
  };

  return {
    token,
    login,
    logout,
    playerState,
    error,
    controls: {
      play: () => sendControl('play', 'PUT'),
      pause: () => sendControl('pause', 'PUT'),
      next: () => sendControl('next', 'POST'),
      previous: () => sendControl('previous', 'POST'),
      shuffle: (state) => sendControl(`shuffle?state=${state}`, 'PUT'),
    }
  };
}
