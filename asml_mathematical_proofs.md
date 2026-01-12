# ASML EUV Lithography: Formal Mathematical & Physical Derivations
**Project**: AKASHA / H-JEPA  
**Subject**: Systematic Proof of Micro-Scale Matter Synthesis  

---

## 1. Resolution and the Rayleigh Criterion
The fundamental resolution limit ($CD$) of an optical system is defined by the interaction between the wavelength ($\lambda$) and the numerical aperture ($NA$).

**Theorem 1.1**: The minimum printable feature size is constrained by diffraction.
**Proof**:
Using the Fourier transform of a circular aperture (the lens), the point spread function (PSF) is given by the Airy disk:
$$I(\theta) = I_0 \left( \frac{2J_1(k a \sin \theta)}{k a \sin \theta} \right)^2$$
The first null occurs at $\sin \theta \approx 1.22 \frac{\lambda}{D}$. In lithography, we define:
$$CD = k_1 \frac{\lambda}{NA}$$
Where:
- $\lambda = 13.5 \text{ nm}$ (EUV)
- $NA = 0.55$ (High-NA)
- $k_1 \ge 0.25$ (Physical limit for single exposure)

**Result**: $CD_{min} = 0.25 \frac{13.5}{0.55} \approx 6.1 \text{ nm}$.

---

## 2. Bragg Multilayer Reflectivity
Since EUV light is absorbed by all solids, reflection must be achieved via Constructive Interference in a periodic stack of $N$ bilayers (Mo/Si).

**Theorem 2.1**: Peak reflectivity occurs when the phase shift between layers is a multiple of $2\pi$.
**Proof**:
Let $d$ be the period of the bilayer ($d = d_{Mo} + d_{Si}$). The condition for constructive interference at incidence angle $\theta$ is:
$$n\lambda = 2d \sin \theta \sqrt{1 - \frac{2\bar{\delta}}{\sin^2 \theta}}$$
Where $\bar{\delta}$ is the average refractive index decrement from unity. To maximize $R$:
1. $d \approx \frac{\lambda}{2} \approx 6.75 \text{ nm}$.
2. The ratio $\Gamma = d_{Mo}/d$ is optimized (typically $\Gamma \approx 0.4$) to balance absorption in Mo vs. phase shift in Si.

The total reflectivity $R$ for $N$ layers is given by the Parratt recursive formula:
$$r_{j,j+1} = \frac{f_j - f_{j+1}}{f_j + f_{j+1}}, \quad R = |r_1|^2$$
For $N=50$ pairs, $R \approx 70\%$.

---

## 3. Plasma Temperature for 13.5nm Emission
The light source requires tin (Sn) plasma at a specific ionization state ($Sn^{8+}$ to $Sn^{12+}$).

**Theorem 3.1**: The optimal temperature for 13.5nm emission corresponds to the $4d-4f$ and $4p-4d$ transition arrays.
**Proof**:
The energy of a 13.5nm photon is:
$$E = \frac{hc}{\lambda} = \frac{1240}{13.5} \approx 91.8 \text{ eV}$$
According to the Ionization Balance (Saha Equation), the plasma temperature $T_e$ must be high enough to populate these states but low enough to avoid over-ionization.
In a Laser-Produced Plasma (LPP), the electron temperature $T_e$ is related to the laser intensity $I$ and wavelength $\lambda_{laser}$:
$$T_e \propto (I \lambda_{laser}^2)^{2/3}$$
For a CO2 laser hitting Sn:
$$T_e \approx 30-40 \text{ eV} \approx 3.5 \times 10^5 \text{ K}$$

---

## 4. Poisson Shot Noise and LER
As the feature size decreases, the volume of resist ($V$) decreases, and thus the number of photons ($N$) per feature decreases.

**Theorem 4.1**: Line Edge Roughness (LER) is inversely proportional to the square root of the photon density.
**Proof**:
Let $N$ be the average number of photons in a pixel. The statistical fluctuation (shot noise) follows a Poisson distribution:
$$\sigma_N = \sqrt{N}$$
The relative variation (SNR) is:
$$\frac{\Delta N}{N} = \frac{1}{\sqrt{N}}$$
LER is a spatial manifestation of this noise during the chemical development phase. If $N$ drops below a threshold, the probability of "missing" a feature (stochastics) increases exponentially.
To maintain LER $\propto \frac{1}{\sqrt{Dose}}$, one must increase the source power (Source Power $\propto 1/LER^2$).

---

## 5. Mechatronic Stability (Lorentz Actuation)
The dual-stage system must maintain sub-nanometer overlay during high-speed scanning.

**Theorem 5.1**: Positional stability is governed by the bandwidth of the feedback loop and the force-to-mass ratio of the maglev stage.
**Proof**:
Force on the stage: $\mathbf{F} = q\mathbf{E} + I(\mathbf{L} \times \mathbf{B})$.
The transfer function $G(s)$ for a 1D stage:
$$G(s) = \frac{X(s)}{F(s)} = \frac{1}{ms^2 + cs + k}$$
To achieve nanometer precision at $500 \text{ mm/s}$, the control system must compensate for:
1. Parasitic vibrations (Air mount transmissibility).
2. Thermal expansion (HeLe sensors with sub-picometer resolution).
The jerk ($d^3x/dt^3$) is limited to prevent structural resonance.

---

### Conclusion
ASML's technique is a rigorous application of **Computational Physics**. The "Matter Synthesis" is essentially a high-dimensional optimization problem where the cost function is the difference between the intended circuit topography and the stochastic realization in the photoresist.
