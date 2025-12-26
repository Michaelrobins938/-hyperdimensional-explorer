// Network Force-Directed Graph
class NetworkViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = [];
        this.edges = [];
        this.initNetwork();
        this.resize();
        this.animate();
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        window.addEventListener('resize', () => this.resize());
    }
    initNetwork() {
        const products = DATA.products.slice(0, 6);
        const cx = 300, cy = 225;
        // Product nodes (outer ring)
        products.forEach((p, i) => {
            const angle = (i / products.length) * Math.PI * 2 - Math.PI / 2;
            this.nodes.push({
                id: i, label: p.name, type: 'product', color: p.color,
                value: p.value, x: cx + Math.cos(angle) * 150, y: cy + Math.sin(angle) * 150,
                vx: 0, vy: 0, radius: 15 + p.value / 200
            });
        });
        // Cluster nodes (inner)
        DATA.clusters.slice(0, 4).forEach((c, i) => {
            const angle = (i / 4) * Math.PI * 2;
            this.nodes.push({
                id: products.length + i, label: c.label, type: 'cluster', color: DATA.clusterColors[c.id],
                value: c.size, x: cx + Math.cos(angle) * 70, y: cy + Math.sin(angle) * 70,
                vx: 0, vy: 0, radius: 12 + c.size / 200
            });
        });
        // Edges
        this.edges = [
            { source: 0, target: 6, value: 3000 }, // YT -> YT Core
            { source: 0, target: 7, value: 200 },  // YT -> YT Alt
            { source: 1, target: 8, value: 800 },  // Search -> Search Focus
            { source: 4, target: 9, value: 50 }    // OpenRouter -> AI Tools
        ];
        this.updateStats();
    }
    updateStats() {
        document.getElementById('node-count').textContent = this.nodes.length;
        document.getElementById('edge-count').textContent = this.edges.length;
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
    }
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        this.hoveredNode = null;
        this.nodes.forEach(n => {
            if (Math.hypot(n.x - mx, n.y - my) < n.radius + 5) this.hoveredNode = n;
        });
    }
    simulate() {
        const k = 0.01, repulsion = 2000, damping = 0.9;
        // Repulsion between nodes
        this.nodes.forEach((n1, i) => {
            this.nodes.forEach((n2, j) => {
                if (i >= j) return;
                const dx = n2.x - n1.x, dy = n2.y - n1.y;
                const dist = Math.max(Math.hypot(dx, dy), 1);
                const force = repulsion / (dist * dist);
                const fx = (dx / dist) * force, fy = (dy / dist) * force;
                n1.vx -= fx; n1.vy -= fy;
                n2.vx += fx; n2.vy += fy;
            });
        });
        // Attraction along edges
        this.edges.forEach(e => {
            const n1 = this.nodes[e.source], n2 = this.nodes[e.target];
            if (!n1 || !n2) return;
            const dx = n2.x - n1.x, dy = n2.y - n1.y;
            const dist = Math.hypot(dx, dy);
            const force = (dist - 100) * k;
            const fx = (dx / dist) * force, fy = (dy / dist) * force;
            n1.vx += fx; n1.vy += fy;
            n2.vx -= fx; n2.vy -= fy;
        });
        // Apply velocity
        this.nodes.forEach(n => {
            n.vx *= damping; n.vy *= damping;
            n.x += n.vx; n.y += n.vy;
            n.x = Math.max(40, Math.min(this.canvas.width - 40, n.x));
            n.y = Math.max(40, Math.min(this.canvas.height - 40, n.y));
        });
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw edges
        this.edges.forEach(e => {
            const n1 = this.nodes[e.source], n2 = this.nodes[e.target];
            if (!n1 || !n2) return;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.1 + e.value / 5000})`;
            ctx.lineWidth = 1 + e.value / 1000;
            ctx.stroke();
        });
        // Draw nodes
        this.nodes.forEach(n => {
            const isHovered = this.hoveredNode === n;
            // Glow
            if (isHovered) {
                const grad = ctx.createRadialGradient(n.x, n.y, 0, n.x, n.y, n.radius * 2);
                grad.addColorStop(0, n.color + '66');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius * 2, 0, Math.PI * 2);
                ctx.fill();
            }
            // Node
            ctx.beginPath();
            ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
            ctx.fillStyle = n.color;
            ctx.fill();
            ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isHovered ? 2 : 1;
            ctx.stroke();
            // Label
            ctx.fillStyle = '#fff';
            ctx.font = '11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(n.label, n.x, n.y + n.radius + 14);
        });
    }
    animate() {
        this.simulate();
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}
window.NetworkViz = NetworkViz;
