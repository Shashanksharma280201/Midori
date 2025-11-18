# Image Replacement Guide

This guide helps you replace the Unsplash placeholder images with actual images from midorigardens.in

## How to Add Real Images

### Step 1: Download Images from midorigardens.in
1. Visit https://midorigardens.in/
2. Right-click on product images and save them
3. Save to: `/midori_gardens_premium/assets/images/`

### Step 2: Replace Image URLs in HTML

Open `index.html` and search for these image locations:

#### Hero Section (Lines 93-103)
```html
<!-- CURRENT: -->
<img src="https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800&h=1000&fit=crop"

<!-- REPLACE WITH: -->
<img src="./assets/images/hero-main-planter.jpg"
```

#### Product Images (Lines 139, 166, 192, 219, 246, 272)
Replace each product image URL:
```html
<!-- Find URLs like: -->
https://images.unsplash.com/photo-1416879595882-3373a0480b5b

<!-- Replace with: -->
./assets/images/product-1.jpg
./assets/images/product-2.jpg
... etc
```

#### Materials Section (Line 306)
```html
<!-- CURRENT: -->
<img src="https://images.unsplash.com/photo-1612198188060-c7c2a3b66eae?w=800&h=1000&fit=crop"

<!-- REPLACE WITH: -->
<img src="./assets/images/craftsman.jpg"
```

#### Styling Guide (Lines 385, 401, 417)
```html
<!-- Replace these 3 image URLs with your interior shots -->
./assets/images/styled-room-1.jpg
./assets/images/styled-room-2.jpg
./assets/images/styled-room-3.jpg
```

#### About Section (Line 572)
```html
<!-- CURRENT: -->
<img src="https://images.unsplash.com/photo-1528650146304-dc6b5a64e8bd?w=700&h=900&fit=crop"

<!-- REPLACE WITH: -->
<img src="./assets/images/workshop.jpg"
```

## Recommended Image Sizes

- **Hero Main Product**: 800×1000px (portrait)
- **Hero Accent Products**: 300×300px (square)
- **Product Cards**: 600×750px (4:5 ratio)
- **Materials/Craftsman**: 800×1000px
- **Styling Guide**: 700×500px (landscape)
- **About/Workshop**: 700×900px
- **Testimonial Avatars**: 100×100px (use pravatar.cc or replace)

## Quick Find & Replace

Use your code editor's find & replace:

1. **Find**: `https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600&h=750&fit=crop`
2. **Replace**: `./assets/images/ceramic-planter-kyoto.jpg`

Repeat for each image.

## Image Naming Suggestions

```
hero-main-planter.jpg
hero-accent-terracotta.jpg
hero-accent-modern.jpg

product-ceramic-kyoto.jpg
product-scandi-white.jpg
product-terracotta-mediterranean.jpg
product-architectural-series.jpg
product-jade-collection.jpg
product-hanging-suspended.jpg

craftsman-working.jpg
styled-room-minimalist.jpg
styled-room-bohemian.jpg
styled-room-scandinavian.jpg
workshop-pottery.jpg
```

## Testing

After replacing images:
1. Save `index.html`
2. The dev server will auto-reload
3. Check that all images appear correctly

## Optimization Tips

- Compress images before adding (use tinypng.com or squoosh.app)
- Keep file sizes under 200KB for fast loading
- Use JPG for photos, PNG for graphics with transparency
- Maintain aspect ratios as specified above

---

**Note**: All current Unsplash images are royalty-free and can remain for development. Replace with actual product photos when deploying to production.
