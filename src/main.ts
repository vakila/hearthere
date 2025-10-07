import './style.css'
import { play, pause } from './synth';


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


setupButton(document.querySelector<HTMLButtonElement>('#playpause')!)
