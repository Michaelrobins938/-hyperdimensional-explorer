// Auto-inject design system CSS on all pages
// Ensures consistent styling across the entire site

(function() {
    'use strict';

    // Check if design system is already loaded
    if (document.getElementById('design-system-css')) {
        console.log('✅ Design system already loaded');
        return;
    }

    // Create and inject design system link
    const link = document.createElement('link');
    link.id = 'design-system-css';
    link.rel = 'stylesheet';
    link.href = 'design-system.css';
    link.onload = function() {
        console.log('🎨 Design System CSS loaded successfully');
        document.body.classList.add('design-system-active');
    };
    link.onerror = function() {
        console.warn('⚠️ Could not load design-system.css');
    };

    document.head.appendChild(link);

    console.log('📦 Design System injecting...');
})();
