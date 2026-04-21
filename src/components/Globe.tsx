import { useEffect, useRef } from 'react'
import { Map, type LngLatLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import STATION_SRC from '../stations.geo.json'
import type { FeatureCollection } from 'geojson'

const STATIONS = Object.fromEntries(
  STATION_SRC.features.map((feat) => [
    feat.properties.name,
    feat.geometry.coordinates as LngLatLike,
  ])
)

const COLORS = {
  DeepBlue: '#101d30',
  DeepGreen: '#162d11',
  Yellow: '#f5ee1eff',
}

interface GlobeProps {
  onInit?: () => void
}

export default function Globe({ onInit }: GlobeProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<Map | null>(null)

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return

    const map = new Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          satellite: {
            type: 'raster',
            tiles: [
              'https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg',
            ],
            tileSize: 256,
          },
          maplibre: {
            url: 'https://demotiles.maplibre.org/tiles/tiles.json',
            type: 'vector',
          },
        },
        layers: [
          {
            id: 'background',
            type: 'background',
            paint: { 'background-color': COLORS.DeepBlue },
            layout: { visibility: 'visible' },
            maxzoom: 24,
          },
          {
            id: 'land',
            type: 'fill',
            source: 'maplibre',
            'source-layer': 'countries',
            paint: { 'fill-color': COLORS.DeepGreen },
          },
          {
            id: 'coastline',
            type: 'line',
            paint: {
              'line-blur': 0.5,
              'line-color': COLORS.DeepGreen,
              'line-width': {
                stops: [
                  [0, 2],
                  [6, 6],
                  [14, 9],
                  [22, 18],
                ],
              } as unknown as number,
            },
            filter: ['all'],
            layout: {
              'line-cap': 'round',
              'line-join': 'round',
              visibility: 'visible',
            },
            source: 'maplibre',
            maxzoom: 24,
            minzoom: 0,
            'source-layer': 'countries',
          },
          {
            id: 'satellite',
            type: 'raster',
            source: 'satellite',
          },
        ],
      },
      zoom: 1.5,
      center: STATIONS.Brooklyn,
      canvasContextAttributes: {
        antialias: true,
        alpha: true,
      },
    })

    map.on('style.load', () => {
      map.setProjection({ type: 'globe' })

      map.addSource('stations', {
        type: 'geojson',
        data: STATION_SRC as FeatureCollection,
      })

      map.addLayer({
        id: 'stations',
        type: 'circle',
        source: 'stations',
        paint: {
          'circle-radius': 10,
          'circle-color': COLORS.Yellow,
        },
      })

      map.on('mouseenter', 'stations', () => {
        map.getCanvas().style.cursor = 'pointer'
      })

      map.on('mouseleave', 'stations', () => {
        map.getCanvas().style.cursor = ''
      })

      onInit?.()
    })

    mapRef.current = map

    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [onInit])

  return <div ref={mapContainerRef} className="globe" />
}