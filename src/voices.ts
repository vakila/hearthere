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

const v0 = new OscVoice({
    name: 'Fundamental',
    value: 174, // F3

})


export function getVoice0() {
    let freq = 174; // F3
    let lfoFreq = 0.03;
    let cutoffFreq = 1000;
    const voice = {
        freq,
        lfoFreq,
        vco: new Tone.Oscillator({
            frequency: freq,
            type: "sine",
        }),
        lfo: new Tone.LFO(lfoFreq, 800, 1200),

        lowpassFilter: new Tone.Filter({
            frequency: cutoffFreq,
            type: 'lowpass',
            Q: 58, // Resonance? TODO
            rolloff: -12,
        }),
        resonanceFilter: new Tone.LowpassCombFilter({
            delayTime: 0.0001,
            resonance: 0.58,
            dampening: 500,
        }),
        start: () => { }, // placeholder 
    };


    voice.lfo.connect(voice.lowpassFilter.frequency);
    voice.vco.chain(voice.lowpassFilter, Tone.getDestination()); 
    voice.start = () => {
        voice.lfo.start();
        voice.vco.start();
    };
    console.log(voice);
    window.voice = voice;
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
