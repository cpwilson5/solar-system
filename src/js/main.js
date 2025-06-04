import * as THREE from 'three';
import SceneManager from './scene.js';
import UIManager from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found!');
        return;
    }
    const sceneManager = new SceneManager(container);
    const uiManager = new UIManager();

    let timeScale = 1.0;
    let isPaused = false;
    let selectedPlanet = null;
    let isDetailedView = false;

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    uiManager.setOnCloseCallback(() => {
        if (isDetailedView) {
            sceneManager.controlsManager.resetTarget();
            selectedPlanet = null;
            isDetailedView = false;
        }
    });

    function animate() {
        requestAnimationFrame(animate);
        sceneManager.update(isPaused ? 0 : timeScale);
    }

    animate();

    // Keyboard controls for time
    window.addEventListener('keydown', (event) => {
        if (event.key === ' ' || event.code === 'Space') {
            isPaused = !isPaused;
            event.preventDefault();
        } else if (event.key === '+' || event.key === '=') {
            timeScale *= 1.2;
        } else if (event.key === '-' || event.key === '_') {
            timeScale /= 1.2;
            if (timeScale < 0.1) timeScale = 0.1;
        }
        if (event.key === 'Escape' && isDetailedView) {
            sceneManager.controlsManager.resetTarget();
            selectedPlanet = null;
            isDetailedView = false;
            uiManager.hidePlanetInfo();
        }
    });

    // Mouse click listener for planet selection
    container.addEventListener('click', (event) => {
        mouse.x = (event.clientX / container.clientWidth) * 2 - 1;
        mouse.y = - (event.clientY / container.clientHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, sceneManager.camera);

        const planetsToIntersect = sceneManager.planetManager.planets;
        const intersects = raycaster.intersectObjects(planetsToIntersect);

        if (intersects.length > 0) {
            const clickedObject = intersects[0].object;
            if (selectedPlanet !== clickedObject) {
                selectedPlanet = clickedObject;
                sceneManager.controlsManager.targetPlanet(selectedPlanet);
                isDetailedView = true;
                uiManager.showPlanetInfo(selectedPlanet);
            }
        } else {
            if (isDetailedView) {
                sceneManager.controlsManager.resetTarget();
                selectedPlanet = null;
                isDetailedView = false;
                uiManager.hidePlanetInfo();
            }
        }
    });

}); 