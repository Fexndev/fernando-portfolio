/* ══════════════════════════════════════
   HERO-3D.JS — Three.js interactive wireframe
   ══════════════════════════════════════ */

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.161.0/build/three.module.js';

const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const canvas = document.querySelector('.hero-3d-canvas');
if (!canvas || prefersReduced) {
    // Nothing to do
} else {
    initHero3D(canvas);
}

function initHero3D(canvas) {
    const wrap = canvas.parentElement;

    // ── Check WebGL
    let gl = null;
    try {
        gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    } catch (e) { /* ignore */ }
    if (!gl) {
        // Fallback: show CSS 3D cube
        canvas.style.display = 'none';
        const fallback = document.createElement('div');
        fallback.className = 'hero-3d-fallback';
        wrap.appendChild(fallback);
        return;
    }

    // ── Theme colors (match CSS tokens)
    const THEMES = {
        home:      new THREE.Color(0x5eead4),
        sobre:     new THREE.Color(0x99f6e4),
        servicos:  new THREE.Color(0xa78bfa),
        portfolio: new THREE.Color(0xf0a050),
        contato:   new THREE.Color(0x4ade80),
    };
    let currentColor = THEMES.home.clone();
    let targetColor  = THEMES.home.clone();

    // ── Setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);
    camera.position.z = 4.2;

    const renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // ── Geometry: icosahedron wireframe + inner core
    const geom = new THREE.IcosahedronGeometry(1.3, 1);
    const wire = new THREE.WireframeGeometry(geom);

    const mat = new THREE.LineBasicMaterial({
        color: currentColor,
        transparent: true,
        opacity: 0.85,
    });
    const mesh = new THREE.LineSegments(wire, mat);
    scene.add(mesh);

    // Inner glowing core (small solid icosahedron)
    const coreGeom = new THREE.IcosahedronGeometry(0.45, 0);
    const coreMat = new THREE.MeshBasicMaterial({
        color: currentColor,
        transparent: true,
        opacity: 0.08,
        wireframe: false,
    });
    const core = new THREE.Mesh(coreGeom, coreMat);
    scene.add(core);

    // Particle field
    const pCount = 80;
    const pGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount; i++) {
        const r = 2.1 + Math.random() * 1.2;
        const t = Math.random() * Math.PI * 2;
        const p = Math.acos(2 * Math.random() - 1);
        positions[i*3]   = r * Math.sin(p) * Math.cos(t);
        positions[i*3+1] = r * Math.sin(p) * Math.sin(t);
        positions[i*3+2] = r * Math.cos(p);
    }
    pGeom.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
        color: currentColor,
        size: 0.035,
        transparent: true,
        opacity: 0.6,
    });
    const particles = new THREE.Points(pGeom, pMat);
    scene.add(particles);

    // ── Resize
    function resize() {
        const rect = wrap.getBoundingClientRect();
        const size = Math.min(rect.width, rect.height);
        if (size <= 0) return;
        renderer.setSize(size, size, false);
        camera.aspect = 1;
        camera.updateProjectionMatrix();
    }
    resize();
    window.addEventListener('resize', resize);

    // ── Interaction: drag to rotate
    let isDragging = false;
    let lastX = 0, lastY = 0;
    let rotVelX = 0, rotVelY = 0;
    let targetRotX = 0, targetRotY = 0;

    canvas.addEventListener('pointerdown', (e) => {
        isDragging = true;
        lastX = e.clientX;
        lastY = e.clientY;
        canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove', (e) => {
        if (!isDragging) {
            // Subtle tracking on hover
            const rect = canvas.getBoundingClientRect();
            const nx = (e.clientX - rect.left) / rect.width - 0.5;
            const ny = (e.clientY - rect.top) / rect.height - 0.5;
            targetRotY = nx * 0.6;
            targetRotX = ny * 0.4;
            return;
        }
        const dx = e.clientX - lastX;
        const dy = e.clientY - lastY;
        rotVelY = dx * 0.005;
        rotVelX = dy * 0.005;
        mesh.rotation.y += rotVelY;
        mesh.rotation.x += rotVelX;
        core.rotation.copy(mesh.rotation);
        lastX = e.clientX;
        lastY = e.clientY;
    });
    canvas.addEventListener('pointerup', () => {
        isDragging = false;
    });
    canvas.addEventListener('pointerleave', () => {
        isDragging = false;
        targetRotX = 0;
        targetRotY = 0;
    });

    // ── Scroll-linked scale & rotation
    let scrollProgress = 0;
    window.addEventListener('scroll', () => {
        const h = document.documentElement;
        scrollProgress = h.scrollTop / (h.scrollHeight - h.clientHeight);
    }, { passive: true });

    // ── Active section → color
    const sections = [
        { id: 'inicio',     el: document.querySelector('.hero'),           color: THEMES.home },
        { id: 'sobre',      el: document.getElementById('sobre'),          color: THEMES.sobre },
        { id: 'servicos',   el: document.getElementById('servicos'),       color: THEMES.servicos },
        { id: 'portfolio',  el: document.getElementById('portfolio'),      color: THEMES.portfolio },
        { id: 'contato',    el: document.getElementById('contato'),        color: THEMES.contato },
    ].filter(s => s.el);

    function updateThemeFromScroll() {
        const sy = window.scrollY + window.innerHeight * 0.4;
        for (let i = sections.length - 1; i >= 0; i--) {
            const s = sections[i];
            if (sy >= s.el.offsetTop) {
                targetColor = s.color;
                return;
            }
        }
        targetColor = THEMES.home;
    }
    window.addEventListener('scroll', updateThemeFromScroll, { passive: true });
    updateThemeFromScroll();

    // ── Animation loop
    let running = true;
    let rafId = null;

    function tick() {
        if (!running) return;
        // Auto rotation (slow)
        if (!isDragging) {
            rotVelX *= 0.95;
            rotVelY *= 0.95;
            mesh.rotation.y += 0.0028 + rotVelY;
            mesh.rotation.x += 0.0012 + rotVelX;
            // hover tracking blend
            mesh.rotation.x += (targetRotX - (mesh.rotation.x % (Math.PI*2))) * 0.01;
            mesh.rotation.y += (targetRotY - (mesh.rotation.y % (Math.PI*2))) * 0.01;
        }
        core.rotation.y -= 0.002;
        core.rotation.x += 0.001;
        particles.rotation.y += 0.0006;
        particles.rotation.x += 0.0004;

        // Scroll-linked scale (subtle zoom out)
        const s = 1 - scrollProgress * 0.18;
        mesh.scale.setScalar(s);
        core.scale.setScalar(s);

        // Color lerp
        currentColor.lerp(targetColor, 0.04);
        mat.color.copy(currentColor);
        coreMat.color.copy(currentColor);
        pMat.color.copy(currentColor);

        renderer.render(scene, camera);
        rafId = requestAnimationFrame(tick);
    }
    rafId = requestAnimationFrame(tick);

    // ── Pause when hero out of viewport
    const visObs = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                if (!running) {
                    running = true;
                    rafId = requestAnimationFrame(tick);
                }
            } else {
                running = false;
                if (rafId) cancelAnimationFrame(rafId);
            }
        });
    }, { threshold: 0 });
    visObs.observe(wrap);

    // ── Pause when tab hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            running = false;
            if (rafId) cancelAnimationFrame(rafId);
        } else if (wrap.getBoundingClientRect().bottom > 0) {
            running = true;
            rafId = requestAnimationFrame(tick);
        }
    });
}
