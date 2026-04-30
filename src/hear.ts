// import { start } from "tone";

// import * as Tone from "tone";
// console.log("state before:", Tone.getContext().state); // "suspended"

export let Tone: typeof import("tone");

export const initializeTone = async () => {
  console.log("init");
  if (Tone) return;
  Tone = await import("tone");
  await Tone.start();
};

import type { WeatherData } from "./meteo";

export function updateHearData(data: WeatherData) {
  console.log("updating hear data");

  for (let [metric, value] of Object.entries(data)) {
    // console.log("metric:", metric, "value:", value);
    const displayValue =
      value instanceof Date
        ? value.toISOString().replace("T", " ").replace(":00.000Z", "")
        : value.toString();

    const display = document.getElementById(metric);
    if (display) {
      display.textContent = displayValue;
    }
  }
}

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
