# Midori Gardens Premium Website

A stunning, premium e-commerce website for **Midori Gardens** - featuring planters, pots, and garden decor with advanced Three.js 3D graphics and modern UI/UX design.

## Features

### Premium Design Elements
- **Glassmorphism UI** - Frosted glass effects with backdrop blur throughout
- **Custom Color Scheme** - Natural green palette (#2d5016, #4a7c2c, #6b9b3d)
- **Elegant Typography** - Playfair Display (serif) + Inter (sans-serif) pairing
- **Custom Cursor** - Interactive gradient cursor with hover states
- **Smooth Animations** - GSAP-powered scroll triggers and transitions

### Advanced 3D Graphics
- **Three.js Background** - WebGL rendering with floating leaf particles
- **Custom Shaders** - GLSL shaders for realistic leaf animations
- **Interactive Particles** - 100+ animated leaves with individual physics
- **Ambient Particles** - 200 background particles for depth
- **Mouse Parallax** - Camera follows mouse movement
- **Scroll Effects** - 3D elements rotate based on scroll position

### Sections
1. **Hero** - Compelling introduction with stats and CTAs
2. **Products** - 6 product categories with feature lists
   - Ceramic Planters
   - Modern Minimalist (Bestseller)
   - Terracotta Collection
   - Self-Watering Pots
   - Hanging Planters
   - Large Planters
3. **Process** - 4-step purchasing journey
4. **Gallery** - Portfolio showcase with hover overlays
5. **About** - Company story and values
6. **Testimonials** - Auto-scrolling customer reviews
7. **Contact** - Form with location details
8. **Footer** - Newsletter, links, and social media

## Technology Stack

- **Three.js** - 3D graphics and WebGL rendering
- **GSAP** - Professional animation library with ScrollTrigger
- **Vite** - Lightning-fast build tool and dev server
- **Custom GLSL Shaders** - Vertex and fragment shaders for particles
- **Modern CSS** - Grid, Flexbox, custom properties, glassmorphism

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
midori_gardens_premium/
├── index.html          # Main HTML structure
├── style.css           # Complete styling (1000+ lines)
├── main.js             # Three.js scene & GSAP animations
├── package.json        # Project dependencies
└── README.md          # Documentation
```

## Customization

### Colors
Edit CSS variables in `style.css`:
```css
:root {
    --color-primary: #2d5016;    /* Dark Green */
    --color-secondary: #4a7c2c;  /* Medium Green */
    --color-accent: #6b9b3d;     /* Light Green */
    --color-earth: #8b7355;      /* Earth tone */
}
```

### Product Categories
Update the services section in `index.html` to add/modify product categories.

### Animations
Modify GSAP animations in `main.js`:
```javascript
gsap.from('.element', {
    scrollTrigger: { trigger: '.section' },
    duration: 1,
    opacity: 0,
    y: 30
});
```

### Three.js Scene
Adjust particle count and colors in `main.js`:
```javascript
const leafCount = 100;  // Number of leaf particles
const particleCount = 200;  // Number of ambient particles
```

## Performance

- 60 FPS animations
- Optimized WebGL rendering
- Efficient particle systems
- Lazy-loaded scroll animations
- Responsive image handling
- Adaptive pixel ratio

## Responsive Design

Fully responsive across all devices:
- **Desktop** - Full 3D effects and animations
- **Tablet** - Optimized layout (1024px breakpoint)
- **Mobile** - Simplified design (768px & 480px breakpoints)

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## SEO & Accessibility

- Semantic HTML5
- Meta tags for social sharing
- Alt text for images (when added)
- ARIA labels where appropriate
- Smooth scroll behavior
- Keyboard navigation support

## Content Customization for midorigardens.in

This template is designed for the planter/pot business at **midorigardens.in**. To customize:

1. **Replace placeholder content** in `index.html`:
   - Update company information
   - Add real product details and pricing
   - Include actual client testimonials
   - Update contact information

2. **Add real images**:
   - Replace gradient placeholders in gallery section
   - Add product photography
   - Include lifestyle shots

3. **Configure e-commerce**:
   - Integrate with Shopify, WooCommerce, or custom backend
   - Add shopping cart functionality
   - Set up payment gateway

4. **Update SEO**:
   - Modify meta tags for your business
   - Add structured data (Schema.org)
   - Configure sitemap and robots.txt

## Future Enhancements

- [ ] Product detail pages with image galleries
- [ ] Shopping cart and checkout flow
- [ ] User accounts and order tracking
- [ ] Product filtering and search
- [ ] Blog section for gardening tips
- [ ] Live chat support
- [ ] Multi-language support
- [ ] Dark mode toggle

## License

Proprietary - Created for Midori Gardens

## Credits

Built with modern web technologies:
- Three.js for 3D graphics
- GSAP for animations
- Vite for build tooling
- Premium design inspired by luxury e-commerce sites

---

**Version**: 1.0.0
**Last Updated**: 2024
**Created for**: midorigardens.in - Premium Planters & Garden Decor
