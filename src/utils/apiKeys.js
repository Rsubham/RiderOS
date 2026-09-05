
export function getSpotifyClientId() {
  return localStorage.getItem('SPOTIFY_CLIENT_ID') || '';
}

export function getWeatherApiKey() {
  return localStorage.getItem('OPENWEATHER_API_KEY') || '';
}
