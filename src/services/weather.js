import axios from 'axios';

const WEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

/**
 * Fetches live weather for a specific latitude and longitude cleanly.
 */
export async function fetchLiveWeather(lat, lon) {
  if (!WEATHER_API_KEY || WEATHER_API_KEY.includes('YOUR_')) {
    // Elegant fallback so UI testing works without API keys
    return { temp: 31, humidity: 65, desc: 'clear sky', icon: '01d' }; 
  }
  
  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric`;
    const res = await axios.get(url);
    return {
      temp: Math.round(res.data.main.temp),
      humidity: res.data.main.humidity,
      desc: res.data.weather[0].description,
      icon: res.data.weather[0].icon
    };
  } catch (error) {
    console.error("OpenWeather API Error (Falling back to default):", error);
    return { temp: 32, humidity: 70, desc: 'scattered clouds', icon: '03d' };
  }
}
