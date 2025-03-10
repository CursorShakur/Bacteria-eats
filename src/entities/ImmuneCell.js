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
        ctx.save();
        ctx.fillStyle = this.color;

        // Base shape
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Type-specific details
        switch(this.type.type) {
            case 'NEUTROPHIL':
                // Draw granules
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                for(let i = 0; i < 5; i++) {
                    const angle = (i * 2 * Math.PI) / 5;
                    const x = this.x + Math.cos(angle) * this.size * 0.5;
                    const y = this.y + Math.sin(angle) * this.size * 0.5;
                    ctx.beginPath();
                    ctx.arc(x, y, this.size * 0.2, 0, Math.PI * 2);
                    ctx.fill();
                }
                break;

            case 'MACROPHAGE':
                // Draw pseudopods
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                for(let i = 0; i < 8; i++) {
                    const angle = (i * 2 * Math.PI) / 8;
                    const length = this.size * (0.8 + Math.sin(Date.now() / 500 + i) * 0.2);
                    ctx.beginPath();
                    ctx.moveTo(this.x, this.y);
                    ctx.lineTo(
                        this.x + Math.cos(angle) * length,
                        this.y + Math.sin(angle) * length
                    );
                    ctx.stroke();
                }
                break;

            case 'ANTIBODY':
                // Draw Y-shaped antibody
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2;
                // Stem
                ctx.beginPath();
                ctx.moveTo(this.x, this.y + this.size);
                ctx.lineTo(this.x, this.y - this.size * 0.2);
                // Arms
                ctx.moveTo(this.x - this.size * 0.6, this.y - this.size * 0.6);
                ctx.lineTo(this.x, this.y - this.size * 0.2);
                ctx.lineTo(this.x + this.size * 0.6, this.y - this.size * 0.6);
                ctx.stroke();
                break;
        }

        // Draw targeting lines
        if (this.targets.size > 0) {
            ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
            ctx.beginPath();
            this.targets.forEach(target => {
                ctx.moveTo(this.x, this.y);
                ctx.lineTo(target.x, target.y);
            });
            ctx.stroke();
        }

        ctx.restore();
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