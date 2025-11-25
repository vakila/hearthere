import * as Tone from "tone";

// interface VoiceOptions {
//     value: number;
//     name: string;
// }
// class Voice {
//     // Housekeeping
//     name: string;
//     index: number;

//     // Audio pipeline
//     delay?: any;
//     lfo?: any;
//     filter?: any;

//     // Modulation
//     inputSource: any;
//     inputName: string;
//     inputValue: number;


//     static * getNextIndex(): Generator<number, number, number> {
//         let i = 0;
//         while (true) {
//             yield i;
//             i++;
//         }
//     }
//     static indexGenerator = this.getNextIndex();

//     constructor({ value, name }: VoiceOptions) {
//         this.index = Voice.indexGenerator.next().value;
//         this.name = name || `Voice ${this.index}`;
//         this.delay = 'i am delay';
//         this.lfo = 'i am lfo';
//         this.filter = 'i am filter';
//         this.inputName = 'filter freq'
//         this.inputValue = value || 0;

//     }

// }


// class OscVoice extends Voice {


//     constructor(options: VoiceOptions & { color?: string }) {
//         super(options);


//     }
// }


// class NoiseVoice extends Voice {
//     color: string;


//     constructor(options: VoiceOptions & { color?: string }) {
//         super(options);
//         this.color = options.color || 'pink'


//     }
// }

// types

export interface Voice {
    name: string;
    source?: Tone.Oscillator | Tone.Noise;
    lfo?: Tone.LFO;
    delay?: Tone.FeedbackDelay;
    filters?: {
        [name: string]: Tone.Filter
    };
    start: () => void;
    stop?: () => void;
    output?: Tone.ToneAudioNode;
    gain: Tone.Unit.GainFactor;
}



// Voice 0: F0


export function getVoice0(): Voice {
    let name = "fundamental";
    let gain = 0;
    let freq = 174; // F3
    let lfoFreq = 0.03;
    let cutoffFreq = { min: 800, max: 1200 };
    const voice: Voice = {
        name,
        gain,
        source: new Tone.Oscillator({
            frequency: freq,
            type: "sine",
        }),
        lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
        filters: {
            lowpass: new Tone.Filter({
                frequency: cutoffFreq.min,
                type: 'lowpass',
                Q: 40, // ? TODO

            }),

            // highpass: new Tone.Filter({
            //     frequency: cutoffFreq.min,
            //     type: 'highpass',
            // // Q: 20, // ? TODO
            // }),

            // resonance: new Tone.FeedbackCombFilter({
            //     delayTime: 0.0001,
            //     resonance: 0.58,
            // }),

            resonance: new Tone.Filter({
                frequency: cutoffFreq.min,
                type: 'peaking',
                Q: 20,
                gain: 3,
            }),

        },

        // placeholders
        start: () => { },
        output: undefined,
    };


    voice.lfo!.connect(voice.filters!.lowpass.frequency);
    voice.lfo!.connect(voice.filters!.resonance.frequency);
    voice.source!.chain(
        voice.filters!.resonance,
        voice.filters!.lowpass,
        // voice.filters!.highpass,
        // Tone.getDestination()
    ); 

    voice.output = voice.filters!.lowpass;
    voice.filters!.lowpass.debug = true;
    // voice.filters!.resonance.debug = true;
    voice.source!.debug = true;
    voice.lfo!.debug = true;

    voice.start = () => {
        voice.lfo!.start();
        voice.source!.start();
    };
    return voice;
}




// Voice 1: Spacey
let lfo10;
let vco1;

let lfo11;
let filter1;




// Voice 2: Wildcard?

let lfo20;
let vco2;

let lfo21;
let filter2;

let lfo22;
let delay2;




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
    let gain = -10;//-3.5;
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