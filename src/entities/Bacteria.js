import { Entity } from './Entity.js';
import { BACTERIA_TYPES } from '../constants/gameConstants.js';

export class Bacteria extends Entity {
    constructor(x, y, type = BACTERIA_TYPES.COCCI) {
        super(x, y, type.baseSize, type.color);
        this.type = type;
        this.speed = type.baseSpeed;
        this.growthRate = type.growthRate;
        this.visibility = type.visibility;
        this.energy = 100;
        this.enzymes = new Set();
        this.colony = null;
        this.velocity = { x: 0, y: 0 };
        this.isTagged = false;
        this.tagDuration = 0;
    }

    // Update bacteria state
    update(deltaTime) {
        // Update position based on velocity
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;

        // Update energy
        this.energy = Math.max(0, this.energy - 0.1 * deltaTime);
        if (this.energy <= 0) {
            this.deactivate();
        }

        // Update tag status
        if (this.isTagged && this.tagDuration > 0) {
            this.tagDuration -= deltaTime;
            if (this.tagDuration <= 0) {
                this.isTagged = false;
            }
        }
    }

    // Render bacteria based on its type
    render(ctx) {
        if (!ctx) {
            console.error('No context provided to Bacteria.render');
            return;
        }
        
        try {
            ctx.save();
            
            // Use a brighter color for better visibility
            const baseColor = this.isTagged ? '#FF6B6B' : this.color;
            ctx.fillStyle = baseColor;
            ctx.strokeStyle = '#FFFFFF'; // White outline
            ctx.lineWidth = 2;
            
            // Draw a simple circle for all bacteria types for now
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Draw direction indicator
            if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x + this.velocity.x * this.size * 1.5,
                    this.y + this.velocity.y * this.size * 1.5
                );
                ctx.strokeStyle = '#FFFF00'; // Yellow direction line
                ctx.stroke();
            }
            
            ctx.restore();
        } catch (error) {
            console.error('Error in Bacteria.render:', error);
        }
    }

    // Consume nutrient
    consumeNutrient(nutrient) {
        if (nutrient.requiresEnzyme && !this.enzymes.has(nutrient.type)) {
            return false;
        }

        this.energy += nutrient.energyValue;
        this.grow(nutrient.growthValue);
        return true;
    }

    // Grow bacteria
    grow(amount) {
        this.size += amount * this.growthRate;
        
        // Share growth with colony if part of one
        if (this.colony) {
            this.colony.distributeGrowth(amount * this.growthRate * 0.3);
        }
    }

    // Add enzyme
    addEnzyme(enzymeType) {
        this.enzymes.add(enzymeType);
    }

    // Set movement direction
    setDirection(dx, dy) {
        const magnitude = Math.sqrt(dx * dx + dy * dy);
        if (magnitude > 0) {
            this.velocity.x = dx / magnitude;
            this.velocity.y = dy / magnitude;
        }
    }

    // Tag bacteria (by antibody)
    tagBacteria(duration) {
        this.isTagged = true;
        this.tagDuration = duration;
        this.visibility *= 1.5;
    }

    // Join colony
    joinColony(colony) {
        this.colony = colony;
    }

    // Leave colony
    leaveColony() {
        this.colony = null;
    }
} 