import { FeedbackDelay, Filter, LFO, Merge, PolySynth, PulseOscillator, Synth, start as toneStart } from "tone";

//create a synth and connect it to the main output (your speakers)
export const monosynth = new Synth();
const synth = new PolySynth(Synth);

const Fmaj = ["F3", "A3", "C3"]

// saw wave Oscillator with PWM
// const vco1 = new Oscillator(260, "sawtooth");
const vco1 = new PulseOscillator(260, 0.37);


// to low-pass filter
const filter = new Filter(250, "lowpass");
vco1.connect(filter);

// to LFO-modulated Delay
const lfo = new LFO(0.05, 0.3, 0.5);
const delay = new FeedbackDelay(0.4, 0.5);
lfo.connect(delay.delayTime);
filter.connect(delay);
synth.chain(filter, delay);

// hook it all up

const merge = new Merge(1);
synth.connect(merge);
delay.connect(merge);

export async function play() {
    // the AudioContext is suspended until user action
    await toneStart(); // Tone.start() un-suspends it
    lfo.start();
    vco1.start();
    synth.triggerAttack(Fmaj);
    merge.toDestination();
}

export function pause() {
    synth.triggerRelease(Fmaj);
    vco1.stop();
}



export function setBaseFreq(newFreq: number) {
    vco1.set({ frequency: newFreq });
}

export function setDelayFreq(newFreq: number) {
    lfo.set({ frequency: newFreq });
}

export function setFilterCutoff(newFreq: number) {
    filter.set({ frequency: newFreq });
}
