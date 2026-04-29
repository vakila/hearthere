import { fetchWeatherApi } from "openmeteo";

const params = {
  current: [
    "temperature_2m",
    "relative_humidity_2m",
    "wind_speed_10m",
    "is_day",
    "precipitation",
    "cloud_cover",
    "wind_gusts_10m",
    "wind_direction_10m",
    "apparent_temperature",
    "weather_code",
    "surface_pressure",
  ],
  past_days: 0,
  forecast_days: 7,
  timeformat: "unixtime",
};
const url = "https://api.open-meteo.com/v1/forecast";

export async function fetchLatLon(latitude = 52.52, longitude = 13.41) {
  const responses = await fetchWeatherApi(url, {
    latitude,
    longitude,
    ...params,
  });

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  console.log(
    `\nCoordinates: ${latitude}°N ${longitude}°E`,
    `\nElevation: ${elevation}m asl`,
    `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
  );

  const data = response.current();
  if (!data) throw new Error("No current weather data found");

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const current = {
    time: new Date((Number(data.time()) + utcOffsetSeconds) * 1000),
    temperature_2m: data.variables(0)!.value(),
    relative_humidity_2m: data.variables(1)!.value(),
    wind_speed_10m: data.variables(2)!.value(),
    is_day: data.variables(3)!.value(),
    precipitation: data.variables(4)!.value(),
    cloud_cover: data.variables(5)!.value(),
    wind_gusts_10m: data.variables(6)!.value(),
    wind_direction_10m: data.variables(7)!.value(),
    apparent_temperature: data.variables(8)!.value(),
    weather_code: data.variables(9)!.value(),
    surface_pressure: data.variables(10)!.value(),
  };

  // The 'current' object now contains a simple structure, with arrays of datetimes and weather information
  console.log(
    `\nCurrent time: ${current.time}\n`,
    `\nCurrent temperature_2m: ${current.temperature_2m}`,
    `\nCurrent relative_humidity_2m: ${current.relative_humidity_2m}`,
    `\nCurrent wind_speed_10m: ${current.wind_speed_10m}`,
    `\nCurrent is_day: ${current.is_day}`,
    `\nCurrent precipitation: ${current.precipitation}`,
    `\nCurrent cloud_cover: ${current.cloud_cover}`,
    `\nCurrent wind_gusts_10m: ${current.wind_gusts_10m}`,
    `\nCurrent wind_direction_10m: ${current.wind_direction_10m}`,
    `\nCurrent apparent_temperature: ${current.apparent_temperature}`,
    `\nCurrent weather_code: ${current.weather_code}`,
    `\nCurrent surface_pressure: ${current.surface_pressure}`,
  );

  return current;
}
