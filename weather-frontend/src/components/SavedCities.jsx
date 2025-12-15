// src/components/SavedCities.jsx
import { getWeatherIcon } from "../utils/weatherHelpers";

export default function SavedCities({ 
  savedCities, 
  onCitySelect, 
  onDeleteCity,
  loading 
}) {
  if (loading && savedCities.length === 0) {
    return (
      <div className="saved-section-horizontal">
        <h2 className="section-title-horizontal">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
          </svg>
          Saved Cities
        </h2>
        <div className="loading-spinner-horizontal">Loading...</div>
      </div>
    );
  }

  return (
    <div className="saved-section-horizontal">
      <h2 className="section-title-horizontal">
        <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        Saved Cities
      </h2>
      
      {savedCities.length === 0 ? (
        <p className="empty-state-horizontal">No saved cities yet. Add a city to get started!</p>
      ) : (
        <div className="saved-cities-horizontal">
          {savedCities.map((city) => {
            if (city.error) {
              return (
                <div key={city.id} className="saved-city-card error-card">
                  <div className="city-card-header">
                    <h3 className="city-card-name">{city.name}</h3>
                    <button
                      className="delete-btn"
                      onClick={() => onDeleteCity(city.id)}
                      aria-label="Delete city"
                    >
                      ×
                    </button>
                  </div>
                  <p className="error-text">{city.error}</p>
                </div>
              );
            }

            return (
              <div 
                key={city.id} 
                className="saved-city-card"
                onClick={() => onCitySelect(city)}
              >
                <div className="city-card-header">
                  <h3 className="city-card-name">{city.name}</h3>
                  <button
                    className="delete-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteCity(city.id);
                    }}
                    aria-label="Delete city"
                  >
                    ×
                  </button>
                </div>
                <div className="city-card-body">
                  <div className="city-card-weather">
                    <img
                      src={`/icons/${getWeatherIcon(city.condition)}.png`}
                      alt={city.condition}
                      className="city-card-icon"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="city-card-temp">{Math.round(city.temp_f)}°</div>
                  </div>
                  <div className="city-card-details">
                    <p className="city-card-condition">{city.condition}</p>
                    <div className="city-card-stats">
                      <span>💧 {city.humidity}%</span>
                      <span>💨 {city.wind_mph} mph</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

