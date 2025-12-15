package com.WeatherDashboard.WeatherDashboard;

import com.WeatherDashboard.WeatherDashboard.dto.WeatherDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class WeatherServiceTest {

    @Mock
    private RestTemplate restTemplate;

    @InjectMocks
    private WeatherService weatherService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(weatherService, "API_KEY", "test-api-key");
        ReflectionTestUtils.setField(weatherService, "GEO_CODING", "test-geo-key");
    }

    @Test
    void testGetWeather_Success() {
        // Arrange
        Map<String, Object> mockResponse = new HashMap<>();
        Map<String, Object> location = new HashMap<>();
        location.put("name", "London");
        location.put("region", "England");
        location.put("country", "United Kingdom");
        location.put("lat", 51.5074);
        location.put("lon", -0.1278);
        
        Map<String, Object> condition = new HashMap<>();
        condition.put("text", "Sunny");
        
        Map<String, Object> current = new HashMap<>();
        current.put("temp_f", 68.0);
        current.put("temp_c", 20.0);
        current.put("humidity", 65);
        current.put("wind_mph", 10.5);
        current.put("condition", condition);
        
        mockResponse.put("location", location);
        mockResponse.put("current", current);

        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenReturn(mockResponse);

        // Act
        WeatherDTO result = weatherService.getWeather("London");

        // Assert
        assertNotNull(result);
        assertEquals("London", result.city());
        assertEquals("England", result.region());
        assertEquals(68.0, result.tempF());
        assertEquals(20.0, result.tempC());
        assertEquals("Sunny", result.condition());
        assertEquals(65, result.humidity());
        assertEquals(10.5, result.windMph());
        assertEquals(51.5074, result.lat());
        assertEquals(-0.1278, result.lon());
    }

    @Test
    void testGetWeather_ThrowsException_WhenApiFails() {
        // Arrange
        when(restTemplate.getForObject(anyString(), eq(Map.class)))
                .thenThrow(new RuntimeException("API Error"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            weatherService.getWeather("InvalidCity");
        });
    }
}

