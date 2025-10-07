import { PolySynth, Synth } from "tone";

//create a synth and connect it to the main output (your speakers)
export const monosynth = new Synth().toDestination();
const synth = new PolySynth(Synth).toDestination();

const Fmaj = ["F3", "A3", "C3"]


export function play() {
    //play a middle 'C' for the duration of an 8th note
    synth.triggerAttack(Fmaj);
}

export function pause() {
    //release the note immediately
    synth.triggerRelease(Fmaj);
}