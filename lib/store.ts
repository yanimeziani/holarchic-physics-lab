import { create } from 'zustand';

export interface Particle {
    id: string;
    position: [number, number, number];
    momentum: [number, number, number];
    mass: number;
    charge: number;
    holarchyLevel: number; // 0 = quantum, 1 = atomic, 2 = molecular, 3 = cellular, 4 = organism
    energy: number;
    color: string;
}

export interface HolarchicMemoryNode {
    id: string;
    level: number;
    position: [number, number, number];
    children: string[];
    parent: string | null;
    activationEnergy: number;
    memoryStrength: number;
}

export interface SimulationState {
    // Simulation parameters
    isRunning: boolean;
    timeScale: number;
    deltaTime: number;
    totalEnergy: number;
    kineticEnergy: number;
    potentialEnergy: number;

    // Hamiltonian parameters
    springConstant: number;
    dampingFactor: number;
    gravitationalConstant: number;
    couplingStrength: number;

    // Holarchic parameters
    holarchyDepth: number;
    emergenceThreshold: number;
    memoryDecayRate: number;
    synchronizationStrength: number;

    // Particles and memory
    particles: Particle[];
    memoryNodes: HolarchicMemoryNode[];

    // Visualization
    showEnergyField: boolean;
    showMomentumVectors: boolean;
    showHolarchicConnections: boolean;
    showPhaseSpace: boolean;
    colorMode: 'energy' | 'momentum' | 'holarchy' | 'charge';

    // MediaPipe
    handTrackingEnabled: boolean;
    handPosition: [number, number, number] | null;
    gestureMode: 'attract' | 'repel' | 'spawn' | 'destroy';

    // Actions
    setIsRunning: (running: boolean) => void;
    setTimeScale: (scale: number) => void;
    setSpringConstant: (k: number) => void;
    setDampingFactor: (d: number) => void;
    setGravitationalConstant: (g: number) => void;
    setCouplingStrength: (c: number) => void;
    setHolarchyDepth: (depth: number) => void;
    setEmergenceThreshold: (threshold: number) => void;
    setMemoryDecayRate: (rate: number) => void;
    setSynchronizationStrength: (strength: number) => void;
    setShowEnergyField: (show: boolean) => void;
    setShowMomentumVectors: (show: boolean) => void;
    setShowHolarchicConnections: (show: boolean) => void;
    setShowPhaseSpace: (show: boolean) => void;
    setColorMode: (mode: 'energy' | 'momentum' | 'holarchy' | 'charge') => void;
    setHandTrackingEnabled: (enabled: boolean) => void;
    setHandPosition: (pos: [number, number, number] | null) => void;
    setGestureMode: (mode: 'attract' | 'repel' | 'spawn' | 'destroy') => void;

    addParticle: (particle: Particle) => void;
    removeParticle: (id: string) => void;
    updateParticles: (particles: Particle[]) => void;
    setEnergies: (total: number, kinetic: number, potential: number) => void;

    addMemoryNode: (node: HolarchicMemoryNode) => void;
    updateMemoryNodes: (nodes: HolarchicMemoryNode[]) => void;

    resetSimulation: () => void;
    spawnRandomParticles: (count: number) => void;
}

const HOLARCHY_COLORS = [
    '#6366f1', // Level 0 - Quantum (Indigo)
    '#22d3ee', // Level 1 - Atomic (Cyan)
    '#10b981', // Level 2 - Molecular (Emerald)
    '#fbbf24', // Level 3 - Cellular (Amber)
    '#f472b6', // Level 4 - Organism (Pink)
];

const generateParticleId = () => `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

const createRandomParticle = (level: number = 0): Particle => {
    const spread = 5;
    return {
        id: generateParticleId(),
        position: [
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
            (Math.random() - 0.5) * spread,
        ],
        momentum: [
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
        ],
        mass: 1 + Math.random() * 2,
        charge: Math.random() > 0.5 ? 1 : -1,
        holarchyLevel: level,
        energy: 0,
        color: HOLARCHY_COLORS[level % HOLARCHY_COLORS.length],
    };
};

export const useSimulationStore = create<SimulationState>((set, get) => ({
    // Initial state
    isRunning: true,
    timeScale: 1,
    deltaTime: 0.016,
    totalEnergy: 0,
    kineticEnergy: 0,
    potentialEnergy: 0,

    springConstant: 0.5,
    dampingFactor: 0.02,
    gravitationalConstant: 0.1,
    couplingStrength: 0.3,

    holarchyDepth: 3,
    emergenceThreshold: 0.7,
    memoryDecayRate: 0.01,
    synchronizationStrength: 0.5,

    particles: [],
    memoryNodes: [],

    showEnergyField: true,
    showMomentumVectors: false,
    showHolarchicConnections: true,
    showPhaseSpace: false,
    colorMode: 'holarchy',

    handTrackingEnabled: false,
    handPosition: null,
    gestureMode: 'attract',

    // Actions
    setIsRunning: (running) => set({ isRunning: running }),
    setTimeScale: (scale) => set({ timeScale: scale }),
    setSpringConstant: (k) => set({ springConstant: k }),
    setDampingFactor: (d) => set({ dampingFactor: d }),
    setGravitationalConstant: (g) => set({ gravitationalConstant: g }),
    setCouplingStrength: (c) => set({ couplingStrength: c }),
    setHolarchyDepth: (depth) => set({ holarchyDepth: depth }),
    setEmergenceThreshold: (threshold) => set({ emergenceThreshold: threshold }),
    setMemoryDecayRate: (rate) => set({ memoryDecayRate: rate }),
    setSynchronizationStrength: (strength) => set({ synchronizationStrength: strength }),
    setShowEnergyField: (show) => set({ showEnergyField: show }),
    setShowMomentumVectors: (show) => set({ showMomentumVectors: show }),
    setShowHolarchicConnections: (show) => set({ showHolarchicConnections: show }),
    setShowPhaseSpace: (show) => set({ showPhaseSpace: show }),
    setColorMode: (mode) => set({ colorMode: mode }),
    setHandTrackingEnabled: (enabled) => set({ handTrackingEnabled: enabled }),
    setHandPosition: (pos) => set({ handPosition: pos }),
    setGestureMode: (mode) => set({ gestureMode: mode }),

    addParticle: (particle) => set((state) => ({
        particles: [...state.particles, particle],
    })),

    removeParticle: (id) => set((state) => ({
        particles: state.particles.filter((p) => p.id !== id),
    })),

    updateParticles: (particles) => set({ particles }),

    setEnergies: (total, kinetic, potential) => set({
        totalEnergy: total,
        kineticEnergy: kinetic,
        potentialEnergy: potential,
    }),

    addMemoryNode: (node) => set((state) => ({
        memoryNodes: [...state.memoryNodes, node],
    })),

    updateMemoryNodes: (nodes) => set({ memoryNodes: nodes }),

    resetSimulation: () => set({
        particles: [],
        memoryNodes: [],
        totalEnergy: 0,
        kineticEnergy: 0,
        potentialEnergy: 0,
        isRunning: true,
    }),

    spawnRandomParticles: (count) => {
        const state = get();
        const newParticles: Particle[] = [];
        for (let i = 0; i < count; i++) {
            const level = Math.floor(Math.random() * Math.min(state.holarchyDepth, 5));
            newParticles.push(createRandomParticle(level));
        }
        set({ particles: [...state.particles, ...newParticles] });
    },
}));
