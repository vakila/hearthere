import { Tone, initializeTone } from "./toner";
import { getVoice, getMixer } from "./voices";
import type { Voice } from "./voices";

const PLAYPAUSEBTN = document.querySelector<HTMLButtonElement>("#playpause")!;

const VOICES: {
  [name: string]: {
    voice?: Voice;
    isActive: boolean;
    currentGain?: number;
  };
} = {
  earth: {
    voice: undefined,
    isActive: true,
    currentGain: -10,
  },
  water: {
    voice: undefined,
    isActive: true,
    currentGain: -3.5,
  },
  air: {
    voice: undefined,
    isActive: true,
    currentGain: -11.25,
  },
  fire: {
    voice: undefined,
    isActive: true,
    currentGain: -17.5,
  },
};

export function getActiveVoices() {
  Object.keys(VOICES).map((v) => {
    if (VOICES[v].voice === undefined) {
      VOICES[v].voice = getVoice(v);
    }
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

let mixerInitialized = false;

export async function play() {
  console.log("play");

  const activeVoices = getActiveVoices();

  if (!mixerInitialized) {
    getMixer(activeVoices);
    mixerInitialized = true;

    for (let voice of activeVoices) {
      console.log("starting voice", voice);
      voice.start();
    }
  }

  for (let voice of activeVoices) {
    if (voice.gainNode) {
      voice.gainNode.gain.rampTo(voice.gain, 1);
    }
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

  // If we haven't started initialized the voice yet, nothing to do;
  if (voiceState.voice === undefined) return;

  const gainNode = voiceState.voice.gainNode;
  if (!gainNode) return;

  const slider = container.querySelector<HTMLInputElement>(".voice-gain");

  if (isActive) {
    gainNode.gain.rampTo(voiceState.currentGain ?? voiceState.voice.gain, 1);
    if (slider) slider.value = (voiceState.currentGain ?? voiceState.voice.gain).toString();
  } else {
    gainNode.gain.rampTo(-48, 1);
    if (slider) slider.value = "-48";
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

  const gainSliders =
    document.querySelectorAll<HTMLInputElement>(".voice-gain");
  gainSliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      e.stopPropagation();
      const voiceName = slider.dataset.voice;
      if (!voiceName) return;
      const voiceState = VOICES[voiceName];
      if (!voiceState.voice || !voiceState.voice.gainNode) return;
      const gainValue = parseFloat(slider.value);
      voiceState.voice.gainNode.gain.rampTo(gainValue, 0.1);
      voiceState.currentGain = gainValue;
      if (gainValue > -48) {
        voiceState.isActive = true;
        const button = slider.parentElement?.querySelector(".voice-toggle");
        if (button) {
          button.textContent = "ON";
          button.classList.add("active");
        }
        slider.parentElement?.classList.remove("disabled");
      }
    });
    slider.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}

setupVoiceControls();
