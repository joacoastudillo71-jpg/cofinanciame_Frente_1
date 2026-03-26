# Overview

This is a **3D Showcase Engine** - a creative portfolio platform for displaying immersive real estate and architectural projects. The application presents interactive 3D experiences including floor plans, 360° tours, location maps, and project showcases through a modern, award-winning design inspired by creative portfolios like Bruno Simon.

The platform uses a **single-page application architecture** with section-based navigation, allowing users to browse a home page with multiple projects and dive deep into individual project experiences with smooth transitions.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture

**Framework**: React 18 with TypeScript, built using Vite for fast development and optimized production builds.

**State Management**: Zustand for global application state. The store (`useAppStore`) manages:
- Current project selection
- Active section navigation (home, intro, hero, floors, location, tour360)
- UI state (menu visibility, overlays, chatbot)
- View-specific state (floor selection, map levels, video indices)

**Routing Strategy**: Section-based navigation without traditional routing. The `ShowcaseEngine` component renders different view components based on the current section state. This creates smooth, app-like transitions between experiences.

**Component Structure**:
- **Layout Layer**: `MainLayout` wraps all views and conditionally renders navigation and overlays based on current section
- **Engine Layer**: `ShowcaseEngine` acts as the view controller, determining which view to render
- **View Layer**: Specialized components for each section (HomeView, IntroView, HeroView, LocationView, FloorsView, Tour360View)
- **Module Layer**: Reusable interactive components (Viewer360 for 360° panoramas)

**UI Library**: Shadcn/UI components (based on Radix UI primitives) with Tailwind CSS for styling. Custom theme configuration supports both light and dark modes with extensive color customization.

**Animation**: Framer Motion for page transitions and micro-interactions. AnimatePresence handles smooth view changes.

**3D & Interactivity**:
- Three.js for 3D rendering capabilities
- Photo Sphere Viewer for 360° panoramic experiences
- React Zoom Pan Pinch for floor plan interactions

## Backend Architecture

**Server Framework**: Express.js with TypeScript running on Node.js.

**Development Setup**: Vite middleware integration in development mode for hot module replacement. Production serves static built files.

**API Structure**: REST API pattern with routes prefixed with `/api`. The `registerRoutes` function in `server/routes.ts` is the central point for defining endpoints.

**Storage Interface**: Abstract storage interface (`IStorage`) with in-memory implementation (`MemStorage`). This allows easy switching to database-backed storage without changing business logic.

**Middleware**:
- JSON body parsing with raw body preservation for webhooks
- Request/response logging for API calls
- CORS and security headers (configurable)

## Design System

**Typography**: Modern sans-serif fonts (Inter, Outfit, Space Grotesk) loaded from Google Fonts. Clear hierarchy from display (text-6xl to text-8xl) down to labels (text-sm).

**Layout Approach**:
- Full-bleed sections for immersive 3D experiences
- Asymmetric grid system avoiding uniform layouts
- Responsive breakpoints (mobile-first)
- Spacing primitives based on Tailwind's 4px scale

**Visual Guidelines**: Documented in `design_guidelines.md` - emphasizes letting 3D work be the hero with supporting UI that doesn't compete for attention.

**Color System**: CSS custom properties for theming with HSL values. Supports semantic color tokens (primary, secondary, destructive, muted, accent) and state-based variants.

## Data Architecture

**Project Configuration**: TypeScript interfaces define project structure:
- `ProjectConfig`: Main project definition with metadata, assets, and configuration
- `FloorLevel`: Floor plans with SVG paths/polygons for interactive units
- `LocationLevel`: Map imagery at different zoom levels
- Asset organization (hero images, videos, 360° panoramas)

**Type Safety**: Full TypeScript coverage with strict mode enabled. Shared types in `shared/` directory accessible to both client and server.

**Configuration Format**: Projects are defined as TypeScript objects (see `client/src/data/projects/`), allowing type checking and IntelliSense during development.

# External Dependencies

## Database

**ORM**: Drizzle ORM configured for PostgreSQL (via `@neondatabase/serverless` driver).

**Schema Location**: `shared/schema.ts` - currently empty, ready for custom table definitions.

**Migration Strategy**: Drizzle Kit for schema migrations, configured to output to `./migrations` directory.

**Connection**: Database URL from environment variable `DATABASE_URL`. Application throws error if not provisioned.

## Third-Party Services

**CDN/Assets**: Google Fonts for typography (Inter, DM Sans, Fira Code, Geist Mono, Architects Daughter).

**Development Tools**:
- Replit-specific plugins for development experience (cartographer, dev banner, runtime error overlay)
- Vite dev server with HMR

**Image/Media Hosting**: Application expects assets to be available locally or from CDN (configured per project in asset paths).

## Key NPM Packages

**UI & Styling**:
- `@radix-ui/*`: Headless UI primitives for accessibility
- `tailwindcss`: Utility-first CSS framework
- `framer-motion`: Animation library
- `lucide-react`: Icon system

**3D & Visualization**:
- `three`: 3D graphics library
- `@photo-sphere-viewer/core`: 360° panorama viewer
- `react-zoom-pan-pinch`: Interactive zoom/pan for images

**State & Data**:
- `zustand`: Lightweight state management
- `@tanstack/react-query`: Server state management (configured but minimal usage)
- `react-hook-form` + `@hookform/resolvers`: Form handling with validation

**Session Management**: 
- `express-session`: Session middleware (imported but not yet implemented)
- `connect-pg-simple`: PostgreSQL session store

## Build Tools

**Bundler**: Vite 5 for both development and production builds.

**TypeScript**: Version 5.2+ with strict mode, path aliases configured for `@/`, `@shared/`, and `@assets/`.

**PostCSS**: Autoprefixer for CSS vendor prefixing.

**Testing**: Vitest with jsdom environment for component testing, Testing Library for React component tests.