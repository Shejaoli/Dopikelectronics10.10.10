# Dopik Electronics Design Guidelines

## Design Approach
**Reference-Based: Premium E-commerce Fusion**
Drawing from Reebelo's clean refinement + Apple's product-focus + Shopify's conversion optimization. Prioritizing product imagery, trust-building, and frictionless purchasing.

## Typography System

**Font Stack:** Inter (primary) + Space Grotesk (accents)
- Hero Headline: Space Grotesk, 56-72px, font-bold, tracking-tight
- Section Headers: Space Grotesk, 36-48px, font-semibold
- Product Titles: Inter, 20-24px, font-semibold
- Body Text: Inter, 16px, font-normal, leading-relaxed
- Captions/Labels: Inter, 14px, font-medium
- Prices: Space Grotesk, 24-32px, font-bold
- Mobile scales down 30-40%

## Layout System

**Spacing Primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 24
- Section padding: py-16 lg:py-24
- Component gaps: gap-4 to gap-8
- Card padding: p-6
- Container: max-w-7xl mx-auto px-4 lg:px-8

**Grid Patterns:**
- Product grids: grid-cols-2 md:grid-cols-3 lg:grid-cols-4
- Featured products: grid-cols-1 md:grid-cols-2 gap-6
- Category cards: grid-cols-2 lg:grid-cols-3

## Component Library

### Navigation
Sticky header with logo left, centered category links, right-aligned search/cart/account icons. Transparent over hero, solid white on scroll with subtle shadow.

### Product Cards
White background, rounded-xl, subtle shadow on hover (shadow-lg transition). Large product image (4:3 ratio), condition badge (top-right), product name, spec highlights (2-3 key features), price with original crossed-out if discounted, quick "Add to Cart" button.

### Hero Section
Full-width banner with lifestyle product imagery, overlaid headline + subheadline (left or center-aligned), dual CTA buttons (primary solid, secondary outline) with backdrop-blur-md bg-white/10 treatment.

### Category Browsing
Large category cards with product imagery, category name overlay, product count, hover lift effect (translate-y-1).

### Trust Elements
Icon + text combos for: Free shipping, warranty, certified refurbished, secure checkout. Displayed in horizontal row with gap-8.

### Product Detail View
Two-column layout: Left = image gallery with thumbnails, Right = title, ratings, price, condition selector, quantity, add-to-cart, specifications accordion, shipping info.

### Footer
Four-column grid (mobile stacks): Shop categories, Support links, Company info, Newsletter signup. Social icons, payment badges, trust certifications at bottom.

## Images

**Hero Image:** Full-width lifestyle shot showcasing premium electronics in modern setting (e.g., sleek laptop on minimalist desk, high-end headphones in workspace). Image should be 1920x800px, with darker left/right edges for text overlay contrast.

**Product Images:** Clean white/light gray backgrounds, 800x800px minimum, multiple angles available. Show products at 45-degree angle for depth.

**Category Images:** Contextual lifestyle shots (smartphones in hand, laptops in use, audio gear in studio), 600x400px, subtle gradient overlays.

**Trust Section:** Use minimal illustrative icons (not photographs) for warranty/shipping/certification messaging.

**About/Story Section:** Office/warehouse photo showing quality control process, team authenticity.

## Interactions

Minimal animations: Smooth scale on card hover (scale-105), gentle fade transitions (duration-300), smooth scroll to sections. Product image zoom on hover. Avoid excessive motion - prioritize speed and clarity.