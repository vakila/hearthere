import './style.css'
import { play, pause, setFreq } from './synth';


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

function setupSlider(slider: HTMLInputElement) {
  slider.addEventListener('input', () => {

    setFreq(parseFloat(slider.value));
  });
}


setupButton(document.querySelector<HTMLButtonElement>('#playpause')!);
setupSlider(document.querySelector<HTMLInputElement>('#freq')!);
