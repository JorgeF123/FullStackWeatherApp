export default function NearbyCities({ 
    nearbyCities, 
    selectedCity, 
    onCitySelect, 
    loading 
  }) {
    return (
      <div className="nearby-section">
        <h2 className="section-title">
          <svg className="section-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
          Nearby Cities
        </h2>
        
        {loading && nearbyCities.length === 0 ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="city-list">
            {nearbyCities.map((city, i) => {
              // Create a unique key from city properties
              const cityKey = city.id || `${city.name}-${city.coord?.lat || city.lat}-${city.coord?.lon || city.lon}` || `city-${i}`;
              
              return (
                <div
                  key={cityKey}
                  className={`city-item ${selectedCity?.name === city.name ? "active" : ""}`}
                  onClick={() => onCitySelect(city)}
                >
                  <div className="city-info">
                    <strong className="city-name">{city.name}</strong>
                    <p className="city-condition">
                      {city.weather?.[0]?.description 
                        ? city.weather[0].description
                            .toLowerCase()
                            .split(' ')
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(' ')
                        : "Unknown"}
                    </p>
                  </div>
                  <div className="city-temp">
                    {Math.round(city.main?.temp || 0)}°
                  </div>
                </div>
              );
            })}
            {nearbyCities.length === 0 && !loading && (
              <p className="empty-state">No nearby cities found</p>
            )}
          </div>
        )}
      </div>
    );
  }