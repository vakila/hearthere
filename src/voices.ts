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
import type { WeatherData } from "./weather";

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
  source?:
    | Oscillator
    | FatOscillator
    | PulseOscillator
    | PWMOscillator
    | FMOscillator
    | Noise;
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
  updateData: (data: Partial<WeatherData>) => void;
  weatherData?: Partial<WeatherData>;
}

// Earth: F0
export function createEarth(): Voice {
  let name = "earth";
  let gain = -10;
  let freq = 174; // F3
  let lfoFreq = 0.03;
  let cutoffFreq = { min: 800, max: 1200 };
  const earth: Voice = {
    name,
    gain,
    isActive: false,
    currentGain: gain,
    // source: new Tone.PulseOscillator({ frequency: freq, width: 0.9 }),
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({
        frequency: freq,
        type: "highshelf",
      }),
      dampening: new Tone.Filter({
        type: "bandpass",
        frequency: freq,
        rolloff: -12,
        Q: 10,
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
  // (earth.source as PulseOscillator).carrierType = "sine";
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

  function getEarthFrequency(latitude: number, longitude: number) {
    console.log("getEarthFrequency", latitude, longitude);

    // Use longitude to determine note, with C at 0 and F#/Gb at 180
    const F3 = 174.61;
    const lonAddition = (longitude / 180) * 20;
    const lonNote = F3 + lonAddition;
    console.log(
      "longitude",
      longitude,
      "lonAddition",
      lonAddition,
      "lonNote",
      lonNote,
    );

    // Use latitude to determine octave (+/-2);
    const tropicalLat = 23.43;
    const arcticLat = 66.57;
    const absLat = Math.abs(latitude);
    const latFactor = absLat > arcticLat ? 4 : absLat > tropicalLat ? 2 : 1;
    const latOctave =
      latitude >= 0
        ? // northern hemisphere: higher octaves
          lonNote * latFactor
        : // southern hemisphere: lower octaves
          lonNote / latFactor;

    console.log(
      "latitude",
      latitude,
      "latFactor",
      latFactor,
      "latOctave",
      latOctave,
    );

    return latOctave;
  }

  earth.updateData = (
    data: Pick<
      Partial<WeatherData>,
      | "elevation"
      | "latitude"
      | "longitude"
      | "temperature_2m"
      | "apparent_temperature"
    >,
  ) => {
    console.log("earth.updateData", data);
    earth.weatherData = { ...earth.weatherData, ...data };
    const { temperature_2m: temp, apparent_temperature: feelsLike } =
      earth.weatherData;
    // const { latitude, longitude } = earth.weatherData;

    // if (latitude !== undefined && longitude !== undefined) {
    //   const newFreq = getEarthFrequency(latitude, longitude);
    //   freq = newFreq;
    //   (earth.source as Oscillator)?.frequency.rampTo(Math.max(20, freq), 1);
    //   for (const filter of ["harmonics", "dampening"] as const) {
    //     if (earth.filters && filter in earth.filters) {
    //       earth.filters[filter].frequency.rampTo(Math.max(20, freq), 1);
    //     }
    //   }
    // }

    if (temp !== undefined && earth.source) {
      const newFreq = freq + temp;
      console.log("setting earth.freq to", freq);
      freq = newFreq;
      (earth.source as Oscillator).frequency.rampTo(freq, 1);
      for (const filter of ["harmonics", "dampening"] as const) {
        if (earth.filters && filter in earth.filters) {
          earth.filters[filter].frequency.rampTo(Math.max(20, freq), 1);
        }
      }

      if (earth.lfo && feelsLike !== undefined) {
        const newLFOFreq = lfoFreq * (temp / feelsLike); // / 100000;
        console.log("setting earth.lfo.frequency to", newLFOFreq);
        lfoFreq = newLFOFreq;
        earth.lfo.frequency.rampTo(Math.max(0.01, lfoFreq), 1);
      }
    }
  };

  earth.updateData(earth.weatherData || {});

  return earth;
}

// Water: add depth?
export const createWater = (): Voice => {
  let name = "water";
  let gain = 0;
  let freq = 220; // A3
  let lfoFreq = 0.05;
  let cutoffFreq = { min: freq * 2, max: freq * 8 };
  const water: Voice = {
    name,
    gain,
    isActive: false,
    currentGain: gain,
    source: new Tone.Oscillator({ frequency: freq, type: "triangle" }),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    filters: {
      harmonics: new Tone.Filter({
        frequency: freq,
        type: "highshelf",
        rolloff: -24,
      }),
      dampening: new Tone.Filter({
        type: "lowpass",
        frequency: freq,
      }),
      sweep: new Tone.Filter({
        frequency: cutoffFreq.min,
        type: "bandpass",
        Q: 10,
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
    water.filters!.sweep,
    water.filters!.dampening,
  );
  water.output = water.filters!.dampening;
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
    console.log("water.updateData", data);
    water.weatherData = { ...water.weatherData, ...data };

    const { relative_humidity_2m: humidity, precipitation } = water.weatherData;

    if (humidity !== undefined && water.filters?.sweep) {
      console.log("humidity", humidity);
      const newQ = (humidity / 100) * 15;
      console.log("setting water.filters.sweep.Q to", newQ);
      water.filters.sweep.set({ Q: newQ });
    }
    if (data.precipitation !== undefined && water.lfo) {
      console.log("precipitation", precipitation);
      const lfoRate = lfoFreq + data.precipitation / 2;
      console.log("setting water.lfo.frequency to", lfoRate);
      (water.lfo as LFO).frequency.rampTo(lfoRate, 1);
    }
  };
  return water;
};

// Fire: Spacey & Complicated
export const createFire = (): Voice => {
  let name = "fire";
  let gain = -11.25;
  let freq = 328; // D3
  const fire: Voice = {
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

  fire.lfo!.connect((fire.source as Oscillator).frequency);
  fire.output = fire.source;
  fire.gainNode = new Tone.Gain(fire.gain, "decibels");
  fire.output?.connect(fire.gainNode);
  fire.output = fire.gainNode;

  fire.start = () => {
    fire.source!.start();
  };
  fire.stop = () => {
    fire.source!.stop();
  };

  fire.updateData = (data) => {
    fire.weatherData = { ...fire.weatherData, ...data };

    // // const cloudCover = fire.weatherData.cloud_cover;
    // if (cloudCover !== undefined && fire.lfo) {
    //   const cutoff = 1054 * (0.75 + (cloudCover / 100) * 0.5);
    //   fire.lfo.frequency.rampTo(cutoff, 1);
    // }
    // if (fire.weatherData.is_day && fire.gainNode) {
    //   const gain = fire.weatherData.is_day ? -17.5 : -22;
    //   fire.currentGain = gain;
    //   if (fire.isActive) fire.gainNode.gain.rampTo(gain, 1);
    // }
  };
  return fire;
};

// Air: Noise
export const createAir = (): Voice => {
  let name = "air";
  let color: NoiseType = "pink";
  let delayTime = 0.18;
  let lfoFreq = 0.16;
  let cutoff = 1054;
  let cutoffFreq = { min: cutoff * 0.5, max: cutoff * 1.5 };
  let gain = -17.5;
  const air: Voice = {
    name,
    gain,
    isActive: true,
    currentGain: gain,
    source: new Tone.Noise(color),
    lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
    delay: new Tone.FeedbackDelay({ delayTime, feedback: 0.6, wet: 0.6 }),
    filters: {
      lowpass: new Tone.Filter({
        frequency: cutoffFreq.min,
        type: "lowpass",
        Q: 1,
        rolloff: -48,
      }),
    },
    output: undefined,
    gainNode: undefined,
    start: () => {},
    stop: () => {},
    updateData: ({}) => {},
  };

  (air.lfo as LFO).set({ type: "triangle" });
  air.lfo!.connect(air.filters!.lowpass.frequency);
  air.source!.chain(air.delay!, air.filters!.lowpass);
  air.output = air.filters!.lowpass;
  air.gainNode = new Tone.Gain(air.gain, "decibels");
  air.output.connect(air.gainNode);
  air.output = air.gainNode;

  air.start = () => {
    air.lfo!.start();
    air.source!.start()!;
  };
  air.stop = () => {
    air.lfo!.stop();
    air.source!.stop()!;
  };

  air.updateData = (data) => {
    console.log("air.updateData", data);
    air.weatherData = { ...air.weatherData, ...data };
    const { wind_speed_10m: windSpeed, wind_gusts_10m: windGusts } =
      air.weatherData;
    if (windSpeed !== undefined && air.lfo !== undefined) {
      console.log("windSpeed", windSpeed);
      const speedFreq = 0.16 * (windSpeed / 10);
      console.log("setting air.lfo.frequency to", speedFreq);
      lfoFreq = speedFreq;
      air.lfo.frequency.rampTo(speedFreq, 1);

      if (windGusts !== undefined) {
        console.log("windGusts", windGusts);
        const gustiness = windGusts / windSpeed;
        console.log("gustiness", gustiness);
        let min = (air.lfo as LFO).min;
        const newMax = min * gustiness;
        console.log("setting air.lfo.max to", newMax);
        air.lfo.set({ max: newMax });
      }
    }
  };
  return air;
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
let latestWeatherData: WeatherData | null = null;

function createVoice(name: string): Voice {
  switch (name) {
    case "earth":
      return createEarth();
    case "water":
      return createWater();
    case "air":
      return createAir();
    case "fire":
      return createFire();
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

  // Apply latest weather data to voices before playing
  if (latestWeatherData) {
    activeVoices.forEach((voice) => {
      voice.updateData(latestWeatherData!);
    });
  }

  if (!mixerInitialized) {
    mixer = getMixer(activeVoices);
    mixerInitialized = true;
  }
  for (let voice of activeVoices) {
    console.log("starting voice", voice);
    voice.start();
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
  const activeVoices = getActiveVoices();

  for (let voice of activeVoices) {
    console.log("pausing voice", voice);
    if (voice.gainNode) {
      voice.gainNode.gain.rampTo(-96, 1);
    }
    voice.stop();
  }
}

export function updateWeatherData(data: WeatherData) {
  latestWeatherData = data;
  const voiceNames = ["earth", "water", "air", "fire"];
  voiceNames.forEach((name) => {
    const voice = VOICES[name];
    if (voice) voice.updateData(data);
  });
}
