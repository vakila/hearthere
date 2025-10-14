import './style.css'
import { play, pause, setBaseFreq, setDelayFreq, setFilterCutoff } from './synth';
import { map, customLayer } from './globe';


function setupButton(button: HTMLButtonElement) {
  let playing = false;
  button.innerText = 'play';
  const togglePlaying = () => {
    playing = !playing;
    if (playing) {
      play();
      button.innerText = 'pause';
    } else {
      pause();
      button.innerText = 'play';
    }
  }
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
  map.addLayer(customLayer);
});