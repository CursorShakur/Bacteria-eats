// Base class for all game entities
export class Entity {
    constructor(x, y, size, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.color = color;
        this.id = Math.random().toString(36).substr(2, 9);
        this.isActive = true;
    }

    // Basic collision detection
    collidesWith(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < (this.size + other.size);
    }

    // Update position based on boundaries
    keepInBounds(canvasWidth, canvasHeight) {
        this.x = Math.max(this.size, Math.min(canvasWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(canvasHeight - this.size, this.y));
    }

    // Basic update method to be overridden
    update(deltaTime) {
        // Override in derived classes
    }

    // Basic render method to be overridden
    render(ctx) {
        // Override in derived classes
    }

    // Check if entity is still active
    isAlive() {
        return this.isActive;
    }

    // Deactivate entity
    deactivate() {
        this.isActive = false;
    }
} 