import type {
  Oscillator,
  FatOscillator,
  PWMOscillator,
  FMOscillator,
  Noise,
  LFO,
  PulseOscillator,
  FeedbackDelay,
  Filter,
  AutoFilter,
  BiquadFilter,
  ToneAudioNode,
  Gain,
  Merge,
  NoiseType,
} from "tone";
import type { WeatherData } from "./meteo";

// Hack to work around AudioContext warnings when importing Tone
export let Tone: typeof import("tone");

export const initializeTone = async () => {
  console.log("initializing Tone.js");
  if (Tone) return Tone;
  Tone = await import("tone");
  await Tone.start();
  return Tone;
};

export interface Voice {
  name: string;
  source?: Oscillator | FatOscillator | PWMOscillator | FMOscillator | Noise;
  lfo?: LFO | PulseOscillator | Oscillator;
  delay?: FeedbackDelay;
  filters?: { [name: string]: Filter | AutoFilter | BiquadFilter };
  start: () => void;
  stop: () => void;
  output?: ToneAudioNode;
  gainNode?: Gain<"decibels">;
  gain: number;
  isActive: boolean;
  currentGain: number;
  updateData: (data: WeatherData) => void;
  weatherData?: {
    temperature_2m?: number;
    apparent_temperature?: number;
    surface_pressure?: number;
    pressure_msl?: number;
    relative_humidity_2m?: number;
    precipitation?: number;
    rain?: number;
    snowfall?: number;
    showers?: number;
    wind_speed_10m?: number;
    wind_direction_10m?: number;
    wind_gusts_10m?: number;
    cloud_cover?: number;
    weather_code?: number;
    is_day?: number;
  };
}

// Earth: F0
export function getEarth(): Voice {
  let name = "earth";
  let gain = -10;
  let freq = 174; // F3
  let lfoFreq = 0.03;
  let cutoffFreq = { min: 600, max: 1400 };
  const earth: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({ frequency: 174, type: "lowpass" }),
      dampening: new Tone.Filter({
        type: "peaking",
        frequency: 174,
        gain: -6,
        rolloff: -24,
      }),
      sweep: new Tone.Filter({
        frequency: cutoffFreq.min,
        type: "lowpass",
        Q: 30,
      }),
    },
    start: () => {},
    stop: () => {},
    updateData: ({}) => {},
    output: undefined,
  };

  earth.lfo!.connect(earth.filters!.sweep.frequency);
  earth.source!.chain(
    earth.filters!.harmonics,
    earth.filters!.dampening,
    earth.filters!.sweep,
  );
  earth.output = earth.filters!.sweep;
  earth.gainNode = new Tone.Gain(earth.gain, "decibels");
  earth.output.connect(earth.gainNode);
  earth.output = earth.gainNode;

  earth.start = () => {
    earth.lfo!.start();
    earth.source!.start();
  };
  earth.stop = () => {
    earth.lfo!.stop();
    earth.source!.stop();
  };

  earth.updateData = (data) => {
    earth.weatherData = { ...earth.weatherData, ...data };
    const temp = data.temperature_2m ?? data.apparent_temperature;
    if (temp !== undefined && earth.source) {
      const baseFreq = 174;
      const freq = baseFreq + (temp - 20) * 2;
      (earth.source as Oscillator).frequency.rampTo(freq, 1);
    }
    if (data.surface_pressure !== undefined && earth.lfo) {
      const lfoRate = 0.03 + (data.surface_pressure - 1013) / 100000;
      earth.lfo.frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  };
  return earth;
}

// Water: add depth?
export const getWater = (): Voice => {
  let name = "water";
  let gain = -3.5;
  let freq = 220; // A3
  let lfoFreq = 0.01;
  let cutoffFreq = { min: 522 * 0.7, max: 522 * 1.3 };
  const water: Voice = {
    name,
    gain,
    isActive: false,
    currentGain: gain,
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({ frequency: freq, type: "lowpass" }),
      dampening: new Tone.Filter({
        type: "peaking",
        frequency: freq,
        gain: -12,
      }),
      sweep: new Tone.Filter({
        frequency: cutoffFreq.min,
        type: "lowpass",
        Q: 30,
      }),
    },
    start: () => {},
    stop: () => {},
    updateData: ({}) => {},
    output: undefined,
    gainNode: undefined,
  };

  water.lfo!.connect(water.filters!.sweep.frequency);
  water.source!.chain(
    water.filters!.harmonics,
    water.filters!.dampening,
    water.filters!.sweep,
  );
  water.output = water.filters!.sweep;
  water.gainNode = new Tone.Gain(water.gain, "decibels");
  water.output.connect(water.gainNode);
  water.output = water.gainNode;

  water.start = () => {
    water.lfo!.start();
    water.source!.start();
  };
  water.stop = () => {
    water.lfo!.stop();
    water.source!.stop();
  };

  water.updateData = (data) => {
    water.weatherData = { ...water.weatherData, ...data };

    const humidity = data.relative_humidity_2m;
    if (humidity !== undefined && water.gainNode) {
      const gain = -3.5 - (humidity / 100) * 6;
      water.currentGain = gain;
      if (water.isActive) water.gainNode.gain.rampTo(gain, 1);
    }
    if (data.precipitation !== undefined && water.lfo) {
      const lfoRate = 0.01 + data.precipitation * 0.005;
      (water.lfo as LFO).frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  };
  return water;
};

// Air: Spacey
export const getAir = (): Voice => {
  let name = "air";
  let gain = -11.25;
  let freq = 328; // D3
  let lfo0Freq = 0.026;
  let lfo1Freq = 0.01;
  let cutoffFreq = { min: 1326 * 53, max: 1326 * 53 };
  const air: Voice = {
    name,
    gain,
    isActive: false,
    currentGain: gain,
    source: new Tone.FMOscillator({
      frequency: freq,
      type: "triangle",
      modulationType: "square",
      harmonicity: 0.0005,
      modulationIndex: 0.5,
    }),
    lfo: new Tone.Oscillator({ frequency: 0.03, type: "square" }),
    filters: {},
    start: () => {},
    stop: () => {},
    updateData: ({}) => {},
    output: undefined,
    gainNode: undefined,
  };

  air.lfo!.connect((air.source as Oscillator).frequency);
  air.output = air.source;
  air.gainNode = new Tone.Gain(air.gain, "decibels");
  air.output?.connect(air.gainNode);
  air.output = air.gainNode;

  air.start = () => {
    air.source!.start();
  };
  air.stop = () => {
    air.source!.stop();
  };

  air.updateData = (data) => {
    air.weatherData = { ...air.weatherData, ...data };
    const windSpeed = data.wind_speed_10m ?? data.wind_gusts_10m;
    if (windSpeed !== undefined) {
      const modIndex = 0.5 + windSpeed * 0.1;
      (air.source as FMOscillator).modulationIndex.rampTo(modIndex, 1);
    }
    if (windSpeed !== undefined && air.lfo) {
      const lfoRate = 0.03 + windSpeed * 0.01;
      air.lfo.frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  };
  return air;
};

// Fire: Noise
export const getFire = (): Voice => {
  let name = "fire";
  let color: NoiseType = "pink";
  let delayTime = 0.18;
  let lfoFreq = 0.16;
  let cutoffFreq = { min: 1054 * 0.75, max: 1054 * 1.25 };
  let gain = -17.5;
  const fire: Voice = {
    name,
    gain,
    isActive: false,
    currentGain: gain,
    source: new Tone.Noise(color),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    delay: new Tone.FeedbackDelay({ delayTime, feedback: 0.6 }),
    filters: {
      lowpass: new Tone.Filter({ frequency: cutoffFreq.max, type: "lowpass" }),
    },
    output: undefined,
    gainNode: undefined,
    start: () => {},
    stop: () => {},
    updateData: ({}) => {},
  };

  fire.lfo!.connect(fire.filters!.lowpass.frequency);
  fire.source!.chain(fire.delay!, fire.filters!.lowpass);
  fire.output = fire.filters!.lowpass;
  fire.gainNode = new Tone.Gain(fire.gain, "decibels");
  fire.output.connect(fire.gainNode);
  fire.output = fire.gainNode;

  fire.start = () => {
    fire.lfo!.start();
    fire.source!.start()!;
  };
  fire.stop = () => {
    fire.lfo!.stop();
    fire.source!.stop()!;
  };

  fire.updateData = (data) => {
    fire.weatherData = { ...fire.weatherData, ...data };
    const cloudCover = fire.weatherData.cloud_cover;
    if (cloudCover !== undefined && fire.lfo) {
      const cutoff = 1054 * (0.75 + (cloudCover / 100) * 0.5);
      fire.lfo.frequency.rampTo(cutoff, 1);
    }
    if (fire.weatherData.is_day && fire.gainNode) {
      const gain = fire.weatherData.is_day ? -17.5 : -22;
      fire.currentGain = gain;
      if (fire.isActive) fire.gainNode.gain.rampTo(gain, 1);
    }
  };
  return fire;
};

export const getMixer = (inputs: Voice[]) => {
  console.log("getMixer", inputs);
  const merge = new Tone.Merge(1);
  inputs.map((voice) => {
    console.log("connecting voice", voice);
    voice.gainNode!.connect(merge);
  });
  merge.toDestination();
  return merge;
};

export const getDelay = (input: Voice["output"]) => {
  let name = "delay";
  let lfoFreq = 0.01;
  let delayTime = { min: 0.2, max: 0.3 };
  const voice = {
    name,
    lfo: new Tone.LFO(lfoFreq, delayTime.min, delayTime.max),
    delay: new Tone.FeedbackDelay({ delayTime: delayTime.min, feedback: 0.36 }),
    start: () => {},
    output: Tone.getDestination().output,
  };
  voice.start = () => {
    voice.lfo.connect(voice.delay.delayTime);
    input!.chain(voice.delay, Tone.getDestination());
    voice.lfo.start();
  };
  return voice;
};

// VOICES state
export const VOICES: { [name: string]: Voice } = {};

function createVoice(name: string): Voice {
  switch (name) {
    case "earth":
      return getEarth();
    case "water":
      return getWater();
    case "air":
      return getAir();
    case "fire":
      return getFire();
    default:
      throw new Error(`Unknown voice: ${name}`);
  }
}

export function initializeVoice(name: string): Voice {
  if (!VOICES[name]) {
    VOICES[name] = createVoice(name);
  }
  return VOICES[name];
}

export function getActiveVoices(): Voice[] {
  const voiceNames = ["earth", "water", "air", "fire"];
  voiceNames.forEach((name) => initializeVoice(name));

  return voiceNames
    .map((name) => VOICES[name])
    .filter((voice) => voice.isActive);
}

export function toggleVoice(name: string): boolean {
  const voice = initializeVoice(name);
  voice.isActive = !voice.isActive;

  if (voice.gainNode) {
    if (voice.isActive) {
      voice.gainNode.gain.rampTo(voice.currentGain, 1);
    } else {
      voice.gainNode.gain.rampTo(-48, 1);
    }
  }

  return voice.isActive;
}

export function setVoiceGain(name: string, gain: number) {
  const voice = initializeVoice(name);
  voice.currentGain = gain;

  if (voice.gainNode && voice.isActive) {
    voice.gainNode.gain.rampTo(gain, 0.1);
  }

  if (gain > -48 && !voice.isActive) {
    toggleVoice(name);
  }
}

let mixerInitialized = false;
let mixer: Merge | undefined;

export async function playAudio() {
  console.log("play");

  const activeVoices = getActiveVoices();

  if (!mixerInitialized) {
    mixer = getMixer(activeVoices);
    mixerInitialized = true;

    for (let voice of activeVoices) {
      console.log("starting voice", voice);
      voice.start();
    }
  }

  for (let voice of activeVoices) {
    if (voice.gainNode) {
      voice.gainNode.gain.rampTo(voice.currentGain, 1);
    }
  }

  Tone.getDestination().volume.rampTo(0, 1);
}

export function pauseAudio() {
  console.log("pause");
  Tone.getDestination().volume.rampTo(-96, 1);
}

export function updateWeatherData(data: WeatherData) {
  const voiceNames = ["earth", "water", "air", "fire"];
  voiceNames.forEach((name) => {
    const voice = VOICES[name];
    if (voice) voice.updateData(data);
  });
}
