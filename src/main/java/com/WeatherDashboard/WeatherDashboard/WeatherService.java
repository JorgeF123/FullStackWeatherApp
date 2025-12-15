package com.WeatherDashboard.WeatherDashboard;

import com.WeatherDashboard.WeatherDashboard.dto.WeatherDTO;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class WeatherService {
    @Value("${weatherapi.key}")
    private String API_KEY;
    private final String BASE_URL = "http://api.weatherapi.com/v1/current.json";

    @Value("${openweather.key}")
    private String GEO_CODING;
    private final String GEO_CODING_URL = "https://api.openweathermap.org/geo/1.0/";

    public WeatherDTO getWeather(String city) {
        String url = BASE_URL + "?key=" + API_KEY + "&q=" + city;
        RestTemplate restTemplate = new RestTemplate();

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            Map<String, Object> location = (Map<String, Object>) response.get("location");
            Map<String, Object> current = (Map<String, Object>) response.get("current");
            Map<String, Object> condition = (Map<String, Object>) current.get("condition");
            
            return new WeatherDTO(
                    (String) location.get("name"),
                    (String) location.get("region"),
                    (String) location.get("country"),
                    ((Number) current.get("temp_f")).doubleValue(),
                    ((Number) current.get("temp_c")).doubleValue(),
                    (String) condition.get("text"),
                    ((Number) current.get("humidity")).intValue(),
                    ((Number) current.get("wind_mph")).doubleValue(),
                    ((Number) location.get("lat")).doubleValue(),
                    ((Number) location.get("lon")).doubleValue()
            );
        } catch(Exception e) {
            throw new RuntimeException("Failed to fetch weather for: " + city, e);
        }
    }

    /**
     * Calculate distance between two coordinates using Haversine formula
     * @return distance in kilometers
     */
    private double calculateDistance(double lat1, double lon1, double lat2, double lon2) {
        final int EARTH_RADIUS_KM = 6371;
        
        double lat1Rad = Math.toRadians(lat1);
        double lat2Rad = Math.toRadians(lat2);
        double deltaLat = Math.toRadians(lat2 - lat1);
        double deltaLon = Math.toRadians(lon2 - lon1);
        
        double a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                   Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return EARTH_RADIUS_KM * c;
    }

    public Map<String, Object> getNearbyCities(double lat,  double lon, String userRegion){
        // Validate coordinates
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw new IllegalArgumentException("Invalid coordinates: lat=" + lat + ", lon=" + lon);
        }
        
        RestTemplate restTemplate = new RestTemplate();

        // Request more cities initially (20) so we have enough to filter from
        // We'll filter to only cities within 15km and return the 6 closest
        String url = "https://api.openweathermap.org/data/2.5/find"
                + "?lat=" + lat
                + "&lon=" + lon
                + "&cnt=20"  // Get more cities to filter from
                + "&radius=15000"  // 15km radius in meters - request more to filter from
                + "&units=imperial"
                + "&appid=" + GEO_CODING;

        try {
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);
            
            // Extract the list of cities
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> cities = (List<Map<String, Object>>) response.get("list");
            
            if (cities == null || cities.isEmpty()) {
                return response; // Return empty response if no cities found
            }
            
            // Calculate distance for each city and filter/sort
            List<Map<String, Object>> citiesWithDistance = cities.stream()
                .map(city -> {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> coord = (Map<String, Object>) city.get("coord");
                    if (coord == null) {
                        return null;
                    }
                    
                    double cityLat = ((Number) coord.get("lat")).doubleValue();
                    double cityLon = ((Number) coord.get("lon")).doubleValue();
                    double distance = calculateDistance(lat, lon, cityLat, cityLon);
                    
                    // Add distance to city data for sorting
                    Map<String, Object> cityWithDistance = new HashMap<>(city);
                    cityWithDistance.put("_distance", distance);
                    
                    return cityWithDistance;
                })
                .filter(city -> city != null)
                .filter(city -> {
                    // Filter to only cities within 15km (strict limit for truly nearby cities)
                    double distance = ((Number) city.get("_distance")).doubleValue();
                    return distance <= 15.0; // 15km limit
                })
                .sorted((c1, c2) -> {
                    // Sort by distance (closest first)
                    double d1 = ((Number) c1.get("_distance")).doubleValue();
                    double d2 = ((Number) c2.get("_distance")).doubleValue();
                    return Double.compare(d1, d2);
                })
                .limit(10) // Get top 10 by distance to filter by state
                .collect(Collectors.toList());
            
            // If user region is provided, filter cities to match the same state/region
            List<Map<String, Object>> filteredCities;
            if (userRegion != null && !userRegion.trim().isEmpty()) {
                System.out.println("Filtering nearby cities by region: " + userRegion);
                filteredCities = new ArrayList<>();
                int checked = 0;
                for (Map<String, Object> city : citiesWithDistance) {
                    checked++;
                    try {
                        // Get city coordinates and distance
                        @SuppressWarnings("unchecked")
                        Map<String, Object> coord = (Map<String, Object>) city.get("coord");
                        double cityLat = ((Number) coord.get("lat")).doubleValue();
                        double cityLon = ((Number) coord.get("lon")).doubleValue();
                        String cityName = (String) city.get("name");
                        double distance = ((Number) city.get("_distance")).doubleValue();
                        
                        // Fetch full city data from WeatherAPI to get accurate state/region
                        String locationQuery = cityLat + "," + cityLon;
                        WeatherDTO cityWeather = getWeather(locationQuery);
                        
                        System.out.println("City: " + cityName + ", Region: " + cityWeather.region() + ", Distance: " + distance + "km, Match: " + userRegion.equalsIgnoreCase(cityWeather.region()));
                        
                        // Check if city is in the same state/region (case-insensitive)
                        boolean regionMatches = userRegion.equalsIgnoreCase(cityWeather.region());
                        
                        // Include city if:
                        // 1. Region matches, OR
                        // 2. City is very close (within 5km) - likely in same area even if region check fails
                        if (regionMatches || distance <= 5.0) {
                            // Remove the temporary distance field
                            Map<String, Object> cleanedCity = new HashMap<>(city);
                            cleanedCity.remove("_distance");
                            filteredCities.add(cleanedCity);
                            
                            System.out.println("Added city: " + cityName + " (region match: " + regionMatches + ", distance: " + distance + "km)");
                            
                            // Stop once we have 6 cities
                            if (filteredCities.size() >= 6) {
                                break;
                            }
                        }
                    } catch (Exception e) {
                        // If we can't verify the state, but city is very close, include it anyway
                        double distance = ((Number) city.get("_distance")).doubleValue();
                        if (distance <= 5.0) {
                            System.out.println("Failed to verify state for city, but including due to proximity (" + distance + "km): " + e.getMessage());
                            Map<String, Object> cleanedCity = new HashMap<>(city);
                            cleanedCity.remove("_distance");
                            filteredCities.add(cleanedCity);
                            
                            if (filteredCities.size() >= 6) {
                                break;
                            }
                        } else {
                            System.out.println("Failed to verify state for city (too far): " + e.getMessage());
                        }
                        continue;
                    }
                    
                    // If we've checked 15 cities, break
                    if (checked >= 15) {
                        break;
                    }
                }
                System.out.println("Filtered cities count: " + filteredCities.size());
            } else {
                System.out.println("No region filter provided, returning closest cities");
                // No region filter, just take the 6 closest
                filteredCities = citiesWithDistance.stream()
                    .limit(6)
                    .map(city -> {
                        Map<String, Object> cleanedCity = new HashMap<>(city);
                        cleanedCity.remove("_distance");
                        return cleanedCity;
                    })
                    .collect(Collectors.toList());
            }
            
            // Create new response with filtered cities
            Map<String, Object> filteredResponse = new HashMap<>(response);
            filteredResponse.put("list", filteredCities);
            filteredResponse.put("count", filteredCities.size());
            
            return filteredResponse;
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch nearby cities", e);
        }
    }
}
