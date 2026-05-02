import { Tone, initializeTone } from "./toner";

export async function play() {
  console.log("play");

  // for (let voice of voices) {
  //   console.log("starting voice", voice);
  //   voice.start();
  // }

  Tone.getDestination().volume.rampTo(0, 1);
}

export function pause() {
  console.log("pause");
  Tone.getDestination().volume.rampTo(-96, 1);
}

const togglePlaying = async (button: HTMLButtonElement) => {
  let playing = button.dataset.playing;
  if (playing === "init") {
    await initializeTone();
    playing = "false";
  }
  if (playing === "true") {
    pause();
    button.dataset.playing = "";
    button.innerText = "play";
  } else {
    play();
    button.dataset.playing = "true";
    button.innerText = "pause";
  }
};
function setupButton(button: HTMLButtonElement) {
  button.innerText = "play";
  button.dataset.playing = "init";
  button.addEventListener("click", () => togglePlaying(button));
}

setupButton(document.querySelector<HTMLButtonElement>("#playpause")!);

type VoiceState = {
  [key: string]: boolean;
};

const voiceState: VoiceState = {
  earth: false,
  air: false,
  water: false,
  fire: false,
};

function toggleVoice(
  voice: string,
  button: HTMLButtonElement,
  container: HTMLElement,
) {
  voiceState[voice] = !voiceState[voice];
  const isActive = voiceState[voice];
  button.textContent = isActive ? "ON" : "OFF";
  button.classList.toggle("active", isActive);
  container.classList.toggle("disabled", !isActive);
  console.log(`Voice "${voice}" ${isActive ? "enabled" : "disabled"}`);
}

function setupVoiceControls() {
  const controls =
    document.querySelectorAll<HTMLButtonElement>(".voice-toggle");
  controls.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const voice = button.dataset.voice;
      if (!voice) return;
      const container = button.closest<HTMLElement>(".voice-control");
      if (!container) return;
      toggleVoice(voice, button, container);
    });
  });

  const voiceContainers =
    document.querySelectorAll<HTMLElement>(".voice-control");
  voiceContainers.forEach((container) => {
    container.addEventListener("click", () => {
      const button =
        container.querySelector<HTMLButtonElement>(".voice-toggle");
      const voice = button?.dataset.voice;
      if (!voice || !button) return;
      toggleVoice(voice, button, container);
    });
  });
}

setupVoiceControls();
