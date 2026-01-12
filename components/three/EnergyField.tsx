'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface EnergyFieldProps {
    visible: boolean;
    totalEnergy: number;
    kineticEnergy: number;
    potentialEnergy: number;
}

export function EnergyField({ visible, totalEnergy, kineticEnergy, potentialEnergy }: EnergyFieldProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const innerMeshRef = useRef<THREE.Mesh>(null);

    // Shader for energy field visualization
    const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
        uniforms: {
            time: { value: 0 },
            totalEnergy: { value: totalEnergy },
            kineticEnergy: { value: kineticEnergy },
            potentialEnergy: { value: potentialEnergy },
            color1: { value: new THREE.Color('#6366f1') },
            color2: { value: new THREE.Color('#22d3ee') },
            color3: { value: new THREE.Color('#f472b6') },
        },
        vertexShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float time;
      uniform float totalEnergy;
      
      void main() {
        vPosition = position;
        vNormal = normalize(normalMatrix * normal);
        
        // Subtle displacement based on energy
        vec3 displaced = position;
        float wave = sin(position.x * 2.0 + time) * 
                     cos(position.y * 2.0 + time * 0.7) * 
                     sin(position.z * 2.0 + time * 0.5);
        displaced += normal * wave * 0.1 * min(totalEnergy * 0.01, 1.0);
        
        gl_Position = projectionMatrix * modelViewMatrix * vec4(displaced, 1.0);
      }
    `,
        fragmentShader: `
      varying vec3 vPosition;
      varying vec3 vNormal;
      uniform float time;
      uniform float totalEnergy;
      uniform float kineticEnergy;
      uniform float potentialEnergy;
      uniform vec3 color1;
      uniform vec3 color2;
      uniform vec3 color3;
      
      void main() {
        // Create energy field pattern
        float pattern = sin(vPosition.x * 3.0 + time) * 
                       sin(vPosition.y * 3.0 + time * 0.8) * 
                       sin(vPosition.z * 3.0 + time * 0.6);
        
        // Mix colors based on energy distribution
        float kinRatio = kineticEnergy / max(totalEnergy, 0.01);
        float potRatio = potentialEnergy / max(totalEnergy, 0.01);
        
        vec3 color = mix(color1, color2, kinRatio);
        color = mix(color, color3, potRatio * 0.5);
        
        // Add pulsing glow
        float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
        float alpha = (0.05 + pattern * 0.03 + fresnel * 0.1) * min(totalEnergy * 0.02, 0.3);
        
        gl_FragColor = vec4(color, alpha);
      }
    `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
    }), []);

    useFrame((state) => {
        if (!meshRef.current || !visible) return;

        const time = state.clock.getElapsedTime();

        shaderMaterial.uniforms.time.value = time;
        shaderMaterial.uniforms.totalEnergy.value = totalEnergy;
        shaderMaterial.uniforms.kineticEnergy.value = kineticEnergy;
        shaderMaterial.uniforms.potentialEnergy.value = potentialEnergy;

        // Slow rotation
        meshRef.current.rotation.y = time * 0.05;
        meshRef.current.rotation.x = time * 0.03;

        if (innerMeshRef.current) {
            innerMeshRef.current.rotation.y = -time * 0.08;
            innerMeshRef.current.rotation.z = time * 0.04;
        }
    });

    if (!visible) return null;

    return (
        <group>
            <mesh ref={meshRef} material={shaderMaterial}>
                <icosahedronGeometry args={[8, 3]} />
            </mesh>
            <mesh ref={innerMeshRef} material={shaderMaterial}>
                <icosahedronGeometry args={[6, 2]} />
            </mesh>
        </group>
    );
}
