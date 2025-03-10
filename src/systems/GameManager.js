import { Bacteria } from '../entities/Bacteria.js';
import { Nutrient } from '../entities/Nutrient.js';
import { ImmuneCell } from '../entities/ImmuneCell.js';
import { Colony } from '../entities/Colony.js';
import { BACTERIA_TYPES, IMMUNE_CELL_TYPES, COLONY } from '../constants/gameConstants.js';

export class GameManager {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.reset();
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

        // Spawn initial nutrients
        for (let i = 0; i < 10; i++) {
            const nutrient = Nutrient.spawnRandom(this.canvas.width, this.canvas.height);
            if (nutrient) this.nutrients.add(nutrient);
        }

        // Start game loop
        this.lastTime = performance.now();
        this.gameLoop();
    }

    gameLoop() {
        if (this.gameOver) return;

        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        this.update(deltaTime);
        this.render();

        requestAnimationFrame(() => this.gameLoop());
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
            const nutrient = Nutrient.spawnRandom(this.canvas.width, this.canvas.height);
            if (nutrient) this.nutrients.add(nutrient);
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
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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
        this.playerBacteria.render(this.ctx);

        // Render immune cells
        this.immuneCells.forEach(cell => cell.render(this.ctx));

        // Render UI
        this.renderUI();
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
        // Choose random immune cell type
        const types = Object.values(IMMUNE_CELL_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];

        // Choose spawn position outside the canvas
        const side = Math.floor(Math.random() * 4);
        let x, y;

        switch (side) {
            case 0: // Top
                x = Math.random() * this.canvas.width;
                y = -20;
                break;
            case 1: // Right
                x = this.canvas.width + 20;
                y = Math.random() * this.canvas.height;
                break;
            case 2: // Bottom
                x = Math.random() * this.canvas.width;
                y = this.canvas.height + 20;
                break;
            case 3: // Left
                x = -20;
                y = Math.random() * this.canvas.height;
                break;
        }

        const cell = new ImmuneCell(x, y, randomType);
        this.immuneCells.add(cell);
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
} 