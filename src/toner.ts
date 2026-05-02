// Hack to work around AudioContext warnings when importing Tone
export let Tone: typeof import("tone");

export const initializeTone = async () => {
  console.log("initializing Tone.js");
  if (Tone) return Tone;
  Tone = await import("tone");
  await Tone.start();
  return Tone;
};
