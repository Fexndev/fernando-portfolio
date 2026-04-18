/* ══════════════════════════════════════
   CARDS-FX.JS — Spotlight + 3D tilt
   ══════════════════════════════════════ */

(function () {
    'use strict';

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;

    const cards = document.querySelectorAll('.servico-card, .project-card, .diferencial-card');
    const tiltMax = 6; // degrees

    cards.forEach(card => {
        card.classList.add('tilt-card');

        card.addEventListener('pointermove', (e) => {
            const r = card.getBoundingClientRect();
            const px = e.clientX - r.left;
            const py = e.clientY - r.top;

            // Spotlight
            card.style.setProperty('--mx', px + 'px');
            card.style.setProperty('--my', py + 'px');

            // Tilt
            const nx = (px / r.width) - 0.5;   // -0.5..0.5
            const ny = (py / r.height) - 0.5;
            const rx = (-ny * tiltMax).toFixed(2);
            const ry = (nx * tiltMax).toFixed(2);
            card.style.setProperty('--rx', rx + 'deg');
            card.style.setProperty('--ry', ry + 'deg');
        });

        card.addEventListener('pointerleave', () => {
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    });

})();
