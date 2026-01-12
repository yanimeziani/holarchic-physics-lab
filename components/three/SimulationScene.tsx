'use client';

import { useRef, useEffect, useCallback, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Environment, PerspectiveCamera, Html } from '@react-three/drei';
import * as THREE from 'three';
import { useSimulationStore } from '@/lib/store';
import { integrateHamiltonian, checkHolarchicEmergence } from '@/lib/physics/hamiltonian';
import { buildHolarchicTree, updateMemoryNodes } from '@/lib/physics/holarchic-memory';
import { ParticleSystem } from './ParticleSystem';
import { HolarchicConnections } from './HolarchicConnections';
import { EnergyField } from './EnergyField';

function SimulationLoop() {
    const {
        isRunning,
        timeScale,
        particles,
        memoryNodes,
        springConstant,
        dampingFactor,
        gravitationalConstant,
        couplingStrength,
        holarchyDepth,
        emergenceThreshold,
        memoryDecayRate,
        synchronizationStrength,
        handPosition,
        gestureMode,
        updateParticles,
        updateMemoryNodes: setMemoryNodes,
        setEnergies,
    } = useSimulationStore();

    const lastUpdateTime = useRef(0);

    useFrame((state) => {
        if (!isRunning || particles.length === 0) return;

        const currentTime = state.clock.getElapsedTime();
        const deltaTime = Math.min(currentTime - lastUpdateTime.current, 0.05);
        lastUpdateTime.current = currentTime;

        if (deltaTime <= 0) return;

        // Integrate Hamiltonian dynamics
        const { particles: updatedParticles, energies } = integrateHamiltonian(
            particles,
            {
                springConstant,
                dampingFactor,
                gravitationalConstant,
                couplingStrength,
                timeScale,
            },
            deltaTime,
            handPosition,
            gestureMode
        );

        // Check for holarchic emergence
        const emergentParticles = checkHolarchicEmergence(
            updatedParticles,
            emergenceThreshold,
            holarchyDepth
        );

        // Update memory nodes
        const newMemoryNodes = updateMemoryNodes(
            memoryNodes.length > 0 ? memoryNodes : buildHolarchicTree(emergentParticles, holarchyDepth),
            emergentParticles,
            {
                decayRate: memoryDecayRate,
                synchronizationStrength,
                activationThreshold: 0.5,
            },
            deltaTime
        );

        // Update state
        updateParticles(emergentParticles);
        setMemoryNodes(newMemoryNodes);
        setEnergies(energies.total, energies.kinetic, energies.potential);
    });

    return null;
}

function HandTracker() {
    const { handTrackingEnabled, setHandPosition, gestureMode } = useSimulationStore();
    const { camera, size } = useThree();
    const handMeshRef = useRef<THREE.Mesh>(null);

    const handlePointerMove = useCallback((event: PointerEvent) => {
        if (!handTrackingEnabled) return;

        // Convert screen coordinates to normalized device coordinates
        const x = (event.clientX / size.width) * 2 - 1;
        const y = -(event.clientY / size.height) * 2 + 1;

        // Create a ray from the camera through the mouse position
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

        // Find point at z = 0 plane
        const planeZ = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
        const intersectPoint = new THREE.Vector3();
        raycaster.ray.intersectPlane(planeZ, intersectPoint);

        setHandPosition([intersectPoint.x, intersectPoint.y, intersectPoint.z]);

        if (handMeshRef.current) {
            handMeshRef.current.position.set(intersectPoint.x, intersectPoint.y, intersectPoint.z);
        }
    }, [handTrackingEnabled, camera, size, setHandPosition]);

    useEffect(() => {
        if (handTrackingEnabled) {
            window.addEventListener('pointermove', handlePointerMove);
            return () => window.removeEventListener('pointermove', handlePointerMove);
        }
    }, [handTrackingEnabled, handlePointerMove]);

    if (!handTrackingEnabled) return null;

    const handColor = gestureMode === 'attract' ? '#22d3ee' :
        gestureMode === 'repel' ? '#ef4444' :
            gestureMode === 'spawn' ? '#10b981' : '#f472b6';

    return (
        <mesh ref={handMeshRef}>
            <sphereGeometry args={[0.3, 16, 16]} />
            <meshBasicMaterial color={handColor} transparent opacity={0.5} />
        </mesh>
    );
}

function SceneContent() {
    const {
        particles,
        memoryNodes,
        showEnergyField,
        showMomentumVectors,
        showHolarchicConnections,
        colorMode,
        totalEnergy,
        kineticEnergy,
        potentialEnergy,
    } = useSimulationStore();

    return (
        <>
            <SimulationLoop />
            <HandTracker />

            {/* Lighting */}
            <ambientLight intensity={0.4} />
            <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
            <pointLight position={[-10, -10, 5]} intensity={0.5} color="#6366f1" />
            <pointLight position={[0, 10, -10]} intensity={0.5} color="#22d3ee" />

            {/* Particle system */}
            <ParticleSystem
                particles={particles}
                showMomentumVectors={showMomentumVectors}
                colorMode={colorMode}
            />

            {/* Energy field visualization */}
            <EnergyField
                visible={showEnergyField}
                totalEnergy={totalEnergy}
                kineticEnergy={kineticEnergy}
                potentialEnergy={potentialEnergy}
            />

            {/* Holarchic connections */}
            <HolarchicConnections
                memoryNodes={memoryNodes}
                visible={showHolarchicConnections}
            />

            {/* Environment */}
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />

            {/* Controls */}
            <OrbitControls
                enableDamping
                dampingFactor={0.05}
                rotateSpeed={0.5}
                zoomSpeed={0.8}
                minDistance={3}
                maxDistance={50}
            />
        </>
    );
}

export function SimulationScene() {
    return (
        <div className="canvas-container">
            <Canvas
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
                dpr={[1, 2]}
            >
                <PerspectiveCamera makeDefault position={[0, 0, 15]} fov={60} />
                <color attach="background" args={['#050510']} />
                <fog attach="fog" args={['#050510', 20, 60]} />
                <SceneContent />
            </Canvas>
        </div>
    );
}
