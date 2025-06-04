import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default class ControlsManager {
    constructor(camera, rendererDomElement) {
        this.camera = camera; // Store camera reference
        this.controls = new OrbitControls(camera, rendererDomElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.originalMinDistance = 5;
        this.originalMaxDistance = 500;
        this.originalTarget = new THREE.Vector3(0, 0, 0); // Store original target
        this.controls.minDistance = this.originalMinDistance;
        this.controls.maxDistance = this.originalMaxDistance;
        // this.controls.maxPolarAngle = Math.PI / 2; // Prevent camera from going below the ground
    }

    update() {
        this.controls.update(); // only required if controls.enableDamping or controls.autoRotate are set to true
    }

    targetPlanet(planetMesh) {
        this.controls.target.copy(planetMesh.position);
        // Adjust distances for a closer view of the planet
        // These values might need to be dynamic based on planet size
        const planetRadius = planetMesh.geometry.parameters.radius || 1; // Get radius or default
        this.controls.minDistance = planetRadius * 1.5;
        this.controls.maxDistance = planetRadius * 10;
        
        //  Attempt to move camera closer smoothly - this is a basic version
        //  A more advanced tweening animation would be better for a smoother transition.
        const offset = new THREE.Vector3(0, planetRadius * 0.5, planetRadius * 3); // Position camera slightly above and away
        const targetPosition = planetMesh.position.clone().add(offset);
        
        // For now, let's just set a new position and let OrbitControls handle the view.
        // A dedicated animation function would be better.
        // this.camera.position.lerp(targetPosition, 0.1); // This needs to be in the animation loop for smoothness
        // For an immediate jump for now:
        // this.camera.position.copy(targetPosition);
        // this.camera.lookAt(planetMesh.position);

        this.controls.saveState(); // Save the current state before changing target
    }

    resetTarget() {
        this.controls.target.copy(this.originalTarget);
        this.controls.minDistance = this.originalMinDistance;
        this.controls.maxDistance = this.originalMaxDistance;
        // It's often good to reset camera position to a default overview
        // this.camera.position.set(0, 50, 120); // Or whatever your default overview is
        // this.camera.lookAt(this.originalTarget);
        this.controls.reset(); // Resets to the last saved state or initial state
    }
} 