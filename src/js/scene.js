import * as THREE from 'three';
import PlanetManager from './planets.js';
import ControlsManager from './controls.js';

const textureLoader = new THREE.TextureLoader(); // Shared texture loader

export default class SceneManager {
    constructor(container) {
        this.container = container;
        this.scene = new THREE.Scene();
        this.initCamera();
        this.initRenderer();
        this.initLighting();
        this.createSun();
        this.createStarfield();

        this.planetManager = new PlanetManager(this.scene);
        this.controlsManager = new ControlsManager(this.camera, this.renderer.domElement);

        window.addEventListener('resize', this.onWindowResize.bind(this), false);
    }

    initCamera() {
        const aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
        this.camera.position.set(0, 50, 120);
        this.camera.lookAt(0, 0, 0);
    }

    initRenderer() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
        this.container.appendChild(this.renderer.domElement);
    }

    initLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Increased ambient slightly more for textures
        this.scene.add(ambientLight);

        // Main directional light for sun simulation
        const directionalLight = new THREE.DirectionalLight(0xffffff, 2.0); // Slightly increased intensity
        directionalLight.position.set(0, 20, 10); // Position it to cast across the scene
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 1500; 
        directionalLight.shadow.camera.left = -150;
        directionalLight.shadow.camera.right = 150;
        directionalLight.shadow.camera.top = 150;
        directionalLight.shadow.camera.bottom = -150;
        this.scene.add(directionalLight);
    }

    createSun() {
        const sunTexture = textureLoader.load('../assets/textures/sun.jpg');
        const sunGeometry = new THREE.SphereGeometry(5, 64, 64); // Increased segments for smoother sun
        const sunMaterial = new THREE.MeshStandardMaterial({
            emissiveMap: sunTexture,
            emissive: 0xffffff, // Make it glow white, modulated by texture
            emissiveIntensity: 1.2,
            // map: sunTexture, // Can also use map if emissive isn't enough or for different effects
            // color: 0x000000 // Set to black if emissiveMap is the only color source
        });
        this.sun = new THREE.Mesh(sunGeometry, sunMaterial);
        this.sun.position.set(0, 0, 0);
        this.sun.castShadow = false; // The sun itself doesn't cast shadows from the main directional light
        this.sun.receiveShadow = false;
        this.scene.add(this.sun);

        // PointLight attached to the Sun to make it appear as a light source
        const sunPointLight = new THREE.PointLight(0xffffff, 2.5, 1200); // Adjusted intensity
        this.sun.add(sunPointLight);
    }

    createStarfield() {
        const starVertices = [];
        for (let i = 0; i < 10000; i++) {
            const r = THREE.MathUtils.randFloat(700, 1000); 
            const phi = THREE.MathUtils.randFloat(0, Math.PI * 2);
            const theta = THREE.MathUtils.randFloat(0, Math.PI);
            starVertices.push(
                r * Math.sin(theta) * Math.cos(phi),
                r * Math.sin(theta) * Math.sin(phi),
                r * Math.cos(theta)
            );
        }

        const starGeometry = new THREE.BufferGeometry();
        starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));

        const starMaterial = new THREE.PointsMaterial({
            color: 0xffffff,
            size: 1.5,
            sizeAttenuation: true, 
            transparent: true,
            opacity: 0.8
        });

        const stars = new THREE.Points(starGeometry, starMaterial);
        this.scene.add(stars);
    }

    onWindowResize() {
        this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    }

    update() {
        if (this.sun) {
            this.sun.rotation.y += 0.0005; // Slow self-rotation for the Sun
        }
        this.planetManager.updateOrbits();
        this.controlsManager.update();
        this.renderer.render(this.scene, this.camera);
    }
} 