// PCA Variance Manifold Visualization
class ManifoldViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.time = 0;
        this.rings = this.generateRings();
        this.particles = this.generateParticles();

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

    generateRings() {
        return DATA.pcaVariance.map((pca, idx) => ({
            component: pca.component,
            variance: pca.variance,
            cumulative: pca.cumulative,
            radius: 40 + idx * 25,
            color: CLUSTER_COLORS[idx % 8],
            rotationSpeed: 0.01 + (0.02 / (idx + 1)),
            particles: Math.floor(pca.variance * 100)
        }));
    }

    generateParticles() {
        const particles = [];

        this.rings.forEach((ring, ringIdx) => {
            for (let i = 0; i < ring.particles; i++) {
                particles.push({
                    ring: ringIdx,
                    angle: (i / ring.particles) * Math.PI * 2,
                    radiusOffset: (Math.random() - 0.5) * 10,
                    size: 2 + Math.random() * 2,
                    brightness: 0.5 + Math.random() * 0.5,
                    orbitSpeed: 0.5 + Math.random() * 0.5
                });
            }
        });

        return particles;
    }

    drawBackground() {
        // Dimensional void
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 300
        );
        gradient.addColorStop(0, 'rgba(30, 20, 50, 1)');
        gradient.addColorStop(0.5, 'rgba(10, 5, 20, 1)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawPortalCore() {
        // Central vortex
        for (let i = 0; i < 30; i++) {
            const angle = (i / 30) * Math.PI * 2 + this.time * 2;
            const radius = 15 + Math.sin(this.time * 3 + i * 0.5) * 5;

            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 8);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.5, '#8b5cf6');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, 8, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }

        // Core glow
        const coreGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 40
        );
        coreGradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        coreGradient.addColorStop(0.2, 'rgba(139, 92, 246, 0.5)');
        coreGradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.2)');
        coreGradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = coreGradient;
        this.ctx.fill();

        // Variance percentage
        this.ctx.font = 'bold 20px JetBrains Mono';
        this.ctx.fillStyle = '#fff';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('40.6%', this.centerX, this.centerY);

        this.ctx.font = '10px Space Grotesk';
        this.ctx.fillStyle = '#94a3b8';
        this.ctx.fillText('VARIANCE', this.centerX, this.centerY + 20);
    }

    drawVarianceRings() {
        this.rings.forEach((ring, idx) => {
            const rotation = this.time * ring.rotationSpeed * (idx % 2 === 0 ? 1 : -1);

            // Ring glow
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, ring.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = ring.color + '30';
            this.ctx.lineWidth = 8;
            this.ctx.filter = 'blur(5px)';
            this.ctx.stroke();
            this.ctx.filter = 'none';

            // Main ring
            this.ctx.beginPath();
            this.ctx.arc(this.centerX, this.centerY, ring.radius, 0, Math.PI * 2);
            this.ctx.strokeStyle = ring.color + '60';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();

            // Variance arc (showing proportion)
            const arcLength = ring.variance * Math.PI * 2 * 5; // Amplified for visibility

            this.ctx.beginPath();
            this.ctx.arc(
                this.centerX, this.centerY,
                ring.radius,
                rotation,
                rotation + arcLength
            );
            this.ctx.strokeStyle = ring.color;
            this.ctx.lineWidth = 5;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Ring label
            const labelAngle = rotation + arcLength / 2;
            const labelX = this.centerX + Math.cos(labelAngle) * (ring.radius + 15);
            const labelY = this.centerY + Math.sin(labelAngle) * (ring.radius + 15);

            if (idx < 5) {
                this.ctx.font = '9px JetBrains Mono';
                this.ctx.fillStyle = ring.color;
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`PC${ring.component}`, labelX, labelY);
            }
        });
    }

    drawOrbitalParticles() {
        this.particles.forEach(particle => {
            const ring = this.rings[particle.ring];
            const angle = particle.angle + this.time * ring.rotationSpeed * particle.orbitSpeed;
            const radius = ring.radius + particle.radiusOffset;

            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius;

            // Particle glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, particle.size * 2);
            gradient.addColorStop(0, ring.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 2, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = particle.brightness * 0.5;
            this.ctx.fill();

            // Particle core
            this.ctx.beginPath();
            this.ctx.arc(x, y, particle.size * 0.5, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.globalAlpha = particle.brightness;
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        });
    }

    drawEnergyBeams() {
        // Draw energy lines connecting rings
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + this.time * 0.5;

            const gradient = this.ctx.createLinearGradient(
                this.centerX, this.centerY,
                this.centerX + Math.cos(angle) * 250,
                this.centerY + Math.sin(angle) * 250
            );
            gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
            gradient.addColorStop(0.5, 'rgba(236, 72, 153, 0.1)');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.moveTo(this.centerX, this.centerY);
            this.ctx.lineTo(
                this.centerX + Math.cos(angle) * 250,
                this.centerY + Math.sin(angle) * 250
            );
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawEnergyBeams();
        this.drawVarianceRings();
        this.drawOrbitalParticles();
        this.drawPortalCore();

        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.ManifoldViz = ManifoldViz;
