// Game state
let isGameRunning = false;
let score = 0;
let canvas;

// Define maximum number of enemies
const MAX_ENEMIES = 10; // Set your desired cap here

// Initialize game
function initGame() {
    // Get canvas size
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    
    // Reset bacteria
    bacteria = createBacteria(canvasWidth, canvasHeight);
    
    // Reset game state
    children = [];
    nutrients = [];
    enemies = [];
    score = 0;
    direction = { x: 0, y: 0 };
    
    // Spawn initial nutrients
    for (let i = 0; i < 10; i++) {
        nutrients.push(spawnNutrient(canvasWidth, canvasHeight));
    }
    
    // Spawn initial enemies, capped at MAX_ENEMIES
    for (let i = 0; i < Math.min(3, MAX_ENEMIES); i++) {
        enemies.push(spawnEnemy(canvasWidth, canvasHeight));
    }
    
    // Update UI
    updateUI();
    
    // Hide game over screen
    hideGameOver();
}

// Update game state
function update() {
    if (!isGameRunning) return;
    
    // Move player bacteria
    bacteria.x += direction.x * bacteria.speed;
    bacteria.y += direction.y * bacteria.speed;
    
    // Keep bacteria within bounds
    if (bacteria.x < bacteria.size) bacteria.x = bacteria.size;
    if (bacteria.x > canvas.width - bacteria.size) bacteria.x = canvas.width - bacteria.size;
    if (bacteria.y < bacteria.size) bacteria.y = bacteria.size;
    if (bacteria.y > canvas.height - bacteria.size) bacteria.y = canvas.height - bacteria.size;
    
    // Check for game over (hitting boundary)
    if (bacteria.x <= bacteria.size || bacteria.x >= canvas.width - bacteria.size ||
        bacteria.y <= bacteria.size || bacteria.y >= canvas.height - bacteria.size) {
        if (Math.random() < 0.001) { // Very small chance to trigger on boundary
            gameOver();
            return;
        }
    }
    
    // Update children bacteria
    updateChildren();
    
    // Check collisions with nutrients
    checkNutrientCollisions();
    
    // Check collisions with enemies
    checkEnemyCollisions();
    
    // Move enemies
    moveEnemies();
    
    // Spawn new nutrients occasionally
    if (Math.random() < 0.02) {
        nutrients.push(spawnNutrient(canvas.width, canvas.height));
    }
    
    // Spawn new enemies occasionally, capped at MAX_ENEMIES
    if (enemies.length < MAX_ENEMIES && Math.random() < 0.005) {
        enemies.push(spawnEnemy(canvas.width, canvas.height));
    }
    
    // Draw everything
    draw();
    
    // Continue game loop
    if (isGameRunning) {
        requestAnimationFrame(update);
    }
}

// Update children behavior
function updateChildren() {
    for (let i = children.length - 1; i >= 0; i--) {
        const child = children[i];
        
        // Find closest nutrient if no target
        if (child.targetIndex === -1 && nutrients.length > 0) {
            let closestDist = Infinity;
            let closestIndex = -1;
            
            for (let j = 0; j < nutrients.length; j++) {
                const nutrient = nutrients[j];
                const dx = nutrient.x - child.x;
                const dy = nutrient.y - child.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < closestDist) {
                    closestDist = dist;
                    closestIndex = j;
                }
            }
            
            child.targetIndex = closestIndex;
        } else if (child.targetIndex === -1) {
            // Wander if no targets
            if (child.wanderTimer <= 0) {
                const angle = Math.random() * Math.PI * 2;
                child.dx = Math.cos(angle);
                child.dy = Math.sin(angle);
                child.wanderTimer = 50 + Math.random() * 100;
            } else {
                child.wanderTimer--;
            }
        } else if (child.targetIndex >= 0 && child.targetIndex < nutrients.length) {
            // Move toward target
            const target = nutrients[child.targetIndex];
            const dx = target.x - child.x;
            const dy = target.y - child.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            // If close enough, consume the nutrient
            if (dist < child.size + target.size) {
                child.size += 1;
                nutrients.splice(child.targetIndex, 1);
                child.targetIndex = -1;
                score++;
                updateUI();
                
                // Split if large enough
                if (child.size > 20 && children.length < 5 && Math.random() < 0.3) {
                    const childIndex = children.indexOf(child);
                    splitChildBacteria(childIndex);
                }
            } else {
                // Move toward nutrient
                child.dx = dx / dist;
                child.dy = dy / dist;
            }
        } else {
            // Target no longer exists
            child.targetIndex = -1;
        }
        
        // Avoid enemies
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const dx = child.x - enemy.x;
            const dy = child.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < child.size + enemy.size + 30) {
                // Run away from enemy
                child.dx = dx / dist;
                child.dy = dy / dist;
                break;
            }
        }
        
        // Move child
        child.x += child.dx * child.speed;
        child.y += child.dy * child.speed;
        
        // Bounce off walls
        if (child.x < child.size) {
            child.x = child.size;
            child.dx *= -1;
        }
        if (child.x > canvas.width - child.size) {
            child.x = canvas.width - child.size;
            child.dx *= -1;
        }
        if (child.y < child.size) {
            child.y = child.size;
            child.dy *= -1;
        }
        if (child.y > canvas.height - child.size) {
            child.y = canvas.height - child.size;
            child.dy *= -1;
        }
        
        // Check for collision with enemies
        for (let j = 0; j < enemies.length; j++) {
            const enemy = enemies[j];
            const dx = child.x - enemy.x;
            const dy = child.y - enemy.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < child.size + enemy.size) {
                if (enemy.size > child.size) {
                    // Child is consumed by enemy
                    children.splice(i, 1);
                    updateUI();
                    break;
                }
            }
        }
        
        // Check for collision with nutrients
        for (let j = nutrients.length - 1; j >= 0; j--) {
            const nutrient = nutrients[j];
            const dx = child.x - nutrient.x;
            const dy = child.y - nutrient.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < child.size + nutrient.size) {
                // Consume nutrient
                child.size += 1;
                nutrients.splice(j, 1);
                child.targetIndex = -1;
                score++;
                updateUI();
            }
        }
    }
}

// Check for collisions with nutrients
function checkNutrientCollisions() {
    for (let i = nutrients.length - 1; i >= 0; i--) {
        const nutrient = nutrients[i];
        const dx = bacteria.x - nutrient.x;
        const dy = bacteria.y - nutrient.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bacteria.size + nutrient.size) {
            // Consume nutrient
            bacteria.size += 1;
            nutrients.splice(i, 1);
            score++;
            
            // Check if bacteria should split
            if (bacteria.size >= 20 && Math.random() < 0.4) {
                splitBacteria();
            }
            
            // Update UI
            updateUI();
        }
    }
}

// Check for collisions with enemies
function checkEnemyCollisions() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        const dx = bacteria.x - enemy.x;
        const dy = bacteria.y - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < bacteria.size + enemy.size) {
            if (enemy.size > bacteria.size * 0.8) {
                // Game over if enemy is larger
                gameOver();
                return;
            }
        }
    }
}

// Move enemies
function moveEnemies() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];
        
        // Occasionally change direction
        if (Math.random() < 0.02) {
            enemy.dx = (Math.random() - 0.5) * 2;
            enemy.dy = (Math.random() - 0.5) * 2;
        }
        
        // Find closest target (either main bacteria or children)
        let closestDist = Infinity;
        let closestTarget = null;
        let targetType = 'none';
        let targetIndex = -1;
        
        // Check distance to main bacteria
        const dxMain = bacteria.x - enemy.x;
        const dyMain = bacteria.y - enemy.y;
        const distMain = Math.sqrt(dxMain * dxMain + dyMain * dyMain);
        
        if (distMain < closestDist) {
            closestDist = distMain;
            closestTarget = bacteria;
            targetType = 'main';
        }
        
        // Check distance to each child
        for (let j = 0; j < children.length; j++) {
            const child = children[j];
            const dxChild = child.x - enemy.x;
            const dyChild = child.y - enemy.y;
            const distChild = Math.sqrt(dxChild * dxChild + dyChild * dyChild);
            
            // Only chase if the enemy is bigger than the child or similar size
            if (distChild < closestDist && enemy.size >= child.size * 0.8) {
                closestDist = distChild;
                closestTarget = child;
                targetType = 'child';
                targetIndex = j;
            }
        }
        
        // Chase the closest target if it's within range
        if (closestTarget && closestDist < 150) {
            const dx = closestTarget.x - enemy.x;
            const dy = closestTarget.y - enemy.y;
            const dist = closestDist;
            
            enemy.dx = dx / dist;
            enemy.dy = dy / dist;
            
            // Update enemy state
            enemy.isChasing = true;
            enemy.targetType = targetType;
            enemy.targetIndex = targetIndex;
            
            // Increase speed when chasing
            enemy.speed = Math.min(enemy.speed * 1.005, 2.5);
        } else {
            // Reset state when not chasing
            enemy.isChasing = false;
            enemy.targetType = 'none';
            enemy.targetIndex = -1;
            
            // Reset speed when wandering
            enemy.speed = Math.max(enemy.speed * 0.99, 1);
        }
        
        // Normalize speed
        const magnitude = Math.sqrt(enemy.dx * enemy.dx + enemy.dy * enemy.dy);
        if (magnitude > 0) {
            enemy.dx /= magnitude;
            enemy.dy /= magnitude;
        }
        
        // Move enemy
        enemy.x += enemy.dx * enemy.speed;
        enemy.y += enemy.dy * enemy.speed;
        
        // Bounce off walls
        if (enemy.x < enemy.size) {
            enemy.x = enemy.size;
            enemy.dx *= -1;
        }
        if (enemy.x > canvas.width - enemy.size) {
            enemy.x = canvas.width - enemy.size;
            enemy.dx *= -1;
        }
        if (enemy.y < enemy.size) {
            enemy.y = enemy.size;
            enemy.dy *= -1;
        }
        if (enemy.y > canvas.height - enemy.size) {
            enemy.y = canvas.height - enemy.size;
            enemy.dy *= -1;
        }
    }
}

// Game over
function gameOver() {
    isGameRunning = false;
    // Calculate final score including children
    const finalScore = score + children.length; // Add the number of children to the score
    showGameOver(finalScore); // Pass the final score to the showGameOver function
}

// Show game over UI
function showGameOver(finalScore) {
    const finalSizeElement = document.getElementById('finalSize');
    const gameOverElement = document.getElementById('gameOver');
    
    if (finalSizeElement) finalSizeElement.textContent = Math.round(bacteria.size).toString();
    if (gameOverElement) gameOverElement.style.display = 'block';
    
    // Display the final score
    const scoreElement = document.createElement('p');
    scoreElement.textContent = `Final Score: ${finalScore}`;
    gameOverElement.appendChild(scoreElement);
}

// Start game
function startGame() {
    initGame();
    isGameRunning = true;
    requestAnimationFrame(update);
} 