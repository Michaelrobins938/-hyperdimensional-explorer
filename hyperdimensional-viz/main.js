// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    // Initialize background
    initBackground();

    // Navigation
    const navBtns = document.querySelectorAll('.nav-btn');
    const sections = document.querySelectorAll('.viz-section');
    let visualizers = {};

    navBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;

            // Update nav
            navBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Update sections
            sections.forEach(s => s.classList.remove('active'));
            document.getElementById(`${view}-view`).classList.add('active');

            // Lazy initialize visualizers
            initVisualizer(view);
        });
    });

    // Initialize default view
    initVisualizer('cosmos');

    function initVisualizer(view) {
        if (visualizers[view]) return;

        switch (view) {
            case 'cosmos':
                visualizers.cosmos = new CosmosViz('cosmos-canvas');
                break;
            case 'parallel':
                visualizers.parallel = new ParallelViz('parallel-canvas');
                break;
            case 'heatmap':
                visualizers.heatmap = new HeatmapViz('heatmap-canvas');
                break;
            case 'network':
                visualizers.network = new NetworkViz('network-canvas');
                break;
            case 'flow':
                visualizers.flow = new FlowViz('flow-canvas');
                break;
            case 'umap':
                visualizers.umap = new UMAPViz('umap-canvas');
                break;
            case 'tree':
                visualizers.tree = new RadialTreeViz('tree-canvas');
                break;
            case 'radar':
                visualizers.radar = new RadarViz('radar-canvas');
                break;
            case 'ridge':
                visualizers.ridge = new RidgeViz('ridge-canvas');
                break;
            case 'chord':
                visualizers.chord = new ChordViz('chord-canvas');
                break;
        }
    }
});

// Animated background with floating particles
function initBackground() {
    const canvas = document.getElementById('bg-canvas');
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Particles
    const particles = [];
    for (let i = 0; i < 60; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (Math.random() - 0.5) * 0.3,
            radius: Math.random() * 2 + 1,
            color: ['#6366f1', '#8b5cf6', '#ec4899', '#06b6d4', '#22c55e'][Math.floor(Math.random() * 5)]
        });
    }

    function animate() {
        ctx.fillStyle = 'rgba(10, 10, 15, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;

            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fillStyle = p.color + '40';
            ctx.fill();
        });

        // Connect nearby particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120) {
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${0.12 * (1 - dist / 120)})`;
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animate);
    }
    animate();
}
