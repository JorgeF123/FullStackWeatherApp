package com.WeatherDashboard.WeatherDashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record WeatherDTO(
        @JsonProperty("name") String city,
        String region,
        String country,
        @JsonProperty("temp_f") double tempF,
        @JsonProperty("temp_c") double tempC,
        String condition,
        int humidity,
        @JsonProperty("wind_mph") double windMph,
        @JsonProperty("lat") double lat,
        @JsonProperty("lon") double lon
) {}

