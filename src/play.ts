// import { FeedbackDelay, Filter, LFO, Merge, PolySynth, PulseOscillator, Synth, start as toneStart } from "tone";

import * as Tone from "tone";

import { getMixer, getVoice0, getVoice3, getVoiceD } from "./voices";


const F3maj = ["F3", "A3", "C3"];

let voices: { start: () => void }[] = [];

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
        // mixer = new Tone.Merge(1).toDestination();
        // noise.output!.connect(mixer);
        // mixer = getMixer([
        //     // [fundamental, 0],
        //     // // let level1 = -3.5;
        //     // // let level2 = -11.25;
        //     // [noise, 0],
        // ]);
        // mixer.debug = true;
    }

    console.log(voices);
    // expose in console for debugging
    window.voices = voices;
    window.mixer = mixer;
}

export async function play() {

    for (let voice of voices) {
        voice.start();
    }
    Tone.getDestination().volume.rampTo(0, 1);
}


export function pause() {
    Tone.getDestination().volume.rampTo(-96, 1);

}


function getVoice1() {


    // Oscillator with PWM
    const vco1 = new Tone.PulseOscillator(260, 0.37);


    // to low-pass filter
    const filter = new Tone.Filter(250, "lowpass");
    vco1.connect(filter);

    // to LFO-modulated Delay
    const lfo = new Tone.LFO(0.05, 0.3, 0.5);
    const delay = new Tone.FeedbackDelay(0.4, 0.5);
    lfo.connect(delay.delayTime);
    filter.connect(delay);

    // hook it all up

    const merge = new Tone.Merge(1);
    delay.connect(merge);

    return merge;

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
