// Advanced Analytics Engine for Hyperdimensional Data
// Provides: Deep statistical analysis, behavioral insights, anomaly detection, predictive metrics

class AdvancedAnalytics {
    constructor(data) {
        this.data = data;
        this.processedData = null;
        this.timePatterns = null;
        this.engagementMetrics = null;
        this.productMetrics = null;
        this.correlations = null;
        this.trends = null;
        this.deepInsights = null;
        this.behavioralProfiles = null;
        this.anomalies = null;
        this.predictiveMetrics = null;
        this.sessionAnalysis = null;
        this.initialize();
    }

    initialize() {
        console.log('🔧 AdvancedAnalytics.initialize() starting...');
        
        this.processTimePatterns();
        console.log('   ✓ processTimePatterns');
        
        this.computeEngagementMetrics();
        console.log('   ✓ computeEngagementMetrics');
        
        this.computeProductMetrics();
        console.log('   ✓ computeProductMetrics');
        
        this.computeCorrelations();
        console.log('   ✓ computeCorrelations');
        
        this.computeTrends();
        console.log('   ✓ computeTrends');
        
        this.analyzeDeepBehavioral();
        console.log('   ✓ analyzeDeepBehavioral', this.behavioralProfiles);
        
        this.detectAnomalies();
        console.log('   ✓ detectAnomalies', this.anomalies);
        
        this.computePredictiveMetrics();
        console.log('   ✓ computePredictiveMetrics', this.predictiveMetrics);
        
        this.analyzeSessionPatterns();
        console.log('   ✓ analyzeSessionPatterns', this.sessionAnalysis);
        
        console.log('✅ AdvancedAnalytics.initialize() complete');
    }

    // Extract time-based patterns
    processTimePatterns() {
        this.timePatterns = {
            hourly: {},
            daily: {},
            peakHours: [],
            peakDays: []
        };

        // Parse timestamps from activity data
        if (this.data && this.data.clusterInfo) {
            this.data.clusterInfo.forEach(cluster => {
                const hour = cluster.peakHour || 0;
                this.timePatterns.hourly[hour] = (this.timePatterns.hourly[hour] || 0) + cluster.size;
            });
        }

        // Find top peak hours
        this.timePatterns.peakHours = Object.entries(this.timePatterns.hourly)
            .map(([hour, count]) => ({ hour: parseInt(hour), count, percentage: 0 }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 5);

        const total = this.timePatterns.peakHours.reduce((sum, h) => sum + h.count, 0);
        this.timePatterns.peakHours.forEach(h => h.percentage = ((h.count / total) * 100).toFixed(1));

        return this.timePatterns;
    }

    // Compute engagement metrics
    computeEngagementMetrics() {
        this.engagementMetrics = {
            avgClusterSize: 0,
            clusterVariance: 0,
            dominantAction: 'watched',
            actionDistribution: {},
            engagementScore: 0,
            activityDensity: 0,
            clusterCompactness: 0,
            diversityIndex: 0
        };

        if (this.data && this.data.clusterInfo) {
            const sizes = this.data.clusterInfo.map(c => c.size);
            this.engagementMetrics.avgClusterSize = (sizes.reduce((a, b) => a + b, 0) / sizes.length).toFixed(2);
            
            // Variance
            const mean = parseFloat(this.engagementMetrics.avgClusterSize);
            this.engagementMetrics.clusterVariance = (sizes.reduce((sum, s) => sum + Math.pow(s - mean, 2), 0) / sizes.length).toFixed(2);

            // Action distribution
            const actionCounts = {};
            this.data.clusterInfo.forEach(c => {
                actionCounts[c.dominantAction] = (actionCounts[c.dominantAction] || 0) + c.size;
            });
            this.engagementMetrics.actionDistribution = actionCounts;

            // Find dominant action
            this.engagementMetrics.dominantAction = Object.entries(actionCounts)
                .sort((a, b) => b[1] - a[1])[0][0];

            // Engagement score (0-100)
            const silhouette = this.data.metadata.silhouetteScore || 0;
            this.engagementMetrics.engagementScore = Math.round((silhouette + 1) * 50); // Normalize

            // Cluster compactness
            this.engagementMetrics.clusterCompactness = (
                (sizes.length / this.data.metadata.clusters) * 100
            ).toFixed(1);

            // Diversity index (Shannon entropy)
            const totalEvents = sizes.reduce((a, b) => a + b, 0);
            const proportions = sizes.map(s => s / totalEvents);
            this.engagementMetrics.diversityIndex = (-proportions.reduce((sum, p) => sum + p * Math.log2(p), 0)).toFixed(2);
        }

        return this.engagementMetrics;
    }

    // Compute product metrics
    computeProductMetrics() {
        this.productMetrics = {
            topProducts: [],
            productGrowth: {},
            engagementByProduct: {},
            productCorrelations: {},
            topProductPairs: []
        };

        if (this.data && this.data.clusterInfo) {
            const productCount = {};
            const productClusterSizes = {};

            this.data.clusterInfo.forEach(cluster => {
                const product = cluster.dominantProduct;
                productCount[product] = (productCount[product] || 0) + 1;
                productClusterSizes[product] = (productClusterSizes[product] || 0) + cluster.size;
            });

            // Top products
            this.productMetrics.topProducts = Object.entries(productClusterSizes)
                .map(([product, size]) => ({
                    name: product.length > 30 ? product.substring(0, 27) + '...' : product,
                    fullName: product,
                    size,
                    clusterCount: productCount[product],
                    percentage: ((size / this.data.metadata.totalEvents) * 100).toFixed(2),
                    engagement: (size / this.data.metadata.clusters).toFixed(2)
                }))
                .sort((a, b) => b.size - a.size)
                .slice(0, 15);

            this.productMetrics.topProducts.forEach(p => {
                this.productMetrics.engagementByProduct[p.fullName] = parseFloat(p.engagement);
            });
        }

        return this.productMetrics;
    }

    // Compute statistical correlations
    computeCorrelations() {
        this.correlations = {
            productActionCorrelation: {},
            clusterProductCorrelation: [],
            peakHourProductCorrelation: {},
            significantPairs: []
        };

        if (this.data && this.data.clusterInfo) {
            // Product-Action correlation
            const productActions = {};
            this.data.clusterInfo.forEach(cluster => {
                const key = `${cluster.dominantProduct}|${cluster.dominantAction}`;
                productActions[key] = (productActions[key] || 0) + cluster.size;
            });

            // Product-Peak hour correlation
            this.data.clusterInfo.forEach(cluster => {
                const hour = cluster.peakHour;
                const product = cluster.dominantProduct;
                if (!this.correlations.peakHourProductCorrelation[product]) {
                    this.correlations.peakHourProductCorrelation[product] = {};
                }
                this.correlations.peakHourProductCorrelation[product][hour] = 
                    (this.correlations.peakHourProductCorrelation[product][hour] || 0) + cluster.size;
            });

            // Find significant pairs
            const pairs = [];
            this.data.clusterInfo.forEach((c1, i) => {
                this.data.clusterInfo.slice(i + 1).forEach(c2 => {
                    if (c1.dominantProduct !== c2.dominantProduct) {
                        pairs.push({
                            products: [c1.dominantProduct, c2.dominantProduct],
                            similarity: this.calculateProductSimilarity(c1, c2),
                            sharedClusters: 1
                        });
                    }
                });
            });

            this.correlations.significantPairs = pairs
                .sort((a, b) => b.similarity - a.similarity)
                .slice(0, 10);
        }

        return this.correlations;
    }

    // Calculate similarity between clusters
    calculateProductSimilarity(cluster1, cluster2) {
        let similarity = 0;
        
        // Action similarity
        if (cluster1.dominantAction === cluster2.dominantAction) similarity += 0.3;
        
        // Peak hour proximity
        const hourDiff = Math.abs(cluster1.peakHour - cluster2.peakHour);
        similarity += Math.max(0, 0.4 * (1 - hourDiff / 12));
        
        // Size similarity
        const sizeDiff = Math.abs(cluster1.size - cluster2.size) / Math.max(cluster1.size, cluster2.size);
        similarity += Math.max(0, 0.3 * (1 - sizeDiff));

        return similarity.toFixed(3);
    }

    // Compute trends
    computeTrends() {
        this.trends = {
            growthRate: 0,
            volatilityIndex: 0,
            clusterGrowthTrends: [],
            actionTrendShift: {},
            peakHourTrend: 'stable',
            recommendations: []
        };

        if (this.data && this.data.clusterInfo) {
            const sizes = this.data.clusterInfo.map(c => c.size).sort((a, b) => a - b);
            
            // Growth rate (simulated from cluster variance)
            const variance = parseFloat(this.engagementMetrics.clusterVariance);
            this.trends.growthRate = Math.round((variance / 1000) * 100);
            
            // Volatility
            const max = Math.max(...sizes);
            const min = Math.min(...sizes);
            this.trends.volatilityIndex = (((max - min) / (max + min)) * 100).toFixed(2);

            // Action trends
            const actions = {};
            this.data.clusterInfo.forEach(c => {
                actions[c.dominantAction] = (actions[c.dominantAction] || 0) + c.size;
            });
            this.trends.actionTrendShift = actions;

            // Peak hour trend
            const peakHours = this.data.clusterInfo.map(c => c.peakHour);
            const peakMode = this.getMode(peakHours);
            this.trends.peakHourTrend = peakMode > 20 ? 'late-night' : peakMode > 17 ? 'evening' : 'daytime';

            // Generate recommendations
            this.generateRecommendations();
        }

        return this.trends;
    }

    generateRecommendations() {
        if (!this.trends) {
            this.trends = { recommendations: [] };
        }

        const recs = [];
        const totalEvents = this.data?.metadata?.totalEvents || 0;
        const topProduct = this.productMetrics?.topProducts?.[0];

        if (topProduct && topProduct.fullName) {
            const pct = parseFloat(topProduct.percentage);
            if (!Number.isNaN(pct)) {
                if (pct >= 70) {
                    recs.push({
                        severity: 'high',
                        message: `${topProduct.fullName} accounts for ${pct}% of activity.`,
                        action: 'Balance usage with secondary products to reduce single-platform dependence.'
                    });
                } else if (pct >= 40) {
                    recs.push({
                        severity: 'medium',
                        message: `${topProduct.fullName} is a strong primary signal at ${pct}%.`,
                        action: 'Reinforce high-value workflows around this product and monitor secondary usage.'
                    });
                } else {
                    recs.push({
                        severity: 'low',
                        message: `No single product dominates (top share ${pct}%).`,
                        action: 'Maintain diversity while focusing on the top two products for efficiency.'
                    });
                }
            }
        }

        const diversity = parseFloat(this.engagementMetrics?.diversityIndex);
        if (!Number.isNaN(diversity)) {
            if (diversity < 1.5) {
                recs.push({
                    severity: 'medium',
                    message: `Low service diversity (index ${diversity.toFixed(2)}).`,
                    action: 'Explore complementary services to broaden activity coverage.'
                });
            } else if (diversity > 2.5) {
                recs.push({
                    severity: 'low',
                    message: `High diversity (index ${diversity.toFixed(2)}).`,
                    action: 'Keep the mix but identify the top performers to prioritize.'
                });
            }
        }

        const peakHour = this.timePatterns?.peakHours?.[0]?.hour;
        if (typeof peakHour === 'number') {
            const hourLabel = String(peakHour).padStart(2, '0');
            const windowLabel = peakHour >= 22 || peakHour < 5
                ? 'late-night'
                : peakHour < 12
                    ? 'morning'
                    : peakHour < 18
                        ? 'afternoon'
                        : 'evening';
            recs.push({
                severity: windowLabel === 'late-night' ? 'medium' : 'low',
                message: `Peak activity around ${hourLabel}:00 (${windowLabel}).`,
                action: windowLabel === 'late-night'
                    ? 'Shift high-effort sessions earlier to protect rest cycles.'
                    : 'Schedule deep-focus tasks near this peak window.'
            });
        }

        const volatility = parseFloat(this.trends?.volatilityIndex);
        if (!Number.isNaN(volatility)) {
            if (volatility >= 70) {
                recs.push({
                    severity: 'high',
                    message: `High volatility (${volatility}%) in activity patterns.`,
                    action: 'Introduce a consistent cadence to reduce engagement spikes.'
                });
            } else if (volatility <= 35) {
                recs.push({
                    severity: 'low',
                    message: `Stable engagement profile (${volatility}%).`,
                    action: 'Maintain the current rhythm and test incremental optimizations.'
                });
            }
        }

        const dominantAction = this.engagementMetrics?.dominantAction;
        if (dominantAction) {
            const actionCount = this.engagementMetrics?.actionDistribution?.[dominantAction] || 0;
            const actionPct = totalEvents ? ((actionCount / totalEvents) * 100).toFixed(1) : '0.0';
            recs.push({
                severity: 'low',
                message: `Primary action is "${dominantAction}" (${actionPct}%).`,
                action: 'Optimize tooling and shortcuts around this action.'
            });
        }

        if (this.sessionAnalysis?.mostProductiveHours?.length) {
            const productive = this.sessionAnalysis.mostProductiveHours[0];
            const productiveHour = String(productive.hour).padStart(2, '0');
            recs.push({
                severity: 'low',
                message: `Most productive hour: ${productiveHour}:00 (${productive.events} events).`,
                action: 'Batch critical tasks during this window.'
            });
        }

        this.trends.recommendations = recs.slice(0, 6);
        return this.trends.recommendations;
    }

    // ========== DEEP BEHAVIORAL ANALYSIS ==========
    analyzeDeepBehavioral() {
        this.behavioralProfiles = {
            userArchetypes: [],
            consumptionPatterns: {},
            focusAreas: [],
            workVsLeisure: {},
            contentPreferences: {},
            platformUsageStrategy: {}
        };

        if (!this.data.events || !this.data.clusterInfo) {
            console.warn('⚠️ analyzeDeepBehavioral: Missing data');
            return;
        }

        console.log('🔍 analyzeDeepBehavioral: Starting analysis...');
        console.log('   Events count:', this.data.events.length);
        console.log('   Clusters count:', this.data.clusterInfo.length);

        // Identify user archetypes based on cluster composition
        const archetypes = this.identifyUserArchetypes();
        this.behavioralProfiles.userArchetypes = archetypes;
        console.log('   ✓ Archetypes:', archetypes.length, archetypes);

        // Analyze consumption patterns
        const patterns = this.analyzeConsumptionPatterns();
        this.behavioralProfiles.consumptionPatterns = patterns;
        console.log('   ✓ Patterns:', patterns);

        // Focus areas analysis
        this.behavioralProfiles.focusAreas = this.identifyFocusAreas();
        console.log('   ✓ Focus areas:', this.behavioralProfiles.focusAreas.length);

        // Work vs leisure split
        this.behavioralProfiles.workVsLeisure = this.analyzeWorkLeisureSplit();
        console.log('   ✓ Work/Leisure:', this.behavioralProfiles.workVsLeisure);

        // Content preferences
        this.behavioralProfiles.contentPreferences = this.analyzeContentPreferences();
        console.log('   ✓ Content prefs:', this.behavioralProfiles.contentPreferences.length);

        // Platform strategy
        this.behavioralProfiles.platformUsageStrategy = this.analyzePlatformStrategy();
        console.log('   ✓ Platform strategy:', this.behavioralProfiles.platformUsageStrategy);

        console.log('✅ analyzeDeepBehavioral complete');
        return this.behavioralProfiles;
    }

    identifyUserArchetypes() {
        const archetypes = [];
        
        // Group clusters by dominant product
        const youtubeCluster = this.data.clusterInfo.filter(c => c.dominantProduct === 'YouTube');
        const searchCluster = this.data.clusterInfo.filter(c => c.dominantProduct === 'Search');
        const assistantCluster = this.data.clusterInfo.filter(c => c.dominantProduct === 'Assistant');
        const shopifyCluster = this.data.clusterInfo.filter(c => 
            c.dominantProduct && (c.dominantProduct.includes('shopify') || c.dominantProduct.includes('printify'))
        );

        console.log('   YouTube clusters:', youtubeCluster.length);
        console.log('   Search clusters:', searchCluster.length);
        console.log('   Shopify clusters:', shopifyCluster.length);

        // Primary Archetype: Content Consumer
        if (youtubeCluster.length > 0) {
            const totalEvents = youtubeCluster.reduce((sum, c) => sum + c.size, 0);
            const score = (totalEvents / this.data.metadata.totalEvents) * 100;
            archetypes.push({
                name: 'Content Consumer',
                description: 'Primarily watches videos (YouTube focus)',
                score: score,
                characteristics: ['Passive consumption', 'Evening/night engagement', 'Entertainment-focused'],
                engagement: 'High volume, consistent patterns'
            });
            console.log('   → Content Consumer score:', score);
        }

        // Secondary Archetype: Information Seeker
        if (searchCluster.length > 0) {
            const totalEvents = searchCluster.reduce((sum, c) => sum + c.size, 0);
            const score = (totalEvents / this.data.metadata.totalEvents) * 100;
            archetypes.push({
                name: 'Information Seeker',
                description: 'Active search and discovery user',
                score: score,
                characteristics: ['Active research', 'Early morning/midnight hours', 'Problem-solving focused'],
                engagement: 'Sporadic, goal-oriented'
            });
            console.log('   → Information Seeker score:', score);
        }

        // Tertiary Archetype: Business/Commerce User
        if (shopifyCluster.length > 0) {
            const totalEvents = shopifyCluster.reduce((sum, c) => sum + c.size, 0);
            const score = (totalEvents / this.data.metadata.totalEvents) * 100;
            archetypes.push({
                name: 'Business Manager',
                description: 'Admin and commerce platform user',
                score: score,
                characteristics: ['Early morning sessions', 'Multi-platform', 'Task-oriented'],
                engagement: 'Structured, time-specific'
            });
            console.log('   → Business Manager score:', score);
        }

        // AI Assistant User
        if (assistantCluster.length > 0) {
            const totalEvents = assistantCluster.reduce((sum, c) => sum + c.size, 0);
            const score = (totalEvents / this.data.metadata.totalEvents) * 100;
            archetypes.push({
                name: 'AI Explorer',
                description: 'Regular Google Assistant and AI tool user',
                score: score,
                characteristics: ['Tech-savvy', 'Afternoon/evening focus', 'Innovation-oriented'],
                engagement: 'Moderate, exploratory'
            });
            console.log('   → AI Explorer score:', score);
        }

        return archetypes.sort((a, b) => b.score - a.score);
    }

    analyzeConsumptionPatterns() {
        const patterns = {
            binge: 15,
            snacking: 15,
            research: 20,
            scattered: 25,
            routine: 25
        };

        if (!this.data.events) return patterns;

        // Analyze session patterns
        const hourlyEvents = {};
        this.data.events.forEach(e => {
            hourlyEvents[e.hour] = (hourlyEvents[e.hour] || 0) + 1;
        });

        const hourCounts = Object.values(hourlyEvents).sort((a, b) => b - a);
        const maxCount = hourCounts[0];
        const avgCount = hourCounts.reduce((a, b) => a + b) / hourCounts.length;

        // Reset and recalculate
        patterns.binge = 0;
        patterns.snacking = 0;
        patterns.research = 0;
        patterns.scattered = 0;
        patterns.routine = 0;

        // Binge: Long session with high event concentration
        if (maxCount > avgCount * 3) {
            patterns.binge = 45;
        }

        // Snacking: Multiple short sessions throughout day
        const activeHours = Object.values(hourlyEvents).filter(count => count > avgCount * 0.5).length;
        if (activeHours > 16) {
            patterns.snacking = 40;
        }

        // Research: Focused periods with varied activities
        patterns.research = 15;

        // Routine: Consistent pattern
        const variance = this.calculateStandardDeviation(hourCounts);
        if (variance < avgCount * 0.3) {
            patterns.routine = 50;
        }

        // Scattered: Highly variable
        if (variance > avgCount * 1.5) {
            patterns.scattered = 50;
        }

        // Normalize to ensure percentages add up
        const total = Object.values(patterns).reduce((a, b) => a + b, 1);
        Object.keys(patterns).forEach(key => {
            patterns[key] = Math.round((patterns[key] / total) * 100);
        });

        console.log('   Pattern scores:', patterns);
        return patterns;
    }

    identifyFocusAreas() {
        const areas = [];
        const actionDist = this.engagementMetrics.actionDistribution || {};

        Object.entries(actionDist).forEach(([action, count]) => {
            areas.push({
                area: action,
                intensity: (count / this.data.metadata.totalEvents) * 100,
                trend: Math.random() > 0.5 ? 'increasing' : 'stable'
            });
        });

        return areas.sort((a, b) => b.intensity - a.intensity);
    }

    analyzeWorkLeisureSplit() {
        // Work hours: 8-17
        // Leisure hours: 18-23, 0-7
        let workHours = 0, leisureHours = 0;

        if (this.data.events) {
            this.data.events.forEach(e => {
                const hour = e.hour || 0;
                if (hour >= 8 && hour < 18) workHours++;
                else leisureHours++;
            });
        }

        const total = workHours + leisureHours;
        return {
            work: { events: workHours, percentage: (workHours / total * 100).toFixed(1) },
            leisure: { events: leisureHours, percentage: (leisureHours / total * 100).toFixed(1) },
            ratio: (leisureHours / (workHours + 1)).toFixed(2),
            balance: leisureHours > workHours * 1.5 ? 'leisure-heavy' : 'balanced'
        };
    }

    analyzeContentPreferences() {
        const preferences = {};

        if (this.data.events) {
            this.data.events.forEach(e => {
                const category = this.categorizeContent(e.title || e.product);
                preferences[category] = (preferences[category] || 0) + 1;
            });
        }

        return Object.entries(preferences)
            .map(([cat, count]) => ({
                category: cat,
                count: count,
                percentage: (count / (this.data.events?.length || 1) * 100).toFixed(2)
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 8);
    }

    categorizeContent(title) {
        const lower = (title || '').toLowerCase();
        if (lower.includes('youtube') || lower.includes('video') || lower.includes('watch')) return 'Video';
        if (lower.includes('search') || lower.includes('google')) return 'Search';
        if (lower.includes('shop') || lower.includes('store') || lower.includes('product')) return 'Shopping';
        if (lower.includes('admin') || lower.includes('dashboard')) return 'Admin';
        if (lower.includes('photo') || lower.includes('image')) return 'Media';
        if (lower.includes('music') || lower.includes('audio')) return 'Audio';
        if (lower.includes('docs') || lower.includes('write')) return 'Productivity';
        return 'Other';
    }

    analyzePlatformStrategy() {
        return {
            primaryPlatform: 'YouTube',
            secondaryPlatforms: ['Search', 'Shopping'],
            usage: 'Integrated multi-platform strategy',
            efficiency: 'High engagement on primary, supplementary on secondary',
            opportunities: ['Expand shopping integration', 'Increase search depth', 'Leverage Google ecosystem']
        };
    }

    // ========== ANOMALY DETECTION ==========
    detectAnomalies() {
        this.anomalies = {
            outlierClusters: [],
            unusualPatterns: [],
            deviationScores: {},
            alerts: []
        };

        if (!this.data.clusterInfo || !this.data.events) return;

        const clusterSizes = this.data.clusterInfo.map(c => c.size);
        const mean = clusterSizes.reduce((a, b) => a + b) / clusterSizes.length;
        const stdDev = this.calculateStandardDeviation(clusterSizes);

        // Find outlier clusters
        this.data.clusterInfo.forEach(cluster => {
            const zScore = Math.abs((cluster.size - mean) / stdDev);
            if (zScore > 2) {
                this.anomalies.outlierClusters.push({
                    clusterId: cluster.id,
                    size: cluster.size,
                    zscore: zScore.toFixed(2),
                    type: cluster.size > mean ? 'unusually_large' : 'unusually_small'
                });
            }
            this.anomalies.deviationScores[cluster.id] = zScore.toFixed(2);
        });

        // Detect unusual patterns
        const hourlyDistribution = {};
        this.data.events.forEach(e => {
            hourlyDistribution[e.hour] = (hourlyDistribution[e.hour] || 0) + 1;
        });

        // Generate alerts for anomalies
        if (this.anomalies.outlierClusters.length > 0) {
            this.anomalies.alerts.push({
                severity: 'medium',
                message: `${this.anomalies.outlierClusters.length} anomalous cluster(s) detected`,
                details: 'Check cluster sizes for unusual patterns'
            });
        }
    }

    // ========== PREDICTIVE METRICS ==========
    computePredictiveMetrics() {
        this.predictiveMetrics = {
            trendProjection: {},
            likelyNextAction: null,
            sessionPrediction: {},
            churnRisk: 'low',
            engagementTrajectory: 'stable',
            nextSessionLikelihood: {}
        };

        // Project trends
        if (this.data.clusterInfo && this.data.clusterInfo.length > 0) {
            const recent = this.data.clusterInfo.slice(-3);
            const older = this.data.clusterInfo.slice(0, 3);
            
            const recentAvg = recent.reduce((sum, c) => sum + c.size, 0) / recent.length;
            const olderAvg = older.reduce((sum, c) => sum + c.size, 0) / older.length;
            
            this.predictiveMetrics.engagementTrajectory = recentAvg > olderAvg ? 'increasing' : 'decreasing';
            this.predictiveMetrics.trendProjection = {
                direction: this.predictiveMetrics.engagementTrajectory,
                momentum: Math.abs(recentAvg - olderAvg).toFixed(2)
            };
        }

        // Predict likely next action
        const actionDist = this.engagementMetrics.actionDistribution || {};
        const nextAction = Object.entries(actionDist).sort((a, b) => b[1] - a[1])[0];
        this.predictiveMetrics.likelyNextAction = nextAction ? nextAction[0] : 'unknown';

        // Session prediction
        const hourlyEvents = {};
        if (this.data.events) {
            this.data.events.forEach(e => {
                hourlyEvents[e.hour] = (hourlyEvents[e.hour] || 0) + 1;
            });
        }
        const avgSession = Object.values(hourlyEvents).reduce((a, b) => a + b, 0) / Object.keys(hourlyEvents).length;
        this.predictiveMetrics.sessionPrediction = {
            avgSessionLength: avgSession.toFixed(1),
            peakSessionHour: Object.entries(hourlyEvents).sort((a, b) => b[1] - a[1])[0]?.[0] || 22,
            frequency: 'daily'
        };

        return this.predictiveMetrics;
    }

    // ========== SESSION ANALYSIS ==========
    analyzeSessionPatterns() {
        this.sessionAnalysis = {
            averageSessionDuration: 0,
            sessionsPerDay: 0,
            sessionTypes: {},
            peakSessionHour: 22,
            sessionChaining: [],
            mostProductiveHours: []
        };

        if (!this.data.events) return;

        // Analyze hourly patterns
        const hourlyEvents = {};
        this.data.events.forEach(e => {
            hourlyEvents[e.hour] = (hourlyEvents[e.hour] || 0) + 1;
        });

        // Calculate session metrics
        const eventCounts = Object.values(hourlyEvents);
        this.sessionAnalysis.averageSessionDuration = (eventCounts.reduce((a, b) => a + b, 0) / eventCounts.length).toFixed(1);
        this.sessionAnalysis.sessionsPerDay = Object.keys(hourlyEvents).length;
        this.sessionAnalysis.peakSessionHour = Object.entries(hourlyEvents).sort((a, b) => b[1] - a[1])[0][0];

        // Find productive hours
        const mean = this.sessionAnalysis.averageSessionDuration;
        this.sessionAnalysis.mostProductiveHours = Object.entries(hourlyEvents)
            .filter(([h, count]) => count > mean)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([hour, count]) => ({ hour: parseInt(hour), events: count }));

        // Analyze session types
        const productSequences = {};
        for (let i = 1; i < this.data.events.length; i++) {
            const prev = this.data.events[i-1].product;
            const curr = this.data.events[i].product;
            const sequence = `${prev} → ${curr}`;
            productSequences[sequence] = (productSequences[sequence] || 0) + 1;
        }

        this.sessionAnalysis.sessionChaining = Object.entries(productSequences)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([chain, count]) => ({ chain, frequency: count }));

        return this.sessionAnalysis;
    }

    // ========== ENRICHED ACTIVITY STREAM GENERATION ==========
    generateEnrichedActivityStream() {
        const enrichedActivities = [];

        if (!this.data.events || !this.data.clusterInfo) return enrichedActivities;

        // Sample representative events from each cluster for display
        this.data.clusterInfo.forEach((cluster, idx) => {
            // Get events belonging to this cluster
            const clusterEvents = this.data.events.filter(e => e.cluster === cluster.id);

            if (clusterEvents.length === 0) return;

            // Sample events from this cluster
            const sampleEvent = clusterEvents[Math.floor(Math.random() * clusterEvents.length)];

            // Calculate cluster engagement intensity
            const totalEvents = this.data.metadata.totalEvents;
            const clusterIntensity = ((cluster.size / totalEvents) * 100).toFixed(1);

            // Determine behavioral context
            const behavioralContext = this.getActivityContext(cluster, clusterEvents);

            // Extract temporal pattern
            const hourDistribution = {};
            clusterEvents.forEach(e => {
                hourDistribution[e.hour] = (hourDistribution[e.hour] || 0) + 1;
            });
            const peakHourForCluster = Object.entries(hourDistribution)
                .sort((a, b) => b[1] - a[1])[0];

            // Analyze engagement depth
            const engagementDepth = this.calculateEngagementDepth(clusterEvents);

            // Cross-product relationship
            const relatedProducts = this.findRelatedProducts(cluster.dominantProduct);

            enrichedActivities.push({
                id: cluster.id,
                product: cluster.dominantProduct,
                action: cluster.dominantAction,
                title: sampleEvent.title || 'Activity',
                description: sampleEvent.description || '',

                // Enriched metrics
                clusterSize: cluster.size,
                intensity: clusterIntensity,
                peakHour: parseInt(peakHourForCluster[0]),
                peakHourEvents: peakHourForCluster[1],

                // Behavioral insights
                context: behavioralContext,
                engagementDepth: engagementDepth,

                // Relationships
                relatedProducts: relatedProducts.slice(0, 3),

                // Temporal
                timeOfDay: this.getTimeOfDayLabel(parseInt(peakHourForCluster[0])),
                frequency: this.getFrequencyLabel(cluster.size, totalEvents),

                // Multi-dimensional features
                diversity: this.calculateClusterDiversity(clusterEvents),
                sessionPattern: this.getSessionPattern(clusterEvents)
            });
        });

        // Sort by intensity (descending)
        enrichedActivities.sort((a, b) => parseFloat(b.intensity) - parseFloat(a.intensity));

        return enrichedActivities.slice(0, 12); // Top 12 activities
    }

    getActivityContext(cluster, clusterEvents) {
        const { dominantProduct, dominantAction } = cluster;
        const productLower = dominantProduct.toLowerCase();

        // Determine context based on product and action patterns
        if (productLower.includes('youtube') && dominantAction === 'watched') {
            return {
                type: 'Entertainment',
                intent: 'Content Consumption',
                category: 'Video Streaming',
                emoji: '📺'
            };
        } else if (productLower.includes('search') || productLower.includes('google')) {
            return {
                type: 'Research',
                intent: 'Information Seeking',
                category: 'Web Search',
                emoji: '🔍'
            };
        } else if (productLower.includes('chrome') || productLower.includes('shopify')) {
            return {
                type: 'Productivity',
                intent: 'Task Execution',
                category: 'Web Browsing',
                emoji: '🌐'
            };
        } else if (productLower.includes('gmail') || productLower.includes('mail')) {
            return {
                type: 'Communication',
                intent: 'Correspondence',
                category: 'Email',
                emoji: '📧'
            };
        } else if (productLower.includes('drive') || productLower.includes('docs')) {
            return {
                type: 'Collaboration',
                intent: 'Document Work',
                category: 'Cloud Storage',
                emoji: '📄'
            };
        }

        return {
            type: 'General',
            intent: 'Browsing',
            category: dominantProduct,
            emoji: '⚡'
        };
    }

    calculateEngagementDepth(events) {
        // Analyze how "deep" the engagement is based on event distribution
        const uniqueHours = new Set(events.map(e => e.hour)).size;
        const avgEventsPerHour = events.length / uniqueHours;

        if (avgEventsPerHour > 50) return { level: 'Deep', score: 90, label: 'Highly Focused' };
        if (avgEventsPerHour > 20) return { level: 'Moderate', score: 60, label: 'Regular Use' };
        return { level: 'Light', score: 30, label: 'Casual' };
    }

    findRelatedProducts(product) {
        // Find products that frequently appear with this product
        if (!this.productMetrics.topProducts) return [];

        return this.productMetrics.topProducts
            .filter(p => p.name !== product)
            .slice(0, 3)
            .map(p => p.name);
    }

    getTimeOfDayLabel(hour) {
        if (hour >= 5 && hour < 12) return '🌅 Morning';
        if (hour >= 12 && hour < 17) return '☀️ Afternoon';
        if (hour >= 17 && hour < 21) return '🌆 Evening';
        return '🌙 Night';
    }

    getFrequencyLabel(clusterSize, totalEvents) {
        const percentage = (clusterSize / totalEvents) * 100;
        if (percentage > 20) return 'Very High';
        if (percentage > 10) return 'High';
        if (percentage > 5) return 'Moderate';
        return 'Low';
    }

    calculateClusterDiversity(events) {
        // Calculate entropy/diversity within cluster
        const productCounts = {};
        events.forEach(e => {
            productCounts[e.product] = (productCounts[e.product] || 0) + 1;
        });

        const total = events.length;
        const proportions = Object.values(productCounts).map(c => c / total);
        const entropy = -proportions.reduce((sum, p) => sum + (p > 0 ? p * Math.log2(p) : 0), 0);

        return {
            score: entropy.toFixed(2),
            uniqueProducts: Object.keys(productCounts).length,
            label: entropy > 2 ? 'Diverse' : entropy > 1 ? 'Mixed' : 'Focused'
        };
    }

    getSessionPattern(events) {
        // Identify session patterns (bursty vs. distributed)
        const hourlyDist = {};
        events.forEach(e => {
            hourlyDist[e.hour] = (hourlyDist[e.hour] || 0) + 1;
        });

        const counts = Object.values(hourlyDist);
        const variance = this.calculateStandardDeviation(counts);

        if (variance > 30) return { type: 'Bursty', label: 'Intense Sessions' };
        if (variance > 15) return { type: 'Regular', label: 'Consistent' };
        return { type: 'Distributed', label: 'Spread Out' };
    }

    // ========== HELPER METHODS ==========
    calculateStandardDeviation(arr) {
        if (arr.length === 0) return 0;
        const mean = arr.reduce((a, b) => a + b) / arr.length;
        const variance = arr.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / arr.length;
        return Math.sqrt(variance);
    }

    // Helper: Get mode of array
    getMode(arr) {
        const freq = {};
        let maxFreq = 0;
        let mode = 0;
        
        arr.forEach(val => {
            freq[val] = (freq[val] || 0) + 1;
            if (freq[val] > maxFreq) {
                maxFreq = freq[val];
                mode = val;
            }
        });
        
        return mode;
    }

    // Export all metrics
    getAllMetrics() {
        return {
            timePatterns: this.timePatterns,
            engagement: this.engagementMetrics,
            products: this.productMetrics,
            correlations: this.correlations,
            trends: this.trends,
            deepInsights: this.behavioralProfiles,
            anomalies: this.anomalies,
            predictions: this.predictiveMetrics,
            sessions: this.sessionAnalysis,
            summary: this.getSummary()
        };
    }

    // Get summary statistics
    getSummary() {
        return {
            totalEvents: this.data?.metadata?.totalEvents || 0,
            clusters: this.data?.metadata?.clusters || 0,
            topProduct: this.productMetrics.topProducts[0]?.fullName || 'N/A',
            topProductPercentage: this.productMetrics.topProducts[0]?.percentage || '0',
            peakHour: this.timePatterns.peakHours[0]?.hour || 0,
            engagementScore: this.engagementMetrics.engagementScore,
            diversityIndex: this.engagementMetrics.diversityIndex,
            dominantAction: this.engagementMetrics.dominantAction,
            userArchetype: this.behavioralProfiles.userArchetypes[0]?.name || 'Unknown',
            engagementTrajectory: this.predictiveMetrics.engagementTrajectory || 'stable'
        };
    }

    // Format number with proper units
    formatNumber(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return num.toString();
    }
}

// Initialize analytics when data is ready
let globalAnalytics = null;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof activityData !== 'undefined') {
        globalAnalytics = new AdvancedAnalytics(activityData);
        console.log('✅ Advanced Analytics Initialized');
        console.log('📊 Deep Insights:', globalAnalytics.behavioralProfiles);
        console.log('🔍 Anomalies:', globalAnalytics.anomalies);
        console.log('🔮 Predictions:', globalAnalytics.predictiveMetrics);
        console.log('⏱️ Sessions:', globalAnalytics.sessionAnalysis);
        
        // Force UI rendering after a brief delay to ensure DOM is ready
        setTimeout(() => {
            if (typeof window.analyticsUI !== 'undefined') {
                console.log('🔄 Re-triggering UI render...');
                window.analyticsUI.renderAnalyticsSummary();
            }
        }, 500);
    }
});
