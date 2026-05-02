import { Tone, initializeTone } from "./toner";
import { getVoice, getMixer } from "./voices";
import type { Voice } from "./voices";

const PLAYPAUSEBTN = document.querySelector<HTMLButtonElement>("#playpause")!;

const VOICES: {
  [name: string]: {
    voice?: Voice;
    isActive: boolean;
  };
} = {
  earth: {
    voice: undefined,
    isActive: false,
  },
  water: {
    voice: undefined,
    isActive: false,
  },
  air: {
    voice: undefined,
    isActive: false,
  },
  fire: {
    voice: undefined,
    isActive: false,
  },
};

export function getActiveVoices() {
  Object.keys(VOICES).map((v) => {
    VOICES[v].voice = getVoice(v);
  });

  let activeVoices = Object.values(VOICES)
    .filter(({ isActive }) => isActive)
    .map(({ voice }) => {
      if (!voice) throw new Error("Voice missing");
      return voice;
    });

  console.log(
    "active voices: ",
    activeVoices.map((v) => v.name),
  );
  return activeVoices;
}

export async function play() {
  console.log("play");

  const activeVoices = getActiveVoices();
  getMixer(activeVoices);

  for (let voice of activeVoices) {
    console.log("starting voice", voice);
    voice.start();
  }

  Tone.getDestination().volume.rampTo(0, 1);

  PLAYPAUSEBTN.dataset.playing = "true";
  PLAYPAUSEBTN.innerText = "pause";
}

export function pause() {
  console.log("pause");
  Tone.getDestination().volume.rampTo(-96, 1);
  PLAYPAUSEBTN.dataset.playing = "";
  PLAYPAUSEBTN.innerText = "play";
}

const togglePlaying = async () => {
  let playing = PLAYPAUSEBTN.dataset.playing;
  if (playing === "init") {
    await initializeTone();
    playing = "false";
  }
  if (playing === "true") {
    pause();
  } else {
    play();
  }
};
function setupPlayPauseButton(button: HTMLButtonElement) {
  button.innerText = "play";
  button.dataset.playing = "init";
  button.addEventListener("click", () => togglePlaying());
}
setupPlayPauseButton(PLAYPAUSEBTN);

function toggleVoice(
  voice: string,
  button: HTMLButtonElement,
  container: HTMLElement,
) {
  const voiceState = VOICES[voice];
  let wasActive = voiceState.isActive;
  const isActive = !wasActive;
  voiceState.isActive = isActive;
  button.textContent = isActive ? "ON" : "OFF";
  button.classList.toggle("active", isActive);
  container.classList.toggle("disabled", !isActive);
  console.log(`Voice "${voice}" ${isActive ? "enabled" : "disabled"}`);

  if (voiceState.voice === undefined) return; // We haven't started playing audio yet; nothing to stop;
  if (isActive) {
    voiceState.voice!.start();
  } else {
    voiceState.voice!.stop();
    if (getActiveVoices().length == 0) {
      pause();
    }
  }
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
