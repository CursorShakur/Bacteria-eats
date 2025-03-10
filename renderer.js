// Canvas context
let ctx;

// Initialize renderer
function initRenderer(canvasContext) {
    ctx = canvasContext;
}

// Draw game
function draw() {
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw nutrients
    drawNutrients();
    
    // Draw children
    drawChildren();
    
    // Draw enemies
    drawEnemies();
    
    // Draw player bacteria
    drawMainBacteria();
}

// Draw nutrients
function drawNutrients() {
    for (let i = 0; i < nutrients.length; i++) {
        const nutrient = nutrients[i];
        ctx.fillStyle = NUTRIENT_COLOR;
        ctx.beginPath();
        ctx.arc(nutrient.x, nutrient.y, nutrient.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw children
function drawChildren() {
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        
        // Draw body
        ctx.fillStyle = BACTERIA_COLOR;
        ctx.beginPath();
        ctx.arc(child.x, child.y, child.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner detail
        ctx.fillStyle = '#005CB8';
        ctx.beginPath();
        ctx.arc(child.x, child.y, child.size * 0.7, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw enemies
function drawEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // Draw chase aura if chasing
        if (enemy.isChasing) {
            ctx.fillStyle = 'rgba(255, 150, 150, 0.3)';
            ctx.beginPath();
            ctx.arc(enemy.x, enemy.y, enemy.size + 10, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // Draw body
        ctx.fillStyle = ENEMY_COLOR;
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw inner detail
        ctx.fillStyle = '#EEEEEE';
        ctx.beginPath();
        ctx.arc(enemy.x, enemy.y, enemy.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw main bacteria
function drawMainBacteria() {
    // Draw main body
    ctx.fillStyle = BACTERIA_COLOR;
    ctx.beginPath();
    ctx.arc(bacteria.x, bacteria.y, bacteria.size, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw inner detail
    ctx.fillStyle = '#005CB8';
    ctx.beginPath();
    ctx.arc(bacteria.x, bacteria.y, bacteria.size * 0.7, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw outline
    ctx.strokeStyle = '#00AAFF';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(bacteria.x, bacteria.y, bacteria.size, 0, Math.PI * 2);
    ctx.stroke();
}

// Update UI elements
function updateUI() {
    const sizeElement = document.getElementById('size');
    const childrenElement = document.getElementById('children');
    const nutrientsElement = document.getElementById('nutrients');
    
    if (sizeElement) sizeElement.textContent = Math.round(bacteria.size).toString();
    if (childrenElement) childrenElement.textContent = children.length.toString();
    if (nutrientsElement) nutrientsElement.textContent = score.toString();
}

// Update game over UI
function showGameOver() {
    const finalSizeElement = document.getElementById('finalSize');
    const gameOverElement = document.getElementById('gameOver');
    
    if (finalSizeElement) finalSizeElement.textContent = Math.round(bacteria.size).toString();
    if (gameOverElement) gameOverElement.style.display = 'block';
}

// Hide game over UI
function hideGameOver() {
    const gameOverElement = document.getElementById('gameOver');
    if (gameOverElement) gameOverElement.style.display = 'none';
} 