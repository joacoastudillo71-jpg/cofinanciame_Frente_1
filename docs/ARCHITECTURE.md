# Architecture & Stack — Showcase Inmobiliario 3D

> **Última actualización**: 2026-02-01

## 1. Tech Stack

| Layer | Technology | Version | Purpose |
|:---|:---|:---|:---|
| **Framework** | React | 18.3.1 | UI Framework |
| **Build Tool** | Vite | 5.4.20 | Fast HMR, ES modules |
| **Language** | TypeScript | 5.6.3 | Type safety |
| **Styling** | Tailwind CSS | 3.4.17 | Utility-first CSS |
| **State** | Zustand | 5.0.8 | Lightweight global state |
| **Animations** | Framer Motion | 11.18.2 | Declarative animations |
| **UI Components** | Radix UI / Shadcn | 49 components | Accessible primitives |
| **360° Viewer** | Photo Sphere Viewer | 5.14.1 | Panoramic tours |
| **Backend** | Express | 4.21.2 | Dev server + static files |
| **ORM** | Drizzle | 0.39.1 | (Prepared, not used) |
| **Database** | Neon PostgreSQL | Serverless | (Planned for Fase 1) |

---

## 2. Architecture Layers

```
┌─ Entry Layer ──────────────────────────────────────────────────┐
│  index.html → main.tsx → App.tsx → MainLayout                 │
│  (Routing via wouter: /preview/:slug vs /:rest*)              │
└────────────────────────────────────────────────────────────────┘
                              ▼
┌─ Router/Engine Layer ──────────────────────────────────────────┐
│  PreviewShowcase.tsx  OR  ShowcaseEngine.tsx                   │
│  (Immersive Landing)      (Interactive Engine SPA)            │
└────────────────────────────────────────────────────────────────┘
                              ▼
┌─ Views Layer ──────────────────────────────────────────────────┐
│  HomeView     → Vitrina Global (Activos + Previews)           │
│  PreviewShowcase → Landing Vertical de Lanzamiento            │
│  IntroView    → Video de bienvenida (Proyectos Activos)       │
│  HeroView     → Carrusel de videos promocionales              │
│  FloorsView   → Planos interactivos SVG                       │
└────────────────────────────────────────────────────────────────┘
                              ▼
┌─ State Layer (Zustand) ─────────────────────────────────────┐
│  useAppStore:                                               │
│    - currentProject: ProjectConfig                          │
│    - currentSection: SectionId                              │
│    - currentFloorId, currentMapLevel, heroVideoIndex        │
│    - Actions: setProject, setSection, exitProject           │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─ Data Layer (ACTUAL: Hardcoded) ────────────────────────────┐
│  client/src/data/projects/*.ts                              │
│  client/public/assets/ (452MB de media)                     │
│  ⚠️ PROBLEMA: Requiere redeploy para cambios                │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─ Data Layer (FUTURO: DB + CDN) ─────────────────────────────┐
│  Neon PostgreSQL → Datos estructurados                      │
│  Cloudflare R2   → Assets multimedia                        │
│  Panel Admin     → CRUD sin código                          │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Modelo de Datos Principal

### ProjectConfig (Interfaz Maestra)

```typescript
interface ProjectConfig {
  id: string;
  name: string;
  slug?: string;
  isPreview?: boolean;
  previewMetadata?: {
      totalFloors?: number,
      unitTypes?: string[]
  };
  theme: { primaryColor, secondaryColor };
  // ... (rest as per types.ts)
}
```

### Interfaces de Soporte

| Interface | Propósito |
|:---|:---|
| `FloorLevel` | Piso del edificio con SVG interactivo |
| `FloorUnit` | Unidad con estado (available/reserved/sold) |
| `UnitStats` | Métricas (área, baños, precio) |
| `RenderCategory` | Categoría de imágenes de galería |
| `TourScene` | Escena 360° individual |

---

## 4. Folder Structure

```
client/
├── src/
│   ├── components/
│   │   ├── common/      # ErrorBoundary, shared
│   │   ├── engine/      # ShowcaseEngine (1 file)
│   │   ├── layout/      # MainLayout, Navigation (2 files)
│   │   ├── modules/     # Viewer360 (1 file)
│   │   ├── ui/          # Radix UI (49 components)
│   │   └── views/       # 7 view components
│   ├── config/
│   │   └── types.ts     # 19 TypeScript interfaces
│   ├── data/projects/
│   │   ├── aviano.ts    # Proyecto Aviano
│   │   ├── siena.ts     # Proyecto Siena
│   │   └── larca.ts     # Proyecto L'Arca
│   ├── hooks/           # 2 custom hooks
│   ├── lib/             # 3 utilities
│   └── store/
│       └── useAppStore.ts # Zustand store
├── public/assets/       # 452MB multimedia
│   ├── aviano/          # Videos, renders, 360°
│   ├── siena/           # Videos, renders, 360°
│   └── larca/           # Videos, renders, 360°
server/
├── index.ts             # Express server (minimal)
├── routes.ts            # API routes (empty)
└── vite.ts              # Vite dev middleware
```

---

## 5. Patrones Clave

### Navegación sin Router
- No usa React Router
- `ShowcaseEngine` hace switch por `currentSection`
- Transiciones con `AnimatePresence` + `motion.div`

### Feature Flags por Proyecto
```typescript
enabledFeatures: {
  introVideo: true,
  floors: true,
  renders: true,
  tours360: false, // Deshabilitado para Aviano
}
```

### Planos Interactivos
- SVG superpuesto sobre imagen base
- IDs de elementos SVG coinciden con `unit.id`
- Click detectado por `getBBox()` del elemento

---

## 6. Estado Actual vs Objetivo

| Aspecto | Actual | Objetivo (Fase 1) |
|:---|:---|:---|
| **Datos** | Hardcoded en TS | Neon PostgreSQL |
| **Assets** | En repo (452MB) | Cloudflare R2 |
| **Admin** | Ninguno | Panel Admin básico |
| **Roles** | Ninguno | Editor, Vendedor, Admin |
| **Multi-tenant** | No | Diseño preparado |

---

## 7. Propuestas de Mejora (Best Practices)

### 🔴 Urgente

| Problem | Solution | Expert Reference |
|:---|:---|:---|
| Bundle 983KB | Code splitting con `React.lazy()` | React docs, Vercel |
| Assets en repo | CDN (Cloudflare R2) | Cloudflare, Vercel |
| Datos hardcoded | Base de datos | Kent C. Dodds, Martin Fowler |

### 🟡 Importante

| Mejora | Beneficio |
|:---|:---|
| Error tracking (Sentry) | Monitoreo en producción |
| Image optimization | Lazy loading + WebP |
| Testing coverage | De 3 tests a 80%+ |
| SEO (Prerender.io) | Mejor indexación |

### ⚪ Futuro

| Mejora | Cuándo |
|:---|:---|
| Next.js migration | Cuando sistema estable |
| PWA | Para uso offline |
| i18n | Para expansión global |

---

## 8. Comparación con Industria

| Aspecto | CoFinancia | web3d.app | Matterport |
|:---|:---|:---|:---|
| **Admin Panel** | 🔜 | ✅ | ✅ |
| **Datos en DB** | 🔜 | ✅ | ✅ |
| **CDN** | 🔜 | ✅ | ✅ |
| **Portal Socios** | 🔜 | ❌ | ❌ |
| **CRM Integrado** | 🔜 GESPRO | ❌ | ❌ |
| **Planos interactivos** | ✅ | ✅ | ⚠️ |

---

## 9. Verification Commands

| Command | Purpose |
|:---|:---|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run check` | TypeScript type-check |
| `npm run handoff` | Generate Superbundle |

---

## 10. Deployment

| Service | Purpose | Status |
|:---|:---|:---|
| **Vercel** | Frontend + Serverless | ✅ Active |
| **Neon** | PostgreSQL | 🔜 Phase 1 |
| **Cloudflare R2** | Asset CDN | 🔜 Phase 1 |
| **Domain** | cofinancia.me | ✅ Active |

