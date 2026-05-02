// Hack to work around AudioContext warnings when importing Tone
export let Tone: typeof import("tone");
export const initializeTone = async () => {
  console.log("init");
  if (Tone) return;
  Tone = await import("tone");
  await Tone.start();
};
