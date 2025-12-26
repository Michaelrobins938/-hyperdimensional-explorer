// Radial Tree Visualization - Hierarchical Activity Structure
class RadialTreeViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.tree = this.buildTree();
        this.rotation = 0;
        this.autoRotate = true;
        this.hoveredNode = null;
        this.resize();
        this.setupControls();
        this.animate();
    }
    buildTree() {
        return {
            id: 'root', name: 'Activity', value: 5929, depth: 0, angle: 0, children: [
                {
                    id: 'youtube', name: 'YouTube', value: 4336, color: '#ff0000', depth: 1, children: [
                        { id: 'yt-core', name: 'Core', value: 4041, depth: 2, color: '#6366f1' },
                        { id: 'yt-deep', name: 'Deep', value: 171, depth: 2, color: '#8b5cf6' },
                        { id: 'yt-alt', name: 'Alt', value: 63, depth: 2, color: '#ec4899' },
                        { id: 'yt-late', name: 'Late Night', value: 61, depth: 2, color: '#f43f5e' }
                    ]
                },
                {
                    id: 'search', name: 'Search', value: 1334, color: '#4285f4', depth: 1, children: [
                        { id: 'search-focus', name: 'Focus', value: 800, depth: 2, color: '#3b82f6' },
                        { id: 'search-browse', name: 'Browse', value: 534, depth: 2, color: '#06b6d4' }
                    ]
                },
                {
                    id: 'tools', name: 'AI Tools', value: 158, color: '#9c27b0', depth: 1, children: [
                        { id: 'openrouter', name: 'OpenRouter', value: 104, depth: 2, color: '#8b5cf6' },
                        { id: 'assistant', name: 'Assistant', value: 54, depth: 2, color: '#a855f7' }
                    ]
                },
                {
                    id: 'ecommerce', name: 'E-commerce', value: 177, color: '#22c55e', depth: 1, children: [
                        { id: 'shopify', name: 'Shopify', value: 114, depth: 2, color: '#22c55e' },
                        { id: 'printify', name: 'Printify', value: 63, depth: 2, color: '#10b981' }
                    ]
                }
            ]
        };
    }
    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.cx = this.canvas.width / 2;
        this.cy = this.canvas.height / 2;
    }
    setupControls() {
        document.getElementById('tree-rotate')?.addEventListener('click', (e) => {
            this.autoRotate = !this.autoRotate;
            e.target.classList.toggle('active', this.autoRotate);
        });
        this.canvas.addEventListener('mousemove', (e) => this.handleHover(e));
        this.canvas.addEventListener('mouseleave', () => { this.hoveredNode = null; });
        window.addEventListener('resize', () => this.resize());
    }
    handleHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const mx = e.clientX - rect.left, my = e.clientY - rect.top;
        this.hoveredNode = null;
        this.forEachNode(this.tree, (node, x, y, r) => {
            if (Math.hypot(x - mx, y - my) < r + 5) this.hoveredNode = node;
        });
    }
    forEachNode(node, callback, parentAngle = 0, angleSpan = Math.PI * 2, depth = 0) {
        const radius = depth === 0 ? 0 : (depth === 1 ? 100 : 180);
        const angle = parentAngle + this.rotation;
        const x = this.cx + Math.cos(angle) * radius;
        const y = this.cy + Math.sin(angle) * radius;
        const r = depth === 0 ? 35 : (depth === 1 ? 25 : 15);
        callback(node, x, y, r, angle, depth);
        if (node.children) {
            const childSpan = angleSpan / node.children.length;
            node.children.forEach((child, i) => {
                const childAngle = parentAngle - angleSpan / 2 + childSpan * (i + 0.5);
                this.forEachNode(child, callback, childAngle, childSpan * 0.8, depth + 1);
            });
        }
    }
    draw() {
        const ctx = this.ctx;
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.autoRotate) this.rotation += 0.003;
        // Draw orbital rings
        [100, 180].forEach(r => {
            ctx.beginPath();
            ctx.arc(this.cx, this.cy, r, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(99, 102, 241, 0.15)';
            ctx.lineWidth = 1;
            ctx.stroke();
        });
        // Draw connections first
        this.forEachNode(this.tree, (node, x, y, r, angle, depth) => {
            if (node.children) {
                node.children.forEach((child, i) => {
                    const childRadius = depth === 0 ? 100 : 180;
                    const childSpan = (Math.PI * 2) / (depth === 0 ? node.children.length : node.children.length);
                    const childAngle = (depth === 0 ? -Math.PI / 2 : angle - (Math.PI * 2 / node.children.length) / 2) + childSpan * (i + 0.5) + this.rotation;
                    const cx = this.cx + Math.cos(childAngle) * childRadius;
                    const cy = this.cy + Math.sin(childAngle) * childRadius;
                    // Curved connection
                    ctx.beginPath();
                    ctx.moveTo(x, y);
                    const midX = (x + cx) / 2, midY = (y + cy) / 2;
                    const cpX = midX + (cy - y) * 0.2, cpY = midY - (cx - x) * 0.2;
                    ctx.quadraticCurveTo(cpX, cpY, cx, cy);
                    const isHovered = this.hoveredNode === node || this.hoveredNode === child;
                    ctx.strokeStyle = isHovered ? 'rgba(139, 92, 246, 0.8)' : 'rgba(139, 92, 246, 0.3)';
                    ctx.lineWidth = isHovered ? 2 : 1;
                    ctx.stroke();
                });
            }
        });
        // Draw nodes
        const drawn = new Set();
        this.forEachNode(this.tree, (node, x, y, r, angle, depth) => {
            if (drawn.has(node.id)) return;
            drawn.add(node.id);
            const isHovered = this.hoveredNode === node;
            // Glow
            if (isHovered) {
                const grad = ctx.createRadialGradient(x, y, 0, x, y, r * 2.5);
                grad.addColorStop(0, (node.color || '#8b5cf6') + '66');
                grad.addColorStop(1, 'transparent');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(x, y, r * 2.5, 0, Math.PI * 2);
                ctx.fill();
            }
            // Node
            const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 0, x, y, r);
            grad.addColorStop(0, this.lighten(node.color || '#8b5cf6', 30));
            grad.addColorStop(1, node.color || '#8b5cf6');
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fillStyle = grad;
            ctx.fill();
            ctx.strokeStyle = isHovered ? '#fff' : 'rgba(255,255,255,0.3)';
            ctx.lineWidth = isHovered ? 2 : 1;
            ctx.stroke();
            // Label
            ctx.fillStyle = '#fff';
            ctx.font = depth === 0 ? 'bold 14px Outfit' : (depth === 1 ? '12px Outfit' : '10px Inter');
            ctx.textAlign = 'center';
            ctx.fillText(node.name, x, y + r + 16);
            if (depth > 0) {
                ctx.fillStyle = '#9ca3af';
                ctx.font = '9px Inter';
                ctx.fillText(node.value.toLocaleString(), x, y + r + 28);
            }
        });
    }
    lighten(hex, amt) {
        let r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
        r = Math.min(255, r + amt); g = Math.min(255, g + amt); b = Math.min(255, b + amt);
        return `rgb(${r},${g},${b})`;
    }
    animate() { this.draw(); requestAnimationFrame(() => this.animate()); }
}
window.RadialTreeViz = RadialTreeViz;
