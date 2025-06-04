import SceneManager from './scene.js';

document.addEventListener('DOMContentLoaded', () => {
    const container = document.getElementById('scene-container');
    if (!container) {
        console.error('Scene container not found!');
        return;
    }
    const sceneManager = new SceneManager(container);

    function animate() {
        requestAnimationFrame(animate);
        sceneManager.update();
    }

    animate();
}); 