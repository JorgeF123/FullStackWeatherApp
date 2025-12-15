package com.WeatherDashboard.WeatherDashboard.service;

import com.WeatherDashboard.WeatherDashboard.dto.WeatherDTO;
import com.WeatherDashboard.WeatherDashboard.entity.SavedCity;
import com.WeatherDashboard.WeatherDashboard.repository.SavedCityRepository;
import com.WeatherDashboard.WeatherDashboard.WeatherService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class SavedCityService {

    private final SavedCityRepository savedCityRepository;
    private final WeatherService weatherService;

    @Autowired
    public SavedCityService(SavedCityRepository savedCityRepository, WeatherService weatherService) {
        this.savedCityRepository = savedCityRepository;
        this.weatherService = weatherService;
    }

    @Transactional
    public SavedCity saveCity(String cityName, double lat, double lon) {
        // Check if city already exists
        Optional<SavedCity> existing = savedCityRepository.findByCityNameIgnoreCase(cityName);
        if (existing.isPresent()) {
            throw new RuntimeException("City already saved: " + cityName);
        }

        SavedCity savedCity = new SavedCity(cityName, lat, lon);
        return savedCityRepository.save(savedCity);
    }

    @Transactional
    public void deleteCity(Long id) {
        if (!savedCityRepository.existsById(id)) {
            throw new RuntimeException("Saved city not found with id: " + id);
        }
        savedCityRepository.deleteById(id);
    }

    public List<SavedCity> getAllSavedCities() {
        return savedCityRepository.findAll();
    }

    public List<Map<String, Object>> getAllSavedCitiesWithWeather() {
        List<SavedCity> savedCities = savedCityRepository.findAll();
        List<Map<String, Object>> citiesWithWeather = new ArrayList<>();

        for (SavedCity savedCity : savedCities) {
            try {
                // IMPORTANT: Use coordinates instead of city name to ensure we get the correct city
                // This prevents getting a different city with the same name in a different state
                double lat = savedCity.getLatitude();
                double lon = savedCity.getLongitude();
                String locationQuery = lat + "," + lon;
                
                WeatherDTO weather = weatherService.getWeather(locationQuery);
                Map<String, Object> cityData = new HashMap<>();
                cityData.put("id", savedCity.getId());
                cityData.put("name", weather.city());
                cityData.put("region", weather.region());
                cityData.put("country", weather.country());
                cityData.put("temp_f", weather.tempF());
                cityData.put("temp_c", weather.tempC());
                cityData.put("condition", weather.condition());
                cityData.put("humidity", weather.humidity());
                cityData.put("wind_mph", weather.windMph());
                cityData.put("lat", weather.lat());
                cityData.put("lon", weather.lon());
                citiesWithWeather.add(cityData);
            } catch (Exception e) {
                // If weather fetch fails, still include the city but with error info
                Map<String, Object> cityData = new HashMap<>();
                cityData.put("id", savedCity.getId());
                cityData.put("name", savedCity.getCityName());
                cityData.put("lat", savedCity.getLatitude());
                cityData.put("lon", savedCity.getLongitude());
                cityData.put("error", "Failed to fetch weather: " + e.getMessage());
                citiesWithWeather.add(cityData);
            }
        }

        return citiesWithWeather;
    }
}

