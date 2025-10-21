import { Cloud, CloudRain, CloudSnow, Sun } from "lucide-react";

export function WeatherForecast() {
  const weatherData = [
    { day: "MON", date: "12 May", high: "23°", low: "12°", condition: "cloudy" },
    { day: "TUE", date: "13 May", high: "23°", low: "10°", condition: "rainy" },
    { day: "WED", date: "14 May", high: "20°", low: "7°", condition: "rainy" },
    { day: "THU", date: "15 May", high: "19°", low: "6°", condition: "cloudy" },
    { day: "FRI", date: "16 May", high: "19°", low: "6°", condition: "cloudy" },
    { day: "SAT", date: "17 May", high: "19°", low: "5°", condition: "sunny" },
    { day: "SUN", date: "18 May", high: "19°", low: "6°", condition: "rainy" },
  ];

  const getWeatherIcon = (condition) => {
    switch (condition) {
      case "sunny":
        return <Sun className="w-12 h-12 text-yellow-400" />;
      case "rainy":
        return <CloudRain className="w-12 h-12 text-blue-400" />;
      case "cloudy":
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case "snowy":
        return <CloudSnow className="w-12 h-12 text-blue-200" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-20 py-20">
      <div className="relative w-full h-[549px] rounded-lg overflow-hidden bg-gradient-to-br from-blue-400 via-blue-300 to-blue-200">
        {/* Background effect */}
        <div className="absolute inset-0 opacity-20 bg-cover bg-center" 
             style={{ backgroundImage: "url('https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1200')" }}>
        </div>
        
        <div className="relative z-10 h-full flex items-center justify-between px-12">
          {/* Left side - Title */}
          <div className="bg-white bg-opacity-60 backdrop-blur-md rounded-full p-12 w-[424px] h-[412px] flex items-center justify-center">
            <h2 className="text-blue-700 tracking-tight text-center">
              How's the weather ?
            </h2>
          </div>

          {/* Right side - Weather cards */}
          <div className="flex gap-4">
            {weatherData.map((day, index) => (
              <div
                key={index}
                className="bg-gradient-to-b from-teal-600 to-teal-700 text-white rounded-lg p-4 w-[90px] flex flex-col items-center hover:scale-105 transition-transform"
              >
                <div className="mb-2">{day.day}</div>
                <div className="my-4">{getWeatherIcon(day.condition)}</div>
                <div className="mb-1">{day.high}</div>
                <div className="text-white text-opacity-70 mb-4">{day.low}</div>
                <div className="text-white text-opacity-80">{day.date}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
