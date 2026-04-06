/* ══════════════════════════════════════
   MAIN.JS — Portfolio Interactions
   ══════════════════════════════════════ */

(function () {
    'use strict';

    /* ── Mobile Menu ── */
    const menuToggle = document.getElementById('menuToggle');
    const nav = document.getElementById('nav');

    menuToggle.addEventListener('click', () => {
        menuToggle.classList.toggle('open');
        nav.classList.toggle('open');
    });

    // Close menu on link click
    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            menuToggle.classList.remove('open');
            nav.classList.remove('open');
        });
    });


    /* ── Active Nav on Scroll ── */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = nav.querySelectorAll('a[href^="#"]');

    function updateActiveNav() {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollY >= top && scrollY < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav, { passive: true });


    /* ── Portfolio Filters ── */
    const filterTabs = document.getElementById('filterTabs');
    const projectCards = document.querySelectorAll('.project-card');

    filterTabs.addEventListener('click', (e) => {
        const tab = e.target.closest('.tab');
        if (!tab) return;

        // Update active tab
        filterTabs.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const filter = tab.dataset.filter;

        // Filter cards
        projectCards.forEach(card => {
            if (card.dataset.category === filter) {
                card.classList.remove('hidden');
            } else {
                card.classList.add('hidden');
            }
        });
    });


    /* ── Scroll Reveal (Intersection Observer) ── */
    const revealElements = document.querySelectorAll('.reveal, .reveal-children');

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                revealObserver.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));


    /* ── Header shadow on scroll ── */
    const header = document.querySelector('.header');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            header.style.boxShadow = '0 4px 20px rgba(0,0,0,.3)';
        } else {
            header.style.boxShadow = 'none';
        }
    }, { passive: true });


    /* ── Parallax Effect ── */
    const parallaxBgs = document.querySelectorAll('.parallax-bg');
    const heroSection = document.querySelector('.hero');

    function updateParallax() {
        const scrollY = window.scrollY;

        // Hero parallax
        if (heroSection) {
            heroSection.style.setProperty('--parallax-y', (scrollY * 0.4) + 'px');
        }

        // Section parallax backgrounds
        parallaxBgs.forEach(bg => {
            const speed = parseFloat(bg.dataset.speed) || 0.3;
            const section = bg.parentElement;
            const rect = section.getBoundingClientRect();
            const offset = rect.top * speed;
            bg.style.transform = `translateY(${offset}px)`;
        });
    }

    window.addEventListener('scroll', updateParallax, { passive: true });


    /* ── Case cards: click + tilt ── */
    const caseCards = document.querySelectorAll('.case-card[data-href]');

    caseCards.forEach(card => {
        // Click to open demo
        card.addEventListener('click', (e) => {
            if (e.target.closest('.case-link-code')) return;
            window.open(card.dataset.href, '_blank');
        });

        // Tilt on hover
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;
            card.style.transform = `translateY(-4px) perspective(800px) rotateX(${y * -3}deg) rotateY(${x * 3}deg)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });


})();
