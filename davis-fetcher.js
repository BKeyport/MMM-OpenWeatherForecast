/* eslint-disable camelcase */
const Log = require("logger");

module.exports = {
  async fetchDavisData (config) {
    if (!config.davisUrl) {
      return null; // No local Davis URL provided, skip silently
    }

    try {
      const response = await fetch(config.davisUrl);
      if (!response.ok) {
        Log.error(`[MMM-OpenWeatherForecast] Davis local API error: ${response.status} ${response.statusText}`);
        return null;
      }

      const parsed = await response.json();
      if (parsed && parsed.data && Array.isArray(parsed.data.conditions)) {
        const conditions = parsed.data.conditions;
        const outdoor = conditions.find((c) => c.data_structure_type === 1) || {};
        const pressureObj = conditions.find((c) => c.data_structure_type === 3) || {};

        if (outdoor.temp === undefined) {
          return null;
        }

        // Return raw imperial values from the local API (temp in °F, pressure in inHg, wind in mph)
        return {
          temp_f: outdoor.temp,
          hum: outdoor.hum,
          dew_point_f: outdoor.dew_point,
          feels_like_f: outdoor.heat_index || outdoor.wind_chill || outdoor.temp,
          wind_speed_mph: outdoor.wind_speed_last,
          wind_gust_mph: outdoor.wind_speed_hi_last_10_min || null,
          wind_dir_deg: outdoor.wind_dir_last,
          pressure_inhg: pressureObj.bar_sea_level,
          uvi: outdoor.uv_index ?? null
        };
      }
      return null;
    } catch (err) {
      Log.error(`[MMM-OpenWeatherForecast] Error connecting to local Davis IP: ${err}`);
      return null;
    }
  }
};