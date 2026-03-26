# Design Guidelines: Showcase3D Engine

## Design Approach
**Reference-Based Creative Portfolio** - Drawing inspiration from award-winning 3D portfolios like Bruno Simon, Awwwards winners, and modern creative showcases. This approach emphasizes bold visual statements, immersive experiences, and showcasing work as the primary focus.

**Core Principle**: Let the 3D work be the hero. Design supports and elevates the showcases without competing for attention.

---

## Typography System

**Font Stack**: 
- Primary: "Inter" or "Outfit" (Google Fonts) - Clean, modern sans-serif for UI
- Display: "Space Grotesk" or "Archivo" - Bold, architectural feel for headlines

**Hierarchy**:
- Hero/Display: text-6xl to text-8xl, font-bold, tracking-tight
- Section Headers: text-4xl to text-5xl, font-semibold
- Project Titles: text-2xl to text-3xl, font-medium
- Body: text-base to text-lg, font-normal
- Labels/Meta: text-sm, font-medium, uppercase tracking-wider

---

## Layout System

**Spacing Primitives**: Use Tailwind units of 4, 8, 12, 16, 24 for consistent rhythm (p-4, gap-8, mt-12, py-16, space-y-24)

**Grid Strategy**:
- Desktop: Asymmetric 12-column grid for dynamic layouts
- Project showcases: Varied sizes (some full-width, some 2/3, some 1/2)
- Avoid uniform grids - create visual interest through size variation

**Container Approach**:
- Full-bleed sections for immersive 3D showcases
- Constrained content: max-w-7xl for text-heavy sections
- Side padding: px-6 md:px-12 lg:px-16

---

## Component Library

### Navigation
- Fixed header with blur backdrop (backdrop-blur-md)
- Minimal logo + 3-4 nav items + CTA
- Mobile: Slide-out menu with smooth transitions

### Hero Section
- **Full-viewport immersive experience** (min-h-screen)
- Large hero image showcasing premier 3D work
- Centered headline with tagline
- Single CTA with blurred background (backdrop-blur-lg bg-white/10)
- Scroll indicator animation at bottom

### Project Showcase Cards
- Full-width image/video previews
- Hover: Subtle scale transform (scale-105)
- Overlay gradient for text readability
- Title + brief description + tech tags
- Click expands to detailed view

### Project Detail View
- Large hero image of project
- Two-column layout: Left (media gallery), Right (description, tech stack, links)
- Responsive stack on mobile
- "Next Project" navigation at bottom

### Footer
- Minimal: Logo, social links, contact email
- Copyright + "Built with passion" statement
- No newsletter, keep it clean

---

## Animations

**Minimal & Purposeful** (Framer Motion):
- Page transitions: Fade + slight slide-up (y: 20 → 0)
- Project cards: Hover scale + shadow enhancement
- Scroll reveals: Stagger children animations for project grids
- Hero: Subtle parallax on scroll (if applicable)

**Performance**: Limit animations to user-triggered interactions, avoid continuous loops

---

## Images

### Hero Section
- **Large hero image**: Full-width, high-quality 3D render or composition
- Dimensions: 1920x1080 minimum, optimized WebP format
- Placement: Background with gradient overlay for text contrast

### Project Gallery
- Thumbnail images: 16:9 ratio, consistent sizing
- Detail views: Various aspect ratios supported (portrait, landscape, square)
- All images: Lazy-loaded, with blur-up placeholders

---

## Key UX Patterns

**Navigation Flow**: Home → Project Grid → Project Detail → Next Project (circular browsing)

**Interaction Model**:
- Hover states reveal additional context
- Click/tap navigates or expands
- Escape key closes expanded views
- Smooth scroll between sections

**Responsive Strategy**:
- Desktop: Multi-column asymmetric layouts
- Tablet: 2-column balanced grids
- Mobile: Single column, full-width showcases

---

This creates a modern, immersive portfolio experience that puts 3D work front and center while maintaining sophisticated, minimal UI design.