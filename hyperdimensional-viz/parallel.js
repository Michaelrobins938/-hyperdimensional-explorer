// Parallel Coordinates Visualization
class ParallelViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.points = DATA.generatePoints(300);
        this.axes = ['Product', 'Hour', 'Dim 1', 'Dim 2', 'Dim 3', 'Cluster'];
        this.selectedCluster = 'all';
        this.opacity = 0.3;
        this.resize();
        this.setupControls();
        this.draw();
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.margin = { left: 60, right: 40, top: 40, bottom: 80 };
        this.innerWidth = this.canvas.width - this.margin.left - this.margin.right;
        this.innerHeight = this.canvas.height - this.margin.top - this.margin.bottom;
    }
    setupControls() {
        document.getElementById('cluster-filter')?.addEventListener('change', (e) => {
            this.selectedCluster = e.target.value;
            this.draw();
        });
        document.getElementById('line-opacity')?.addEventListener('input', (e) => {
            this.opacity = parseFloat(e.target.value);
            this.draw();
        });
        window.addEventListener('resize', () => { this.resize(); this.draw(); });
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        const axisSpacing = this.innerWidth / (this.axes.length - 1);
        // Draw axes
        ctx.strokeStyle = 'rgba(255,255,255,0.2)';
        ctx.lineWidth = 1;
        this.axes.forEach((axis, i) => {
            const x = this.margin.left + i * axisSpacing;
            ctx.beginPath();
            ctx.moveTo(x, this.margin.top);
            ctx.lineTo(x, this.margin.top + this.innerHeight);
            ctx.stroke();
            // Axis labels
            ctx.save();
            ctx.translate(x, this.canvas.height - 20);
            ctx.rotate(-Math.PI / 4);
            ctx.fillStyle = '#9ca3af';
            ctx.font = '12px Inter';
            ctx.textAlign = 'right';
            ctx.fillText(axis, 0, 0);
            ctx.restore();
        });
        // Normalize data
        const products = [...new Set(this.points.map(p => p.product))];
        // Draw lines
        this.points.forEach(p => {
            if (this.selectedCluster !== 'all' && p.cluster !== parseInt(this.selectedCluster)) return;
            const values = [
                products.indexOf(p.product) / products.length,
                p.hour / 23,
                p.dim1,
                p.dim2,
                p.dim3,
                p.cluster / 7
            ];
            ctx.beginPath();
            values.forEach((v, i) => {
                const x = this.margin.left + i * axisSpacing;
                const y = this.margin.top + (1 - v) * this.innerHeight;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            const color = DATA.clusterColors[p.cluster];
            ctx.strokeStyle = this.hexToRgba(color, this.opacity);
            ctx.lineWidth = 1.5;
            ctx.stroke();
        });
    }
    hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `rgba(${r},${g},${b},${alpha})`;
    }
}
window.ParallelViz = ParallelViz;
