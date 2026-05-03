import {
  initializeTone,
  VOICES,
  toggleVoice,
  setVoiceGain,
  playAudio,
  pauseAudio,
} from "./voices";
import { marker } from "./globe";

const togglePlaying = async () => {
  const markerEl = marker.getElement();
  if (!markerEl) return;
  let playing = markerEl.dataset.playing;
  if (playing === "init") {
    await initializeTone();
    playing = "false";
  }
  if (playing === "true") {
    pauseAudio();
    markerEl.dataset.playing = "false";
    updateMarkerIcon(false);
  } else {
    await playAudio();
    markerEl.dataset.playing = "true";
    updateMarkerIcon(true);
  }
};

function updateMarkerIcon(playing: boolean) {
  const markerEl = marker.getElement();
  if (!markerEl) return;
  const svg =
    markerEl.tagName === "svg" ? markerEl : markerEl.querySelector("svg");
  if (!svg) return;
  const circle = svg.querySelector("circle");
  if (!circle) return;

  const existingIcon = svg.querySelector(".marker-play-pause-icon");
  if (existingIcon) existingIcon.remove();

  const cx = parseFloat(circle.getAttribute("cx") || "0");
  const cy = parseFloat(circle.getAttribute("cy") || "0");
  const r = parseFloat(circle.getAttribute("r") || "10");

  if (playing) {
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    g.classList.add("marker-play-pause-icon");
    g.setAttribute("fill", "var(--color-hear");

    const barWidth = r * 0.15;
    const barHeight = r * 0.6;
    const barY = cy - barHeight / 2;
    const gap = r * 0.1;

    const rect1 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rect1.setAttribute("x", (cx - gap / 2 - barWidth).toString());
    rect1.setAttribute("y", barY.toString());
    rect1.setAttribute("width", barWidth.toString());
    rect1.setAttribute("height", barHeight.toString());

    const rect2 = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "rect",
    );
    rect2.setAttribute("x", (cx + gap / 2).toString());
    rect2.setAttribute("y", barY.toString());
    rect2.setAttribute("width", barWidth.toString());
    rect2.setAttribute("height", barHeight.toString());

    g.appendChild(rect1);
    g.appendChild(rect2);
    circle.parentNode?.appendChild(g);
  } else {
    const polygon = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "polygon",
    );
    polygon.classList.add("marker-play-pause-icon");
    polygon.setAttribute("fill", "var(--color-hear)");

    const triangleSize = r * 0.6;
    const points = [
      `${cx - triangleSize * 0.3},${cy - triangleSize * 0.4}`,
      `${cx + triangleSize * 0.5},${cy}`,
      `${cx - triangleSize * 0.3},${cy + triangleSize * 0.4}`,
    ].join(" ");
    polygon.setAttribute("points", points);
    circle.parentNode?.appendChild(polygon);
  }
}

function setupPlayPauseButton() {
  const svg = marker.getElement();
  svg.dataset.playing = "init";
  updateMarkerIcon(false);
  svg.addEventListener("click", () => togglePlaying());
}
setupPlayPauseButton();

function setupVoiceControls() {
  const controls =
    document.querySelectorAll<HTMLButtonElement>(".voice-toggle");
  controls.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const voice = button.dataset.voice;
      if (!voice) return;
      const container = button.closest<HTMLElement>(".voice-control");
      if (!container) return;

      const isActive = toggleVoice(voice);
      button.textContent = isActive ? "ON" : "OFF";
      button.classList.toggle("active", isActive);
      container.classList.toggle("disabled", !isActive);

      const slider = container.querySelector<HTMLInputElement>(".voice-gain");
      if (slider) {
        slider.value = isActive ? VOICES[voice].currentGain.toString() : "-48";
      }
    });
  });

  const voiceControls =
    document.querySelectorAll<HTMLElement>(".voice-control");
  voiceControls.forEach((container) => {
    container.addEventListener("click", () => {
      const button =
        container.querySelector<HTMLButtonElement>(".voice-toggle");
      const voice = button?.dataset.voice;
      if (!voice || !button) return;

      const isActive = toggleVoice(voice);
      button.textContent = isActive ? "ON" : "OFF";
      button.classList.toggle("active", isActive);
      container.classList.toggle("disabled", !isActive);

      const slider = container.querySelector<HTMLInputElement>(".voice-gain");
      if (slider) {
        slider.value = isActive ? VOICES[voice].currentGain.toString() : "-48";
      }
    });
  });

  const gainSliders =
    document.querySelectorAll<HTMLInputElement>(".voice-gain");
  gainSliders.forEach((slider) => {
    slider.addEventListener("input", (e) => {
      e.stopPropagation();
      const voiceName = slider.dataset.voice;
      if (!voiceName) return;
      const gainValue = parseFloat(slider.value);
      setVoiceGain(voiceName, gainValue);
    });
    slider.addEventListener("click", (e) => {
      e.stopPropagation();
    });
  });
}

setupVoiceControls();
