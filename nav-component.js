// Unified Navigation Component for Hyperdimensional Visualizer
// Automatically determines current page and highlights active navigation

const NAVIGATION_PAGES = [
    {
        id: 'portfolio',
        title: 'Portfolio',
        path: 'index.html',
        icon: '📊',
        description: 'Data Visualization Journey'
    },
    {
        id: 'explorer',
        title: 'Explorer',
        path: 'hyperdimensional-viz/hyperdimensional-explorer-standalone.html',
        icon: '🔮',
        description: 'Hyperdimensional Explorer'
    },
    {
        id: 'ultimate',
        title: 'Ultimate',
        path: 'hyperdimensional-viz/ultimate-explorer.html',
        icon: '✨',
        description: 'Ultimate Explorer'
    },
    {
        id: 'analytics',
        title: 'Analytics',
        path: 'analytics.html',
        icon: '📈',
        description: 'Activity Analytics Dashboard'
    }
];

class NavigationComponent {
    constructor() {
        this.currentPage = this.detectCurrentPage();
        this.init();
    }

    detectCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop();

        // Portfolio is now index.html (landing page)
        if (filename === 'index.html' || filename === '') return 'portfolio';

        // Analytics is now analytics.html
        if (filename === 'analytics.html') return 'analytics';

        // Check if we're in the hyperdimensional-viz subfolder
        if (path.includes('hyperdimensional-viz/')) {
            if (filename === 'hyperdimensional-explorer-standalone.html') return 'explorer';
            if (filename === 'ultimate-explorer.html') return 'ultimate';
        }

        return 'portfolio'; // default to portfolio
    }

    init() {
        this.injectCSS();
        this.render();
        this.attachEventListeners();
    }

    injectCSS() {
        const style = document.createElement('style');
        style.textContent = `
            /* Navigation Component Styles */
            .hyperdim-nav {
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 10000;
                display: flex;
                gap: 0.5rem;
                align-items: center;
            }

            .nav-toggle {
                width: 50px;
                height: 50px;
                border-radius: 50%;
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.9), rgba(236, 72, 153, 0.9));
                border: 2px solid rgba(255, 255, 255, 0.2);
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                box-shadow: 0 4px 20px rgba(139, 92, 246, 0.4);
                backdrop-filter: blur(10px);
            }

            .nav-toggle:hover {
                transform: scale(1.1) rotate(90deg);
                box-shadow: 0 8px 30px rgba(139, 92, 246, 0.6);
            }

            .nav-toggle.active {
                background: linear-gradient(135deg, rgba(236, 72, 153, 0.9), rgba(139, 92, 246, 0.9));
                transform: rotate(90deg);
            }

            .nav-menu {
                display: flex;
                gap: 0.5rem;
                opacity: 0;
                transform: translateX(20px);
                pointer-events: none;
                transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .nav-menu.open {
                opacity: 1;
                transform: translateX(0);
                pointer-events: all;
            }

            .nav-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 0.25rem;
                padding: 0.75rem 1rem;
                background: rgba(15, 15, 25, 0.9);
                border: 1px solid rgba(139, 92, 246, 0.3);
                border-radius: 12px;
                cursor: pointer;
                text-decoration: none;
                color: #f8fafc;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
                backdrop-filter: blur(10px);
                min-width: 80px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            }

            .nav-item:hover {
                transform: translateY(-4px);
                background: rgba(139, 92, 246, 0.2);
                border-color: rgba(139, 92, 246, 0.6);
                box-shadow: 0 8px 24px rgba(139, 92, 246, 0.4);
            }

            .nav-item.active {
                background: linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(236, 72, 153, 0.3));
                border-color: rgba(139, 92, 246, 0.8);
                box-shadow: 0 0 20px rgba(139, 92, 246, 0.5);
            }

            .nav-item .icon {
                font-size: 1.5rem;
                line-height: 1;
            }

            .nav-item .title {
                font-size: 0.75rem;
                font-weight: 600;
                white-space: nowrap;
            }

            .nav-item .desc {
                font-size: 0.625rem;
                color: #94a3b8;
                white-space: nowrap;
                opacity: 0;
                max-height: 0;
                overflow: hidden;
                transition: all 0.3s ease;
            }

            .nav-item:hover .desc {
                opacity: 1;
                max-height: 20px;
            }

            /* Mobile responsiveness */
            @media (max-width: 768px) {
                .hyperdim-nav {
                    top: 10px;
                    right: 10px;
                }

                .nav-menu {
                    flex-direction: column;
                }

                .nav-item {
                    min-width: 60px;
                    padding: 0.5rem 0.75rem;
                }

                .nav-item .desc {
                    display: none;
                }
            }

            /* Entrance animation */
            @keyframes navSlideIn {
                from {
                    opacity: 0;
                    transform: translateY(-20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .hyperdim-nav {
                animation: navSlideIn 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
            }
        `;
        document.head.appendChild(style);
    }

    render() {
        console.log('[Navigation] Rendering navigation for page:', this.currentPage);
        console.log('[Navigation] Current pathname:', window.location.pathname);

        const nav = document.createElement('div');
        nav.className = 'hyperdim-nav';
        nav.innerHTML = `
            <div class="nav-menu" id="nav-menu">
                ${NAVIGATION_PAGES.map(page => this.renderNavItem(page)).join('')}
            </div>
            <button class="nav-toggle" id="nav-toggle" aria-label="Toggle Navigation">
                🎯
            </button>
        `;

        document.body.appendChild(nav);

        // Log all generated links for debugging
        setTimeout(() => {
            const links = document.querySelectorAll('.nav-item');
            console.log('[Navigation] Generated links:');
            links.forEach(link => {
                console.log(`  ${link.querySelector('.title').textContent}: ${link.href}`);
            });
        }, 100);
    }

    renderNavItem(page) {
        const isActive = this.currentPage === page.id;
        const activeClass = isActive ? 'active' : '';

        return `
            <a href="${this.getRelativePath(page.path)}"
               class="nav-item ${activeClass}"
               data-page="${page.id}"
               title="${page.description}">
                <span class="icon">${page.icon}</span>
                <span class="title">${page.title}</span>
                <span class="desc">${page.description}</span>
            </a>
        `;
    }

    getRelativePath(targetPath) {
        const currentPath = window.location.pathname;
        let finalPath;

        // If we're in hyperdimensional-viz folder
        if (currentPath.includes('hyperdimensional-viz/')) {
            if (targetPath.startsWith('hyperdimensional-viz/')) {
                // Same folder, just use filename
                finalPath = targetPath.split('/').pop();
            } else {
                // Going up to root
                finalPath = '../' + targetPath;
            }
        } else {
            // We're in root
            finalPath = targetPath;
        }

        console.log(`[Navigation] Current: ${currentPath} | Target: ${targetPath} | Final: ${finalPath}`);
        return finalPath;
    }

    attachEventListeners() {
        const toggle = document.getElementById('nav-toggle');
        const menu = document.getElementById('nav-menu');

        if (toggle && menu) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                menu.classList.toggle('open');
                toggle.classList.toggle('active');
            });

            // Close menu when clicking outside
            document.addEventListener('click', (e) => {
                if (!e.target.closest('.hyperdim-nav')) {
                    menu.classList.remove('open');
                    toggle.classList.remove('active');
                }
            });

            // Close menu on escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    menu.classList.remove('open');
                    toggle.classList.remove('active');
                }
            });
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new NavigationComponent();
    });
} else {
    new NavigationComponent();
}
