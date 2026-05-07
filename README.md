# hearthere

Tune in to the sounds of weather around the world

## Overview

Inspired by Quintronics' [weatherfortheblind.org](https://weatherfortheblind.org/) analog synthesizer sonification of data from an analog weather station, this is an attempt to create a similar sonification synth digitally in the browser with the WebAudio API and related tools.

Undertaken as Anjana's  F2'25 "Impossible Stuff Day" project for batch at the [Recurse Center](https://recurse.com).

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

### Fire

**Source:** FM oscillator — triangle carrier with square wave modulator  
**Synthesis:** FM synthesis with dual LFOs and delay:
- Lowpass filter, frequency modulated by LFO
- Feedback delay, delay time modulated by second LFO

**Signal path:** FM Oscillator → lowpass → feedback delay → gain

**Weather data:**
- `is_day` → controls volume (louder during day, quieter at night)
- `cloud_cover` → modulates the max frequency of the cutoff LFO. Clear skies = higher/brighter, cloudy = lower/darker

### Air

**Source:** Pink noise generator  
**Synthesis:** Filtered noise with delay:
- Lowpass filter, frequency modulated by LFO
- Feedback delay

**Signal path:** Noise → feedback delay → lowpass → gain

**Weather data:**
- `wind_speed` → modulates LFO frequency (more wind = faster modulation)
- `wind_gusts` → modulates LFO max range via the ratio of gusts to wind speed. Higher gusts expand the sweep range

## Tools/Resources/Inspiration

- [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [ToneJS](https://tonejs.github.io/)
- (h/t ToneJS website): https://www.soundonsound.com/techniques/whats-sound
- (h/t ToneJS website): https://github.com/cwilso/midi-synth
- (h/t Flavius & Joseph): [VCV Rack](https://vcvrack.com/Rack) for experimenting/prototyping sounds


## Roadmap

Impossible stuff day:
- [x] Make a repo
- [x] Scaffold a vanilla TS project with Vite

- [ ] Build the Synth
  - [x] Decide which tool(s) to use (Tone.js? vanilla WebAudio API?)
  - [x] Generate the simplest possible sound
  - [ ] ...draw the rest of the owl

Beyond impossible stuff day: 
- [ ] Build the UI
  - [x] Make a play/pause button that plays/stops sound
  - [x] World map to browse locations
  - [ ] (stretch) Visualization to go along with the sound? 

- [ ] Get the Weather Data
  - [x] Basic prototype with any weather API (weather.gov)
  - [ ] Get live streaming open weather data, if available
  - [ ] or build a DIY weather station(s)


## Notes from chat with Joseph

"What control means (in audio) sense" - Joseph

- Trigger (raindrop makes sound play)
- Pulse (signal turns on, another word for trigger)
- Modulate (continuously change parameter)
- Envelope (Attack Decay Sustain Release, etc)
- Sequence (sequencer plays xyz over time)
- Voices (different voices interact)
- Reverb (makes voices sound like they're in the same room)


Think about: 
- What triggers we will have
- What inputs correspond to which voice(s)
- How voices will modulate each other
- Final output mixed together


Music theory: 
- Consonance vs dissonance
- Staying still: chords, drones
- Motion: variation creates movement, e.g. move to relative (minor) key feels "sad"


Synth stuff: 

- "Filters are sick" - Joseph
- 80's is additive synthesis
- 60's-70's is subtractive synthesis, sounds warmer
- Low Pass (remove high freqs) vs High Pass (remove low freqs) Filter
- Delay & Reverb - definitely used a lot in weatherfortheblind