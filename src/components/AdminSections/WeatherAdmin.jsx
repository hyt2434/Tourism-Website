import React from 'react';
import WeatherForecast from '../WeatherForecast';

export default function WeatherAdmin() {
  return (
    <section className="admin-section">
      <h2>🌤️ Weather Suggestions</h2>
      <p>Configure display rules based on weather forecasts.</p>
      <WeatherForecast />
      {/* Add rule configuration UI */}
    </section>
  );
}