import { FeedbackDelay, Filter, LFO, Merge, PolySynth, PulseOscillator, Synth } from "tone";

//create a synth and connect it to the main output (your speakers)
export const monosynth = new Synth().toDestination();
const synth = new PolySynth(Synth);

const Fmaj = ["F3", "A3", "C3"]


export function play() {
    vco1.start();
    // synth.triggerAttack(Fmaj);
}

export function pause() {
    // synth.triggerRelease(Fmaj);
    vco1.stop();
}

// saw wave Oscillator with PWM
// const vco1 = new Oscillator(260, "sawtooth");
const vco1 = new PulseOscillator(260, 0.37);

export function setFreq(newFreq: number) {
    vco1.set({ frequency: newFreq });
}

// to low-pass filter
const filter = new Filter(275, "lowpass");
vco1.connect(filter);

// to LFO-modulated Delay
const lfo = new LFO(1.4, 0.3, 0.4).start();
const delay = new FeedbackDelay(0.37, 0.5);
lfo.connect(delay.delayTime);
filter.connect(delay);
synth.chain(filter, delay);

// hook it all up

const merge = new Merge(1).toDestination();
synth.connect(merge);
delay.connect(merge);