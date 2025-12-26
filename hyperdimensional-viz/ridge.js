// Ridge Plot - 3D Stacked Temporal Distributions
class RidgeViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = this.generateData();
        this.animOffset = 0;
        this.resize();
        this.animate();
        window.addEventListener('resize', () => this.resize());
    }
    generateData() {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return days.map((day, di) => ({
            label: day,
            values: DATA.hourlyActivity.map(h => {
                let v = h.count / 350;
                if ((di === 0 || di === 6) && (h.hour >= 20 || h.hour <= 2)) v *= 1.3;
                if (di >= 1 && di <= 5 && h.hour >= 9 && h.hour <= 17) v *= 0.7;
                return Math.min(1, v * (0.85 + Math.random() * 0.3));
            })
        }));
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 480;
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.animOffset += 0.02;
        const margin = { left: 100, right: 40, top: 40, bottom: 60 };
        const w = this.canvas.width - margin.left - margin.right;
        const h = this.canvas.height - margin.top - margin.bottom;
        const rowHeight = h / this.data.length;
        const amplitude = rowHeight * 0.8;
        // Draw each ridge
        this.data.forEach((row, ri) => {
            const baseY = margin.top + ri * rowHeight + rowHeight * 0.9;
            // Create gradient for this row
            const grad = ctx.createLinearGradient(margin.left, baseY - amplitude, margin.left, baseY);
            const hue = 250 + ri * 15;
            grad.addColorStop(0, `hsla(${hue}, 70%, 60%, 0.9)`);
            grad.addColorStop(1, `hsla(${hue}, 70%, 40%, 0.1)`);
            // Draw filled area
            ctx.beginPath();
            ctx.moveTo(margin.left, baseY);
            row.values.forEach((v, i) => {
                const x = margin.left + (i / (row.values.length - 1)) * w;
                const wave = Math.sin(this.animOffset + i * 0.3 + ri) * 2;
                const y = baseY - v * amplitude + wave;
                if (i === 0) ctx.lineTo(x, y);
                else {
                    const px = margin.left + ((i - 1) / (row.values.length - 1)) * w;
                    const py = baseY - row.values[i - 1] * amplitude + Math.sin(this.animOffset + (i - 1) * 0.3 + ri) * 2;
                    const cpx = (px + x) / 2;
                    ctx.quadraticCurveTo(px, py, cpx, (py + y) / 2);
                }
            });
            ctx.lineTo(margin.left + w, baseY);
            ctx.closePath();
            ctx.fillStyle = grad;
            ctx.fill();
            // Draw line on top
            ctx.beginPath();
            row.values.forEach((v, i) => {
                const x = margin.left + (i / (row.values.length - 1)) * w;
                const wave = Math.sin(this.animOffset + i * 0.3 + ri) * 2;
                const y = baseY - v * amplitude + wave;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.strokeStyle = `hsla(${250 + ri * 15}, 80%, 70%, 0.9)`;
            ctx.lineWidth = 2;
            ctx.stroke();
            // Row label
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Outfit';
            ctx.textAlign = 'right';
            ctx.fillText(row.label, margin.left - 15, baseY - rowHeight * 0.3);
        });
        // X-axis labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '10px Inter';
        ctx.textAlign = 'center';
        for (let i = 0; i < 24; i += 4) {
            const x = margin.left + (i / 23) * w;
            ctx.fillText(`${i}:00`, x, this.canvas.height - 30);
        }
        // Title
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 14px Outfit';
        ctx.textAlign = 'left';
        ctx.fillText('Weekly Activity Ridge Plot', margin.left, 25);
    }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
}
window.RidgeViz = RidgeViz;
