import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

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

// Enhanced lighting for visibility
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xC17459, 2); // Terracotta
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x8B7355, 1.5); // Taupe
pointLight2.position.set(-5, -5, 5);
scene.add(pointLight2);

const pointLight3 = new THREE.PointLight(0x7D9D72, 1); // Sage green
pointLight3.position.set(0, -5, -5);
scene.add(pointLight3);

// ===== POTTERY VASE PARTICLES =====
const vaseCount = 50;
const vaseGroup = new THREE.Group();

for (let i = 0; i < vaseCount; i++) {
    // Create simple vase shape using lathe geometry
    const points = [];
    for (let j = 0; j < 10; j++) {
        const t = j / 9;
        const radius = 0.3 + Math.sin(t * Math.PI) * 0.2;
        points.push(new THREE.Vector2(radius, t * 2 - 1));
    }

    const vaseGeometry = new THREE.LatheGeometry(points, 12);

    const vaseMaterial = new THREE.MeshPhongMaterial({
        color: [0xC17459, 0x8B7355, 0x7D9D72, 0xE8DED0][Math.floor(Math.random() * 4)],
        transparent: true,
        opacity: 0.15,
        shininess: 80,
        specular: 0xffffff
    });

    const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);

    // Random position
    vase.position.x = (Math.random() - 0.5) * 30;
    vase.position.y = (Math.random() - 0.5) * 30;
    vase.position.z = (Math.random() - 0.5) * 20;

    // Random scale
    const scale = Math.random() * 0.3 + 0.2;
    vase.scale.set(scale, scale, scale);

    // Random rotation
    vase.rotation.x = Math.random() * Math.PI;
    vase.rotation.y = Math.random() * Math.PI;
    vase.rotation.z = Math.random() * Math.PI;

    // Store velocity for animation
    vase.userData.velocity = {
        x: (Math.random() - 0.5) * 0.005,
        y: (Math.random() - 0.5) * 0.005,
        z: (Math.random() - 0.5) * 0.003,
        rotX: (Math.random() - 0.5) * 0.01,
        rotY: (Math.random() - 0.5) * 0.01
    };

    vaseGroup.add(vase);
}

scene.add(vaseGroup);

// ===== LEAF PARTICLES (Enhanced) =====
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
        attribute vec3 color;
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

// ===== GEOMETRIC SHAPES (Pottery inspired) =====
const geometryGroup = new THREE.Group();
const shapeCount = 30;

for (let i = 0; i < shapeCount; i++) {
    let geometry;
    const rand = Math.random();

    if (rand < 0.3) {
        geometry = new THREE.TorusGeometry(0.5, 0.2, 8, 16);
    } else if (rand < 0.6) {
        geometry = new THREE.CylinderGeometry(0.3, 0.5, 1, 8);
    } else {
        geometry = new THREE.SphereGeometry(0.4, 8, 8);
    }

    const material = new THREE.MeshPhongMaterial({
        color: earthToneColors[Math.floor(Math.random() * earthToneColors.length)],
        transparent: true,
        opacity: 0.1,
        wireframe: true
    });

    const shape = new THREE.Mesh(geometry, material);

    shape.position.x = (Math.random() - 0.5) * 30;
    shape.position.y = (Math.random() - 0.5) * 30;
    shape.position.z = (Math.random() - 0.5) * 20;

    const scale = Math.random() * 0.5 + 0.3;
    shape.scale.set(scale, scale, scale);

    shape.userData.velocity = {
        rotX: (Math.random() - 0.5) * 0.005,
        rotY: (Math.random() - 0.5) * 0.005
    };

    geometryGroup.add(shape);
}

scene.add(geometryGroup);

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

    vaseGroup.rotation.y += 0.0003;
    vaseGroup.rotation.x = Math.sin(time * 0.1) * 0.1;

    geometryGroup.rotation.y -= 0.0004;
    geometryGroup.rotation.z = Math.cos(time * 0.1) * 0.1;

    // Animate individual vases
    vaseGroup.children.forEach(vase => {
        vase.position.x += vase.userData.velocity.x;
        vase.position.y += vase.userData.velocity.y;
        vase.position.z += vase.userData.velocity.z;

        vase.rotation.x += vase.userData.velocity.rotX;
        vase.rotation.y += vase.userData.velocity.rotY;

        // Wrap around
        if (Math.abs(vase.position.x) > 15) vase.position.x *= -0.9;
        if (Math.abs(vase.position.y) > 15) vase.position.y *= -0.9;
        if (Math.abs(vase.position.z) > 10) vase.position.z *= -0.9;
    });

    // Animate geometric shapes
    geometryGroup.children.forEach(shape => {
        shape.rotation.x += shape.userData.velocity.rotX;
        shape.rotation.y += shape.userData.velocity.rotY;
    });

    // Pulse lights
    pointLight1.intensity = 1.8 + Math.sin(time * 0.5) * 0.3;
    pointLight2.intensity = 1.3 + Math.cos(time * 0.3) * 0.2;
    pointLight3.intensity = 0.9 + Math.sin(time * 0.7) * 0.2;

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
    vaseGroup.rotation.z = scrolled * 0.0003;
    leafParticles.rotation.z = scrolled * 0.0002;
    glowParticles.rotation.z = -scrolled * 0.0001;
    geometryGroup.rotation.x = scrolled * 0.0001;
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
