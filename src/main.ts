import "./style.css"; // Custom styles

import "./hear";
import "./there";

function setupSlider(slider: HTMLInputElement, setFn: (freq: number) => void) {
  slider.addEventListener("input", () => {
    setFn(parseFloat(slider.value));
  });
}

// setupSlider(document.querySelector<HTMLInputElement>('#freq')!, setBaseFreq);
// setupSlider(document.querySelector<HTMLInputElement>('#lfo-freq')!, setDelayFreq);
// setupSlider(document.querySelector<HTMLInputElement>('#filter-freq')!, setFilterCutoff);

// map.on('style.load', () => {
//   map.setProjection({
//     type: 'globe', // Set projection to globe
//   });
//   map.addLayer(pointsLayer);
//   // map.addLayer(customLayer);
//   map.on('click', (e) => {
//     pause();
//     console.log(e);
//   });
//   map.on('click', '3d-model', (e) => {
//     console.log(e.features);
//   });

//   // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
//   map.on('click', 'stations', async (e) => {
//     pause();
//     const features = map.querySourceFeatures('stations');
//     for (let feature of features) {
//       feature.properties.selected = false;
//     }
//     if (e.features && e.features[0]) {
//       const feature = e.features[0];
//       feature.properties.selected = true;
//       const point = feature.geometry as GeoJSON.Point;
//       console.log(feature);
//       const weather = await getWeatherAt(point.coordinates[0], point.coordinates[1]);
//       map.flyTo({
//         center: point.coordinates as LngLatLike
//       });
//       // playThere(feature);
//       if (weather) {
//         playWeather(weather);
//       }
//       else { playThere(feature); }
//     } else {
//       pause();
//     }

//   });
// });
