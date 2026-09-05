import { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

import { getSpotifyClientId } from '../utils/apiKeys';

const CLIENT_ID = getSpotifyClientId();
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
  const pausePollingUntil = useRef(0);

  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem('spotify_token');
    localStorage.removeItem('spotify_refresh_token');
    localStorage.removeItem('code_verifier');
    setPlayerState(null);
  }, []);

  const refreshAccessToken = useCallback(async () => {
    const refreshToken = localStorage.getItem('spotify_refresh_token');
    if (!refreshToken) {
      logout();
      return null;
    }

    const payload = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: CLIENT_ID,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
    };

    try {
      const response = await fetch("https://accounts.spotify.com/api/token", payload);
      const data = await response.json();

      if (data.error === 'invalid_grant') {
        console.error("Invalid grant on refresh, logging out.");
        logout();
        return null;
      }

      if (data.access_token) {
        localStorage.setItem('spotify_token', data.access_token);
        setToken(data.access_token);
        
        if (data.refresh_token) {
          localStorage.setItem('spotify_refresh_token', data.refresh_token);
        }
        
        return data.access_token;
      }
      
      console.error("No access token in refresh response:", data);
      return null;
    } catch (err) {
      console.error("Token refresh failed", err);
      return null;
    }
  }, [logout]);

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
            if (response.refresh_token) {
              localStorage.setItem('spotify_refresh_token', response.refresh_token);
            }
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

  const fetchPlayerState = useCallback(async (currentToken = token) => {
    if (!currentToken) return;
    if (Date.now() < pausePollingUntil.current) return;

    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player', {
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      
      if (response.status === 204) {
        setPlayerState(null);
      } else if (response.data) {
        setPlayerState(response.data);
      }
      setError(null);
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              const retryResponse = await axios.get('https://api.spotify.com/v1/me/player', {
                headers: { Authorization: `Bearer ${newToken}` }
              });
              if (retryResponse.status === 204) {
                setPlayerState(null);
              } else if (retryResponse.data) {
                setPlayerState(retryResponse.data);
              }
              setError(null);
            } catch (retryErr) {
              setError(retryErr.message);
            }
          }
        } else if (err.response.status === 429) {
          const retryAfter = err.response.headers['retry-after'];
          const delaySeconds = retryAfter ? parseInt(retryAfter, 10) : 5;
          console.warn(`Spotify API rate limit hit (429). Pausing requests for ${delaySeconds}s.`);
          pausePollingUntil.current = Date.now() + (delaySeconds * 1000);
        } else {
          setError(err.message);
        }
      } else {
        setError(err.message);
      }
    }
  }, [token, refreshAccessToken]);

  // Poll every 5 seconds
  useEffect(() => {
    if (token) {
      fetchPlayerState();
      intervalRef.current = setInterval(() => fetchPlayerState(), 5000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token, fetchPlayerState]);

  // Controls
  const sendControl = useCallback(async (endpoint, method = 'POST', currentToken = token) => {
    if (!currentToken) return;
    if (Date.now() < pausePollingUntil.current) return;

    try {
      await axios({
        method,
        url: `https://api.spotify.com/v1/me/player/${endpoint}`,
        headers: { Authorization: `Bearer ${currentToken}` }
      });
      const isOptimistic = endpoint.startsWith('play') || endpoint.startsWith('pause') || endpoint.startsWith('shuffle') || endpoint.startsWith('seek');
      if (!isOptimistic) {
        setTimeout(() => fetchPlayerState(currentToken), 500);
      }
    } catch (err) {
      if (err.response) {
        if (err.response.status === 401) {
          const newToken = await refreshAccessToken();
          if (newToken) {
            try {
              await axios({
                method,
                url: `https://api.spotify.com/v1/me/player/${endpoint}`,
                headers: { Authorization: `Bearer ${newToken}` }
              });
              const isOptimistic = endpoint.startsWith('play') || endpoint.startsWith('pause') || endpoint.startsWith('shuffle') || endpoint.startsWith('seek');
              if (!isOptimistic) {
                setTimeout(() => fetchPlayerState(newToken), 500);
              }
            } catch (retryErr) {
              console.error("Spotify Control Retry Error:", retryErr);
            }
          }
        } else if (err.response.status === 429) {
          const retryAfter = err.response.headers['retry-after'];
          const delaySeconds = retryAfter ? parseInt(retryAfter, 10) : 5;
          console.warn(`Spotify API rate limit hit (429) on control. Pausing requests for ${delaySeconds}s.`);
          pausePollingUntil.current = Date.now() + (delaySeconds * 1000);
        } else {
          console.error("Spotify Control Error:", err);
        }
      } else {
        console.error("Spotify Control Error:", err);
      }
    }
  }, [token, refreshAccessToken, fetchPlayerState]);

  return {
    token,
    login,
    playerState,
    error,
    controls: {
      play: () => {
        setPlayerState(prev => prev ? { ...prev, is_playing: true } : prev);
        sendControl('play', 'PUT');
      },
      pause: () => {
        setPlayerState(prev => prev ? { ...prev, is_playing: false } : prev);
        sendControl('pause', 'PUT');
      },
      next: () => sendControl('next', 'POST'),
      previous: () => sendControl('previous', 'POST'),
      shuffle: (state) => {
        setPlayerState(prev => prev ? { ...prev, shuffle_state: state } : prev);
        sendControl(`shuffle?state=${state}`, 'PUT');
      },
      seek: (position_ms) => {
        setPlayerState(prev => prev ? { ...prev, progress_ms: Math.round(position_ms) } : prev);
        sendControl(`seek?position_ms=${Math.round(position_ms)}`, 'PUT');
      },
    }
  };
}
