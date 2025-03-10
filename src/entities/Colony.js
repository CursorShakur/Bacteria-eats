import { COLONY } from '../constants/gameConstants.js';

export class Colony {
    constructor() {
        this.members = new Set();
        this.sharedResources = 0;
    }

    // Add a bacteria to the colony
    addMember(bacteria) {
        if (this.members.size < COLONY.MAX_SIZE) {
            this.members.add(bacteria);
            bacteria.joinColony(this);
            return true;
        }
        return false;
    }

    // Remove a bacteria from the colony
    removeMember(bacteria) {
        this.members.delete(bacteria);
        bacteria.leaveColony();

        // Dissolve colony if too few members
        if (this.members.size < COLONY.FORMATION_THRESHOLD) {
            this.dissolve();
        }
    }

    // Dissolve the entire colony
    dissolve() {
        this.members.forEach(bacteria => {
            bacteria.leaveColony();
        });
        this.members.clear();
    }

    // Check if a bacteria can join this colony
    canAcceptMember(bacteria) {
        if (this.members.size >= COLONY.MAX_SIZE) {
            return false;
        }

        // Check if bacteria is within range of any colony member
        for (const member of this.members) {
            const dx = bacteria.x - member.x;
            const dy = bacteria.y - member.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= COLONY.COMMUNICATION_RANGE) {
                return true;
            }
        }
        return false;
    }

    // Distribute growth among colony members
    distributeGrowth(amount) {
        const sharePerMember = amount / this.members.size;
        this.members.forEach(bacteria => {
            bacteria.grow(sharePerMember);
        });
    }

    // Share resources among colony members
    shareResources(amount) {
        this.sharedResources += amount * COLONY.RESOURCE_SHARING;
        
        if (this.sharedResources >= 1) {
            const sharePerMember = Math.floor(this.sharedResources) / this.members.size;
            this.members.forEach(bacteria => {
                bacteria.energy += sharePerMember;
            });
            this.sharedResources %= 1;
        }
    }

    // Calculate colony protection bonus
    getProtectionBonus() {
        return Math.min(COLONY.PROTECTION_BONUS * this.members.size, 0.7);
    }

    // Update colony state
    update() {
        // Remove inactive members
        for (const bacteria of this.members) {
            if (!bacteria.isAlive()) {
                this.removeMember(bacteria);
            }
        }

        // Check colony cohesion
        this.checkCohesion();
    }

    // Check if colony members are still within range
    checkCohesion() {
        const memberArray = Array.from(this.members);
        
        for (let i = 0; i < memberArray.length; i++) {
            let hasNearbyMember = false;
            
            for (let j = 0; j < memberArray.length; j++) {
                if (i !== j) {
                    const dx = memberArray[i].x - memberArray[j].x;
                    const dy = memberArray[i].y - memberArray[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= COLONY.COMMUNICATION_RANGE) {
                        hasNearbyMember = true;
                        break;
                    }
                }
            }
            
            if (!hasNearbyMember) {
                this.removeMember(memberArray[i]);
            }
        }
    }
} 