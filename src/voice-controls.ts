type VoiceState = {
  [key: string]: boolean;
};

const voiceState: VoiceState = {
  earth: false,
  air: false,
  water: false,
  fire: false,
};

function toggleVoice(voice: string, button: HTMLButtonElement, container: HTMLElement) {
  voiceState[voice] = !voiceState[voice];
  const isActive = voiceState[voice];
  button.textContent = isActive ? "ON" : "OFF";
  button.classList.toggle("active", isActive);
  container.classList.toggle("disabled", !isActive);
  console.log(`Voice "${voice}" ${isActive ? "enabled" : "disabled"}`);
}

function setupVoiceControls() {
  const controls = document.querySelectorAll<HTMLButtonElement>(".voice-toggle");
  controls.forEach((button) => {
    button.addEventListener("click", (e) => {
      e.stopPropagation();
      const voice = button.dataset.voice;
      if (!voice) return;
      const container = button.closest(".voice-control");
      if (!container) return;
      toggleVoice(voice, button, container);
    });
  });

  const voiceContainers = document.querySelectorAll<HTMLElement>(".voice-control");
  voiceContainers.forEach((container) => {
    container.addEventListener("click", () => {
      const button = container.querySelector<HTMLButtonElement>(".voice-toggle");
      const voice = button?.dataset.voice;
      if (!voice || !button) return;
      toggleVoice(voice, button, container);
    });
  });
}

export function updateDataValue(elementId: string, value: string | number) {
  const container = document.getElementById(elementId);
  if (!container) return;
  const valueEl = container.querySelector<HTMLElement>(".data-value");
  if (valueEl) {
    valueEl.textContent = String(value);
  }
}

setupVoiceControls();
