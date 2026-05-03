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
  source?: Tone.Oscillator | Tone.FatOscillator | Tone.PWMOscillator | Tone.FMOscillator | Tone.Noise;
  lfo?: Tone.LFO | Tone.PulseOscillator | Tone.Oscillator;
  delay?: Tone.FeedbackDelay;
  filters?: { [name: string]: Tone.Filter | Tone.AutoFilter | Tone.BiquadFilter };
  start: () => void;
  stop: () => void;
  output?: Tone.ToneAudioNode;
  gainNode?: Tone.Gain;
  gain: number;
  isActive: boolean;
  currentGain: number;
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
  const voice: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({ frequency: 174, type: "lowpass" }),
      dampening: new Tone.Filter({ type: "peaking", frequency: 174, gain: -6, rolloff: -24 }),
      sweep: new Tone.Filter({ frequency: cutoffFreq.min, type: "lowpass", Q: 30 }),
    },
    start: () => {},
    stop: () => {},
    output: undefined,
  };

  voice.lfo!.connect(voice.filters!.sweep.frequency);
  voice.source!.chain(voice.filters!.harmonics, voice.filters!.dampening, voice.filters!.sweep);
  voice.output = voice.filters!.sweep;
  voice.gainNode = new Tone.Gain(voice.gain, "decibels");
  voice.output.connect(voice.gainNode);
  voice.output = voice.gainNode;

  voice.start = () => { voice.lfo!.start(); voice.source!.start(); };
  voice.stop = () => { voice.lfo!.stop(); voice.source!.stop(); };
  return voice;
}

// Water: add depth?
export const getWater = (): Voice => {
  let name = "water";
  let gain = -3.5;
  let freq = 220; // A3
  let lfoFreq = 0.01;
  let cutoffFreq = { min: 522 * 0.7, max: 522 * 1.3 };
  const voice: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({ frequency: freq, type: "lowpass" }),
      dampening: new Tone.Filter({ type: "peaking", frequency: freq, gain: -12 }),
      sweep: new Tone.Filter({ frequency: cutoffFreq.min, type: "lowpass", Q: 30 }),
    },
    start: () => {},
    stop: () => {},
    output: undefined,
    gainNode: undefined,
  };

  voice.lfo!.connect(voice.filters!.sweep.frequency);
  voice.source!.chain(voice.filters!.harmonics, voice.filters!.dampening, voice.filters!.sweep);
  voice.output = voice.filters!.sweep;
  voice.gainNode = new Tone.Gain(voice.gain, "decibels");
  voice.output.connect(voice.gainNode);
  voice.output = voice.gainNode;

  voice.start = () => { voice.lfo!.start(); voice.source!.start(); };
  voice.stop = () => { voice.lfo!.stop(); voice.source!.stop(); };
  return voice;
};

// Air: Spacey
export const getAir = (): Voice => {
  let name = "air";
  let gain = -11.25;
  let freq = 328; // D3
  let lfo0Freq = 0.026;
  let lfo1Freq = 0.01;
  let cutoffFreq = { min: 1326 * 53, max: 1326 * 53 };
  const voice: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.FMOscillator({ frequency: freq, type: "triangle", modulationType: "square", harmonicity: 0.0005, modulationIndex: 0.5 }),
    lfo: new Tone.Oscillator({ frequency: 0.03, type: "square" }),
    filters: {},
    start: () => {},
    stop: () => {},
    output: undefined,
    gainNode: undefined,
  };

  voice.lfo!.connect((voice.source as Tone.Oscillator).frequency);
  voice.output = voice.source;
  voice.gainNode = new Tone.Gain(voice.gain, "decibels");
  voice.output.connect(voice.gainNode);
  voice.output = voice.gainNode;

  voice.start = () => { voice.source!.start(); };
  voice.stop = () => { voice.source!.stop(); };
  return voice;
};

// Fire: Noise
export const getFire = (): Voice => {
  let name = "fire";
  let color: Tone.NoiseType = "pink";
  let delayTime = 0.18;
  let lfoFreq = 0.16;
  let cutoffFreq = { min: 1054 * 0.75, max: 1054 * 1.25 };
  let gain = -17.5;
  const voice: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.Noise(color),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    delay: new Tone.FeedbackDelay({ delayTime, feedback: 0.6 }),
    filters: { lowpass: new Tone.Filter({ frequency: cutoffFreq.max, type: "lowpass" }) },
    output: undefined,
    gainNode: undefined,
    start: () => {},
    stop: () => {},
  };

  voice.lfo!.connect(voice.filters!.lowpass.frequency);
  voice.source!.chain(voice.delay!, voice.filters!.lowpass);
  voice.output = voice.filters!.lowpass;
  voice.gainNode = new Tone.Gain(voice.gain, "decibels");
  voice.output.connect(voice.gainNode);
  voice.output = voice.gainNode;

  voice.start = () => { voice.lfo!.start(); voice.source!.start()!; };
  voice.stop = () => { voice.lfo!.stop(); voice.source!.stop()!; };
  return voice;
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

export function ensureVoice(name: string): Voice {
  if (!VOICES[name]) {
    VOICES[name] = createVoice(name);
  }
  return VOICES[name];
}

export function getActiveVoices(): Voice[] {
  const voiceNames = ["earth", "water", "air", "fire"];
  voiceNames.forEach(name => ensureVoice(name));

  return voiceNames
    .map(name => VOICES[name])
    .filter(voice => voice.isActive);
}

export function toggleVoice(name: string): boolean {
  const voice = ensureVoice(name);
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
  const voice = ensureVoice(name);
  voice.currentGain = gain;

  if (voice.gainNode && voice.isActive) {
    voice.gainNode.gain.rampTo(gain, 0.1);
  }

  if (gain > -48 && !voice.isActive) {
    toggleVoice(name);
  }
}

let mixerInitialized = false;
let mixer: Tone.Merge | undefined;

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

type WeatherData = {
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

export function updateWeatherData(data: WeatherData) {
  const voiceNames = ["earth", "water", "air", "fire"];
  voiceNames.forEach(name => {
    const voice = ensureVoice(name);
    voice.weatherData = { ...voice.weatherData, ...data };
  });

  // Earth: temperature and pressure affect oscillator frequency and LFO
  const earth = VOICES["earth"];
  if (earth && earth.source && "frequency" in earth.source) {
    const temp = data.temperature_2m ?? data.apparent_temperature;
    if (temp !== undefined) {
      const baseFreq = 174;
      const freq = baseFreq + (temp - 20) * 2;
      (earth.source as Tone.Oscillator).frequency.rampTo(freq, 1);
    }
    if (data.surface_pressure !== undefined && earth.lfo) {
      const lfoRate = 0.03 + (data.surface_pressure - 1013) / 100000;
      (earth.lfo as Tone.LFO).frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  }

  // Water: humidity and precipitation affect gain and delay
  const water = VOICES["water"];
  if (water) {
    const humidity = data.relative_humidity_2m;
    if (humidity !== undefined && water.gainNode) {
      const gain = -3.5 - (humidity / 100) * 6;
      water.currentGain = gain;
      if (water.isActive) water.gainNode.gain.rampTo(gain, 1);
    }
    if (data.precipitation !== undefined && water.lfo) {
      const lfoRate = 0.01 + data.precipitation * 0.005;
      (water.lfo as Tone.LFO).frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  }

  // Air: wind speed affects LFO and FM modulation
  const air = VOICES["air"];
  if (air && air.source && "modulationIndex" in air.source) {
    const windSpeed = data.wind_speed_10m ?? data.wind_gusts_10m;
    if (windSpeed !== undefined) {
      const modIndex = 0.5 + windSpeed * 0.1;
      (air.source as Tone.FMOscillator).modulationIndex.rampTo(modIndex, 1);
    }
    if (windSpeed !== undefined && air.lfo) {
      const lfoRate = 0.03 + windSpeed * 0.01;
      (air.lfo as Tone.Oscillator).frequency.rampTo(Math.max(0.01, lfoRate), 1);
    }
  }

  // Fire: cloud cover and day/night affect filter and gain
  const fire = VOICES["fire"];
  if (fire) {
    const cloudCover = data.cloud_cover;
    if (cloudCover !== undefined && fire.filters?.lowpass) {
      const cutoff = 1054 * (0.75 + (cloudCover / 100) * 0.5);
      (fire.filters.lowpass as Tone.Filter).frequency.rampTo(cutoff, 1);
    }
    if (data.is_day !== undefined && fire.gainNode) {
      const gain = data.is_day ? -17.5 : -22;
      fire.currentGain = gain;
      if (fire.isActive) fire.gainNode.gain.rampTo(gain, 1);
    }
  }
}
