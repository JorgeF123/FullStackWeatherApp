import { getWeatherIcon } from "../utils/weatherHelpers";

export default function WeatherDisplay({ selectedCity }) {
  if (!selectedCity) {
    return (
      <div className="placeholder-content">
        <div className="placeholder-icon">🌤️</div>
        <h2 className="placeholder-title">Welcome to Weather Dashboard</h2>
        <p className="placeholder-text">
          Search for a city or select one from the nearby cities list to view detailed weather information
        </p>
      </div>
    );
  }

  return (
    <div className="weather-display">
      <div className="weather-header">
        <div className="weather-icon-wrapper">
          <img
            src={`/icons/${getWeatherIcon(selectedCity.condition)}.png`}
            alt={selectedCity.condition}
            className="weather-icon"
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </div>
        <div className="weather-temp-main">
          {Math.round(selectedCity.temp_f || 0)}°
        </div>
      </div>

      <div className="weather-location">
        <h2 className="location-name">{selectedCity.name}</h2>
        {selectedCity.region && (
          <p className="location-region">{selectedCity.region}</p>
        )}
      </div>

      <div className="weather-condition">
        {selectedCity.condition}
      </div>

      {/* Weather Details Card */}
      <div className="weather-details">
        <div className="detail-item">
          <div className="detail-icon">💧</div>
          <div className="detail-content">
            <span className="detail-label">Humidity</span>
            <span className="detail-value">
              {selectedCity.humidity || "--"}%
            </span>
          </div>
        </div>
        <div className="detail-item">
          <div className="detail-icon">💨</div>
          <div className="detail-content">
            <span className="detail-label">Wind Speed</span>
            <span className="detail-value">
              {selectedCity.wind_mph || "--"} mph
            </span>
          </div>
        </div>
        {selectedCity.temp_c !== undefined && (
          <div className="detail-item">
            <div className="detail-icon">🌡️</div>
            <div className="detail-content">
              <span className="detail-label">Celsius</span>
              <span className="detail-value">
                {Math.round(selectedCity.temp_c)}°C
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}