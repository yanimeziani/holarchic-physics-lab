'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Particle } from '@/lib/store';

interface ParticleSystemProps {
    particles: Particle[];
    showMomentumVectors: boolean;
    colorMode: 'energy' | 'momentum' | 'holarchy' | 'charge';
}

const HOLARCHY_COLORS = [
    new THREE.Color('#6366f1'), // Level 0 - Quantum (Indigo)
    new THREE.Color('#22d3ee'), // Level 1 - Atomic (Cyan)
    new THREE.Color('#10b981'), // Level 2 - Molecular (Emerald)
    new THREE.Color('#fbbf24'), // Level 3 - Cellular (Amber)
    new THREE.Color('#f472b6'), // Level 4 - Organism (Pink)
];

const ENERGY_GRADIENT = {
    low: new THREE.Color('#3b82f6'),
    mid: new THREE.Color('#10b981'),
    high: new THREE.Color('#ef4444'),
};

export function ParticleSystem({ particles, showMomentumVectors, colorMode }: ParticleSystemProps) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const lineRef = useRef<THREE.LineSegments>(null);

    // Create a simple sphere geometry for particles
    const sphereGeometry = useMemo(() => new THREE.SphereGeometry(0.1, 16, 16), []);
    const sphereMaterial = useMemo(() => new THREE.MeshStandardMaterial({
        metalness: 0.3,
        roughness: 0.4,
        emissive: new THREE.Color('#ffffff'),
        emissiveIntensity: 0.2,
    }), []);

    // Line material for momentum vectors
    const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
        color: '#ffffff',
        opacity: 0.6,
        transparent: true,
    }), []);

    // Dummy object for matrix calculations
    const dummy = useMemo(() => new THREE.Object3D(), []);
    const color = useMemo(() => new THREE.Color(), []);

    // Update particle positions and colors each frame
    useFrame(() => {
        if (!meshRef.current) return;

        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];

            // Set position
            dummy.position.set(
                particle.position[0],
                particle.position[1],
                particle.position[2]
            );

            // Scale based on mass
            const scale = 0.5 + particle.mass * 0.2;
            dummy.scale.setScalar(scale);

            dummy.updateMatrix();
            meshRef.current.setMatrixAt(i, dummy.matrix);

            // Set color based on mode
            switch (colorMode) {
                case 'holarchy':
                    color.copy(HOLARCHY_COLORS[particle.holarchyLevel % HOLARCHY_COLORS.length]);
                    break;
                case 'energy':
                    const normalizedEnergy = Math.min(particle.energy / 10, 1);
                    if (normalizedEnergy < 0.5) {
                        color.lerpColors(ENERGY_GRADIENT.low, ENERGY_GRADIENT.mid, normalizedEnergy * 2);
                    } else {
                        color.lerpColors(ENERGY_GRADIENT.mid, ENERGY_GRADIENT.high, (normalizedEnergy - 0.5) * 2);
                    }
                    break;
                case 'momentum':
                    const momMag = Math.sqrt(
                        particle.momentum[0] ** 2 +
                        particle.momentum[1] ** 2 +
                        particle.momentum[2] ** 2
                    );
                    const normalizedMom = Math.min(momMag / 5, 1);
                    color.setHSL(0.6 - normalizedMom * 0.4, 0.8, 0.5 + normalizedMom * 0.3);
                    break;
                case 'charge':
                    if (particle.charge > 0) {
                        color.set('#ef4444');
                    } else {
                        color.set('#3b82f6');
                    }
                    break;
            }

            meshRef.current.setColorAt(i, color);
        }

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) {
            meshRef.current.instanceColor.needsUpdate = true;
        }

        // Update momentum vectors
        if (lineRef.current && showMomentumVectors) {
            const positions = lineRef.current.geometry.attributes.position;
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];
                const baseIndex = i * 6; // 2 points per line, 3 coords each

                // Start point at particle position
                positions.setXYZ(
                    i * 2,
                    particle.position[0],
                    particle.position[1],
                    particle.position[2]
                );

                // End point in direction of momentum
                const momScale = 0.3;
                positions.setXYZ(
                    i * 2 + 1,
                    particle.position[0] + particle.momentum[0] * momScale,
                    particle.position[1] + particle.momentum[1] * momScale,
                    particle.position[2] + particle.momentum[2] * momScale
                );
            }
            positions.needsUpdate = true;
        }
    });

    // Create line geometry for momentum vectors
    const lineGeometry = useMemo(() => {
        const maxParticles = 500;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(maxParticles * 6);
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        return geometry;
    }, []);

    return (
        <>
            <instancedMesh
                ref={meshRef}
                args={[sphereGeometry, sphereMaterial, Math.max(particles.length, 1)]}
                count={particles.length}
                frustumCulled={false}
            />
            {showMomentumVectors && (
                <lineSegments ref={lineRef} geometry={lineGeometry} material={lineMaterial} />
            )}
        </>
    );
}
