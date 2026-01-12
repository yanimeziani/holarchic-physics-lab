'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useSimulationStore } from '@/lib/store';
import { ControlPanel } from '@/components/ui/ControlPanel';
import { InfoOverlay } from '@/components/ui/InfoOverlay';

// Dynamically import Three.js scene to avoid SSR issues
const SimulationScene = dynamic(
  () => import('@/components/three/SimulationScene').then((mod) => mod.SimulationScene),
  {
    ssr: false,
    loading: () => (
      <div className="fixed inset-0 flex items-center justify-center bg-[#050510]">
        <div className="text-center">
          <div className="loading-spinner mx-auto mb-4" />
          <div className="text-sm text-gray-400">Loading Holarchic Physics Engine...</div>
        </div>
      </div>
    ),
  }
);

export default function Home() {
  const { spawnRandomParticles, particles } = useSimulationStore();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Spawn initial particles on first load
    if (particles.length === 0) {
      spawnRandomParticles(30);
    }
    setIsLoaded(true);
  }, []);

  return (
    <main className="fixed inset-0 overflow-hidden">
      {/* 3D Simulation Canvas */}
      <SimulationScene />

      {/* UI Overlays */}
      {isLoaded && (
        <>
          <ControlPanel />
          <InfoOverlay />
        </>
      )}

      {/* Initial loading overlay */}
      {!isLoaded && (
        <div className="fixed inset-0 flex items-center justify-center bg-[#050510] z-50">
          <div className="text-center">
            <h1 className="text-4xl font-bold gradient-text mb-4">Holarchic Physics</h1>
            <p className="text-gray-400 mb-6">Hamiltonian Dynamics • Emergent Memory • Multi-Scale Simulation</p>
            <div className="loading-spinner mx-auto" />
          </div>
        </div>
      )}
    </main>
  );
}
