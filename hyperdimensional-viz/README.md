# Hyperdimensional Explorer

An interactive visualization tool for exploring high-dimensional data using multiple visualization techniques. This application visualizes Google activity data across 312 dimensions and 8 behavioral clusters.

## Features

- **Multiple Visualization Types**: 10 different visualization techniques
  - Behavioral Cosmos (3D cluster visualization)
  - Parallel Coordinates
  - Temporal Heatmap
  - Activity Network (force-directed graph)
  - State Flow River (animated Sankey-style)
  - UMAP Projection
  - Radial Hierarchy Tree
  - Behavioral Radar
  - Ridge Landscape
  - Chord Transitions

- **Interactive Controls**: Zoom, rotation, filtering, and exploration tools
- **Real-time Animations**: Dynamic visualizations with smooth animations
- **Responsive Design**: Adapts to different screen sizes
- **Dark Mode Aesthetic**: Modern glassmorphism design with dark theme

## Visualizations

### Behavioral Cosmos
3D visualization of 8 behavioral clusters as celestial bodies with orbiting activity points.

### Parallel Coordinates
View all dimensions simultaneously showing individual activity patterns.

### Temporal Heatmap
Activity intensity mapped across time dimensions (days/hours).

### Activity Network
Force-directed graph showing relationships between products and actions.

### State Flow River
Animated transitions between different activity states.

### UMAP Projection
Dimensionality reduction with animated morphing capability.

### Radial Hierarchy
Hierarchical structure as an orbital system.

### Behavioral Radar
Multi-axis profile across 8 behavioral dimensions.

### Ridge Landscape
3D stacked distributions for daily activity patterns.

### Chord Transitions
Circular flow diagram of transitions between product categories.

## Technical Details

- Pure JavaScript (no external libraries required)
- Canvas-based rendering for performance
- Responsive design using CSS Grid and Flexbox
- Modern CSS with variables and animations
- Optimized for 60fps animations

## Data

The visualization uses simulated Google activity data:
- 5,929 total events
- 312 dimensions
- 8 behavioral clusters
- Hourly activity patterns

## Local Development

To run this project locally:

1. Clone the repository
2. Open `index.html` in a modern web browser
3. No build step required - pure HTML/CSS/JS

## GitHub Pages Deployment

This project is set up for GitHub Pages hosting:

1. **Quick Setup**:
   - Fork or clone this repository
   - Go to your repository Settings > Pages
   - Select "Deploy from a branch"
   - Choose "main" branch and "/ (root)" folder
   - Your site will be live at `https://yourusername.github.io/repository-name`

2. **Files Included**:
   - The `index.html` file contains the complete application
   - All dependencies (CSS, JavaScript) are included
   - No build step required for deployment

3. **Customization**:
   - Update the repository name in `package.json` if needed
   - Add a custom favicon.ico file to the root directory
   - Modify the title and meta tags in `index.html`

## Browser Compatibility

- Chrome, Firefox, Safari, Edge (latest versions)
- Canvas API support required
- ES6 JavaScript support required

## License

MIT License - see LICENSE file for details