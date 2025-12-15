// Get API URL from environment variable, fallback to localhost for development
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

/**
 * Fetches weather data for a given city
 * @param {string} cityName - Name of the city to search for
 * @returns {Promise<Object>} Weather data object
 */
export async function fetchWeather(cityName) {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name cannot be empty');
  }

  const url = `${API_BASE_URL}/weather?city=${encodeURIComponent(cityName.trim())}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch weather data`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  return data;
}

/**
 * Fetches nearby cities based on latitude and longitude
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} region - Optional region/state to filter cities by
 * @returns {Promise<Array>} Array of nearby cities
 */
export async function fetchNearbyCities(lat, lon, region = null) {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    throw new Error('Invalid coordinates provided');
  }

  let url = `${API_BASE_URL}/weather/nearby?lat=${lat}&lon=${lon}`;
  if (region) {
    url += `&region=${encodeURIComponent(region)}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch nearby cities`);
  }
  
  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error);
  }
  
  // Extract the list of cities from the response
  const cities = data.list || [];
  return cities;
}

/**
 * Fetches weather data for coordinates (latitude/longitude)
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Weather data object
 */
export async function fetchWeatherByCoords(lat, lon) {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      throw new Error('Invalid coordinates provided');
    }
  
    const url = `${API_BASE_URL}/weather/coords?lat=${lat}&lon=${lon}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch weather data`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  }
  
/**
 * Saves a city to the saved cities list
 * @param {string} cityName - Name of the city to save
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<Object>} Saved city object
 */
export async function saveCity(cityName, lat, lon) {
  if (!cityName || !cityName.trim()) {
    throw new Error('City name cannot be empty');
  }

  const url = `${API_BASE_URL}/saved-cities`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      cityName: cityName.trim(),
      lat: lat,
      lon: lon
    })
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}: Failed to save city`);
  }
  
  return await response.json();
}

/**
 * Fetches all saved cities with their current weather
 * @returns {Promise<Array>} Array of saved cities with weather data
 */
export async function fetchSavedCities() {
  const url = `${API_BASE_URL}/saved-cities`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: Failed to fetch saved cities`);
  }
  
  return await response.json();
}

/**
 * Deletes a saved city
 * @param {number} id - ID of the saved city to delete
 * @returns {Promise<void>}
 */
export async function deleteSavedCity(id) {
  const url = `${API_BASE_URL}/saved-cities/${id}`;
  
  const response = await fetch(url, {
    method: 'DELETE'
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || `HTTP ${response.status}: Failed to delete city`);
  }
}