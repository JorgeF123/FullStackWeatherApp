import { useEffect, useState } from "react";
import { fetchForecast, fetchForecastByCoords } from "../services/weatherApi";
import { getWeatherIcon } from "../utils/weatherHelpers";

export default function Forecast({ selectedCity }) {
  const [forecast, setForecast] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!selectedCity) {
      setForecast(null);
      return;
    }

    setLoading(true);
    setError("");

    const loadForecast = async () => {
      try {
        let forecastData;
        // Request 3 days to get today + 2 future days, then filter out today
        // This ensures we have 2 future days to display
        if (selectedCity.lat && selectedCity.lon) {
          forecastData = await fetchForecastByCoords(selectedCity.lat, selectedCity.lon, 3);
        } else if (selectedCity.name) {
          forecastData = await fetchForecast(selectedCity.name, 3);
        } else {
          setError("Invalid city data");
          setLoading(false);
          return;
        }
        setForecast(forecastData);
      } catch (err) {
        console.error("Failed to load forecast:", err);
        setError(err.message || "Failed to load forecast");
        setForecast(null);
      } finally {
        setLoading(false);
      }
    };

    loadForecast();
  }, [selectedCity]);

  if (!selectedCity) {
    return null;
  }

  if (loading) {
    return (
      <div className="forecast-container">
        <h3 className="forecast-title">2-Day Forecast</h3>
        <div className="forecast-loading">Loading forecast...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="forecast-container">
        <h3 className="forecast-title">2-Day Forecast</h3>
        <div className="forecast-error">{error}</div>
      </div>
    );
  }

  if (!forecast || !forecast.forecast || forecast.forecast.length === 0) {
    return null;
  }

  // Filter out today and get exactly 2 days starting from tomorrow
  // Get today's date string in YYYY-MM-DD format for comparison
  const today = new Date();
  // Use local date to avoid timezone issues
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  const todayString = `${year}-${month}-${day}`; // Format: YYYY-MM-DD
  
  // Filter out today and take exactly 2 future days (tomorrow + day after)
  const futureDays = forecast.forecast
    .filter((day) => {
      // Compare date strings directly (API returns dates in YYYY-MM-DD format)
      // Only include days after today (starting from tomorrow)
      return day.date && day.date > todayString;
    })
    .slice(0, 2); // Take exactly 2 days: tomorrow and day after

  // Format date to show weekday, month, and day (e.g., "Mon, Dec 17")
  const formatDate = (dateString) => {
    if (!dateString) return "";
    // Parse the date string (YYYY-MM-DD format from API)
    const date = new Date(dateString + 'T12:00:00'); // Use noon to avoid timezone issues
    // Format as: "Mon, Dec 17"
    return date.toLocaleDateString("en-US", { 
      weekday: "short", 
      month: "short", 
      day: "numeric" 
    });
  };

  if (futureDays.length === 0) {
    return null;
  }

  return (
    <div className="forecast-container">
      <h3 className="forecast-title">2-Day Forecast</h3>
      <div className="forecast-days">
        {futureDays.map((day, index) => {
          const dayData = day.day || {};
          const condition = dayData.condition || {};
          const conditionText = condition.text || "";
          
          // Use snake_case property names as returned by the API
          const maxTempF = dayData.maxtemp_f ?? 0;
          const minTempF = dayData.mintemp_f ?? 0;
          const chanceOfRain = dayData.daily_chance_of_rain ?? 0;
          const chanceOfSnow = dayData.daily_chance_of_snow ?? 0;
          
          return (
            <div key={day.date || index} className="forecast-day">
              <div className="forecast-day-header">
                <span className="forecast-date">{formatDate(day.date)}</span>
              </div>
              <div className="forecast-day-content">
                <div className="forecast-icon-wrapper">
                  <img
                    src={`/icons/${getWeatherIcon(conditionText)}.png`}
                    alt={conditionText}
                    className="forecast-icon"
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </div>
                <div className="forecast-temps">
                  <span className="forecast-high">{Math.round(maxTempF)}°</span>
                  <span className="forecast-low">/{Math.round(minTempF)}°</span>
                </div>
                <div className="forecast-condition">{conditionText}</div>
                <div className="forecast-details">
                  {chanceOfRain > 0 && (
                    <span className="forecast-rain">🌧️ {chanceOfRain}%</span>
                  )}
                  {chanceOfSnow > 0 && (
                    <span className="forecast-snow">❄️ {chanceOfSnow}%</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

