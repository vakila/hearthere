import { fetchCurrentWeather, fetchLocation, type WeatherData } from "./meteo";
import { map } from "./globe";

const latInput = document.getElementById("lat") as HTMLInputElement;
const lonInput = document.getElementById("lon") as HTMLInputElement;

export async function fetchWeather() {
  const lat = latInput.valueAsNumber;
  const lon = lonInput.valueAsNumber;
  const weather = await fetchCurrentWeather(lat, lon);
  console.log(weather);
  updateWeatherData(weather);
  map.easeTo({ center: [lon, lat] });
}

export function updateDataValue(elementId: string, value: string | number) {
  const container = document.getElementById(elementId);
  if (container) {
    const valueEl = container.querySelector<HTMLElement>(".data-value");
    if (valueEl) {
      valueEl.textContent = String(value);
    }
  }
  const overlayContainer = document.getElementById(`${elementId}-overlay`);
  if (overlayContainer) {
    const overlayValueEl =
      overlayContainer.querySelector<HTMLElement>(".data-value");
    if (overlayValueEl) {
      overlayValueEl.textContent = String(value);
    }
  }
}

export function updateWeatherData(data: WeatherData) {
  for (let [metric, value] of Object.entries(data)) {
    const displayValue =
      value instanceof Date
        ? value.toISOString().replace("T", " ").replace(":00.000Z", "")
        : value.toString();

    updateDataValue(metric, displayValue);
  }
}

window.addEventListener("load", fetchWeather);

for (let input of [latInput, lonInput]) {
  input?.addEventListener("change", fetchWeather);
}

function clearWeatherData() {
  const dataItems = document.querySelectorAll<HTMLElement>(".data-value");
  dataItems.forEach((item) => {
    item.textContent = "--";
  });
}

const search = document.getElementById("search") as HTMLInputElement;
search.addEventListener("change", async () => {
  console.log("location search");
  const results = await fetchLocation(search.value);
  console.log(results);
  if (!results || results.length === 0) {
    latInput.value = "";
    lonInput.value = "";
    clearWeatherData();
    return;
  }
  const [result] = results;
  latInput.value = result.latitude;
  lonInput.value = result.longitude;
  await fetchWeather();
});
