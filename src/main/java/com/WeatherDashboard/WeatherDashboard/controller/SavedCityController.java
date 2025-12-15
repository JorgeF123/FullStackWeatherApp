package com.WeatherDashboard.WeatherDashboard.controller;

import com.WeatherDashboard.WeatherDashboard.entity.SavedCity;
import com.WeatherDashboard.WeatherDashboard.service.SavedCityService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/saved-cities")
public class SavedCityController {

    private final SavedCityService savedCityService;

    @Autowired
    public SavedCityController(SavedCityService savedCityService) {
        this.savedCityService = savedCityService;
    }

    @PostMapping
    public ResponseEntity<?> saveCity(@RequestBody Map<String, Object> request) {
        try {
            String cityName = (String) request.get("cityName");
            double lat = ((Number) request.get("lat")).doubleValue();
            double lon = ((Number) request.get("lon")).doubleValue();

            SavedCity savedCity = savedCityService.saveCity(cityName, lat, lon);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCity);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllSavedCitiesWithWeather() {
        try {
            List<Map<String, Object>> cities = savedCityService.getAllSavedCitiesWithWeather();
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCity(@PathVariable Long id) {
        try {
            savedCityService.deleteCity(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }
}

