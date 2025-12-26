// Radar Constellation - Multi-axis Behavioral Profile
class RadarViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = [
            { axis: 'YouTube', value: 0.73 },
            { axis: 'Late Night', value: 0.24 },
            { axis: 'Search', value: 0.22 },
            { axis: 'AI Tools', value: 0.15 },
            { axis: 'E-commerce', value: 0.12 },
            { axis: 'Morning', value: 0.18 },
            { axis: 'Afternoon', value: 0.25 },
            { axis: 'Evening', value: 0.35 }
        ];
        this.pulsePhase = 0;
        this.resize();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
        this.radius = Math.min(this.canvas.width, this.canvas.height) * 0.35;
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.pulsePhase += 0.02;
        const n = this.data.length;
        const angleStep = (Math.PI * 2) / n;
        // Draw concentric rings with pulse effect
        for (let i = 5; i >= 1; i--) {
            const r = this.radius * (i / 5);
            const pulse = Math.sin(this.pulsePhase - i * 0.3) * 3;
            ctx.beginPath();
            for (let j = 0; j <= n; j++) {
                const angle = j * angleStep - Math.PI / 2;
                const x = this.cx + Math.cos(angle) * (r + pulse);
                const y = this.cy + Math.sin(angle) * (r + pulse);
                if (j === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.strokeStyle = `rgba(99, 102, 241, ${0.1 + i * 0.05})`;
            ctx.lineWidth = 1;
            ctx.stroke();
        }
        // Draw axis lines
        this.data.forEach((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = this.cx + Math.cos(angle) * this.radius;
            const y = this.cy + Math.sin(angle) * this.radius;
            ctx.beginPath();
            ctx.moveTo(this.cx, this.cy);
            ctx.lineTo(x, y);
            ctx.strokeStyle = 'rgba(139, 92, 246, 0.3)';
            ctx.stroke();
            // Axis labels
            const labelR = this.radius + 25;
            const lx = this.cx + Math.cos(angle) * labelR;
            const ly = this.cy + Math.sin(angle) * labelR;
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(d.axis, lx, ly);
        });
        // Draw data polygon with gradient fill
        ctx.beginPath();
        this.data.forEach((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = this.radius * d.value;
            const x = this.cx + Math.cos(angle) * r;
            const y = this.cy + Math.sin(angle) * r;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.closePath();
        const grad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, this.radius);
        grad.addColorStop(0, 'rgba(139, 92, 246, 0.4)');
        grad.addColorStop(1, 'rgba(236, 72, 153, 0.2)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Draw data points with glow
        this.data.forEach((d, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const r = this.radius * d.value;
            const x = this.cx + Math.cos(angle) * r;
            const y = this.cy + Math.sin(angle) * r;
            // Glow
            const glow = ctx.createRadialGradient(x, y, 0, x, y, 15);
            glow.addColorStop(0, 'rgba(236, 72, 153, 0.6)');
            glow.addColorStop(1, 'transparent');
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(x, y, 15, 0, Math.PI * 2);
            ctx.fill();
            // Point
            ctx.beginPath();
            ctx.arc(x, y, 6, 0, Math.PI * 2);
            ctx.fillStyle = '#ec4899';
            ctx.fill();
            ctx.strokeStyle = '#fff';
            ctx.lineWidth = 2;
            ctx.stroke();
            // Value label
            ctx.fillStyle = '#fff';
            ctx.font = 'bold 11px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`${Math.round(d.value * 100)}%`, x, y - 15);
        });
        // Center orb
        const centerGrad = ctx.createRadialGradient(this.cx, this.cy, 0, this.cx, this.cy, 30);
        centerGrad.addColorStop(0, '#8b5cf6');
        centerGrad.addColorStop(0.5, '#6366f1');
        centerGrad.addColorStop(1, 'rgba(99, 102, 241, 0.3)');
        ctx.beginPath();
        ctx.arc(this.cx, this.cy, 25, 0, Math.PI * 2);
        ctx.fillStyle = centerGrad;
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 10px Outfit';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('PROFILE', this.cx, this.cy);
    }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
}
window.RadarViz = RadarViz;
