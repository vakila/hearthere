import { Synth } from "tone";

//create a synth and connect it to the main output (your speakers)
export const synth = new Synth().toDestination();

export function play() {
    //play a middle 'C' for the duration of an 8th note
    synth.triggerAttackRelease("C4", "8n");
}