import React, { useState, useEffect } from 'react';
import { Sun, Cloud, CloudRain, CloudLightning, Snowflake, CloudFog, Wind, Droplets, Eye, Thermometer, Sprout, MapPin, Gauge, ArrowUp, ArrowDown } from 'lucide-react';

interface WeatherData {
  temp: number;
  feelsLike: number;
  tempMin: number;
  tempMax: number;
  description: string;
  humidity: number;
  windSpeed: number;
  windDir: string;
  pressure: number;
  uv: number;
  precipitation: number;
  visibility: number;
  icon: string;
  advice: string;
  city: string;
}

const iconColorMap: Record<string, string> = {
  sun: '#f39c12',
  rain: '#3498db',
  storm: '#8e44ad',
  snow: '#74b9ff',
  fog: '#95a5a6',
  cloud: '#636e72',
};

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (pos) => {
          const { latitude, longitude } = pos.coords;
          await fetchWeather(latitude, longitude);
          await fetchCity(latitude, longitude);
        },
        () => {
          fetchWeather(36.8, 10.18);
          setWeather(w => w ? { ...w, city: 'Tunis' } : null);
        }
      );
    } else {
      fetchWeather(36.8, 10.18);
    }
  }, []);

  const fetchCity = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&accept-language=fr`,
        { headers: { 'User-Agent': 'AgriFerme/1.0' } }
      );
      const data = await res.json();
      const addr = data.address || {};
      const city = addr.city || addr.town || addr.village || addr.municipality || 'Ma position';
      setWeather(w => w ? { ...w, city } : null);
    } catch { /* ignore */ }
  };

  const fetchWeather = async (lat: number, lon: number) => {
    try {
      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,` +
        `wind_speed_10m,wind_direction_10m,surface_pressure,uv_index,` +
        `precipitation,visibility,weather_code` +
        `&daily=temperature_2m_max,temperature_2m_min&timezone=auto`
      );
      const data = await res.json();
      const c = data.current;
      const d = data.daily;
      setWeather({
        temp: Math.round(c.temperature_2m),
        feelsLike: Math.round(c.apparent_temperature),
        tempMin: Math.round(d.temperature_2m_min[0]),
        tempMax: Math.round(d.temperature_2m_max[0]),
        description: getWeatherDesc(c.weather_code),
        humidity: c.relative_humidity_2m,
        windSpeed: Math.round(c.wind_speed_10m),
        windDir: getWindDir(c.wind_direction_10m),
        pressure: Math.round(c.surface_pressure),
        uv: Math.round(c.uv_index * 10) / 10,
        precipitation: c.precipitation ?? 0,
        visibility: Math.round((c.visibility ?? 10000) / 1000),
        icon: getWeatherIcon(c.weather_code),
        advice: getAdvice(c),
        city: 'Ma position',
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
    if (code <= 49) return 'fog';
    if (code <= 69) return 'rain';
    if (code <= 79) return 'snow';
    if (code <= 99) return 'storm';
    return 'cloud';
  };

  const getWindDir = (deg: number) => {
    const dirs = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'];
    return dirs[Math.round(deg / 45) % 8];
  };

  const getAdvice = (c: any) => {
    const code = c.weather_code;
    const temp = c.temperature_2m;
    const precip = c.precipitation ?? 0;
    const humidity = c.relative_humidity_2m;
    const wind = c.wind_speed_10m;
    const uv = c.uv_index;
    const pressure = c.surface_pressure;

    if (code >= 95) return `Orage violent (${code}). Rentrez le bétail et débranchez l'irrigation électrique.`;
    if (code >= 80) return `Risque d'orage. Vérifiez les attaches des serres et rentrez le matériel.`;
    if (code >= 71) return `Neige annoncée. Protégez les cultures sous serre avec des voiles d'hivernage.`;
    if (code >= 45) return `Brouillard épais (visibilité ${Math.round((c.visibility ?? 10000) / 1000)} km). Reporter les traitements foliaires.`;
    if (code >= 61 && precip > 5) return `Fortes pluies (${precip} mm). Vérifiez le drainage des parcelles.`;
    if (code >= 61) return `Pluie modérée (${precip} mm). Idéal pour la croissance, pas besoin d'irrigation aujourd'hui.`;
    if (code >= 51) return `Pluie fine (${precip} mm). Bon moment pour épandre l'engrais soluble.`;
    if (code <= 1 && temp > 30 && uv > 7) return `Très forte chaleur (${temp}°C, UV ${uv}). Arrosez tôt le matin, paillez le sol.`;
    if (code <= 1 && temp > 25) return `Belle journée (${temp}°C). Idéal pour les récoltes et le séchage.`;
    if (code <= 1) return `Temps clair (${temp}°C, UV ${uv}). Bon pour les semis et traitements préventifs.`;
    if (code <= 3 && temp > 25 && humidity > 70) return `Chaud et humide (${temp}°C, ${humidity}%). Surveillez les maladies cryptogamiques.`;
    if (code <= 3 && temp > 20) return `Temps doux (${temp}°C). Conditions favorables pour le travail aux champs.`;
    if (code <= 3 && wind > 30) return `Vent fort (${wind} km/h). Évitez les traitements phytosanitaires.`;
    if (code <= 3) return `Ciel variable (${temp}°C, ${humidity}% HR). Prévoyez des bâches pour les cultures sensibles.`;
    if (temp > 35) return `Canicule (${temp}°C). Hydratez le bétail et surélevez l'irrigation.`;
    if (temp > 30) return `Forte chaleur (${temp}°C). Arrosez en fin de journée pour limiter l'évaporation.`;
    if (temp < 5 && humidity < 60) return `Gel possible (${temp}°C). Protégez les jeunes plants avec un voile de forçage.`;
    if (temp < 5) return `Températures basses (${temp}°C). Rentrez les plantes en pot et les semis.`;
    if (pressure < 1010) return `Pression basse (${pressure} hPa). Un front perturbé arrive, anticipez les intempéries.`;
    if (pressure > 1030) return `Pression haute (${pressure} hPa). Temps stable, bonne période pour les semis.`;
    return `Conditions normales (${temp}°C, ${humidity}% HR). Vous pouvez travailler aux champs sereinement.`;
  };

  const IconComp = weather?.icon === 'sun' ? Sun
    : weather?.icon === 'rain' ? CloudRain
    : weather?.icon === 'storm' ? CloudLightning
    : weather?.icon === 'snow' ? Snowflake
    : weather?.icon === 'fog' ? CloudFog
    : Cloud;

  const mainIconColor = weather ? iconColorMap[weather.icon] || '#636e72' : '#636e72';

  const formatDate = () =>
    new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });

  if (loading) return (
    <div style={{
      backgroundColor: 'white', borderRadius: 14, padding: 24,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)', minWidth: 300, flex: 1,
    }}>
      <span style={{ fontSize: 14, color: '#95a5a6' }}>Météo...</span>
    </div>
  );

  if (error || !weather) return <div style={{ flex: 1 }} />;

  return (
    <div style={{
      backgroundColor: 'white', borderRadius: 14, padding: 24, flex: 1,
      boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
      color: '#2c3e50', minWidth: 300,
    }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, color: '#2c3e50' }}>
            <MapPin size={13} color="#e74c3c" /> {weather.city}
          </div>
          <div style={{ fontSize: 12, color: '#7f8c8d', marginTop: 2 }}>
            {formatDate()}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 40, fontWeight: 'bold', lineHeight: 1, color: '#2c3e50' }}>
            {weather.temp}°
          </div>
          <div style={{ fontSize: 11, color: '#95a5a6', marginTop: 1 }}>
            Ressenti {weather.feelsLike}°
          </div>
        </div>
      </div>

      {/* Min/Max + Description */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 13, color: '#7f8c8d' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ArrowUp size={13} color="#e74c3c" /> {weather.tempMax}°
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <ArrowDown size={13} color="#3498db" /> {weather.tempMin}°
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, fontWeight: 600, color: '#2c3e50' }}>
          <IconComp size={20} color={mainIconColor} /> {weather.description}
        </div>
      </div>

      {/* Metrics grid */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8,
        marginBottom: 16,
      }}>
        {[
          { icon: Thermometer, label: 'Pression', value: `${weather.pressure} hPa`, color: '#636e72' },
          { icon: Droplets, label: 'Humidité', value: `${weather.humidity}%`, color: '#3498db' },
          { icon: Wind, label: 'Vent', value: `${weather.windSpeed} ${weather.windDir}`, color: '#27ae60' },
          { icon: Eye, label: 'Visibilité', value: `${weather.visibility} km`, color: '#8e44ad' },
          { icon: Sun, label: 'UV', value: `${weather.uv}`, color: '#f39c12' },
          { icon: CloudRain, label: 'Précip.', value: `${weather.precipitation} mm`, color: '#2980b9' },
        ].map((item, i) => {
          const Icon = item.icon;
          return (
            <div key={i} style={{
              backgroundColor: '#f8f9fa',
              borderRadius: 8, padding: '8px 6px',
              textAlign: 'center', fontSize: 11,
            }}>
              <Icon size={14} color={item.color} style={{ display: 'block', margin: '0 auto 3px' }} />
              <div style={{ fontWeight: 600, fontSize: 12, color: '#2c3e50' }}>{item.value}</div>
              <div style={{ color: '#95a5a6', fontSize: 10 }}>{item.label}</div>
            </div>
          );
        })}
      </div>

      {/* Advice */}
      <div style={{
        backgroundColor: '#f0fdf4',
        borderRadius: 10, padding: '10px 14px',
        border: '1px solid #bbf7d0',
        display: 'flex', alignItems: 'flex-start', gap: 8,
        fontSize: 12, lineHeight: 1.5, color: '#166534',
      }}>
        <Sprout size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 1 }} />
        <span>{weather.advice}</span>
      </div>
    </div>
  );
};

export default WeatherWidget;
