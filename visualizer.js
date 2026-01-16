import * as THREE from 'three';
import { gsap } from 'gsap';

export class PlacementVisualizer {
    constructor() {
        this.canvas = document.getElementById('placement-canvas');
        if (!this.canvas) return;

        this.currentRoom = 'living';
        this.setupScene();
        this.setupLighting();
        this.createRoom('living');
        this.animate();
        this.setupInteractions();
        this.setupResize();
    }

    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xfaf9f7);

        // Add fog for depth
        this.scene.fog = new THREE.Fog(0xfaf9f7, 8, 15);

        this.camera = new THREE.PerspectiveCamera(
            45,
            this.canvas.clientWidth / this.canvas.clientHeight,
            0.1,
            1000
        );
        // Much closer to flowers - focus on arrangement
        this.camera.position.set(2, 1.5, 3);
        this.camera.lookAt(0, 1, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            alpha: false
        });
        this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.2;

        this.roomGroup = new THREE.Group();
        this.scene.add(this.roomGroup);

        this.mouse = { x: 0, y: 0 };
        this.targetCamera = { x: 2, y: 1.5, z: 3 };
        this.isRotating = false;
        this.autoRotate = true;
        this.rotationSpeed = 0;

        // Add spherical camera controls
        this.cameraOrbit = {
            theta: 0,        // Horizontal rotation (around Y axis)
            phi: Math.PI / 3, // Vertical rotation (elevation)
            radius: 3.5       // Distance from center
        };

        // Create procedural textures
        this.createTextures();
    }

    createTextures() {
        // Wood texture for furniture
        this.woodTexture = this.createWoodTexture();
        // Fabric texture for sofa
        this.fabricTexture = this.createFabricTexture();
        // Rug pattern
        this.rugTexture = this.createRugTexture();
        // Floor texture
        this.floorTexture = this.createFloorTexture();
    }

    createWoodTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base wood color
        ctx.fillStyle = '#d4a574';
        ctx.fillRect(0, 0, 512, 512);

        // Wood grain lines
        for (let i = 0; i < 50; i++) {
            const y = Math.random() * 512;
            const width = Math.random() * 512;
            const alpha = 0.1 + Math.random() * 0.2;

            ctx.strokeStyle = `rgba(139, 115, 85, ${alpha})`;
            ctx.lineWidth = 1 + Math.random() * 2;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.bezierCurveTo(
                width * 0.3, y + (Math.random() - 0.5) * 20,
                width * 0.7, y + (Math.random() - 0.5) * 20,
                512, y
            );
            ctx.stroke();
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createFabricTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Base fabric color
        ctx.fillStyle = '#9b8b7e';
        ctx.fillRect(0, 0, 256, 256);

        // Fabric weave pattern
        for (let x = 0; x < 256; x += 4) {
            for (let y = 0; y < 256; y += 4) {
                const alpha = 0.05 + Math.random() * 0.1;
                ctx.fillStyle = Math.random() > 0.5
                    ? `rgba(155, 139, 126, ${alpha})`
                    : `rgba(138, 122, 110, ${alpha})`;
                ctx.fillRect(x, y, 4, 4);
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        return texture;
    }

    createRugTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Base rug color
        ctx.fillStyle = '#dcc5b0';
        ctx.fillRect(0, 0, 512, 512);

        // Border pattern
        ctx.strokeStyle = '#c4a57b';
        ctx.lineWidth = 20;
        ctx.strokeRect(20, 20, 472, 472);

        // Inner pattern
        for (let i = 0; i < 10; i++) {
            for (let j = 0; j < 10; j++) {
                const x = 60 + i * 40;
                const y = 60 + j * 40;
                ctx.fillStyle = (i + j) % 2 === 0 ? '#d4af77' : '#c9ad98';
                ctx.beginPath();
                ctx.arc(x, y, 8, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    createFloorTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const ctx = canvas.getContext('2d');

        // Create floor boards
        ctx.fillStyle = '#e8dcc8';
        ctx.fillRect(0, 0, 512, 512);

        // Board lines
        for (let i = 0; i < 512; i += 64) {
            ctx.strokeStyle = 'rgba(200, 185, 165, 0.5)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(512, i);
            ctx.stroke();
        }

        // Wood grain
        for (let y = 0; y < 512; y += 64) {
            for (let i = 0; i < 20; i++) {
                const lineY = y + Math.random() * 60;
                ctx.strokeStyle = `rgba(180, 160, 140, ${0.1 + Math.random() * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(0, lineY);
                ctx.lineTo(512, lineY);
                ctx.stroke();
            }
        }

        const texture = new THREE.CanvasTexture(canvas);
        texture.wrapS = THREE.RepeatWrapping;
        texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(3, 3);
        return texture;
    }

    setupLighting() {
        // Soft ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
        this.scene.add(ambientLight);

        // Main directional light (key light) - focused on flowers
        this.sunLight = new THREE.DirectionalLight(0xfff9e6, 1.2);
        this.sunLight.position.set(3, 5, 4);
        this.sunLight.castShadow = true;
        this.sunLight.shadow.mapSize.width = 2048;
        this.sunLight.shadow.mapSize.height = 2048;
        this.sunLight.shadow.camera.near = 0.5;
        this.sunLight.shadow.camera.far = 20;
        this.sunLight.shadow.camera.left = -5;
        this.sunLight.shadow.camera.right = 5;
        this.sunLight.shadow.camera.top = 5;
        this.sunLight.shadow.camera.bottom = -5;
        this.sunLight.shadow.bias = -0.0001;
        this.scene.add(this.sunLight);

        // Rim light for flower highlights
        const rimLight = new THREE.DirectionalLight(0xffe4f0, 0.6);
        rimLight.position.set(-3, 3, -2);
        this.scene.add(rimLight);

        // Spotlight on flowers
        this.flowerSpotlight = new THREE.SpotLight(0xffffff, 0.8);
        this.flowerSpotlight.position.set(0, 4, 2);
        this.flowerSpotlight.angle = Math.PI / 6;
        this.flowerSpotlight.penumbra = 0.3;
        this.flowerSpotlight.decay = 2;
        this.flowerSpotlight.distance = 10;
        this.flowerSpotlight.castShadow = true;
        this.scene.add(this.flowerSpotlight);

        // Accent lights for atmosphere
        const accentLight1 = new THREE.PointLight(0xffc0cb, 0.5, 8);
        accentLight1.position.set(-2, 1.5, 1);
        this.scene.add(accentLight1);

        const accentLight2 = new THREE.PointLight(0xdda0dd, 0.4, 8);
        accentLight2.position.set(2, 1.5, 1);
        this.scene.add(accentLight2);

        // Fill light from below (subtle)
        const fillLight = new THREE.HemisphereLight(0xfff9e6, 0xe8dcc8, 0.4);
        this.scene.add(fillLight);
    }

    createRoom(roomType) {
        // Clear existing room
        while (this.roomGroup.children.length > 0) {
            this.roomGroup.remove(this.roomGroup.children[0]);
        }

        switch (roomType) {
            case 'living':
                this.createLivingRoom();
                break;
            case 'office':
                this.createOffice();
                break;
            case 'dining':
                this.createDiningRoom();
                break;
            case 'entrance':
                this.createEntrance();
                break;
        }

        // Reset camera orbit to default position
        gsap.to(this.cameraOrbit, {
            theta: 0,
            phi: Math.PI / 3,
            radius: 3.5,
            duration: 1.5,
            ease: 'power2.inOut'
        });

        // Update spotlight target
        if (this.flowerSpotlight) {
            this.flowerSpotlight.target.position.set(0, 1, 0);
        }
    }

    createLivingRoom() {
        // Floor with texture
        const floorGeometry = new THREE.PlaneGeometry(12, 12);
        const floorMaterial = new THREE.MeshStandardMaterial({
            map: this.floorTexture,
            roughness: 0.8,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Sofa with fabric texture
        const sofaGroup = new THREE.Group();

        const sofaMaterial = new THREE.MeshStandardMaterial({
            map: this.fabricTexture,
            color: 0x9b8b7e,
            roughness: 0.7
        });

        // Sofa base
        const sofaBase = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.8, 1.5),
            sofaMaterial
        );
        sofaBase.position.set(-2, 0.4, -2);
        sofaBase.castShadow = true;
        sofaGroup.add(sofaBase);

        // Sofa back
        const sofaBack = new THREE.Mesh(
            new THREE.BoxGeometry(3, 1, 0.3),
            sofaMaterial
        );
        sofaBack.position.set(-2, 1.1, -2.6);
        sofaBack.castShadow = true;
        sofaGroup.add(sofaBack);

        // Sofa arms
        const leftArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 1.5), sofaMaterial);
        leftArm.position.set(-3.65, 0.8, -2);
        leftArm.castShadow = true;
        sofaGroup.add(leftArm);

        const rightArm = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.8, 1.5), sofaMaterial);
        rightArm.position.set(-0.35, 0.8, -2);
        rightArm.castShadow = true;
        sofaGroup.add(rightArm);

        this.roomGroup.add(sofaGroup);

        // Side Table with wood texture
        const tableTop = new THREE.Mesh(
            new THREE.CylinderGeometry(0.5, 0.5, 0.05, 32),
            new THREE.MeshStandardMaterial({
                map: this.woodTexture,
                roughness: 0.3,
                metalness: 0.2
            })
        );
        tableTop.position.set(1.5, 0.8, -1.5);
        tableTop.castShadow = true;
        this.roomGroup.add(tableTop);

        const tableLeg = new THREE.Mesh(
            new THREE.CylinderGeometry(0.08, 0.08, 0.8, 16),
            new THREE.MeshStandardMaterial({
                map: this.woodTexture,
                roughness: 0.4
            })
        );
        tableLeg.position.set(1.5, 0.4, -1.5);
        tableLeg.castShadow = true;
        this.roomGroup.add(tableLeg);

        // Flower Arrangement on Side Table
        this.createFlowerArrangement(new THREE.Vector3(1.5, 1.1, -1.5), 0.8, 'living');

        // Rug with pattern
        const rugGeometry = new THREE.PlaneGeometry(4, 3);
        const rugMaterial = new THREE.MeshStandardMaterial({
            map: this.rugTexture,
            roughness: 0.9
        });
        const rug = new THREE.Mesh(rugGeometry, rugMaterial);
        rug.rotation.x = -Math.PI / 2;
        rug.position.y = 0.01;
        rug.position.z = -1;
        rug.receiveShadow = true;
        this.roomGroup.add(rug);
    }

    createOffice() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(12, 12);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            roughness: 0.2,
            metalness: 0.6
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Desk
        const deskTop = new THREE.Mesh(
            new THREE.BoxGeometry(2.5, 0.1, 1.2),
            new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.3, metalness: 0.5 })
        );
        deskTop.position.set(0, 0.9, -1);
        deskTop.castShadow = true;
        this.roomGroup.add(deskTop);

        // Desk legs
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.4, metalness: 0.7 });
        const legPositions = [
            [-1, 0.45, -0.5],
            [1, 0.45, -0.5],
            [-1, 0.45, -1.5],
            [1, 0.45, -1.5]
        ];

        legPositions.forEach(pos => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            this.roomGroup.add(leg);
        });

        // Monitor (simple representation)
        const monitor = new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 0.5, 0.05),
            new THREE.MeshStandardMaterial({ color: 0x1a1a1a, roughness: 0.2, metalness: 0.8 })
        );
        monitor.position.set(0, 1.3, -1.3);
        monitor.castShadow = true;
        this.roomGroup.add(monitor);

        const monitorStand = new THREE.Mesh(
            new THREE.CylinderGeometry(0.05, 0.08, 0.3, 16),
            new THREE.MeshStandardMaterial({ color: 0x2c2c2c, roughness: 0.3, metalness: 0.7 })
        );
        monitorStand.position.set(0, 1.05, -1.3);
        monitorStand.castShadow = true;
        this.roomGroup.add(monitorStand);

        // Flower Arrangement on desk corner
        this.createFlowerArrangement(new THREE.Vector3(0.9, 1.05, -0.6), 0.5, 'office');

        // Office chair (simplified)
        const seatGeometry = new THREE.CylinderGeometry(0.4, 0.35, 0.1, 32);
        const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x4a4a4a, roughness: 0.6 });
        const seat = new THREE.Mesh(seatGeometry, chairMaterial);
        seat.position.set(0, 0.6, 0.5);
        seat.castShadow = true;
        this.roomGroup.add(seat);

        const backrest = new THREE.Mesh(
            new THREE.BoxGeometry(0.6, 0.8, 0.1),
            chairMaterial
        );
        backrest.position.set(0, 1, 0.8);
        backrest.castShadow = true;
        this.roomGroup.add(backrest);
    }

    createDiningRoom() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(12, 12);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xd4c5b0,
            roughness: 0.7
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Dining table
        const tableTop = new THREE.Mesh(
            new THREE.BoxGeometry(3, 0.1, 1.8),
            new THREE.MeshStandardMaterial({ color: 0x8b7355, roughness: 0.2, metalness: 0.1 })
        );
        tableTop.position.set(0, 0.85, 0);
        tableTop.castShadow = true;
        this.roomGroup.add(tableTop);

        // Table legs
        const legMaterial = new THREE.MeshStandardMaterial({ color: 0x7a6345, roughness: 0.4 });
        const tableLegs = [
            [-1.2, 0.425, -0.7],
            [1.2, 0.425, -0.7],
            [-1.2, 0.425, 0.7],
            [1.2, 0.425, 0.7]
        ];

        tableLegs.forEach(pos => {
            const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.85, 0.1), legMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            this.roomGroup.add(leg);
        });

        // Low centerpiece arrangement
        this.createFlowerArrangement(new THREE.Vector3(0, 1.0, 0), 0.4, 'dining');

        // Chairs (simplified)
        const chairPositions = [
            [-1.5, 0, -1.3],
            [0, 0, -1.3],
            [1.5, 0, -1.3],
            [-1.5, 0, 1.3],
            [0, 0, 1.3],
            [1.5, 0, 1.3]
        ];

        const chairMaterial = new THREE.MeshStandardMaterial({ color: 0x9b8b7e, roughness: 0.6 });

        chairPositions.forEach((pos, index) => {
            const chairSeat = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.08, 0.4),
                chairMaterial
            );
            const rotation = index < 3 ? 0 : Math.PI;
            chairSeat.rotation.y = rotation;
            chairSeat.position.set(pos[0], 0.5, pos[2]);
            chairSeat.castShadow = true;
            this.roomGroup.add(chairSeat);

            const chairBack = new THREE.Mesh(
                new THREE.BoxGeometry(0.4, 0.5, 0.05),
                chairMaterial
            );
            chairBack.rotation.y = rotation;
            const backOffset = index < 3 ? -0.2 : 0.2;
            chairBack.position.set(pos[0], 0.75, pos[2] + backOffset);
            chairBack.castShadow = true;
            this.roomGroup.add(chairBack);
        });
    }

    createEntrance() {
        // Floor
        const floorGeometry = new THREE.PlaneGeometry(12, 12);
        const floorMaterial = new THREE.MeshStandardMaterial({
            color: 0xf0e8d8,
            roughness: 0.6
        });
        const floor = new THREE.Mesh(floorGeometry, floorMaterial);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.roomGroup.add(floor);

        // Console table
        const consoleTop = new THREE.Mesh(
            new THREE.BoxGeometry(2, 0.08, 0.6),
            new THREE.MeshStandardMaterial({ color: 0xa89080, roughness: 0.3, metalness: 0.2 })
        );
        consoleTop.position.set(0, 1.0, -2);
        consoleTop.castShadow = true;
        this.roomGroup.add(consoleTop);

        // Console legs
        const consoleLegMaterial = new THREE.MeshStandardMaterial({ color: 0x978770, roughness: 0.4 });
        const consoleLegs = [
            [-0.8, 0.5, -1.8],
            [0.8, 0.5, -1.8],
            [-0.8, 0.5, -2.2],
            [0.8, 0.5, -2.2]
        ];

        consoleLegs.forEach(pos => {
            const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1, 16), consoleLegMaterial);
            leg.position.set(pos[0], pos[1], pos[2]);
            leg.castShadow = true;
            this.roomGroup.add(leg);
        });

        // Large statement arrangement
        this.createFlowerArrangement(new THREE.Vector3(0, 1.2, -2), 1.2, 'entrance');

        // Wall accent (frame)
        const frame = new THREE.Mesh(
            new THREE.BoxGeometry(1.2, 1.5, 0.05),
            new THREE.MeshStandardMaterial({ color: 0xc4a57b, roughness: 0.5 })
        );
        frame.position.set(-2.5, 2, -2.9);
        frame.castShadow = true;
        this.roomGroup.add(frame);
    }

    createFlowerArrangement(position, scale, roomType) {
        const arrangementGroup = new THREE.Group();

        // Vase
        const vaseHeight = scale * 0.6;
        const vaseGeometry = new THREE.CylinderGeometry(
            scale * 0.15,
            scale * 0.2,
            vaseHeight,
            32
        );

        let vaseColor;
        switch (roomType) {
            case 'living':
                vaseColor = 0xe8dcc8;
                break;
            case 'office':
                vaseColor = 0x4a4a4a;
                break;
            case 'dining':
                vaseColor = 0xf5f0e8;
                break;
            case 'entrance':
                vaseColor = 0xd4a574;
                break;
            default:
                vaseColor = 0xffffff;
        }

        const vaseMaterial = new THREE.MeshStandardMaterial({
            color: vaseColor,
            roughness: 0.2,
            metalness: 0.1
        });
        const vase = new THREE.Mesh(vaseGeometry, vaseMaterial);
        vase.position.y = vaseHeight / 2;
        vase.castShadow = true;
        arrangementGroup.add(vase);

        // Create realistic flowers
        const flowerCount = Math.floor(scale * 10);
        const flowerTypes = [
            { name: 'rose', color: 0xffc0cb, size: 1.0 },
            { name: 'peony', color: 0xffe4e1, size: 1.2 },
            { name: 'orchid', color: 0xdda0dd, size: 0.9 },
            { name: 'lily', color: 0xfff0f5, size: 1.1 },
            { name: 'tulip', color: 0xffb6c1, size: 0.8 }
        ];

        for (let i = 0; i < flowerCount; i++) {
            const flowerType = flowerTypes[Math.floor(Math.random() * flowerTypes.length)];
            const flowerGroup = this.createDetailedFlower(scale, flowerType);

            // Position flower in arrangement - tighter clustering
            const angle = (i / flowerCount) * Math.PI * 2 + Math.random() * 0.5;
            const radius = scale * 0.12 * (0.6 + Math.random() * 0.4);
            const height = vaseHeight + scale * 0.35 * (0.7 + Math.random() * 0.5);

            flowerGroup.position.x = Math.cos(angle) * radius;
            flowerGroup.position.y = height;
            flowerGroup.position.z = Math.sin(angle) * radius;

            // Natural random rotation
            flowerGroup.rotation.y = Math.random() * Math.PI * 2;
            flowerGroup.rotation.x = (Math.random() - 0.5) * 0.3;
            flowerGroup.rotation.z = (Math.random() - 0.5) * 0.2;

            arrangementGroup.add(flowerGroup);

            // Stems (thin cylinders)
            const stemGeometry = new THREE.CylinderGeometry(
                scale * 0.01,
                scale * 0.01,
                height - vaseHeight / 2,
                8
            );
            const stemMaterial = new THREE.MeshStandardMaterial({
                color: 0x4a7c4e,
                roughness: 0.6
            });
            const stem = new THREE.Mesh(stemGeometry, stemMaterial);
            stem.position.x = Math.cos(angle) * radius * 0.5;
            stem.position.y = vaseHeight / 2 + (height - vaseHeight / 2) / 2;
            stem.position.z = Math.sin(angle) * radius * 0.5;
            arrangementGroup.add(stem);
        }

        // Leaves
        const leafCount = Math.floor(scale * 12);
        for (let i = 0; i < leafCount; i++) {
            const leafGeometry = new THREE.PlaneGeometry(scale * 0.1, scale * 0.15);
            const leafMaterial = new THREE.MeshStandardMaterial({
                color: 0x5a8a5e,
                roughness: 0.7,
                side: THREE.DoubleSide
            });
            const leaf = new THREE.Mesh(leafGeometry, leafMaterial);

            const angle = (i / leafCount) * Math.PI * 2;
            const radius = scale * 0.12;
            const height = vaseHeight + scale * 0.15 * (Math.random() * 0.8);

            leaf.position.x = Math.cos(angle) * radius;
            leaf.position.y = height;
            leaf.position.z = Math.sin(angle) * radius;
            leaf.rotation.y = angle;
            leaf.rotation.x = Math.random() * 0.5 - 0.25;

            arrangementGroup.add(leaf);
        }

        arrangementGroup.position.copy(position);
        this.roomGroup.add(arrangementGroup);

        // Store reference for animation
        this.flowerArrangement = arrangementGroup;
    }

    createDetailedFlower(scale, flowerType) {
        const flowerGroup = new THREE.Group();
        const flowerSize = scale * flowerType.size;

        // Create flower center with texture
        const centerGeometry = new THREE.SphereGeometry(flowerSize * 0.04, 16, 16);
        const centerMaterial = new THREE.MeshStandardMaterial({
            color: 0xffd700,
            roughness: 0.7,
            metalness: 0.1,
            emissive: 0xffd700,
            emissiveIntensity: 0.2
        });
        const center = new THREE.Mesh(centerGeometry, centerMaterial);
        center.castShadow = true;
        flowerGroup.add(center);

        // Create detailed petals with curved geometry
        const petalCount = flowerType.name === 'rose' ? 12 : flowerType.name === 'peony' ? 16 : 8;
        const layers = flowerType.name === 'rose' || flowerType.name === 'peony' ? 3 : 2;

        for (let layer = 0; layer < layers; layer++) {
            const layerPetalCount = Math.floor(petalCount * (1 - layer * 0.2));
            const layerRadius = flowerSize * 0.05 * (1 + layer * 0.3);
            const layerAngleOffset = (layer * Math.PI) / layerPetalCount;

            for (let p = 0; p < layerPetalCount; p++) {
                const petalAngle = (p / layerPetalCount) * Math.PI * 2 + layerAngleOffset;

                // Create curved petal using bezier curve
                const petalCurve = new THREE.QuadraticBezierCurve3(
                    new THREE.Vector3(0, 0, 0),
                    new THREE.Vector3(0, flowerSize * 0.06, flowerSize * 0.03),
                    new THREE.Vector3(0, flowerSize * 0.12, 0)
                );

                const petalGeometry = new THREE.TubeGeometry(petalCurve, 8, flowerSize * 0.03, 4, false);

                // Add gradient to petals
                const petalColor = new THREE.Color(flowerType.color);
                const lighterColor = petalColor.clone().lerp(new THREE.Color(0xffffff), 0.3);

                const petalMaterial = new THREE.MeshStandardMaterial({
                    color: layer === 0 ? petalColor : lighterColor,
                    roughness: 0.5,
                    metalness: 0.05,
                    side: THREE.DoubleSide,
                    transparent: true,
                    opacity: 0.9
                });

                const petal = new THREE.Mesh(petalGeometry, petalMaterial);

                // Position and rotate petal
                petal.position.x = Math.cos(petalAngle) * layerRadius;
                petal.position.z = Math.sin(petalAngle) * layerRadius;
                petal.rotation.y = petalAngle;
                petal.rotation.x = Math.PI / 4 + layer * 0.2;
                petal.castShadow = true;
                petal.receiveShadow = true;

                flowerGroup.add(petal);
            }
        }

        // Add inner stamens (for realism)
        if (flowerType.name !== 'tulip') {
            for (let s = 0; s < 8; s++) {
                const stamenAngle = (s / 8) * Math.PI * 2;
                const stamenGeometry = new THREE.CylinderGeometry(
                    flowerSize * 0.005,
                    flowerSize * 0.005,
                    flowerSize * 0.08,
                    4
                );
                const stamenMaterial = new THREE.MeshStandardMaterial({
                    color: 0xffe4b5,
                    roughness: 0.8
                });
                const stamen = new THREE.Mesh(stamenGeometry, stamenMaterial);
                stamen.position.x = Math.cos(stamenAngle) * flowerSize * 0.02;
                stamen.position.y = flowerSize * 0.04;
                stamen.position.z = Math.sin(stamenAngle) * flowerSize * 0.02;
                stamen.rotation.z = (Math.random() - 0.5) * 0.3;
                flowerGroup.add(stamen);

                // Stamen tip
                const tipGeometry = new THREE.SphereGeometry(flowerSize * 0.008, 8, 8);
                const tipMaterial = new THREE.MeshStandardMaterial({
                    color: 0x8b4513,
                    roughness: 0.9
                });
                const tip = new THREE.Mesh(tipGeometry, tipMaterial);
                tip.position.copy(stamen.position);
                tip.position.y += flowerSize * 0.04;
                flowerGroup.add(tip);
            }
        }

        return flowerGroup;
    }

    setupInteractions() {
        // Room selector buttons
        const roomButtons = document.querySelectorAll('.room-btn');
        roomButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                roomButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const roomType = btn.dataset.room;
                this.currentRoom = roomType;
                this.createRoom(roomType);
                this.updatePlacementInfo(roomType);
            });
        });

        // Enhanced mouse interactions
        this.canvas.addEventListener('mousedown', () => {
            this.isRotating = true;
            this.autoRotate = false;
            this.canvas.style.cursor = 'grabbing';
        });

        this.canvas.addEventListener('mouseup', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'grab';
        });

        this.canvas.addEventListener('mouseleave', () => {
            this.isRotating = false;
            this.canvas.style.cursor = 'grab';
            // Resume auto-rotate after 2 seconds of no interaction
            setTimeout(() => {
                if (!this.isRotating) {
                    this.autoRotate = true;
                }
            }, 2000);
        });

        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            const newMouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
            const newMouseY = -((e.clientY - rect.top) / rect.height) * 2 + 1;

            if (this.isRotating) {
                // Calculate mouse movement delta
                const deltaX = newMouseX - this.mouse.x;
                const deltaY = newMouseY - this.mouse.y;

                // Update spherical coordinates for full 3-axis rotation
                this.cameraOrbit.theta -= deltaX * 2; // Horizontal rotation (left-right drag)
                this.cameraOrbit.phi -= deltaY * 1.5;  // Vertical rotation (up-down drag)

                // Clamp phi to prevent camera flipping
                this.cameraOrbit.phi = Math.max(0.1, Math.min(Math.PI - 0.1, this.cameraOrbit.phi));

                this.rotationSpeed = 0; // Stop auto-rotation
            }

            this.mouse.x = newMouseX;
            this.mouse.y = newMouseY;
        });

        // Mouse wheel for zoom
        this.canvas.addEventListener('wheel', (e) => {
            e.preventDefault();
            const zoomSpeed = 0.002;
            this.cameraOrbit.radius += e.deltaY * zoomSpeed;
            this.cameraOrbit.radius = Math.max(1.5, Math.min(6, this.cameraOrbit.radius));
            this.autoRotate = false;
        });

        this.canvas.style.cursor = 'grab';

        // Hotspot interactions
        const hotspots = document.querySelectorAll('.hotspot');
        hotspots.forEach(hotspot => {
            hotspot.addEventListener('mouseenter', () => {
                hotspot.querySelector('.hotspot-tooltip').style.opacity = '1';
                hotspot.querySelector('.hotspot-tooltip').style.transform = 'translateY(0)';
            });

            hotspot.addEventListener('mouseleave', () => {
                hotspot.querySelector('.hotspot-tooltip').style.opacity = '0';
                hotspot.querySelector('.hotspot-tooltip').style.transform = 'translateY(10px)';
            });
        });
    }

    updatePlacementInfo(roomType) {
        const infoData = {
            living: {
                title: 'Living Room Sofa Corner',
                details: [
                    { icon: '💡', label: 'Lighting', text: 'Natural side lighting enhances the flower colors' },
                    { icon: '📏', label: 'Height', text: 'Eye level when seated for optimal viewing' },
                    { icon: '🎨', label: 'Color Harmony', text: 'Soft pinks complement neutral furniture tones' },
                    { icon: '🌸', label: 'Vessel', text: 'Elegant ceramic vase matches the room\'s aesthetic' }
                ]
            },
            office: {
                title: 'Executive Desk Corner',
                details: [
                    { icon: '💡', label: 'Lighting', text: 'Indirect lighting prevents glare on desk surface' },
                    { icon: '📏', label: 'Height', text: 'Compact to avoid blocking computer monitors' },
                    { icon: '🎨', label: 'Color Psychology', text: 'Calming colors enhance focus and productivity' },
                    { icon: '🌸', label: 'Vessel', text: 'Modern sleek vase suits professional environment' }
                ]
            },
            dining: {
                title: 'Dining Table Centerpiece',
                details: [
                    { icon: '💡', label: 'Lighting', text: 'Overhead chandelier creates dramatic shadows' },
                    { icon: '📏', label: 'Height', text: 'Low profile allows conversation across table' },
                    { icon: '🎨', label: 'Design', text: '360° viewing ensures beauty from all angles' },
                    { icon: '🌸', label: 'Vessel', text: 'Wide shallow bowl maximizes visual impact' }
                ]
            },
            entrance: {
                title: 'Grand Entrance Statement',
                details: [
                    { icon: '💡', label: 'Lighting', text: 'Spotlit from above for maximum drama' },
                    { icon: '📏', label: 'Height', text: 'Tall arrangement creates impressive first impression' },
                    { icon: '🎨', label: 'Bold Colors', text: 'Rich hues command attention immediately' },
                    { icon: '🌸', label: 'Vessel', text: 'Substantial sculptural vase anchors the design' }
                ]
            }
        };

        const info = infoData[roomType];
        const titleEl = document.querySelector('.placement-title');
        const detailsContainer = document.querySelector('.placement-details');

        // Fade out
        gsap.to([titleEl, detailsContainer], {
            opacity: 0,
            duration: 0.3,
            onComplete: () => {
                titleEl.textContent = info.title;

                detailsContainer.innerHTML = info.details.map(detail => `
                    <div class="placement-detail">
                        <div class="detail-icon">${detail.icon}</div>
                        <div class="detail-content">
                            <strong>${detail.label}:</strong> ${detail.text}
                        </div>
                    </div>
                `).join('');

                // Fade in
                gsap.to([titleEl, detailsContainer], {
                    opacity: 1,
                    duration: 0.5,
                    stagger: 0.1
                });
            }
        });
    }

    setupResize() {
        window.addEventListener('resize', () => {
            if (!this.canvas) return;

            this.camera.aspect = this.canvas.clientWidth / this.canvas.clientHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(this.canvas.clientWidth, this.canvas.clientHeight);
            this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        });
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Auto-rotation when not interacting
        if (this.autoRotate && !this.isRotating) {
            this.cameraOrbit.theta += 0.003; // Slow auto-rotation
        }

        // Convert spherical coordinates to Cartesian for camera position
        const lookAtPoint = new THREE.Vector3(0, 1, 0); // Always look at flower center

        // Calculate camera position using spherical coordinates
        const x = this.cameraOrbit.radius * Math.sin(this.cameraOrbit.phi) * Math.cos(this.cameraOrbit.theta);
        const y = this.cameraOrbit.radius * Math.cos(this.cameraOrbit.phi);
        const z = this.cameraOrbit.radius * Math.sin(this.cameraOrbit.phi) * Math.sin(this.cameraOrbit.theta);

        // Smooth camera movement
        this.camera.position.x += (x - this.camera.position.x) * 0.1;
        this.camera.position.y += (y + 1 - this.camera.position.y) * 0.1; // Offset Y to look at flowers
        this.camera.position.z += (z - this.camera.position.z) * 0.1;

        // Always look at the flower arrangement
        this.camera.lookAt(lookAtPoint);

        // Subtle flower movement (breathing effect)
        if (this.flowerArrangement) {
            const time = Date.now() * 0.001;
            this.flowerArrangement.position.y += Math.sin(time * 0.5) * 0.0002;

            // Individual flower sway
            this.flowerArrangement.children.forEach((child, index) => {
                if (child.type === 'Group' && child.children.length > 0) {
                    const swayAmount = Math.sin(time * 0.8 + index * 0.5) * 0.005;
                    child.rotation.z = swayAmount;
                }
            });
        }

        // Update spotlight to follow camera angle
        if (this.flowerSpotlight) {
            this.flowerSpotlight.position.x = Math.sin(this.cameraOrbit.theta + Math.PI / 4) * 2;
            this.flowerSpotlight.position.z = Math.cos(this.cameraOrbit.theta + Math.PI / 4) * 2;
        }

        this.renderer.render(this.scene, this.camera);
    }
}
