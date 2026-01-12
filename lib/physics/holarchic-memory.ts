import { Particle, HolarchicMemoryNode } from '../store';

/**
 * Holarchic Memory System
 * 
 * Implements a multi-level hierarchical memory structure inspired by:
 * - Arthur Koestler's concept of holons (parts that are also wholes)
 * - Holographic associative memory
 * - Hierarchical Temporal Memory principles
 * 
 * Each memory node represents a holon that can:
 * 1. Remember patterns from constituent parts (bottom-up)
 * 2. Constrain behavior of parts (top-down)
 * 3. Synchronize with sibling nodes at the same level
 */

interface MemoryConfig {
    decayRate: number;
    synchronizationStrength: number;
    activationThreshold: number;
}

interface PatternVector {
    position: [number, number, number];
    momentum: [number, number, number];
    energy: number;
}

// Generate unique ID for memory nodes
const generateNodeId = () => `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

/**
 * Create a memory node from a set of particles
 * The node stores a compressed representation of the particle ensemble
 */
export const createMemoryNodeFromParticles = (
    particles: Particle[],
    level: number,
    parentId: string | null = null
): HolarchicMemoryNode => {
    // Calculate centroid position
    const totalMass = particles.reduce((sum, p) => sum + p.mass, 0);
    const centroid: [number, number, number] = [
        particles.reduce((sum, p) => sum + p.position[0] * p.mass, 0) / totalMass,
        particles.reduce((sum, p) => sum + p.position[1] * p.mass, 0) / totalMass,
        particles.reduce((sum, p) => sum + p.position[2] * p.mass, 0) / totalMass,
    ];

    // Calculate total energy as activation
    const totalEnergy = particles.reduce((sum, p) => sum + p.energy, 0);

    return {
        id: generateNodeId(),
        level,
        position: centroid,
        children: particles.map(p => p.id),
        parent: parentId,
        activationEnergy: totalEnergy,
        memoryStrength: 1.0,
    };
};

/**
 * Build a hierarchical memory tree from particles
 * Groups particles by holarchy level and creates nodes
 */
export const buildHolarchicTree = (
    particles: Particle[],
    maxDepth: number
): HolarchicMemoryNode[] => {
    const nodes: HolarchicMemoryNode[] = [];

    // Group particles by holarchy level
    const levelGroups: Map<number, Particle[]> = new Map();
    for (const p of particles) {
        const level = p.holarchyLevel;
        if (!levelGroups.has(level)) {
            levelGroups.set(level, []);
        }
        levelGroups.get(level)!.push(p);
    }

    // Create memory nodes for each level
    for (const [level, group] of levelGroups) {
        if (group.length > 0) {
            const node = createMemoryNodeFromParticles(group, level);
            nodes.push(node);
        }
    }

    // Create hierarchical connections
    // Sort by level to establish parent-child relationships
    nodes.sort((a, b) => a.level - b.level);

    for (let i = 1; i < nodes.length; i++) {
        const currentNode = nodes[i];
        // Find the nearest lower-level node as parent
        for (let j = i - 1; j >= 0; j--) {
            if (nodes[j].level < currentNode.level) {
                currentNode.parent = nodes[j].id;
                nodes[j].children.push(currentNode.id);
                break;
            }
        }
    }

    return nodes;
};

/**
 * Update memory nodes based on particle state
 * Implements memory decay and pattern reinforcement
 */
export const updateMemoryNodes = (
    nodes: HolarchicMemoryNode[],
    particles: Particle[],
    config: MemoryConfig,
    deltaTime: number
): HolarchicMemoryNode[] => {
    return nodes.map(node => {
        // Apply memory decay
        let newStrength = node.memoryStrength * (1 - config.decayRate * deltaTime);

        // Find matching particles and reinforce if active
        const matchingParticles = particles.filter(p =>
            node.children.includes(p.id) || p.holarchyLevel === node.level
        );

        if (matchingParticles.length > 0) {
            // Calculate pattern similarity
            const totalMass = matchingParticles.reduce((sum, p) => sum + p.mass, 0);
            const currentCentroid: [number, number, number] = [
                matchingParticles.reduce((sum, p) => sum + p.position[0] * p.mass, 0) / totalMass,
                matchingParticles.reduce((sum, p) => sum + p.position[1] * p.mass, 0) / totalMass,
                matchingParticles.reduce((sum, p) => sum + p.position[2] * p.mass, 0) / totalMass,
            ];

            // Calculate distance to stored pattern
            const dx = currentCentroid[0] - node.position[0];
            const dy = currentCentroid[1] - node.position[1];
            const dz = currentCentroid[2] - node.position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Reinforce if pattern matches (close distance)
            const similarity = Math.exp(-distance);
            newStrength = Math.min(1.0, newStrength + similarity * 0.1);

            // Update position towards current centroid (slow learning)
            const learningRate = 0.01;
            const newPosition: [number, number, number] = [
                node.position[0] + (currentCentroid[0] - node.position[0]) * learningRate,
                node.position[1] + (currentCentroid[1] - node.position[1]) * learningRate,
                node.position[2] + (currentCentroid[2] - node.position[2]) * learningRate,
            ];

            // Update activation energy
            const newActivation = matchingParticles.reduce((sum, p) => sum + p.energy, 0);

            return {
                ...node,
                position: newPosition,
                memoryStrength: newStrength,
                activationEnergy: newActivation,
            };
        }

        return {
            ...node,
            memoryStrength: newStrength,
        };
    }).filter(node => node.memoryStrength > 0.01); // Remove faded memories
};

/**
 * Calculate synchronization forces between memory nodes at the same level
 * Implements Kuramoto-like synchronization dynamics
 */
export const calculateSynchronizationForces = (
    nodes: HolarchicMemoryNode[],
    config: MemoryConfig
): Map<string, [number, number, number]> => {
    const forces = new Map<string, [number, number, number]>();

    // Group nodes by level
    const levelGroups: Map<number, HolarchicMemoryNode[]> = new Map();
    for (const node of nodes) {
        if (!levelGroups.has(node.level)) {
            levelGroups.set(node.level, []);
        }
        levelGroups.get(node.level)!.push(node);
    }

    // Calculate synchronization forces within each level
    for (const [_level, group] of levelGroups) {
        if (group.length < 2) continue;

        for (const node of group) {
            let force: [number, number, number] = [0, 0, 0];

            for (const other of group) {
                if (other.id === node.id) continue;

                // Direction from node to other
                const dx = other.position[0] - node.position[0];
                const dy = other.position[1] - node.position[1];
                const dz = other.position[2] - node.position[2];
                const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

                if (distance < 0.01) continue;

                // Synchronization coupling strength depends on memory strengths
                const coupling = config.synchronizationStrength *
                    node.memoryStrength * other.memoryStrength;

                // Phase alignment force (towards other's position)
                const strength = coupling / distance;
                force[0] += (dx / distance) * strength;
                force[1] += (dy / distance) * strength;
                force[2] += (dz / distance) * strength;
            }

            forces.set(node.id, force);
        }
    }

    return forces;
};

/**
 * Pattern recognition: find the memory node most similar to current particle state
 */
export const recognizePattern = (
    particles: Particle[],
    nodes: HolarchicMemoryNode[],
    level: number
): HolarchicMemoryNode | null => {
    const levelParticles = particles.filter(p => p.holarchyLevel === level);
    if (levelParticles.length === 0) return null;

    // Calculate current pattern centroid
    const totalMass = levelParticles.reduce((sum, p) => sum + p.mass, 0);
    const currentCentroid: [number, number, number] = [
        levelParticles.reduce((sum, p) => sum + p.position[0] * p.mass, 0) / totalMass,
        levelParticles.reduce((sum, p) => sum + p.position[1] * p.mass, 0) / totalMass,
        levelParticles.reduce((sum, p) => sum + p.position[2] * p.mass, 0) / totalMass,
    ];

    // Find closest memory node at this level
    let bestMatch: HolarchicMemoryNode | null = null;
    let bestSimilarity = -1;

    for (const node of nodes) {
        if (node.level !== level) continue;

        const dx = currentCentroid[0] - node.position[0];
        const dy = currentCentroid[1] - node.position[1];
        const dz = currentCentroid[2] - node.position[2];
        const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

        // Similarity weighted by memory strength
        const similarity = node.memoryStrength * Math.exp(-distance);

        if (similarity > bestSimilarity) {
            bestSimilarity = similarity;
            bestMatch = node;
        }
    }

    return bestSimilarity > 0.1 ? bestMatch : null;
};

/**
 * Top-down constraint: modify particle forces based on higher-level memory
 */
export const applyHolarchicConstraints = (
    particles: Particle[],
    nodes: HolarchicMemoryNode[],
    constraintStrength: number
): Map<string, [number, number, number]> => {
    const constraints = new Map<string, [number, number, number]>();

    for (const particle of particles) {
        let constraint: [number, number, number] = [0, 0, 0];

        // Find memory nodes at higher levels
        const higherNodes = nodes.filter(n => n.level > particle.holarchyLevel);

        for (const node of higherNodes) {
            // Calculate constraint force towards memory pattern
            const dx = node.position[0] - particle.position[0];
            const dy = node.position[1] - particle.position[1];
            const dz = node.position[2] - particle.position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            if (distance < 0.01) continue;

            // Constraint strength diminishes with level difference
            const levelDiff = node.level - particle.holarchyLevel;
            const strength = constraintStrength * node.memoryStrength / (1 + levelDiff);

            constraint[0] += (dx / distance) * strength;
            constraint[1] += (dy / distance) * strength;
            constraint[2] += (dz / distance) * strength;
        }

        constraints.set(particle.id, constraint);
    }

    return constraints;
};

/**
 * Calculate holarchic coherence metric
 * Measures how well aligned particles are with their level's memory
 */
export const calculateHolarchicCoherence = (
    particles: Particle[],
    nodes: HolarchicMemoryNode[]
): number => {
    if (particles.length === 0 || nodes.length === 0) return 0;

    let totalCoherence = 0;
    let count = 0;

    for (const node of nodes) {
        const levelParticles = particles.filter(p => p.holarchyLevel === node.level);
        if (levelParticles.length === 0) continue;

        for (const particle of levelParticles) {
            const dx = particle.position[0] - node.position[0];
            const dy = particle.position[1] - node.position[1];
            const dz = particle.position[2] - node.position[2];
            const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

            // Coherence is high when particles are close to memory pattern
            totalCoherence += Math.exp(-distance) * node.memoryStrength;
            count++;
        }
    }

    return count > 0 ? totalCoherence / count : 0;
};
