package com.WeatherDashboard.WeatherDashboard;

import com.WeatherDashboard.WeatherDashboard.dto.WeatherDTO;
import com.WeatherDashboard.WeatherDashboard.dto.ForecastDTO;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/weather")
public class WeatherController {
    private final WeatherService weatherService;

    @Autowired
    public WeatherController(WeatherService weatherService){
        this.weatherService = weatherService;
    }

    @GetMapping
    public ResponseEntity<?> getWeather(@RequestParam String city) {
        try {
            WeatherDTO weather = weatherService.getWeather(city);
            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", city + " not found: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/coords")
    public ResponseEntity<?> getWeatherByCoords(
            @RequestParam double lat, 
            @RequestParam double lon) {
        try {
            String location = lat + "," + lon;
            WeatherDTO weather = weatherService.getWeather(location);
            return ResponseEntity.ok(weather);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch weather for coordinates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/nearby")
    public ResponseEntity<?> getNearbyCities(
            @RequestParam double lat, 
            @RequestParam double lon,
            @RequestParam(required = false) String region) {
        try {
            System.out.println("Received nearby cities request - lat: " + lat + ", lon: " + lon + ", region: " + region);
            Map<String, Object> cities = weatherService.getNearbyCities(lat, lon, region);
            System.out.println("Returning " + ((List<?>) cities.get("list")).size() + " cities");
            return ResponseEntity.ok(cities);
        } catch (Exception e) {
            System.err.println("Error fetching nearby cities: " + e.getMessage());
            e.printStackTrace();
            Map<String, String> error = new HashMap<>();
            error.put("error", "Could not fetch nearby cities: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/forecast")
    public ResponseEntity<?> getForecast(
            @RequestParam String city,
            @RequestParam(defaultValue = "3") int days) {
        try {
            if (days < 1 || days > 4) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Days parameter must be between 1 and 4");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            ForecastDTO forecast = weatherService.getForecast(city, days);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch forecast for " + city + ": " + e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }
    }

    @GetMapping("/forecast/coords")
    public ResponseEntity<?> getForecastByCoords(
            @RequestParam double lat,
            @RequestParam double lon,
            @RequestParam(defaultValue = "3") int days) {
        try {
            if (days < 1 || days > 4) {
                Map<String, String> error = new HashMap<>();
                error.put("error", "Days parameter must be between 1 and 4");
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
            }
            String location = lat + "," + lon;
            ForecastDTO forecast = weatherService.getForecast(location, days);
            return ResponseEntity.ok(forecast);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("error", "Failed to fetch forecast for coordinates: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping("/")
    public String home() {
        return "Weather API is running";
    }
}
