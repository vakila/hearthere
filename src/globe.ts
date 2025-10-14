
import {Map, type LngLatLike} from 'maplibre-gl';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const CITIES: { [name: string]: LngLatLike } = {
    Sydney: [150.16546137527212, -35.017179237129994],
    Brooklyn: [-73.98520849211138, 40.69145896738993],
    Berlin: [13.423920312613438, 52.503588841349234],
    Oakland: [-122.29541297453854, 37.80784592023481],
}

export const map = new Map({
    container: 'map',
    style: 'https://demotiles.maplibre.org/style.json',
    zoom: 1.5,
    center: CITIES.Brooklyn,
    maxPitch: 80,
    pitch: 50,
    canvasContextAttributes: {antialias: true} // create the gl context with MSAA antialiasing, so custom layers are antialiased
});

map.on('style.load', () => {
    map.setProjection({
        type: 'globe', // Set projection to globe
    });
});

// The API demonstrated in this example will work regardless of projection.
// // Click this button to toggle it.
// document.getElementById('project')!.addEventListener('click', () => {
//     // Toggle projection
//     const currentProjection = map.getProjection();
//     map.setProjection({
//         type: currentProjection.type === 'globe' ? 'mercator' : 'globe',
//     });
// });

// configuration of the custom layer for a 3D model per the CustomLayerInterface
export const customLayer: any = {
    id: '3d-model',
    type: 'custom',
    renderingMode: '3d', // The layer MUST be marked as 3D in order to get the proper depth buffer with globe depths in it.
    onAdd(map: Map, gl: WebGLRenderingContext) {
        this.camera = new THREE.Camera();
        this.scene = new THREE.Scene();

        // create two three.js lights to illuminate the model
        const directionalLight = new THREE.DirectionalLight(0xffffff);
        directionalLight.position.set(0, -70, 100).normalize();
        this.scene.add(directionalLight);

        const directionalLight2 = new THREE.DirectionalLight(0xffffff);
        directionalLight2.position.set(0, 70, 100).normalize();
        this.scene.add(directionalLight2);

        // use the three.js GLTF loader to add the 3D model to the three.js scene
        const loader = new GLTFLoader();
        loader.load(
            'https://maplibre.org/maplibre-gl-js/docs/assets/34M_17/34M_17.gltf',
            (gltf) => {
                this.scene.add(gltf.scene);
            }
        );
        this.map = map;

        // use the MapLibre GL JS map canvas for three.js
        this.renderer = new THREE.WebGLRenderer({
            canvas: map.getCanvas(),
            context: gl,
            antialias: true
        });

        this.renderer.autoClear = false;
    },
    render(_gl: any, args: any) {
        // parameters to ensure the model is georeferenced correctly on the map
        const modelOrigin: LngLatLike = CITIES.Brooklyn
        // [148.9819, -35.39847];
        const modelAltitude = 0;

        // Make the object ~10s of km tall to make it visible at planetary scale.
        const scaling = 10_000.0;

        // We can use this API to get the correct model matrix.
        // It will work regardless of current projection.
        // See MapLibre source code, file "mercator_transform.ts" or "vertical_perspective_transform.ts".
        const modelMatrix = map.transform.getMatrixForModel(modelOrigin, modelAltitude);
        const m = new THREE.Matrix4().fromArray(args.defaultProjectionData.mainMatrix);
        const l = new THREE.Matrix4().fromArray(modelMatrix).scale(
            new THREE.Vector3(
                scaling,
                scaling,
                scaling
            )
        );

        this.camera.projectionMatrix = m.multiply(l);
        this.renderer.resetState();
        this.renderer.render(this.scene, this.camera);
        this.map.triggerRepaint();
    }
};
