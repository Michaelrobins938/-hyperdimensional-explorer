// Main Application Controller
document.addEventListener('DOMContentLoaded', () => {
    // Initialize quantum background
    initQuantumBackground();

    // Initialize activity stream
    initActivityStream();

    // Navigation
    const navOrbs = document.querySelectorAll('.nav-orb');
    const vizPanels = document.querySelectorAll('.viz-panel');
    let visualizers = {};

    navOrbs.forEach(orb => {
        orb.addEventListener('click', () => {
            const view = orb.dataset.view;

            // Update navigation
            navOrbs.forEach(o => o.classList.remove('active'));
            orb.classList.add('active');

            // Update panels
            vizPanels.forEach(p => p.classList.remove('active'));
            const panel = document.getElementById(`${view}-view`);
            if (panel) {
                panel.classList.add('active');
            }

            // Lazy initialize visualizers
            initVisualizer(view);
        });
    });

    // Initialize default view
    initVisualizer('tesseract');

    function initVisualizer(view) {
        if (visualizers[view]) return;

        try {
            switch (view) {
                case 'tesseract':
                    if (typeof TesseractViz !== 'undefined') {
                        visualizers.tesseract = new TesseractViz('tesseract-canvas');
                    }
                    break;
                case 'quantum':
                    if (typeof QuantumViz !== 'undefined') {
                        visualizers.quantum = new QuantumViz('quantum-canvas');
                    }
                    break;
                case 'galaxy':
                    if (typeof GalaxyViz !== 'undefined') {
                        visualizers.galaxy = new GalaxyViz('galaxy-canvas');
                    }
                    break;
                case 'atomic':
                    if (typeof AtomicViz !== 'undefined') {
                        visualizers.atomic = new AtomicViz('atomic-canvas');
                    }
                    break;
                case 'neural':
                    if (typeof NeuralViz !== 'undefined') {
                        visualizers.neural = new NeuralViz('neural-canvas');
                    }
                    break;
                case 'spectral':
                    if (typeof SpectralViz !== 'undefined') {
                        visualizers.spectral = new SpectralViz('spectral-canvas');
                    }
                    break;
                case 'waveform':
                    if (typeof WaveformViz !== 'undefined') {
                        visualizers.waveform = new WaveformViz('waveform-canvas');
                    }
                    break;
                case 'manifold':
                    if (typeof ManifoldViz !== 'undefined') {
                        visualizers.manifold = new ManifoldViz('manifold-canvas');
                    }
                    break;
            }
        } catch (e) {
            console.error(`Failed to initialize ${view} visualizer:`, e);
        }
    }
});

// Quantum-style animated background
function initQuantumBackground() {
    const canvas = document.getElementById('quantum-bg');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    // Create particle field
    const particles = [];
    const particleCount = 80;

    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            radius: Math.random() * 2 + 0.5,
            color: [
                'rgba(99, 102, 241, 0.6)',
                'rgba(139, 92, 246, 0.6)',
                'rgba(236, 72, 153, 0.6)',
                'rgba(6, 182, 212, 0.6)',
                'rgba(16, 185, 129, 0.6)'
            ][Math.floor(Math.random() * 5)],
            phase: Math.random() * Math.PI * 2
        });
    }

    let time = 0;

    function animate() {
        // Trail effect
        ctx.fillStyle = 'rgba(3, 3, 8, 0.08)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(p => {
            // Gentle wave motion
            p.x += p.vx + Math.sin(time * 0.001 + p.phase) * 0.1;
            p.y += p.vy + Math.cos(time * 0.001 + p.phase) * 0.1;

            // Wrap around
            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            // Draw particle
            const pulse = 0.5 + Math.sin(time * 0.002 + p.phase) * 0.5;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.radius * (0.8 + pulse * 0.4), 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.fill();
        });

        // Draw connections
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < 150) {
                    const alpha = (1 - dist / 150) * 0.15;

                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
                    ctx.lineWidth = 0.5;
                    ctx.stroke();
                }
            }
        }

        time++;
        requestAnimationFrame(animate);
    }

    animate();
}

// Simulated activity stream
function initActivityStream() {
    const container = document.getElementById('activity-stream');
    if (!container) return;

    const activities = [
        { product: 'YouTube', action: 'watched', color: '#ef4444' },
        { product: 'Search', action: 'searched', color: '#3b82f6' },
        { product: 'Chrome', action: 'visited', color: '#f59e0b' },
        { product: 'Shopify', action: 'visited', color: '#10b981' },
        { product: 'YouTube', action: 'watched', color: '#ef4444' },
        { product: 'Assistant', action: 'used', color: '#06b6d4' },
        { product: 'YouTube', action: 'watched', color: '#ef4444' }
    ];

    function addActivity() {
        const activity = activities[Math.floor(Math.random() * activities.length)];
        const hour = Math.floor(Math.random() * 24);
        const minute = Math.floor(Math.random() * 60);

        const item = document.createElement('div');
        item.className = 'stream-item';
        item.innerHTML = `
            <div class="stream-dot" style="background: ${activity.color}"></div>
            <span class="stream-text">${activity.action} ${activity.product}</span>
            <span class="stream-time">${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}</span>
        `;

        container.insertBefore(item, container.firstChild);

        // Limit items
        while (container.children.length > 8) {
            container.removeChild(container.lastChild);
        }
    }

    // Initial items
    for (let i = 0; i < 5; i++) {
        addActivity();
    }

    // Add new items periodically
    setInterval(addActivity, 3000);
}

// Add bar animation on load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        document.querySelectorAll('.bar-fill').forEach(bar => {
            bar.style.transform = 'scaleX(1)';
        });
    }, 500);
});
