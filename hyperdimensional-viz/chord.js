// Chord Diagram - Circular Transition Flows
class ChordViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.nodes = ['YouTube', 'Search', 'AI Tools', 'E-commerce', 'Other'];
        this.matrix = [
            [3967, 76, 35, 15, 40],  // YouTube ->
            [84, 168, 10, 5, 15],    // Search ->
            [28, 12, 52, 3, 5],      // AI Tools ->
            [8, 5, 2, 83, 10],       // E-commerce ->
            [25, 15, 8, 12, 150]     // Other ->
        ];
        this.colors = ['#ff0000', '#4285f4', '#8b5cf6', '#22c55e', '#607d8b'];
        this.hovered = null;
        this.animPhase = 0;
        this.resize();
        this.setupEvents();
        this.animate();
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.38;
        this.calculateArcs();
    }
    calculateArcs() {
        const totals = this.nodes.map((_, i) =>
            this.matrix[i].reduce((a, b) => a + b, 0) + this.matrix.reduce((a, row) => a + row[i], 0)
        );
        const total = totals.reduce((a, b) => a + b, 0);
        this.arcs = [];
        let angle = -Math.PI / 2;
        const gap = 0.03;
        totals.forEach((t, i) => {
            const span = (t / total) * (Math.PI * 2 - gap * this.nodes.length);
            this.arcs.push({ start: angle, end: angle + span, mid: angle + span / 2, index: i });
            angle += span + gap;
        });
    }
    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const mx = e.clientX - rect.left - this.cx, my = e.clientY - rect.top - this.cy;
            const dist = Math.hypot(mx, my);
            const angle = Math.atan2(my, mx);
            this.hovered = null;
            if (dist > this.radius - 30 && dist < this.radius + 30) {
                this.arcs.forEach(arc => {
                    let a = angle;
                    if (a < arc.start) a += Math.PI * 2;
                    if (a >= arc.start && a <= arc.end) this.hovered = arc.index;
                });
            }
        });
        this.canvas.addEventListener('mouseleave', () => { this.hovered = null; });
        window.addEventListener('resize', () => this.resize());
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.animPhase += 0.01;
        // Draw chords
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = 0; j < this.nodes.length; j++) {
                if (this.matrix[i][j] === 0) continue;
                const isHovered = this.hovered === null || this.hovered === i || this.hovered === j;
                const alpha = isHovered ? 0.6 : 0.1;
                const srcArc = this.arcs[i], dstArc = this.arcs[j];
                // Source point on arc
                const srcAngle = srcArc.start + (srcArc.end - srcArc.start) * (j / this.nodes.length * 0.8 + 0.1);
                const dstAngle = dstArc.start + (dstArc.end - dstArc.start) * (i / this.nodes.length * 0.8 + 0.1);
                const r = this.radius - 15;
                const sx = this.cx + Math.cos(srcAngle) * r;
                const sy = this.cy + Math.sin(srcAngle) * r;
                const dx = this.cx + Math.cos(dstAngle) * r;
                const dy = this.cy + Math.sin(dstAngle) * r;
                // Bezier chord
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.quadraticCurveTo(this.cx, this.cy, dx, dy);
                const grad = ctx.createLinearGradient(sx, sy, dx, dy);
                grad.addColorStop(0, this.hexToRgba(this.colors[i], alpha));
                grad.addColorStop(1, this.hexToRgba(this.colors[j], alpha));
                ctx.strokeStyle = grad;
                ctx.lineWidth = Math.max(1, this.matrix[i][j] / 200);
                ctx.stroke();
            }
        }
        // Draw arcs
        this.arcs.forEach((arc, i) => {
            const isHovered = this.hovered === null || this.hovered === i;
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, this.radius, arc.start, arc.end);
            ctx.strokeStyle = this.colors[i];
            ctx.lineWidth = isHovered ? 25 : 20;
            ctx.lineCap = 'round';
            ctx.stroke();
            // Glow when hovered
            if (this.hovered === i) {
                ctx.beginPath();
                ctx.arc(this.cx, this.cy, this.radius, arc.start, arc.end);
                ctx.strokeStyle = this.colors[i] + '40';
                ctx.lineWidth = 40;
                ctx.stroke();
            }
            // Label
            const labelR = this.radius + 40;
            const lx = this.cx + Math.cos(arc.mid) * labelR;
            const ly = this.cy + Math.sin(arc.mid) * labelR;
            ctx.fillStyle = isHovered ? '#fff' : '#9ca3af';
            ctx.font = isHovered ? 'bold 13px Outfit' : '12px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.nodes[i], lx, ly);
        });
        // Center info
        if (this.hovered !== null) {
            const node = this.nodes[this.hovered];
            const outgoing = this.matrix[this.hovered].reduce((a, b) => a + b, 0);
            const incoming = this.matrix.reduce((a, row) => a + row[this.hovered], 0);
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 16px Outfit';
            ctx.textAlign = 'center';
            ctx.fillText(node, this.cx, this.cy - 15);
            ctx.font = '12px Inter';
            ctx.fillStyle = '#9ca3af';
            ctx.fillText(`↗ ${outgoing} out  ↙ ${incoming} in`, this.cx, this.cy + 10);
        }
    }
    hexToRgba(hex, a) {
        const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${a})`;
    }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
}
window.ChordViz = ChordViz;
