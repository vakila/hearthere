# hearthere

Tune in to the sounds of weather around the world

## Overview

Inspired by Quintronics' [weatherfortheblind.org](https://weatherfortheblind.org/) analog synthesizer sonification of data from an analog weather station, this is an attempt to create a similar sonification synth digitally in the browser with the WebAudio API and related tools.

Began as Anjana's "Impossible Stuff Day" project at the [Recurse Center](https://recurse.com), Fall 2025.

## Voices

Each voice maps weather data to synthesis parameters, creating a unique sonic character. All voices are built with Tone.js and share a common interface: a source generator, LFOs for modulation, filters, optional delay, and a gain node.

### Earth

**Source:** Triangle oscillator  
**Synthesis:** Subtractive synthesis with a 3-filter chain in series:
- Highshelf filter (harmonics)
- Bandpass filter (dampening)
- Lowpass filter (sweep, modulated by LFO)

**Signal path:** Oscillator → harmonics → dampening → sweep → gain

**Weather data:**
- `temperature` → modulates oscillator frequency and filter frequencies
- `apparent_temperature` ("feels like") → modulates LFO cutoff frequency via the ratio of temperature to apparent temperature

### Water

**Source:** Triangle oscillator  
**Synthesis:** Subtractive synthesis with a 3-filter chain in series:
- Highshelf filter (harmonics)
- Bandpass filter (sweep, Q modulated by humidity)
- Lowpass filter (dampening)

**Signal path:** Oscillator → harmonics → sweep → dampening → gain

**Weather data:**
- `relative_humidity` → maps humidity to filter Q/resonance
- `precipitation` → increases LFO modulation rate

### Air

**Source:** Pink noise generator  
**Synthesis:** Filtered noise with delay:
- Lowpass filter, frequency modulated by LFO
- Feedback delay

**Signal path:** Noise → feedback delay → lowpass → gain

**Weather data:**
- `wind_speed` → modulates LFO frequency (more wind = faster modulation)
- `wind_gusts` → modulates LFO max range via the ratio of gusts to wind speed. Higher gusts expand the sweep range


### Fire

**Source:** FM oscillator — triangle carrier with square wave modulator  
**Synthesis:** FM synthesis with dual LFOs and delay:
- Lowpass filter, frequency modulated by LFO
- Feedback delay, delay time modulated by second LFO

**Signal path:** FM Oscillator → lowpass → feedback delay → gain

**Weather data:**
- `is_day` → controls volume (louder during day, quieter at night)
- `cloud_cover` → modulates the max frequency of the cutoff LFO. Clear skies = higher/brighter, cloudy = lower/darker


## Links

### Tools & Libraries
- [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Tone.js](https://tonejs.github.io/)
- [OpenMeteo API](https://open-meteo.com)
- [WebAudio Studio](https://webaudio.studio) for understanding/experimenting/prototyping with WebAudio API
- [VCV Rack](https://vcvrack.com/Rack) for experimenting/prototyping sounds on desktop

### Learning resources

- [Your First Synth Patch](soundandsynthesis.com/firstsynthpatch
) free intro course by Sarah Belle Reid, uses VCV Rack
- [What's sound](https://www.soundonsound.com/techniques/whats-sound) oldie-but-goodie, multi-part deep dive

### Sonification inspiration

- [Data Sonification Archive](https://sonification.design) with tons of examples
- [Data Sonification Canvas](https://sonification.design/assets/resource/Data_sonification_canvas.pdf) Sonification design template
- [Loud Numbers](https://www.loudnumbers.net/) Sonification studio with cool podcast & tooling
- [Open Sonifications](https://opensonifications.net/) Manifesto & vision for a wide range of sonifications

## Acknowledgements

Huge thank you to my Recurse Center Fall 2 2025 batchmates: 

- Flavius Popan & Joseph Abrahamson for explaining audio synthesis and helping me reverse-engineer Weather Warlock sounds
- Jack Heard for helping me debug sounds
- C Stavridis for helping me think through design
- Emma Smith for pointing me to Sarah Belle Reid's synthesis course
