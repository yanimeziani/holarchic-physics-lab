'use client';

import { useSimulationStore } from '@/lib/store';

export function InfoOverlay() {
    const {
        particles,
        memoryNodes,
        totalEnergy,
        holarchyDepth,
        isRunning,
    } = useSimulationStore();

    // Count particles by level
    const levelCounts = particles.reduce((acc, p) => {
        acc[p.holarchyLevel] = (acc[p.holarchyLevel] || 0) + 1;
        return acc;
    }, {} as Record<number, number>);

    return (
        <>
            {/* Top-right info panel */}
            <div className="overlay-ui top-4 right-4">
                <div className="glass-dark rounded-2xl p-4 min-w-48">
                    <div className="flex items-center gap-2 mb-3">
                        <span className={`status-dot ${isRunning ? 'status-active' : 'status-inactive'}`} />
                        <span className="text-sm font-medium">
                            {isRunning ? 'Simulating' : 'Paused'}
                        </span>
                    </div>

                    <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Total Energy</span>
                            <span className="font-mono">{totalEnergy.toFixed(2)} J</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Particles</span>
                            <span className="font-mono">{particles.length}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                            <span className="text-gray-400">Memory Nodes</span>
                            <span className="font-mono">{memoryNodes.length}</span>
                        </div>
                    </div>

                    {/* Level distribution bar */}
                    {particles.length > 0 && (
                        <div className="mt-3">
                            <div className="text-xs text-gray-400 mb-1">Level Distribution</div>
                            <div className="flex h-2 rounded-full overflow-hidden bg-black/30">
                                {[0, 1, 2, 3, 4].slice(0, holarchyDepth).map((level) => {
                                    const count = levelCounts[level] || 0;
                                    const percentage = (count / particles.length) * 100;
                                    const colors = ['#6366f1', '#22d3ee', '#10b981', '#fbbf24', '#f472b6'];
                                    return (
                                        <div
                                            key={level}
                                            style={{
                                                width: `${percentage}%`,
                                                backgroundColor: colors[level],
                                            }}
                                            title={`Level ${level}: ${count} particles`}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom-center title */}
            <div className="overlay-ui bottom-4 left-1/2 transform -translate-x-1/2">
                <div className="glass-dark rounded-full px-6 py-2 flex items-center gap-4">
                    <span className="text-xs text-gray-400">
                        Drag to rotate • Scroll to zoom • Right-click to pan
                    </span>
                </div>
            </div>

            {/* Physics formulas display */}
            <div className="overlay-ui bottom-4 right-4">
                <div className="glass-dark rounded-2xl p-3 max-w-xs">
                    <div className="text-xs text-gray-400 mb-2 uppercase tracking-wide">Hamiltonian</div>
                    <div className="font-mono text-xs text-cyan-300">
                        H(q,p) = T(p) + V(q)
                    </div>
                    <div className="font-mono text-xs text-gray-500 mt-1">
                        T = Σ p²/2m
                    </div>
                    <div className="font-mono text-xs text-gray-500">
                        V = ½kr² − Gm₁m₂/r + kq₁q₂/r
                    </div>
                </div>
            </div>
        </>
    );
}
