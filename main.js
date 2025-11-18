import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './visualizer.js';

gsap.registerPlugin(ScrollTrigger);

// ===== CUSTOM CURSOR =====
const cursor = document.querySelector('.custom-cursor');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
});

// Cursor grow effect on interactive elements
const interactiveElements = document.querySelectorAll('a, button, .product-card-luxury, .recommendation-card, .step-card');
interactiveElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('cursor-grow'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('cursor-grow'));
});

// ===== THREE.JS ENHANCED BACKGROUND =====
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
camera.position.z = 8;

// ===== SIMPLE ELEGANT PARTICLES =====
const leafGeometry = new THREE.BufferGeometry();
const leafCount = 200; // Increased from 100
const positions = new Float32Array(leafCount * 3);
const scales = new Float32Array(leafCount);
const colors = new Float32Array(leafCount * 3);

const earthToneColors = [
    new THREE.Color(0xC17459), // Terracotta
    new THREE.Color(0x8B7355), // Taupe
    new THREE.Color(0x7D9D72), // Sage
    new THREE.Color(0xB8C5AE), // Light sage
    new THREE.Color(0xE8DED0)  // Beige
];

for (let i = 0; i < leafCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

    scales[i] = Math.random() * 0.8 + 0.5; // Larger particles

    // Random earth tone color
    const color = earthToneColors[Math.floor(Math.random() * earthToneColors.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}

leafGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
leafGeometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));
leafGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const leafMaterial = new THREE.ShaderMaterial({
    uniforms: {
        time: { value: 0 }
    },
    vertexShader: `
        attribute float scale;
        varying float vScale;
        varying vec3 vColor;
        uniform float time;

        void main() {
            vScale = scale;
            vColor = color;

            vec3 pos = position;
            pos.y += sin(time * 0.5 + position.x) * 0.5;
            pos.x += cos(time * 0.3 + position.y) * 0.3;

            vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
            gl_PointSize = scale * 50.0 * (300.0 / -mvPosition.z);
            gl_Position = projectionMatrix * mvPosition;
        }
    `,
    fragmentShader: `
        varying float vScale;
        varying vec3 vColor;

        void main() {
            vec2 center = gl_PointCoord - vec2(0.5);
            float dist = length(center);

            float leaf = smoothstep(0.5, 0.1, dist);
            float edge = smoothstep(0.5, 0.4, dist);

            vec3 color = vColor;
            color = mix(color * 0.7, color, edge);

            float alpha = leaf * 0.7;

            gl_FragColor = vec4(color, alpha);
        }
    `,
    transparent: true,
    depthWrite: false,
    vertexColors: true
});

const leafParticles = new THREE.Points(leafGeometry, leafMaterial);
scene.add(leafParticles);

// ===== AMBIENT GLOW PARTICLES =====
const glowGeometry = new THREE.BufferGeometry();
const glowCount = 300; // Increased
const glowPositions = new Float32Array(glowCount * 3);
const glowColors = new Float32Array(glowCount * 3);
const glowSizes = new Float32Array(glowCount);

for (let i = 0; i < glowCount; i++) {
    glowPositions[i * 3] = (Math.random() - 0.5) * 35;
    glowPositions[i * 3 + 1] = (Math.random() - 0.5) * 35;
    glowPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const color = earthToneColors[Math.floor(Math.random() * earthToneColors.length)];
    glowColors[i * 3] = color.r;
    glowColors[i * 3 + 1] = color.g;
    glowColors[i * 3 + 2] = color.b;

    glowSizes[i] = Math.random() * 2 + 1;
}

glowGeometry.setAttribute('position', new THREE.BufferAttribute(glowPositions, 3));
glowGeometry.setAttribute('color', new THREE.BufferAttribute(glowColors, 3));
glowGeometry.setAttribute('size', new THREE.BufferAttribute(glowSizes, 1));

const glowMaterial = new THREE.PointsMaterial({
    size: 3,
    transparent: true,
    opacity: 0.4,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const glowParticles = new THREE.Points(glowGeometry, glowMaterial);
scene.add(glowParticles);

// Mouse interaction
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Animation loop
let time = 0;
function animate() {
    requestAnimationFrame(animate);
    time += 0.01;

    // Update shader time
    leafMaterial.uniforms.time.value = time;

    // Smooth camera movement
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;

    camera.position.x += (targetX * 2 - camera.position.x) * 0.05;
    camera.position.y += (targetY * 2 - camera.position.y) * 0.05;
    camera.lookAt(scene.position);

    // Rotate particle systems
    leafParticles.rotation.y += 0.0008;
    leafParticles.rotation.x = targetY * 0.3;

    glowParticles.rotation.y -= 0.0005;
    glowParticles.rotation.x += 0.0003;

    renderer.render(scene, camera);
}

animate();

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Scroll-based animation
window.addEventListener('scroll', () => {
    const scrolled = window.scrollY;
    leafParticles.rotation.z = scrolled * 0.0002;
    glowParticles.rotation.z = -scrolled * 0.0001;
});

// ===== GSAP SCROLL ANIMATIONS =====

// Hero Section
gsap.from('.hero-eyebrow', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.2
});

gsap.from('.hero-title', {
    opacity: 0,
    y: 50,
    duration: 1,
    delay: 0.4
});

gsap.from('.hero-subtitle', {
    opacity: 0,
    y: 30,
    duration: 0.8,
    delay: 0.6
});

gsap.from('.hero-stats-minimal .stat-mini', {
    opacity: 0,
    y: 30,
    duration: 0.6,
    stagger: 0.2,
    delay: 0.8
});

gsap.from('.hero-cta-group .btn', {
    opacity: 0,
    y: 20,
    duration: 0.6,
    stagger: 0.15,
    delay: 1.2
});

// Section Headers
gsap.utils.toArray('.section-header-luxury').forEach(header => {
    gsap.from(header.children, {
        scrollTrigger: {
            trigger: header,
            start: 'top 80%',
        },
        opacity: 0,
        y: 30,
        duration: 0.8,
        stagger: 0.2
    });
});

// Product Cards
gsap.utils.toArray('.product-card-luxury').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
        },
        opacity: 0,
        y: 50,
        duration: 0.8,
        delay: index * 0.1
    });
});

// AI Visualizer Section
gsap.from('.visualizer-header', {
    scrollTrigger: {
        trigger: '.ai-visualizer-section',
        start: 'top 80%',
    },
    opacity: 0,
    y: 40,
    duration: 1
});

gsap.from('.upload-area', {
    scrollTrigger: {
        trigger: '.visualizer-container',
        start: 'top 75%',
    },
    opacity: 0,
    scale: 0.9,
    duration: 0.8
});

// How It Works Steps
gsap.utils.toArray('.step-card').forEach((step, index) => {
    gsap.from(step, {
        scrollTrigger: {
            trigger: step,
            start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        duration: 0.7,
        delay: index * 0.15
    });
});

// Styling Cards
gsap.utils.toArray('.styling-card').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
        },
        opacity: 0,
        y: 40,
        duration: 0.8,
        delay: index * 0.1
    });
});

// Testimonials
gsap.utils.toArray('.testimonial-card-luxury').forEach((card, index) => {
    gsap.from(card, {
        scrollTrigger: {
            trigger: card,
            start: 'top 85%',
        },
        opacity: 0,
        scale: 0.9,
        duration: 0.7,
        delay: index * 0.15
    });
});

// ===== NAVIGATION INTERACTIONS =====
const nav = document.querySelector('.nav');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        nav.style.boxShadow = '0 4px 20px rgba(139, 115, 85, 0.1)';
    } else {
        nav.style.boxShadow = 'none';
    }

    // Update active link
    const sections = document.querySelectorAll('.section');
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (window.scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') && link.getAttribute('href').slice(1) === current) {
            link.classList.add('active');
        }
    });
});

// Smooth scroll
navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetId = link.getAttribute('href');
        if (targetId && targetId !== '#') {
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
        }
    });
});

// Logo click to scroll to top
const logoLink = document.querySelector('.nav-logo');
if (logoLink) {
    logoLink.addEventListener('click', (e) => {
        e.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

// ===== COLLECTION FILTERS =====
const filterBtns = document.querySelectorAll('.filter-btn');
const productCards = document.querySelectorAll('.product-card-luxury');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Update active button
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        // Filter products
        productCards.forEach(card => {
            const category = card.dataset.category;
            if (filter === 'all' || category.includes(filter)) {
                gsap.to(card, { opacity: 1, scale: 1, duration: 0.3 });
                card.style.display = 'block';
            } else {
                gsap.to(card, { opacity: 0, scale: 0.8, duration: 0.3, onComplete: () => {
                    card.style.display = 'none';
                }});
            }
        });
    });
});

// ===== SCROLL INDICATOR =====
const scrollIndicator = document.querySelector('.scroll-indicator-luxury');

if (scrollIndicator) {
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            scrollIndicator.style.opacity = '0';
        } else {
            scrollIndicator.style.opacity = '1';
        }
    });
}

// ===== MOBILE MENU =====
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const mobileMenuClose = document.getElementById('mobileMenuClose');
const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

// Create overlay element
const overlay = document.createElement('div');
overlay.className = 'mobile-menu-overlay';
document.body.appendChild(overlay);

function openMobileMenu() {
    mobileMenu.classList.add('active');
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    overlay.classList.remove('active');
    document.body.style.overflow = '';
}

if (mobileMenuBtn) {
    mobileMenuBtn.addEventListener('click', openMobileMenu);
}

if (mobileMenuClose) {
    mobileMenuClose.addEventListener('click', closeMobileMenu);
}

// Close menu when clicking overlay
overlay.addEventListener('click', closeMobileMenu);

// Close menu when clicking a link and scroll to section
mobileNavLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        closeMobileMenu();

        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
            e.preventDefault();
            const targetSection = document.querySelector(targetId);
            if (targetSection) {
                setTimeout(() => {
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }, 300);
            }
        }
    });
});

// Close menu on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mobileMenu.classList.contains('active')) {
        closeMobileMenu();
    }
});

console.log('🏺 Midori Gardens - AI Powered Visualization Platform Loaded!');
