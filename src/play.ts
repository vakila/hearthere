// import { FeedbackDelay, Filter, LFO, Merge, PolySynth, PulseOscillator, Synth, start as toneStart } from "tone";

import * as Tone from "tone";

import { getMixer, getVoice0, getVoice3, getVoiceD, type Voice } from "./voices";


const F3maj = ["F3", "A3", "C3"];

let voices: Voice[] = [];

export async function init() {
    // the AudioContext is suspended until user action
    await Tone.start(); // Tone.start() un-suspends it
    Tone.getDestination().set({ volume: -96 });
    let mixer;
    if (!voices.length) {
        const fundamental = getVoice0();
        voices.push(fundamental);
        const noise = getVoice3();
        voices.push(noise);
        // const delay = getVoiceD(noise.output);
        // voices.push(delay);

        console.log(voices);
        mixer = getMixer(voices)
    }


    // expose in console for debugging
    window.voices = voices;
    window.mixer = mixer;
}

export async function play() {

    for (let voice of voices) {
        console.log('starting voice', voice)
        voice.start();
    }
    Tone.getDestination().volume.rampTo(0, 1);
}


export function pause() {
    Tone.getDestination().volume.rampTo(-96, 1);

}




// export function playThere(feature: any) {
//     const lng = feature.geometry.coordinates[0];
//     const newVco = Math.abs(lng) / 180;
//     setBaseFreq(newVco);
//     const lat = feature.geometry.coordinates[1];
//     const newLfo = Math.abs(lat / 6 / 30);
//     setDelayFreq(newLfo);
//     play();
// }

// export function playWeather({ temperature, elevationMeters, precipitation, humidity }: any) {
//     console.log(temperature);
//     console.log(precipitation);
//     const newVco = temperature * 5;
//     setBaseFreq(newVco);
//     const newLfo = elevationMeters / 10;
//     setDelayFreq(newLfo);
//     const newCutoff = humidity.value / 100 * 300;
//     setFilterCutoff(newCutoff);
//     play();
// }

// export function setBaseFreq(newFreq: number) {
//     const vcoFreq = newFreq;
//     vco1.set({ frequency: vcoFreq });
//     console.log('set vco1 to', vcoFreq);
// }

// export function setDelayFreq(newFreq: number) {
//     lfo.set({ frequency: newFreq });
//     console.log('set lfo to', newFreq);

// }

// export function setFilterCutoff(newFreq: number) {
//     filter.set({ frequency: newFreq });
//     console.log('set cutoff to', newFreq);

// }
