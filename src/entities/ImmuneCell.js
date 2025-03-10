import { Entity } from './Entity.js';
import { IMMUNE_CELL_TYPES } from '../constants/gameConstants.js';

export class ImmuneCell extends Entity {
    constructor(x, y, type = IMMUNE_CELL_TYPES.NEUTROPHIL) {
        super(x, y, type.size, type.color);
        this.type = type;
        this.speed = type.speed;
        this.lifespan = type.lifespan;
        this.damage = type.damage;
        this.visibility = type.visibility;
        this.targets = new Set();
        this.maxTargets = type.maxTargets || 1;
        this.velocity = { x: 0, y: 0 };
    }

    // Update immune cell state
    update(deltaTime, bacteria) {
        // Update lifespan
        this.lifespan -= deltaTime;
        if (this.lifespan <= 0) {
            this.deactivate();
            return;
        }

        // Update position based on velocity
        this.x += this.velocity.x * this.speed;
        this.y += this.velocity.y * this.speed;

        // Update behavior based on type
        switch(this.type.type) {
            case 'NEUTROPHIL':
                this.updateNeutrophil(bacteria);
                break;
            case 'MACROPHAGE':
                this.updateMacrophage(bacteria);
                break;
            case 'ANTIBODY':
                this.updateAntibody(bacteria);
                break;
        }
    }

    // Render immune cell
    render(ctx) {
        if (!ctx) {
            console.error('No context provided to ImmuneCell.render');
            return;
        }
        
        try {
            ctx.save();
            
            // Use a brighter color for better visibility
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#FF0000'; // Red outline for immune cells
            ctx.lineWidth = 2;
            
            // Draw base shape with larger size
            const displaySize = this.size * 2; // Make immune cells 2x larger for visibility
            
            // Draw different shapes based on cell type
            switch (this.type.type) {
                case 'NEUTROPHIL':
                    // Circle with cross
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw cross
                    ctx.beginPath();
                    ctx.moveTo(this.x - displaySize * 0.7, this.y);
                    ctx.lineTo(this.x + displaySize * 0.7, this.y);
                    ctx.moveTo(this.x, this.y - displaySize * 0.7);
                    ctx.lineTo(this.x, this.y + displaySize * 0.7);
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.stroke();
                    break;
                    
                case 'MACROPHAGE':
                    // Larger circle with dots
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw dots
                    ctx.fillStyle = '#FFFFFF';
                    for (let i = 0; i < 5; i++) {
                        const angle = (i * 2 * Math.PI) / 5;
                        const dotX = this.x + Math.cos(angle) * displaySize * 0.5;
                        const dotY = this.y + Math.sin(angle) * displaySize * 0.5;
                        ctx.beginPath();
                        ctx.arc(dotX, dotY, displaySize * 0.2, 0, Math.PI * 2);
                        ctx.fill();
                    }
                    break;
                    
                case 'ANTIBODY':
                    // Y-shaped
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
                    
                    // Draw Y shape
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y - displaySize * 0.5);
                    ctx.lineTo(this.x, this.y);
                    ctx.lineTo(this.x - displaySize * 0.5, this.y + displaySize * 0.5);
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(this.x + displaySize * 0.5, this.y + displaySize * 0.5);
                    ctx.strokeStyle = '#FFFFFF';
                    ctx.stroke();
                    break;
                    
                default:
                    // Default circle
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.stroke();
            }
            
            // Draw direction indicator if moving
            if (this.velocity.x !== 0 || this.velocity.y !== 0) {
                ctx.beginPath();
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(
                    this.x + this.velocity.x * displaySize * 1.5,
                    this.y + this.velocity.y * displaySize * 1.5
                );
                ctx.strokeStyle = '#FF0000'; // Red direction line
                ctx.stroke();
            }
            
            ctx.restore();
        } catch (error) {
            console.error('Error in ImmuneCell.render:', error);
        }
    }

    // Neutrophil behavior - fast and aggressive
    updateNeutrophil(bacteria) {
        if (this.targets.size === 0) {
            this.findClosestTarget(bacteria);
        }

        const target = Array.from(this.targets)[0];
        if (target && target.isAlive()) {
            this.moveTowardsTarget(target);
        } else {
            this.targets.clear();
        }
    }

    // Macrophage behavior - can target multiple bacteria
    updateMacrophage(bacteria) {
        // Remove dead targets
        this.targets.forEach(target => {
            if (!target.isAlive()) {
                this.targets.delete(target);
            }
        });

        // Find new targets if needed
        if (this.targets.size < this.maxTargets) {
            this.findClosestTarget(bacteria);
        }

        // Move towards the center of all targets
        if (this.targets.size > 0) {
            const centerX = Array.from(this.targets).reduce((sum, t) => sum + t.x, 0) / this.targets.size;
            const centerY = Array.from(this.targets).reduce((sum, t) => sum + t.y, 0) / this.targets.size;
            this.moveTowardsPoint(centerX, centerY);
        }
    }

    // Antibody behavior - tags bacteria for other immune cells
    updateAntibody(bacteria) {
        if (this.targets.size === 0) {
            this.findClosestTarget(bacteria);
        }

        const target = Array.from(this.targets)[0];
        if (target && target.isAlive()) {
            this.moveTowardsTarget(target);
            
            // Tag bacteria if close enough
            if (this.collidesWith(target)) {
                target.tagBacteria(this.type.tagDuration);
                this.deactivate(); // Antibody is consumed after tagging
            }
        } else {
            this.targets.clear();
        }
    }

    // Find closest valid target
    findClosestTarget(bacteria) {
        let closestDist = Infinity;
        let closestBacteria = null;

        bacteria.forEach(b => {
            if (b.isAlive() && !this.targets.has(b)) {
                const dx = b.x - this.x;
                const dy = b.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Adjust distance based on bacteria visibility and tagged status
                const adjustedDist = dist / (b.visibility * (b.isTagged ? 1.5 : 1));

                if (adjustedDist < closestDist) {
                    closestDist = adjustedDist;
                    closestBacteria = b;
                }
            }
        });

        if (closestBacteria) {
            this.targets.add(closestBacteria);
        }
    }

    // Move towards a target
    moveTowardsTarget(target) {
        this.moveTowardsPoint(target.x, target.y);
    }

    // Move towards a point
    moveTowardsPoint(x, y) {
        const dx = x - this.x;
        const dy = y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            this.velocity.x = dx / dist;
            this.velocity.y = dy / dist;
        }
    }

    // Attack target
    attack(bacteria) {
        // Apply colony protection if bacteria is in a colony
        const protectionBonus = bacteria.colony ? bacteria.colony.getProtectionBonus() : 0;
        const damageDealt = this.damage * (1 - protectionBonus);
        
        // Reduce bacteria size
        bacteria.size = Math.max(1, bacteria.size - damageDealt);
        
        // Deactivate bacteria if too small
        if (bacteria.size <= 1) {
            bacteria.deactivate();
        }
    }
} 