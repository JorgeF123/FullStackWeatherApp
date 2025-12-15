# Weather Dashboard

A full-stack weather application built with Spring Boot and React, featuring real-time weather data, geolocation-based city discovery, and a modern, responsive UI.

![Tech Stack](https://img.shields.io/badge/Java-21-orange)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.8-brightgreen)
![React](https://img.shields.io/badge/React-19.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-7.2.4-purple)

## Features

- 🌤️ **Real-time Weather Data** - Get current weather conditions for any city worldwide with detailed metrics (temperature, humidity, wind speed)
- 📍 **Geolocation Support** - Automatically detect user location and show weather for your current area
- 🔍 **City Search** - Search for weather by city name with instant results
- 🗺️ **Nearby Cities** - Discover weather for cities within 15km of your location, filtered by state/region to ensure accuracy
- 💾 **Save Favorite Cities** - Save cities to your favorites list for quick access
- 🗑️ **Manage Saved Cities** - View, select, and delete saved cities with real-time weather updates
- 📱 **Responsive Design** - Beautiful, modern UI with glassmorphism effects that works on all devices
- 🎨 **Dynamic Backgrounds** - UI adapts based on weather conditions (sunny, cloudy, rainy)
- ✅ **Smart City Selection** - Uses coordinates to ensure correct city selection, preventing confusion with cities that share the same name

## Tech Stack

### Backend
- **Java 21** - Modern Java features
- **Spring Boot 3.5.8** - RESTful API framework
- **Spring Data JPA** - Database integration for saved cities
- **PostgreSQL** - Database for persisting saved cities
- **Hibernate** - ORM for database operations

### Frontend
- **React 19.2.0** - UI library
- **Vite 7.2.4** - Build tool and dev server
- **Tailwind CSS 3.4.3** - Utility-first CSS framework
- **Modern ES6+** - Latest JavaScript features

### APIs
- **WeatherAPI.com** - Primary weather data source (current conditions, temperature, humidity, wind)
- **OpenWeatherMap** - Nearby cities discovery and geocoding (with state/region filtering)

## Prerequisites

- **Java 21** or higher
- **Node.js 18+** and npm
- **PostgreSQL** - Required for saved cities functionality
- **API keys** from:
  - [WeatherAPI.com](https://www.weatherapi.com/) - Free tier available
  - [OpenWeatherMap](https://openweathermap.org/api) - Free tier available

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/JorgeF123/FullStackWeatherApp.git
cd FullStackWeatherApp
```

### 2. Backend Setup

1. Navigate to the project root (where `pom.xml` is located)

2. Create `src/main/resources/application-local.properties` (or use environment variables):
```properties
spring.application.name=WeatherDashboard

# Database Configuration - REQUIRED for saved cities
spring.datasource.url=jdbc:postgresql://localhost:5432/weatherdb
spring.datasource.username=postgres
spring.datasource.password=your_password

spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=false

# API Keys - REQUIRED
weatherapi.key=YOUR_WEATHER_API_KEY
openweather.key=YOUR_OPENWEATHER_API_KEY
```

**Note:** Create the PostgreSQL database first:
```sql
CREATE DATABASE weatherdb;
```

**OR** set environment variables:
```bash
export WEATHER_API_KEY=your_key_here
export OPENWEATHER_API_KEY=your_key_here
export DB_PASSWORD=your_db_password  # optional
```

3. Build and run:

**Mac/Linux:**
```bash
./mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Windows:**
```bash
mvnw spring-boot:run -Dspring-boot.run.profiles=local
```

**Note:** The `local` profile loads configuration from `application-local.properties`. Make sure you've created this file with your database credentials and API keys.

The backend will start on `http://localhost:8080`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd weather-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, defaults to localhost):
```env
VITE_API_URL=http://localhost:8080
```

4. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173` (or another port if 5173 is busy)

### 4. Build for Production

**Backend:**
```bash
./mvnw clean package
java -jar target/WeatherDashboard-0.0.1-SNAPSHOT.jar
```

**Frontend:**
```bash
cd weather-frontend
npm run build
```

The built files will be in `weather-frontend/dist/`

## API Endpoints

### GET `/weather`
Get weather data for a city by name.

**Query Parameters:**
- `city` (required) - City name (e.g., "London", "New York")

**Example:**
```
GET /weather?city=London
```

### GET `/weather/coords`
Get weather data by coordinates.

**Query Parameters:**
- `lat` (required) - Latitude
- `lon` (required) - Longitude

**Example:**
```
GET /weather/coords?lat=51.5074&lon=-0.1278
```

### GET `/weather/nearby`
Get nearby cities within 15km, filtered by state/region.

**Query Parameters:**
- `lat` (required) - Latitude
- `lon` (required) - Longitude
- `region` (optional) - State/region to filter cities (e.g., "California")

**Example:**
```
GET /weather/nearby?lat=37.7749&lon=-122.4194&region=California
```

### POST `/saved-cities`
Save a city to favorites.

**Request Body:**
```json
{
  "cityName": "San Francisco",
  "lat": 37.7749,
  "lon": -122.4194
}
```

### GET `/saved-cities`
Get all saved cities with current weather data.

**Response:**
```json
[
  {
    "id": 1,
    "name": "San Francisco",
    "region": "California",
    "temp_f": 65.0,
    "condition": "Partly Cloudy",
    "humidity": 70,
    "wind_mph": 10.5,
    "lat": 37.7749,
    "lon": -122.4194
  }
]
```

### DELETE `/saved-cities/{id}`
Delete a saved city by ID.

**Example:**
```
DELETE /saved-cities/1
```

## Project Structure

```
WeatherDashboard/
├── src/
│   └── main/
│       ├── java/com/WeatherDashboard/WeatherDashboard/
│       │   ├── controller/
│       │   │   ├── WeatherController.java      # Weather API endpoints
│       │   │   └── SavedCityController.java    # Saved cities CRUD endpoints
│       │   ├── service/
│       │   │   └── SavedCityService.java       # Saved cities business logic
│       │   ├── entity/
│       │   │   └── SavedCity.java              # SavedCity JPA entity
│       │   ├── repository/
│       │   │   └── SavedCityRepository.java    # Database repository
│       │   ├── dto/
│       │   │   └── WeatherDTO.java             # Weather data transfer object
│       │   ├── WeatherService.java             # Weather API integration
│       │   ├── CorsConfig.java                 # CORS configuration
│       │   └── WeatherDashboardApplication.java # Main application class
│       └── resources/
│           ├── application.properties          # Default config
│           └── application-local.properties    # Local config (gitignored)
├── weather-frontend/
│   ├── src/
│   │   ├── components/                        # React components
│   │   │   ├── SearchBar.jsx                  # City search input
│   │   │   ├── WeatherDisplay.jsx             # Main weather display
│   │   │   ├── NearbyCities.jsx               # Nearby cities list
│   │   │   └── SavedCities.jsx                # Saved cities cards
│   │   ├── services/
│   │   │   └── weatherApi.js                  # API service layer
│   │   ├── utils/
│   │   │   └── weatherHelpers.js              # Icon/background helpers
│   │   └── App.jsx                            # Main app component
│   └── public/
│       └── icons/                             # Weather condition icons
└── pom.xml                                    # Maven configuration
```

## Environment Variables

### Backend
- `WEATHER_API_KEY` - WeatherAPI.com API key
- `OPENWEATHER_API_KEY` - OpenWeatherMap API key
- `DB_URL` - Database URL (optional)
- `DB_USERNAME` - Database username (optional)
- `DB_PASSWORD` - Database password (optional)

### Frontend
- `VITE_API_URL` - Backend API URL (defaults to `http://localhost:8080`)

## Security Notes

- ⚠️ **Never commit API keys or sensitive data to version control**
- Use `application-local.properties` (gitignored) or environment variables
- CORS is configured for development; restrict origins in production

## Key Features & Implementation Details

### Smart City Selection
- Uses coordinates instead of city names to prevent selecting wrong cities with same names
- Nearby cities are filtered by state/region to show only cities in your area
- Distance-based filtering (15km radius) ensures truly nearby results

### Saved Cities
- Persistent storage in PostgreSQL database
- Real-time weather updates for all saved cities
- Coordinate-based storage ensures correct city identification

### State/Region Filtering
- Nearby cities API filters results by your current state/region
- Prevents showing cities from other states with the same name
- Uses WeatherAPI to verify each city's state before displaying

## Future Enhancements

- [ ] Weather forecasts (7-day, hourly)
- [ ] Historical weather data
- [ ] Weather data caching
- [ ] User authentication and personal saved cities
- [ ] Unit and integration tests
- [ ] Docker containerization
- [ ] CI/CD pipeline
- [ ] Weather alerts and notifications

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Troubleshooting

### Nearby cities showing wrong states
- Ensure your location permissions are enabled
- The app uses coordinates to fetch weather, so geolocation must be accurate
- Nearby cities are filtered by state - if you see wrong states, check browser console for region detection

### Saved cities showing incorrect data
- Saved cities use coordinates to fetch weather - ensure coordinates were saved correctly
- Delete and re-save cities if they show wrong information
- Check database connection if saved cities aren't persisting

### API Errors
- Verify API keys are set correctly in `application-local.properties` or environment variables
- Check API key quotas/limits on WeatherAPI.com and OpenWeatherMap
- Ensure database is running if using saved cities feature

## Acknowledgments

- WeatherAPI.com for weather data
- OpenWeatherMap for geocoding services

