# Showcase Inmobiliario 3D — Project Brief

> **Documento Vivo**: Este archivo define el ALCANCE y la VISIÓN.

## 1. Visión

**CoFinancia.me** es una plataforma SaaS multi-tenant de showcasing inmobiliario 3D que permite a compradores y socios explorar proyectos de forma inmersiva, y a administradores gestionar proyectos sin necesidad de código.

**Visión SaaS**: Competir con web3d.app ofreciendo Portal Socios + CRM integrado como diferenciadores.

**Tagline**: *"Tu dinero en movimiento, tu futuro en construcción."*

---

## 2. Plataforma Completa

```
┌─────────────────────────────────────────────────────────────┐
│                    COFINANCIA.ME PLATFORM                   │
├─────────────────────────────────────────────────────────────┤
│  🌐 SITIO PÚBLICO                                           │
│     └── Showcase 3D de proyectos                            │
│     └── Formulario de contacto → Leads (sync GESPRO)        │
│                                                             │
│  🔐 PANEL ADMIN (CMS)                                       │
│     └── Admin: Crear/editar proyectos, gestionar usuarios   │
│     └── Editor: Subir renders, fotos, planos, tours 360°    │
│     └── Vendedor: Cambiar estados de unidades               │
│                                                             │
│  💼 PORTAL SOCIOS                                           │
│     └── Dashboard por proyecto                              │
│     └── Métricas financieras                                │
│     └── Galería de avance de obra                           │
│                                                             │
│  📊 ANALYTICS (en GESPRO CRM)                               │
│     └── Leads por fuente                                    │
│     └── Conversiones                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Proyectos Actuales

| Proyecto | Estado | Features |
|:---|:---|:---|
| **Aviano** | ✅ Activo | Hero videos, Plantas, Ubicación |
| **Siena** | ✅ Activo | Hero videos, Plantas, Ubicación, Tour 360°, Renders |
| **L'Arca** | ✅ Activo | Hero videos, Plantas, Ubicación, Tour 360°, Renders |

---

## 4. Roadmap de Desarrollo (Priorizado)

### 🔴 URGENTE (Fase 1)

| Tarea | Por qué urgente |
|:---|:---|
| **Neon DB** | Base para todo lo demás |
| **Cloudflare R2** | Para subir renders y assets desde panel |
| **Panel Admin básico** | Para gestionar proyectos sin código |

### 🟡 IMPORTANTE (Fases 2-4)

| Fase | Qué incluye |
|:---|:---|
| **2** | Formulario leads + sync GESPRO CRM |
| **3 (NUEVA)** | **Migración de Datos y API** 🚧<br>- Diseño Schema DB (Projects, Units, Assets)<br>- Script Migración (data/projects/*.ts → Neon)<br>- Conexión Frontend (API GET /api/projects/:slug) |
| **4** | **Panel Administrativo** 🛠️<br>- Gestión de proyectos/unidades (CRUD)<br>- Subida de assets (R2 Integration)<br>- Gestión de estados (Vendido/Disponible) |

### ⚪ DIFERIDO (Fase 5+)

| Tarea | Nota |
|:---|:---|
| **Portal Socios** | Dashboard y métricas financieras |
| Analytics avanzado | Usar GESPRO primero |
| Migración Next.js (SEO) | Evaluar cuando sistema estable |
| Multi-tenant | Después de validar con CoFinancia.me |

---

## 5. Usuarios del Sistema

| Usuario | Acceso | Puede hacer |
|:---|:---|:---|
| **Visitante** | Público | Ver proyectos, enviar formulario |
| **Editor** | Panel Admin | Subir renders, fotos, planos, tours 360° |
| **Vendedor** | Panel Admin | Cambiar estados de unidades |
| **Admin** | Panel Admin | Todo + crear proyectos + gestionar usuarios |
| **Socio** | Portal Socios | Ver sus proyectos, métricas financieras |

---

## 6. Principios Inamovibles

- **Performance First**: 60 FPS en dispositivos mid-range
- **Mobile Friendly**: Debe funcionar en celulares
- **Progressive Loading**: Assets bajo demanda por sección
- **Experiencia Premium**: Animaciones suaves, diseño de alto nivel
- **Modular**: Cada módulo funciona independiente
- **Multi-tenant Ready**: Diseño escalable desde el inicio

---

## 7. Integraciones

| Sistema | Propósito | Estado |
|:---|:---|:---|
| **Vercel** | Hosting y deploy | ✅ Activo |
| **Neon** | Base de datos PostgreSQL | 🔜 Fase 1 |
| **Cloudflare R2** | CDN para assets | 🔜 Fase 1 |
| **GESPRO CRM** | Gestión de leads | 🔜 Fase 2 |

---

## 8. Definition of Done

- [ ] Videos y assets cargan correctamente
- [ ] Navegación fluida entre secciones
- [ ] Responsive (desktop + mobile)
- [ ] Build pasa sin errores
- [ ] Docs actualizados
- [ ] Rule-12: Git state verified before claims


