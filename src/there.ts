import { fetchCurrentWeather, fetchLocation, type WeatherData } from "./meteo";

const thereControls = document.getElementById("there-controls");

// THERE
const latInput = document.getElementById("lat") as HTMLInputElement;
const lonInput = document.getElementById("lon") as HTMLInputElement;

export async function fetchWeather() {
  console.log("lat lon change");
  const lat = latInput.valueAsNumber;
  const lon = lonInput.valueAsNumber;
  const weather = await fetchCurrentWeather(lat, lon);
  console.log(weather);
  updateWeatherData(weather);
}

export function updateWeatherData(data: WeatherData) {
  console.log("updating weather data");

  for (let [metric, value] of Object.entries(data)) {
    // console.log("metric:", metric, "value:", value);
    const displayValue =
      value instanceof Date
        ? value.toISOString().replace("T", " ").replace(":00.000Z", "")
        : value.toString();

    const display = document.getElementById(metric);
    if (display) {
      display.textContent = displayValue;
    }
  }
}

window.addEventListener("load", fetchWeather);

for (let input of [latInput, lonInput]) {
  input?.addEventListener("change", fetchWeather);
}

const search = document.getElementById("search") as HTMLInputElement;
search.addEventListener("change", async () => {
  console.log("location search");
  const [result] = await fetchLocation(search.value);
  console.log(result);
  latInput.value = result.latitude;
  lonInput.value = result.longitude;
  await fetchWeather();
});
