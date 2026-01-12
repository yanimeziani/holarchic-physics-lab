'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { HolarchicMemoryNode } from '@/lib/store';

interface HolarchicConnectionsProps {
    memoryNodes: HolarchicMemoryNode[];
    visible: boolean;
}

const LEVEL_COLORS = [
    new THREE.Color('#6366f1'),
    new THREE.Color('#22d3ee'),
    new THREE.Color('#10b981'),
    new THREE.Color('#fbbf24'),
    new THREE.Color('#f472b6'),
];

export function HolarchicConnections({ memoryNodes, visible }: HolarchicConnectionsProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Create node spheres
    const nodeMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
    }), []);

    // Create line material for connections
    const lineMaterial = useMemo(() => new THREE.LineBasicMaterial({
        color: '#ffffff',
        opacity: 0.3,
        transparent: true,
    }), []);

    const ringMaterial = useMemo(() => new THREE.MeshBasicMaterial({
        color: '#ffffff',
        transparent: true,
        opacity: 0.2,
        side: THREE.DoubleSide,
    }), []);

    // Animate nodes
    useFrame((state) => {
        if (!groupRef.current) return;

        const time = state.clock.getElapsedTime();

        groupRef.current.children.forEach((child, i) => {
            if (child.type === 'Mesh' && child.userData.isNode) {
                // Pulse based on activation energy
                const node = memoryNodes[child.userData.nodeIndex];
                if (node) {
                    const pulse = 1 + Math.sin(time * 2 + i) * 0.1 * node.activationEnergy * 0.01;
                    child.scale.setScalar(pulse * (0.2 + node.level * 0.1));
                }
            }
        });
    });

    if (!visible || memoryNodes.length === 0) {
        return null;
    }

    // Create connections between nodes
    const connections: [THREE.Vector3, THREE.Vector3][] = [];
    for (const node of memoryNodes) {
        if (node.parent) {
            const parentNode = memoryNodes.find(n => n.id === node.parent);
            if (parentNode) {
                connections.push([
                    new THREE.Vector3(...node.position),
                    new THREE.Vector3(...parentNode.position),
                ]);
            }
        }
    }

    return (
        <group ref={groupRef}>
            {/* Memory nodes */}
            {memoryNodes.map((node, index) => (
                <mesh
                    key={node.id}
                    position={node.position}
                    userData={{ isNode: true, nodeIndex: index }}
                >
                    <sphereGeometry args={[0.2 + node.level * 0.1, 16, 16]} />
                    <meshBasicMaterial
                        color={LEVEL_COLORS[node.level % LEVEL_COLORS.length]}
                        transparent
                        opacity={0.4 + node.memoryStrength * 0.4}
                        depthWrite={false}
                    />
                </mesh>
            ))}

            {/* Level rings */}
            {memoryNodes.map((node) => (
                <mesh
                    key={`ring-${node.id}`}
                    position={node.position}
                    rotation={[Math.PI / 2, 0, 0]}
                >
                    <ringGeometry args={[0.3 + node.level * 0.15, 0.35 + node.level * 0.15, 32]} />
                    <meshBasicMaterial
                        color={LEVEL_COLORS[node.level % LEVEL_COLORS.length]}
                        transparent
                        opacity={0.2 * node.memoryStrength}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            ))}

            {/* Hierarchical connections */}
            {connections.map((conn, index) => {
                const points = [conn[0], conn[1]];
                const geometry = new THREE.BufferGeometry().setFromPoints(points);
                return (
                    <line key={`conn-${index}`} geometry={geometry}>
                        <lineBasicMaterial color="#ffffff" transparent opacity={0.2} />
                    </line>
                );
            })}
        </group>
    );
}
