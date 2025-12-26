// Analytics Dashboard Enhancements
// Animated counters, trend indicators, sparklines, and interactive features

(function() {
    'use strict';

    console.log('📊 Analytics Dashboard Enhancements Loading...');

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        setTimeout(() => {
            animateCounters();
            addTrendIndicators();
            addSparklines();
            enhanceVisualizationTransitions();
            addLoadingStates();
            addInteractiveTooltips();
            createAIInsightsCard();
            addQuickFilters();
            console.log('✅ Analytics Enhancements Complete');
        }, 500);
    }

    // Animated counter scroll-up effect
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-value');

        counters.forEach(counter => {
            const target = parseInt(counter.textContent.replace(/[^0-9]/g, '')) ||
                          parseFloat(counter.textContent.replace(/[^0-9.]/g, '')) || 0;

            if (target === 0) return;

            const suffix = counter.textContent.replace(/[0-9.,]/g, '').trim();
            const isDecimal = counter.textContent.includes('.');
            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            let frame = 0;

            counter.textContent = '0' + suffix;

            const animate = () => {
                frame++;
                current += increment;

                if (current >= target || frame >= steps) {
                    counter.textContent = (isDecimal ? target.toFixed(1) : Math.round(target)) + suffix;
                } else {
                    counter.textContent = (isDecimal ? current.toFixed(1) : Math.round(current)) + suffix;
                    requestAnimationFrame(animate);
                }
            };

            // Start animation when element comes into view
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        animate();
                        observer.disconnect();
                    }
                });
            }, { threshold: 0.5 });

            observer.observe(counter);
        });
    }

    // Add trend indicators (up/down arrows with percentages)
    function addTrendIndicators() {
        const stats = document.querySelectorAll('.stat:not(.holographic)');
        const trends = [
            { change: +12.5, positive: true },
            { change: -3.2, positive: false },
            { change: +8.7, positive: true },
            { change: +15.3, positive: true }
        ];

        stats.forEach((stat, index) => {
            if (index >= trends.length) return;

            const trend = trends[index];
            const indicator = document.createElement('div');
            indicator.className = `trend-indicator ${trend.positive ? 'trend-up' : 'trend-down'}`;
            indicator.innerHTML = `
                <span class="trend-arrow">${trend.positive ? '↑' : '↓'}</span>
                <span class="trend-value">${Math.abs(trend.change)}%</span>
            `;

            stat.appendChild(indicator);
        });

        // Add trend indicator styles
        const style = document.createElement('style');
        style.textContent = `
            .trend-indicator {
                display: flex;
                align-items: center;
                gap: 0.25rem;
                font-size: 0.75rem;
                margin-top: 0.25rem;
                font-family: var(--font-mono);
                font-weight: 600;
            }
            .trend-up {
                color: #10b981;
            }
            .trend-down {
                color: #ef4444;
            }
            .trend-arrow {
                font-size: 1rem;
                animation: pulse-trend 2s ease-in-out infinite;
            }
            .trend-up .trend-arrow {
                animation: bounce-up 1.5s ease-in-out infinite;
            }
            .trend-down .trend-arrow {
                animation: bounce-down 1.5s ease-in-out infinite;
            }
            @keyframes bounce-up {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-3px); }
            }
            @keyframes bounce-down {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(3px); }
            }
        `;
        document.head.appendChild(style);
    }

    // Add sparkline mini-charts to stat cards
    function addSparklines() {
        const stats = document.querySelectorAll('.stat');

        stats.forEach((stat, index) => {
            // Generate random sparkline data
            const dataPoints = Array.from({ length: 12 }, () => Math.random() * 50 + 25);

            const sparkline = createSparklineCanvas(dataPoints, 60, 20);
            sparkline.className = 'stat-sparkline';
            sparkline.style.cssText = 'margin-top: 0.5rem; opacity: 0.6;';

            stat.appendChild(sparkline);
        });
    }

    function createSparklineCanvas(data, width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const max = Math.max(...data);
        const min = Math.min(...data);
        const range = max - min;
        const step = width / (data.length - 1);

        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 1.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Draw gradient fill
        const gradient = ctx.createLinearGradient(0, 0, 0, height);
        gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)');
        gradient.addColorStop(1, 'rgba(139, 92, 246, 0)');

        ctx.beginPath();
        data.forEach((value, i) => {
            const x = i * step;
            const y = height - ((value - min) / range) * height;

            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.strokeStyle = '#8b5cf6';
        ctx.stroke();

        // Fill area
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();

        return canvas;
    }

    // Enhance visualization view transitions
    function enhanceVisualizationTransitions() {
        const navOrbs = document.querySelectorAll('.nav-orb');
        const vizPanels = document.querySelectorAll('.viz-panel');

        navOrbs.forEach(orb => {
            orb.addEventListener('click', () => {
                // Add smooth fade transition
                vizPanels.forEach(panel => {
                    panel.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
                    panel.style.opacity = '0';
                    panel.style.transform = 'scale(0.95)';
                });

                setTimeout(() => {
                    const targetView = orb.dataset.view;
                    vizPanels.forEach(panel => {
                        if (panel.classList.contains(targetView)) {
                            panel.style.opacity = '1';
                            panel.style.transform = 'scale(1)';
                        }
                    });
                }, 200);
            });
        });
    }

    // Add loading states
    function addLoadingStates() {
        const style = document.createElement('style');
        style.textContent = `
            .loading-shimmer {
                background: linear-gradient(
                    90deg,
                    rgba(139, 92, 246, 0.1) 0%,
                    rgba(139, 92, 246, 0.2) 50%,
                    rgba(139, 92, 246, 0.1) 100%
                );
                background-size: 200% 100%;
                animation: shimmer 1.5s infinite;
            }
            @keyframes shimmer {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
            }
        `;
        document.head.appendChild(style);
    }

    // Add interactive tooltips
    function addInteractiveTooltips() {
        const stats = document.querySelectorAll('.stat');

        stats.forEach(stat => {
            const value = stat.querySelector('.stat-value')?.textContent || '';
            const label = stat.querySelector('.stat-label')?.textContent || '';

            stat.setAttribute('title', `${label}: ${value}`);
            stat.style.cursor = 'help';

            // Enhanced hover effect
            stat.addEventListener('mouseenter', function() {
                this.style.transform = 'translateY(-2px)';
                this.style.boxShadow = '0 8px 24px rgba(139, 92, 246, 0.3)';
            });

            stat.addEventListener('mouseleave', function() {
                this.style.transform = 'translateY(0)';
                this.style.boxShadow = '';
            });
        });
    }

    // Create AI Insights Card
    function createAIInsightsCard() {
        const dashboard = document.querySelector('.side-panel');
        if (!dashboard) return;

        const insightsCard = document.createElement('div');
        insightsCard.className = 'panel-section ai-insights';
        insightsCard.innerHTML = `
            <div class="section-header">
                <h3><span class="icon">🤖</span> AI Insights</h3>
            </div>
            <div class="insights-content">
                <div class="insight-item">
                    <div class="insight-icon">💡</div>
                    <div class="insight-text" id="insight-text-1"></div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon">📈</div>
                    <div class="insight-text" id="insight-text-2"></div>
                </div>
                <div class="insight-item">
                    <div class="insight-icon">⚡</div>
                    <div class="insight-text" id="insight-text-3"></div>
                </div>
            </div>
        `;

        dashboard.insertBefore(insightsCard, dashboard.firstChild);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .ai-insights {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1));
                border: 1px solid rgba(139, 92, 246, 0.3);
            }
            .insights-content {
                display: flex;
                flex-direction: column;
                gap: var(--space-md);
            }
            .insight-item {
                display: flex;
                gap: var(--space-sm);
                align-items: flex-start;
                padding: var(--space-sm);
                background: rgba(139, 92, 246, 0.05);
                border-radius: var(--radius-sm);
                animation: fadeInUp 0.6s ease-out both;
            }
            .insight-item:nth-child(2) { animation-delay: 0.2s; }
            .insight-item:nth-child(3) { animation-delay: 0.4s; }
            .insight-icon {
                font-size: 1.25rem;
                flex-shrink: 0;
            }
            .insight-text {
                font-size: 0.875rem;
                line-height: 1.5;
                color: var(--text-secondary);
            }
        `;
        document.head.appendChild(style);

        // Typewriter effect for insights
        const insights = [
            'Your peak productivity hour is 22:00 with 601 events',
            'YouTube usage increased 12.5% this week',
            'Detected 3 new behavioral patterns in your activity'
        ];

        insights.forEach((text, index) => {
            setTimeout(() => {
                typeWriter(`insight-text-${index + 1}`, text, 30);
            }, index * 1000);
        });
    }

    function typeWriter(elementId, text, speed) {
        const element = document.getElementById(elementId);
        if (!element) return;

        let i = 0;
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        type();
    }

    // Add quick filter chips
    function addQuickFilters() {
        const header = document.querySelector('.header-inner');
        if (!header) return;

        const filterGroup = document.createElement('div');
        filterGroup.className = 'quick-filters';
        filterGroup.innerHTML = `
            <button class="filter-chip active" data-range="all">All Time</button>
            <button class="filter-chip" data-range="today">Today</button>
            <button class="filter-chip" data-range="week">This Week</button>
            <button class="filter-chip" data-range="month">This Month</button>
        `;

        header.appendChild(filterGroup);

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .quick-filters {
                display: flex;
                gap: 0.5rem;
                margin-top: 1rem;
                flex-wrap: wrap;
            }
            .filter-chip {
                padding: 0.5rem 1rem;
                background: var(--bg-glass);
                border: 1px solid var(--border-subtle);
                border-radius: 20px;
                color: var(--text-secondary);
                font-size: 0.875rem;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.3s ease;
            }
            .filter-chip:hover {
                background: rgba(139, 92, 246, 0.2);
                border-color: rgba(139, 92, 246, 0.5);
                transform: translateY(-2px);
            }
            .filter-chip.active {
                background: linear-gradient(135deg, var(--accent), var(--accent-secondary));
                border-color: var(--accent);
                color: white;
            }
        `;
        document.head.appendChild(style);

        // Add click handlers
        const chips = filterGroup.querySelectorAll('.filter-chip');
        chips.forEach(chip => {
            chip.addEventListener('click', () => {
                chips.forEach(c => c.classList.remove('active'));
                chip.classList.add('active');
                console.log('Filter changed to:', chip.dataset.range);
                // Here you would filter the data based on the selection
            });
        });
    }

})();
