# START HERE — Showcase Inmobiliario 3D (CoFinancia.me)

## 1. Qué es este sistema

> **GUIDE**: Para explicación detallada del sistema de gobernanza, lee [AI_ENG_OS_HANDBOOK.md](AI_ENG_OS_HANDBOOK.md).

**CoFinancia.me** es una plataforma SaaS de showcasing inmobiliario 3D que permite a socios y compradores explorar proyectos de forma inmersiva.

**Visión**: Competir con web3d.app ofreciendo Portal Socios + CRM integrado (GESPRO).

**Filosofía**: Experiencia inmersiva, rendimiento optimizado, calidad visual premium.

---

## 1.5. Historial de Hitos (Handoffs)

| Doc | Logro |
|:---|:---|
| [HANDOFF_M0_SETUP.md](handoffs/HANDOFF_M0_SETUP.md) | M0: Setup inicial + AI-Eng OS + Deploy Vercel |
| [HANDOFF_M1_R2_CDN.md](handoffs/HANDOFF_M1_R2_CDN.md) | M1: Cloudflare R2 CDN + Assets en nube |

## 1.6. Bitácora de Proyecto (Logbook)

| Doc | Propósito |
|:---|:---|
| 📜 [DECISIONS.md](DECISIONS.md) | Decisiones técnicas (ADRs) |
| 🐛 [KNOWN_BUGS.md](KNOWN_BUGS.md) | Bugs / Deuda técnica |
| 🧾 [handoffs/](handoffs/) | Hitos / Cierres |

**Superbundle**: Se genera con `npm run handoff`

---

## 2. Mapa Mental (Cómo se conecta todo)

```
┌─ Reglas Globales (~/.gemini/GEMINI.md) ─────────────────────┐
│  Comportamiento base del AI (ya configuradas)               │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌─ Workspace Rules (.agent/rules/*.md) ───────────────────────┐
│  Reglas específicas de este proyecto                        │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌─ Constitución Viva (docs/*.md) ─────────────────────────────┐
│  La verdad sobre el proyecto                                │
└──────────────────────────────────────────────────────────────┘
                              ▼
┌─ Automatización ────────────────────────────────────────────┐
│  Git Hooks + CI (GitHub Actions)                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 3. El Loop de Trabajo

> **Enforcement**: [AI_RULES.md](../AI_RULES.md)

1. **Plan**: Definir micro-pasos (sin romper nada)
2. **Code**: Editar máximo 3 archivos por paso
3. **Verify**: Correr build + lint localmente
4. **Push**: Solo en feature branches
5. **Main is Sacred**: Branch → PR → CI verde → Merge

---

## 4. Cuándo actualizar qué doc

| Si cambias... | Actualiza... |
|:---|:---|
| Decisiones técnicas (librerías, patrones) | `docs/DECISIONS.md` |
| Bugs conocidos | `docs/KNOWN_BUGS.md` |
| Estructura (carpetas, arquitectura) | `docs/ARCHITECTURE.md` |
| Flujos de usuario | `docs/GOLDEN_PATHS.md` |

---

## 5. Quick Index (Read in Order)

| # | Doc | Purpose |
|:---|:---|:---|
| 1 | [AI_RULES.md](../AI_RULES.md) | Reglas para el AI (Obligatorio) |
| 2 | [PROJECT_BRIEF.md](PROJECT_BRIEF.md) | Contexto del negocio |
| 3 | [ARCHITECTURE.md](ARCHITECTURE.md) | Stack técnico |
| 4 | [GOLDEN_PATHS.md](GOLDEN_PATHS.md) | Flujos críticos |

---

## 6. Checklist de Cierre de Tarea

- [ ] Build pasa (`npm run build`)
- [ ] Hooks activos: `git config core.hooksPath .githooks`
- [ ] ¿Actualicé la doc correspondiente?
