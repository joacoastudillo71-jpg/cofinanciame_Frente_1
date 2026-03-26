# Architecture Decisions — Showcase Inmobiliario 3D

## Principles

- **Performance First**: Videos y 360° deben cargar rápido
- **Progressive Loading**: Assets bajo demanda por sección
- **Mobile Friendly**: Funcionar en dispositivos limitados
- **Animation Excellence**: Transiciones suaves con Framer Motion

---

## Decision Log

### ADR-001: [2026-02-01] — Setup AI-Eng OS

**Context**: Proyecto migrado de Replit a Vercel. Requiere sistema de gobernanza y documentación profesional para trabajo con AI.

**Decision**: Implementar AI-Eng OS (replicado de GESPRO CRM).

**Consequences**: 
- Memoria permanente del proyecto
- Flujos de trabajo profesionales
- Documentación viva sincronizada con código
- Protección contra regresiones

---

### ADR-002: [2026-02-01] — Stack React + Vite + Zustand

**Context**: Plataforma de showcasing 3D inmobiliario necesita SPA con animaciones fluidas.

**Decision**: 
- React 18 para UI
- Vite para build rápido
- Zustand para estado global simple
- Framer Motion para animaciones

**Consequences**: 
- Bundle optimizado
- HMR rápido en desarrollo
- Estado predecible sin boilerplate
- Animaciones declarativas

---

### ADR-003: [2026-02-01] — Deploy en Vercel

**Context**: Migración desde Replit necesita hosting confiable.

**Decision**: Vercel con dominio cofinancia.me

**Consequences**:
- Deploy automático desde GitHub
- Preview deployments por PR
- Edge functions disponibles
- SSL automático

---

### ADR-004: [2026-02-01] — GitHub Actions CI

**Context**: Necesidad de verificación automática antes de merge para prevenir regresiones.

**Decision**: Implementar CI con GitHub Actions que corre en cada PR:
- TypeScript check (`npm run check`)
- Build de producción (`npm run build`)

**Consequences**:
- ✅ Errores de tipos detectados antes de merge
- ✅ Build verificado automáticamente
- ✅ No se puede mergear código roto
- ⚠️ PRs tomarán ~1 min más por verificación

---

### ADR-005: [2026-02-01] — Arquitectura por Capas (Modular)

**Context**: Sistema necesita ser mantenible y escalable. Diferentes tipos de cambios deben tener diferentes niveles de riesgo.

**Decision**: Implementar arquitectura de 4 capas (patrón estándar de la industria):

```
┌─ Presentación ─┐  Cambios SEGUROS (colores, layout)
├─ Componentes ──┤  Cambios con CUIDADO (UI reutilizable)
├─ Lógica ───────┤  Cambios con CUIDADO (comportamiento)
└─ Datos ────────┘  Cambios con MUCHO CUIDADO (DB schema)
```

**Consequences**:
- ✅ Cambios visuales no rompen funcionalidad
- ✅ Componentes reutilizables entre módulos
- ✅ Lógica de negocio aislada de presentación
- ✅ Migraciones de datos controladas

---

### ADR-006: [2026-02-01] — Integración con GESPRO CRM

**Context**: Sistema necesita capturar leads. Ya existe GESPRO CRM funcionando.

**Decision**: Patrón híbrido (recomendado por expertos como Martin Fowler):
1. Formulario bonito en CoFinancia (control de UX)
2. Datos guardados localmente en Neon (backup/resilience)
3. Sync automático a GESPRO via API (CRM unificado)

**Consequences**:
- ✅ UX controlado (formulario nativo)
- ✅ Resilience (datos locales + CRM)
- ✅ Vendedores trabajan solo en GESPRO
- ⚠️ Requiere mantener sync entre sistemas

---

### ADR-007: [2026-02-01] — Portal Inversionistas

**Context**: Inversionistas (< 20 por proyecto) necesitan ver avances y métricas de sus inversiones.

**Decision**: Portal separado con autenticación:
- Login por invitación (no self-registration)
- Dashboard por proyecto con métricas financieras
- Galería de avance de obra
- Documentos descargables

**Consequences**:
- ✅ Diferenciador de mercado
- ✅ Transparencia con socios
- ✅ Reducción de consultas manuales
- ⚠️ Requiere actualización periódica de datos

---

### ADR-008: [2026-02-01] — Arquitectura Multi-Tenant SaaS

**Context**: Visión de escalar CoFinancia.me como SaaS para competir con web3d.app ($1,300/año).

**Decision**: Diseñar arquitectura multi-tenant desde el inicio:
- Cada cliente (tenant) tiene su dominio personalizado
- Base de datos compartida con aislamiento por tenant_id
- Assets en Cloudflare R2 con prefijo por tenant
- White-label: cada cliente ve su marca

**Consequences**:
- ✅ Escalable a múltiples clientes sin redeploy
- ✅ Costos compartidos de infraestructura
- ✅ Diferenciador: Portal Socios + CRM integrado (GESPRO)
- ⚠️ Requiere diseño cuidadoso de aislamiento de datos

---

### ADR-009: [2026-02-01] — Terminología "Socios" (no "Inversionistas")

**Context**: Evitar problemas con normativa de captación de dinero.

**Decision**: Usar "socios" en lugar de "inversionistas" en todo el sistema:
- UI: "Portal Socios"
- Código: `partner` en lugar de `investor`
- Base de datos: tabla `partners`

**Consequences**:
- ✅ Cumplimiento normativo
- ✅ Lenguaje más inclusivo
- ⚠️ Consistencia requerida en todo el código

---

### ADR-010: [2026-02-01] — Sistema de Roles de Usuario

**Context**: Diferentes usuarios necesitan diferentes niveles de acceso.

**Decision**: Implementar 4 roles:
| Rol | Acceso | Permisos |
|:---|:---|:---|
| **Editor** | Panel Admin | Subir renders, fotos, planos, tours 360° |
| **Vendedor** | Panel Admin | Cambiar estados de unidades |
| **Admin** | Panel Admin | Todo + crear proyectos + gestionar usuarios |
| **Socio** | Portal Socios | Ver sus proyectos y métricas |

**Consequences**:
- ✅ Arquitectas pueden subir contenido sin ser admin
- ✅ Vendedores limitados a su función
- ✅ Separación clara de responsabilidades

---

### ADR-011: [2026-02-01] — SEO: Migración a Next.js (Diferida)

**Context**: SPAs tienen problemas de SEO. Next.js es la solución recomendada por expertos.

**Decision**: **DIFERIR** migración a Next.js para fase posterior:
- Mantener Vite/React actual
- No romper funcionalidad existente
- Evaluar Prerender.io como solución intermedia
- Planificar migración cuando sistema esté estable

**Consequences**:
- ✅ No hay riesgo de regresión
- ⚠️ SEO limitado temporalmente
- 📅 Revisitar después de Fase 3

---

### ADR-012: [2026-02-03] — Cloudflare R2 CDN + Configuración 12-Factor

**Context**: Assets de video e imagen (~450MB) necesitan entrega rápida global. Configuración inicial tenía valores hardcodeados violando principios 12-Factor.

**Decision**: 
1. **Assets en Cloudflare R2** con dominio personalizado `assets.cofinancia.me`
2. **Configuración via variables de entorno** (VITE_CDN_URL, VITE_TENANT_ID)
3. **Desarrollo local** usa assets locales (VITE_CDN_URL vacío)
4. **Producción** usa CDN (VITE_CDN_URL configurado en `.env.production`)

**Patrón implementado:**
```
Desarrollo:  /assets/aviano/logo.png → /assets/aviano/logo.png (local)
Producción:  /assets/aviano/logo.png → https://assets.cofinancia.me/cofinanciame/aviano/logo.png
```

**Sources**: 
- [12factor.net/config](https://12factor.net/config)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)

**Consequences**:
- ✅ Cumple 12-Factor App (config en env vars)
- ✅ Desarrollo rápido sin dependencia de internet
- ✅ CDN global para usuarios finales
- ✅ Multi-tenant ready (VITE_TENANT_ID configurable)
- ⚠️ Requiere sincronizar assets locales con R2

---

### ADR-013: [2026-02-04] — Client-Side Preload Strategy

**Context**: Usuarios perciben lentitud inicial porque el logo (LCP) tarda en cargar después de todo el bundle JS.

**Decision**: 
1. **Precargar SOLO el logo** (`<link rel="preload">`) en `index.html`.
2. Usar URL absoluta del CDN para evitar double-fetch.
3. No precargar videos (evitar saturación de ancho de banda).

**Consequences**:
- ✅ LCP mejora (logo carga en paralelo con JS).
- ✅ Percepción de "carga instantánea".
- ✅ Sin riesgo de bloquear otros recursos críticos.

---

### ADR-014: [2026-03-11] — Refactoring Global State to Local UI State

**Context**: Anti-patrones detectados en Zustand donde valores puramente de UI (`currentFloorId`, `isChatbotOpen`, etc.) estaban contaminando el store global, causando renders innecesarios.

**Decision**:
1. Extraer estado de interacciones específicas en vistas (ej: Selección de mapa, selección de piso interactivo) a lógica local usando `useState` dentro de `LocationView` y `FloorsView`.
2. Mantener en Zustand estricitamente los Datos Globales (Proyecto hidratado activo, Sección de navegación principal).

**Consequences**:
- ✅ Mejor encapsulamiento y portabilidad de los componentes visuales.
- ✅ Reducción de renders globales indeseados en toda la SPA.
- ✅ Código más alineado con estándares modernos de React.

---

### ADR-015: [2026-03-19] — Preview Module (Coming Soon) Architecture

**Context**: Necesidad de promocionar proyectos en planos o fase temprana sin inventario completo de unidades/pisos.

**Decision**: 
1. Implementar flag `isPreview` en tabla `projects`.
2. Usar campo `previewMetadata` (JSONB) para datos rápidos (Pisos, tipologías) evitando migraciones pesadas.
3. Separación lógica en Home para mostrar estos proyectos en una sección dedicada ("Próximos Proyectos").

**Consequences**:
- ✅ Permite marketing preventivo instantáneo.
- ✅ Escalable sin cambiar el core del Showcase.
- ✅ Los editores pueden cargar metadata básica sin esperar planos finales.

---

### ADR-016: [2026-03-25] — Sidebar SVG Inheritance & Scoping CSS

**Context**: Los iconos de la barra lateral no heredaban correctamente los colores del tema debido a la estructura interna de Lucide y a que una regla CSS global en `index.css` forzaba estilos sobre todos los SVGs del proyecto.

**Decision**: 
1. Reemplazar `lucide-react` en la navegación por componentes SVG inline personalizados ("quirúrgicos") en `Navigation.tsx`. Estos no tienen opacidades ni colores hardcodeados en sus paths internos y usan `stroke="currentColor"`.
2. **Efecto de Cristal Tintado (Glassmorphism)**: Para maximizar la visibilidad de los renders 3D, los polígonos del mapa en `FloorsView.tsx` usan opacidades extremadamente bajas (**0.25** para hover de estado y **0.35** para selección Cian).
3. **Persistencia de Selección vía DOM**: El resaltado Cian se mantiene persistente mediante inyección directa de estilos en el DOM, blindando la experiencia contra cualquier regresión de CSS.

**Consequences**:
- ✅ Visualización nítida de mobiliario y texturas bajo los polígonos de disponibilidad.
- ✅ Interfaz premium que prioriza el contenido visual del proyecto (renders) sobre los indicadores técnicos.
- ✅ Sencillez en el mantenimiento: Cero dependencia de librerías externas para efectos visuales complejos.



