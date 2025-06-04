import * as THREE from 'three';

const textureLoader = new THREE.TextureLoader();

// Helper function to create a random moon-like texture
function createRandomMoonTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext('2d');

    // Base moon color (greyish)
    const baseGrey = Math.floor(Math.random() * 50) + 100; // Random base grey between 100 and 150
    context.fillStyle = `rgb(${baseGrey}, ${baseGrey}, ${baseGrey})`;
    context.fillRect(0, 0, size, size);

    // Add some random craters
    const numCraters = Math.floor(Math.random() * 25) + 25; // 25 to 50 craters
    for (let i = 0; i < numCraters; i++) {
        const x = Math.random() * size;
        const y = Math.random() * size;
        const radius = Math.random() * (size / 10) + (size / 20); // Crater radius
        const craterGrey = baseGrey + (Math.random() * 60 - 30); // Lighter or darker grey
        context.beginPath();
        context.arc(x, y, radius, 0, Math.PI * 2, false);
        context.fillStyle = `rgb(${craterGrey}, ${craterGrey}, ${craterGrey})`;
        context.fill();

        // Add a subtle highlight/shadow to craters for a bit of depth
        const edgeOffset = radius * 0.3;
        const highlightGrey = Math.min(255, craterGrey + 20);
        const shadowGrey = Math.max(0, craterGrey - 20);

        context.beginPath();
        context.arc(x - edgeOffset, y - edgeOffset, radius, 0, Math.PI*2, false);
        context.fillStyle = `rgba(${highlightGrey},${highlightGrey},${highlightGrey}, 0.5)`;
        context.fill();

        context.beginPath();
        context.arc(x + edgeOffset, y + edgeOffset, radius, Math.PI, Math.PI*0.5, true); // Shadow on opposite side
        context.fillStyle = `rgba(${shadowGrey},${shadowGrey},${shadowGrey}, 0.3)`;
        context.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true; // Important for canvas textures
    return texture;
}

const PLANET_DATA = {
    mercury: { color: 0x8c8c8c, radius: 0.38, distance: 10, speed: 0.020, texture: 'mercury.jpg', description: 'Mercury is the smallest planet in our solar system and nearest to the Sun. It is only slightly larger than Earth\'s Moon.' },
    venus: { color: 0xffd700, radius: 0.95, distance: 15, speed: 0.015, texture: 'venus.jpg', description: 'Venus is the second planet from the Sun. It is named after the Roman goddess of love and beauty. As the brightest natural object in Earth\'s night sky after the Moon, Venus can cast shadows and can be, on rare occasion, visible to the naked eye in broad daylight.' },
    earth: { color: 0x0077ff, radius: 1.0, distance: 20, speed: 0.010, moon: true, texture: 'earth.jpg', description: 'Our home planet, Earth, is the third planet from the Sun, and the only place we know of so far that\'s inhabited by living things.' },
    mars: { color: 0xff4500, radius: 0.53, distance: 28, speed: 0.008, texture: 'mars.jpg', description: 'Mars is the fourth planet from the Sun – a dusty, cold, desert world with a very thin atmosphere. Mars is also a dynamic planet with seasons, polar ice caps, canyons, extinct volcanoes, and evidence that it was even more active in the past.' },
    jupiter: { color: 0xffa500, radius: 3.5, distance: 45, speed: 0.004, texture: 'jupiter.jpg', description: 'Jupiter is the fifth planet from our Sun and is, by far, the largest planet in the solar system – more than twice as massive as all the other planets combined.' },
    saturn: { color: 0xf0e68c, radius: 3.0, distance: 65, speed: 0.003, rings: true, texture: 'saturn.jpg', ringTexture: 'saturn_ring.png', description: 'Saturn is the sixth planet from the Sun and the second largest planet in our solar system. Adorned with thousands of beautiful ringlets, Saturn is unique among the planets.' },
    uranus: { color: 0xadd8e6, radius: 1.8, distance: 80, speed: 0.002, texture: 'uranus.jpg', description: 'Uranus is the seventh planet from the Sun. It\'s a giant, icy planet, also known as an "ice giant." It is the only planet that rotates on its side.' },
    neptune: { color: 0x0000ff, radius: 1.7, distance: 95, speed: 0.001, texture: 'neptune.jpg', description: 'Neptune is the eighth and most distant major planet orbiting our Sun. It\'s dark, cold, and very windy. It\'s the last of the planets in our solar system.' }
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
            const planetTexture = data.texture ? textureLoader.load(`assets/textures/${data.texture}`) : null;
            
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
            planet.userData.description = data.description;

            planet.position.x = data.distance * Math.cos(planet.userData.angle);
            planet.position.z = data.distance * Math.sin(planet.userData.angle);

            // Enable shadows for planets
            planet.castShadow = true;
            planet.receiveShadow = true;

            this.planets.push(planet);
            this.scene.add(planet);
            this.planetObjects[name] = planet;

            // Create orbital trail
            const orbitPoints = [];
            const segments = 128; // Number of segments for the circle
            for (let i = 0; i <= segments; i++) {
                const theta = (i / segments) * Math.PI * 2;
                orbitPoints.push(new THREE.Vector3(data.distance * Math.cos(theta), 0, data.distance * Math.sin(theta)));
            }
            const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
            const orbitMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.3 });
            const orbitTrail = new THREE.Line(orbitGeometry, orbitMaterial);
            this.scene.add(orbitTrail);

            if (data.rings && data.ringTexture) {
                const ringTexture = textureLoader.load(`assets/textures/${data.ringTexture}`);
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
                // const moonTexture = moonData.texture ? textureLoader.load(`assets/textures/${moonData.texture}`) : null;
                const moonTexture = createRandomMoonTexture(); // Use the new random texture function
                
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

    updateOrbits(timeScale = 1.0) {
        this.planets.forEach(planet => {
            planet.userData.angle += planet.userData.speed * timeScale;
            planet.position.x = planet.userData.distance * Math.cos(planet.userData.angle);
            planet.position.z = planet.userData.distance * Math.sin(planet.userData.angle);
            planet.rotation.y += 0.001 * timeScale;
        });

        this.moons.forEach(moon => {
            const parentPlanet = moon.userData.parentPlanet;
            if (parentPlanet) {
                moon.userData.angle += moon.userData.speed * timeScale;
                moon.position.x = parentPlanet.position.x + moon.userData.distance * Math.cos(moon.userData.angle);
                moon.position.z = parentPlanet.position.z + moon.userData.distance * Math.sin(moon.userData.angle);
                moon.position.y = parentPlanet.position.y; 
                moon.rotation.y += 0.005 * timeScale;
            }
        });
    }
} 