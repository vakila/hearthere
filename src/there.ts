import { fetchCurrentWeather, findLocation, type WeatherData } from "./weather";
import { updateMap } from "./globe";
import { updateWeatherData as updateVoiceWeatherData } from "./voices";

const latInput = document.getElementById("lat") as HTMLInputElement;
const lonInput = document.getElementById("lon") as HTMLInputElement;

export async function updateLocation() {
  const lat = latInput.valueAsNumber;
  const lon = lonInput.valueAsNumber;
  const weather = await fetchCurrentWeather(lat, lon);
  console.log(weather);
  updateWeatherData(weather);
  updateMap(lat, lon);
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
        : typeof value === "number"
          ? (Math.trunc(value * 100) / 100).toFixed(2)
          : value.toString();

    updateDataValue(metric, displayValue);
  }
  updateVoiceWeatherData(data);
}

window.addEventListener("load", updateLocation);

for (let input of [latInput, lonInput]) {
  input?.addEventListener("change", updateLocation);
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
  const results = await findLocation(search.value);
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
  await updateLocation();
});
