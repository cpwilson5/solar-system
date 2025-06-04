export default class UIManager {
    constructor(containerId = 'scene-container') {
        this.infoPanel = null;
        // Attempt to find the container, fallback to document.body if not found or if running in a context where document is available but not the specific ID.
        this.parentContainer = document.getElementById(containerId) || document.body;
    }

    showPlanetInfo(planet) {
        // Ensure planet and necessary data exist. userData.description will be added later.
        if (!planet || !planet.name ) {
            console.warn('Planet data incomplete for UI panel:', planet);
            this.hidePlanetInfo();
            return;
        }
        
        const planetDescription = planet.userData && planet.userData.description ? planet.userData.description : "No description available yet.";


        if (!this.infoPanel) {
            this.infoPanel = document.createElement('div');
            this.infoPanel.id = 'planet-info-panel';
            // Inline styles for position, zIndex, and initial display are kept if they are dynamic or essential for initial setup.
            // Most styling will be moved to style.css.
            this.infoPanel.style.position = 'absolute'; // Keep position, top, left for layout via JS initially
            this.infoPanel.style.top = '20px';
            this.infoPanel.style.left = '20px';
            this.infoPanel.style.zIndex = '1000'; 
            this.parentContainer.appendChild(this.infoPanel);
        }

        const displayName = planet.name.charAt(0).toUpperCase() + planet.name.slice(1);

        this.infoPanel.innerHTML = `
            <h2>${displayName}</h2>
            <p>${planetDescription}</p>
            <button id="close-planet-info">Back to Solar System</button>
        `;
        this.infoPanel.style.display = 'block';

        const closeButton = document.getElementById('close-planet-info');
        if (closeButton) {
            closeButton.onclick = () => {
                // The actual view reset will be handled by the callback
                if (this.onCloseCallback) {
                    this.onCloseCallback();
                }
                this.hidePlanetInfo(); // Hide panel after callback
            };
        }
    }

    hidePlanetInfo() {
        if (this.infoPanel) {
            this.infoPanel.style.display = 'none';
            this.infoPanel.innerHTML = ''; // Clear content to ensure fresh state next time
        }
    }

    setOnCloseCallback(callback) {
        this.onCloseCallback = callback;
    }
} 