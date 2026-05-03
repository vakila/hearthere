import "maplibre-gl/dist/maplibre-gl.css"; // Map styles
import {
  Map,
  Marker,
  type DataDrivenPropertyValueSpecification,
  type LngLatLike,
} from "maplibre-gl";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const BERLIN = {
  lat: 52.52,
  lon: 13.41,
};

const COLORS = {
  DeepBlue: "#101d30",
  DeepGreen: "#162d11",
  Yellow: "#f5ee1eff",
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
        id: "background",
        type: "background",
        paint: {
          "background-color": COLORS.DeepBlue,
        },
        layout: {
          visibility: "visible",
        },
        maxzoom: 4,
        minzoom: 4,
      },
      {
        id: "land",
        type: "fill",
        source: "maplibre",
        "source-layer": "countries",
        paint: {
          "fill-color": COLORS.DeepGreen,
        },
        maxzoom: 4,
        minzoom: 4,
      },
      {
        id: "coastline",
        type: "line",
        paint: {
          "line-blur": 0.5,
          "line-color": COLORS.DeepGreen,
          "line-width": {
            stops: [
              [0, 2],
              [6, 6],
              [14, 9],
              [22, 18],
            ],
          } as DataDrivenPropertyValueSpecification<number>,
        },
        filter: ["all"],
        layout: {
          "line-cap": "round",
          "line-join": "round",
          visibility: "visible",
        },
        source: "maplibre",
        maxzoom: 4,
        minzoom: 4,
        "source-layer": "countries",
      },
      {
        id: "satellite",
        type: "raster",
        source: "satellite",
      },
    ],
  },
  zoom: 4,
  center: BERLIN,
  // maxPitch: 60,
  pitch: 80,
  canvasContextAttributes: {
    antialias: true, // create the gl context with MSAA antialiasing, so custom layers are antialiased
    alpha: true,
  },
  interactive: false,
});

export const pointsLayer = {
  id: "stations",
  type: "circle",
  source: {
    type: "geojson",
    // data: STATION_SRC as FeatureCollection,
  },
  paint: {
    "circle-radius": 10,
    "circle-color": COLORS.Yellow,
  },
} as const;

// The API demonstrated in this example will work regardless of projection.
// // Click this button to toggle it.
// document.getElementById('project')!.addEventListener('click', () => {
//     // Toggle projection
//     const currentProjection = map.getProjection();
//     map.setProjection({
//         type: currentProjection.type === 'globe' ? 'mercator' : 'globe',
//     });
// });

// https://maplibre.org/maplibre-gl-js/docs/examples/add-an-animated-icon-to-the-map/
const size = 200;
const pulsingDot = {
  width: size,
  height: size,
  data: new Uint8ClampedArray(size * size * 4),
  context: null as CanvasRenderingContext2D | null,

  // get rendering context for the map canvas when layer is added to the map
  onAdd() {
    const canvas = document.createElement("canvas");
    canvas.width = this.width;
    canvas.height = this.height;
    this.context = canvas.getContext("2d");
  },

  // called once before every frame where the icon will be used
  render() {
    const duration = 1000;
    const t = (performance.now() % duration) / duration;

    const radius = (size / 2) * 0.3;
    const outerRadius = (size / 2) * 0.7 * t + radius;
    const context = this.context!;

    // draw outer circle
    // context.clearRect(0, 0, this.width, this.height);
    // context.beginPath();
    // context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
    // context.fillStyle = `rgba(255, 200, 200,${1 - t})`;
    // context.fill();

    // draw inner circle
    context.beginPath();
    context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
    context.fillStyle = "rgba(255, 100, 100, 1)";
    context.strokeStyle = "white";
    // context.lineWidth = 2 + 4 * (1 - t);
    context.fill();
    context.stroke();

    // update this image's data with data from the canvas
    this.data = context.getImageData(0, 0, this.width, this.height).data;

    // continuously repaint the map, resulting in the smooth animation of the dot
    map.triggerRepaint();

    // return `true` to let the map know that the image was updated
    return true;
  },
};

// // configuration of the custom layer for a 3D model per the CustomLayerInterface
// export const threeLayer: any = {
//   id: "3d-model",
//   type: "custom",
//   renderingMode: "3d", // The layer MUST be marked as 3D in order to get the proper depth buffer with globe depths in it.
//   onAdd(map: Map, gl: WebGLRenderingContext) {
//     this.camera = new THREE.Camera();
//     this.scene = new THREE.Scene();

//     // create two three.js lights to illuminate the model
//     const directionalLight = new THREE.DirectionalLight(0xffffff);
//     directionalLight.position.set(0, -70, 100).normalize();
//     this.scene.add(directionalLight);

//     const directionalLight2 = new THREE.DirectionalLight(0xffffff);
//     directionalLight2.position.set(0, 70, 100).normalize();
//     this.scene.add(directionalLight2);

//     // use the three.js GLTF loader to add the 3D model to the three.js scene
//     const loader = new GLTFLoader();
//     loader.load(
//       "https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf",
//       (gltf) => {
//         this.scene.add(gltf.scene);
//       },
//     );
//     this.map = map;

//     // use the MapLibre GL JS map canvas for three.js
//     this.renderer = new THREE.WebGLRenderer({
//       canvas: map.getCanvas(),
//       context: gl,
//       antialias: true,
//     });

//     this.renderer.autoClear = false;
//   },
//   render(_gl: any, args: any) {
//     // parameters to ensure the model is georeferenced correctly on the map
//     const modelOrigin: LngLatLike = BERLIN;
//     // [148.9819, -35.39847];
//     const modelAltitude = 0;

//     // Make the object ~10s of km tall to make it visible at planetary scale.
//     const scaling = 10_000.0;

//     // We can use this API to get the correct model matrix.
//     // It will work regardless of current projection.
//     // See MapLibre source code, file "mercator_transform.ts" or "vertical_perspective_transform.ts".
//     const modelMatrix = map.transform.getMatrixForModel(
//       modelOrigin,
//       modelAltitude,
//     );
//     const m = new THREE.Matrix4().fromArray(
//       args.defaultProjectionData.mainMatrix,
//     );
//     const l = new THREE.Matrix4()
//       .fromArray(modelMatrix)
//       .scale(new THREE.Vector3(scaling, scaling, scaling));

//     this.camera.projectionMatrix = m.multiply(l);
//     this.renderer.resetState();
//     this.renderer.render(this.scene, this.camera);
//     this.map.triggerRepaint();
//   },
// };

map.on("style.load", () => {
  map.setProjection({
    type: "globe", // Set projection to globe
  });
  // map.addLayer(threeLayer);

  // map.addImage("pulsing-dot", pulsingDot, { pixelRatio: 2 });

  // map.addSource("points", {
  //   type: "geojson",
  //   data: {
  //     type: "Point",
  //     coordinates: [BERLIN.lon, BERLIN.lat],
  //   },
  // });
  // map.addLayer({
  //   id: "points",
  //   type: "symbol",
  //   source: "points",
  //   layout: {
  //     "icon-image": "pulsing-dot",
  //   },
  // });
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
