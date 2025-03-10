// Colors
const BACTERIA_COLOR = '#0070DD';
const NUTRIENT_COLOR = '#8BC34A';
const ENEMY_COLOR = '#FFFFFF';

// Game entities
let bacteria = {
    x: 0,
    y: 0,
    size: 10,
    speed: 2
};

let children = [];
let nutrients = [];
let enemies = [];

// Difficulty levels
const DIFFICULTY = {
    EASY: 'easy',
    NORMAL: 'normal',
    HARD: 'hard'
};

// Set the current difficulty level (change this to switch modes)
let currentDifficulty = DIFFICULTY.NORMAL; // Change to DIFFICULTY.EASY or DIFFICULTY.HARD as needed

// Create a new bacteria entity
function createBacteria(canvasWidth, canvasHeight) {
    return {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        size: 10,
        speed: 2
    };
}

// Spawn a nutrient at a random position
function spawnNutrient(canvasWidth, canvasHeight) {
    return {
        x: Math.random() * (canvasWidth - 20) + 10,
        y: Math.random() * (canvasHeight - 20) + 10,
        size: Math.random() * 2 + 3
    };
}

// Spawn an enemy (white blood cell)
function spawnEnemy(canvasWidth, canvasHeight) {
    // Determine spawn position outside the game board
    const spawnSide = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
    let x, y;

    switch (spawnSide) {
        case 0: // Top
            x = Math.random() * canvasWidth;
            y = -20; // Spawn above the canvas
            break;
        case 1: // Right
            x = canvasWidth + 20; // Spawn to the right of the canvas
            y = Math.random() * canvasHeight;
            break;
        case 2: // Bottom
            x = Math.random() * canvasWidth;
            y = canvasHeight + 20; // Spawn below the canvas
            break;
        case 3: // Left
            x = -20; // Spawn to the left of the canvas
            y = Math.random() * canvasHeight;
            break;
    }

    // Set enemy speed based on difficulty
    let speed;
    switch (currentDifficulty) {
        case DIFFICULTY.EASY:
            speed = Math.random() * 0.1 + 0.1; // Very slow
            break;
        case DIFFICULTY.NORMAL:
            speed = Math.random() * 0.2 + 0.3; // Half the current speed
            break;
        case DIFFICULTY.HARD:
            speed = Math.random() * 0.2 + 0.3; // Current speed
            break;
    }

    return {
        x: x,
        y: y,
        size: Math.random() * 5 + 15,
        dx: (Math.random() - 0.5) * 2,
        dy: (Math.random() - 0.5) * 2,
        speed: speed,
        isChasing: false,
        targetType: 'none',  // 'main' or 'child'
        targetIndex: -1
    };
}

// Split bacteria when it gets big enough
function splitBacteria() {
    // Create new child
    const angle = Math.random() * Math.PI * 2;
    const distance = bacteria.size + 5;
    
    const child = {
        x: bacteria.x + Math.cos(angle) * distance,
        y: bacteria.y + Math.sin(angle) * distance,
        size: bacteria.size / 2,
        speed: 1,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        targetIndex: -1,
        wanderTimer: 0
    };
    
    children.push(child);
    
    // Reduce parent size
    bacteria.size = bacteria.size * 0.7;
}

// Split a child bacteria
function splitChildBacteria(index) {
    const parent = children[index];
    
    // Create new child
    const angle = Math.random() * Math.PI * 2;
    const distance = parent.size + 5;
    
    const child = {
        x: parent.x + Math.cos(angle) * distance,
        y: parent.y + Math.sin(angle) * distance,
        size: parent.size / 2,
        speed: parent.speed,
        dx: Math.cos(angle),
        dy: Math.sin(angle),
        targetIndex: -1,
        wanderTimer: 0
    };
    
    children.push(child);
    
    // Reduce parent size
    parent.size = parent.size * 0.7;
} 