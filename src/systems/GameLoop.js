import { CollisionSystem } from './CollisionSystem.js';
import { Spawner } from './Spawner.js';
import { ColonyManager } from './ColonyManager.js';

export class GameLoop {
    constructor(gameManager) {
        this.gameManager = gameManager;
        this.lastTime = performance.now();
        this.running = false;
    }

    start() {
        this.running = true;
        this.lastTime = performance.now();
        this.loop();
    }

    loop() {
        if (!this.running || this.gameManager.gameOver) return;
        const currentTime = performance.now();
        const deltaTime = (currentTime - this.lastTime) / 1000;
        this.lastTime = currentTime;

        // Update game state
        this.gameManager.update(deltaTime);

        // Perform collision checking
        CollisionSystem.checkCollisions(this.gameManager);

        // Spawn new nutrients and immune cells
        Spawner.spawnNutrients(this.gameManager);
        Spawner.spawnImmuneCells(this.gameManager);

        // Try to form colonies
        ColonyManager.tryFormColonies(this.gameManager);

        // Render the game
        this.gameManager.render();

        requestAnimationFrame(() => this.loop());
    }

    stop() {
        this.running = false;
    }
} 