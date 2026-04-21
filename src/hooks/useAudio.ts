import { useCallback, useRef, useState } from 'react'
import * as Tone from 'tone'
import { getMixer, getVoice0, type Voice } from '../voices'

export function useAudio() {
  const [playing, setPlaying] = useState(false)
  const voicesRef = useRef<Voice[]>([])
  const initializedRef = useRef(false)

  const init = useCallback(async () => {
    if (initializedRef.current) return
    initializedRef.current = true

    await Tone.start()
    Tone.getDestination().set({ volume: -96 })

    const fundamental = getVoice0()
    voicesRef.current = [fundamental]

    getMixer(voicesRef.current)

    ;(window as typeof window & { voices?: Voice[] }).voices = voicesRef.current
  }, [])

  const toggle = useCallback(async () => {
    if (!initializedRef.current) {
      await init()
    }

    if (playing) {
      Tone.getDestination().volume.rampTo(-96, 1)
      setPlaying(false)
    } else {
      for (const voice of voicesRef.current) {
        voice.start()
      }
      Tone.getDestination().volume.rampTo(0, 1)
      setPlaying(true)
    }
  }, [playing, init])

  return { playing, toggle, init }
}