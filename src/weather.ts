import { fetchWeatherApi } from "openmeteo";

export type WeatherData = Awaited<ReturnType<typeof fetchCurrentWeather>>;

// const HOURLY_METRICS = [
//   "sunshine_duration",
//   "is_day",
//   "uv_index",
//   "uv_index_clear_sky",
//   "wet_bulb_temperature_2m",
// ];

const CURRENT_METRICS = [
  "surface_pressure",
  "pressure_msl",
  "cloud_cover", // fire
  "weather_code",
  "is_day", // fire
  "apparent_temperature", // earth
  "relative_humidity_2m", // water
  "temperature_2m", // earth
  "precipitation", // water
  "rain", // water
  "snowfall", // water
  "showers", // water
  "wind_speed_10m", // air
  "wind_direction_10m", // air
  "wind_gusts_10m", // air
];

export async function findLocation(search = "Berlin") {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${search}&count=1`;
  const response = await fetch(url);
  const { results } = await response.json();
  return results;
}

export async function fetchCurrentWeather(lat = 52.52, lon = 13.41) {
  const url = "https://api.open-meteo.com/v1/forecast";
  const responses = await fetchWeatherApi(url, {
    latitude: lat,
    longitude: lon,
    // hourly: HOURLY_METRICS,
    current: CURRENT_METRICS,
    past_days: 0,
    forecast_days: 1,
    timeformat: "unixtime",
    timezone: "auto",
  });

  // Process first location. Add a for-loop for multiple locations or weather models
  const response = responses[0];

  // Attributes for timezone and location
  const latitude = response.latitude();
  const longitude = response.longitude();
  const elevation = response.elevation();
  const utcOffsetSeconds = response.utcOffsetSeconds();

  //  console.log(
  // `\nCoordinates: ${latitude}°N ${longitude}°E`,
  // `\nElevation: ${elevation}m asl`,
  // `\nTimezone difference to GMT+0: ${utcOffsetSeconds}s`,
  //  );

  const current = response.current()!;
  // const hourly = response.hourly()!;

  // Note: The order of weather variables in the URL query and the indices below need to match!
  const weatherData = {
    longitude,
    latitude,
    elevation,
    // current: {
    time: new Date((Number(current.time()) + utcOffsetSeconds) * 1000),
    surface_pressure: current.variables(0)!.value(),
    pressure_msl: current.variables(1)!.value(),
    cloud_cover: current.variables(2)!.value(),
    weather_code: current.variables(3)!.value(),
    is_day: current.variables(4)!.value(),
    apparent_temperature: current.variables(5)!.value(),
    relative_humidity_2m: current.variables(6)!.value(),
    temperature_2m: current.variables(7)!.value(),
    precipitation: current.variables(8)!.value(),
    rain: current.variables(9)!.value(),
    snowfall: current.variables(10)!.value(),
    showers: current.variables(11)!.value(),
    wind_speed_10m: current.variables(12)!.value(),
    wind_direction_10m: current.variables(13)!.value(),
    wind_gusts_10m: current.variables(14)!.value(),
    // },
    // hourly: {
    //   time: Array.from(
    //     {
    //       length:
    //         (Number(hourly.timeEnd()) - Number(hourly.time())) /
    //         hourly.interval(),
    //     },
    //     (_, i) =>
    //       new Date(
    //         (Number(hourly.time()) + i * hourly.interval() + utcOffsetSeconds) *
    //           1000,
    //       ),
    //   ),
    //   sunshine_duration: hourly.variables(0)!.valuesArray(),
    //   is_day: hourly.variables(1)!.valuesArray(),
    //   uv_index: hourly.variables(2)!.valuesArray(),
    //   uv_index_clear_sky: hourly.variables(3)!.valuesArray(),
    //   wet_bulb_temperature_2m: hourly.variables(4)!.valuesArray(),
    // },
  };

  return weatherData;
}
