import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

const PLANET_DATA = {
    mercury: { color: 0x8c8c8c, radius: 0.38, distance: 10, speed: 0.020, texture: 'mercury.jpg' },
    venus: { color: 0xffd700, radius: 0.95, distance: 15, speed: 0.015, texture: 'venus.jpg' },
    earth: { color: 0x0077ff, radius: 1.0, distance: 20, speed: 0.010, moon: true, texture: 'earth.jpg' },
    mars: { color: 0xff4500, radius: 0.53, distance: 28, speed: 0.008, texture: 'mars.jpg' },
    jupiter: { color: 0xffa500, radius: 3.5, distance: 45, speed: 0.004, texture: 'jupiter.jpg' },
    saturn: { color: 0xf0e68c, radius: 3.0, distance: 65, speed: 0.003, rings: true, texture: 'saturn.jpg', ringTexture: 'saturn_ring.png' },
    uranus: { color: 0xadd8e6, radius: 1.8, distance: 80, speed: 0.002, texture: 'uranus.jpg' },
    neptune: { color: 0x0000ff, radius: 1.7, distance: 95, speed: 0.001, texture: 'neptune.jpg' }
};

const MOON_DATA = {
    moon: { parent: 'earth', color: 0xcccccc, radius: 0.27, distance: 2.5, speed: 0.05, texture: 'moon.jpg' }
};

export default class PlanetManager {
    constructor(scene) {
        this.scene = scene;
        this.planets = [];
        this.moons = [];
        this.planetObjects = {}; // To store planet meshes for moon orbits
        this.initPlanets();
    }

    initPlanets() {
        Object.keys(PLANET_DATA).forEach(name => {
            const data = PLANET_DATA[name];
            const planetTexture = data.texture ? textureLoader.load(`../assets/textures/${data.texture}`) : null;
            
            const materialProperties = {
                metalness: 0.1, // Adjusted for better appearance with textures
                roughness: 0.8  // Adjusted for better appearance with textures
            };
            if (planetTexture) {
                materialProperties.map = planetTexture;
            } else {
                materialProperties.color = data.color; // Fallback to color if no texture
            }

            const geometry = new THREE.SphereGeometry(data.radius, 32, 32);
            const material = new THREE.MeshStandardMaterial(materialProperties);
            const planet = new THREE.Mesh(geometry, material);
            
            planet.name = name;
            planet.userData.distance = data.distance; 
            planet.userData.speed = data.speed;       
            planet.userData.angle = Math.random() * Math.PI * 2; 

            planet.position.x = data.distance * Math.cos(planet.userData.angle);
            planet.position.z = data.distance * Math.sin(planet.userData.angle);

            // Enable shadows for planets
            planet.castShadow = true;
            planet.receiveShadow = true;

            this.planets.push(planet);
            this.scene.add(planet);
            this.planetObjects[name] = planet; 

            if (data.rings && data.ringTexture) {
                const ringTexture = textureLoader.load(`../assets/textures/${data.ringTexture}`);
                const ringGeometry = new THREE.RingGeometry(data.radius * 1.2, data.radius * 2.2, 64);
                // Using MeshStandardMaterial for rings to potentially receive shadows, adjust as needed
                const ringMaterial = new THREE.MeshStandardMaterial({
                    map: ringTexture, 
                    side: THREE.DoubleSide, 
                    transparent: true, 
                    opacity: 0.8, // Overall opacity, texture alpha will also apply
                    // color: 0xffffff, // Base color, texture will modulate this
                    metalness: 0.1,
                    roughness: 0.5
                });
                const rings = new THREE.Mesh(ringGeometry, ringMaterial);
                rings.rotation.x = Math.PI / 2.5; 
                rings.receiveShadow = true; // Rings can receive shadows
                planet.add(rings);
            }

            if (data.moon) {
                const moonData = MOON_DATA.moon;
                const moonTexture = moonData.texture ? textureLoader.load(`../assets/textures/${moonData.texture}`) : null;
                
                const moonMaterialProperties = {
                    metalness: 0.1,
                    roughness: 0.9
                };
                if (moonTexture) {
                    moonMaterialProperties.map = moonTexture;
                } else {
                    moonMaterialProperties.color = moonData.color;
                }

                const moonGeometry = new THREE.SphereGeometry(moonData.radius, 16, 16);
                const moonMaterial = new THREE.MeshStandardMaterial(moonMaterialProperties);
                const moon = new THREE.Mesh(moonGeometry, moonMaterial);
                moon.name = 'moon';
                moon.castShadow = true;
                moon.receiveShadow = true;
                moon.userData.parentPlanet = this.planetObjects[moonData.parent];
                moon.userData.distance = moonData.distance;
                moon.userData.speed = moonData.speed;
                moon.userData.angle = Math.random() * Math.PI * 2;

                this.moons.push(moon);
                this.scene.add(moon);
            }
        });
    }

    updateOrbits() {
        this.planets.forEach(planet => {
            planet.userData.angle += planet.userData.speed;
            planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
            planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
            planet.rotation.y += 0.001; // Slow self-rotation for planets
        });

        this.moons.forEach(moon => {
            const parentPlanet = moon.userData.parentPlanet;
            if (parentPlanet) {
                moon.userData.angle += moon.userData.speed;
                moon.position.x = parentPlanet.position.x + moon.userData.distance * Math.cos(moon.userData.angle);
                moon.position.z = parentPlanet.position.z + moon.userData.distance * Math.sin(moon.userData.angle);
                moon.position.y = parentPlanet.position.y; 
                moon.rotation.y += 0.005; // Moon self-rotation
            }
        });
    }
} 