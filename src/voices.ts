import * as Tone from "tone";

interface VoiceOptions {
    value: number;
    name: string;
}
class Voice {
    // Housekeeping
    name: string;
    index: number;

    // Audio pipeline
    delay?: any;
    lfo?: any;
    filter?: any;

    // Modulation
    inputSource: any;
    inputName: string;
    inputValue: number;


    static * getNextIndex(): Generator<number, number, number> {
        let i = 0;
        while (true) {
            yield i;
            i++;
        }
    }
    static indexGenerator = this.getNextIndex();

    constructor({ value, name }: VoiceOptions) {
        this.index = Voice.indexGenerator.next().value;
        this.name = name || `Voice ${this.index}`;
        this.delay = 'i am delay';
        this.lfo = 'i am lfo';
        this.filter = 'i am filter';
        this.inputName = 'filter freq'
        this.inputValue = value || 0;

    }

}


class OscVoice extends Voice {


    constructor(options: VoiceOptions & { color?: string }) {
        super(options);


    }
}


class NoiseVoice extends Voice {
    color: string;


    constructor(options: VoiceOptions & { color?: string }) {
        super(options);
        this.color = options.color || 'pink'


    }
}


// Voice 0: F0


export function getVoice0() {
    let freq = 174; // F3
    let lfoFreq = 0.03;
    let cutoffFreq = { min: 800, max: 1200 };
    const voice = {
        freq,
        lfoFreq,
        vco: new Tone.Oscillator({
            frequency: freq,
            type: "sine",
        }),
        lfo: new Tone.LFO(lfoFreq, cutoffFreq.min, cutoffFreq.max),
        lowpassFilter: new Tone.Filter({
            frequency: cutoffFreq.max,
            type: 'lowpass',
            Q: 80, // ? TODO
        }),
        // resonanceFilter: new Tone.Filter({
        //     frequency: cutoffFreq.max,
        //     type: 'peaking',
        //     Q: 50,
        //     gain: 24,
        // }),
        resonanceFilter: new Tone.FeedbackCombFilter({
            delayTime: 0.0001,
            resonance: 0.58,
        }),
        start: () => { }, // placeholder 
    };



    voice.start = () => {
        voice.lfo.connect(voice.lowpassFilter.frequency);
        // voice.lfo.connect(voice.resonanceFilter.frequency)
        voice.vco.chain(
            voice.lowpassFilter,
            voice.resonanceFilter,
            Tone.getDestination()
        ); 
        voice.lfo.start();
        voice.vco.start();
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

const v3 = new NoiseVoice({ name: 'Noise', value: 0, color: 'pink' });

let noise = 'red';
let delay3;
let lfo3;
let filter3;


// Mix (dB units)
let level0 = 0; 
let level1 = -3.5; 
let level2 = -11.25;
let level3 = -17.9;



// Final Delay

let lfoZ;
let delayZ;
