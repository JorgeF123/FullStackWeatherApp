import { useState, useEffect } from "react";

export default function Weather() {
  const [city, setCity] = useState("");
  const [weather, setWeather] = useState(null);
  const [nearby, setNearby] = useState([]);
  const [error, setError] = useState("");

  // 🎯 Helper: normalize any weather object into the shape your UI expects
  const normalizeWeather = (data) => {
    if (!data || typeof data !== "object") return data;

    // If backend already returns normalized WeatherAPI shape, just use it
    if ("temp_f" in data && "condition" in data) {
      return data;
    }

    // If the backend ever sends OpenWeather-style data directly
    if (data.main) {
      const tempF = data.main.temp;
      const tempC = typeof tempF === "number"
        ? ((tempF - 32) * 5) / 9
        : null;

      const weatherArr = data.weather || [];
      const conditionText =
        (weatherArr[0] && weatherArr[0].description) ||
        data.condition ||
        "";

      return {
        city: data.name || data.city || "",
        region: data.region || "",
        country: (data.sys && data.sys.country) || data.country || "",
        temp_f: tempF,
        temp_c: tempC,
        condition: conditionText,
        humidity: data.main.humidity,
        wind_mph: data.wind?.speed,
      };
    }

    // fallback – don’t crash
    return data;
  };

  const getWeather = async () => {
    setError("");
    setWeather(null);
    try {
      const response = await fetch(`http://localhost:8080/weather?city=${city}`);
      const data = await response.json();

      if (data.error) {
        setError("City not found.");
        return;
      }

      setWeather(normalizeWeather(data));
    } catch (err) {
      setError("Could not connect to server.");
    }
  };

  // 🌍 Fetch weather by coordinates
  const getWeatherByCoords = async (lat, lon) => {
    try {
      const response = await fetch(
        `http://localhost:8080/weather/coords?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();
      setWeather(normalizeWeather(data));
    } catch (err) {
      console.log("Failed to load GPS weather.", err);
    }
  };

  // 🌎 Fetch nearby cities (FRONTEND fix only)
  const getNearbyCities = async (lat, lon) => {
    try {
      const response = await fetch(
        `http://localhost:8080/weather/nearby?lat=${lat}&lon=${lon}`
      );
      const data = await response.json();

      console.log("NEARBY RAW:", data);

      // Handle both shapes: raw OpenWeather OR already-cleaned
      const list = data.cities || data.list || [];

      const cleaned = list.map((item) => {
        // OpenWeather style: { name, main: { temp }, coord: { lat, lon } }
        const main = item.main || {};
        const coord = item.coord || {};

        return {
          name: item.name || item.city || "Unknown",
          temp:
            item.temp ??
            main.temp ?? // from OpenWeather
            null,
          lat: item.lat ?? coord.lat,
          lon: item.lon ?? coord.lon,
        };
      });

      setNearby(cleaned);
    } catch (err) {
      console.log("Nearby city fetch failed.", err);
    }
  };

  // 📍 Auto-load GPS weather when app starts
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;

        getWeatherByCoords(lat, lon);
        getNearbyCities(lat, lon);
      },
      (err) => {
        console.log("User denied location permission.", err);
      }
    );
  }, []);

  const getGradient = (condition) => {
    if (!condition) return "from-blue-500 to-indigo-600";

    const c = condition.toLowerCase();
    if (c.includes("sun")) return "from-yellow-400 to-orange-500";
    if (c.includes("cloud")) return "from-gray-400 to-gray-600";
    if (c.includes("rain")) return "from-blue-700 to-blue-900";
    if (c.includes("clear")) return "from-sky-400 to-blue-600";

    return "from-blue-500 to-indigo-700";
  };

  // Safely pull temps for display (avoid NaN)
  const displayTempF =
    weather && typeof weather.temp_f === "number"
      ? Math.round(weather.temp_f)
      : null;

  const displayTempC =
    weather && typeof weather.temp_c === "number"
      ? Math.round(weather.temp_c)
      : null;

  return (
    <div
      className={`min-h-screen w-full flex flex-col items-center px-6 py-10 text-white transition-all duration-500 bg-gradient-to-br ${getGradient(
        weather?.condition
      )}`}
    >
      <h1 className="text-4xl font-semibold mt-4 tracking-wide drop-shadow-lg">
        Weather
      </h1>

      {/* Search Bar */}
      <div className="mt-6 w-full max-w-md flex gap-3">
        <input
          type="text"
          placeholder="Search city…"
          className="flex-1 p-3 rounded-2xl text-black shadow-lg outline-none"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={getWeather}
          className="px-6 py-3 bg-white text-blue-700 rounded-2xl font-semibold shadow hover:bg-gray-200"
        >
          Go
        </button>
      </div>

      {error && <p className="mt-4 text-red-200 font-semibold">{error}</p>}

      {/* Main Weather */}
      {weather && (
        <div className="mt-12 max-w-md w-full flex flex-col items-center">
          <div className="text-7xl font-bold drop-shadow-lg">
            {displayTempF !== null ? `${displayTempF}°` : "--"}
          </div>

          <div className="text-2xl mt-2 capitalize tracking-wide opacity-90">
            {weather.condition}
          </div>

          <div className="text-lg opacity-80 mt-1">
            {weather.city}, {weather.region}
          </div>

          {/* Glassmorphism Weather Info */}
          <div className="mt-10 w-full bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
            <div className="grid grid-cols-2 gap-6 text-lg">
              <div>
                <p className="opacity-80">Humidity</p>
                <p className="font-semibold">
                  {weather.humidity != null ? `${weather.humidity}%` : "--"}
                </p>
              </div>
              <div>
                <p className="opacity-80">Wind</p>
                <p className="font-semibold">
                  {weather.wind_mph != null ? `${weather.wind_mph} mph` : "--"}
                </p>
              </div>
              <div>
                <p className="opacity-80">Temp °C</p>
                <p className="font-semibold">
                  {displayTempC !== null ? `${displayTempC}°` : "--"}
                </p>
              </div>
              <div>
                <p className="opacity-80">Country</p>
                <p className="font-semibold">{weather.country}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🌎 Nearby Cities */}
      {nearby.length > 0 && (
        <div className="mt-12 w-full max-w-md bg-white/20 backdrop-blur-xl rounded-3xl p-6 shadow-xl">
          <h2 className="text-2xl font-semibold mb-4">Nearby Cities</h2>

          <div className="space-y-3">
            {nearby.map((c, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (c.lat != null && c.lon != null) {
                    setCity(c.name);
                    getWeatherByCoords(c.lat, c.lon);
                  } else {
                    // fallback: just search by city name if coords missing
                    setCity(c.name);
                    getWeather();
                  }
                }}
                className="flex justify-between text-xl w-full text-left hover:bg-white/30 p-2 rounded-xl transition"
              >
                <span>{c.name}</span>
                <span>
                  {typeof c.temp === "number"
                    ? `${Math.round(c.temp)}°`
                    : "--"}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
