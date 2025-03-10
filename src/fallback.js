// Fallback script for browsers that don't support ES modules
(function() {
    console.log('Fallback script loaded');
    
    // Get canvas
    const canvas = document.getElementById('gameCanvas');
    if (!canvas) {
        console.error('Canvas element not found');
        return;
    }
    
    // Set canvas size
    canvas.width = window.innerWidth - 40;
    canvas.height = window.innerHeight - 40;
    
    // Get context
    const ctx = canvas.getContext('2d');
    if (!ctx) {
        console.error('Could not get canvas context');
        return;
    }
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw a simple game
    function drawGame() {
        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Draw grid
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        
        // Vertical lines
        for (let x = 0; x < canvas.width; x += 100) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        
        // Horizontal lines
        for (let y = 0; y < canvas.height; y += 100) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }
        
        // Draw player
        ctx.fillStyle = '#0070DD';
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Draw food
        food.forEach(item => {
            ctx.fillStyle = item.color;
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.size, 0, Math.PI * 2);
            ctx.fill();
        });
        
        // Draw score
        ctx.fillStyle = 'white';
        ctx.font = '20px Arial';
        ctx.fillText(`Score: ${score}`, 10, 30);
        
        // Draw message
        ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        ctx.font = '16px Arial';
        ctx.fillText('Fallback Mode: Your browser may not support ES modules', 10, canvas.height - 20);
    }
    
    // Game state
    const player = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        size: 15,
        speed: 3
    };
    
    const food = [];
    let score = 0;
    
    // Spawn food
    function spawnFood() {
        if (food.length < 20) {
            food.push({
                x: Math.random() * (canvas.width - 20) + 10,
                y: Math.random() * (canvas.height - 20) + 10,
                size: 5 + Math.random() * 5,
                color: `hsl(${Math.random() * 360}, 70%, 50%)`
            });
        }
    }
    
    // Check collisions
    function checkCollisions() {
        for (let i = food.length - 1; i >= 0; i--) {
            const dx = player.x - food[i].x;
            const dy = player.y - food[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < player.size + food[i].size) {
                // Eat food
                score += Math.round(food[i].size);
                player.size += food[i].size / 10;
                food.splice(i, 1);
            }
        }
    }
    
    // Handle input
    const keys = {
        up: false,
        down: false,
        left: false,
        right: false
    };
    
    document.addEventListener('keydown', e => {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                keys.up = true;
                break;
            case 's':
            case 'arrowdown':
                keys.down = true;
                break;
            case 'a':
            case 'arrowleft':
                keys.left = true;
                break;
            case 'd':
            case 'arrowright':
                keys.right = true;
                break;
        }
    });
    
    document.addEventListener('keyup', e => {
        switch (e.key.toLowerCase()) {
            case 'w':
            case 'arrowup':
                keys.up = false;
                break;
            case 's':
            case 'arrowdown':
                keys.down = false;
                break;
            case 'a':
            case 'arrowleft':
                keys.left = false;
                break;
            case 'd':
            case 'arrowright':
                keys.right = false;
                break;
        }
    });
    
    // Game loop
    function gameLoop() {
        // Move player
        if (keys.up) player.y -= player.speed;
        if (keys.down) player.y += player.speed;
        if (keys.left) player.x -= player.speed;
        if (keys.right) player.x += player.speed;
        
        // Keep player in bounds
        player.x = Math.max(player.size, Math.min(canvas.width - player.size, player.x));
        player.y = Math.max(player.size, Math.min(canvas.height - player.size, player.y));
        
        // Spawn food
        if (Math.random() < 0.05) spawnFood();
        
        // Check collisions
        checkCollisions();
        
        // Draw game
        drawGame();
        
        // Continue loop
        requestAnimationFrame(gameLoop);
    }
    
    // Start game
    function startGame() {
        // Hide start button
        const startButton = document.getElementById('start-game-button');
        if (startButton) startButton.style.display = 'none';
        
        // Hide loading screen
        const loading = document.getElementById('loading');
        if (loading) loading.style.display = 'none';
        
        // Initialize food
        for (let i = 0; i < 20; i++) {
            spawnFood();
        }
        
        // Start game loop
        gameLoop();
    }
    
    // Set up start button
    const startButton = document.getElementById('start-game-button');
    if (startButton) {
        // Replace existing click handler
        startButton.replaceWith(startButton.cloneNode(true));
        
        // Get the new button
        const newStartButton = document.getElementById('start-game-button');
        if (newStartButton) {
            newStartButton.addEventListener('click', startGame);
        }
    }
    
    // Hide loading screen
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
    
    // Show a message that we're in fallback mode
    const errorPanel = document.getElementById('error-panel');
    const errorMessage = document.getElementById('error-message');
    const errorStack = document.getElementById('error-stack');
    
    if (errorPanel && errorMessage && errorStack) {
        errorMessage.textContent = 'Using fallback mode';
        errorStack.textContent = 'Your browser may not support ES modules. A simplified version of the game will be used.';
        errorPanel.style.display = 'block';
        
        // Hide error panel after 5 seconds
        setTimeout(() => {
            errorPanel.style.display = 'none';
        }, 5000);
    }
})(); 