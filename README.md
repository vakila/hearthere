# hearthere

Tune in to the sounds of weather around the world

## Overview

Inspired by Quintronics' [weatherfortheblind.org](https://weatherfortheblind.org/) analog synthesizer sonification of data from an analog weather station, this is an attempt to create a similar sonification synth digitally in the browser with the WebAudio API and related tools.

Undertaken as Anjana's  F2'25 "Impossible Stuff Day" project for batch at the [Recurse Center](https://recurse.com).

## Tools/Resources/Inspiration

- [WebAudio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [ToneJS](https://tonejs.github.io/)
- (h/t ToneJS website): https://www.soundonsound.com/techniques/whats-sound
- (h/t ToneJS website): https://github.com/cwilso/midi-synth


## Roadmap

Impossible stuff day:
- [x] Make a repo
- [x] Scaffold a vanilla TS project with Vite

- [ ] Build the Synth
  - [ ] Decide which tool(s) to use (Tone.js? vanilla WebAudio API?)
  - [ ] Generate the simplest possible sound
  - [ ] ...draw the rest of the owl

Beyond impossible stuff day: 
- [ ] Build the UI
  - [ ] Make a play/pause button that plays/stops sound
  - [ ] World map to browse locations
  - [ ] (stretch) Visualization to go along with the sound? 

- [ ] Get the Data
  - [ ] Get live streaming open weather data, if available
  - [ ] or build a DIY weather station(s)
