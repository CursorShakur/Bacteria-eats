// Bacteria Types
export const BACTERIA_TYPES = {
    COCCI: {
        type: 'COCCI',
        name: 'Coccus',
        description: 'Round bacteria with balanced stats',
        baseSpeed: 2,
        baseSize: 10,
        growthRate: 1,
        visibility: 1,
        color: '#0070DD',
        shape: 'circle'
    },
    BACILLI: {
        type: 'BACILLI',
        name: 'Bacillus',
        description: 'Rod-shaped bacteria with high speed',
        baseSpeed: 3,
        baseSize: 12,
        growthRate: 0.8,
        visibility: 1.5,
        color: '#4169E1',
        shape: 'rectangle'
    },
    SPIRILLA: {
        type: 'SPIRILLA',
        name: 'Spirillum',
        description: 'Spiral bacteria with high evasion',
        baseSpeed: 2.5,
        baseSize: 8,
        growthRate: 0.9,
        visibility: 0.7,
        color: '#1E90FF',
        shape: 'spiral'
    }
};

// Nutrient Types
export const NUTRIENT_TYPES = {
    CARBOHYDRATE: {
        type: 'CARBOHYDRATE',
        name: 'Carbohydrate',
        color: '#8BC34A',
        energyValue: 10,
        growthValue: 0.5,
        spawnRate: 0.03,
        size: 3
    },
    PROTEIN: {
        type: 'PROTEIN',
        name: 'Protein',
        color: '#FFA500',
        energyValue: 15,
        growthValue: 1.2,
        spawnRate: 0.02,
        size: 4
    },
    LIPID: {
        type: 'LIPID',
        name: 'Lipid',
        color: '#FFD700',
        energyValue: 25,
        growthValue: 2,
        spawnRate: 0.01,
        size: 5,
        requiresEnzyme: true
    }
};

// Immune Cell Types
export const IMMUNE_CELL_TYPES = {
    NEUTROPHIL: {
        type: 'NEUTROPHIL',
        name: 'Neutrophil',
        color: '#FFFFFF',
        speed: 3,
        size: 15,
        lifespan: 300, // frames
        damage: 1,
        visibility: 1
    },
    MACROPHAGE: {
        type: 'MACROPHAGE',
        name: 'Macrophage',
        color: '#EEEEEE',
        speed: 1.5,
        size: 25,
        lifespan: 900, // frames
        damage: 2,
        maxTargets: 3,
        visibility: 1.2
    },
    ANTIBODY: {
        type: 'ANTIBODY',
        name: 'Antibody',
        color: '#F0F8FF',
        speed: 2,
        size: 8,
        lifespan: 600, // frames
        tagDuration: 300, // frames
        visibilityIncrease: 1.5
    }
};

// Colony Formation Constants
export const COLONY = {
    FORMATION_THRESHOLD: 3, // minimum bacteria needed to form a colony
    MAX_SIZE: 10, // maximum bacteria in a colony
    PROTECTION_BONUS: 0.3, // damage reduction when in colony
    RESOURCE_SHARING: 0.2, // percentage of nutrients shared between colony members
    COMMUNICATION_RANGE: 100 // pixel radius for colony formation
}; 