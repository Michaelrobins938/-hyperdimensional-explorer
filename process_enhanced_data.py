#!/usr/bin/env python
"""
Enhanced Google Activity Data Processing Pipeline
Transforms raw Google Takeout data into visualization-ready format
"""

import json
import pandas as pd
import numpy as np
from datetime import datetime
from collections import Counter
import re

print("Starting Enhanced Data Processing Pipeline...")
print("=" * 60)

# Load the enhanced dataset
print("\nLoading dataset...")
with open(r'C:\Users\Micha\Downloads\google-2025-12-25 (1).json', 'r', encoding='utf-8') as f:
    raw_data = json.load(f)

print(f"Loaded {len(raw_data):,} records")

# Parse and extract features
print("\nExtracting features...")

processed_data = []

def extract_time_from_text(text):
    """Extract hour from time text like '9:45 AM'"""
    if not text or not isinstance(text, str):
        return None

    # Try to find time pattern like "9:45 AM"
    match = re.search(r'(\d{1,2}):(\d{2})\s*(AM|PM)', text)
    if match:
        hour = int(match.group(1))
        meridiem = match.group(3)

        if meridiem == 'PM' and hour != 12:
            hour += 12
        elif meridiem == 'AM' and hour == 12:
            hour = 0

        return hour
    return None

def extract_action(description):
    """Extract action type from description"""
    if not description:
        return 'unknown'

    description_lower = description.lower()

    if 'watched' in description_lower:
        return 'watched'
    elif 'searched' in description_lower:
        return 'searched'
    elif 'visited' in description_lower:
        return 'visited'
    elif 'clicked' in description_lower:
        return 'clicked'
    else:
        return 'other'

for idx, record in enumerate(raw_data):
    product = record.get('hJ7x8b', 'Unknown')
    description = record.get('QTGV3c', '')
    title = record.get('hFYxqd', '')
    time_text = record.get('OXlB7d', '') or record.get('H3Q9vf', '')
    url = record.get('l8sGWb href', '')

    # Extract features
    hour = extract_time_from_text(time_text)
    action = extract_action(description)

    # Combine text for TF-IDF
    combined_text = f"{description} {title}".strip()

    processed_data.append({
        'id': idx,
        'product': product,
        'action': action,
        'title': title,
        'description': description,
        'combined_text': combined_text,
        'hour': hour if hour is not None else 12,  # Default to noon if missing
        'url': url,
        'time_text': time_text
    })

df = pd.DataFrame(processed_data)

print(f"Processed {len(df):,} records")
print(f"\nDataset Overview:")
print(f"   Products: {df['product'].nunique()}")
print(f"   Actions: {df['action'].nunique()}")
print(f"   Time range: {df['hour'].min()}-{df['hour'].max()} hours")

# Show product distribution
print(f"\nTop Products:")
product_counts = df['product'].value_counts().head(10)
for product, count in product_counts.items():
    pct = (count / len(df)) * 100
    print(f"   {product:.<30} {count:>6,} ({pct:>5.1f}%)")

# Show action distribution
print(f"\nAction Types:")
action_counts = df['action'].value_counts()
for action, count in action_counts.items():
    pct = (count / len(df)) * 100
    print(f"   {action:.<30} {count:>6,} ({pct:>5.1f}%)")

# Show hourly distribution
print(f"\nPeak Hours:")
hour_counts = df['hour'].value_counts().sort_index()
top_hours = hour_counts.nlargest(5)
for hour, count in top_hours.items():
    pct = (count / len(df)) * 100
    meridiem = 'PM' if hour >= 12 else 'AM'
    display_hour = hour if hour <= 12 else hour - 12
    if display_hour == 0:
        display_hour = 12
    print(f"   {display_hour:>2}{meridiem:.<28} {count:>6,} ({pct:>5.1f}%)")

# Feature Engineering
print(f"\nEngineering features...")

# One-hot encode products
product_dummies = pd.get_dummies(df['product'], prefix='product')

# One-hot encode actions
action_dummies = pd.get_dummies(df['action'], prefix='action')

# Hour features (cyclical encoding)
df['hour_sin'] = np.sin(2 * np.pi * df['hour'] / 24)
df['hour_cos'] = np.cos(2 * np.pi * df['hour'] / 24)

# TF-IDF on combined text
from sklearn.feature_extraction.text import TfidfVectorizer

print("   Computing TF-IDF features...")
tfidf = TfidfVectorizer(
    max_features=100,
    stop_words='english',
    ngram_range=(1, 2),
    min_df=2
)

text_features = tfidf.fit_transform(df['combined_text'].fillna(''))
text_df = pd.DataFrame(
    text_features.toarray(),
    columns=[f'tfidf_{word}' for word in tfidf.get_feature_names_out()]
)

# Combine all features
feature_matrix = pd.concat([
    product_dummies,
    action_dummies,
    df[['hour_sin', 'hour_cos']].reset_index(drop=True),
    text_df.reset_index(drop=True)
], axis=1)

print(f"Feature matrix: {feature_matrix.shape[0]:,} x {feature_matrix.shape[1]}")

# Dimensionality Reduction (PCA)
print(f"\nApplying PCA dimensionality reduction...")
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler

# Standardize features
scaler = StandardScaler()
features_scaled = scaler.fit_transform(feature_matrix)

# PCA to reduce dimensions
n_components = min(50, features_scaled.shape[1])
pca = PCA(n_components=n_components)
features_pca = pca.fit_transform(features_scaled)

explained_var = pca.explained_variance_ratio_
cumulative_var = np.cumsum(explained_var)

print(f"Reduced to {n_components} components")
print(f"   PC1-5 variance: {', '.join([f'{v*100:.1f}%' for v in explained_var[:5]])}")
print(f"   Cumulative (50D): {cumulative_var[-1]*100:.1f}%")

# Clustering
print(f"\nK-Means clustering...")
from sklearn.cluster import KMeans
from sklearn.metrics import silhouette_score

# Find optimal k using elbow method
inertias = []
silhouettes = []
K_range = range(5, 15)

print("   Testing different k values...")
for k in K_range:
    kmeans = KMeans(n_clusters=k, random_state=42, n_init=10)
    labels = kmeans.fit_predict(features_pca)
    inertias.append(kmeans.inertia_)
    silhouettes.append(silhouette_score(features_pca, labels))

# Choose k=8 for consistency, or pick best silhouette
best_k_idx = np.argmax(silhouettes)
best_k = list(K_range)[best_k_idx]

print(f"   Best k by silhouette: {best_k} (score: {silhouettes[best_k_idx]:.3f})")
print(f"   Using k=10 for richer clustering")

k = 10
kmeans = KMeans(n_clusters=k, random_state=42, n_init=20)
clusters = kmeans.fit_predict(features_pca)
silhouette = silhouette_score(features_pca, clusters)

df['cluster'] = clusters

print(f"Created {k} clusters (silhouette: {silhouette:.3f})")

# Analyze clusters
print(f"\nCluster Analysis:")
for i in range(k):
    cluster_df = df[df['cluster'] == i]
    count = len(cluster_df)
    pct = (count / len(df)) * 100

    # Find dominant product
    top_product = cluster_df['product'].value_counts().iloc[0]
    top_product_name = cluster_df['product'].value_counts().index[0]
    top_product_pct = (top_product / count) * 100

    # Find dominant action
    top_action = cluster_df['action'].value_counts().index[0]

    print(f"   Cluster {i}: {count:>5,} ({pct:>4.1f}%) - {top_product_name} ({top_product_pct:.0f}%) [{top_action}]")

# Generate output for visualizations
print(f"\nGenerating visualization data...")

output_data = {
    'metadata': {
        'total_events': len(df),
        'features': {
            'original': feature_matrix.shape[1],
            'pca': features_pca.shape[1]
        },
        'clusters': k,
        'silhouette_score': float(silhouette),
        'pca_variance': {
            f'PC{i+1}': float(explained_var[i]) for i in range(min(10, len(explained_var)))
        },
        'cumulative_variance': float(cumulative_var[-1]),
        'products': df['product'].nunique(),
        'actions': df['action'].nunique()
    },
    'events': []
}

# Add event data with PCA coordinates
for idx, row in df.iterrows():
    event = {
        'id': int(row['id']),
        'product': row['product'],
        'action': row['action'],
        'title': row['title'][:100] if row['title'] else '',  # Truncate for size
        'description': row['description'][:100] if row['description'] else '',
        'hour': int(row['hour']),
        'cluster': int(row['cluster']),
        'pca': features_pca[idx][:10].tolist()  # First 10 PCA components for viz
    }
    output_data['events'].append(event)

# Save to JSON
output_path = r'C:\Users\Micha\.gemini\antigravity\scratch\ultra-hyperdimensional-viz\processed_data.json'
with open(output_path, 'w', encoding='utf-8') as f:
    json.dump(output_data, f, indent=2)

print(f"Saved processed data to: processed_data.json")

# Generate JavaScript data.js file
print(f"\nGenerating data.js for visualizations...")

js_content = f'''// Enhanced Google Activity Data
// Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
// Records: {len(df):,} | Features: {feature_matrix.shape[1]} → {features_pca.shape[1]} (PCA)
// Clusters: {k} | Silhouette: {silhouette:.3f}

const activityData = {{
    metadata: {{
        totalEvents: {len(df)},
        originalDimensions: {feature_matrix.shape[1]},
        pcaDimensions: {features_pca.shape[1]},
        clusters: {k},
        silhouetteScore: {silhouette:.3f},
        products: {df['product'].nunique()},
        actions: {df['action'].nunique()},
        pcaVariance: {json.dumps({f'PC{i+1}': float(explained_var[i]) for i in range(min(10, len(explained_var)))})}
    }},

    clusterInfo: [
'''

# Add cluster summaries
for i in range(k):
    cluster_df = df[df['cluster'] == i]
    count = len(cluster_df)
    pct = (count / len(df)) * 100

    top_product = cluster_df['product'].value_counts().index[0]
    top_action = cluster_df['action'].value_counts().index[0]

    # Get peak hour
    peak_hour = cluster_df['hour'].mode()[0] if len(cluster_df['hour'].mode()) > 0 else 12

    js_content += f'''        {{
            id: {i},
            size: {count},
            percentage: {pct:.1f},
            dominantProduct: "{top_product}",
            dominantAction: "{top_action}",
            peakHour: {peak_hour},
            name: "Cluster {i}"
        }}{',' if i < k-1 else ''}
'''

js_content += '''    ],

    events: [
'''

# Add sample events (limit to prevent huge file)
sample_size = min(len(df), 10000)
sample_indices = np.random.choice(len(df), sample_size, replace=False)

for idx_num, idx in enumerate(sample_indices):
    row = df.iloc[idx]
    pca_coords = features_pca[idx][:5].tolist()

    js_content += f'''        {{
            id: {int(row['id'])},
            product: "{row['product']}",
            action: "{row['action']}",
            title: "{row['title'][:50].replace('"', "'")}",
            hour: {int(row['hour'])},
            cluster: {int(row['cluster'])},
            pca: {json.dumps(pca_coords)}
        }}{',' if idx_num < sample_size-1 else ''}
'''

js_content += '''    ]
};

// Export for use in visualizations
if (typeof module !== 'undefined' && module.exports) {
    module.exports = activityData;
}
'''

js_output_path = r'C:\Users\Micha\.gemini\antigravity\scratch\ultra-hyperdimensional-viz\data.js'
with open(js_output_path, 'w', encoding='utf-8') as f:
    f.write(js_content)

print(f"Saved data.js ({sample_size:,} events)")

print("\n" + "=" * 60)
print("Processing Complete!")
print("=" * 60)
print(f"\nFinal Stats:")
print(f"   Total Events: {len(df):,}")
print(f"   Dimensions: {feature_matrix.shape[1]} -> {features_pca.shape[1]} (PCA)")
print(f"   Clusters: {k}")
print(f"   Silhouette Score: {silhouette:.3f}")
print(f"   Top Product: {df['product'].value_counts().index[0]} ({(df['product'].value_counts().iloc[0]/len(df)*100):.1f}%)")
print(f"\nReady for visualization!")
