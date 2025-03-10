/**
 * Handles all rendering for the game
 */
export class Renderer {
    constructor(canvas, game) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.game = game;
        
        // Make sure the canvas is visible
        this.canvas.style.display = 'block';
        
        // Set initial canvas state
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        
        console.log('Renderer initialized with canvas:', canvas.width, 'x', canvas.height);
        console.log('Game reference:', this.game);
        console.log('Game engine reference:', this.game ? this.game.gameEngine : 'None');
    }
    
    /**
     * Main render function called on each game loop
     */
    render() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw background
        this.ctx.fillStyle = 'rgba(30, 0, 0, 0.9)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw grid for reference
        this.drawGrid();
        
        // Draw game entities - directly access the gameEngine
        if (this.game && this.game.gameEngine) {
            // Draw the game entities
            this.game.gameEngine.draw(this.ctx);
            
            // Draw additional debug info
            this.ctx.fillStyle = 'white';
            this.ctx.font = '14px Arial';
            this.ctx.fillText(`Entities: Nutrients: ${this.game.gameEngine.nutrients.length}, Enemies: ${this.game.gameEngine.enemies.length}`, 10, 80);
            
            // Draw player info if available
            if (this.game.gameEngine.player) {
                this.ctx.fillText(`Player: x=${Math.round(this.game.gameEngine.player.x)}, y=${Math.round(this.game.gameEngine.player.y)}`, 10, 100);
            }
        } else {
            console.error('Game engine not available:', this.game);
            // Draw fallback content
            this.drawFallbackContent();
        }
        
        // Debug info
        this.drawDebugInfo();
    }
    
    /**
     * Draw a grid for reference
     */
    drawGrid() {
        // Grid drawing disabled
        return;
        
        /* Original grid drawing code
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;

        // Draw vertical lines
        for (let x = 0; x < this.canvas.width; x += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        // Draw horizontal lines
        for (let y = 0; y < this.canvas.height; y += 50) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }

        this.ctx.restore();
        */
    }
    
    /**
     * Draw fallback content when game engine is not available
     */
    drawFallbackContent() {
        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '24px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('Game engine not initialized properly', this.canvas.width / 2, this.canvas.height / 2);
        
        // Add more detailed error information
        this.ctx.font = '16px Arial';
        if (!this.game) {
            this.ctx.fillText('Game object is missing', this.canvas.width / 2, this.canvas.height / 2 + 30);
        } else if (!this.game.gameEngine) {
            this.ctx.fillText('GameEngine object is missing', this.canvas.width / 2, this.canvas.height / 2 + 30);
        }
        
        this.ctx.restore();
    }
    
    /**
     * Draw debug information
     */
    drawDebugInfo() {
        this.ctx.save();
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.fillText(`Canvas: ${this.canvas.width}x${this.canvas.height}`, 10, 20);
        this.ctx.fillText(`Game Engine: ${this.game && this.game.gameEngine ? 'Available' : 'Not Available'}`, 10, 40);
        this.ctx.fillText(`Player: ${this.game && this.game.gameEngine && this.game.gameEngine.player ? 'Available' : 'Not Available'}`, 10, 60);
        this.ctx.restore();
    }
} 