import React, { useState, useEffect } from 'react';
import { Cloud, Sun, CloudRain, Wind, Thermometer } from 'lucide-react';

interface WeatherData {
  temp: number;
  description: string;
  city: string;
  humidity: number;
  wind: number;
  icon: string;
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Get user location then fetch weather
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          try {
            const { latitude, longitude } = pos.coords;
            const res = await fetch(
              `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
            );
            const data = await res.json();
            const current = data.current;
            const code = current.weather_code;

            setWeather({
              temp: Math.round(current.temperature_2m),
              description: getWeatherDesc(code),
              city: 'Ma position',
              humidity: current.relative_humidity_2m,
              wind: Math.round(current.wind_speed_10m),
              icon: getWeatherIcon(code),
            });
          } catch {
            setError(true);
          } finally {
            setLoading(false);
          }
        },
        () => {
          // Location denied - use Tunisia default
          fetchByCity();
        }
      );
    } else {
      fetchByCity();
    }
  }, []);

  const fetchByCity = async () => {
    try {
      // Default: Tunis, Tunisia
      const res = await fetch(
        'https://api.open-meteo.com/v1/forecast?latitude=36.8&longitude=10.18&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto'
      );
      const data = await res.json();
      const current = data.current;
      const code = current.weather_code;
      setWeather({
        temp: Math.round(current.temperature_2m),
        description: getWeatherDesc(code),
        city: 'Tunis',
        humidity: current.relative_humidity_2m,
        wind: Math.round(current.wind_speed_10m),
        icon: getWeatherIcon(code),
      });
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherDesc = (code: number) => {
    if (code === 0) return 'Ciel dégagé';
    if (code <= 3) return 'Partiellement nuageux';
    if (code <= 49) return 'Brouillard';
    if (code <= 69) return 'Pluie';
    if (code <= 79) return 'Neige';
    if (code <= 99) return 'Orage';
    return 'Variable';
  };

  const getWeatherIcon = (code: number) => {
    if (code === 0) return 'sun';
    if (code <= 3) return 'cloud';
    if (code <= 69) return 'rain';
    return 'cloud';
  };

  const IconComp = weather?.icon === 'sun' ? Sun : weather?.icon === 'rain' ? CloudRain : Cloud;

  if (loading) return (
    <div style={{ backgroundColor: 'white', borderRadius: 10, padding: '12px 16px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)', minWidth: 180 }}>
      <span style={{ fontSize: 13, color: '#7f8c8d' }}>Météo...</span>
    </div>
  );

  if (error || !weather) return null;

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 10, padding: '12px 16px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      display: 'flex', alignItems: 'center', gap: 12, minWidth: 200,
    }}>
      <IconComp size={32} color={weather.icon === 'sun' ? '#f39c12' : weather.icon === 'rain' ? '#3498db' : '#7f8c8d'} />
      <div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#2c3e50' }}>
          {weather.temp}°C
        </div>
        <div style={{ fontSize: 12, color: '#7f8c8d' }}>{weather.description}</div>
        <div style={{ fontSize: 11, color: '#bdc3c7', display: 'flex', gap: 8, marginTop: 2 }}>
          <span>💧{weather.humidity}%</span>
          <span><Wind size={10} style={{ verticalAlign: 'middle' }} /> {weather.wind}km/h</span>
        </div>
      </div>
    </div>
  );
};

export default WeatherWidget;