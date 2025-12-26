// Galaxy Cluster Formation Visualization
class GalaxyViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // State
        this.spiralMode = true;
        this.time = 0;
        this.rotation = 0;

        // Generate galaxy particles
        this.stars = this.generateStars();
        this.clusterArms = this.generateSpiralArms();
        this.centralCore = this.generateCore();

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

    generateStars() {
        const stars = [];

        for (let i = 0; i < 500; i++) {
            stars.push({
                x: Math.random() * 2 - 1,
                y: Math.random() * 2 - 1,
                z: Math.random(),
                size: 0.5 + Math.random() * 1.5,
                twinkle: Math.random() * Math.PI * 2
            });
        }

        return stars;
    }

    generateSpiralArms() {
        const arms = [];
        const armCount = 4; // Two main arms with two trailing

        DATA.clusters.forEach((cluster, clusterIdx) => {
            const armIdx = clusterIdx % armCount;
            const count = Math.min(cluster.size, 300);

            for (let i = 0; i < count; i++) {
                // Logarithmic spiral formula
                const t = i / count;
                const armAngle = (armIdx / armCount) * Math.PI * 2;
                const spiralAngle = armAngle + t * Math.PI * 3; // 1.5 rotations

                // Distance from center increases with angle
                const baseRadius = 30 + t * 180;
                const radiusVariation = (Math.random() - 0.5) * 40;
                const radius = baseRadius + radiusVariation;

                // Add perturbation for natural look
                const perturbX = (Math.random() - 0.5) * 20;
                const perturbY = (Math.random() - 0.5) * 20;

                arms.push({
                    cluster: clusterIdx,
                    arm: armIdx,
                    t: t,
                    baseAngle: spiralAngle,
                    radius: radius,
                    perturbX: perturbX,
                    perturbY: perturbY,
                    size: 1 + Math.random() * 2.5,
                    brightness: 0.3 + Math.random() * 0.7,
                    orbitSpeed: 0.3 + (1 - t) * 0.7, // Inner stars orbit faster
                    phase: Math.random() * Math.PI * 2
                });
            }
        });

        return arms;
    }

    generateCore() {
        const core = [];

        // Dense central region
        for (let i = 0; i < 200; i++) {
            const angle = Math.random() * Math.PI * 2;
            const radius = Math.pow(Math.random(), 0.5) * 50; // Concentrated in center

            core.push({
                angle: angle,
                radius: radius,
                size: 1 + Math.random() * 2,
                brightness: 0.5 + Math.random() * 0.5,
                orbitSpeed: 1 + Math.random() * 0.5
            });
        }

        return core;
    }

    setupControls() {
        const spiralBtn = document.getElementById('galaxy-spiral');
        const ellipseBtn = document.getElementById('galaxy-ellipse');

        if (spiralBtn) {
            spiralBtn.addEventListener('click', () => {
                this.spiralMode = true;
                spiralBtn.classList.add('active');
                if (ellipseBtn) ellipseBtn.classList.remove('active');
            });
        }

        if (ellipseBtn) {
            ellipseBtn.addEventListener('click', () => {
                this.spiralMode = false;
                ellipseBtn.classList.add('active');
                if (spiralBtn) spiralBtn.classList.remove('active');
            });
        }
    }

    drawBackground() {
        // Deep space gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 400
        );
        gradient.addColorStop(0, 'rgba(20, 10, 30, 1)');
        gradient.addColorStop(0.5, 'rgba(10, 5, 20, 1)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawBackgroundStars() {
        this.stars.forEach(star => {
            const twinkle = (Math.sin(this.time * 2 + star.twinkle) + 1) / 2;
            const alpha = 0.3 + twinkle * 0.4;

            const x = this.centerX + star.x * this.canvas.width * 0.5;
            const y = this.centerY + star.y * this.canvas.height * 0.5;

            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size * (0.5 + twinkle * 0.5), 0, Math.PI * 2);
            this.ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
            this.ctx.fill();
        });
    }

    drawGalacticCore() {
        // Central glow
        const coreGradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 80
        );
        coreGradient.addColorStop(0, 'rgba(255, 200, 100, 0.4)');
        coreGradient.addColorStop(0.3, 'rgba(255, 150, 50, 0.2)');
        coreGradient.addColorStop(0.6, 'rgba(139, 92, 246, 0.1)');
        coreGradient.addColorStop(1, 'transparent');

        this.ctx.beginPath();
        this.ctx.arc(this.centerX, this.centerY, 80, 0, Math.PI * 2);
        this.ctx.fillStyle = coreGradient;
        this.ctx.fill();

        // Core stars
        if (this.centralCore && this.centralCore.length > 0) {
            this.centralCore.forEach(star => {
                const angle = star.angle + this.rotation * star.orbitSpeed;
                const x = this.centerX + Math.cos(angle) * star.radius;
                const y = this.centerY + Math.sin(angle) * star.radius * 0.6; // Flatten for perspective

                const gradSize = Math.max(2, star.size * 2);
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, gradSize);
                gradient.addColorStop(0, `rgba(255, 220, 150, ${star.brightness})`);
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(x, y, gradSize, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();

                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 0.5, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
                this.ctx.fill();
            });
        }
    }

    drawSpiralArms() {
        // Sort by distance for proper layering
        const sorted = [...this.clusterArms].sort((a, b) => b.radius - a.radius);

        sorted.forEach(star => {
            let angle, x, y;

            if (this.spiralMode) {
                // Spiral galaxy mode
                angle = star.baseAngle + this.rotation * star.orbitSpeed;
                x = this.centerX + Math.cos(angle) * star.radius + star.perturbX;
                y = this.centerY + Math.sin(angle) * star.radius * 0.5 + star.perturbY * 0.5; // Flatten for tilt
            } else {
                // Elliptical galaxy mode
                const ellipseAngle = star.baseAngle + this.rotation * 0.2;
                const ellipseRadius = star.radius * 0.7;
                x = this.centerX + Math.cos(ellipseAngle) * ellipseRadius;
                y = this.centerY + Math.sin(ellipseAngle) * ellipseRadius * 0.5;
            }

            const color = CLUSTER_COLORS[star.cluster];

            // Dust lane effect
            const dustOpacity = 0.02 + star.t * 0.03;
            if (star.t > 0.2 && star.t < 0.8) {
                const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, star.size * 8);
                gradient.addColorStop(0, color + '20');
                gradient.addColorStop(1, 'transparent');

                this.ctx.beginPath();
                this.ctx.arc(x, y, star.size * 8, 0, Math.PI * 2);
                this.ctx.fillStyle = gradient;
                this.ctx.fill();
            }

            // Star glow
            const glowSize = star.size * 3;
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, glowSize);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '60');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, glowSize, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = star.brightness * 0.6;
            this.ctx.fill();

            // Star core
            this.ctx.beginPath();
            this.ctx.arc(x, y, star.size * 0.7, 0, Math.PI * 2);
            this.ctx.fillStyle = 'white';
            this.ctx.globalAlpha = star.brightness;
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        });
    }

    drawNebulaClouds() {
        // Draw gas clouds around spiral arms
        const nebulaCount = 12;

        for (let i = 0; i < nebulaCount; i++) {
            const angle = (i / nebulaCount) * Math.PI * 2 + this.rotation * 0.1;
            const radius = 100 + Math.sin(i * 1.5) * 50;

            const x = this.centerX + Math.cos(angle) * radius;
            const y = this.centerY + Math.sin(angle) * radius * 0.5;

            const nebulaColors = ['#8b5cf6', '#ec4899', '#06b6d4', '#6366f1'];
            const color = nebulaColors[i % nebulaColors.length];

            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 60);
            gradient.addColorStop(0, color + '15');
            gradient.addColorStop(0.5, color + '08');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, 60, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawBackgroundStars();
        this.drawNebulaClouds();
        this.drawSpiralArms();
        this.drawGalacticCore();

        this.rotation += 0.003;
        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.GalaxyViz = GalaxyViz;
