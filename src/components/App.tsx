import Globe from './Globe'
import Controls from './Controls'
import { useAudio } from '../hooks/useAudio'

export default function App() {
  const { playing, toggle, init } = useAudio()

  return (
    <div className="app">
      <div id="map" className="map-container">
        <Globe onInit={init} />
      </div>
      <div className="info-card">
        <Controls playing={playing} onToggle={toggle} />
      </div>
    </div>
  )
}