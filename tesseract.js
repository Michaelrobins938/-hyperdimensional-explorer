// 4D Tesseract Cluster Projection Visualization
class TesseractViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        // State
        this.rotating = true;
        this.exploded = false;
        this.angle4D = Math.PI / 4;
        this.rotationX = 0;
        this.rotationY = 0;
        this.rotationZ = 0;
        this.time = 0;

        // 4D Tesseract vertices (16 vertices of a hypercube)
        this.vertices4D = this.generateTesseractVertices();

        // Generate cluster particles
        this.particles = this.generateClusterParticles();

        // Edge connections for tesseract
        this.edges = this.generateTesseractEdges();

        // Setup controls
        this.setupControls();

        // Start animation
        this.animate();

        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
        this.centerX = this.canvas.width / 2;
        this.centerY = this.canvas.height / 2;
        this.scale = Math.min(this.canvas.width, this.canvas.height) * 0.25;
    }

    generateTesseractVertices() {
        const vertices = [];
        // Generate all 16 vertices of a 4D hypercube
        for (let i = 0; i < 16; i++) {
            vertices.push([
                (i & 1) ? 1 : -1,
                (i & 2) ? 1 : -1,
                (i & 4) ? 1 : -1,
                (i & 8) ? 1 : -1
            ]);
        }
        return vertices;
    }

    generateTesseractEdges() {
        const edges = [];
        // Connect vertices that differ in exactly one coordinate
        for (let i = 0; i < 16; i++) {
            for (let j = i + 1; j < 16; j++) {
                let diff = 0;
                for (let k = 0; k < 4; k++) {
                    if (this.vertices4D[i][k] !== this.vertices4D[j][k]) diff++;
                }
                if (diff === 1) {
                    edges.push([i, j]);
                }
            }
        }
        return edges;
    }

    generateClusterParticles() {
        const particles = [];

        DATA.clusters.forEach((cluster, clusterIdx) => {
            const count = Math.min(cluster.size, 200); // Cap for performance
            const scaleFactor = cluster.size / DATA.clusters[0].size;

            for (let i = 0; i < count; i++) {
                // Position particles around tesseract vertices based on cluster
                const vertexIdx = clusterIdx % 8;
                const baseVertex = this.vertices4D[vertexIdx];

                // Add some randomness
                const spread = 0.3 + Math.random() * 0.2;
                particles.push({
                    cluster: clusterIdx,
                    x: baseVertex[0] + (Math.random() - 0.5) * spread,
                    y: baseVertex[1] + (Math.random() - 0.5) * spread,
                    z: baseVertex[2] + (Math.random() - 0.5) * spread,
                    w: baseVertex[3] + (Math.random() - 0.5) * spread,
                    size: 1 + Math.random() * 2,
                    speed: 0.5 + Math.random() * 0.5,
                    phase: Math.random() * Math.PI * 2
                });
            }
        });

        return particles;
    }

    setupControls() {
        const rotateBtn = document.getElementById('tesseract-rotate');
        const explodeBtn = document.getElementById('tesseract-explode');
        const angleSlider = document.getElementById('tesseract-angle');

        if (rotateBtn) {
            rotateBtn.addEventListener('click', () => {
                this.rotating = !this.rotating;
                rotateBtn.classList.toggle('active', this.rotating);
            });
        }

        if (explodeBtn) {
            explodeBtn.addEventListener('click', () => {
                this.exploded = !this.exploded;
                explodeBtn.classList.toggle('active', this.exploded);
            });
        }

        if (angleSlider) {
            angleSlider.addEventListener('input', (e) => {
                this.angle4D = (e.target.value / 180) * Math.PI;
            });
        }
    }

    // 4D to 3D projection (stereographic)
    project4Dto3D(x, y, z, w) {
        const distance = 2;
        const factor = 1 / (distance - w);
        return {
            x: x * factor,
            y: y * factor,
            z: z * factor
        };
    }

    // 3D to 2D projection
    project3Dto2D(x, y, z) {
        // Apply rotations
        let rx = this.rotationX;
        let ry = this.rotationY;
        let rz = this.rotationZ;

        // Rotate around X
        let y1 = y * Math.cos(rx) - z * Math.sin(rx);
        let z1 = y * Math.sin(rx) + z * Math.cos(rx);

        // Rotate around Y
        let x2 = x * Math.cos(ry) + z1 * Math.sin(ry);
        let z2 = -x * Math.sin(ry) + z1 * Math.cos(ry);

        // Rotate around Z
        let x3 = x2 * Math.cos(rz) - y1 * Math.sin(rz);
        let y3 = x2 * Math.sin(rz) + y1 * Math.cos(rz);

        // Perspective projection
        const perspective = 3;
        const factor = perspective / (perspective + z2);

        return {
            x: this.centerX + x3 * this.scale * factor,
            y: this.centerY + y3 * this.scale * factor,
            z: z2,
            factor: factor
        };
    }

    // Rotate a 4D point
    rotate4D(point, angle) {
        // Rotation in the XW plane
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        return [
            point[0] * cos - point[3] * sin,
            point[1],
            point[2],
            point[0] * sin + point[3] * cos
        ];
    }

    drawBackground() {
        // Create radial gradient
        const gradient = this.ctx.createRadialGradient(
            this.centerX, this.centerY, 0,
            this.centerX, this.centerY, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, 'rgba(99, 102, 241, 0.05)');
        gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.02)');
        gradient.addColorStop(1, 'rgba(3, 3, 8, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    drawTesseractEdges() {
        // Project and draw edges
        const projected = this.vertices4D.map(v => {
            const rotated = this.rotate4D(v, this.angle4D + this.time * 0.3);
            const v3D = this.project4Dto3D(...rotated);
            return this.project3Dto2D(v3D.x, v3D.y, v3D.z);
        });

        // Sort edges by depth for proper rendering
        const sortedEdges = [...this.edges].sort((a, b) => {
            const zA = (projected[a[0]].z + projected[a[1]].z) / 2;
            const zB = (projected[b[0]].z + projected[b[1]].z) / 2;
            return zA - zB;
        });

        sortedEdges.forEach(([i, j]) => {
            const p1 = projected[i];
            const p2 = projected[j];
            const avgZ = (p1.z + p2.z) / 2;
            const alpha = 0.1 + (avgZ + 2) * 0.15;

            this.ctx.beginPath();
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
            this.ctx.strokeStyle = `rgba(139, 92, 246, ${Math.max(0.05, alpha)})`;
            this.ctx.lineWidth = 1 + p1.factor * 0.5;
            this.ctx.stroke();
        });

        // Draw vertices
        projected.forEach((p, i) => {
            const size = 3 + p.factor * 2;
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
            gradient.addColorStop(0.5, 'rgba(139, 92, 246, 0.4)');
            gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
        });
    }

    drawParticles() {
        const explodeFactor = this.exploded ? 2 : 1;

        // Sort particles by depth
        const projectedParticles = this.particles.map((p, i) => {
            const oscillation = Math.sin(this.time * p.speed + p.phase) * 0.1;
            const rotated = this.rotate4D(
                [p.x + oscillation, p.y + oscillation, p.z, p.w],
                this.angle4D + this.time * 0.3
            );

            // Apply explosion
            const v3D = this.project4Dto3D(
                rotated[0] * explodeFactor,
                rotated[1] * explodeFactor,
                rotated[2] * explodeFactor,
                rotated[3]
            );
            const projected = this.project3Dto2D(v3D.x, v3D.y, v3D.z);

            return {
                ...projected,
                cluster: p.cluster,
                size: p.size,
                originalIdx: i
            };
        });

        // Sort by z for depth
        projectedParticles.sort((a, b) => a.z - b.z);

        // Draw particles
        projectedParticles.forEach(p => {
            const color = CLUSTER_COLORS[p.cluster] || '#8b5cf6';
            const size = Math.max(1, Math.abs(p.size * (p.factor || 1)));
            const alpha = Math.min(1, Math.max(0.1, 0.3 + (p.factor || 0) * 0.4));

            // Glow - ensure radius is always positive
            const glowRadius = Math.max(2, size * 3);
            const gradient = this.ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, glowRadius);
            gradient.addColorStop(0, color);
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size * 3, 0, Math.PI * 2);
            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = alpha * 0.3;
            this.ctx.fill();

            // Core
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
            this.ctx.fillStyle = color;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();

            this.ctx.globalAlpha = 1;
        });
    }

    animate() {
        // Clear
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw background
        this.drawBackground();

        // Update rotations
        if (this.rotating) {
            this.rotationX += 0.003;
            this.rotationY += 0.005;
            this.rotationZ += 0.002;
        }
        this.time += 0.02;

        // Draw tesseract structure
        this.drawTesseractEdges();

        // Draw cluster particles
        this.drawParticles();

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize when DOM is ready
window.TesseractViz = TesseractViz;
