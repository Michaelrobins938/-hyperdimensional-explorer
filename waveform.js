// Temporal Waveform Visualization
class WaveformViz {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.resize();

        this.time = 0;
        this.waveData = this.processWaveData();

        this.animate();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width - 48;
        this.canvas.height = 450;
    }

    processWaveData() {
        const maxCount = DATA.summary.maxEventsPerHour;
        return DATA.hourlyActivity.map(hour => ({
            hour: hour.hour,
            count: hour.count,
            normalized: hour.count / maxCount, // Normalize to actual max
            label: hour.label
        }));
    }

    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, 'rgba(5, 5, 15, 1)');
        gradient.addColorStop(1, 'rgba(10, 5, 20, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Grid lines
        this.ctx.strokeStyle = 'rgba(139, 92, 246, 0.1)';
        this.ctx.lineWidth = 1;

        for (let i = 0; i <= 24; i++) {
            const x = (i / 24) * this.canvas.width;
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.canvas.height);
            this.ctx.stroke();
        }

        for (let i = 0; i <= 4; i++) {
            const y = (i / 4) * this.canvas.height;
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.canvas.width, y);
            this.ctx.stroke();
        }
    }

    drawRidgePlot() {
        const layers = 6;
        const layerHeight = this.canvas.height * 0.6;
        const baseY = this.canvas.height * 0.8;

        for (let layer = layers - 1; layer >= 0; layer--) {
            const offset = layer * 30;
            const alpha = 0.3 + (layers - layer) * 0.1;
            const color = CLUSTER_COLORS[layer % 8];

            // Create path
            this.ctx.beginPath();

            const startX = 0;
            const startY = baseY - offset;
            this.ctx.moveTo(startX, startY);

            // Draw wave
            for (let i = 0; i < this.waveData.length; i++) {
                const x = (i / (this.waveData.length - 1)) * this.canvas.width;

                // Apply time-based animation
                const animatedHeight = this.waveData[i].normalized * layerHeight;
                const wave = Math.sin(this.time * 2 + i * 0.3 + layer * 0.5) * 10;
                const y = baseY - offset - animatedHeight - wave;

                if (i === 0) {
                    this.ctx.lineTo(x, y);
                } else {
                    const prevX = ((i - 1) / (this.waveData.length - 1)) * this.canvas.width;
                    const cpX = (prevX + x) / 2;
                    this.ctx.quadraticCurveTo(prevX, baseY - offset - this.waveData[i - 1].normalized * layerHeight - Math.sin(this.time * 2 + (i - 1) * 0.3 + layer * 0.5) * 10, cpX, y);
                }
            }

            // Close path
            this.ctx.lineTo(this.canvas.width, baseY - offset);
            this.ctx.lineTo(0, baseY - offset);
            this.ctx.closePath();

            // Fill gradient
            const gradient = this.ctx.createLinearGradient(0, baseY - offset - layerHeight, 0, baseY - offset);
            gradient.addColorStop(0, color);
            gradient.addColorStop(0.5, color + '60');
            gradient.addColorStop(1, color + '20');

            this.ctx.fillStyle = gradient;
            this.ctx.globalAlpha = alpha;
            this.ctx.fill();

            // Stroke
            this.ctx.strokeStyle = color;
            this.ctx.lineWidth = 2;
            this.ctx.globalAlpha = alpha + 0.3;
            this.ctx.stroke();

            this.ctx.globalAlpha = 1;
        }
    }

    drawInterferenceBands() {
        // Draw interference patterns between layers
        const bandCount = 20;

        for (let band = 0; band < bandCount; band++) {
            const y = (band / bandCount) * this.canvas.height;
            const alpha = 0.02 + Math.sin(this.time + band * 0.3) * 0.01;

            this.ctx.beginPath();
            this.ctx.moveTo(0, y);

            for (let x = 0; x <= this.canvas.width; x += 5) {
                const wave = Math.sin(x * 0.02 + this.time + band * 0.2) * 5;
                this.ctx.lineTo(x, y + wave);
            }

            this.ctx.strokeStyle = `rgba(139, 92, 246, ${alpha})`;
            this.ctx.lineWidth = 1;
            this.ctx.stroke();
        }
    }

    drawTimeLabels() {
        this.ctx.font = '10px JetBrains Mono';
        this.ctx.fillStyle = '#64748b';
        this.ctx.textAlign = 'center';

        for (let i = 0; i < 24; i += 3) {
            const x = (i / 23) * this.canvas.width;
            this.ctx.fillText(`${i.toString().padStart(2, '0')}:00`, x, this.canvas.height - 10);
        }

        // Peak indicator
        const peakX = (DATA.summary.peakHour / 23) * this.canvas.width;

        this.ctx.beginPath();
        this.ctx.arc(peakX, this.canvas.height - 30, 5, 0, Math.PI * 2);
        this.ctx.fillStyle = '#ec4899';
        this.ctx.fill();

        this.ctx.font = '9px Space Grotesk';
        this.ctx.fillStyle = '#ec4899';
        this.ctx.fillText('PEAK', peakX, this.canvas.height - 40);
    }

    drawPeakMarkers() {
        // Highlight peak hours
        const peaks = [16, 19, 22, 23];

        peaks.forEach(hour => {
            const x = (hour / 23) * this.canvas.width;
            const activity = this.waveData[hour];
            const height = activity.normalized * this.canvas.height * 0.5;

            // Vertical beam
            const gradient = this.ctx.createLinearGradient(x, this.canvas.height * 0.8 - height, x, this.canvas.height * 0.8);
            gradient.addColorStop(0, '#ec489960');
            gradient.addColorStop(1, 'transparent');

            this.ctx.beginPath();
            this.ctx.moveTo(x, this.canvas.height * 0.8 - height);
            this.ctx.lineTo(x, this.canvas.height * 0.8);
            this.ctx.strokeStyle = gradient;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.drawBackground();
        this.drawInterferenceBands();
        this.drawRidgePlot();
        this.drawPeakMarkers();
        this.drawTimeLabels();

        this.time += 0.02;

        requestAnimationFrame(() => this.animate());
    }
}

window.WaveformViz = WaveformViz;
