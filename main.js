// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    // Get canvas and context
    canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }

    // Initialize renderer
    initRenderer(ctx);
    
    // Setup input handlers
    setupInputHandlers();
    
    // Difficulty selection
    document.getElementById('easyButton').addEventListener('click', function() {
        currentDifficulty = DIFFICULTY.EASY;
        startGame();
    });
    
    document.getElementById('normalButton').addEventListener('click', function() {
        currentDifficulty = DIFFICULTY.NORMAL;
        startGame();
    });
    
    document.getElementById('hardButton').addEventListener('click', function() {
        currentDifficulty = DIFFICULTY.HARD;
        startGame();
    });
    
    console.log('Game initialized successfully');
});

// Start game function
function startGame() {
    document.getElementById('difficultySelection').style.display = 'none'; // Hide difficulty selection
    document.querySelector('.controls').style.display = 'block'; // Show start button
    initGame();
    isGameRunning = true;
    requestAnimationFrame(update);
} 