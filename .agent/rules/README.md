# Workspace Rules Index — Showcase Inmobiliario 3D

Este proyecto usa AI-Eng OS. Las reglas se numeran por prioridad.

| Rule | Purpose |
|:---|:---|
| 01 | Read docs before planning |
| 02 | Protect data boundaries |
| 03 | Event sourcing pattern |
| 04 | No hardcoded logic |
| 05 | Prevent data loss (DB safety) |
| 06 | Micro-steps + verify |
| 07 | Documentation discipline |
| 08 | Consistent naming |
| **09** | **Closeout Protocol (CRITICAL)** |
| **10** | **Auto push to origin** |
| **11** | **AI-Eng OS Autopilot** (global) |
| **12** | **ALWAYS fetch before claiming remote state** |

---

## Cómo funciona

> **IMPORTANTE**: Los archivos `.md` en esta carpeta son solo DOCUMENTACIÓN de referencia.
> Las reglas reales se configuran en la interface de Google Antigravity.

1. Danny configura las reglas en Antigravity (Global Rules + Workspace Rules)
2. Antigravity las inyecta en cada conversación
3. Los archivos aquí documentan qué reglas existen para consistencia

---

## Reglas Globales (aplican a todos los proyectos)

Configuradas en `~/.gemini/GEMINI.md`:
- Rules 01-10: Comportamiento base del AI
- Rule 11: AUTOPILOT Closeout Protocol
- Rule 12: Git state verification

---

## Actualizado: 2026-02-01

