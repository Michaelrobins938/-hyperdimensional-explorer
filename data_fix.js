
// Replace the compatibility layer at the end of data.js
// Compatibility layer for old visualizations expecting DATA variable
const DATA = {
    events: activityData.events,
    clusters: activityData.clusterInfo, // clusterInfo is already an array
    metadata: activityData.metadata
};

// Cluster colors for visualizations
const CLUSTER_COLORS = [
    '#8b5cf6', // Purple - Cluster 0
    '#ec4899', // Pink - Cluster 1
    '#06b6d4', // Cyan - Cluster 2
    '#10b981', // Green - Cluster 3
    '#f59e0b', // Orange - Cluster 4
    '#3b82f6', // Blue - Cluster 5
    '#f43f5e', // Red - Cluster 6
    '#a855f7', // Violet - Cluster 7
    '#14b8a6', // Teal - Cluster 8
    '#eab308'  // Yellow - Cluster 9
];
