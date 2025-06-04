import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class ControlsManager {
    constructor(camera, rendererDomElement) {
        this.controls = new OrbitControls(camera, rendererDomElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 500;
        // this.controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below the ground
    }

    update() {
        this.controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
    }
} 