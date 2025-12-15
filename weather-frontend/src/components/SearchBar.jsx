export default function SearchBar({ 
    searchInput, 
    onSearchChange, 
    onSearch, 
    loading 
  }) {
    return (
      <div className="search-container">
        <div className="search-wrapper">
          <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            className="search-input"
            type="text"
            placeholder="Search city..."
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                onSearch();
              }
            }}
            autoComplete="off"
          />
          {searchInput && (
            <button
              className="search-clear"
              onClick={() => onSearchChange("")}
              aria-label="Clear search"
            >
              ×
            </button>
          )}
        </div>
        <button
          className="search-button"
          onClick={() => onSearch()}
          disabled={loading || !searchInput.trim()}
          aria-label="Search for weather"
        >
          {loading ? "..." : "Search"}
        </button>
      </div>
    );
  }