// Simple fallback game starter
document.addEventListener('DOMContentLoaded', () => {
    console.log('Fallback game starter initialized');
    
    // Check if loading screen exists and hide it
    const loadingScreen = document.getElementById('loading');
    if (loadingScreen) {
        loadingScreen.style.display = 'none';
    }
    
    // Create a start game button
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
    
    document.body.appendChild(startButton);
    
    startButton.addEventListener('click', () => {
        startButton.remove();
        startSimpleGame();
    });
    
    function startSimpleGame() {
        const canvas = document.getElementById('gameCanvas');
        if (!canvas) {
            console.error('Canvas element not found');
            return;
        }
        
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth - 40;
        canvas.height = window.innerHeight - 40;
        
        // Simple game state
        const game = {
            player: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                size: 10,
                color: '#0070DD',
                speed: 2,
                dx: 0,
                dy: 0
            },
            nutrients: [],
            enemies: [],
            score: 0,
            gameOver: false
        };
        
        // Create initial nutrients
        for (let i = 0; i < 20; i++) {
            game.nutrients.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 3 + Math.random() * 2,
                color: '#8BC34A'
            });
        }
        
        // Create initial enemies
        for (let i = 0; i < 5; i++) {
            game.enemies.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                size: 10 + Math.random() * 5,
                color: '#FFFFFF',
                speed: 1,
                dx: Math.random() * 2 - 1,
                dy: Math.random() * 2 - 1
            });
        }
        
        // Input handling
        const keys = new Set();
        
        document.addEventListener('keydown', (e) => {
            keys.add(e.key.toLowerCase());
            
            if (e.code === 'Space' && game.gameOver) {
                resetGame();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            keys.delete(e.key.toLowerCase());
        });
        
        function updateInput() {
            game.player.dx = 0;
            game.player.dy = 0;
            
            if (keys.has('w') || keys.has('arrowup')) game.player.dy = -1;
            if (keys.has('s') || keys.has('arrowdown')) game.player.dy = 1;
            if (keys.has('a') || keys.has('arrowleft')) game.player.dx = -1;
            if (keys.has('d') || keys.has('arrowright')) game.player.dx = 1;
            
            // Normalize diagonal movement
            if (game.player.dx !== 0 && game.player.dy !== 0) {
                const magnitude = Math.sqrt(game.player.dx * game.player.dx + game.player.dy * game.player.dy);
                game.player.dx /= magnitude;
                game.player.dy /= magnitude;
            }
        }
        
        function update() {
            if (game.gameOver) return;
            
            // Update player position
            game.player.x += game.player.dx * game.player.speed;
            game.player.y += game.player.dy * game.player.speed;
            
            // Keep player within bounds
            game.player.x = Math.max(game.player.size, Math.min(canvas.width - game.player.size, game.player.x));
            game.player.y = Math.max(game.player.size, Math.min(canvas.height - game.player.size, game.player.y));
            
            // Update enemies
            game.enemies.forEach(enemy => {
                // Simple AI to chase player
                const dx = game.player.x - enemy.x;
                const dy = game.player.y - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < 150) {
                    enemy.dx = dx / dist;
                    enemy.dy = dy / dist;
                }
                
                enemy.x += enemy.dx * enemy.speed;
                enemy.y += enemy.dy * enemy.speed;
                
                // Bounce off walls
                if (enemy.x < enemy.size || enemy.x > canvas.width - enemy.size) {
                    enemy.dx *= -1;
                }
                if (enemy.y < enemy.size || enemy.y > canvas.height - enemy.size) {
                    enemy.dy *= -1;
                }
                
                // Check collision with player
                const distance = Math.sqrt(
                    Math.pow(game.player.x - enemy.x, 2) + 
                    Math.pow(game.player.y - enemy.y, 2)
                );
                
                if (distance < game.player.size + enemy.size) {
                    if (game.player.size > enemy.size) {
                        // Player eats enemy
                        game.player.size += enemy.size / 4;
                        game.score += 100;
                        enemy.x = Math.random() * canvas.width;
                        enemy.y = Math.random() * canvas.height;
                        enemy.size = 10 + Math.random() * 5;
                    } else {
                        // Enemy eats player
                        game.gameOver = true;
                    }
                }
            });
            
            // Check nutrient collisions
            game.nutrients.forEach(nutrient => {
                const distance = Math.sqrt(
                    Math.pow(game.player.x - nutrient.x, 2) + 
                    Math.pow(game.player.y - nutrient.y, 2)
                );
                
                if (distance < game.player.size + nutrient.size) {
                    game.player.size += nutrient.size / 5;
                    game.score += 10;
                    nutrient.x = Math.random() * canvas.width;
                    nutrient.y = Math.random() * canvas.height;
                }
            });
            
            // Spawn new nutrients occasionally
            if (Math.random() < 0.03) {
                game.nutrients.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: 3 + Math.random() * 2,
                    color: '#8BC34A'
                });
            }
        }
        
        function render() {
            // Clear canvas
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            // Draw nutrients
            game.nutrients.forEach(nutrient => {
                ctx.fillStyle = nutrient.color;
                ctx.beginPath();
                ctx.arc(nutrient.x, nutrient.y, nutrient.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw player
            ctx.fillStyle = game.player.color;
            ctx.beginPath();
            ctx.arc(game.player.x, game.player.y, game.player.size, 0, Math.PI * 2);
            ctx.fill();
            
            // Draw enemies
            game.enemies.forEach(enemy => {
                ctx.fillStyle = enemy.color;
                ctx.beginPath();
                ctx.arc(enemy.x, enemy.y, enemy.size, 0, Math.PI * 2);
                ctx.fill();
            });
            
            // Draw score
            ctx.fillStyle = 'white';
            ctx.font = '20px Arial';
            ctx.fillText(`Score: ${game.score}`, 10, 30);
            
            // Draw game over if needed
            if (game.gameOver) {
                ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                ctx.fillStyle = 'white';
                ctx.font = '40px Arial';
                ctx.textAlign = 'center';
                ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2);
                ctx.font = '20px Arial';
                ctx.fillText(`Final Score: ${game.score}`, canvas.width / 2, canvas.height / 2 + 40);
                ctx.fillText('Press Space to Restart', canvas.width / 2, canvas.height / 2 + 80);
            }
        }
        
        function resetGame() {
            game.player.x = canvas.width / 2;
            game.player.y = canvas.height / 2;
            game.player.size = 10;
            game.score = 0;
            game.gameOver = false;
            
            game.nutrients = [];
            for (let i = 0; i < 20; i++) {
                game.nutrients.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: 3 + Math.random() * 2,
                    color: '#8BC34A'
                });
            }
            
            game.enemies = [];
            for (let i = 0; i < 5; i++) {
                game.enemies.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    size: 10 + Math.random() * 5,
                    color: '#FFFFFF',
                    speed: 1,
                    dx: Math.random() * 2 - 1,
                    dy: Math.random() * 2 - 1
                });
            }
        }
        
        // Game loop
        function gameLoop() {
            updateInput();
            update();
            render();
            requestAnimationFrame(gameLoop);
        }
        
        // Start the game loop
        gameLoop();
    }
}); 