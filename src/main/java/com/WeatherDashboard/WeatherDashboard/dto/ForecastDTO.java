package com.WeatherDashboard.WeatherDashboard.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public record ForecastDTO(
        @JsonProperty("name") String city,
        String region,
        String country,
        @JsonProperty("lat") double lat,
        @JsonProperty("lon") double lon,
        List<ForecastDay> forecast
) {
    public record ForecastDay(
            String date,
            @JsonProperty("day") DayForecast day,
            @JsonProperty("hour") List<HourForecast> hours
    ) {}

    public record DayForecast(
            @JsonProperty("maxtemp_f") double maxTempF,
            @JsonProperty("maxtemp_c") double maxTempC,
            @JsonProperty("mintemp_f") double minTempF,
            @JsonProperty("mintemp_c") double minTempC,
            @JsonProperty("avgtemp_f") double avgTempF,
            @JsonProperty("avgtemp_c") double avgTempC,
            @JsonProperty("maxwind_mph") double maxWindMph,
            @JsonProperty("totalprecip_in") double totalPrecipIn,
            @JsonProperty("totalprecip_mm") double totalPrecipMm,
            @JsonProperty("avghumidity") int avgHumidity,
            @JsonProperty("condition") Condition condition,
            @JsonProperty("daily_chance_of_rain") int chanceOfRain,
            @JsonProperty("daily_chance_of_snow") int chanceOfSnow
    ) {}

    public record HourForecast(
            String time,
            @JsonProperty("temp_f") double tempF,
            @JsonProperty("temp_c") double tempC,
            @JsonProperty("condition") Condition condition,
            @JsonProperty("wind_mph") double windMph,
            @JsonProperty("humidity") int humidity,
            @JsonProperty("chance_of_rain") int chanceOfRain,
            @JsonProperty("chance_of_snow") int chanceOfSnow
    ) {}

    public record Condition(
            String text,
            String icon,
            int code
    ) {}
}

