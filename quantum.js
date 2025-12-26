// Quantum Probability Field Visualization
class QuantumViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // State
        this.waveMode = true;
        this.time = 0;

        // Generate quantum particles
        this.particles = this.generateParticles();
        this.waves = this.generateWaves();

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

    generateParticles() {
        const particles = [];
        const total = 300;

        DATA.clusters.forEach((cluster, idx) => {
            const count = Math.floor((cluster.percentage / 100) * total);
            const angle = (idx / DATA.clusters.length) * Math.PI * 2;
            const baseRadius = 100 + idx * 30;

            for (let i = 0; i < count; i++) {
                const theta = angle + (Math.random() - 0.5) * 0.8;
                const r = baseRadius + (Math.random() - 0.5) * 60;

                particles.push({
                    cluster: idx,
                    x: Math.cos(theta) * r,
                    y: Math.sin(theta) * r,
                    baseX: Math.cos(theta) * r,
                    baseY: Math.sin(theta) * r,
                    vx: 0,
                    vy: 0,
                    phase: Math.random() * Math.PI * 2,
                    amplitude: 20 + Math.random() * 30,
                    frequency: 0.5 + Math.random() * 1.5,
                    probability: 0.5 + Math.random() * 0.5,
                    size: 2 + Math.random() * 3
                });
            }
        });

        return particles;
    }

    generateWaves() {
        const waves = [];

        // Create probability waves for each cluster
        DATA.clusters.forEach((cluster, idx) => {
            const angle = (idx / DATA.clusters.length) * Math.PI * 2;
            waves.push({
                cluster: idx,
                centerX: Math.cos(angle) * 120,
                centerY: Math.sin(angle) * 120,
                radius: 30 + (cluster.percentage * 2),
                frequency: 0.02 + idx * 0.005,
                amplitude: 50 + cluster.percentage,
                phase: idx * 0.5
            });
        });

        return waves;
    }

    setupControls() {
        const waveBtn = document.getElementById('quantum-wave');
        const particleBtn = document.getElementById('quantum-particle');

        if (waveBtn) {
            waveBtn.addEventListener('click', () => {
                this.waveMode = true;
                waveBtn.classList.add('active');
                if (particleBtn) particleBtn.classList.remove('active');
            });
        }

        if (particleBtn) {
            particleBtn.addEventListener('click', () => {
                this.waveMode = false;
                particleBtn.classList.add('active');
                if (waveBtn) waveBtn.classList.remove('active');
            });
        }
    }

    drawBackground() {
        // Quantum void
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 400
        );
        gradient.addColorStop(0, 'rgba(6, 182, 212, 0.03)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawProbabilityWaves() {
        this.waves.forEach(wave => {
            const color = CLUSTER_COLORS[wave.cluster];

            // Draw multiple concentric rings
            for (let ring = 0; ring < 5; ring++) {
                const ringPhase = wave.phase + this.time * wave.frequency;
                const ringRadius = wave.radius + ring * 20 +
                    Math.sin(ringPhase + ring * 0.5) * wave.amplitude * 0.3;

                const alpha = (1 - ring / 5) * 0.3;

                this.ctx.beginPath();
                this.ctx.arc(
                    this.centerX + wave.centerX,
                    this.centerY + wave.centerY,
                    Math.abs(ringRadius),
                    0, Math.PI * 2
                );
                this.ctx.strokeStyle = color;
                this.ctx.globalAlpha = alpha;
                this.ctx.lineWidth = 2 - ring * 0.3;
                this.ctx.stroke();
            }

            // Draw interference pattern
            for (let i = 0; i < 50; i++) {
                const t = i / 50;
                const angle = t * Math.PI * 2;
                const waveOffset = Math.sin(angle * 8 + this.time + wave.phase) * 10;
                const r = wave.radius + waveOffset;

                const x = this.centerX + wave.centerX + Math.cos(angle) * r;
                const y = this.centerY + wave.centerY + Math.sin(angle) * r;

                const brightness = (Math.sin(angle * 8 + this.time) + 1) / 2;

                this.ctx.beginPath();
                this.ctx.arc(x, y, 2 + brightness * 2, 0, Math.PI * 2);
                this.ctx.fillStyle = color;
                this.ctx.globalAlpha = 0.3 + brightness * 0.4;
                this.ctx.fill();
            }
        });

        this.ctx.globalAlpha = 1;
    }

    drawWaveFunction() {
        // Draw Schrödinger-like wave patterns
        const resolution = 80;
        const cellSize = Math.min(this.canvas.width, this.canvas.height) / resolution;

        for (let x = 0; x < resolution; x++) {
            for (let y = 0; y < resolution; y++) {
                const px = x * cellSize;
                const py = y * cellSize;
                const dx = px - this.centerX;
                const dy = py - this.centerY;
                const dist = Math.sqrt(dx * dx + dy * dy);

                // Calculate wave function amplitude
                let psi = 0;
                this.waves.forEach(wave => {
                    const waveDx = px - (this.centerX + wave.centerX);
                    const waveDy = py - (this.centerY + wave.centerY);
                    const waveDist = Math.sqrt(waveDx * waveDx + waveDy * waveDy);

                    psi += Math.sin(waveDist * 0.05 - this.time + wave.phase) *
                        Math.exp(-waveDist / (wave.amplitude * 2));
                });

                const probability = (psi + 1) / 2;
                const alpha = probability * 0.15;

                if (alpha > 0.02) {
                    // Choose color based on dominant cluster
                    const hue = 250 + psi * 50;
                    this.ctx.fillStyle = `hsla(${hue}, 70%, 60%, ${alpha})`;
                    this.ctx.fillRect(px, py, cellSize, cellSize);
                }
            }
        }
    }

    drawQuantumParticles() {
        this.particles.forEach(p => {
            // Quantum uncertainty - particles oscillate around probability centers
            const uncertainty = Math.sin(this.time * p.frequency + p.phase) * p.amplitude;
            const uncertaintyY = Math.cos(this.time * p.frequency * 0.7 + p.phase) * p.amplitude * 0.6;

            p.x = p.baseX + uncertainty * (this.waveMode ? 0.3 : 1);
            p.y = p.baseY + uncertaintyY * (this.waveMode ? 0.3 : 1);

            const screenX = this.centerX + p.x;
            const screenY = this.centerY + p.y;

            const color = CLUSTER_COLORS[p.cluster];

            if (!this.waveMode) {
                // Draw probability cloud around particle
                const cloudRadius = 20 + p.amplitude * 0.2;
                const gradient = this.ctx.createRadialGradient(
                    screenX, screenY, 0,
                    screenX, screenY, cloudRadius
                );
                gradient.addColorStop(0, color + '40');
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(screenX, screenY, cloudRadius, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            // Particle core
            this.ctx.beginPath();
            this.ctx.arc(screenX, screenY, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = p.probability;
            this.ctx.fill();

            // Quantum trails
            if (!this.waveMode) {
                for (let t = 1; t <= 5; t++) {
                    const trailX = p.baseX + Math.sin(this.time * p.frequency - t * 0.3 + p.phase) * p.amplitude;
                    const trailY = p.baseY + Math.cos(this.time * p.frequency * 0.7 - t * 0.3 + p.phase) * p.amplitude * 0.6;

                    this.ctx.beginPath();
                    this.ctx.arc(this.centerX + trailX, this.centerY + trailY, p.size * (1 - t * 0.15), 0, Math.PI * 2);
                    this.ctx.fillStyle = color;
                    this.ctx.globalAlpha = (p.probability / t) * 0.3;
                    this.ctx.fill();
                }
            }
        });

        this.ctx.globalAlpha = 1;
    }

    drawQuantumEntanglement() {
        // Draw entanglement lines between related particles
        for (let i = 0; i < Math.min(this.particles.length, 100); i++) {
            const p1 = this.particles[i];
            for (let j = i + 1; j < Math.min(this.particles.length, 100); j++) {
                const p2 = this.particles[j];

                // Only connect particles in same cluster
                if (p1.cluster !== p2.cluster) continue;

                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 80) {
                    const alpha = (1 - dist / 80) * 0.1;

                    this.ctx.beginPath();
                    this.ctx.moveTo(this.centerX + p1.x, this.centerY + p1.y);
                    this.ctx.lineTo(this.centerX + p2.x, this.centerY + p2.y);
                    this.ctx.strokeStyle = CLUSTER_COLORS[p1.cluster];
                    this.ctx.globalAlpha = alpha;
                    this.ctx.lineWidth = 1;
                    this.ctx.stroke();
                }
            }
        }

        this.ctx.globalAlpha = 1;
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();

        if (this.waveMode) {
            this.drawWaveFunction();
            this.drawProbabilityWaves();
        } else {
            this.drawQuantumEntanglement();
        }

        this.drawQuantumParticles();

        this.time += 0.03;

        requestAnimationFrame(() => this.animate());
    }
}

window.QuantumViz = QuantumViz;
