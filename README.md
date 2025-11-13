# Midori Flowers - Premium Floral Design Website

A stunning, interactive 3D website showcasing premium flower arrangement services with advanced Three.js visualizations.

## Features

### Advanced 3D Graphics
- **Custom GLSL Shaders** - Hand-crafted vertex and fragment shaders for realistic flower petals
- **Floating Particle Systems** - 50+ animated flower petals with individual physics
- **3D Flower Models** - Procedurally generated flowers with dynamic lighting
- **Ambient Particles** - 200 particles creating depth and atmosphere
- **Interactive Camera** - Mouse parallax and scroll-based transformations

### Interactive Placement Visualizer
- **4 Room Types** - Living room, office, dining room, and entrance
- **3D Room Scenes** - Fully rendered 3D environments with furniture and lighting
- **Real-time Flower Arrangements** - Different arrangements for each room type
- **Interactive Hotspots** - Clickable points showing placement details
- **Educational Content** - Explains lighting, height, color harmony, and vessel choices

### Premium UI/UX
- **Glassmorphism Design** - Frosted glass effects with backdrop blur
- **Smooth Animations** - GSAP-powered scroll triggers and stagger effects
- **Elegant Typography** - Cormorant Garamond + Montserrat pairing
- **Responsive Layout** - Fully optimized for mobile, tablet, and desktop
- **Custom Scrollbar** - Branded scrolling experience

## Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **GSAP** - Professional-grade animation library
- **Vite** - Lightning-fast build tool
- **Custom Shaders** - GLSL vertex and fragment shaders
- **Modern CSS** - CSS Grid, Flexbox, custom properties

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Development Server
The site will be available at `http://localhost:5173/`

## Project Structure

```
midori_flowers/
├── index.html          # Main HTML structure
├── main.js             # Background Three.js scene & interactions
├── visualizer.js       # Interactive placement visualizer
├── style.css           # Complete styling and animations
├── package.json        # Project dependencies
└── README.md          # Documentation
```

## Sections

1. **Hero** - Immersive introduction with animated typography
2. **Services** - 4 premium service cards with hover effects
3. **Placement Guide** - Interactive 3D room visualizer
4. **Process** - 4-step timeline explaining the workflow
5. **Gallery** - Visual showcase with shimmer effects
6. **Contact** - Form and contact information
7. **Footer** - Branding and social links

## Interactive Features

### Background Scene
- Floating flower petals with custom shaders
- Mouse-responsive camera movement
- Scroll-based 3D transformations
- Dynamic lighting effects

### Placement Visualizer
- **Room Selector** - Switch between different room types
- **3D Environments** - Living room with sofa, office with desk, dining table, entrance console
- **Flower Arrangements** - Size and style adapted to each room
- **Info Overlay** - Real-time placement principles
- **Hotspots** - Interactive points explaining specific details

## Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --color-secondary: #dda0dd;  /* Plum */
    --color-accent: #ffc0cb;     /* Pink */
    --color-text: #2d3436;       /* Dark gray */
}
```

### Room Types
Add new rooms in `visualizer.js` by creating new methods like:
```javascript
createNewRoom() {
    // Add furniture and arrangements
}
```

### Animations
Modify GSAP animations in `main.js`:
```javascript
gsap.from('.element', {
    scrollTrigger: { trigger: '.section' },
    duration: 1,
    // ... animation properties
});
```

## Performance

- 60 FPS animations
- Optimized Three.js rendering
- Efficient particle systems
- Responsive shadow mapping
- Adaptive pixel ratio

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

