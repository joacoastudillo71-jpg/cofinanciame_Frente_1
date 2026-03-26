# AI-Eng OS Handbook: El Manual del Sistema

> 🚨 **ADVERTENCIA: ESTE MANUAL ES EDUCATIVO (PARA HUMANOS). NO ES FUENTE DE VERDAD PARA REGLAS.**
> Autoridad final: `AI_RULES.md` y `.agent/rules/`

---

## 1. ¿Por qué existe este "Sistema Operativo"?

En proyectos complejos con AI y humanos trabajando juntos, sufrimos **"Amnesia de Contexto"**:

- El AI olvida qué se decidió ayer.
- El Humano olvida qué reglas le dio al AI.
- Los "Prompts" se pierden en el chat.

**La Solución:** Tratar al proyecto como un **Sistema Operativo** donde la "Memoria" y las "Reglas" están escritas en archivos, no en la cabeza de nadie.

---

## 2. Las 4 Capas

| Capa | Propósito | Ubicación |
|:---|:---|:---|
| 🧠 **Reglas** | Lo que el AI DEBE hacer | `AI_RULES.md` + `.agent/rules/` |
| 📚 **Documentación** | Lo que SABEMOS del proyecto | `docs/` |
| 🤖 **Automatización** | Lo que PROTEGE el proyecto | `.githooks/` + CI |
| 📦 **Artefactos** | La EVIDENCIA del trabajo | Superbundle + Handoffs |

---

## 3. El Loop de Trabajo

```
1. PLAN    → Definir micro-pasos (max 3 archivos por paso)
2. CODE    → Implementar el paso actual
3. VERIFY  → Correr build + lint
4. DOCS    → Actualizar docs si aplica
5. PUSH    → Solo en feature branches (nunca main directo)
6. PR      → CI verde → Merge
```

---

## 4. Doctrina "Main is Sacred"

- **NUNCA** push directo a main
- **SIEMPRE**: rama → PR → CI verde → merge
- Los hooks locales bloquean push a main
- El CI verifica antes de mergear

---

## 5. ¿Quién lee qué?

| Rol | Documento |
|:---|:---|
| AI Agent | `AI_RULES.md` (obligatorio) |
| Humano | `AI_ENG_OS_HANDBOOK.md` (este doc) |
| Nuevo Dev | `docs/START_HERE.md` |
| QA | `docs/GOLDEN_PATHS.md` |

---

## 6. Protocol de Cierre (Closeout)

Al terminar CADA tarea, el AI debe:

1. **Verificar**: Correr build
2. **Documentar**: Actualizar docs si hubo cambios
3. **Reportar**: Bloque de cierre

```
VERIFIED: (build pasó sí/no)
DOCS UPDATED: (lista de docs o "none")
HANDOFF: (se creó handoff sí/no)
SUPERBUNDLE: (se generó sí/no)
NEXT: (próximos pasos)
```
