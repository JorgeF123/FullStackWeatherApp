package com.WeatherDashboard.WeatherDashboard.repository;

import com.WeatherDashboard.WeatherDashboard.entity.SavedCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SavedCityRepository extends JpaRepository<SavedCity, Long> {
    Optional<SavedCity> findByCityNameIgnoreCase(String cityName);
}

