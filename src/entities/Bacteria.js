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
        ctx.save();
        ctx.fillStyle = this.isTagged ? '#FF6B6B' : this.color;

        switch (this.type.shape) {
            case 'rectangle':
                // Bacilli (rod shape)
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                ctx.fillRect(-this.size, -this.size/2, this.size * 2, this.size);
                break;

            case 'spiral':
                // Spirilla (spiral shape)
                ctx.beginPath();
                ctx.translate(this.x, this.y);
                ctx.rotate(Math.atan2(this.velocity.y, this.velocity.x));
                
                // Draw spiral shape
                for (let i = 0; i < Math.PI * 2; i += 0.1) {
                    const x = i * this.size/2 * Math.cos(i * 2);
                    const y = this.size/2 * Math.sin(i * 2);
                    if (i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.stroke();
                ctx.fill();
                break;

            default:
                // Cocci (circle shape)
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
        }

        // Draw colony connection if part of a colony
        if (this.colony) {
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            this.colony.members.forEach(member => {
                if (member !== this) {
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(member.x, member.y);
                }
            });
            ctx.stroke();
        }

        ctx.restore();
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