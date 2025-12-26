// Atomic Orbital Shell Visualization
class AtomicViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // State
        this.orbitalMode = true;
        this.time = 0;

        // Generate atomic structure
        this.nucleus = this.generateNucleus();
        this.electrons = this.generateElectrons();
        this.orbitals = this.generateOrbitals();

        // Setup controls
        this.setupControls();

        // Start animation
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
    }

    generateNucleus() {
        // Central nucleus represents the core activity (YouTube dominant)
        const particles = [];
        const protons = Math.min(20, Math.floor(DATA.products[0].percentage / 5));
        const neutrons = protons;

        for (let i = 0; i < protons; i++) {
            particles.push({
                type: 'proton',
                angle: (i / protons) * Math.PI * 2,
                radius: 5 + Math.random() * 10,
                size: 4 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            });
        }

        for (let i = 0; i < neutrons; i++) {
            particles.push({
                type: 'neutron',
                angle: (i / neutrons) * Math.PI * 2 + Math.PI / neutrons,
                radius: 5 + Math.random() * 10,
                size: 4 + Math.random() * 2,
                phase: Math.random() * Math.PI * 2
            });
        }

        return particles;
    }

    generateOrbitals() {
        const orbitals = [];

        // Each cluster represents an orbital shell
        DATA.clusters.forEach((cluster, idx) => {
            const shellRadius = 50 + idx * 35;
            const inclination = (idx * 30) * (Math.PI / 180); // Different orbital planes

            orbitals.push({
                cluster: idx,
                radius: shellRadius,
                inclination: inclination,
                rotationPhase: idx * 0.5,
                electronCount: Math.max(1, Math.floor(cluster.size / 500))
            });
        });

        return orbitals;
    }

    generateElectrons() {
        const electrons = [];

        DATA.clusters.forEach((cluster, clusterIdx) => {
            const shellRadius = 50 + clusterIdx * 35;
            const electronCount = Math.max(2, Math.min(8, Math.floor(cluster.size / 500)));

            for (let i = 0; i < electronCount; i++) {
                electrons.push({
                    cluster: clusterIdx,
                    shell: clusterIdx,
                    angle: (i / electronCount) * Math.PI * 2,
                    radius: shellRadius,
                    speed: 0.5 + (1 / (clusterIdx + 1)) * 2, // Inner electrons move faster
                    size: 3 + (cluster.percentage / 30),
                    phase: Math.random() * Math.PI * 2,
                    inclination: (clusterIdx * 30 + Math.random() * 20) * (Math.PI / 180)
                });
            }
        });

        return electrons;
    }

    setupControls() {
        const orbitBtn = document.getElementById('atomic-orbit');
        const shellBtn = document.getElementById('atomic-shell');

        if (orbitBtn) {
            orbitBtn.addEventListener('click', () => {
                this.orbitalMode = true;
                orbitBtn.classList.add('active');
                if (shellBtn) shellBtn.classList.remove('active');
            });
        }

        if (shellBtn) {
            shellBtn.addEventListener('click', () => {
                this.orbitalMode = false;
                shellBtn.classList.add('active');
                if (orbitBtn) orbitBtn.classList.remove('active');
            });
        }
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 350
        );
        gradient.addColorStop(0, 'rgba(20, 15, 30, 1)');
        gradient.addColorStop(0.5, 'rgba(10, 8, 20, 1)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawNucleus() {
        // Nuclear glow
        const glowGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 40
        );
        glowGradient.addColorStop(0, 'rgba(239, 68, 68, 0.4)');
        glowGradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.1)');
        glowGradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = glowGradient;
        this.ctx.fill();

        // Draw nucleons
        this.nucleus.forEach(particle => {
            const wobble = Math.sin(this.time * 2 + particle.phase) * 3;
            const x = this.centerX + Math.cos(particle.angle + this.time * 0.5) * (particle.radius + wobble);
            const y = this.centerY + Math.sin(particle.angle + this.time * 0.5) * (particle.radius + wobble);

            const color = particle.type === 'proton' ? '#ef4444' : '#3b82f6';

            // Glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '60');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.fill();
        });
    }

    drawOrbitalPaths() {
        this.orbitals.forEach(orbital => {
            const color = CLUSTER_COLORS[orbital.cluster];

            if (this.orbitalMode) {
                // Draw tilted orbital ellipse
                this.ctx.save();
                this.ctx.translate(this.centerX, this.centerY);
                this.ctx.rotate(orbital.rotationPhase);

                this.ctx.beginPath();
                const minorRadius = Math.max(10, Math.abs(orbital.radius * Math.cos(orbital.inclination)));
                this.ctx.ellipse(0, 0, Math.max(10, orbital.radius), minorRadius, 0, 0, Math.PI * 2);
                this.ctx.strokeStyle = color + '20';
                this.ctx.lineWidth = 1;
                this.ctx.stroke();

                this.ctx.restore();
            } else {
                // Shell mode - concentric circles
                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, orbital.radius, 0, Math.PI * 2);
                this.ctx.strokeStyle = color + '30';
                this.ctx.lineWidth = 2;
                this.ctx.setLineDash([5, 10]);
                this.ctx.stroke();
                this.ctx.setLineDash([]);
            }

            // Draw electron cloud probability
            if (!this.orbitalMode) {
                const cloudGradient = this.ctx.createRadialGradient(
                    this.centerX, this.centerY, orbital.radius - 15,
                    this.centerX, this.centerY, orbital.radius + 15
                );
                cloudGradient.addColorStop(0, 'transparent');
                cloudGradient.addColorStop(0.5, color + '10');
                cloudGradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(this.centerX, this.centerY, orbital.radius + 15, 0, Math.PI * 2);
                this.ctx.fillStyle = cloudGradient;
                this.ctx.fill();
            }
        });
    }

    drawElectrons() {
        this.electrons.forEach(electron => {
            const angle = electron.angle + this.time * electron.speed;

            let x, y;
            if (this.orbitalMode) {
                // 3D orbital motion
                const orbital = this.orbitals[electron.shell];
                const tilt = electron.inclination;

                x = this.centerX + Math.cos(angle) * electron.radius;
                y = this.centerY + Math.sin(angle) * electron.radius * Math.cos(tilt);
            } else {
                // Simple circular orbit
                x = this.centerX + Math.cos(angle) * electron.radius;
                y = this.centerY + Math.sin(angle) * electron.radius;
            }

            const color = CLUSTER_COLORS[electron.cluster];

            // Electron trail
            for (let t = 1; t <= 8; t++) {
                const trailAngle = angle - t * 0.1;
                let trailX, trailY;

                if (this.orbitalMode) {
                    const tilt = electron.inclination;
                    trailX = this.centerX + Math.cos(trailAngle) * electron.radius;
                    trailY = this.centerY + Math.sin(trailAngle) * electron.radius * Math.cos(tilt);
                } else {
                    trailX = this.centerX + Math.cos(trailAngle) * electron.radius;
                    trailY = this.centerY + Math.sin(trailAngle) * electron.radius;
                }

                this.ctx.beginPath();
                this.ctx.arc(trailX, trailY, electron.size * (1 - t * 0.1), 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.3 - t * 0.035;
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;

            // Electron glow
            const glowGradient = this.ctx.createRadialGradient(x, y, 0, x, y, electron.size * 4);
            glowGradient.addColorStop(0, color);
            glowGradient.addColorStop(0.3, color + '80');
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, electron.size * 4, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();

            // Electron core
            this.ctx.beginPath();
            this.ctx.arc(x, y, electron.size, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();

            // Point light effect
            this.ctx.beginPath();
            this.ctx.arc(x - electron.size * 0.3, y - electron.size * 0.3, electron.size * 0.4, 0, Math.PI * 2);
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            this.ctx.fill();
        });
    }

    drawEnergyLevels() {
        // Draw energy level labels
        this.orbitals.forEach((orbital, idx) => {
            const x = this.centerX + orbital.radius + 15;
            const y = this.centerY - 5;

            this.ctx.font = '10px JetBrains Mono';
            this.ctx.fillStyle = CLUSTER_COLORS[idx] + '80';
            this.ctx.fillText(`n=${idx + 1}`, x, y);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawOrbitalPaths();
        this.drawNucleus();
        this.drawElectrons();
        this.drawEnergyLevels();

        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.AtomicViz = AtomicViz;
