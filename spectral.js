// Spectral Energy Flow Visualization
class SpectralViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.time = 0;
        this.streams = this.generateStreams();

        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
    }

    generateStreams() {
        const streams = [];

        DATA.pcaVariance.forEach((pca, idx) => {
            const stream = {
                component: pca.component,
                variance: pca.variance,
                points: [],
                color: CLUSTER_COLORS[idx % 8],
                phase: idx * 0.3,
                amplitude: 30 + pca.variance * 500,
                frequency: 0.01 + idx * 0.003
            };

            // Generate ribbon points
            for (let i = 0; i <= 100; i++) {
                stream.points.push({
                    baseY: (idx / DATA.pcaVariance.length) * (this.canvas.height - 100) + 50
                });
            }

            streams.push(stream);
        });

        return streams;
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, this.canvas.height);
        gradient.addColorStop(0, 'rgba(5, 3, 15, 1)');
        gradient.addColorStop(1, 'rgba(10, 5, 20, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawStreams() {
        this.streams.forEach((stream, streamIdx) => {
            const points = [];

            // Calculate animated positions
            for (let i = 0; i < stream.points.length; i++) {
                const t = i / (stream.points.length - 1);
                const x = t * this.canvas.width;

                // Wave function
                const wave1 = Math.sin(t * Math.PI * 3 + this.time * stream.frequency * 60 + stream.phase) * stream.amplitude;
                const wave2 = Math.sin(t * Math.PI * 5 + this.time * stream.frequency * 40) * stream.amplitude * 0.3;
                const wave3 = Math.cos(t * Math.PI * 2 + this.time * stream.frequency * 80) * stream.amplitude * 0.2;

                const y = stream.points[i].baseY + wave1 + wave2 + wave3;

                points.push({ x, y });
            }

            // Draw ribbon
            this.ctx.beginPath();
            this.ctx.moveTo(points[0].x, points[0].y);

            for (let i = 1; i < points.length - 2; i++) {
                const xc = (points[i].x + points[i + 1].x) / 2;
                const yc = (points[i].y + points[i + 1].y) / 2;
                this.ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            this.ctx.quadraticCurveTo(
                points[points.length - 2].x,
                points[points.length - 2].y,
                points[points.length - 1].x,
                points[points.length - 1].y
            );

            // Gradient stroke
            const gradient = this.ctx.createLinearGradient(0, 0, this.canvas.width, 0);
            gradient.addColorStop(0, stream.color + '00');
            gradient.addColorStop(0.1, stream.color);
            gradient.addColorStop(0.9, stream.color);
            gradient.addColorStop(1, stream.color + '00');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3 + stream.variance * 30;
            this.ctx.lineCap = 'round';
            this.ctx.stroke();

            // Glow effect
            this.ctx.strokeStyle = stream.color + '40';
            this.ctx.lineWidth = 8 + stream.variance * 50;
            this.ctx.filter = 'blur(8px)';
            this.ctx.stroke();
            this.ctx.filter = 'none';

            // Draw energy particles along stream
            for (let i = 0; i < 10; i++) {
                const particleT = (((this.time * 0.5 + i * 0.1 + streamIdx * 0.05) % 1) + 1) % 1;
                const particleIdx = Math.floor(particleT * (points.length - 1));
                const point = points[particleIdx];

                if (point) {
                    const gradient = this.ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 10);
                    gradient.addColorStop(0, '#fff');
                    gradient.addColorStop(0.3, stream.color);
                    gradient.addColorStop(1, 'transparent');

                    this.ctx.beginPath();
                    this.ctx.arc(point.x, point.y, 10, 0, Math.PI * 2);
                    this.ctx.fillStyle = gradient;
                    this.ctx.fill();
                }
            }

            // Label
            this.ctx.font = '11px JetBrains Mono';
            this.ctx.fillStyle = stream.color;
            this.ctx.textAlign = 'right';
            this.ctx.fillText(`PC${stream.component}: ${(stream.variance * 100).toFixed(1)}%`, this.canvas.width - 20, stream.points[0].baseY);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawStreams();

        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.SpectralViz = SpectralViz;
