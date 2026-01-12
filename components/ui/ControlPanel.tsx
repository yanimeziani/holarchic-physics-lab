'use client';

import { useSimulationStore } from '@/lib/store';

const HOLARCHY_LEVEL_NAMES = [
    { name: 'Quantum', color: '#6366f1', description: 'Wave-particle duality' },
    { name: 'Atomic', color: '#22d3ee', description: 'Electron orbitals' },
    { name: 'Molecular', color: '#10b981', description: 'Chemical bonds' },
    { name: 'Cellular', color: '#fbbf24', description: 'Metabolic networks' },
    { name: 'Organism', color: '#f472b6', description: 'Integrated systems' },
];

export function ControlPanel() {
    const {
        isRunning,
        setIsRunning,
        timeScale,
        setTimeScale,
        springConstant,
        setSpringConstant,
        dampingFactor,
        setDampingFactor,
        gravitationalConstant,
        setGravitationalConstant,
        couplingStrength,
        setCouplingStrength,
        holarchyDepth,
        setHolarchyDepth,
        emergenceThreshold,
        setEmergenceThreshold,
        memoryDecayRate,
        setMemoryDecayRate,
        synchronizationStrength,
        setSynchronizationStrength,
        showEnergyField,
        setShowEnergyField,
        showMomentumVectors,
        setShowMomentumVectors,
        showHolarchicConnections,
        setShowHolarchicConnections,
        colorMode,
        setColorMode,
        handTrackingEnabled,
        setHandTrackingEnabled,
        gestureMode,
        setGestureMode,
        particles,
        totalEnergy,
        kineticEnergy,
        potentialEnergy,
        memoryNodes,
        spawnRandomParticles,
        resetSimulation,
    } = useSimulationStore();

    return (
        <div className="control-panel glass-dark top-4 left-4 w-80">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold gradient-text mb-1">Holarchic Physics</h1>
                <p className="text-xs text-gray-400">Hamiltonian Dynamics & Emergent Memory</p>
            </div>

            {/* Simulation Controls */}
            <div className="mb-6">
                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => setIsRunning(!isRunning)}
                        className={`btn-primary flex-1 ${!isRunning ? 'opacity-60' : ''}`}
                    >
                        {isRunning ? '⏸ Pause' : '▶ Play'}
                    </button>
                    <button
                        onClick={resetSimulation}
                        className="btn-secondary"
                    >
                        ↺ Reset
                    </button>
                </div>

                <div className="flex gap-2 mb-4">
                    <button
                        onClick={() => spawnRandomParticles(10)}
                        className="btn-secondary flex-1 text-sm"
                    >
                        + Add 10 Particles
                    </button>
                    <button
                        onClick={() => spawnRandomParticles(50)}
                        className="btn-secondary flex-1 text-sm"
                    >
                        + Add 50
                    </button>
                </div>
            </div>

            {/* Energy Display */}
            <div className="mb-6 p-3 rounded-lg bg-black/30">
                <h3 className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">System Energy</h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                        <div className="text-lg font-bold text-cyan-400">{kineticEnergy.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Kinetic</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-pink-400">{potentialEnergy.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Potential</div>
                    </div>
                    <div>
                        <div className="text-lg font-bold text-purple-400">{totalEnergy.toFixed(1)}</div>
                        <div className="text-xs text-gray-500">Total</div>
                    </div>
                </div>
                <div className="mt-3 text-xs text-gray-500">
                    Particles: {particles.length} | Memory Nodes: {memoryNodes.length}
                </div>
            </div>

            {/* Hamiltonian Parameters */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Hamiltonian Parameters</h3>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Time Scale</span>
                            <span className="text-cyan-400">{timeScale.toFixed(2)}x</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={timeScale}
                            onChange={(e) => setTimeScale(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Spring Constant (k)</span>
                            <span className="text-cyan-400">{springConstant.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="2"
                            step="0.05"
                            value={springConstant}
                            onChange={(e) => setSpringConstant(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Damping (γ)</span>
                            <span className="text-cyan-400">{dampingFactor.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.2"
                            step="0.005"
                            value={dampingFactor}
                            onChange={(e) => setDampingFactor(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Gravity (G)</span>
                            <span className="text-cyan-400">{gravitationalConstant.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={gravitationalConstant}
                            onChange={(e) => setGravitationalConstant(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Coupling Strength</span>
                            <span className="text-cyan-400">{couplingStrength.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={couplingStrength}
                            onChange={(e) => setCouplingStrength(parseFloat(e.target.value))}
                        />
                    </div>
                </div>
            </div>

            {/* Holarchic Parameters */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Holarchic Memory</h3>

                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Holarchy Depth</span>
                            <span className="text-amber-400">{holarchyDepth}</span>
                        </div>
                        <input
                            type="range"
                            min="1"
                            max="5"
                            step="1"
                            value={holarchyDepth}
                            onChange={(e) => setHolarchyDepth(parseInt(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Emergence Threshold</span>
                            <span className="text-amber-400">{emergenceThreshold.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0.1"
                            max="2"
                            step="0.05"
                            value={emergenceThreshold}
                            onChange={(e) => setEmergenceThreshold(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Memory Decay</span>
                            <span className="text-amber-400">{memoryDecayRate.toFixed(3)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="0.1"
                            step="0.002"
                            value={memoryDecayRate}
                            onChange={(e) => setMemoryDecayRate(parseFloat(e.target.value))}
                        />
                    </div>

                    <div>
                        <div className="flex justify-between text-xs mb-1">
                            <span>Synchronization</span>
                            <span className="text-amber-400">{synchronizationStrength.toFixed(2)}</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={synchronizationStrength}
                            onChange={(e) => setSynchronizationStrength(parseFloat(e.target.value))}
                        />
                    </div>
                </div>

                {/* Holarchy Level Legend */}
                <div className="mt-4 space-y-1">
                    {HOLARCHY_LEVEL_NAMES.slice(0, holarchyDepth).map((level, index) => (
                        <div key={index} className="holarchy-level">
                            <div
                                className="holarchy-level-indicator"
                                style={{ backgroundColor: level.color }}
                            />
                            <div className="flex-1">
                                <span className="text-xs font-medium">{level.name}</span>
                                <span className="text-xs text-gray-500 ml-2">{level.description}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Visualization */}
            <div className="mb-6">
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Visualization</h3>

                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showEnergyField}
                            onChange={(e) => setShowEnergyField(e.target.checked)}
                            className="w-4 h-4 rounded accent-purple-500"
                        />
                        <span className="text-sm">Energy Field</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showMomentumVectors}
                            onChange={(e) => setShowMomentumVectors(e.target.checked)}
                            className="w-4 h-4 rounded accent-purple-500"
                        />
                        <span className="text-sm">Momentum Vectors</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={showHolarchicConnections}
                            onChange={(e) => setShowHolarchicConnections(e.target.checked)}
                            className="w-4 h-4 rounded accent-purple-500"
                        />
                        <span className="text-sm">Holarchic Connections</span>
                    </label>
                </div>

                <div className="mt-3">
                    <div className="text-xs text-gray-400 mb-2">Color Mode</div>
                    <div className="grid grid-cols-2 gap-1">
                        {(['holarchy', 'energy', 'momentum', 'charge'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setColorMode(mode)}
                                className={`text-xs py-1.5 px-2 rounded ${colorMode === mode
                                        ? 'bg-purple-500/30 border border-purple-500'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                            >
                                {mode.charAt(0).toUpperCase() + mode.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Interaction */}
            <div>
                <h3 className="text-xs font-semibold text-gray-400 mb-3 uppercase tracking-wide">Interaction</h3>

                <label className="flex items-center gap-2 cursor-pointer mb-3">
                    <input
                        type="checkbox"
                        checked={handTrackingEnabled}
                        onChange={(e) => setHandTrackingEnabled(e.target.checked)}
                        className="w-4 h-4 rounded accent-cyan-500"
                    />
                    <span className="text-sm">Enable Mouse Tracking</span>
                    <span className={`status-dot ${handTrackingEnabled ? 'status-active' : 'status-inactive'}`} />
                </label>

                {handTrackingEnabled && (
                    <div className="grid grid-cols-2 gap-1">
                        {(['attract', 'repel', 'spawn', 'destroy'] as const).map((mode) => (
                            <button
                                key={mode}
                                onClick={() => setGestureMode(mode)}
                                className={`text-xs py-1.5 px-2 rounded ${gestureMode === mode
                                        ? mode === 'attract' ? 'bg-cyan-500/30 border border-cyan-500' :
                                            mode === 'repel' ? 'bg-red-500/30 border border-red-500' :
                                                mode === 'spawn' ? 'bg-green-500/30 border border-green-500' :
                                                    'bg-pink-500/30 border border-pink-500'
                                        : 'bg-white/5 border border-transparent hover:bg-white/10'
                                    }`}
                            >
                                {mode === 'attract' ? '🧲 Attract' :
                                    mode === 'repel' ? '💫 Repel' :
                                        mode === 'spawn' ? '✨ Spawn' : '💥 Destroy'}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
