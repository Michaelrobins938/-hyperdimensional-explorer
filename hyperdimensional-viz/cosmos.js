// 3D Cosmos Visualization - Interactive Cluster Orbs
class CosmosViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.points = DATA.generatePoints(400);
        this.rotation = { x: 0.3, y: 0, z: 0 };
        this.autoRotate = true;
        this.exploded = false;
        this.zoom = 1;
        this.hoveredCluster = null;
        this.animationId = null;
        this.resize();
        this.setupControls();
        this.animate();
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }
    setupControls() {
        document.getElementById('rotate-toggle')?.addEventListener('click', (e) => {
            this.autoRotate = !this.autoRotate;
            e.target.classList.toggle('active', this.autoRotate);
        });
        document.getElementById('explode-toggle')?.addEventListener('click', (e) => {
            this.exploded = !this.exploded;
            e.target.classList.toggle('active', this.exploded);
        });
        document.getElementById('zoom-slider')?.addEventListener('input', (e) => {
            this.zoom = parseFloat(e.target.value);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        this.canvas.addEventListener('mouseleave', () => { this.hoveredCluster = null; });
        window.addEventListener('resize', () => this.resize());
        this.populateLegend();
    }
    populateLegend() {
        const legend = document.getElementById('cluster-legend');
        if (!legend) return;
        legend.innerHTML = DATA.clusters.map((c, i) => `
            <div class="legend-item" data-cluster="${i}">
                <span class="legend-dot" style="background:${DATA.clusterColors[i]}"></span>
                <span>${c.label} (${c.size})</span>
            </div>
        `).join('');
        legend.querySelectorAll('.legend-item').forEach(item => {
            item.addEventListener('mouseenter', () => {
                this.hoveredCluster = parseInt(item.dataset.cluster);
            });
            item.addEventListener('mouseleave', () => { this.hoveredCluster = null; });
        });
    }
    project(p) {
        const explodeFactor = this.exploded ? 2.5 : 1;
        let x = p.x * explodeFactor, y = p.y * explodeFactor, z = p.z * explodeFactor;
        // Rotate Y
        let cosY = Math.cos(this.rotation.y), sinY = Math.sin(this.rotation.y);
        let tx = x * cosY - z * sinY, tz = x * sinY + z * cosY;
        x = tx; z = tz;
        // Rotate X
        let cosX = Math.cos(this.rotation.x), sinX = Math.sin(this.rotation.x);
        let ty = y * cosX - z * sinX;
        tz = y * sinX + z * cosX;
        y = ty; z = tz;
        const scale = 300 / (300 + z) * this.zoom * 4;
        return { x: this.cx + x * scale, y: this.cy + y * scale, z: z, scale: scale };
    }
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        let closest = null, minDist = 20;
        this.points.forEach(p => {
            const proj = this.project(p);
            const d = Math.hypot(proj.x - mx, proj.y - my);
            if (d < minDist) { minDist = d; closest = p.cluster; }
        });
        this.hoveredCluster = closest;
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(10, 10, 15, 0.2)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Sort by z for depth
        const projected = this.points.map(p => ({ ...p, proj: this.project(p) }));
        projected.sort((a, b) => a.proj.z - b.proj.z);
        // Draw connections (subtle)
        ctx.strokeStyle = 'rgba(99, 102, 241, 0.05)';
        ctx.lineWidth = 0.5;
        for (let i = 0; i < projected.length; i += 10) {
            for (let j = i + 1; j < Math.min(i + 5, projected.length); j++) {
                if (projected[i].cluster === projected[j].cluster) {
                    ctx.beginPath();
                    ctx.moveTo(projected[i].proj.x, projected[i].proj.y);
                    ctx.lineTo(projected[j].proj.x, projected[j].proj.y);
                    ctx.stroke();
                }
            }
        }
        // Draw points
        projected.forEach(p => {
            const { proj, cluster } = p;
            const isHovered = this.hoveredCluster === null || this.hoveredCluster === cluster;
            const alpha = isHovered ? 0.9 : 0.15;
            const size = proj.scale * (isHovered ? 3 : 2);
            ctx.beginPath();
            ctx.arc(proj.x, proj.y, size, 0, Math.PI * 2);
            const color = DATA.clusterColors[cluster];
            ctx.fillStyle = this.hexToRgba(color, alpha);
            ctx.fill();
            if (isHovered && this.hoveredCluster !== null) {
                ctx.strokeStyle = this.hexToRgba(color, 0.8);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        });
        // Draw cluster centroids with glow
        const centroids = this.calculateCentroids();
        centroids.forEach((c, i) => {
            const proj = this.project(c);
            const isHovered = this.hoveredCluster === null || this.hoveredCluster === i;
            if (isHovered) {
                const gradient = ctx.createRadialGradient(proj.x, proj.y, 0, proj.x, proj.y, 30);
                gradient.addColorStop(0, this.hexToRgba(DATA.clusterColors[i], 0.4));
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient;
                ctx.beginPath();
                ctx.arc(proj.x, proj.y, 30, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }
    calculateCentroids() {
        const centroids = Array(8).fill(null).map(() => ({ x: 0, y: 0, z: 0, count: 0 }));
        this.points.forEach(p => {
            centroids[p.cluster].x += p.x;
            centroids[p.cluster].y += p.y;
            centroids[p.cluster].z += p.z;
            centroids[p.cluster].count++;
        });
        return centroids.map(c => c.count ? { x: c.x / c.count, y: c.y / c.count, z: c.z / c.count } : { x: 0, y: 0, z: 0 });
    }
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    animate() {
        if (this.autoRotate) this.rotation.y += 0.003;
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    destroy() {
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }
}
window.CosmosViz = CosmosViz;
