import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './style.css';
import { PlacementVisualizer } from './visualizer.js';

gsap.registerPlugin(ScrollTrigger);

// Scene Setup
const canvas = document.getElementById('webgl-canvas');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Custom Flower Petal Shader
const petalVertexShader = `
    uniform float uTime;
    uniform float uScale;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        vUv = uv;
        vPosition = position;

        vec3 pos = position;

        // Floating animation
        float wave = sin(uTime * 0.5 + position.x * 2.0) * 0.1;
        pos.y += wave;
        pos.x += cos(uTime * 0.3 + position.y * 1.5) * 0.1;

        // Rotation
        float angle = uTime * 0.2;
        float c = cos(angle);
        float s = sin(angle);
        mat2 rotation = mat2(c, -s, s, c);
        pos.xz *= rotation;

        vec4 modelPosition = modelMatrix * vec4(pos, 1.0);
        vec4 viewPosition = viewMatrix * modelPosition;
        vec4 projectedPosition = projectionMatrix * viewPosition;

        gl_Position = projectedPosition;
    }
`;

const petalFragmentShader = `
    uniform float uTime;
    uniform vec3 uColor;
    uniform float uAlpha;
    varying vec2 vUv;
    varying vec3 vPosition;

    void main() {
        // Create petal shape with gradient
        vec2 center = vUv - 0.5;
        float dist = length(center);

        // Petal shape using smooth gradients
        float petal = smoothstep(0.5, 0.2, dist);
        float edge = smoothstep(0.5, 0.45, dist);

        // Add subtle color variation
        vec3 color = uColor;
        color += vec3(0.1, 0.05, 0.1) * (1.0 - dist * 2.0);

        // Animated glow
        float glow = sin(uTime * 2.0 + vPosition.x * 3.0) * 0.1 + 0.9;
        color *= glow;

        float alpha = petal * uAlpha * edge;

        gl_FragColor = vec4(color, alpha);
    }
`;

// Particle System for Floating Petals
class FloatingPetals {
    constructor() {
        this.petals = [];
        this.petalColors = [
            new THREE.Color(0xffc0cb), // Pink
            new THREE.Color(0xffe4e1), // Light pink
            new THREE.Color(0xfff0f5), // Lavender blush
            new THREE.Color(0xdda0dd), // Plum
            new THREE.Color(0xf0e68c), // Khaki (yellow tones)
            new THREE.Color(0xfffacd), // Lemon chiffon
        ];
        this.createPetals();
    }

    createPetals() {
        const petalGeometry = new THREE.PlaneGeometry(0.3, 0.3, 16, 16);

        for (let i = 0; i < 50; i++) {
            const color = this.petalColors[Math.floor(Math.random() * this.petalColors.length)];

            const material = new THREE.ShaderMaterial({
                vertexShader: petalVertexShader,
                fragmentShader: petalFragmentShader,
                uniforms: {
                    uTime: { value: Math.random() * 100 },
                    uColor: { value: color },
                    uAlpha: { value: 0.6 + Math.random() * 0.4 },
                    uScale: { value: 0.5 + Math.random() * 0.5 }
                },
                transparent: true,
                depthWrite: false,
                blending: THREE.AdditiveBlending
            });

            const petal = new THREE.Mesh(petalGeometry, material);

            // Random position
            petal.position.x = (Math.random() - 0.5) * 15;
            petal.position.y = (Math.random() - 0.5) * 10;
            petal.position.z = (Math.random() - 0.5) * 10;

            // Store velocity and rotation speed
            petal.userData = {
                velocityY: -0.01 - Math.random() * 0.02,
                velocityX: (Math.random() - 0.5) * 0.01,
                rotationSpeed: (Math.random() - 0.5) * 0.02,
                initialY: petal.position.y,
                timeOffset: Math.random() * 100
            };

            this.petals.push(petal);
            scene.add(petal);
        }
    }

    update(time) {
        this.petals.forEach((petal, index) => {
            // Update shader time
            petal.material.uniforms.uTime.value = time + petal.userData.timeOffset;

            // Floating motion
            petal.position.y += petal.userData.velocityY;
            petal.position.x += petal.userData.velocityX;

            // Reset position when out of view
            if (petal.position.y < -6) {
                petal.position.y = 6;
                petal.position.x = (Math.random() - 0.5) * 15;
            }

            // Continuous rotation
            petal.rotation.z += petal.userData.rotationSpeed;

            // Gentle swaying
            petal.position.x += Math.sin(time * 0.5 + index) * 0.001;
        });
    }
}

// 3D Flower Geometry
class ThreeDFlower {
    constructor(position, color) {
        this.group = new THREE.Group();
        this.color = color;
        this.createFlower();
        this.group.position.copy(position);
        scene.add(this.group);
    }

    createFlower() {
        // Flower center
        const centerGeometry = new THREE.SphereGeometry(0.15, 16, 16);
        const centerMaterial = new THREE.MeshPhongMaterial({
            color: 0xffd700,
            shininess: 100
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        this.group.add(center);

        // Petals
        const petalGeometry = new THREE.PlaneGeometry(0.4, 0.6, 8, 8);
        const petalCount = 8;

        for (let i = 0; i < petalCount; i++) {
            const angle = (i / petalCount) * Math.PI * 2;

            const material = new THREE.ShaderMaterial({
                vertexShader: petalVertexShader,
                fragmentShader: petalFragmentShader,
                uniforms: {
                    uTime: { value: 0 },
                    uColor: { value: this.color },
                    uAlpha: { value: 0.9 },
                    uScale: { value: 1.0 }
                },
                transparent: true,
                side: THREE.DoubleSide
            });

            const petal = new THREE.Mesh(petalGeometry, material);
            petal.position.x = Math.cos(angle) * 0.3;
            petal.position.z = Math.sin(angle) * 0.3;
            petal.rotation.y = angle;
            petal.rotation.x = Math.PI / 6;

            this.group.add(petal);
        }
    }

    update(time) {
        this.group.children.forEach((child, index) => {
            if (child.material.uniforms) {
                child.material.uniforms.uTime.value = time;
            }
        });

        // Gentle rotation
        this.group.rotation.y = Math.sin(time * 0.3) * 0.2;
    }
}

// Ambient Particles
class AmbientParticles {
    constructor() {
        const particleCount = 200;
        const positions = new Float32Array(particleCount * 3);
        const colors = new Float32Array(particleCount * 3);
        const sizes = new Float32Array(particleCount);

        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;

            positions[i3] = (Math.random() - 0.5) * 20;
            positions[i3 + 1] = (Math.random() - 0.5) * 20;
            positions[i3 + 2] = (Math.random() - 0.5) * 20;

            const color = new THREE.Color();
            color.setHSL(Math.random() * 0.1 + 0.85, 0.5, 0.7);
            colors[i3] = color.r;
            colors[i3 + 1] = color.g;
            colors[i3 + 2] = color.b;

            sizes[i] = Math.random() * 2 + 1;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        const material = new THREE.PointsMaterial({
            size: 0.05,
            vertexColors: true,
            transparent: true,
            opacity: 0.6,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        this.particles = new THREE.Points(geometry, material);
        scene.add(this.particles);
    }

    update(time) {
        this.particles.rotation.y = time * 0.05;

        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time + i) * 0.001;
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight1 = new THREE.DirectionalLight(0xffc0cb, 0.8);
directionalLight1.position.set(5, 5, 5);
scene.add(directionalLight1);

const directionalLight2 = new THREE.DirectionalLight(0xcfe2f3, 0.5);
directionalLight2.position.set(-5, 3, -5);
scene.add(directionalLight2);

const pointLight = new THREE.PointLight(0xffd700, 1, 100);
pointLight.position.set(0, 5, 5);
scene.add(pointLight);

// Initialize Scene Elements
const floatingPetals = new FloatingPetals();
const ambientParticles = new AmbientParticles();

const flowers = [
    new ThreeDFlower(new THREE.Vector3(-3, 2, -5), new THREE.Color(0xffc0cb)),
    new ThreeDFlower(new THREE.Vector3(3, -2, -5), new THREE.Color(0xdda0dd)),
    new ThreeDFlower(new THREE.Vector3(0, 0, -8), new THREE.Color(0xffe4e1))
];

// Mouse Interaction
const mouse = { x: 0, y: 0 };
const targetMouse = { x: 0, y: 0 };

window.addEventListener('mousemove', (event) => {
    targetMouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    targetMouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
});

// Scroll Animations
gsap.to(camera.position, {
    scrollTrigger: {
        trigger: '.services',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    },
    z: 3
});

gsap.to(camera.rotation, {
    scrollTrigger: {
        trigger: '.process',
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
    },
    z: 0.1
});

// Animation Loop
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // Smooth mouse follow
    mouse.x += (targetMouse.x - mouse.x) * 0.05;
    mouse.y += (targetMouse.y - mouse.y) * 0.05;

    // Update camera position based on mouse
    camera.position.x = mouse.x * 0.5;
    camera.position.y = mouse.y * 0.5;
    camera.lookAt(scene.position);

    // Update all animated elements
    floatingPetals.update(elapsedTime);
    ambientParticles.update(elapsedTime);
    flowers.forEach(flower => flower.update(elapsedTime));

    // Gentle camera sway
    pointLight.position.x = Math.sin(elapsedTime * 0.5) * 3;
    pointLight.position.z = Math.cos(elapsedTime * 0.5) * 3;

    renderer.render(scene, camera);
}

animate();

// Resize Handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Smooth Scroll & Navigation
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

// Nav Active State
const sections = document.querySelectorAll('.section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        if (scrollY >= sectionTop - 200) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
});

// GSAP Scroll Animations for Content
// Hero Logo Animation - triggers immediately on page load
gsap.fromTo('.hero-logo',
    {
        scale: 0.5,
        opacity: 0
    },
    {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        delay: 0.3,
        ease: 'back.out(1.7)'
    }
);

// Service Cards Animation
gsap.fromTo('.service-card',
    {
        y: 60,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.services',
            start: 'top center+=100',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'power2.out'
    }
);

gsap.fromTo('.process-step',
    {
        x: -100,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.process',
            start: 'top center+=100',
        },
        x: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    }
);

gsap.fromTo('.gallery-item',
    {
        scale: 0.8,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.gallery',
            start: 'top center+=100',
        },
        scale: 1,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'back.out(1.7)'
    }
);

// Contact Form Handler
document.querySelector('.contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thank you for your interest! We will contact you shortly.');
    e.target.reset();
});

// FAQ Accordion
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const faqItem = question.parentElement;
        const isActive = faqItem.classList.contains('active');

        // Close all FAQ items
        document.querySelectorAll('.faq-item').forEach(item => {
            item.classList.remove('active');
        });

        // Open clicked item if it wasn't already active
        if (!isActive) {
            faqItem.classList.add('active');
        }
    });
});

// Testimonials Scroll Animation
gsap.fromTo('.testimonial-card',
    {
        y: 60,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.testimonials',
            start: 'top center+=100',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    }
);

// Testimonials Auto-Scrolling Carousel with Cursor Parallax
class TestimonialsCarousel {
    constructor() {
        this.container = document.querySelector('.testimonials-grid');
        if (!this.container) return;

        this.section = document.querySelector('.testimonials');
        this.cards = Array.from(document.querySelectorAll('.testimonial-card'));
        this.scrollSpeed = 0.5; // pixels per frame
        this.isPaused = false;
        this.scrollPosition = 0;
        this.cursorOffset = 0; // Cursor-based parallax offset
        this.targetCursorOffset = 0;
        this.isHoveringSection = false;

        this.init();
    }

    init() {
        // Duplicate cards for infinite scroll effect
        this.cards.forEach(card => {
            const clone = card.cloneNode(true);
            this.container.appendChild(clone);
        });

        // Get all cards including clones
        this.allCards = Array.from(this.container.querySelectorAll('.testimonial-card'));

        // Add hover listeners to all cards
        this.allCards.forEach(card => {
            card.addEventListener('mouseenter', () => this.pause());
            card.addEventListener('mouseleave', () => this.resume());
        });

        // Track mouse movement over testimonials section
        this.section.addEventListener('mouseenter', () => {
            this.isHoveringSection = true;
        });

        this.section.addEventListener('mouseleave', () => {
            this.isHoveringSection = false;
            this.targetCursorOffset = 0; // Reset when leaving section
        });

        this.section.addEventListener('mousemove', (e) => {
            if (!this.isHoveringSection) return;

            // Get mouse position relative to section
            const rect = this.section.getBoundingClientRect();
            const mouseX = e.clientX - rect.left;
            const sectionWidth = rect.width;

            // Calculate normalized position (-1 to 1)
            const normalizedX = (mouseX / sectionWidth) * 2 - 1;

            // Apply parallax effect in OPPOSITE direction
            // Mouse right (+1) = cards move left (negative)
            // Mouse left (-1) = cards move right (positive)
            const parallaxStrength = 100; // Maximum offset in pixels
            this.targetCursorOffset = -normalizedX * parallaxStrength;
        });

        // Start animation
        this.animate();
    }

    pause() {
        this.isPaused = true;
    }

    resume() {
        this.isPaused = false;
    }

    animate() {
        // Smooth interpolation for cursor offset
        this.cursorOffset += (this.targetCursorOffset - this.cursorOffset) * 0.1;

        if (!this.isPaused) {
            this.scrollPosition += this.scrollSpeed;

            // Calculate total width of original cards
            const cardWidth = this.cards[0].offsetWidth;
            const gap = 40; // 2.5rem = 40px gap between cards
            const totalWidth = (cardWidth + gap) * this.cards.length;

            // Reset position when we've scrolled past all original cards
            if (this.scrollPosition >= totalWidth) {
                this.scrollPosition = 0;
            }
        }

        // Apply transform with both auto-scroll and cursor parallax
        const finalPosition = this.scrollPosition - this.cursorOffset;
        this.container.style.transform = `translateX(-${finalPosition}px)`;

        requestAnimationFrame(() => this.animate());
    }
}

// Initialize testimonials carousel after page load
window.addEventListener('DOMContentLoaded', () => {
    new TestimonialsCarousel();
});

// Pricing Cards Scroll Animation
gsap.fromTo('.pricing-card',
    {
        y: 80,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.pricing',
            start: 'top center+=100',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.2)'
    }
);

// FAQ Items Scroll Animation
gsap.fromTo('.faq-item',
    {
        x: -60,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.faq',
            start: 'top center+=100',
        },
        x: 0,
        opacity: 1,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power2.out'
    }
);

// Hero Stats Animation
gsap.fromTo('.stat',
    {
        scale: 0.5,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.hero-stats',
            start: 'top center+=200',
        },
        scale: 1,
        opacity: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: 'back.out(1.7)'
    }
);

// About Values Animation
gsap.fromTo('.value-item',
    {
        y: 60,
        opacity: 0
    },
    {
        scrollTrigger: {
            trigger: '.about-values',
            start: 'top center+=100',
        },
        y: 0,
        opacity: 1,
        duration: 0.8,
        stagger: 0.2,
        ease: 'power2.out'
    }
);

// Flower and Vase Selection
document.querySelectorAll('.flower-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all flower buttons
        document.querySelectorAll('.flower-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        const flowerType = this.dataset.flower;
        console.log(`Selected flower: ${flowerType}`);

        // TODO: Update 3D visualizer with selected flower type
        // You can add functionality here to change the flower in the 3D scene
    });
});

document.querySelectorAll('.vase-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Remove active class from all vase buttons
        document.querySelectorAll('.vase-btn').forEach(b => b.classList.remove('active'));
        // Add active class to clicked button
        this.classList.add('active');

        const vaseType = this.dataset.vase;
        console.log(`Selected vase: ${vaseType}`);

        // TODO: Update 3D visualizer with selected vase type
        // You can add functionality here to change the vase in the 3D scene
    });
});

// Custom Cursor with Speed Detection
class CustomCursor {
    constructor() {
        this.cursor = document.querySelector('.custom-cursor');
        this.cursorPos = { x: 0, y: 0 };
        this.prevPos = { x: 0, y: 0 };
        this.speed = 0;
        this.isMoving = false;
        this.growTimeout = null;

        this.init();
    }

    init() {
        // Track mouse movement
        document.addEventListener('mousemove', (e) => {
            this.cursorPos.x = e.clientX;
            this.cursorPos.y = e.clientY;

            // Calculate speed
            const deltaX = this.cursorPos.x - this.prevPos.x;
            const deltaY = this.cursorPos.y - this.prevPos.y;
            this.speed = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

            // Update cursor position
            this.cursor.style.left = `${this.cursorPos.x}px`;
            this.cursor.style.top = `${this.cursorPos.y}px`;

            // Grow cursor if moving fast (like macOS)
            if (this.speed > 10) {
                this.cursor.classList.add('cursor-grow');

                // Clear previous timeout
                clearTimeout(this.growTimeout);

                // Shrink back after movement stops
                this.growTimeout = setTimeout(() => {
                    this.cursor.classList.remove('cursor-grow');
                }, 150);
            }

            // Store previous position
            this.prevPos.x = this.cursorPos.x;
            this.prevPos.y = this.cursorPos.y;
        });

        // Hide cursor when leaving window
        document.addEventListener('mouseleave', () => {
            this.cursor.classList.add('cursor-hidden');
        });

        // Show cursor when entering window
        document.addEventListener('mouseenter', () => {
            this.cursor.classList.remove('cursor-hidden');
        });

        // Grow cursor on click
        document.addEventListener('mousedown', () => {
            this.cursor.classList.add('cursor-grow');
        });

        document.addEventListener('mouseup', () => {
            setTimeout(() => {
                this.cursor.classList.remove('cursor-grow');
            }, 100);
        });

        // Extra grow effect on hoverable elements
        const hoverElements = document.querySelectorAll('a, button, .service-card, .gallery-item, .testimonial-card, .pricing-card, .faq-question');
        hoverElements.forEach(el => {
            el.addEventListener('mouseenter', () => {
                this.cursor.classList.add('cursor-grow');
            });
            el.addEventListener('mouseleave', () => {
                this.cursor.classList.remove('cursor-grow');
            });
        });
    }
}

// Initialize Placement Visualizer
window.addEventListener('DOMContentLoaded', () => {
    new PlacementVisualizer();
    new CustomCursor();
});
