# 📋 Documentación Técnica Completa - 3D Showcase Engine

**Documento preparado:** Noviembre 22, 2025  
**Versión del Proyecto:** 1.0.0  
**Tipo de Aplicación:** Fullstack JavaScript/TypeScript - Single Page Application

---

## Tabla de Contenidos
1. [Descripción General](#descripción-general)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Estructura de Carpetas](#estructura-de-carpetas)
4. [Dependencias y Paquetes](#dependencias-y-paquetes)
5. [Configuración del Proyecto](#configuración-del-proyecto)
6. [Frontend - Arquitectura Detallada](#frontend---arquitectura-detallada)
7. [Backend - Arquitectura Detallada](#backend---arquitectura-detallada)
8. [Sistema de Datos](#sistema-de-datos)
9. [Guía de Desarrollo](#guía-de-desarrollo)
10. [Flujos Principales](#flujos-principales)

---

## Descripción General

### ¿Qué es esta aplicación?

Es un **motor de presentación 3D interactivo** diseñado para mostrar proyectos inmobiliarios y arquitectónicos mediante experiencias inmersivas. La plataforma permite:

- Visualizar proyectos con videos heroicos en 4K
- Explorar planos de pisos con elementos interactivos
- Navegar mapas en múltiples niveles de zoom
- Experimentar tours 360° de espacios individuales
- Transiciones suaves entre diferentes vistas

### Características Principales

- **SPA (Single Page Application)**: Toda la navegación ocurre en el navegador sin recargas
- **Responsive Design**: Funciona perfectamente en desktop, tablet y móvil
- **Temas Claro y Oscuro**: Soporte completo para dark mode
- **Animaciones Fluidas**: Transiciones elegantes entre secciones
- **3D Interactivo**: Visualización de espacios en 360°

---

## Arquitectura del Sistema

### Diagrama de Capas

```
┌─────────────────────────────────────────────────────────────┐
│                    CAPA PRESENTACIÓN (Frontend)             │
│  React 18 + TypeScript + Vite                               │
│  - Componentes UI (Shadcn/Radix UI)                        │
│  - Visor 360° (Photo Sphere Viewer)                        │
│  - Animaciones (Framer Motion)                             │
└─────────────────────────────────────────────────────────────┘
                            │
                    API REST (/api/*)
                            │
┌─────────────────────────────────────────────────────────────┐
│                    CAPA APLICACIÓN (Backend)                │
│  Express.js + TypeScript + Node.js                         │
│  - Rutas REST                                              │
│  - Lógica de negocio                                       │
│  - Validación de datos                                     │
└─────────────────────────────────────────────────────────────┘
                            │
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DATOS                               │
│  - MemStorage (en memoria)                                 │
│  - PostgreSQL (Drizzle ORM) - opcional                     │
└─────────────────────────────────────────────────────────────┘
```

### Flujo de Datos

1. **Usuario Interactúa** → Click, scroll, hover en la interfaz
2. **Frontend Procesa** → Componentes React responden, actualizan estado Zustand
3. **Si Necesita Backend** → Fetch API a rutas `/api/*`
4. **Backend Valida** → Validación Zod, procesamiento de datos
5. **Storage** → Almacenamiento en memoria o base de datos
6. **Respuesta** → JSON devuelto al frontend
7. **Frontend Actualiza** → React Query sincroniza, UI se refresca

---

## Estructura de Carpetas

```
proyecto/
├── client/                          # Código Frontend
│   ├── public/
│   │   ├── favicon.png             # Icono del navegador
│   │   └── assets/                 # Recursos estáticos
│   │       ├── aviano/             # Proyecto: Aviano
│   │       ├── larca/              # Proyecto: Larca
│   │       ├── siena/              # Proyecto: Siena
│   │       └── [recursos compartidos]
│   │
│   ├── src/
│   │   ├── App.tsx                 # Componente raíz
│   │   ├── index.css               # Estilos globales + variables CSS
│   │   ├── main.tsx                # Punto de entrada React
│   │   │
│   │   ├── components/
│   │   │   ├── common/             # Componentes reutilizables
│   │   │   │   └── ErrorBoundary.tsx
│   │   │   │
│   │   │   ├── engine/             # Controlador de vistas
│   │   │   │   └── ShowcaseEngine.tsx  # Determina qué vista renderizar
│   │   │   │
│   │   │   ├── layout/             # Estructura general
│   │   │   │   ├── MainLayout.tsx  # Layout envolvente
│   │   │   │   └── Navigation.tsx  # Barra de navegación
│   │   │   │
│   │   │   ├── modules/            # Componentes específicos
│   │   │   │   └── Viewer360.tsx   # Visor 360° panorámico
│   │   │   │
│   │   │   ├── views/              # Vistas principales (por sección)
│   │   │   │   ├── HomeView.tsx    # Página de inicio
│   │   │   │   ├── IntroView.tsx   # Introducción del proyecto
│   │   │   │   ├── HeroView.tsx    # Video heroico
│   │   │   │   ├── FloorsView.tsx  # Planos de pisos
│   │   │   │   ├── LocationView.tsx # Mapas de ubicación
│   │   │   │   └── Tour360View.tsx # Tours 360°
│   │   │   │
│   │   │   └── ui/                 # Componentes Shadcn (pre-generados)
│   │   │       ├── button.tsx, card.tsx, form.tsx, etc.
│   │   │       └── [30+ componentes Radix UI]
│   │   │
│   │   ├── config/
│   │   │   ├── types.ts            # Tipos de proyectos y configuración
│   │   │   └── theme.ts            # Configuración de temas
│   │   │
│   │   ├── data/
│   │   │   └── projects/           # Definición de proyectos
│   │   │       ├── index.ts        # Exporta todos los proyectos
│   │   │       ├── aviano.ts       # Configuración proyecto Aviano
│   │   │       ├── larca.ts        # Configuración proyecto Larca
│   │   │       └── siena.ts        # Configuración proyecto Siena
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-mobile.tsx      # Hook para detectar viewport móvil
│   │   │   └── use-toast.ts        # Hook para notificaciones toast
│   │   │
│   │   ├── lib/
│   │   │   ├── queryClient.ts      # Configuración React Query
│   │   │   └── utils.ts            # Utilidades (classNames, etc)
│   │   │
│   │   ├── pages/
│   │   │   └── not-found.tsx       # Página 404
│   │   │
│   │   ├── store/
│   │   │   └── useAppStore.ts      # Store global Zustand
│   │   │
│   │   ├── tests/
│   │   │   ├── setupTests.ts       # Configuración Vitest
│   │   │   ├── HomeView.test.tsx   # Tests de componentes
│   │   │   └── store.test.ts       # Tests del store
│   │   │
│   │   ├── index.html              # HTML template
│   │   └── vite.config.ts          # Configuración Vite
│   │
│   └── package.json                # Dependencias del proyecto
│
├── server/                          # Código Backend
│   ├── index.ts                    # Entrada del servidor Express
│   ├── routes.ts                   # Definición de rutas API
│   ├── storage.ts                  # Interface de almacenamiento
│   └── vite.ts                     # Integración Vite con Express
│
├── shared/                          # Código compartido
│   └── schema.ts                   # Tipos y esquemas Zod (frontend + backend)
│
├── attached_assets/                # Assets agregados por el usuario
│   └── [imágenes stock descargadas]
│
├── Configuración del Proyecto
│   ├── package.json                # Scripts y dependencias totales
│   ├── tsconfig.json               # Configuración TypeScript
│   ├── vite.config.ts              # Configuración bundler Vite
│   ├── tailwind.config.ts          # Configuración Tailwind CSS
│   ├── postcss.config.js           # Configuración PostCSS
│   ├── drizzle.config.ts           # Configuración Drizzle ORM
│   ├── components.json             # Configuración Shadcn
│   ├── design_guidelines.md        # Directrices de diseño
│   ├── replit.md                   # Documentación del proyecto
│   └── tsconfig.json               # TypeScript strict mode

└── dist/                           # Build de producción (generado)
    ├── index.js                    # Servidor compilado
    └── public/                     # Cliente compilado
```

---

## Dependencias y Paquetes

### Dependencias Principales por Categoría

#### **Frontend - React & TypeScript**
```json
{
  "react": "^18.3.1",                    // Framework UI
  "react-dom": "^18.3.1",               // Renderizado en DOM
  "typescript": "5.6.3"                 // Lenguaje tipado
}
```

#### **Gestión de Estado**
```json
{
  "zustand": "^5.0.8",                   // State management global
  "@tanstack/react-query": "^5.60.5"     // Server state (comentado/mínimo)
}
```

#### **UI Components (Shadcn/Radix)**
```json
{
  "@radix-ui/react-*": "^1.x.x",        // 30+ componentes primitivos
  "class-variance-authority": "^0.7.1",  // Estilo condicional
  "clsx": "^2.1.1",                      // Utilidad classNames
  "lucide-react": "^0.453.0"             // Sistema de iconos
}
```

#### **Estilos & Temas**
```json
{
  "tailwindcss": "^3.4.17",              // Utilidades CSS
  "@tailwindcss/vite": "^4.1.3",         // Plugin Vite para Tailwind
  "@tailwindcss/typography": "^0.5.15",  // Plugin para tipografía
  "next-themes": "^0.4.6",               // Gestión de temas (light/dark)
  "framer-motion": "^11.18.2"            // Animaciones
}
```

#### **Formularios & Validación**
```json
{
  "react-hook-form": "^7.55.0",          // Manejo de formularios
  "@hookform/resolvers": "^3.10.0",      // Integradores de validación
  "zod": "^3.24.2"                       // Validación de esquemas
}
```

#### **3D & Visualización**
```json
{
  "@photo-sphere-viewer/core": "^5.x.x", // Visor 360° panorámico
  "react-zoom-pan-pinch": "^3.x.x",      // Zoom/pan en imágenes
  "recharts": "^2.15.2"                  // Gráficos (si aplica)
}
```

#### **Interactividad & Navegación**
```json
{
  "wouter": "^3.3.5",                    // Router SPA ligero
  "react-resizable-panels": "^2.1.7",    // Paneles redimensionables
  "embla-carousel-react": "^8.6.0",      // Carrusel de imágenes
  "vaul": "^1.1.2"                       // Drawer/Sheet
}
```

#### **Backend - Express**
```json
{
  "express": "^4.21.2",                  // Framework web
  "express-session": "^1.18.1",          // Gestión de sesiones
  "connect-pg-simple": "^10.0.0",        // Store sesiones en DB
  "passport": "^0.7.0",                  // Autenticación
  "passport-local": "^1.0.0"             // Estrategia local
}
```

#### **Base de Datos**
```json
{
  "drizzle-orm": "^0.39.1",              // ORM SQL type-safe
  "drizzle-zod": "^0.7.0",               // Integración Zod
  "drizzle-kit": "^0.31.4",              // CLI migrations
  "@neondatabase/serverless": "^0.10.4"  // Driver PostgreSQL
}
```

#### **WebSockets (Tiempo Real)**
```json
{
  "ws": "^8.18.0"                        // WebSocket nativo
}
```

#### **Herramientas de Desarrollo**
```json
{
  "vite": "^5.4.20",                     // Bundler moderno
  "@vitejs/plugin-react": "^4.7.0",      // Plugin React para Vite
  "tsx": "^4.20.5",                      // Ejecutor TypeScript
  "vitest": "^4.0.10",                   // Framework testing
  "@testing-library/react": "^16.3.0"    // Testing utilities
}
```

#### **Plugins Replit**
```json
{
  "@replit/vite-plugin-cartographer": "^0.4.4",  // Mapa de archivos
  "@replit/vite-plugin-dev-banner": "^0.1.1",    // Banner desarrollo
  "@replit/vite-plugin-runtime-error-modal": "^0.0.3"  // Overlay errores
}
```

---

## Configuración del Proyecto

### TypeScript (`tsconfig.json`)

```typescript
{
  "compilerOptions": {
    "strict": true,              // Modo estricto activado
    "module": "ESNext",          // Módulos modernos
    "lib": ["esnext", "dom"],    // APIs de navegador
    "jsx": "preserve",           // Vite maneja JSX
    "moduleResolution": "bundler", // Resolución moderna
    "baseUrl": ".",
    
    // Alias de rutas para imports limpios
    "paths": {
      "@/*": ["./client/src/*"],           // Componentes, hooks, etc
      "@shared/*": ["./shared/*"]          // Tipos compartidos
    }
  },
  "include": ["client/src/**/*", "shared/**/*", "server/**/*"]
}
```

**Beneficio**: Los imports son limpios:
```typescript
// ✅ En lugar de:
import { useAppStore } from '../../../../store/useAppStore'

// Escribimos:
import { useAppStore } from '@/store/useAppStore'
```

### Vite (`vite.config.ts`)

```typescript
export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    // Plugins Replit (solo en desarrollo)
  ],
  resolve: {
    alias: {
      "@": "client/src",
      "@shared": "shared",
      "@assets": "attached_assets"
    }
  },
  root: "client",           // Raíz de frontend
  build: {
    outDir: "dist/public"   // Destino de build
  }
});
```

### Tailwind CSS (`tailwind.config.ts`)

```typescript
export default {
  darkMode: ["class"],      // Dark mode basado en clase CSS
  content: [
    "./client/index.html",
    "./client/src/**/*.{js,jsx,ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "hsl(var(--background) / <alpha-value>)",
        foreground: "hsl(var(--foreground) / <alpha-value>)",
        primary: "hsl(var(--primary) / <alpha-value>)",
        // ... más colores semánticos
      }
    }
  }
}
```

Variables CSS (en `client/src/index.css`):
```css
:root {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  /* ... */
}

.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --primary: 0 0% 100%;
}
```

### Scripts NPM (`package.json`)

```bash
npm run dev          # Desarrollo: Express + Vite HMR
npm run build        # Build producción (frontend + backend)
npm start            # Producción: solo Express
npm run check        # TypeScript type checking
npm run db:push      # Ejecutar migraciones Drizzle
```

---

## Frontend - Arquitectura Detallada

### Estructura de Componentes

```
ShowcaseEngine (decision router)
    ↓
Selecciona según currentSection
    ├─→ HomeView       (página inicio)
    ├─→ IntroView      (introducción proyecto)
    ├─→ HeroView       (video heroico)
    ├─→ FloorsView     (planos de pisos)
    ├─→ LocationView   (mapas)
    ├─→ RenderView     (renders 3D)
    └─→ Tour360View    (tours 360°)

Todo envuelto por:
    MainLayout
        ├─→ Navigation (cabecera)
        └─→ [Contenido dinámico]
```

### Store Zustand (`useAppStore`)

```typescript
interface AppState {
  // Datos globales
  currentProject: ProjectConfig | null;
  isLoading: boolean;
  
  // Navegación
  currentSection: 'home' | 'intro' | 'hero' | 'floors' | 'location' | 'renders' | 'tour360';
  isMenuOpen: boolean;
  
  // Estado de vistas
  heroVideoIndex: number;
  currentMapLevel: string;
  currentFloorId: string | number | null;
  
  // UI
  activeOverlay: string | null;
  isChatbotOpen: boolean;
  
  // Acciones
  setProject(config: ProjectConfig): void;
  setSection(section: SectionId): void;
  setMapLevel(level: string): void;
  setFloor(id: string | number): void;
  toggleChatbot(): void;
}
```

**Uso en componentes:**
```typescript
function MyComponent() {
  const { currentProject, setSection } = useAppStore();
  
  return (
    <button onClick={() => setSection('hero')}>
      Ver {currentProject?.name}
    </button>
  );
}
```

### Tipos de Datos (`config/types.ts`)

```typescript
export interface ProjectConfig {
  id: string;
  name: string;
  type: 'residential' | 'commercial' | 'mixed';
  description: string;
  location: string;
  
  // Configuración de secciones
  hero: {
    title: string;
    subtitle: string;
    videos: string[];  // Rutas a videos .mp4
  };
  
  floors: {
    levels: FloorLevel[];
  };
  
  location: {
    levels: LocationLevel[];
  };
  
  tour360: {
    units: Tour360Unit[];
  };
  
  renders: {
    images: string[];
  };
}

export interface FloorLevel {
  id: string;
  name: string;
  imageUrl: string;
  units: Unit[];        // Elementos interactivos
}

export interface Unit {
  id: string;
  name: string;
  type: 'apartment' | 'penthouse' | 'suite';
  polygon?: SVGPath;    // Para clics interactivos
}

export interface LocationLevel {
  name: 'city' | 'neighborhood' | 'sector';
  imageUrl: string;
}

export interface Tour360Unit {
  id: string;
  name: string;
  images: {
    bedroom: string;
    socialArea: string;
  };
}
```

### Proyectos Configurados

**`data/projects/aviano.ts`**: Proyecto Aviano (5 pisos, multiple units)  
**`data/projects/larca.ts`**: Proyecto Larca (5 pisos, design moderno)  
**`data/projects/siena.ts`**: Proyecto Siena (4 pisos, style clásico)  

Cada uno define su propia estructura de pisos, units, videos, etc.

### Flujo de Navegación Principal

```
1. Usuario carga app → App.tsx → ShowcaseEngine renderiza HomeView
2. Usuario hace click en proyecto → setProject(config) + setSection('intro')
3. ShowcaseEngine renderiza IntroView
4. Usuario hace click en "Ver Hero" → setSection('hero')
5. ShowcaseEngine renderiza HeroView con video
6. Continúa navegando entre secciones...
7. Usuario hace click en "Volver" → setSection('home')
```

---

## Backend - Arquitectura Detallada

### Arquitectura Express (`server/index.ts`)

```typescript
const app = express();

// Middlewares globales
app.use(express.json());           // Parse JSON
app.use(requestLogger);            // Log requests
app.use(errorHandler);             // Manejo de errores

// Registrar rutas API
await registerRoutes(app);

// Vite en desarrollo
if (isDevelopment) {
  await setupVite(app, server);
} else {
  serveStatic(app);  // Archivos estáticos en producción
}

server.listen(5000, '0.0.0.0');
```

**Flujo:**
1. Request llega → Middleware JSON parsing
2. Middleware logging → Registra en consola
3. Router Express → Busca ruta coincidente
4. Handler → Ejecuta lógica, usa storage
5. Response → JSON devuelto al cliente

### Rutas API (`server/routes.ts`)

```typescript
export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // Ejemplo estructura (actualmente vacía, lista para rutas)
  // app.get('/api/projects', (req, res) => {
  //   const projects = storage.getProjects();
  //   res.json(projects);
  // });
  
  return httpServer;
}
```

**Patrón para nuevas rutas:**
```typescript
// GET /api/projects
app.get('/api/projects', async (req, res) => {
  const projects = await storage.getProjects();
  res.json(projects);
});

// POST /api/projects
app.post('/api/projects', async (req, res) => {
  const parsed = createInsertSchema(projectTable).parse(req.body);
  const project = await storage.createProject(parsed);
  res.status(201).json(project);
});

// GET /api/projects/:id
app.get('/api/projects/:id', async (req, res) => {
  const project = await storage.getProjectById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: 'Not found' });
  }
  res.json(project);
});
```

### Storage Interface (`server/storage.ts`)

```typescript
export interface IStorage {
  // Métodos para projects
  getProjects(): Promise<ProjectConfig[]>;
  getProjectById(id: string): Promise<ProjectConfig | null>;
  createProject(config: ProjectConfig): Promise<ProjectConfig>;
  updateProject(id: string, config: Partial<ProjectConfig>): Promise<ProjectConfig>;
  deleteProject(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private projects = new Map<string, ProjectConfig>();
  
  async getProjects() {
    return Array.from(this.projects.values());
  }
  
  async getProjectById(id: string) {
    return this.projects.get(id) || null;
  }
  
  async createProject(config: ProjectConfig) {
    this.projects.set(config.id, config);
    return config;
  }
  
  async updateProject(id: string, updates: Partial<ProjectConfig>) {
    const current = this.projects.get(id);
    if (!current) throw new Error('Not found');
    const updated = { ...current, ...updates };
    this.projects.set(id, updated);
    return updated;
  }
  
  async deleteProject(id: string) {
    return this.projects.delete(id);
  }
}

export const storage = new MemStorage();
```

### Validación con Zod (`shared/schema.ts`)

```typescript
import { z } from 'zod';

export const projectConfigSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  type: z.enum(['residential', 'commercial', 'mixed']),
  description: z.string(),
  location: z.string(),
  // ... más campos
});

export const createProjectSchema = projectConfigSchema.omit({ id: true });
export type ProjectInsert = z.infer<typeof createProjectSchema>;
export type ProjectSelect = z.infer<typeof projectConfigSchema>;
```

### Migración a PostgreSQL (Drizzle)

**1. Definir tabla** (`migrations/0001_create_projects.sql`):
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  description TEXT,
  location TEXT,
  config JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**2. Ejecutar:** `npm run db:push`

**3. Actualizar Storage para usar DB en lugar de MemStorage**

---

## Sistema de Datos

### Modelo de Datos Simplificado

```
┌─────────────────┐
│   ProjectConfig │
├─────────────────┤
│ id              │ (UUID primaria)
│ name            │ string
│ type            │ 'residential' | 'commercial'
│ description     │ string
│ location        │ string
│ hero {}         │ { title, subtitle, videos[] }
│ floors {}       │ { levels: FloorLevel[] }
│ location {}     │ { levels: LocationLevel[] }
│ tour360 {}      │ { units: Tour360Unit[] }
│ renders {}      │ { images[] }
└─────────────────┘
     ↓ (1 a muchos)
┌─────────────────┐
│   FloorLevel    │
├─────────────────┤
│ id              │
│ name            │ "Piso 1", "Piso 2"...
│ imageUrl        │
│ units[]         │ Referencias a units
└─────────────────┘
     ↓ (1 a muchos)
┌─────────────────┐
│      Unit       │
├─────────────────┤
│ id              │ "102", "304"...
│ name            │ "Departamento 102"
│ type            │ 'apartment'
│ polygon         │ SVG path para clics
└─────────────────┘
```

### Flujo de Datos: User → DB → UI

```
User hace click en Unit "302"
  ↓
Componente FloorsView → onClick handler
  ↓
setFloor('302')  [Zustand store]
  ↓
currentFloorId = '302'
  ↓
Componente re-renderiza, muestra detalles de 302
  ↓
Si necesita más info: fetch('/api/floors/302')
  ↓
Backend: GET /api/floors/:id
  ↓
Storage.getFloorById('302')  [MemStorage o DB]
  ↓
Retorna: { id: '302', name: 'Departamento 302', ... }
  ↓
Frontend: React Query cache + setState
  ↓
UI se actualiza con los detalles
```

---

## Guía de Desarrollo

### Configuración Inicial

**1. Instalar dependencias:**
```bash
npm install
```

**2. Iniciar desarrollo:**
```bash
npm run dev
```

Esto inicia:
- Express en `http://localhost:5000` (puerto 5000)
- Vite dev server integrado
- Hot module replacement (HMR)

**3. En otro terminal, verificar TypeScript:**
```bash
npm run check
```

### Crear una Nueva Vista

**1. Crear archivo componente** (`client/src/components/views/MyNewView.tsx`):
```typescript
import React from 'react';
import { useAppStore } from '@/store/useAppStore';

export function MyNewView() {
  const { currentProject } = useAppStore();
  
  return (
    <div className="w-full h-screen flex items-center justify-center">
      <h1>Mi Nueva Vista</h1>
      <p>{currentProject?.name}</p>
    </div>
  );
}
```

**2. Agregar a ShowcaseEngine** (`client/src/components/engine/ShowcaseEngine.tsx`):
```typescript
import { MyNewView } from '../views/MyNewView';

export function ShowcaseEngine() {
  const { currentSection } = useAppStore();
  
  return (
    <>
      {currentSection === 'myNewView' && <MyNewView />}
      {/* ... otras secciones */}
    </>
  );
}
```

**3. Actualizar tipos** (`client/src/store/useAppStore.ts`):
```typescript
export type SectionId = '...' | 'myNewView';  // Agregar nueva sección
```

**4. Navegar desde otros componentes:**
```typescript
const { setSection } = useAppStore();
<button onClick={() => setSection('myNewView')}>
  Ir a Mi Nueva Vista
</button>
```

### Crear una Nueva Ruta API

**1. Definir en schema** (`shared/schema.ts`):
```typescript
export const userSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
});

export const createUserSchema = userSchema.omit({ id: true });
export type User = z.infer<typeof userSchema>;
```

**2. Extender Storage** (`server/storage.ts`):
```typescript
export interface IStorage {
  // ... proyectos
  
  // Usuarios
  createUser(user: UserInsert): Promise<User>;
  getUser(id: string): Promise<User | null>;
  updateUser(id: string, user: Partial<User>): Promise<User>;
  deleteUser(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users = new Map<string, User>();
  
  async createUser(user: UserInsert) {
    const newUser = { ...user, id: crypto.randomUUID() };
    this.users.set(newUser.id, newUser);
    return newUser;
  }
  
  // ... etc
}
```

**3. Crear rutas** (`server/routes.ts`):
```typescript
app.post('/api/users', async (req, res) => {
  const parsed = createUserSchema.parse(req.body);
  const user = await storage.createUser(parsed);
  res.status(201).json(user);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await storage.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});
```

**4. En Frontend, fetch con React Query:**
```typescript
import { useQuery } from '@tanstack/react-query';

export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading } = useQuery({
    queryKey: ['/api/users', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
  });
  
  if (isLoading) return <div>Cargando...</div>;
  
  return <div>{user?.name}</div>;
}
```

### Estilos con Tailwind & Shadcn

**Usar componentes Shadcn:**
```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export function MyForm() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mi Formulario</CardTitle>
      </CardHeader>
      <CardContent>
        <Input placeholder="Nombre" />
        <Button className="mt-4">Enviar</Button>
      </CardContent>
    </Card>
  );
}
```

**Agregar estilos personalizados:**
```typescript
// En index.css
.custom-gradient {
  background: linear-gradient(135deg, var(--primary), var(--accent));
}

// En JSX
<div className="custom-gradient p-8 rounded-lg">
  Contenido
</div>
```

**Responsive:**
```typescript
<div className="
  grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
  gap-4 p-4 md:p-8
">
  {/* Items */}
</div>
```

---

## Flujos Principales

### 1. Flujo: Usuario Explora Proyecto

```
Página Cargando
    ↓
HomeView muestra lista de proyectos
    ↓
Usuario hace click en "Aviano"
    ↓
setProject(aviano_config)
setSection('intro')
    ↓
ShowcaseEngine renderiza IntroView
    ↓
IntroView muestra: { currentProject.description }
    ↓
Usuario hace click en "Ver Hero"
    ↓
setSection('hero')
    ↓
ShowcaseEngine renderiza HeroView
    ↓
HeroView muestra video y galería
    ↓
Usuario scrollea o hace click en siguiente sección
    ↓
Continúa con FloorsView, LocationView, etc.
```

### 2. Flujo: Seleccionar Unit en Piso

```
FloorsView cargado
    ↓
Muestra imagen del piso con units overlay
    ↓
Usuario hace click en polygon "302"
    ↓
onClick handler → setFloor('302')
    ↓
FloorsView re-renderiza
    ↓
Muestra información de unit 302:
   - Nombre: "Departamento 302"
   - Tipo: "apartment"
   - Área: "85m²"
    ↓
Usuario puede hacer click en "Ver 360°"
    ↓
setSection('tour360')
    ↓
Tour360View carga con imágenes de 302
```

### 3. Flujo: Cambiar Tema (Light/Dark)

```
Usuario hace click en icono tema
    ↓
ThemeProvider toglea 'dark' class en <html>
    ↓
CSS variables activan:
   :root { --background: white; }
   .dark { --background: black; }
    ↓
Todos los colores Tailwind se actualizan
    ↓
localStorage guarda preferencia
    ↓
En siguiente sesión, tema se restaura
```

### 4. Flujo: Crear Proyecto (Futuro con Backend)

```
Admin accede a /admin/projects/new
    ↓
Formulario con campos:
   - name
   - type
   - description
   - location
   - (seleccionar imágenes/videos)
    ↓
Submit → POST /api/projects
    ↓
Backend:
   1. Valida con createProjectSchema (Zod)
   2. storage.createProject(validData)
   3. Guarda en DB (si existe)
   4. Retorna proyecto con ID
    ↓
Frontend:
   1. queryClient.invalidateQueries(['/api/projects'])
   2. Redirige a proyecto nuevo
   3. Muestra toast: "Proyecto creado"
```

---

## Testing

### Estructura de Tests

```typescript
// client/src/tests/HomeView.test.tsx
import { render, screen } from '@testing-library/react';
import HomeView from '@/components/views/HomeView';
import { useAppStore } from '@/store/useAppStore';

vi.mock('@/store/useAppStore');

describe('HomeView', () => {
  it('muestra lista de proyectos', () => {
    useAppStore.mockReturnValue({
      currentProject: null,
      setProject: vi.fn(),
    });
    
    render(<HomeView />);
    expect(screen.getByText(/Proyectos/i)).toBeInTheDocument();
  });
});
```

**Ejecutar tests:**
```bash
npm run test
```

---

## Variables de Entorno

### Desarrollo

```bash
# .env (local, no commitear)
DATABASE_URL=postgresql://user:password@localhost/dbname
NODE_ENV=development
```

### Producción

En Replit, configurar en Secrets:
- `DATABASE_URL`: Connection string PostgreSQL
- Cualquier API key de terceros

---

## Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| "Module not found '@/...'" | Alias path mal configurado | Verificar `tsconfig.json` paths |
| Vite HMR no funciona | Puerto 5000 bloqueado | Usar `npm run dev` y recargar |
| Estilos Tailwind no aplican | `index.css` no importado | Verificar `main.tsx` import |
| Store no actualiza UI | setState no desencadena re-render | Verificar que `useAppStore` está en el componente |
| Build falla | TypeScript errores | Ejecutar `npm run check` |
| DB no conecta | ENV variable falta | Configurar `DATABASE_URL` |

---

## Recursos Útiles

- **Shadcn Documentation**: https://ui.shadcn.com
- **Tailwind CSS**: https://tailwindcss.com
- **Zustand**: https://github.com/pmndrs/zustand
- **Drizzle ORM**: https://orm.drizzle.team
- **React Query**: https://tanstack.com/query
- **Vite**: https://vitejs.dev
- **Express**: https://expressjs.com

---

## Próximas Mejoras Sugeridas

1. **Autenticación**: Implementar Passport.js con estrategia local
2. **Base de datos**: Migrar de MemStorage a PostgreSQL
3. **Admin Panel**: CRUD de proyectos con validación
4. **Búsqueda**: Filtros por tipo, ubicación, precio
5. **Comparación**: Seleccionar múltiples proyectos para comparar
6. **Analytics**: Seguimiento de qué proyectos visitan más
7. **Compresión de imágenes**: Optimizar assets con sharp
8. **Cache**: Estrategia de caché para assets estáticos
9. **PWA**: Offline support y instalación en móvil
10. **API Docs**: OpenAPI/Swagger para endpoints

---

**Documento generado:** 22 de Noviembre, 2025  
**Para:** Equipo de desarrollo externo  
**Versión:** 1.0.0
