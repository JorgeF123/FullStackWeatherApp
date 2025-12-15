# Security Configuration Guide

This application requires API keys and database credentials to run. **Never commit sensitive information to version control.**

## Setup Instructions

### Option 1: Using application-local.properties (Recommended for Local Development)

1. Copy the example file:
   ```bash
   cp src/main/resources/application.properties.example src/main/resources/application-local.properties
   ```

2. Edit `application-local.properties` and fill in your actual values:
   - Database password
   - WeatherAPI key (get from https://www.weatherapi.com/)
   - OpenWeatherMap key (get from https://openweathermap.org/api)

3. Run the application with the local profile:
   ```bash
   mvn spring-boot:run -Dspring-boot.run.profiles=local
   ```

   Or in your IDE, set the active profile to `local`.

### Option 2: Using Environment Variables (Recommended for Production)

Set the following environment variables before running the application:

**macOS/Linux:**
```bash
export DB_URL=jdbc:postgresql://localhost:5432/weatherdb
export DB_USERNAME=postgres
export DB_PASSWORD=your_password_here
export WEATHER_API_KEY=your_weather_api_key
export OPENWEATHER_API_KEY=your_openweather_key
```

**Windows (PowerShell):**
```powershell
$env:DB_URL="jdbc:postgresql://localhost:5432/weatherdb"
$env:DB_USERNAME="postgres"
$env:DB_PASSWORD="your_password_here"
$env:WEATHER_API_KEY="your_weather_api_key"
$env:OPENWEATHER_API_KEY="your_openweather_key"
```

**Windows (Command Prompt):**
```cmd
set DB_URL=jdbc:postgresql://localhost:5432/weatherdb
set DB_USERNAME=postgres
set DB_PASSWORD=your_password_here
set WEATHER_API_KEY=your_weather_api_key
set OPENWEATHER_API_KEY=your_openweather_key
```

Then run:
```bash
mvn spring-boot:run
```

## Required Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DB_PASSWORD` | PostgreSQL database password | Yes |
| `DB_URL` | Database connection URL | No (has default) |
| `DB_USERNAME` | Database username | No (has default: postgres) |
| `WEATHER_API_KEY` | WeatherAPI.com API key | Yes |
| `OPENWEATHER_API_KEY` | OpenWeatherMap API key | Yes |

## Production Deployment

For production environments, use your platform's secrets management:

- **Heroku**: `heroku config:set KEY=value`
- **AWS**: Use AWS Secrets Manager or Parameter Store
- **Docker**: Use environment variables in `docker-compose.yml` or `.env` file
- **Kubernetes**: Use Kubernetes Secrets
- **Azure**: Use Azure Key Vault
- **GCP**: Use Secret Manager

## Security Best Practices

1. ✅ **Never commit** `application-local.properties` to git
2. ✅ **Never commit** `.env` files to git
3. ✅ **Rotate keys** if they are accidentally exposed
4. ✅ **Use different keys** for development and production
5. ✅ **Limit API key permissions** when possible
6. ✅ **Monitor API usage** for suspicious activity

## Verifying Configuration

If keys are missing, the application will fail to start with clear error messages indicating which environment variables are required.

