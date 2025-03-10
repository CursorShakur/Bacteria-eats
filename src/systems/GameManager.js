import { Bacteria } from '../entities/Bacteria.js';
import { Nutrient } from '../entities/Nutrient.js';
import { ImmuneCell } from '../entities/ImmuneCell.js';
import { Colony } from '../entities/Colony.js';
import { BACTERIA_TYPES, IMMUNE_CELL_TYPES, NUTRIENT_TYPES, COLONY } from '../constants/gameConstants.js';

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
        
        // Initialize debug info
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 0;
        this.fpsUpdateInterval = 500; // Update FPS every 500ms
        this.lastFpsUpdate = performance.now();
        
        // Update global debug info
        this.updateDebugInfo('initialized');
    }

    reset() {
        this.playerBacteria = null;
        this.colonies = new Set();
        this.nutrients = new Set();
        this.immuneCells = new Set();
        this.score = 0;
        this.gameOver = false;
        this.selectedBacteriaType = BACTERIA_TYPES.COCCI;
    }

    start(bacteriaType) {
        this.reset();
        this.selectedBacteriaType = bacteriaType;
        
        // Create player bacteria
        this.playerBacteria = new Bacteria(
            this.canvas.width / 2,
            this.canvas.height / 2,
            bacteriaType
        );
        
        console.log(`Game started with ${bacteriaType.name}`);
        console.log(`Player bacteria created at (${this.playerBacteria.x}, ${this.playerBacteria.y})`);

        // Initialize starting nutrients
        for (let i = 0; i < 30; i++) {
            this.spawnRandomNutrient();
        }
        console.log(`Spawned ${this.nutrients.size} nutrients`);

        // Initialize some immune cells
        for (let i = 0; i < 5; i++) {
            this.spawnImmuneCell();
        }
        console.log(`Spawned ${this.immuneCells.size} immune cells`);

        // Flag that game is not over
        this.gameOver = false;
        
        // Start the game loop
        this.gameLoop();
        
        console.log('Game loop started');
    }

    gameLoop() {
        // Use requestAnimationFrame for the game loop
        const self = this;
        let lastTime = performance.now();
        
        function loop(timestamp) {
            // Calculate delta time in seconds
            const deltaTime = (timestamp - lastTime) / 1000 || 0.016;
            lastTime = timestamp;
            
            // Update FPS counter
            self.frameCount++;
            if (timestamp - self.lastFpsUpdate >= self.fpsUpdateInterval) {
                self.fps = (self.frameCount * 1000) / (timestamp - self.lastFpsUpdate);
                self.lastFpsUpdate = timestamp;
                self.frameCount = 0;
                
                // Update debug info every FPS update
                self.updateDebugInfo();
            }
            
            // Update and render
            self.update(deltaTime);
            self.render();
            
            // Continue loop if game is not over
            if (!self.gameOver) {
                requestAnimationFrame(loop);
            } else {
                console.log('Game over detected, stopping game loop');
                self.updateDebugInfo('Game Over');
            }
        }
        
        // Start the loop
        requestAnimationFrame(loop);
    }

    update(deltaTime) {
        if (!this.playerBacteria || !this.playerBacteria.isAlive()) {
            this.gameOver = true;
            return;
        }
        
        this.playerBacteria.update(deltaTime);
        this.playerBacteria.keepInBounds(this.canvas.width, this.canvas.height);
        
        // Update colonies
        this.colonies.forEach(colony => colony.update());
        
        // Update nutrients
        this.nutrients.forEach(nutrient => {
            if (!nutrient.isAlive()) {
                this.nutrients.delete(nutrient);
            }
        });

        // Spawn new nutrients
        if (Math.random() < 0.05) {
            this.spawnRandomNutrient();
        }

        // Update immune cells
        this.immuneCells.forEach(cell => {
            cell.update(deltaTime, [this.playerBacteria, ...this.getChildBacteria()]);
            cell.keepInBounds(this.canvas.width, this.canvas.height);
        });

        // Spawn new immune cells
        if (Math.random() < 0.02 && this.immuneCells.size < 10) {
            this.spawnImmuneCell();
        }

        // Check collisions
        this.checkCollisions();

        // Try to form new colonies
        this.tryFormColonies();
    }

    render() {
        // Log first few render calls
        if (!this._renderCount) {
            this._renderCount = 1;
            console.log('First render call');
        } else if (this._renderCount < 5) {
            this._renderCount++;
            console.log(`Render call #${this._renderCount}`);
        }
        
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Debug grid
        this.renderDebugGrid();

        // Render nutrients
        this.nutrients.forEach(nutrient => nutrient.render(this.ctx));

        // Render colonies (connections)
        this.colonies.forEach(colony => {
            this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
            this.ctx.beginPath();
            const members = Array.from(colony.members);
            for (let i = 0; i < members.length; i++) {
                for (let j = i + 1; j < members.length; j++) {
                    this.ctx.moveTo(members[i].x, members[i].y);
                    this.ctx.lineTo(members[j].x, members[j].y);
                }
            }
            this.ctx.stroke();
        });

        // Render player bacteria
        if (this.playerBacteria) {
            this.playerBacteria.render(this.ctx);
            
            // Debug info for player bacteria
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
            this.ctx.font = '10px Arial';
            this.ctx.fillText(
                `pos: (${Math.round(this.playerBacteria.x)},${Math.round(this.playerBacteria.y)})`, 
                this.playerBacteria.x + this.playerBacteria.size + 5, 
                this.playerBacteria.y - 5
            );
        } else {
            console.warn('No player bacteria to render');
        }

        // Render immune cells
        this.immuneCells.forEach(cell => cell.render(this.ctx));

        // Render UI
        this.renderUI();
        
        // Debug information
        this.renderDebugInfo();
    }

    renderUI() {
        // Score
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);

        // Energy
        if (this.playerBacteria) {
            this.ctx.fillText(`Energy: ${Math.round(this.playerBacteria.energy)}`, 10, 60);
        }

        // Colony count
        this.ctx.fillText(`Colonies: ${this.colonies.size}`, 10, 90);

        // Game over screen
        if (this.gameOver) {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = 'white';
            this.ctx.font = '40px Arial';
            this.ctx.textAlign = 'center';
            this.ctx.fillText('Game Over', this.canvas.width / 2, this.canvas.height / 2);
            this.ctx.font = '20px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.canvas.width / 2, this.canvas.height / 2 + 40);
            this.ctx.fillText('Press Space to Restart', this.canvas.width / 2, this.canvas.height / 2 + 80);
        }
    }

    checkCollisions() {
        // Check nutrient collisions
        this.nutrients.forEach(nutrient => {
            if (this.playerBacteria && this.playerBacteria.collidesWith(nutrient)) {
                if (this.playerBacteria.consumeNutrient(nutrient)) {
                    this.score += nutrient.energyValue;
                    nutrient.deactivate();
                }
            }
        });

        // Check immune cell collisions
        this.immuneCells.forEach(cell => {
            if (this.playerBacteria && cell.collidesWith(this.playerBacteria)) {
                cell.attack(this.playerBacteria);
            }
        });
    }

    tryFormColonies() {
        const allBacteria = [this.playerBacteria, ...this.getChildBacteria()];
        
        // Try to add bacteria to existing colonies
        allBacteria.forEach(bacteria => {
            if (!bacteria.colony) {
                for (const colony of this.colonies) {
                    if (colony.canAcceptMember(bacteria)) {
                        colony.addMember(bacteria);
                        break;
                    }
                }
            }
        });

        // Try to form new colonies
        allBacteria.forEach(bacteria1 => {
            if (!bacteria1.colony) {
                const nearbyBacteria = allBacteria.filter(bacteria2 => {
                    if (bacteria1 === bacteria2 || bacteria2.colony) return false;
                    const dx = bacteria1.x - bacteria2.x;
                    const dy = bacteria1.y - bacteria2.y;
                    return Math.sqrt(dx * dx + dy * dy) <= COLONY.COMMUNICATION_RANGE;
                });

                if (nearbyBacteria.length >= COLONY.FORMATION_THRESHOLD - 1) {
                    const colony = new Colony();
                    colony.addMember(bacteria1);
                    nearbyBacteria.forEach(bacteria => colony.addMember(bacteria));
                    this.colonies.add(colony);
                }
            }
        });
    }

    spawnImmuneCell() {
        const types = Object.values(IMMUNE_CELL_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Spawn from outside the visible area
        let x, y;
        if (Math.random() < 0.5) {
            // Spawn from horizontal edges
            x = Math.random() * this.canvas.width;
            y = Math.random() < 0.5 ? -20 : this.canvas.height + 20;
        } else {
            // Spawn from vertical edges
            x = Math.random() < 0.5 ? -20 : this.canvas.width + 20;
            y = Math.random() * this.canvas.height;
        }
        
        const cell = new ImmuneCell(x, y, randomType);
        this.immuneCells.add(cell);
        return cell;
    }

    spawnRandomNutrient() {
        const types = Object.values(NUTRIENT_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Random position within the canvas
        const x = Math.random() * (this.canvas.width - 20) + 10;
        const y = Math.random() * (this.canvas.height - 20) + 10;
        
        const nutrient = new Nutrient(x, y, randomType);
        this.nutrients.add(nutrient);
        return nutrient;
    }

    getChildBacteria() {
        let children = [];
        this.colonies.forEach(colony => {
            colony.members.forEach(bacteria => {
                if (bacteria !== this.playerBacteria) {
                    children.push(bacteria);
                }
            });
        });
        return children;
    }

    handleInput(dx, dy) {
        if (this.playerBacteria && this.playerBacteria.isAlive()) {
            this.playerBacteria.setDirection(dx, dy);
        }
    }

    showBacteriaSelection() {
        // For simplicity, reload the page
        window.location.reload();
    }

    renderDebugGrid() {
        // Draw a light grid for reference
        this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.1)';
        this.ctx.beginPath();
        
        // Vertical lines
        for (let x = 0; x < this.canvas.width; x += 100) {
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
        }
        
        // Horizontal lines
        for (let y = 0; y < this.canvas.height; y += 100) {
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
        }
        
        this.ctx.stroke();
    }
    
    renderDebugInfo() {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
        this.ctx.font = '12px monospace';
        
        const debugInfo = [
            `Canvas: ${this.canvas.width}x${this.canvas.height}`,
            `Bacteria: ${this.playerBacteria ? 'Active' : 'None'} (${this.playerBacteria ? this.selectedBacteriaType.name : 'N/A'})`,
            `Nutrients: ${this.nutrients.size}`,
            `Immune cells: ${this.immuneCells.size}`,
            `Colonies: ${this.colonies.size}`,
            `Game Over: ${this.gameOver}`
        ];
        
        let y = 90;
        debugInfo.forEach(info => {
            this.ctx.fillText(info, 10, y);
            y += 20;
        });
    }

    updateDebugInfo(status) {
        // Update global debug info object
        window.GAME_INFO = {
            status: status || (this.gameOver ? 'Game Over' : 'Running'),
            fps: Math.round(this.fps),
            player: this.playerBacteria ? 
                `${this.selectedBacteriaType?.name || 'Unknown'} (${Math.round(this.playerBacteria.x)},${Math.round(this.playerBacteria.y)})` : 
                'None',
            entities: `Nutrients: ${this.nutrients?.size || 0}, Immune: ${this.immuneCells?.size || 0}, Colonies: ${this.colonies?.size || 0}`,
            canvas: this.canvas ? `${this.canvas.width}x${this.canvas.height}` : 'Not available'
        };
    }
} 