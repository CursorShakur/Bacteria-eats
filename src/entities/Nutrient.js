import { Entity } from './Entity.js';
import { NUTRIENT_TYPES } from '../constants/gameConstants.js';

export class Nutrient extends Entity {
    constructor(x, y, type = NUTRIENT_TYPES.CARBOHYDRATE) {
        super(x, y, type.size, type.color);
        this.type = type;
        this.energyValue = type.energyValue;
        this.growthValue = type.growthValue;
        this.requiresEnzyme = type.requiresEnzyme || false;
    }

    // Render nutrient
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        
        // Draw base shape
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();

        // Draw type indicator
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 1;
        
        switch(this.type.type) {
            case 'CARBOHYDRATE':
                // Simple circle for carbs
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size * 0.5, 0, Math.PI * 2);
                ctx.stroke();
                break;
                
            case 'PROTEIN':
                // Star shape for proteins
                ctx.beginPath();
                for(let i = 0; i < 5; i++) {
                    const angle = (i * 4 * Math.PI) / 5;
                    const x = this.x + Math.cos(angle) * this.size * 0.5;
                    const y = this.y + Math.sin(angle) * this.size * 0.5;
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                break;
                
            case 'LIPID':
                // Hexagon for lipids
                ctx.beginPath();
                for(let i = 0; i < 6; i++) {
                    const angle = (i * 2 * Math.PI) / 6;
                    const x = this.x + Math.cos(angle) * this.size * 0.7;
                    const y = this.y + Math.sin(angle) * this.size * 0.7;
                    if(i === 0) ctx.moveTo(x, y);
                    else ctx.lineTo(x, y);
                }
                ctx.closePath();
                ctx.stroke();
                
                // Add enzyme indicator
                if(this.requiresEnzyme) {
                    ctx.strokeStyle = 'rgba(255, 0, 0, 0.5)';
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, this.size * 0.3, 0, Math.PI * 2);
                    ctx.stroke();
                }
                break;
        }
        
        ctx.restore();
    }

    // Static method to spawn a random nutrient
    static spawnRandom(canvasWidth, canvasHeight) {
        const types = Object.values(NUTRIENT_TYPES);
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        // Check spawn rate
        if (Math.random() > randomType.spawnRate) {
            return null;
        }

        const x = Math.random() * (canvasWidth - 40) + 20;
        const y = Math.random() * (canvasHeight - 40) + 20;
        
        return new Nutrient(x, y, randomType);
    }
} 