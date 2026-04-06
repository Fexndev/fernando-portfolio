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


    /* ── Cases Carousel: arrow navigation ── */
    const casesTrack = document.querySelector('.cases-track');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');

    if (casesTrack && prevBtn && nextBtn) {
        let offset = 0;

        function getCardStep() {
            const card = casesTrack.querySelector('.case-card');
            if (!card) return 400;
            return card.offsetWidth + parseFloat(getComputedStyle(casesTrack).gap);
        }

        function getMaxOffset() {
            const carousel = casesTrack.parentElement;
            return Math.max(0, casesTrack.scrollWidth - carousel.offsetWidth);
        }

        function updateArrows() {
            prevBtn.disabled = offset <= 0;
            nextBtn.disabled = offset >= getMaxOffset();
        }

        function slide(direction) {
            const step = getCardStep();
            const max = getMaxOffset();
            offset = Math.min(max, Math.max(0, offset + step * direction));
            casesTrack.style.transform = `translateX(${-offset}px)`;
            updateArrows();
        }

        prevBtn.addEventListener('click', () => slide(-1));
        nextBtn.addEventListener('click', () => slide(1));

        // Touch swipe
        let touchStartX = 0;
        casesTrack.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        casesTrack.addEventListener('touchend', (e) => {
            const dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 50) slide(dx < 0 ? 1 : -1);
        });

        // Recalc on resize
        window.addEventListener('resize', () => {
            offset = Math.min(offset, getMaxOffset());
            casesTrack.style.transform = `translateX(${-offset}px)`;
            updateArrows();
        });

        updateArrows();
    }

    /* ── Case cards: click + tilt ── */
    function initCaseCards() {
        document.querySelectorAll('.case-card[data-href]').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.case-link-code')) return;
                window.open(card.dataset.href, '_blank');
            });

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
    }
    initCaseCards();


})();
