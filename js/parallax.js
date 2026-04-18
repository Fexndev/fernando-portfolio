/* ══════════════════════════════════════
   PARALLAX.JS — scroll, orbs, cursor, words
   ══════════════════════════════════════ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Split H1 into words for staggered fade-in ── */
    const heroH1 = document.querySelector('.hero h1');
    if (heroH1 && !heroH1.dataset.split) {
        const raw = heroH1.innerHTML;
        // Preserve <br>, split each text segment by whitespace
        const parts = raw.split(/(<br\s*\/?>)/i);
        heroH1.innerHTML = parts.map(part => {
            if (/<br/i.test(part)) return part;
            return part
                .split(/(\s+)/)
                .map(tok => (/^\s+$/.test(tok) || !tok) ? tok : `<span class="word">${tok}</span>`)
                .join('');
        }).join('');
        heroH1.dataset.split = '1';
    }

    if (prefersReduced) return;

    /* ── Scroll progress bar ── */
    const progressBar = document.querySelector('.scroll-progress-bar');
    let lastProgress = 0;

    function updateProgress() {
        const h = document.documentElement;
        const scrolled = h.scrollTop;
        const height = h.scrollHeight - h.clientHeight;
        const p = height > 0 ? (scrolled / height) * 100 : 0;
        if (Math.abs(p - lastProgress) > 0.3) {
            if (progressBar) progressBar.style.width = p + '%';
            lastProgress = p;
        }
    }


    /* ── Orbs parallax (mouse + scroll) ── */
    const orbs = document.querySelectorAll('.orb');
    const hero = document.querySelector('.hero');
    let mouseX = 0, mouseY = 0;
    let targetMouseX = 0, targetMouseY = 0;

    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const rect = hero.getBoundingClientRect();
            targetMouseX = (e.clientX - rect.left) / rect.width - 0.5;
            targetMouseY = (e.clientY - rect.top) / rect.height - 0.5;
        });
        hero.addEventListener('mouseleave', () => {
            targetMouseX = 0;
            targetMouseY = 0;
        });
    }


    /* ── Section parallax (data-parallax speed) ── */
    const parallaxEls = document.querySelectorAll('[data-parallax]');


    /* ── RAF LOOP ── */
    let rafId = null;
    function loop() {
        // Smooth mouse
        mouseX += (targetMouseX - mouseX) * 0.08;
        mouseY += (targetMouseY - mouseY) * 0.08;

        // Orbs react to mouse + scroll
        const sy = window.scrollY;
        orbs.forEach((orb, i) => {
            const depth = (i + 1) * 18;
            const scrollOffset = sy * (0.04 + i * 0.02);
            const x = mouseX * depth;
            const y = mouseY * depth - scrollOffset;
            orb.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0)`;
        });

        // Section elements parallax
        parallaxEls.forEach(el => {
            const speed = parseFloat(el.dataset.parallax) || 0.1;
            const rect = el.getBoundingClientRect();
            const mid = rect.top + rect.height / 2;
            const center = window.innerHeight / 2;
            const delta = (mid - center) * speed;
            el.style.transform = `translate3d(0, ${delta.toFixed(2)}px, 0)`;
        });

        updateProgress();
        rafId = requestAnimationFrame(loop);
    }
    rafId = requestAnimationFrame(loop);


    /* ── Cursor magnetic on .magnet ── */
    const magnets = document.querySelectorAll('.magnet');
    magnets.forEach(el => {
        const strength = 0.35;
        el.addEventListener('mousemove', (e) => {
            const r = el.getBoundingClientRect();
            const x = (e.clientX - (r.left + r.width / 2)) * strength;
            const y = (e.clientY - (r.top + r.height / 2)) * strength;
            el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        });
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
        });
    });


    /* ── Pause RAF when tab hidden ── */
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = null;
        } else if (!rafId) {
            rafId = requestAnimationFrame(loop);
        }
    });

})();
