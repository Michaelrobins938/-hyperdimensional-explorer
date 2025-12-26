// Animated Flow/Sankey Visualization
class FlowViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.flows = this.initFlows();
        this.resize();
        this.initParticles();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }
    initFlows() {
        const leftX = 100, rightX = 500, midY = 225;
        return [
            { from: { x: leftX, y: midY - 80, name: 'YouTube' }, to: { x: rightX, y: midY - 100, name: 'YouTube' }, value: 3967, color: '#ff0000' },
            { from: { x: leftX, y: midY - 80, name: 'YouTube' }, to: { x: rightX, y: midY, name: 'Search' }, value: 76, color: '#f97316' },
            { from: { x: leftX, y: midY + 40, name: 'Search' }, to: { x: rightX, y: midY - 100, name: 'YouTube' }, value: 84, color: '#4285f4' },
            { from: { x: leftX, y: midY + 40, name: 'Search' }, to: { x: rightX, y: midY, name: 'Search' }, value: 168, color: '#4285f4' },
            { from: { x: leftX, y: midY + 120, name: 'AI Tools' }, to: { x: rightX, y: midY + 100, name: 'AI Tools' }, value: 52, color: '#8b5cf6' }
        ];
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        // Update flow positions relative to canvas
        const scaleX = this.canvas.width / 600;
        this.flows.forEach(f => {
            f.from.xScaled = f.from.x * scaleX;
            f.to.xScaled = f.to.x * scaleX;
        });
    }
    initParticles() {
        this.particles = [];
        this.flows.forEach((flow, fi) => {
            const count = Math.ceil(flow.value / 100);
            for (let i = 0; i < count; i++) {
                this.particles.push({
                    flowIdx: fi,
                    t: Math.random(),
                    speed: 0.002 + Math.random() * 0.002,
                    offset: (Math.random() - 0.5) * (flow.value / 100)
                });
            }
        });
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = 'rgba(10, 10, 15, 0.1)';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        // Draw flow paths
        this.flows.forEach(flow => {
            const width = Math.max(2, flow.value / 100);
            ctx.beginPath();
            ctx.moveTo(flow.from.xScaled, flow.from.y);
            const cpx1 = flow.from.xScaled + (flow.to.xScaled - flow.from.xScaled) * 0.4;
            const cpx2 = flow.from.xScaled + (flow.to.xScaled - flow.from.xScaled) * 0.6;
            ctx.bezierCurveTo(cpx1, flow.from.y, cpx2, flow.to.y, flow.to.xScaled, flow.to.y);
            ctx.strokeStyle = this.hexToRgba(flow.color, 0.15);
            ctx.lineWidth = width;
            ctx.stroke();
        });
        // Draw particles
        this.particles.forEach(p => {
            const flow = this.flows[p.flowIdx];
            const t = p.t;
            // Bezier interpolation
            const x = this.bezierPoint(flow.from.xScaled, flow.from.xScaled + (flow.to.xScaled - flow.from.xScaled) * 0.4,
                flow.from.xScaled + (flow.to.xScaled - flow.from.xScaled) * 0.6, flow.to.xScaled, t);
            const y = this.bezierPoint(flow.from.y, flow.from.y, flow.to.y, flow.to.y, t) + p.offset;
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, Math.PI * 2);
            ctx.fillStyle = flow.color;
            ctx.fill();
            // Update particle
            p.t += p.speed;
            if (p.t > 1) p.t = 0;
        });
        // Draw labels
        const labels = new Set();
        this.flows.forEach(f => { labels.add(JSON.stringify({ name: f.from.name, x: f.from.xScaled, y: f.from.y })); });
        this.flows.forEach(f => { labels.add(JSON.stringify({ name: f.to.name, x: f.to.xScaled, y: f.to.y })); });
        ctx.font = '13px Outfit';
        ctx.fillStyle = '#fff';
        labels.forEach(l => {
            const { name, x, y } = JSON.parse(l);
            ctx.textAlign = x < this.canvas.width / 2 ? 'right' : 'left';
            ctx.fillText(name, x < this.canvas.width / 2 ? x - 20 : x + 20, y + 4);
        });
    }
    bezierPoint(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        return mt * mt * mt * p0 + 3 * mt * mt * t * p1 + 3 * mt * t * t * p2 + t * t * t * p3;
    }
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
    animate() {
        this.draw();
        requestAnimationFrame(() => this.animate());
    }
}
window.FlowViz = FlowViz;
