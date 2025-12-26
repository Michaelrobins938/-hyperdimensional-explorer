// Neural Transition Web Visualization
class NeuralViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // State
        this.time = 0;
        this.signals = [];

        // Generate neural network
        this.nodes = this.generateNodes();
        this.connections = this.generateConnections();

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

    generateNodes() {
        const nodes = [];

        DATA.products.slice(0, 10).forEach((product, idx) => {
            const angle = (idx / 10) * Math.PI * 2;
            const radius = 120 + Math.random() * 60;

            nodes.push({
                id: product.name,
                x: this.centerX + Math.cos(angle) * radius,
                y: this.centerY + Math.sin(angle) * radius,
                size: 15 + (product.percentage * 2),
                color: PRODUCT_COLORS[product.name] || CLUSTER_COLORS[idx % 8],
                activity: product.count,
                percentage: product.percentage,
                pulsePhase: Math.random() * Math.PI * 2,
                vx: 0,
                vy: 0
            });
        });

        return nodes;
    }

    generateConnections() {
        const connections = [];

        DATA.transitions.forEach(trans => {
            const fromNode = this.nodes.find(n => n.id.includes(trans.from.split(' ')[0]));
            const toNode = this.nodes.find(n => n.id.includes(trans.to.split(' ')[0]));

            if (fromNode && toNode && fromNode !== toNode) {
                connections.push({
                    from: fromNode,
                    to: toNode,
                    strength: trans.count,
                    width: Math.max(1, trans.count / 30)
                });
            }
        });

        return connections;
    }

    setupControls() {
        const fireBtn = document.getElementById('neural-fire');

        if (fireBtn) {
            fireBtn.addEventListener('click', () => {
                // Fire signals from random connections
                for (let i = 0; i < 5; i++) {
                    const conn = this.connections[Math.floor(Math.random() * this.connections.length)];
                    if (conn) {
                        this.signals.push({
                            connection: conn,
                            progress: 0,
                            speed: 0.02 + Math.random() * 0.02
                        });
                    }
                }
            });

            // Auto-fire signals
            setInterval(() => {
                if (this.signals.length < 20) {
                    const conn = this.connections[Math.floor(Math.random() * this.connections.length)];
                    if (conn) {
                        this.signals.push({
                            connection: conn,
                            progress: 0,
                            speed: 0.01 + Math.random() * 0.02
                        });
                    }
                }
            }, 200);
        }
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, 400
        );
        gradient.addColorStop(0, 'rgba(15, 10, 25, 1)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawConnections() {
        this.connections.forEach(conn => {
            const controlX = (conn.from.x + conn.to.x) / 2 + (Math.random() - 0.5) * 50;
            const controlY = (conn.from.y + conn.to.y) / 2 + (Math.random() - 0.5) * 50;

            // Draw curved connection
            this.ctx.beginPath();
            this.ctx.moveTo(conn.from.x, conn.from.y);
            this.ctx.quadraticCurveTo(controlX, controlY, conn.to.x, conn.to.y);

            const gradient = this.ctx.createLinearGradient(
                conn.from.x, conn.from.y,
                conn.to.x, conn.to.y
            );
            gradient.addColorStop(0, conn.from.color + '30');
            gradient.addColorStop(1, conn.to.color + '30');

            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = conn.width;
            this.ctx.stroke();
        });
    }

    drawSignals() {
        this.signals = this.signals.filter(signal => signal.progress <= 1);

        this.signals.forEach(signal => {
            signal.progress += signal.speed;

            const conn = signal.connection;
            const t = signal.progress;

            // Quadratic bezier point calculation
            const controlX = (conn.from.x + conn.to.x) / 2;
            const controlY = (conn.from.y + conn.to.y) / 2;

            const x = Math.pow(1 - t, 2) * conn.from.x +
                2 * (1 - t) * t * controlX +
                Math.pow(t, 2) * conn.to.x;
            const y = Math.pow(1 - t, 2) * conn.from.y +
                2 * (1 - t) * t * controlY +
                Math.pow(t, 2) * conn.to.y;

            // Signal glow
            const gradient = this.ctx.createRadialGradient(x, y, 0, x, y, 15);
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(0.3, conn.from.color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(x, y, 15, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();

            // Signal core
            this.ctx.beginPath();
            this.ctx.arc(x, y, 4, 0, Math.PI * 2);
            this.ctx.fillStyle = '#fff';
            this.ctx.fill();

            // Trail
            for (let i = 1; i <= 5; i++) {
                const tt = Math.max(0, t - i * 0.03);
                const tx = Math.pow(1 - tt, 2) * conn.from.x +
                    2 * (1 - tt) * tt * controlX +
                    Math.pow(tt, 2) * conn.to.x;
                const ty = Math.pow(1 - tt, 2) * conn.from.y +
                    2 * (1 - tt) * tt * controlY +
                    Math.pow(tt, 2) * conn.to.y;

                this.ctx.beginPath();
                this.ctx.arc(tx, ty, 3 - i * 0.4, 0, Math.PI * 2);
                this.ctx.fillStyle = conn.from.color;
                this.ctx.globalAlpha = 0.5 - i * 0.08;
                this.ctx.fill();
            }
            this.ctx.globalAlpha = 1;
        });
    }

    drawNodes() {
        this.nodes.forEach(node => {
            const pulse = Math.sin(this.time * 2 + node.pulsePhase) * 0.2 + 1;
            const size = node.size * pulse;

            // Node glow
            const glowGradient = this.ctx.createRadialGradient(
                node.x, node.y, 0,
                node.x, node.y, size * 3
            );
            glowGradient.addColorStop(0, node.color + '60');
            glowGradient.addColorStop(0.5, node.color + '20');
            glowGradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = glowGradient;
            this.ctx.fill();

            // Node body
            const bodyGradient = this.ctx.createRadialGradient(
                node.x - size * 0.3, node.y - size * 0.3, 0,
                node.x, node.y, size
            );
            bodyGradient.addColorStop(0, '#fff');
            bodyGradient.addColorStop(0.3, node.color);
            bodyGradient.addColorStop(1, node.color + 'aa');

            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = bodyGradient;
            this.ctx.fill();

            // Label
            this.ctx.font = '11px Space Grotesk';
            this.ctx.fillStyle = '#fff';
            this.ctx.textAlign = 'center';
            this.ctx.fillText(node.id, node.x, node.y + size + 18);

            this.ctx.font = '9px JetBrains Mono';
            this.ctx.fillStyle = '#94a3b8';
            this.ctx.fillText(`${node.percentage.toFixed(1)}%`, node.x, node.y + size + 30);
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawConnections();
        this.drawSignals();
        this.drawNodes();

        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.NeuralViz = NeuralViz;
