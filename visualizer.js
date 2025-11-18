// ===== AI VISUALIZER FUNCTIONALITY =====

class AIVisualizer {
    constructor() {
        this.canvas = document.getElementById('visualizerCanvas');
        this.ctx = this.canvas ? this.canvas.getContext('2d') : null;
        this.uploadedImage = null;
        this.placedVases = [];
        this.draggingVase = null;

        // Product data for AI recommendations
        this.productDatabase = [
            {
                name: 'Kyoto Ceramic Planter',
                image: '/images/product-1.jpg',
                price: '₹3,499',
                style: 'modern minimalist',
                color: 'neutral white beige'
            },
            {
                name: 'Mediterranean Terracotta',
                image: '/images/product-3.jpg',
                price: '₹1,899',
                style: 'rustic traditional',
                color: 'warm terracotta'
            },
            {
                name: 'Scandi White Collection',
                image: '/images/product-2.jpg',
                price: '₹2,799',
                style: 'scandinavian modern',
                color: 'pure white'
            },
            {
                name: 'Jade Garden Vase',
                image: '/images/product-5.jpg',
                price: '₹5,499',
                style: 'artisan luxury',
                color: 'sage green'
            },
            {
                name: 'Architectural Series',
                image: '/images/product-4.jpg',
                price: '₹4,999',
                style: 'contemporary bold',
                color: 'charcoal gray'
            },
            {
                name: 'Hanging Garden Set',
                image: '/images/product-6.jpg',
                price: '₹3,299',
                style: 'bohemian eclectic',
                color: 'mixed earth tones'
            }
        ];

        this.init();
    }

    init() {
        if (!this.canvas) {
            console.error('Visualizer canvas not found');
            return;
        }

        // Upload button
        const uploadBtn = document.getElementById('uploadBtn');
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');

        if (!uploadBtn || !fileInput || !uploadArea) {
            console.error('Upload elements not found:', { uploadBtn, fileInput, uploadArea });
            return;
        }

        // Button click handler
        uploadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // File input change handler
        fileInput.addEventListener('change', (e) => this.handleFileSelect(e));

        // Make upload area clickable
        uploadArea.addEventListener('click', (e) => {
            // Don't trigger if clicking the button itself
            if (e.target === uploadBtn || uploadBtn.contains(e.target)) {
                return;
            }
            fileInput.click();
        });

        // Drag and drop for upload area
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                const file = files[0];
                if (file.type.startsWith('image/')) {
                    this.loadImage(file);
                } else {
                    console.error('Please upload an image file');
                    alert('Please upload an image file (JPG, PNG, etc.)');
                }
            }
        });

        // Control buttons
        const resetBtn = document.getElementById('resetBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const newImageBtn = document.getElementById('newImageBtn');

        if (resetBtn) resetBtn.addEventListener('click', () => this.reset());
        if (downloadBtn) downloadBtn.addEventListener('click', () => this.download());
        if (newImageBtn) newImageBtn.addEventListener('click', () => this.newImage());

        // Canvas interactions - mouse events
        this.canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));

        // Canvas interactions - touch events for mobile
        this.canvas.addEventListener('touchstart', (e) => this.handleCanvasTouchStart(e));
        this.canvas.addEventListener('touchmove', (e) => this.handleCanvasTouchMove(e));
        this.canvas.addEventListener('touchend', (e) => this.handleCanvasTouchEnd(e));
    }

    handleFileSelect(event) {
        const file = event.target.files[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        if (file.type.startsWith('image/')) {
            console.log('Loading image:', file.name);
            this.loadImage(file);
        } else {
            console.error('Invalid file type:', file.type);
            alert('Please select an image file (JPG, PNG, etc.)');
        }
    }

    loadImage(file) {
        console.log('Starting image load...');
        const reader = new FileReader();

        reader.onerror = (error) => {
            console.error('FileReader error:', error);
            alert('Error reading file. Please try again.');
        };

        reader.onload = (e) => {
            console.log('File loaded, creating image...');
            const img = new Image();

            img.onerror = (error) => {
                console.error('Image load error:', error);
                alert('Error loading image. Please try a different image.');
            };

            img.onload = () => {
                console.log('Image loaded successfully:', img.width, 'x', img.height);
                this.uploadedImage = img;
                this.setupCanvas();
                this.drawImage();
                this.showInterface();
                this.generateRecommendations();
            };

            img.src = e.target.result;
        };

        reader.readAsDataURL(file);
    }

    setupCanvas() {
        const maxWidth = 1000;
        const maxHeight = 700;
        let width = this.uploadedImage.width;
        let height = this.uploadedImage.height;

        // Scale down if needed
        if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
        }
        if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
        }

        this.canvas.width = width;
        this.canvas.height = height;
    }

    drawImage() {
        if (!this.uploadedImage) return;
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.uploadedImage, 0, 0, this.canvas.width, this.canvas.height);

        // Draw placed vases
        this.placedVases.forEach(vase => {
            const img = new Image();
            img.src = vase.image;
            img.onload = () => {
                this.ctx.drawImage(img, vase.x - vase.width/2, vase.y - vase.height, vase.width, vase.height);
            };
        });
    }

    showInterface() {
        document.getElementById('uploadArea').style.display = 'none';
        this.canvas.style.display = 'block';
        document.getElementById('controls').style.display = 'flex';
        document.getElementById('recommendationsPanel').style.display = 'block';
    }

    generateRecommendations() {
        // Simulate AI analysis with random recommendations
        const shuffled = [...this.productDatabase].sort(() => 0.5 - Math.random());
        const recommendations = shuffled.slice(0, 4);

        const reasons = [
            'Complements warm lighting and neutral tones in your space',
            'Matches the modern aesthetic and clean lines visible',
            'Perfect size and color harmony with existing decor',
            'Adds visual interest while maintaining cohesive style'
        ];

        const matches = ['96% match', '94% match', '91% match', '88% match'];

        const listHTML = recommendations.map((product, index) => `
            <div class="recommendation-card" draggable="true" data-product-index="${index}" data-product='${JSON.stringify(product)}'>
                <img src="${product.image}" alt="${product.name}" class="recommendation-image">
                <div class="recommendation-info">
                    <h4 class="recommendation-name">${product.name}</h4>
                    <div class="recommendation-match">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                        </svg>
                        ${matches[index]}
                    </div>
                    <p class="recommendation-reason">${reasons[index]}</p>
                    <span class="recommendation-price">${product.price}</span>
                </div>
            </div>
        `).join('');

        document.getElementById('recommendationsList').innerHTML = listHTML;

        // Add drag listeners to recommendations (desktop)
        document.querySelectorAll('.recommendation-card').forEach(card => {
            card.addEventListener('dragstart', (e) => this.handleDragStart(e));
            card.addEventListener('dragend', () => this.handleDragEnd());

            // Touch events for mobile
            card.addEventListener('touchstart', (e) => this.handleRecommendationTouchStart(e));
            card.addEventListener('click', (e) => this.handleRecommendationClick(e));
        });
    }

    handleDragStart(event) {
        const productData = JSON.parse(event.target.dataset.product);
        this.draggingVase = productData;
        event.dataTransfer.effectAllowed = 'copy';
        event.target.style.opacity = '0.5';
    }

    handleDragEnd() {
        document.querySelectorAll('.recommendation-card').forEach(card => {
            card.style.opacity = '1';
        });
    }

    handleCanvasClick(event) {
        if (!this.draggingVase) return;

        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        // Add vase at clicked position
        this.placeVase(x, y, this.draggingVase);
        this.draggingVase = null;
    }

    handleCanvasMouseMove(event) {
        if (this.draggingVase) {
            this.canvas.style.cursor = 'crosshair';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    placeVase(x, y, product) {
        const vaseWidth = 150;
        const vaseHeight = 200;

        this.placedVases.push({
            x: x,
            y: y,
            width: vaseWidth,
            height: vaseHeight,
            image: product.image,
            name: product.name
        });

        this.redrawCanvas();
    }

    redrawCanvas() {
        if (!this.uploadedImage) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.drawImage(this.uploadedImage, 0, 0, this.canvas.width, this.canvas.height);

        // Draw all placed vases
        let loadedImages = 0;
        this.placedVases.forEach((vase, index) => {
            const img = new Image();
            img.onload = () => {
                this.ctx.drawImage(img, vase.x - vase.width/2, vase.y - vase.height, vase.width, vase.height);
                loadedImages++;
            };
            img.src = vase.image;
        });
    }

    reset() {
        this.placedVases = [];
        this.redrawCanvas();
    }

    download() {
        const link = document.createElement('a');
        link.download = 'midori-gardens-visualization.png';
        link.href = this.canvas.toDataURL();
        link.click();
    }

    newImage() {
        this.uploadedImage = null;
        this.placedVases = [];
        this.canvas.style.display = 'none';
        document.getElementById('controls').style.display = 'none';
        document.getElementById('recommendationsPanel').style.display = 'none';
        document.getElementById('uploadArea').style.display = 'flex';
        document.getElementById('fileInput').value = '';
    }

    // Touch event handlers for mobile devices
    handleRecommendationTouchStart(event) {
        const card = event.currentTarget;
        const productData = JSON.parse(card.dataset.product);
        this.draggingVase = productData;
        card.style.opacity = '0.5';

        // Provide visual feedback
        card.style.transform = 'scale(0.95)';
        setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
        }, 200);
    }

    handleRecommendationClick(event) {
        // On mobile, clicking a recommendation selects it
        const card = event.currentTarget;
        const productData = JSON.parse(card.dataset.product);

        // Remove previous selection
        document.querySelectorAll('.recommendation-card').forEach(c => {
            c.style.borderColor = 'transparent';
        });

        // Highlight selected
        card.style.borderColor = 'var(--color-secondary)';
        this.draggingVase = productData;

        // Show message on mobile
        if ('ontouchstart' in window) {
            const helpText = document.querySelector('.panel-help span');
            if (helpText) {
                helpText.textContent = 'Now tap on your image where you want to place this vase';
            }
        }
    }

    handleCanvasTouchStart(event) {
        event.preventDefault();
        if (!this.draggingVase) return;

        const rect = this.canvas.getBoundingClientRect();
        const touch = event.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;

        this.placeVase(x, y, this.draggingVase);
        this.draggingVase = null;

        // Reset border colors
        document.querySelectorAll('.recommendation-card').forEach(c => {
            c.style.borderColor = 'transparent';
        });

        // Reset help text
        const helpText = document.querySelector('.panel-help span');
        if (helpText) {
            helpText.textContent = 'Drag vases from recommendations onto your image';
        }
    }

    handleCanvasTouchMove(event) {
        event.preventDefault();
    }

    handleCanvasTouchEnd(event) {
        event.preventDefault();
    }
}

// Initialize visualizer when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new AIVisualizer();
    });
} else {
    new AIVisualizer();
}
