interface ControlsProps {
  playing: boolean
  onToggle: () => void
}

export default function Controls({ playing, onToggle }: ControlsProps) {
  return (
    <div className="controls">
      <h1>hear there</h1>
      <button onClick={onToggle} type="button">
        {playing ? 'pause' : 'play'}
      </button>
      <div className="synth-controls">
        <label>
          base freq
          <input id="freq" type="range" value="270" min="100" max="500" />
        </label>
        <label>
          delay LFO freq
          <input id="lfo-freq" type="range" value="0.1" min="0.05" max="0.2" step="0.01" />
        </label>
        <label>
          filter cutoff
          <input id="filter-freq" type="range" value="270" min="100" max="500" />
        </label>
      </div>
      <p className="read-the-docs">
        An homage to{' '}
        <a href="https://weatherfortheblind.org" target="_blank" rel="noopener noreferrer">
          weatherfortheblind.org
        </a>
      </p>
      <p className="read-the-docs">
        Made with{' '}
        <a href="https://maplibre.org" target="_blank" rel="noopener noreferrer">
          Maplibre
        </a>
        ,{' '}
        <a href="https://tonejs.github.io/" target="_blank" rel="noopener noreferrer">
          Tone.js
        </a>
        ,<a href="https://vite.dev/" target="_blank" rel="noopener noreferrer">
          Vite
        </a>
        ,<a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          React
        </a>
        ,<a href="https://typescriptlang.org" target="_blank" rel="noopener noreferrer">
          TypeScript
        </a>
        , and love at the{' '}
        <a href="https://recurse.com" target="_blank" rel="noopener noreferrer">
          Recurse Center
        </a>
      </p>
    </div>
  )
}