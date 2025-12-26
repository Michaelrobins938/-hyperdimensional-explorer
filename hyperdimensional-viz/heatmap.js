// Temporal Heatmap Visualization
class HeatmapViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.data = DATA.generateHeatmapData();
        this.resize();
        this.draw();
        window.addEventListener('resize', () => { this.resize(); this.draw(); });
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 400;
        this.margin = { left: 60, right: 80, top: 30, bottom: 50 };
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const innerW = this.canvas.width - this.margin.left - this.margin.right;
        const innerH = this.canvas.height - this.margin.top - this.margin.bottom;
        const cellW = innerW / 24;
        const cellH = innerH / 7;
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        // Draw cells
        this.data.forEach(d => {
            const x = this.margin.left + d.hour * cellW;
            const y = this.margin.top + d.day * cellH;
            const color = this.getHeatColor(d.value);
            ctx.fillStyle = color;
            ctx.fillRect(x + 1, y + 1, cellW - 2, cellH - 2);
        });
        // Day labels
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px Inter';
        ctx.textAlign = 'right';
        days.forEach((day, i) => {
            ctx.fillText(day, this.margin.left - 10, this.margin.top + i * cellH + cellH / 2 + 4);
        });
        // Hour labels
        ctx.textAlign = 'center';
        for (let h = 0; h < 24; h += 2) {
            const x = this.margin.left + h * cellW + cellW;
            ctx.fillText(`${h}h`, x, this.canvas.height - 20);
        }
        // Title
        ctx.font = '14px Outfit';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'left';
        ctx.fillText('Weekly Activity Pattern', this.margin.left, 20);
    }
    getHeatColor(value) {
        const colors = [
            [26, 26, 37],    // 0 - Dark
            [99, 102, 241],  // 0.33 - Indigo
            [139, 92, 246],  // 0.66 - Purple
            [236, 72, 153],  // 0.85 - Pink
            [244, 63, 94]    // 1 - Rose
        ];
        const stops = [0, 0.33, 0.66, 0.85, 1];
        let i = 0;
        while (i < stops.length - 1 && value > stops[i + 1]) i++;
        const t = (value - stops[i]) / (stops[i + 1] - stops[i]);
        const c1 = colors[i], c2 = colors[Math.min(i + 1, colors.length - 1)];
        const r = Math.round(c1[0] + (c2[0] - c1[0]) * t);
        const g = Math.round(c1[1] + (c2[1] - c1[1]) * t);
        const b = Math.round(c1[2] + (c2[2] - c1[2]) * t);
        return `rgb(${r},${g},${b})`;
    }
}
window.HeatmapViz = HeatmapViz;
