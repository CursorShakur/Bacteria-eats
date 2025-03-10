import { GameManager } from './systems/GameManager.js';
import { BACTERIA_TYPES } from './constants/gameConstants.js';

// Initialize game when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing game...');
    
    // Create canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    console.log('Canvas found, setting dimensions...');

    // Set canvas size
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    console.log(`Canvas size set to ${canvas.width}x${canvas.height}`);

    // Create game manager
    const game = new GameManager(canvas);
    console.log('Game manager created');

    // Handle window resize
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth - 40;
        canvas.height = window.innerHeight - 40;
    });

    // Handle keyboard input
    const keys = new Set();
    
    document.addEventListener('keydown', (e) => {
        keys.add(e.key.toLowerCase());
        
        // Restart game on space when game over
        if (e.code === 'Space' && game.gameOver) {
            showBacteriaSelection();
        }
    });

    document.addEventListener('keyup', (e) => {
        keys.delete(e.key.toLowerCase());
    });

    // Input update loop
    setInterval(() => {
        if (!game.gameOver) {
            let dx = 0;
            let dy = 0;

            if (keys.has('w') || keys.has('arrowup')) dy -= 1;
            if (keys.has('s') || keys.has('arrowdown')) dy += 1;
            if (keys.has('a') || keys.has('arrowleft')) dx -= 1;
            if (keys.has('d') || keys.has('arrowright')) dx += 1;

            game.handleInput(dx, dy);
        }
    }, 1000 / 60);

    // Show bacteria selection screen
    function showBacteriaSelection() {
        console.log('Showing bacteria selection screen');
        
        // Create selection UI
        const selectionUI = document.createElement('div');
        selectionUI.id = 'bacteriaSelection';
        selectionUI.style.position = 'absolute';
        selectionUI.style.top = '50%';
        selectionUI.style.left = '50%';
        selectionUI.style.transform = 'translate(-50%, -50%)';
        selectionUI.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
        selectionUI.style.padding = '20px';
        selectionUI.style.borderRadius = '10px';
        selectionUI.style.color = 'white';
        selectionUI.style.textAlign = 'center';
        selectionUI.style.zIndex = '1000'; // Ensure it's on top

        // Check if BACTERIA_TYPES is defined
        if (!BACTERIA_TYPES || Object.keys(BACTERIA_TYPES).length === 0) {
            console.error('BACTERIA_TYPES is not properly defined:', BACTERIA_TYPES);
            selectionUI.innerHTML = `
                <h2>Error Loading Game</h2>
                <p>Unable to load bacteria types. Please refresh the page.</p>
                <button id="refreshButton" style="padding: 10px; margin-top: 20px; cursor: pointer;">Refresh</button>
            `;
            
            document.body.appendChild(selectionUI);
            
            const refreshButton = document.getElementById('refreshButton');
            if (refreshButton) {
                refreshButton.addEventListener('click', () => {
                    window.location.reload();
                });
            }
            
            return;
        }

        selectionUI.innerHTML = `
            <h2>Choose Your Bacteria Type</h2>
            <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
                ${Object.values(BACTERIA_TYPES).map(type => `
                    <div class="bacteria-option" style="cursor: pointer; padding: 10px; border: 1px solid white; border-radius: 5px;">
                        <h3>${type.name}</h3>
                        <p>${type.description}</p>
                        <div style="margin: 10px 0;">
                            <div>Speed: ${type.baseSpeed}</div>
                            <div>Size: ${type.baseSize}</div>
                            <div>Growth: ${type.growthRate}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        document.body.appendChild(selectionUI);
        console.log('Selection UI added to document');

        // Add click handlers
        const options = selectionUI.querySelectorAll('.bacteria-option');
        console.log(`Found ${options.length} bacteria options`);
        
        options.forEach((option, index) => {
            option.addEventListener('click', () => {
                console.log(`Selected bacteria type: ${index}`);
                const type = Object.values(BACTERIA_TYPES)[index];
                selectionUI.remove();
                game.start(type);
            });

            // Hover effect
            option.addEventListener('mouseover', () => {
                option.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
            });
            option.addEventListener('mouseout', () => {
                option.style.backgroundColor = 'transparent';
            });
        });
    }

    // Add a start button to the page for better visibility
    const startButton = document.createElement('button');
    startButton.textContent = 'Start Game';
    startButton.style.position = 'absolute';
    startButton.style.top = '50%';
    startButton.style.left = '50%';
    startButton.style.transform = 'translate(-50%, -50%)';
    startButton.style.padding = '15px 30px';
    startButton.style.fontSize = '20px';
    startButton.style.backgroundColor = '#4CAF50';
    startButton.style.color = 'white';
    startButton.style.border = 'none';
    startButton.style.borderRadius = '5px';
    startButton.style.cursor = 'pointer';
    startButton.style.zIndex = '1000';
    
    startButton.addEventListener('click', () => {
        startButton.remove();
        showBacteriaSelection();
    });
    
    document.body.appendChild(startButton);
    console.log('Start button added to document');
}); 