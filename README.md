# CULTURE - Shopify Theme

A modern, luxury Shopify Online Store 2.0 theme for prebiotic and kombucha drinks brand "CULTURE". Features a cinematic, editorial, and luxury aesthetic similar to high-end skincare or jewelry brands, while remaining clean, minimal, and wellness-focused.

## 🎨 Design Aesthetic

- **Minimalist** - White-space heavy layout
- **Editorial Luxury** - Magazine-style presentation
- **Cinematic Motion** - Slow fades, soft zooms, parallax-like effects
- **Wellness-Focused** - Calm, premium aesthetic

## 🎨 Color Palette

- Background: `#ffffff`
- Primary Text: `#000000`
- Secondary Text: `rgba(0, 0, 0, 0.7)`
- Borders: `#e5e5e5`

## 📐 Typography

- **Font**: Inter (300, 400, 500 weights)
- **Body**: 14px, weight 300
- **Headings**: Weight 400
- **Product Names**: Weight 500
- Editorial letter-spacing throughout

## 🏗️ Theme Structure

### Sections
- `split-section.liquid` - 50/50 split with product images
- `product-carousel.liquid` - Horizontal scrolling product carousel
- `hero.liquid` - Full-width cinematic hero with slow zoom
- `asymmetric-grid.liquid` - 1/3 + 2/3 asymmetric grid
- `editorial.liquid` - Two-column editorial section
- `header.liquid` - Sticky header with mega-menu
- `footer.liquid` - Minimal footer
- `product-template.liquid` - Product page template
- `collection-template.liquid` - Collection page template

### Snippets
- `product-card.liquid` - Reusable product card with hover image swap
- `cart-drawer.liquid` - Slide-out shopping cart
- Icon snippets (search, heart, cart, close)
- `meta-tags.liquid` - SEO meta tags

## 🚀 Getting Started

### Prerequisites
- Shopify store (development store or live store)
- Shopify CLI installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/culture-shopify-theme.git
   cd culture-shopify-theme
   ```

2. **Install Shopify CLI** (if not already installed)
   ```bash
   npm install -g @shopify/cli
   ```

3. **Login to Shopify**
   ```bash
   shopify auth login
   ```

4. **Start development server**
   ```bash
   shopify theme dev --store=your-store.myshopify.com
   ```

### Local Preview (Static)

For a quick static preview without Shopify:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/demo.html` in your browser.

## 📦 Features

- ✅ Shopify Online Store 2.0 compatible
- ✅ Fully responsive (mobile-first)
- ✅ Sticky header with backdrop blur
- ✅ Mega-menu dropdowns (desktop)
- ✅ Mobile hamburger menu
- ✅ Product carousel with horizontal scroll
- ✅ Product cards with hover image swap
- ✅ Cart drawer with quantity controls
- ✅ Scroll animations (fade-up on scroll)
- ✅ Cinematic hero animations
- ✅ SEO optimized

## 🛠️ Development

### File Structure
```
Kombucha/
├── assets/
│   ├── theme.css      # Main stylesheet
│   ├── theme.js       # Main JavaScript
│   └── global.js      # Global utilities
├── config/
│   └── settings_schema.json
├── layout/
│   └── theme.liquid
├── locales/
│   └── en.default.json
├── sections/
│   └── [all sections]
├── snippets/
│   └── [all snippets]
└── templates/
    └── [all templates]
```

### Customization

All sections are customizable through the Shopify theme editor. Key settings include:
- Typography (fonts, weights)
- Colors (background, text)
- Navigation menu
- Section content and images

## 📝 License

This theme is created for CULTURE brand. All rights reserved.

## 🙏 Credits

Designed and developed for CULTURE - Premium Kombucha & Prebiotic Drinks

