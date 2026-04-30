// Hack to work around AudioContext warnings when importing Tone
export let Tone: typeof import("tone");
export const initializeTone = async () => {
  console.log("init");
  if (Tone) return;
  Tone = await import("tone");
  await Tone.start();
};

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
