// UMAP-style Projection Visualization with Trails
class UMAPViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.points = this.generateUMAPPoints(350);
        this.trails = [];
        this.time = 0;
        this.morphing = false;
        this.morphTarget = null;
        this.morphProgress = 0;
        this.resize();
        this.setupControls();
        this.animate();
    }
    generateUMAPPoints(count) {
        const points = [];
        // UMAP-like layout with distinct clusters and some bridging points
        const clusterCenters = [
            { x: 0.2, y: 0.25 }, { x: 0.15, y: 0.4 }, { x: 0.75, y: 0.3 },
            { x: 0.6, y: 0.7 }, { x: 0.35, y: 0.8 }, { x: 0.85, y: 0.75 },
            { x: 0.5, y: 0.5 }, { x: 0.25, y: 0.65 }
        ];
        const sizes = [150, 15, 80, 30, 25, 20, 15, 15];
        const totalSize = sizes.reduce((a, b) => a + b, 0);
        for (let i = 0; i < count; i++) {
            let rand = Math.random() * totalSize, cid = 0, cs = 0;
            for (let c = 0; c < sizes.length; c++) { cs += sizes[c]; if (rand <= cs) { cid = c; break; } }
            const center = clusterCenters[cid];
            const spread = cid === 0 ? 0.12 : (cid === 2 ? 0.1 : 0.06);
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * spread;
            points.push({
                x: center.x + Math.cos(angle) * dist,
                y: center.y + Math.sin(angle) * dist,
                baseX: center.x + Math.cos(angle) * dist,
                baseY: center.y + Math.sin(angle) * dist,
                cluster: cid,
                phase: Math.random() * Math.PI * 2,
                trail: []
            });
        }
        return points;
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
    }
    setupControls() {
        document.getElementById('umap-morph')?.addEventListener('click', () => { this.startMorph(); });
        document.getElementById('umap-trails')?.addEventListener('click', (e) => {
            this.showTrails = !this.showTrails;
            e.target.classList.toggle('active', this.showTrails);
        });
        window.addEventListener('resize', () => this.resize());
    }
    startMorph() {
        if (this.morphing) return;
        this.morphing = true;
        this.morphProgress = 0;
        // Generate new target positions
        this.morphTarget = this.generateUMAPPoints(this.points.length);
    }
    draw() {
        const ctx = this.ctx;
        const w = this.canvas.width, h = this.canvas.height;
        // Fade effect for trails
        ctx.fillStyle = 'rgba(10, 10, 15, 0.08)';
        ctx.fillRect(0, 0, w, h);
        this.time += 0.02;
        // Update morphing
        if (this.morphing) {
            this.morphProgress += 0.015;
            if (this.morphProgress >= 1) {
                this.morphing = false;
                this.points.forEach((p, i) => {
                    p.baseX = this.morphTarget[i].baseX;
                    p.baseY = this.morphTarget[i].baseY;
                });
            }
        }
        // Draw density background
        const gridSize = 40;
        for (let gx = 0; gx < w; gx += gridSize) {
            for (let gy = 0; gy < h; gy += gridSize) {
                let density = 0;
                this.points.forEach(p => {
                    const px = p.x * w, py = p.y * h;
                    const d = Math.hypot(px - gx, py - gy);
                    if (d < 80) density += (80 - d) / 80;
                });
                if (density > 0.5) {
                    ctx.fillStyle = `rgba(99, 102, 241, ${Math.min(0.15, density * 0.02)})`;
                    ctx.fillRect(gx, gy, gridSize, gridSize);
                }
            }
        }
        // Update and draw points
        this.points.forEach((p, i) => {
            // Brownian motion
            const dx = Math.sin(this.time + p.phase) * 0.002;
            const dy = Math.cos(this.time * 0.7 + p.phase) * 0.002;
            if (this.morphing && this.morphTarget) {
                const t = this.easeInOutCubic(this.morphProgress);
                p.x = p.baseX + (this.morphTarget[i].baseX - p.baseX) * t + dx;
                p.y = p.baseY + (this.morphTarget[i].baseY - p.baseY) * t + dy;
            } else {
                p.x = p.baseX + dx;
                p.y = p.baseY + dy;
            }
            // Store trail
            p.trail.push({ x: p.x * w, y: p.y * h });
            if (p.trail.length > 15) p.trail.shift();
            // Draw trail
            if (this.showTrails && p.trail.length > 1) {
                ctx.beginPath();
                ctx.moveTo(p.trail[0].x, p.trail[0].y);
                p.trail.forEach(t => ctx.lineTo(t.x, t.y));
                ctx.strokeStyle = this.hexToRgba(DATA.clusterColors[p.cluster], 0.3);
                ctx.lineWidth = 1;
                ctx.stroke();
            }
            // Draw point
            const px = p.x * w, py = p.y * h;
            ctx.beginPath();
            ctx.arc(px, py, 4, 0, Math.PI * 2);
            ctx.fillStyle = DATA.clusterColors[p.cluster];
            ctx.fill();
        });
        // Draw cluster labels
        const labels = ['YouTube Core', 'YT Alt', 'Search', 'AI Tools', 'E-commerce', 'Late Night', 'Printify', 'YT Deep'];
        const clusterCenters = this.calculateCentroids();
        ctx.font = '11px Outfit';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        clusterCenters.forEach((c, i) => {
            if (c.count > 5) {
                ctx.fillText(labels[i], c.x * w, c.y * h - 15);
            }
        });
    }
    calculateCentroids() {
        const centroids = Array(8).fill(null).map(() => ({ x: 0, y: 0, count: 0 }));
        this.points.forEach(p => {
            centroids[p.cluster].x += p.x;
            centroids[p.cluster].y += p.y;
            centroids[p.cluster].count++;
        });
        return centroids.map(c => c.count ? { x: c.x / c.count, y: c.y / c.count, count: c.count } : { x: 0, y: 0, count: 0 });
    }
    easeInOutCubic(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    hexToRgba(hex, a) { const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16); return `rgba(${r},${g},${b},${a})`; }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
}
window.UMAPViz = UMAPViz;
