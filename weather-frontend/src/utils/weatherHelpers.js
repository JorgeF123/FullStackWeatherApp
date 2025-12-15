/**
 * Normalize condition text to consistent format (Title Case)
 */
export function normalizeCondition(condition) {
  if (!condition) return "Unknown";
  // Convert to title case: "clear sky" -> "Clear Sky"
  return condition
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Get weather icon filename based on condition
 */
export function getWeatherIcon(condition) {
    if (!condition) return "clear";
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return "sunny";
    if (c.includes("cloud")) return "cloudy";
    if (c.includes("rain")) return "rain";
    return "clear";
  }
  
  /**
   * Get background CSS class based on weather condition
   */
  export function getBackgroundClass(condition) {
    if (!condition) return "bg-default";
    const c = condition.toLowerCase();
    if (c.includes("sun") || c.includes("clear")) return "bg-sunny";
    if (c.includes("cloud")) return "bg-cloudy";
    if (c.includes("rain")) return "bg-rainy";
    return "bg-default";
  }