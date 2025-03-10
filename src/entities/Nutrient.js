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
        if (!ctx) {
            console.error('No context provided to Nutrient.render');
            return;
        }
        
        try {
            ctx.save();
            
            // Use a brighter color for better visibility
            ctx.fillStyle = this.color;
            ctx.strokeStyle = '#FFFFFF'; // White outline
            ctx.lineWidth = 1;
            
            // Draw base shape with larger size
            const displaySize = this.size * 3; // Make nutrients 3x larger for visibility
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, displaySize, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // Add a type indicator
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '10px Arial';
            
            let label = 'C'; // Default for carbohydrate
            if (this.type.type === 'PROTEIN') label = 'P';
            if (this.type.type === 'LIPID') label = 'L';
            
            // Center the text
            const textWidth = ctx.measureText(label).width;
            ctx.fillText(label, this.x - textWidth/2, this.y + 3);
            
            ctx.restore();
        } catch (error) {
            console.error('Error in Nutrient.render:', error);
        }
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