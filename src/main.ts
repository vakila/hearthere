import './style.css'
import { play, pause, setBaseFreq, setDelayFreq, setFilterCutoff, playStation } from './synth';
import { map, customLayer, pointsLayer } from './globe';
import type { LngLatLike } from 'maplibre-gl';


let playing = false;
const togglePlaying = (button?: HTMLButtonElement) => {
  playing = !playing;
  if (playing) {
    play();
    if (button) button.innerText = 'pause';
  } else {
    pause();
    if (button) button.innerText = 'play';
  }
}
function setupButton(button: HTMLButtonElement) {
  button.innerText = 'play';
  button.addEventListener('click', () => togglePlaying())
}

function setupSlider(slider: HTMLInputElement, setFn: (freq: number) => void) {
  slider.addEventListener('input', () => {

    setFn(parseFloat(slider.value));
  });
}


setupButton(document.querySelector<HTMLButtonElement>('#playpause')!);
setupSlider(document.querySelector<HTMLInputElement>('#freq')!, setBaseFreq);
setupSlider(document.querySelector<HTMLInputElement>('#lfo-freq')!, setDelayFreq);
setupSlider(document.querySelector<HTMLInputElement>('#filter-freq')!, setFilterCutoff);



map.on('style.load', () => {
  map.setProjection({
    type: 'globe', // Set projection to globe
  });
  map.addLayer(pointsLayer);
  // map.addLayer(customLayer);
  map.on('click', (e) => {
    pause();
    console.log(e);
  });
  map.on('click', '3d-model', (e) => {
    console.log(e.features);
  });

  // Center the map on the coordinates of any clicked symbol from the 'symbols' layer.
  map.on('click', 'stations', (e) => {
    pause();
    const features = map.querySourceFeatures('stations');
    for (let feature of features) {
      feature.properties.selected = false;
    }
    if (e.features && e.features[0]) {
      const feature = e.features[0];
      feature.properties.selected = true;
      const point = feature.geometry as GeoJSON.Point;
      console.log(feature);
      map.flyTo({
        center: point.coordinates as LngLatLike
      });
      playStation(feature);
    } else {
      pause();
    }

  });
});

