# Known Bugs & Technical Debt — Showcase Inmobiliario 3D

## Active Issues

*(ninguno activo actualmente)*

---

## Technical Debt

### TD-002: Schema de DB vacío

**Descripción**: `shared/schema.ts` está vacío. Drizzle configurado pero sin tablas.

**Impacto**: Ninguno (la app no usa DB actualmente)

**Resolución**: Definir schema cuando se necesite persistencia

---

## Resolved Issues

### ✅ TD-001: Plugins de Replit en vite.config.ts
**Resuelto**: 2026-02-01  
**Descripción**: Limpiados plugins `@replit/*` de vite.config.ts y devDependencies de package.json.

---

### ✅ TD-003: Archivos SQL huérfanos
**Resuelto**: 2026-02-01  
**Descripción**: Eliminados `showcase.sql` y `showcase_replit.sql`.

---

### ✅ TD-004: Errores TypeScript en FloorsView.tsx
**Resuelto**: 2026-02-01  
**Descripción**: Correcciones de tipo en FloorsView.tsx:
- Línea 77: Null check para `activeFloor.units`
- Línea 256/262: Type guard para casting `SVGGraphicsElement`

**Detectado por**: CI (GitHub Actions) - primer build

---

<!-- Template para nuevos bugs:

### BUG-XXX: Título corto

**Descripción**: [Qué pasa]

**Pasos para reproducir**:
1. [Paso 1]
2. [Paso 2]

**Impacto**: [Alto/Medio/Bajo]

**Workaround**: [Si existe]

-->

