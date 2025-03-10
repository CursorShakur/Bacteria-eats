// Simple game starter with error handling
export function startGame() {
    console.log('Starting game with simple starter...');
    
    try {
        // Get the canvas
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            throw new Error('Canvas element not found');
        }
        
        // Set canvas size
        canvas.width = window.innerWidth - 40;
        canvas.height = window.innerHeight - 40;
        console.log(`Canvas size set to ${canvas.width}x${canvas.height}`);
        
        // Draw something on the canvas to verify it's working
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Could not get canvas context');
        }
        
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw a grid
        drawGrid(ctx, canvas.width, canvas.height);
        
        // Draw a test circle (player)
        drawTestPlayer(ctx, canvas.width / 2, canvas.height / 2);
        
        // Update debug info
        updateDebugInfo('Test rendering successful');
        
        // Now try to import the game manager
        import('./systems/GameManager.js')
            .then(module => {
                console.log('GameManager module loaded successfully');
                const GameManager = module.GameManager;
                
                // Try to import constants
                import('./constants/gameConstants.js')
                    .then(constants => {
                        console.log('Game constants loaded successfully');
                        
                        // Show a message on the canvas
                        ctx.fillStyle = 'white';
                        ctx.font = '20px Arial';
                        ctx.fillText('All modules loaded successfully!', 20, 30);
                        ctx.fillText('Click anywhere to start the real game', 20, 60);
                        
                        // Add click listener to start the real game
                        canvas.addEventListener('click', () => {
                            startRealGame(GameManager, constants, canvas);
                        });
                    })
                    .catch(error => {
                        console.error('Error loading game constants:', error);
                        showErrorOnCanvas(ctx, 'Error loading game constants: ' + error.message);
                    });
            })
            .catch(error => {
                console.error('Error loading GameManager:', error);
                showErrorOnCanvas(ctx, 'Error loading GameManager: ' + error.message);
            });
    } catch (error) {
        console.error('Error in game initialization:', error);
        alert('Error in game initialization: ' + error.message);
    }
}

// Draw a simple grid
function drawGrid(ctx, width, height) {
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 1;
    
    // Vertical lines
    for (let x = 0; x < width; x += 100) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // Horizontal lines
    for (let y = 0; y < height; y += 100) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// Draw a test player
function drawTestPlayer(ctx, x, y) {
    // Draw player
    ctx.fillStyle = '#0070DD';
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 2;
    
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    
    // Draw direction indicator
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x + 30, y);
    ctx.strokeStyle = '#FFFF00';
    ctx.stroke();
}

// Show error message on canvas
function showErrorOnCanvas(ctx, message) {
    const canvas = ctx.canvas;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw error message
    ctx.fillStyle = '#FF5555';
    ctx.font = '16px monospace';
    
    const lines = message.split('\n');
    lines.forEach((line, index) => {
        ctx.fillText(line, 20, 30 + index * 20);
    });
    
    // Draw instructions
    ctx.fillStyle = '#FFFFFF';
    ctx.fillText('Please check the browser console for more details.', 20, canvas.height - 40);
    ctx.fillText('Refresh the page to try again.', 20, canvas.height - 20);
}

// Update debug info
function updateDebugInfo(status) {
    window.GAME_INFO = {
        status: status || 'Initializing',
        fps: 0,
        player: 'Test Player',
        entities: 'None',
        canvas: document.getElementById('gameCanvas') ? 
            `${document.getElementById('gameCanvas').width}x${document.getElementById('gameCanvas').height}` : 
            'Not available'
    };
}

// Start the real game
function startRealGame(GameManager, constants, canvas) {
    try {
        // Clear canvas
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Create game manager
        const game = new GameManager(canvas);
        console.log('Game manager created');
        
        // Show bacteria selection
        showBacteriaSelection(game, canvas, constants.BACTERIA_TYPES);
    } catch (error) {
        console.error('Error starting real game:', error);
        const ctx = canvas.getContext('2d');
        showErrorOnCanvas(ctx, 'Error starting real game: ' + error.message);
    }
}

// Show bacteria selection
function showBacteriaSelection(game, canvas, bacteriaTypes) {
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
    selectionUI.style.zIndex = '1000';
    
    // Create bacteria options
    selectionUI.innerHTML = `
        <h2>Choose Your Bacteria Type</h2>
        <div style="display: flex; gap: 20px; justify-content: center; margin-top: 20px;">
            ${Object.values(bacteriaTypes).map(type => `
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
    
    // Add to document
    document.body.appendChild(selectionUI);
    console.log('Selection UI added to document');
    
    // Add click event listeners to bacteria options
    const options = selectionUI.querySelectorAll('.bacteria-option');
    console.log(`Found ${options.length} bacteria options`);
    
    options.forEach((option, index) => {
        option.addEventListener('click', () => {
            try {
                const selectedType = Object.values(bacteriaTypes)[index];
                console.log(`Selected bacteria type: ${selectedType.name}`);
                
                // Remove selection UI
                selectionUI.remove();
                
                // Start the game with selected bacteria type
                game.start(selectedType);
                
                // Set up key handling
                setupKeyHandling(game);
            } catch (error) {
                console.error('Error in bacteria selection:', error);
                alert('Error in bacteria selection: ' + error.message);
            }
        });
    });
}

// Set up key handling
function setupKeyHandling(game) {
    const keys = new Set();
    
    function handleKeyDown(e) {
        keys.add(e.key.toLowerCase());
        
        // Restart game on space when game over
        if (e.code === 'Space' && game.gameOver) {
            window.location.reload();
        }
    }
    
    function handleKeyUp(e) {
        keys.delete(e.key.toLowerCase());
    }
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Set up input handling interval
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
} 