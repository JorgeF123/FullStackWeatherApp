import { useEffect, useState } from "react";
import "./App.css";
import { 
  fetchWeather as fetchWeatherApi, 
  fetchNearbyCities as fetchNearbyCitiesApi,
  fetchWeatherByCoords as fetchWeatherByCoordsApi,
  saveCity as saveCityApi,
  fetchSavedCities as fetchSavedCitiesApi,
  deleteSavedCity as deleteSavedCityApi
} from "./services/weatherApi";
import SearchBar from "./components/SearchBar";
import NearbyCities from "./components/NearbyCities";
import SavedCities from "./components/SavedCities";
import WeatherDisplay from "./components/WeatherDisplay";
import Forecast from "./components/Forecast";
import { getBackgroundClass } from "./utils/weatherHelpers";

export default function App() {
  const [nearbyCities, setNearbyCities] = useState([]);
  const [locationPermission, setLocationPermission] = useState(null);
  const [selectedCity, setSelectedCity] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [savedCities, setSavedCities] = useState([]);
  const [savedCitiesLoading, setSavedCitiesLoading] = useState(false);

  // Load nearby cities
  function loadNearby(lat, lon, region = null) {
    if (!lat || !lon) {
      console.warn("loadNearby called with invalid coordinates:", lat, lon);
      return;
    }
    
    // Use selectedCity's region if available, otherwise use passed region
    const userRegion = selectedCity?.region || region;
    console.log("Loading nearby cities for coordinates:", lat, lon, "in region:", userRegion);
    setLoading(true);
    
    fetchNearbyCitiesApi(lat, lon, userRegion)
      .then((cities) => {
        console.log("Nearby cities received:", cities.length, "cities");
        setNearbyCities(cities);
        setError(""); // Clear any previous errors
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load nearby cities:", err);
        setError("Failed to load nearby cities: " + err.message);
        setNearbyCities([]);
        setLoading(false);
      });
  }

  // Fetch weather for user search
  function fetchWeather(cityName) {
    if (!cityName.trim()) {
      console.warn("fetchWeather called with empty city name");
      return;
    }
    
    setLoading(true);
    setError("");
    
    fetchWeatherApi(cityName)
      .then((data) => {
        setSelectedCity(data);
        setError("");
        setLoading(false);

        // Load nearby cities based on searched city
        if (data.lat != null && data.lon != null) {
          loadNearby(Number(data.lat), Number(data.lon), data.region);
        } else {
          console.warn("City data missing lat/lon coordinates");
        }
      })
      .catch((err) => {
        console.error("Weather fetch error:", err);
        setError(err.message || "Failed to fetch weather data");
        setLoading(false);
      });
  }

  // Handle city selection from nearby cities or saved cities
  function handleCitySelect(city) {
    const cityName = city.name;
    const lat = city.coord?.lat || city.lat;
    const lon = city.coord?.lon || city.lon;

    // IMPORTANT: Always use coordinates when available to avoid getting wrong city with same name
    // This prevents selecting "Brentwood, New York" when clicking "Brentwood" from saved/nearby cities in California
    // Even for saved cities, refresh using coordinates to ensure we get the correct city and latest weather
    if (lat && lon) {
      setLoading(true);
      setError("");
      
      fetchWeatherByCoordsApi(lat, lon)
        .then((data) => {
          console.log("Selected city weather data:", data.name, data.region);
          setSelectedCity(data);
          setError("");
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch weather for selected city:", err);
          // Fallback to existing city data if fetch fails (for saved cities)
          if (city.condition && city.temp_f !== undefined) {
            setSelectedCity(city);
            setError("Using cached data - weather refresh unavailable");
          } else {
            // For nearby cities, create normalized data
            const conditionText = city.weather?.[0]?.description || "Unknown";
            const normalizedCondition = conditionText
              .toLowerCase()
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ');
            
            const normalizedCity = {
              name: cityName,
              temp_f: city.main?.temp || 0,
              condition: normalizedCondition,
              humidity: city.main?.humidity || 0,
              wind_mph: city.wind?.speed || 0,
              lat: lat,
              lon: lon,
              region: city.region,
              country: city.country,
            };
            setSelectedCity(normalizedCity);
            setError("Using cached data - full weather unavailable");
          }
          setLoading(false);
        });
      return;
    }

    // If no coordinates available, try by city name (fallback)
    if (cityName) {
      setLoading(true);
      setError("");
      
      fetchWeatherApi(cityName)
        .then((data) => {
          console.log("Selected city weather data (by name):", data.name, data.region);
          setSelectedCity(data);
          setError("");
          setLoading(false);
        })
        .catch((err) => {
          console.error("Failed to fetch weather for selected city:", err);
          // Final fallback: use existing city data if available
          if (city.condition && city.temp_f !== undefined) {
            setSelectedCity(city);
            setError("Using cached data - weather refresh unavailable");
          } else {
            setError("Failed to fetch weather data");
          }
          setLoading(false);
        });
      return;
    }

    // Last resort: use city data directly if it has all required fields
    if (city.condition && city.temp_f !== undefined) {
      setSelectedCity(city);
    } else {
      setError("Invalid city data - missing required information");
    }
  }

  // Save current city to saved cities
  function handleSaveCity() {
    if (!selectedCity || !selectedCity.name) {
      setError("No city selected to save");
      return;
    }

    // IMPORTANT: Ensure we have coordinates before saving
    // This ensures we save the correct city, not a different one with the same name
    if (!selectedCity.lat || !selectedCity.lon) {
      setError("Cannot save city: coordinates are missing. Please select a city from nearby cities or search by location.");
      return;
    }

    console.log("Saving city:", selectedCity.name, "in", selectedCity.region, "at coordinates:", selectedCity.lat, selectedCity.lon);
    setSavedCitiesLoading(true);
    saveCityApi(selectedCity.name, selectedCity.lat, selectedCity.lon)
      .then(() => {
        console.log("City saved successfully");
        // Reload saved cities
        loadSavedCities();
        setError("");
      })
      .catch((err) => {
        console.error("Failed to save city:", err);
        setError(err.message || "Failed to save city");
      })
      .finally(() => {
        setSavedCitiesLoading(false);
      });
  }

  // Load saved cities with weather
  function loadSavedCities() {
    setSavedCitiesLoading(true);
    fetchSavedCitiesApi()
      .then((cities) => {
        setSavedCities(cities);
        setError("");
      })
      .catch((err) => {
        console.error("Failed to load saved cities:", err);
        setSavedCities([]);
      })
      .finally(() => {
        setSavedCitiesLoading(false);
      });
  }

  // Delete a saved city
  function handleDeleteCity(id) {
    setSavedCitiesLoading(true);
    deleteSavedCityApi(id)
      .then(() => {
        // Reload saved cities
        loadSavedCities();
      })
      .catch((err) => {
        console.error("Failed to delete city:", err);
        setError(err.message || "Failed to delete city");
      })
      .finally(() => {
        setSavedCitiesLoading(false);
      });
  }

  // Load saved cities on mount
  useEffect(() => {
    loadSavedCities();
  }, []);

  // Load weather and nearby cities based on user's location at startup
  useEffect(() => {
    // Fallback coordinates if geolocation fails
    const fallbackLat = 37.96;
    const fallbackLon = -121.79;

    // Check if browser supports geolocation
    if (!navigator.geolocation) {
      console.warn("Geolocation is not supported by this browser");
      // Use fallback coordinates
      loadNearby(fallbackLat, fallbackLon);
      return;
    }

    // Request user's location
    setLocationPermission('prompting');
    
    navigator.geolocation.getCurrentPosition(
      // Success callback
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        
        console.log("User location detected:", lat, lon);
        setLocationPermission('granted');
        
        // Load weather for user's location first to get region
        setLoading(true);
        fetchWeatherByCoordsApi(lat, lon)
          .then((data) => {
            console.log("Weather data for location:", data.name, data.region);
            setSelectedCity(data);
            setError("");
            setLoading(false);
            
            // Load nearby cities with region from weather data
            // Wait a moment to ensure selectedCity is set
            setTimeout(() => {
              loadNearby(lat, lon, data.region);
            }, 100);
          })
          .catch((err) => {
            console.error("Failed to fetch weather for location:", err);
            // Still load nearby cities even if weather fetch fails (without region filter)
            loadNearby(lat, lon);
          });
      },
      // Error callback
      (error) => {
        console.warn("Geolocation error:", error);
        setLocationPermission('denied');
        
        // Use fallback coordinates
        loadNearby(fallbackLat, fallbackLon);
      },
      // Options
      {
        enableHighAccuracy: true,
        timeout: 10000, // 10 seconds timeout
        maximumAge: 300000 // Cache for 5 minutes
      }
    );
  }, []);

  const condition = selectedCity?.condition || "";
  const bgClass = getBackgroundClass(condition);

  return (
    <div className={`app-container ${bgClass}`}>
      <div className="app-wrapper">
        {/* Sidebar with search and nearby cities */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <h1 className="app-title">Weather</h1>
            <p className="app-subtitle">Dashboard</p>
          </div>

          {/* Search Bar */}
          <SearchBar
            searchInput={searchInput}
            onSearchChange={setSearchInput}
            onSearch={() => fetchWeather(searchInput)}
            loading={loading}
          />

          {error && <div className="error-message">{error}</div>}

          {/* Save City Button */}
          {selectedCity && (
            <button
              className="save-city-btn"
              onClick={handleSaveCity}
              disabled={savedCitiesLoading || savedCities.some(c => c.name === selectedCity.name)}
            >
              {savedCitiesLoading ? "..." : savedCities.some(c => c.name === selectedCity.name) ? "✓ Saved" : "★ Save City"}
            </button>
          )}

          {/* Nearby Cities */}
          <NearbyCities
            nearbyCities={nearbyCities}
            selectedCity={selectedCity}
            onCitySelect={handleCitySelect}
            loading={loading}
          />

          {/* Saved Cities - Mobile only (shown in sidebar) */}
          <div className="saved-cities-mobile">
            <SavedCities
              savedCities={savedCities}
              onCitySelect={handleCitySelect}
              onDeleteCity={handleDeleteCity}
              loading={savedCitiesLoading}
            />
          </div>
        </aside>

        {/* Main content area */}
        <div className="main-area">
          {/* Saved Cities - Horizontal bar at top */}
          <SavedCities
            savedCities={savedCities}
            onCitySelect={handleCitySelect}
            onDeleteCity={handleDeleteCity}
            loading={savedCitiesLoading}
          />

          {/* Main weather display */}
          <main className="main-content">
            <WeatherDisplay selectedCity={selectedCity} />
            <Forecast selectedCity={selectedCity} />
          </main>
        </div>
      </div>
    </div>
  );
}