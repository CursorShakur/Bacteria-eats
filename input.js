// Direction
let direction = { x: 0, y: 0 };

// Setup input handlers
function setupInputHandlers() {
    // Keyboard event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Button event listeners
    document.getElementById('startButton')?.addEventListener('click', startGame);
    document.getElementById('restartButton')?.addEventListener('click', startGame);
}

// Handle key down events
function handleKeyDown(event) {
    // Prevent default behavior for arrow keys
    if(['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.code)) {
        event.preventDefault();
    }
    
    // Only handle input if game is running
    if (!isGameRunning) {
        // Space can restart the game when game is not running
        if (event.key === ' ') {
            startGame();
        }
        return;
    }
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
            direction.y = -1;
            break;
        case 'ArrowDown':
        case 's':
            direction.y = 1;
            break;
        case 'ArrowLeft':
        case 'a':
            direction.x = -1;
            break;
        case 'ArrowRight':
        case 'd':
            direction.x = 1;
            break;
    }
}

// Handle key up events
function handleKeyUp(event) {
    // Only handle input if game is running
    if (!isGameRunning) return;
    
    switch (event.key) {
        case 'ArrowUp':
        case 'w':
        case 'ArrowDown':
        case 's':
            direction.y = 0;
            break;
        case 'ArrowLeft':
        case 'a':
        case 'ArrowRight':
        case 'd':
            direction.x = 0;
            break;
    }
}

// Get current direction
function getDirection() {
    return direction;
} 