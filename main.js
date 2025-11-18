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
camera.position.z = 5;

// Elegant color palette
const palette = [
    new THREE.Color(0xD4C5B9), // Warm cream
    new THREE.Color(0xB8C5AE), // Pale sage
    new THREE.Color(0xC9B8A8), // Soft taupe
];

const potsGroup = new THREE.Group();

// ===== ELEGANT POT/VASE WIREFRAMES =====
// Create 8-10 beautiful pot outlines
const potCount = 10;

for (let i = 0; i < potCount; i++) {
    const points = [];

    // Different pot/vase styles
    const style = i % 4;

    if (style === 0) {
        // Classic rounded pot
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const radius = 0.25 + Math.sin(t * Math.PI) * 0.15;
            points.push(new THREE.Vector2(radius, t * 1.2 - 0.6));
        }
    } else if (style === 1) {
        // Tall slender vase
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            let radius;
            if (t < 0.3) {
                radius = 0.15 + t * 0.2;
            } else {
                radius = 0.2 - (t - 0.3) * 0.1;
            }
            points.push(new THREE.Vector2(radius, t * 1.5 - 0.75));
        }
    } else if (style === 2) {
        // Wide bowl planter
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const radius = 0.35 - t * 0.15;
            points.push(new THREE.Vector2(radius, t * 0.8 - 0.4));
        }
    } else {
        // Modern tapered pot
        for (let j = 0; j <= 20; j++) {
            const t = j / 20;
            const radius = 0.3 - t * 0.08 + Math.sin(t * Math.PI * 2) * 0.03;
            points.push(new THREE.Vector2(radius, t * 1.0 - 0.5));
        }
    }

    const potGeometry = new THREE.LatheGeometry(points, 24);

    // Wireframe material - just elegant outlines
    const potMaterial = new THREE.MeshBasicMaterial({
        color: palette[Math.floor(Math.random() * palette.length)],
        wireframe: true,
        transparent: true,
        opacity: 0.15,
        side: THREE.DoubleSide
    });

    const pot = new THREE.Mesh(potGeometry, potMaterial);

    // Position - spread naturally
    pot.position.x = (Math.random() - 0.5) * 30;
    pot.position.y = (Math.random() - 0.5) * 25;
    pot.position.z = (Math.random() - 0.5) * 15;

    // Random scale
    const scale = Math.random() * 0.8 + 0.6;
    pot.scale.set(scale, scale, scale);

    // Random rotation
    pot.rotation.x = Math.random() * Math.PI * 0.3;
    pot.rotation.y = Math.random() * Math.PI;
    pot.rotation.z = Math.random() * Math.PI * 0.2;

    // Gentle rotation velocity
    pot.userData.rotationSpeed = {
        y: (Math.random() - 0.5) * 0.002,
        x: (Math.random() - 0.5) * 0.001
    };

    potsGroup.add(pot);
}

scene.add(potsGroup);

// ===== SOFT PARTICLE ACCENTS =====
const particleGeometry = new THREE.BufferGeometry();
const particleCount = 80;
const positions = new Float32Array(particleCount * 3);
const colors = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 28;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 12;

    const color = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

const particleMaterial = new THREE.PointsMaterial({
    size: 2.5,
    transparent: true,
    opacity: 0.25,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// Mouse interaction
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Elegant smooth animation
function animate() {
    requestAnimationFrame(animate);

    // Rotate each pot individually for organic feel
    potsGroup.children.forEach(pot => {
        pot.rotation.y += pot.userData.rotationSpeed.y;
        pot.rotation.x += pot.userData.rotationSpeed.x;
    });

    // Gentle group rotation with mouse interaction
    potsGroup.rotation.y += 0.0002 + (mouseX * 0.0003);
    potsGroup.rotation.x += (mouseY * 0.0002);

    // Subtle particle rotation
    particles.rotation.y += 0.0004;

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
    potsGroup.rotation.z = scrolled * 0.00008;
    particles.rotation.z = scrolled * 0.0001;
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
