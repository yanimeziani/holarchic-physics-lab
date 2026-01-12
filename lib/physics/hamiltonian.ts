import { Particle } from '../store';

/**
 * Hamiltonian Dynamics Engine
 * 
 * Implements symplectic integration for conservative systems.
 * H(q, p) = T(p) + V(q) where:
 * - T(p) = kinetic energy = Σ(p²/2m)
 * - V(q) = potential energy from interactions
 * 
 * Uses Velocity Verlet integration for time-reversibility and energy conservation.
 */

interface PhysicsConfig {
    springConstant: number;
    dampingFactor: number;
    gravitationalConstant: number;
    couplingStrength: number;
    timeScale: number;
}

interface EnergyResult {
    kinetic: number;
    potential: number;
    total: number;
}

// Vector operations
const vec3Add = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] + b[0],
    a[1] + b[1],
    a[2] + b[2],
];

const vec3Sub = (a: [number, number, number], b: [number, number, number]): [number, number, number] => [
    a[0] - b[0],
    a[1] - b[1],
    a[2] - b[2],
];

const vec3Scale = (v: [number, number, number], s: number): [number, number, number] => [
    v[0] * s,
    v[1] * s,
    v[2] * s,
];

const vec3Dot = (a: [number, number, number], b: [number, number, number]): number =>
    a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

const vec3Length = (v: [number, number, number]): number =>
    Math.sqrt(v[0] * v[0] + v[1] * v[1] + v[2] * v[2]);

const vec3Normalize = (v: [number, number, number]): [number, number, number] => {
    const len = vec3Length(v);
    if (len === 0) return [0, 0, 0];
    return vec3Scale(v, 1 / len);
};

/**
 * Calculate the force on particle i from all other particles
 * Based on gradient of potential energy: F = -∇V(q)
 */
const calculateForce = (
    particle: Particle,
    allParticles: Particle[],
    config: PhysicsConfig,
    handPosition: [number, number, number] | null,
    gestureMode: 'attract' | 'repel' | 'spawn' | 'destroy'
): [number, number, number] => {
    let force: [number, number, number] = [0, 0, 0];

    // Harmonic central potential (spring to origin)
    // V_spring = 0.5 * k * r²
    // F_spring = -k * r
    const toOrigin = vec3Scale(particle.position, -config.springConstant);
    force = vec3Add(force, toOrigin);

    // Damping force (dissipation)
    // F_damp = -γ * v = -γ * p/m
    const velocity = vec3Scale(particle.momentum, 1 / particle.mass);
    const damping = vec3Scale(velocity, -config.dampingFactor);
    force = vec3Add(force, damping);

    // Particle-particle interactions
    for (const other of allParticles) {
        if (other.id === particle.id) continue;

        const diff = vec3Sub(other.position, particle.position);
        const distance = vec3Length(diff);

        if (distance < 0.1) continue; // Avoid singularity

        const direction = vec3Normalize(diff);

        // Gravitational attraction
        // F_grav = G * m1 * m2 / r² * r̂
        const gravMagnitude = (config.gravitationalConstant * particle.mass * other.mass) / (distance * distance);
        const gravForce = vec3Scale(direction, gravMagnitude);
        force = vec3Add(force, gravForce);

        // Holarchic coupling (level-dependent interaction)
        // Particles at the same level attract, different levels have modified coupling
        const levelDiff = Math.abs(particle.holarchyLevel - other.holarchyLevel);
        const holarchicMod = levelDiff === 0 ? 1.0 : 0.5 / (1 + levelDiff);

        // Charge-based interaction (Coulomb-like)
        const chargeMagnitude = (config.couplingStrength * particle.charge * other.charge) / (distance * distance);
        const chargeForce = vec3Scale(direction, -chargeMagnitude * holarchicMod);
        force = vec3Add(force, chargeForce);
    }

    // Hand interaction (if tracking enabled)
    if (handPosition) {
        const toHand = vec3Sub(handPosition, particle.position);
        const handDist = vec3Length(toHand);

        if (handDist > 0.1 && handDist < 10) {
            const handDir = vec3Normalize(toHand);
            const handStrength = 5 / (handDist * handDist);

            if (gestureMode === 'attract') {
                force = vec3Add(force, vec3Scale(handDir, handStrength));
            } else if (gestureMode === 'repel') {
                force = vec3Add(force, vec3Scale(handDir, -handStrength));
            }
        }
    }

    return force;
};

/**
 * Calculate total kinetic energy: T = Σ(p²/2m)
 */
const calculateKineticEnergy = (particles: Particle[]): number => {
    return particles.reduce((sum, p) => {
        const pSquared = vec3Dot(p.momentum, p.momentum);
        return sum + pSquared / (2 * p.mass);
    }, 0);
};

/**
 * Calculate total potential energy from all interactions
 */
const calculatePotentialEnergy = (particles: Particle[], config: PhysicsConfig): number => {
    let potential = 0;

    // Spring potential to origin
    for (const p of particles) {
        const rSquared = vec3Dot(p.position, p.position);
        potential += 0.5 * config.springConstant * rSquared;
    }

    // Pairwise interactions
    for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
            const pi = particles[i];
            const pj = particles[j];

            const diff = vec3Sub(pj.position, pi.position);
            const distance = vec3Length(diff);

            if (distance < 0.1) continue;

            // Gravitational potential: V = -G*m1*m2/r
            potential -= (config.gravitationalConstant * pi.mass * pj.mass) / distance;

            // Coulomb potential: V = k*q1*q2/r (with holarchic modification)
            const levelDiff = Math.abs(pi.holarchyLevel - pj.holarchyLevel);
            const holarchicMod = levelDiff === 0 ? 1.0 : 0.5 / (1 + levelDiff);
            potential += (config.couplingStrength * pi.charge * pj.charge * holarchicMod) / distance;
        }
    }

    return potential;
};

/**
 * Velocity Verlet Integration Step
 * 
 * Symplectic integrator that preserves phase space volume.
 * 
 * 1. Update positions: q(t+dt) = q(t) + p(t)/m * dt + 0.5 * F(t)/m * dt²
 * 2. Calculate new forces: F(t+dt)
 * 3. Update momenta: p(t+dt) = p(t) + 0.5 * (F(t) + F(t+dt)) * dt
 */
export const integrateHamiltonian = (
    particles: Particle[],
    config: PhysicsConfig,
    dt: number,
    handPosition: [number, number, number] | null = null,
    gestureMode: 'attract' | 'repel' | 'spawn' | 'destroy' = 'attract'
): { particles: Particle[]; energies: EnergyResult } => {
    const timeStep = dt * config.timeScale;

    // Calculate initial forces
    const forces = particles.map((p) => calculateForce(p, particles, config, handPosition, gestureMode));

    // Update positions using current momenta and forces
    const updatedParticles = particles.map((p, i) => {
        const velocity = vec3Scale(p.momentum, 1 / p.mass);
        const acceleration = vec3Scale(forces[i], 1 / p.mass);

        // q(t+dt) = q(t) + v*dt + 0.5*a*dt²
        const newPosition: [number, number, number] = [
            p.position[0] + velocity[0] * timeStep + 0.5 * acceleration[0] * timeStep * timeStep,
            p.position[1] + velocity[1] * timeStep + 0.5 * acceleration[1] * timeStep * timeStep,
            p.position[2] + velocity[2] * timeStep + 0.5 * acceleration[2] * timeStep * timeStep,
        ];

        return {
            ...p,
            position: newPosition,
        };
    });

    // Calculate new forces at updated positions
    const newForces = updatedParticles.map((p) => calculateForce(p, updatedParticles, config, handPosition, gestureMode));

    // Update momenta using average of old and new forces
    const finalParticles = updatedParticles.map((p, i) => {
        // p(t+dt) = p(t) + 0.5*(F(t) + F(t+dt))*dt
        const avgForce: [number, number, number] = [
            0.5 * (forces[i][0] + newForces[i][0]),
            0.5 * (forces[i][1] + newForces[i][1]),
            0.5 * (forces[i][2] + newForces[i][2]),
        ];

        const newMomentum: [number, number, number] = [
            p.momentum[0] + avgForce[0] * timeStep,
            p.momentum[1] + avgForce[1] * timeStep,
            p.momentum[2] + avgForce[2] * timeStep,
        ];

        // Calculate particle energy for coloring
        const kineticEnergy = vec3Dot(newMomentum, newMomentum) / (2 * p.mass);

        return {
            ...p,
            momentum: newMomentum,
            energy: kineticEnergy,
        };
    });

    // Calculate system energies
    const kinetic = calculateKineticEnergy(finalParticles);
    const potential = calculatePotentialEnergy(finalParticles, config);

    return {
        particles: finalParticles,
        energies: {
            kinetic,
            potential,
            total: kinetic + potential,
        },
    };
};

/**
 * Check if particles should merge or emerge into higher holarchy levels
 */
export const checkHolarchicEmergence = (
    particles: Particle[],
    emergenceThreshold: number,
    maxLevel: number
): Particle[] => {
    const result: Particle[] = [...particles];
    const toMerge: Set<string> = new Set();

    for (let i = 0; i < particles.length; i++) {
        if (toMerge.has(particles[i].id)) continue;

        for (let j = i + 1; j < particles.length; j++) {
            if (toMerge.has(particles[j].id)) continue;

            const pi = particles[i];
            const pj = particles[j];

            // Only merge particles at the same level
            if (pi.holarchyLevel !== pj.holarchyLevel) continue;
            if (pi.holarchyLevel >= maxLevel - 1) continue;

            const diff = vec3Sub(pj.position, pi.position);
            const distance = vec3Length(diff);

            // Check if particles are close enough and have low relative velocity
            if (distance < emergenceThreshold) {
                const relMomentum = vec3Sub(pj.momentum, pi.momentum);
                const relVel = vec3Length(relMomentum) / (pi.mass + pj.mass);

                if (relVel < emergenceThreshold) {
                    // Merge into higher level particle
                    toMerge.add(pi.id);
                    toMerge.add(pj.id);

                    const newMass = pi.mass + pj.mass;
                    const newPosition: [number, number, number] = [
                        (pi.position[0] * pi.mass + pj.position[0] * pj.mass) / newMass,
                        (pi.position[1] * pi.mass + pj.position[1] * pj.mass) / newMass,
                        (pi.position[2] * pi.mass + pj.position[2] * pj.mass) / newMass,
                    ];
                    const newMomentum: [number, number, number] = [
                        pi.momentum[0] + pj.momentum[0],
                        pi.momentum[1] + pj.momentum[1],
                        pi.momentum[2] + pj.momentum[2],
                    ];

                    const HOLARCHY_COLORS = [
                        '#6366f1', '#22d3ee', '#10b981', '#fbbf24', '#f472b6',
                    ];

                    result.push({
                        id: `p_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        position: newPosition,
                        momentum: newMomentum,
                        mass: newMass,
                        charge: pi.charge + pj.charge,
                        holarchyLevel: pi.holarchyLevel + 1,
                        energy: 0,
                        color: HOLARCHY_COLORS[(pi.holarchyLevel + 1) % HOLARCHY_COLORS.length],
                    });
                }
            }
        }
    }

    return result.filter((p) => !toMerge.has(p.id));
};
