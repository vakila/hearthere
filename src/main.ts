import './style.css'
import { play } from './synth';
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'


function setupButton(button: HTMLButtonElement) {
  let playing = false;
  const togglePlaying = () => {
    playing = !playing;
    console.log(`now ${playing ? 'playing' : 'paused'}`);
    if (playing) {
      play();
    }
  }
  button.addEventListener('click', () => togglePlaying())
}


setupButton(document.querySelector<HTMLButtonElement>('#playpause')!)
