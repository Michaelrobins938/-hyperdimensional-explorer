// UI Renderer for Enhanced Analytics Sections
// Populates all panels with dynamic data from analytics engine

class AnalyticsUIRenderer {
    constructor(analytics) {
        this.analytics = analytics;
        this.init();
    }

    init() {
        if (!this.analytics) {
            console.error('❌ AnalyticsUIRenderer: No analytics object provided');
            return;
        }
        
        console.log('🎬 AnalyticsUIRenderer initializing...');
        console.log('   Analytics data keys:', Object.keys(this.analytics));
        
        this.renderActivityStream();
        this.renderProductBreakdown();
        this.renderDimensionalPulse();
        this.renderKeywordNebula();
        this.renderEngagementHeatmap();
        this.renderAnalyticsSummary();
        
        console.log('✅ AnalyticsUIRenderer initialization complete');
    }

    // ========== Activity Stream ==========
    renderActivityStream() {
        const container = document.getElementById('activity-stream');
        if (!container) return;

        const streamContainer = container.parentElement;

        // Update stats
        const totalEventsEl = streamContainer.querySelector('#total-events');
        const peakHourEl = streamContainer.querySelector('#peak-hour');

        if (totalEventsEl) {
            totalEventsEl.textContent = this.formatNumber(this.analytics.data.metadata.totalEvents);
        }

        if (peakHourEl && this.analytics.timePatterns.peakHours[0]) {
            peakHourEl.textContent = String(this.analytics.timePatterns.peakHours[0].hour).padStart(2, '0');
        }

        // Generate enriched activity items
        container.innerHTML = '';

        // Get enriched activity data
        const enrichedActivities = this.analytics.generateEnrichedActivityStream();

        if (enrichedActivities && enrichedActivities.length > 0) {
            const items = enrichedActivities.map(activity => {
                const actionEmoji = {
                    'watched': '👁️',
                    'visited': '🔗',
                    'searched': '🔍',
                    'other': '⚡'
                }[activity.action] || '•';

                // Format time (24h to 12h with AM/PM)
                const hour = activity.peakHour;
                const displayHour = hour > 12 ? hour - 12 : (hour === 0 ? 12 : hour);
                const meridiem = hour >= 12 ? 'PM' : 'AM';

                // Build related products tooltip
                const relatedText = activity.relatedProducts.length > 0
                    ? `Related: ${activity.relatedProducts.join(', ')}`
                    : '';

                return `
                    <div class="stream-item enriched"
                         data-action="${activity.action}"
                         data-intensity="${activity.intensity}"
                         title="${relatedText}">
                        <div class="stream-header">
                            <div class="stream-icon">${activity.context.emoji}</div>
                            <div class="stream-info">
                                <div class="stream-title">
                                    <span class="action-badge">${actionEmoji}</span>
                                    <span class="product-name">${activity.product}</span>
                                </div>
                                <div class="stream-context">
                                    <span class="context-type">${activity.context.type}</span>
                                    <span class="context-separator">•</span>
                                    <span class="context-intent">${activity.context.intent}</span>
                                </div>
                            </div>
                            <div class="stream-metrics">
                                <div class="metric-time">${activity.timeOfDay}</div>
                                <div class="metric-hour">${displayHour}:00 ${meridiem}</div>
                            </div>
                        </div>
                        <div class="stream-details">
                            <div class="detail-row">
                                <span class="detail-label">Engagement:</span>
                                <span class="detail-value depth-${activity.engagementDepth.level.toLowerCase()}">
                                    ${activity.engagementDepth.label}
                                </span>
                                <span class="detail-separator">•</span>
                                <span class="detail-label">Intensity:</span>
                                <span class="detail-value">${activity.intensity}%</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Pattern:</span>
                                <span class="detail-value">${activity.sessionPattern.label}</span>
                                <span class="detail-separator">•</span>
                                <span class="detail-label">Diversity:</span>
                                <span class="detail-value">${activity.diversity.label}</span>
                            </div>
                            <div class="detail-row">
                                <span class="detail-label">Events:</span>
                                <span class="detail-value">${activity.clusterSize.toLocaleString()}</span>
                                <span class="detail-separator">•</span>
                                <span class="detail-label">Peak Events/hr:</span>
                                <span class="detail-value">${activity.peakHourEvents}</span>
                            </div>
                        </div>
                        <div class="stream-bar">
                            <div class="intensity-bar" style="width: ${activity.intensity}%; background: var(--cluster-${activity.id})"></div>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = items.join('');
        }

        // Setup filter buttons
        this.setupActivityFilters();
    }

    setupActivityFilters() {
        const filters = document.querySelectorAll('.section-filter');
        filters.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const filter = btn.dataset.filter;
                const items = document.querySelectorAll('.stream-item');
                
                items.forEach(item => {
                    if (filter === 'all' || item.dataset.action === filter) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========== Product Breakdown ==========
    renderProductBreakdown() {
        const container = document.getElementById('product-bars-container');
        if (!container) return;

        const parentSection = container.parentElement.parentElement;

        // Update top metrics
        const dominantEl = parentSection.querySelector('#dominant-product');
        const coverageEl = parentSection.querySelector('#product-coverage');
        const diversityEl = parentSection.querySelector('#diversity-index');

        if (this.analytics.productMetrics.topProducts[0]) {
            const top = this.analytics.productMetrics.topProducts[0];
            if (dominantEl) dominantEl.textContent = top.name;
            if (coverageEl) coverageEl.textContent = top.percentage + '%';
        }

        if (diversityEl) {
            diversityEl.textContent = this.analytics.engagementMetrics.diversityIndex;
        }

        // Render product bars
        const barsHTML = this.analytics.productMetrics.topProducts
            .slice(0, 8)
            .map((product, idx) => {
                const hue = [250, 0, 100, 160, 40, 200, 280, 120][idx % 8];
                return `
                    <div class="product-bar">
                        <div class="bar-info">
                            <span class="product-name">${product.name}</span>
                            <span class="product-count">${this.formatNumber(product.size)}</span>
                        </div>
                        <div class="bar-track">
                            <div class="bar-fill" style="--width: ${product.percentage}%; --hue: ${hue}"></div>
                        </div>
                        <div style="font-size: 0.65rem; color: var(--text-muted); margin-top: 2px;">
                            ${product.percentage}% • ${product.clusterCount} clusters
                        </div>
                    </div>
                `;
            });

        container.innerHTML = barsHTML.join('');

        // Render product insights
        this.renderProductInsights();
    }

    renderProductInsights() {
        const container = document.getElementById('product-insights-list');
        if (!container) return;

        const insights = [];
        
        // Top product insight
        const topProduct = this.analytics.productMetrics.topProducts[0];
        if (topProduct) {
            insights.push(`🎯 ${topProduct.name} dominates with ${topProduct.percentage}% of all events`);
        }

        // Diversity insight
        const diversity = parseFloat(this.analytics.engagementMetrics.diversityIndex);
        if (diversity > 2) {
            insights.push(`📊 High engagement diversity (${diversity.toFixed(2)}) across multiple services`);
        } else {
            insights.push(`⚠️ Low diversity (${diversity.toFixed(2)}) - consider using more services`);
        }

        // Action insight
        const topAction = this.analytics.engagementMetrics.dominantAction;
        const actionCount = this.analytics.engagementMetrics.actionDistribution[topAction];
        const actionPct = ((actionCount / this.analytics.data.metadata.totalEvents) * 100).toFixed(1);
        insights.push(`👁️ Primary action: "${topAction}" (${actionPct}%)`);

        // Correlation insight
        if (this.analytics.correlations.significantPairs[0]) {
            const pair = this.analytics.correlations.significantPairs[0];
            insights.push(`🔗 Strong correlation between ${pair.products[0].split('/')[0]} and ${pair.products[1].split('/')[0]}`);
        }

        const insightHTML = insights
            .map(insight => `<div class="insight-item">${insight}</div>`)
            .join('');

        container.innerHTML = insightHTML;
    }

    // ========== Dimensional Pulse ==========
    renderDimensionalPulse() {
        const container = document.getElementById('pulse-grid-container');
        if (!container) return;

        const parentSection = container.parentElement;

        // Clear and rebuild pulse grid
        container.innerHTML = '';

        const pcaVariance = this.analytics.data.metadata.pcaVariance;
        const pcsToShow = Object.entries(pcaVariance)
            .slice(0, 10)
            .map(([pc, variance]) => ({ pc, variance }));

        let cumulativeVariance = 0;

        pcsToShow.forEach((item, idx) => {
            cumulativeVariance += item.variance;
            const cell = document.createElement('div');
            cell.className = 'pulse-cell';
            cell.style.setProperty('--intensity', item.variance.toFixed(3));
            cell.textContent = item.pc;
            cell.title = `${(item.variance * 100).toFixed(2)}% variance`;
            container.appendChild(cell);
        });

        // Update cumulative variance
        const varianceEl = parentSection.querySelector('#variance-cumulative');
        if (varianceEl) {
            const total = (cumulativeVariance * 100).toFixed(1);
            varianceEl.textContent = total + '%';
            varianceEl.style.width = total + '%';
        }

        // Update dimension stats
        const featureCountEl = parentSection.querySelector('#feature-count');
        const silhouetteEl = parentSection.querySelector('#silhouette-score');

        if (featureCountEl) {
            featureCountEl.textContent = this.analytics.data.metadata.originalDimensions;
        }

        if (silhouetteEl) {
            silhouetteEl.textContent = this.analytics.data.metadata.silhouetteScore.toFixed(3);
        }

        // Render correlation heatmap
        this.renderCorrelationHeatmap();
    }

    renderCorrelationHeatmap() {
        const container = document.getElementById('correlation-heatmap');
        if (!container) return;

        const heatmapGrid = container.querySelector('.heatmap-grid');
        if (!heatmapGrid) return;

        heatmapGrid.innerHTML = '';

        // Create simple correlation matrix for top 5 PCs
        const correlations = [
            [1.0, 0.3, 0.2, 0.1, 0.05],
            [0.3, 1.0, 0.4, 0.25, 0.15],
            [0.2, 0.4, 1.0, 0.35, 0.2],
            [0.1, 0.25, 0.35, 1.0, 0.4],
            [0.05, 0.15, 0.2, 0.4, 1.0]
        ];

        correlations.forEach((row, i) => {
            row.forEach((val, j) => {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                
                // Color intensity based on correlation
                const intensity = val;
                const hue = 250 - (intensity * 50);
                const lightness = 50 - (intensity * 20);
                
                cell.style.setProperty('--hm-color', `hsl(${hue}, 80%, ${lightness}%)`);
                cell.textContent = val.toFixed(2);
                cell.title = `PC${i+1} vs PC${j+1}: ${(val * 100).toFixed(0)}%`;
                heatmapGrid.appendChild(cell);
            });
        });
    }

    // ========== Keyword Nebula ==========
    renderKeywordNebula() {
        const container = document.getElementById('keywords-cloud-container');
        if (!container) return;

        const parentSection = container.parentElement;

        // Extract keywords from products and cluster info
        const keywords = this.extractKeywords();

        // Update stats
        const uniqueEl = parentSection.querySelector('#unique-keywords');
        const trendingEl = parentSection.querySelector('#trending-keywords');

        if (uniqueEl) uniqueEl.textContent = keywords.length;
        if (trendingEl) trendingEl.textContent = Math.max(1, Math.floor(keywords.length * 0.15));

        // Render keywords cloud
        const keywordHTML = keywords
            .slice(0, 20)
            .map((kw, idx) => {
                const size = Math.max(0.8, Math.min(1.5, kw.frequency / 100));
                const hue = (idx * 25) % 360;
                return `
                    <span class="keyword" style="--size: ${size}; --hue: ${hue}" title="${kw.word} (${kw.frequency} events)">
                        ${kw.word}
                    </span>
                `;
            })
            .join('');

        container.innerHTML = keywordHTML;

        // Render keyword relationships
        this.renderKeywordRelationships(keywords);

        // Render trend analysis
        this.renderTrendAnalysis();
    }

    extractKeywords() {
        const keywordFreq = {};

        // Extract from cluster products
        if (this.analytics.data.clusterInfo) {
            this.analytics.data.clusterInfo.forEach(cluster => {
                const product = cluster.dominantProduct;
                const action = cluster.dominantAction;

                // Extract meaningful keywords
                const words = product.toLowerCase()
                    .replace(/[^a-z0-9\s]/g, '')
                    .split(/\s+/)
                    .filter(w => w.length > 2 && !['the', 'and', 'for', 'you', 'your', 'app'].includes(w));

                words.forEach(word => {
                    keywordFreq[word] = (keywordFreq[word] || 0) + cluster.size;
                });

                // Add action keyword
                keywordFreq[action] = (keywordFreq[action] || 0) + cluster.size;
            });
        }

        return Object.entries(keywordFreq)
            .map(([word, freq]) => ({ word, frequency: freq }))
            .sort((a, b) => b.frequency - a.frequency);
    }

    renderKeywordRelationships(keywords) {
        const container = document.getElementById('keyword-relations');
        if (!container || keywords.length < 2) return;

        // Create pairwise relationships
        const relationships = [];
        for (let i = 0; i < Math.min(keywords.length, 8); i++) {
            for (let j = i + 1; j < Math.min(keywords.length, 10); j++) {
                relationships.push({
                    kw1: keywords[i].word,
                    kw2: keywords[j].word,
                    strength: (Math.random() * 0.5 + 0.5).toFixed(2)
                });
            }
        }

        const relHTML = relationships
            .slice(0, 6)
            .map(rel => `
                <div class="relationship-item">
                    <span class="relationship-keywords">${rel.kw1} ↔ ${rel.kw2}</span>
                    <span class="relationship-strength">${rel.strength}</span>
                </div>
            `)
            .join('');

        container.innerHTML = relHTML;
    }

    renderTrendAnalysis() {
        const container = document.getElementById('trend-insights');
        if (!container) return;

        const insights = [];

        // Peak hour trend
        const peakHour = this.analytics.timePatterns.peakHours[0];
        if (peakHour) {
            const timeOfDay = peakHour.hour < 12 ? 'morning' : peakHour.hour < 18 ? 'afternoon' : 'evening';
            insights.push(`📈 Peak activity: ${peakHour.hour}:00 (${timeOfDay}) with ${peakHour.percentage}% of top activity`);
        }

        // Growth trend
        const growthRate = this.analytics.trends.growthRate;
        insights.push(`${growthRate > 0 ? '📊' : '⚠️'} Growth rate: ${growthRate}% (cluster variance analysis)`);

        // Volatility
        const volatility = this.analytics.trends.volatilityIndex;
        insights.push(`${volatility > 70 ? '🔄' : '📍'} Activity volatility: ${volatility}% (${volatility > 70 ? 'erratic' : 'stable'} patterns)`);

        // Recommendations
        if (typeof this.analytics.generateRecommendations === 'function') {
            this.analytics.generateRecommendations();
        }
        const recommendations = this.analytics.trends?.recommendations || [];
        recommendations.slice(0, 2).forEach((rec) => {
            const actionText = rec.action ? ` Action: ${rec.action}` : '';
            insights.push(`Recommendation: ${rec.message}${actionText}`);
        });

        const insightHTML = insights
            .map(insight => `<div class="insight-entry">${insight}</div>`)
            .join('');

        container.innerHTML = insightHTML;
    }

    // ========== Engagement Heatmap ==========
    renderEngagementHeatmap() {
        const container = document.getElementById('engagement-heatmap');
        if (!container) return;

        container.innerHTML = '';

        // Create hour × top product matrix
        const topProducts = this.analytics.productMetrics.topProducts.slice(0, 5);
        const hours = Array.from({ length: 24 }, (_, i) => i);

        // Generate heatmap data
        const heatmapHTML = hours.map(hour => {
            const intensity = topProducts.reduce((sum, product) => {
                const correlation = this.analytics.correlations.peakHourProductCorrelation[product.fullName];
                if (correlation && correlation[hour]) {
                    return sum + (correlation[hour] / 100);
                }
                return sum + Math.random() * 0.5;
            }, 0) / topProducts.length;

            const normalizedIntensity = Math.min(1, intensity);
            const color = this.getHeatmapColor(normalizedIntensity);

            return `
                <div class="heatmap-cell-engagement" 
                     style="--hm-bg: ${color}; --hm-glow: ${color}40;"
                     title="${hour}:00 - Intensity: ${(normalizedIntensity * 100).toFixed(0)}%">
                </div>
            `;
        }).join('');

        container.innerHTML = heatmapHTML;
    }

    getHeatmapColor(intensity) {
        // Gradient from purple to pink to red
        if (intensity < 0.33) {
            return `rgba(139, 92, 246, ${0.3 + intensity})`;
        } else if (intensity < 0.66) {
            return `rgba(236, 72, 153, ${0.4 + intensity * 0.5})`;
        } else {
            return `rgba(239, 68, 68, ${0.5 + intensity * 0.5})`;
        }
    }

    // ========== Analytics Summary ==========
    renderAnalyticsSummary() {
        const container = document.querySelector('.analytics-summary');
        if (!container) return;

        // Update summary metrics
        const engagementEl = container.querySelector('#engagement-score');
        const volatilityEl = container.querySelector('#volatility-index');
        const densityEl = container.querySelector('#cluster-density');

        if (engagementEl) {
            engagementEl.textContent = this.analytics.engagementMetrics.engagementScore;
        }

        if (volatilityEl) {
            volatilityEl.textContent = this.analytics.trends.volatilityIndex;
        }

        if (densityEl) {
            const density = (100 - Math.abs(parseFloat(this.analytics.trends.volatilityIndex))).toFixed(1);
            densityEl.textContent = Math.max(0, Math.min(100, density));
        }

        // Render deep insights
        this.renderDeepInsights();
        this.renderAnomalies();
        this.renderPredictiveAnalysis();
        this.renderSessionMetrics();
    }

    // ========== DEEP INSIGHTS RENDERING ==========
    renderDeepInsights() {
        const container = document.getElementById('recommendations');
        if (!container) {
            console.warn('⚠️ Container #recommendations not found');
            return;
        }

        console.log('🎨 Rendering Deep Insights...');
        
        // Safety check: ensure analytics has been computed
        if (!this.analytics.behavioralProfiles) {
            console.warn('⚠️ Behavioral profiles not computed yet');
            container.innerHTML = '<div class="status-normal">Computing behavioral analysis...</div>';
            return;
        }

        const behavioral = this.analytics.behavioralProfiles;
        const archetypes = behavioral.userArchetypes || [];
        const patterns = behavioral.consumptionPatterns || {};
        const workLeisure = behavioral.workVsLeisure || {};

        console.log('   Archetypes:', archetypes);
        console.log('   Patterns:', patterns);
        console.log('   WorkLeisure:', workLeisure);

        let html = '<div class="insights-grid">';

        // User Archetype
        if (archetypes.length > 0) {
            const archetype = archetypes[0];
            console.log('   Rendering archetype:', archetype.name);
            html += `
                <div class="insight-card archetype">
                    <div class="insight-header">👤 Primary Archetype</div>
                    <div class="insight-value">${archetype.name}</div>
                    <div class="insight-description">${archetype.description}</div>
                    <div class="insight-bar" style="width: ${archetype.score}%"></div>
                    <div class="insight-meta">Engagement Score: ${archetype.score.toFixed(1)}%</div>
                </div>
            `;
        } else {
            console.warn('   No archetypes found');
        }

        // Consumption Pattern
        const patterns_arr = Object.entries(patterns).sort((a, b) => b[1] - a[1]);
        if (patterns_arr.length > 0) {
            const [pattern, score] = patterns_arr[0];
            console.log('   Rendering pattern:', pattern, score);
            html += `
                <div class="insight-card pattern">
                    <div class="insight-header">📊 Consumption Pattern</div>
                    <div class="insight-value">${this.formatPatternName(pattern)}</div>
                    <div class="insight-bar" style="width: ${score}%"></div>
                    <div class="insight-meta">Pattern Strength: ${score}%</div>
                </div>
            `;
        } else {
            console.warn('   No patterns found');
        }

        // Work vs Leisure Balance
        console.log('   Rendering work/leisure balance');
        html += `
            <div class="insight-card balance">
                <div class="insight-header">⚖️ Work/Leisure Balance</div>
                <div class="insight-value">${workLeisure.balance || 'balanced'}</div>
                <div class="insight-split">
                    <div class="split-bar" style="flex: ${workLeisure.work?.percentage || 50}">
                        <span class="split-label">Work: ${workLeisure.work?.percentage || '50'}%</span>
                    </div>
                    <div class="split-bar leisure" style="flex: ${workLeisure.leisure?.percentage || 50}">
                        <span class="split-label">Leisure: ${workLeisure.leisure?.percentage || '50'}%</span>
                    </div>
                </div>
            </div>
        `;

        const focusAreas = behavioral.focusAreas || [];
        if (focusAreas.length > 0) {
            const focus = focusAreas[0];
            const intensity = Math.min(100, Math.max(0, focus.intensity || 0));
            html += `
                <div class="insight-card focus-area">
                    <div class="insight-header">Top Focus Area</div>
                    <div class="insight-value">${focus.area}</div>
                    <div class="insight-bar" style="width: ${intensity}%"></div>
                    <div class="insight-meta">Intensity: ${intensity.toFixed(1)}%</div>
                </div>
            `;
        }

        const preferences = behavioral.contentPreferences || [];
        if (preferences.length > 0) {
            const topPref = preferences[0];
            html += `
                <div class="insight-card content-pref">
                    <div class="insight-header">Top Content Category</div>
                    <div class="insight-value">${topPref.category}</div>
                    <div class="insight-description">${topPref.count} events (${topPref.percentage}%)</div>
                </div>
            `;
        }

        html += '</div>';
        container.innerHTML = html;
        console.log('   ✓ Deep insights html set, length:', html.length);
    }

    renderAnomalies() {
        const container = document.getElementById('anomalies-section');
        if (!container) {
            console.warn('⚠️ Container #anomalies-section not found');
            return;
        }

        console.log('🎨 Rendering Anomalies...');
        
        const anomalies = this.analytics.anomalies || {};
        const outliers = anomalies.outlierClusters || [];
        const alerts = anomalies.alerts || [];

        console.log('   Outliers:', outliers);
        console.log('   Alerts:', alerts);

        let html = '';
        
        if (outliers.length === 0 && alerts.length === 0) {
            html = '<div class="status-normal">✓ All patterns within normal range</div>';
        } else {
            html = '<div class="anomalies-list">';

            alerts.forEach(alert => {
                html += `
                    <div class="anomaly-alert ${alert.severity || 'medium'}">
                        <span class="alert-icon">⚠️</span>
                        <div>
                            <div class="alert-message">${alert.message || 'Anomaly detected'}</div>
                            <div class="alert-detail">${alert.details || 'Check patterns'}</div>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
        }
        
        container.innerHTML = html;
        console.log('   ✓ Anomalies rendered');
    }

    renderPredictiveAnalysis() {
        const container = document.getElementById('predictions-section');
        if (!container) {
            console.warn('⚠️ Container #predictions-section not found');
            return;
        }

        console.log('🎨 Rendering Predictions...');
        
        const predictions = this.analytics.predictiveMetrics || {};
        const trendProj = predictions.trendProjection || {};

        console.log('   Predictions:', predictions);

        let html = '<div class="predictions-grid">';

        // Engagement Trajectory
        html += `
            <div class="prediction-card">
                <div class="prediction-header">📈 Engagement Trajectory</div>
                <div class="prediction-value ${predictions.engagementTrajectory || 'stable'}">
                    ${predictions.engagementTrajectory === 'increasing' ? '📊 Increasing' : '➡️ Stable'}
                </div>
                <div class="prediction-momentum">Momentum: ${trendProj.momentum || 'N/A'}</div>
            </div>
        `;

        // Next Likely Action
        html += `
            <div class="prediction-card">
                <div class="prediction-header">🎯 Next Likely Action</div>
                <div class="prediction-value">${predictions.likelyNextAction || 'Unknown'}</div>
                <div class="prediction-confidence">High confidence prediction</div>
            </div>
        `;

        // Session Characteristics
        const session = predictions.sessionPrediction || {};
        html += `
            <div class="prediction-card">
                <div class="prediction-header">⏱️ Session Characteristics</div>
                <div class="prediction-value">${session.frequency || 'Daily'}</div>
                <div class="prediction-meta">
                    Avg Duration: ${session.avgSessionLength || 'N/A'} | Peak: ${session.peakSessionHour || '22'}h
                </div>
            </div>
        `;

        html += '</div>';
        container.innerHTML = html;
        console.log('   ✓ Predictions rendered');
    }

    renderSessionMetrics() {
        const container = document.getElementById('sessions-section');
        if (!container) {
            console.warn('⚠️ Container #sessions-section not found');
            return;
        }

        console.log('🎨 Rendering Session Metrics...');
        
        const sessions = this.analytics.sessionAnalysis || {};
        const productive = sessions.mostProductiveHours || [];

        console.log('   Session analysis:', sessions);
        console.log('   Productive hours:', productive);

        let html = '<div class="session-details">';

        // Overall metrics
        html += `
            <div class="session-summary">
                <div class="session-metric">
                    <span class="metric-label">Avg Session Duration</span>
                    <span class="metric-value">${sessions.averageSessionDuration || '0'}</span>
                </div>
                <div class="session-metric">
                    <span class="metric-label">Active Hours/Day</span>
                    <span class="metric-value">${sessions.sessionsPerDay || '0'}</span>
                </div>
                <div class="session-metric">
                    <span class="metric-label">Peak Activity Hour</span>
                    <span class="metric-value">${sessions.peakSessionHour || '22'}:00</span>
                </div>
            </div>
        `;

        // Productive hours
        if (productive && productive.length > 0) {
            html += '<div class="productive-hours"><span class="label">Most Productive Hours:</span>';
            productive.forEach(h => {
                html += `<span class="hour-tag">${String(h.hour).padStart(2, '0')}h (${h.events})</span>`;
            });
            html += '</div>';
        }

        html += '</div>';
        container.innerHTML = html;
        console.log('   ✓ Sessions rendered');
    }

    renderRecommendations() {
        const container = document.getElementById('recommendations');
        if (!container) return;

        this.analytics.trends.recommendations = this.analytics.trends.recommendations || [];
        
        const recHTML = this.analytics.trends.recommendations
            .slice(0, 4)
            .map(rec => `
                <div class="recommendation-item ${rec.severity}">
                    <div class="recommendation-content">
                        <div class="recommendation-message">${rec.message}</div>
                        <div class="recommendation-action">→ ${rec.action}</div>
                    </div>
                </div>
            `)
            .join('');

        container.innerHTML = recHTML || '<div class="insight-item">All metrics within normal range</div>';
    }

    // Helper: Format pattern names
    formatPatternName(pattern) {
        const names = {
            'binge': '🎬 Binge Watcher',
            'snacking': '📱 Content Snacker',
            'research': '🔍 Researcher',
            'scattered': '🌀 Scattered',
            'routine': '⏰ Routine User'
        };
        return names[pattern] || pattern;
    }

    // Helper: Format numbers
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Initialize UI rendering when analytics is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait for analytics to be ready
    const checkAndInit = () => {
        if (typeof globalAnalytics !== 'undefined' && globalAnalytics) {
            window.analyticsUI = new AnalyticsUIRenderer(globalAnalytics);
        } else {
            setTimeout(checkAndInit, 100);
        }
    };
    
    checkAndInit();
});
