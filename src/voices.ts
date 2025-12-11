import * as Tone from "tone";

// types

export interface Voice {
    name: string;
    source?: Tone.Oscillator | Tone.FatOscillator | Tone.PWMOscillator | Tone.FMOscillator | Tone.Noise;
    lfo?: Tone.LFO | Tone.PulseOscillator | Tone.Oscillator;
    delay?: Tone.FeedbackDelay;
    filters?: {
        [name: string]: Tone.Filter | Tone.AutoFilter | Tone.BiquadFilter
    };
    start: () => void;
    stop?: () => void;
    output?: Tone.ToneAudioNode;
    gain: Tone.Unit.GainFactor;
}



// Voice 0: F0


export function getVoice0(): Voice {
    let name = "fundamental";
    let gain = -10;
    let freq = 174; // F3
    let lfoFreq = 0.03;
    let cutoffFreq = { min: 600, max: 1400 }; 
    const voice: Voice = {
        name,
        gain,
        source: new Tone.Oscillator({
            frequency: freq,
            type: "triangle",
        }),
        lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
        filters: {
            harmonics: new Tone.Filter({
                frequency: 174,
                type: 'lowpass',
            }),
            dampening: new Tone.Filter({
                type: "peaking",
                frequency: 174,
                gain: -6,
                rolloff: -24,
            }),
            sweep: new Tone.Filter({
                frequency: cutoffFreq.min,
                type: 'lowpass',
                Q: 30, 
            }),
        },

        // placeholders
        start: () => { },
        output: undefined,
    };


    voice.lfo!.connect(voice.filters!.sweep.frequency);
    voice.source!.chain(
        voice.filters!.harmonics,
        voice.filters!.dampening,
        voice.filters!.sweep,
    ); 

    voice.output = voice.filters!.sweep;

    voice.start = () => {
        voice.lfo!.start();
        voice.source!.start();
    };
    return voice;
}



// Voice 1

export const getVoice1 = (): Voice => {
    let name = 'depth';
    let freq = 220; // A3
    let lfoFreq = 0.01;
    let cutoffFreq = {
        min: 522 * 0.7,
        max: 522 * 1.3,
    };
    let gain = -3.5;
    const voice: Voice = {
        name,
        gain,
        source: new Tone.Oscillator({
            frequency: freq,
            type: "triangle",
        }),
        lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
        filters: {
            harmonics: new Tone.Filter({
                frequency: freq,
                type: 'lowpass',
            }),
            dampening: new Tone.Filter({
                type: "peaking",
                frequency: freq,
                gain: -12,
            }),
            sweep: new Tone.Filter({
                frequency: cutoffFreq.min,
                type: 'lowpass',
                Q: 30,
            }),
        },

        // placeholders
        start: () => { },
        output: undefined,
    };


    voice.lfo!.connect(voice.filters!.sweep.frequency);
    voice.source!.chain(
        voice.filters!.harmonics,
        voice.filters!.dampening,
        voice.filters!.sweep,
    );

    voice.output = voice.filters!.sweep;

    voice.start = () => {
        voice.lfo!.start();
        voice.source!.start();
    };
    return voice;
}



// Voice 2: Spacey

let lfo20;
let vco2;

let lfo21;
let filter2;

let lfo22;
let delay2;

export const getVoice2 = (): Voice => {
    let name = 'spacey';
    let freq = 328; // D3
    let lfo0Freq = 0.026;
    let lfo1Freq = 0.01;
    let cutoffFreq = {
        min: 1326 * 53,
        max: 1326 * 53,
    };
    let gain = -11.25;
    const voice: Voice = {
        name,
        gain,
        source: new Tone.FMOscillator({
            frequency: freq,
            type: "triangle",
            modulationType: "square",
            harmonicity: 0.0005,
            modulationIndex: 0.5

        }),
        lfo: new Tone.Oscillator({
            frequency: 0.03,
            type: "square",
        }),

        filters: {
            // harmonics: new Tone.Filter({
            //     frequency: freq,
            //     type: 'lowpass',
            // }),
            // dampening: new Tone.Filter({
            //     type: "peaking",
            //     frequency: freq,
            //     gain: -12,
            // }),
            // sweep: new Tone.Filter({
            //     frequency: cutoffFreq.min,
            //     type: 'lowpass',
            //     Q: 30,
            // }),
        },

        // placeholders
        start: () => { },
        output: undefined,
    };


    voice.lfo!.connect((voice.source as Tone.Oscillator).frequency);
    // voice.source!.chain(
    //     voice.filters!.harmonics,
    //     voice.filters!.dampening,
    //     voice.filters!.sweep,
    // );

    voice.output = voice.source;

    voice.start = () => {
        // voice.lfo!.start();
        voice.source!.start();
    };
    return voice;
}




// Voice 3: Noise

export const getVoice3 = (): Voice => {
    let name = 'noise';
    let color: Tone.NoiseType = 'pink';
    let delayTime = 0.18;
    let lfoFreq = 0.16;
    let cutoffFreq = {
        min: 1054 * 0.75,
        max: 1054 * 1.25
    };
    let gain = -17.5;
    const voice: Voice = {
        name,
        gain,
        source: new Tone.Noise(color),
        lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
        delay: new Tone.FeedbackDelay({
            delayTime,
            feedback: 0.6
        }),
        filters: {
            lowpass: new Tone.Filter({
                frequency: cutoffFreq.max,
                type: 'lowpass',
            }),
        },
        output: undefined, // placeholder
        start: () => { }, // placeholder
    };

    voice.lfo!.connect(
            voice.filters!.lowpass.frequency
        );
    voice.source!.chain(
            voice.delay!,
            voice.filters!.lowpass,
        // Tone.getDestination()
        );
    voice.output = voice.filters!.lowpass;
    voice.source!.debug = true;
    voice.output!.debug = true;

    voice.start = () => {

        voice.lfo!.start();
        voice.source!.start()!
    }
    return voice;
}


// Mix (dB units)
let levels = [
    0,
    -3.5,
    -11.25,
    -17.9,
];

export const getMixer = (inputs: Voice[]) => {
    console.log('getMixer', inputs)
    const merge = new Tone.Merge(1);
    inputs.map((voice, i) => {
        console.log('connecting voice', voice)
        const gain = new Tone.Gain(voice.gain, 'decibels');
        voice.output!.connect(gain);
        gain.connect(merge);
    });
    merge.toDestination()
    return merge;
}


// Final Delay

export const getVoiceD = (input: Voice['output']) => {
    let name = 'delay';
    let lfoFreq = 0.01;
    let delayTime = { min: 0.2, max: 0.3 };
    const voice = {
        name,
        lfo: new Tone.LFO(lfoFreq, delayTime.min, delayTime.max),
        delay: new Tone.FeedbackDelay({
            delayTime: delayTime.min,
            feedback: 0.36
        }),
        start: () => { }, // placeholder
        output: Tone.getDestination().output,
    };
    voice.start = () => {
        voice.lfo.connect(voice.delay.delayTime);
        // voice.lfo.connect(voice.resonanceFilter.frequency)
        input!.chain(
            voice.delay,
            Tone.getDestination()
        );

        voice.lfo.start();
    }
    return voice;
}