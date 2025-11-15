import React, { useState, useEffect } from "react";
import { Cloud, CloudRain, Sun, Wind, Droplets, CloudSnow, CloudDrizzle, CloudLightning, Thermometer, Gauge, CloudFog } from "lucide-react";
import { useLanguage } from "../../context/LanguageContext";

const cities = [
  { name: "Ho Chi Minh", latitude: 10.8231, longitude: 106.6297 },
  { name: "Ha Noi", latitude: 21.0285, longitude: 105.8542 },
  { name: "Da Nang", latitude: 16.0544, longitude: 108.2022 },
  { name: "Hue", latitude: 16.4637, longitude: 107.5909 },
  { name: "Da Lat", latitude: 11.9404, longitude: 108.4583 },
];

export default function WeatherBanner() {
  const { translations, language } = useLanguage();
  const [weatherData, setWeatherData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllWeather();
  }, []);

  const fetchAllWeather = async () => {
    try {
      setLoading(true);
      
      const weatherPromises = cities.map(async (city) => {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${city.latitude}&longitude=${city.longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,apparent_temperature,pressure_msl,cloud_cover&timezone=Asia/Bangkok`
        );
        
        if (!response.ok) throw new Error(`Failed to fetch weather for ${city.name}`);
        
        const data = await response.json();
        return {
          city: city.name,
          ...data.current,
        };
      });
      
      const results = await Promise.all(weatherPromises);
      setWeatherData(results);
      setError(null);
    } catch (err) {
      setError(err.message);
      console.error('Weather fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherStyle = (code) => {
    // Clear/Sunny (0-1) - Orange primary
    if (code === 0 || code === 1) {
      return {
        gradient: "from-orange-200 via-orange-300 to-orange-400",
        icon: <Sun className="w-20 h-20 text-yellow-50 drop-shadow-2xl" />,
        iconBg: "bg-orange-400/30",
        text: "text-gray-900",
        accentColor: "text-orange-800",
      };
    }
    // Partly Cloudy (2) - Blue primary
    if (code === 2) {
      return {
        gradient: "from-blue-200 via-blue-300 to-blue-400",
        icon: <CloudFog className="w-20 h-20 text-white drop-shadow-2xl" />,
        iconBg: "bg-blue-400/30",
        text: "text-gray-800",
        accentColor: "text-blue-800",
      };
    }
    // Cloudy (3) - Blue primary
    if (code === 3) {
      return {
        gradient: "from-blue-300 via-blue-400 to-blue-500",
        icon: <Cloud className="w-20 h-20 text-white drop-shadow-2xl" />,
        iconBg: "bg-blue-500/30",
        text: "text-white",
        accentColor: "text-blue-100",
      };
    }
    // Drizzle (51-55) - Gray primary
    if (code >= 51 && code <= 55) {
      return {
        gradient: "from-gray-300 via-gray-400 to-gray-500",
        icon: <CloudDrizzle className="w-20 h-20 text-white drop-shadow-2xl" />,
        iconBg: "bg-gray-500/30",
        text: "text-white",
        accentColor: "text-gray-100",
      };
    }
    // Rain (61-67) - Gray primary
    if (code >= 61 && code <= 67) {
      return {
        gradient: "from-gray-400 via-gray-500 to-gray-600",
        icon: <CloudRain className="w-20 h-20 text-white drop-shadow-2xl" />,
        iconBg: "bg-gray-600/30",
        text: "text-white",
        accentColor: "text-gray-100",
      };
    }
    // Snow (71-77) - Blue primary
    if (code >= 71 && code <= 77) {
      return {
        gradient: "from-blue-200 via-blue-300 to-blue-400",
        icon: <CloudSnow className="w-20 h-20 text-white drop-shadow-2xl" />,
        iconBg: "bg-blue-400/30",
        text: "text-white",
        accentColor: "text-blue-100",
      };
    }
    // Rain Showers (80-82) - Gray primary
    if (code >= 80 && code <= 82) {
      return {
        gradient: "from-gray-300 via-gray-400 to-gray-500",
        icon: <CloudRain className="w-20 h-20 text-white drop-shadow-2xl" strokeWidth={2.5} />,
        iconBg: "bg-gray-500/30",
        text: "text-white",
        accentColor: "text-gray-100",
      };
    }
    // Thunderstorm (95+) - Gray primary (dark storm)
    if (code >= 95) {
      return {
        gradient: "from-gray-500 via-gray-600 to-gray-700",
        icon: <CloudLightning className="w-20 h-20 text-yellow-200 drop-shadow-2xl" />,
        iconBg: "bg-gray-700/30",
        text: "text-white",
        accentColor: "text-gray-100",
      };
    }
    // Default - Blue primary
    return {
      gradient: "from-blue-200 via-blue-300 to-blue-400",
      icon: <Cloud className="w-20 h-20 text-white drop-shadow-2xl" />,
      iconBg: "bg-blue-500/30",
      text: "text-white",
      accentColor: "text-blue-100",
    };
  };

  const getWeatherDescription = (code) => {
    const descriptions = {
      en: {
        0: "Clear & Sunny",
        2: "Partly Cloudy",
        3: "Cloudy",
        51: "Light Drizzle",
        61: "Rainy",
        71: "Snowy",
        80: "Rain Showers",
        95: "Thunderstorm",
        default: "Unknown"
      },
      vi: {
        0: "Quang đãng",
        2: "Có mây",
        3: "Nhiều mây",
        51: "Mưa phùn",
        61: "Mưa",
        71: "Tuyết",
        80: "Mưa rào",
        95: "Dông bão",
        default: "Không rõ"
      }
    };
    
    if (code === 0 || code === 1) return descriptions[language][0];
    if (code === 2) return descriptions[language][2];
    if (code === 3) return descriptions[language][3];
    if (code >= 51 && code <= 55) return descriptions[language][51];
    if (code >= 61 && code <= 65) return descriptions[language][61];
    if (code >= 71 && code <= 77) return descriptions[language][71];
    if (code >= 80 && code <= 82) return descriptions[language][80];
    if (code >= 95) return descriptions[language][95];
    return descriptions[language].default;
  };

  return (
    <section className="py-12 px-4 md:px-8 lg:px-36 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div>
        {/* Title Section */}
        <div className="flex items-center gap-3 mb-8">
          <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
            <Sun className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-title dark:text-white">
            {translations.weatherTitle}
          </h2>
        </div>
        
        {loading && (
          <div className="text-center py-12">
            <p className="text-lg text-gray-600 dark:text-gray-300">
              {language === 'en' ? 'Loading weather data...' : 'Đang tải dữ liệu thời tiết...'}
            </p>
          </div>
        )}
        
        {error && (
          <div className="text-center py-12">
            <p className="text-lg text-red-600 dark:text-red-400">
              {language === 'en' ? 'Unable to load weather data' : 'Không thể tải dữ liệu thời tiết'}
            </p>
          </div>
        )}

        {/* Weather Cards Grid */}
        {!loading && weatherData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {weatherData.map((weather, index) => {
              const style = getWeatherStyle(weather.weather_code);
              return (
                <div
                  key={index}
                  className={`relative bg-gradient-to-br ${style.gradient} rounded-3xl p-6 shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105 overflow-hidden`}
                >
                  {/* Decorative Background Circles */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/3 translate-x-1/3 blur-2xl"></div>
                  <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/15 rounded-full translate-y-1/3 -translate-x-1/3 blur-xl"></div>
                  <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
                  
                  {/* Content */}
                  <div className="relative z-10">
                    {/* City Name */}
                    <h3 className={`text-xl font-extrabold ${style.text} mb-1 tracking-tight`}>
                      {weather.city}
                    </h3>
                    <p className={`text-xs ${style.accentColor} mb-4 font-medium uppercase tracking-wide`}>
                      {getWeatherDescription(weather.weather_code)}
                    </p>
                    
                    {/* Weather Icon */}
                    <div className="flex items-center justify-center mb-4">
                      <div className={`${style.iconBg} rounded-3xl p-5 backdrop-blur-sm`}>
                        {style.icon}
                      </div>
                    </div>
                    
                    {/* Temperature */}
                    <div className={`text-6xl font-black ${style.text} text-center mb-2 drop-shadow-xl`}>
                      {Math.round(weather.temperature_2m)}°
                    </div>
                    <div className={`text-sm ${style.accentColor} text-center mb-6 font-medium`}>
                      {language === 'en' 
                        ? `Feels like ${Math.round(weather.apparent_temperature)}°C`
                        : `Cảm giác như ${Math.round(weather.apparent_temperature)}°C`
                      }
                    </div>
                    
                    {/* Weather Details Grid */}
                    <div className="space-y-2">
                      <div className={`flex items-center justify-between ${style.text} text-sm bg-white/25 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm`}>
                        <div className="flex items-center gap-2">
                          <Droplets className="w-4 h-4" />
                          <span className="font-medium">
                            {language === 'en' ? 'Humidity' : 'Độ ẩm'}
                          </span>
                        </div>
                        <span className="font-bold text-base">
                          {weather.relative_humidity_2m}%
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between ${style.text} text-sm bg-white/25 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm`}>
                        <div className="flex items-center gap-2">
                          <Wind className="w-4 h-4" />
                          <span className="font-medium">
                            {language === 'en' ? 'Wind Speed' : 'Tốc độ gió'}
                          </span>
                        </div>
                        <span className="font-bold text-base">
                          {Math.round(weather.wind_speed_10m)} km/h
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between ${style.text} text-sm bg-white/25 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm`}>
                        <div className="flex items-center gap-2">
                          <Gauge className="w-4 h-4" />
                          <span className="font-medium">
                            {language === 'en' ? 'Pressure' : 'Áp suất'}
                          </span>
                        </div>
                        <span className="font-bold text-base">
                          {Math.round(weather.pressure_msl)} hPa
                        </span>
                      </div>
                      
                      <div className={`flex items-center justify-between ${style.text} text-sm bg-white/25 backdrop-blur-md rounded-xl px-3 py-2.5 shadow-sm`}>
                        <div className="flex items-center gap-2">
                          <Cloud className="w-4 h-4" />
                          <span className="font-medium">
                            {language === 'en' ? 'Cloud Cover' : 'Mây che phủ'}
                          </span>
                        </div>
                        <span className="font-bold text-base">
                          {weather.cloud_cover}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
