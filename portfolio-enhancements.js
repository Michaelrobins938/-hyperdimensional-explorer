// Portfolio Enhancements - Advanced Animations & Effects
// Auto-loads and enhances the portfolio page

(function() {
    'use strict';

    console.log('🎨 Portfolio Enhancements Loading...');

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    function init() {
        addParticlesToOrb();
        add3DTiltEffectToCards();
        addScrollAnimations();
        addTypewriterEffect();
        enhanceNavigation();
        console.log('✅ Portfolio Enhancements Complete');
    }

    // Add floating particles around the hero orb
    function addParticlesToOrb() {
        const orbContainer = document.querySelector('.hero-orb-container');
        if (!orbContainer) return;

        const particleCount = 20;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'orb-particle';

            const size = Math.random() * 4 + 2;
            const delay = Math.random() * 5;
            const duration = Math.random() * 3 + 3;
            const angle = (360 / particleCount) * i;

            particle.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                background: rgba(139, 92, 246, ${Math.random() * 0.5 + 0.3});
                border-radius: 50%;
                filter: blur(1px);
                animation: orbit-particle ${duration}s linear ${delay}s infinite;
                transform-origin: 90px 90px;
                left: 50%;
                top: 50%;
                margin-left: -${size/2}px;
                margin-top: -${size/2}px;
                --angle: ${angle}deg;
            `;

            orbContainer.appendChild(particle);
        }

        // Add particle animation CSS
        const style = document.createElement('style');
        style.textContent = `
            @keyframes orbit-particle {
                from {
                    transform: rotate(var(--angle)) translateX(100px) rotate(calc(-1 * var(--angle)));
                    opacity: 0;
                }
                10% { opacity: 1; }
                90% { opacity: 1; }
                to {
                    transform: rotate(calc(var(--angle) + 360deg)) translateX(120px) rotate(calc(-1 * (var(--angle) + 360deg)));
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // Add 3D tilt effect to gallery cards
    function add3DTiltEffectToCards() {
        const cards = document.querySelectorAll('.gallery-item, .pipeline-step');

        cards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                const rotateX = (y - centerY) / 10;
                const rotateY = (centerX - x) / 10;

                card.style.transform = `
                    perspective(1000px)
                    rotateX(${rotateX}deg)
                    rotateY(${rotateY}deg)
                    scale3d(1.02, 1.02, 1.02)
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
            });

            // Add transition
            card.style.transition = 'transform 0.3s ease';
        });
    }

    // Add scroll-triggered animations
    function addScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animated');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -100px 0px'
        });

        // Observe sections
        document.querySelectorAll('.pipeline-step, .gallery-item, .philosophy-text').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.8s ease, transform 0.8s ease';
            observer.observe(el);
        });
    }

    // Add typewriter effect to hero title
    function addTypewriterEffect() {
        const title = document.querySelector('.hero h1');
        if (!title) return;

        const text = title.textContent;
        title.textContent = '';
        title.style.opacity = '1';

        let index = 0;
        const speed = 50; // ms per character

        function type() {
            if (index < text.length) {
                title.textContent += text.charAt(index);
                index++;
                setTimeout(type, speed);
            }
        }

        // Start typing after a short delay
        setTimeout(type, 500);
    }

    // Enhance smooth scrolling navigation
    function enhanceNavigation() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });

        // Add active state to floating nav dots based on scroll
        const sections = document.querySelectorAll('[id^="section-"]');
        const navDots = document.querySelectorAll('.nav-dot');

        window.addEventListener('scroll', () => {
            let current = '';

            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (pageYOffset >= sectionTop - sectionHeight / 3) {
                    current = section.getAttribute('id');
                }
            });

            navDots.forEach((dot, index) => {
                dot.classList.remove('active');
                if (current === `section-${index}`) {
                    dot.classList.add('active');
                }
            });
        });
    }

    // Add parallax effect to background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-orb, .bg-canvas');

        parallaxElements.forEach(el => {
            const speed = el.classList.contains('hero-orb') ? 0.5 : 0.2;
            el.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });

    // Add cursor trail effect (optional, subtle)
    let cursorDots = [];
    document.addEventListener('mousemove', (e) => {
        if (cursorDots.length > 5) {
            const oldest = cursorDots.shift();
            oldest.remove();
        }

        const dot = document.createElement('div');
        dot.className = 'cursor-trail';
        dot.style.cssText = `
            position: fixed;
            width: 6px;
            height: 6px;
            background: radial-gradient(circle, rgba(139, 92, 246, 0.6), transparent);
            border-radius: 50%;
            pointer-events: none;
            z-index: 9999;
            left: ${e.clientX}px;
            top: ${e.clientY}px;
            transform: translate(-50%, -50%);
            animation: fade-trail 0.8s ease-out forwards;
        `;

        document.body.appendChild(dot);
        cursorDots.push(dot);
    });

    // Add trail fade animation
    const trailStyle = document.createElement('style');
    trailStyle.textContent = `
        @keyframes fade-trail {
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(2);
            }
        }
    `;
    document.head.appendChild(trailStyle);

})();
