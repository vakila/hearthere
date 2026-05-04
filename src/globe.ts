import "maplibre-gl/dist/maplibre-gl.css"; // Map styles
import { Map, Marker } from "maplibre-gl";

const BERLIN = {
  lat: 52.52,
  lon: 13.41,
};

export const map = new Map({
  container: "map",
  style: {
    version: 8,
    sources: {
      satellite: {
        type: "raster",
        tiles: [
          "https://tiles.maps.eox.at/wmts/1.0.0/s2cloudless-2020_3857/default/g/{z}/{y}/{x}.jpg",
        ],
        tileSize: 256,
      },
      maplibre: {
        url: "https://demotiles.maplibre.org/tiles/tiles.json",
        type: "vector",
      },
    },
    layers: [
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
      },
    ],
  },
  zoom: 4,
  center: BERLIN,
  pitch: 80,
  canvasContextAttributes: {
    antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
    alpha: true,
  },
  interactive: false,
});

map.on("style.load", () => {
  map.setProjection({
    type: "globe",
  });
});

export const marker = new Marker({
  scale: 10,
  anchor: "bottom",
  offset: [0, 50],
  color: "var(--color-there)",
})
  .setLngLat(BERLIN)
  .addTo(map);

export function updateMap(lat: number, lon: number) {
  map.easeTo({ center: [lon, lat] });
  marker.setLngLat([lon, lat]);
}
