# HANDOFF M1: Cloudflare R2 CDN Integration

**Fecha**: 2026-02-03  
**Milestone**: M1 - Asset CDN Integration  
**Status**: ✅ Completado

---

## Resumen (Lenguaje Simple)

Los videos e imágenes del proyecto ahora se guardan en la "nube" (Cloudflare R2) para que los clientes los vean más rápido, sin importar dónde estén en el mundo.

**Antes**: Los archivos estaban solo en la carpeta del proyecto.  
**Ahora**: Están en tu computadora (para trabajar) + en la nube (para los clientes).

---

## Lo que se hizo

### Cloudflare R2 (La Nube)
- ✅ Cuenta R2 creada en Cloudflare
- ✅ Bucket `showcase3d-assets` creado
- ✅ Dominio personalizado: `assets.cofinancia.me`
- ✅ 140 archivos subidos (450 MB total)
- ✅ Script de sincronización: `scripts/upload-to-r2.ts`

### Código Actualizado
- ✅ `lib/assetUrl.ts` - Decide si usa local o nube
- ✅ `hooks/useCurrentProject.ts` - Transforma URLs automáticamente
- ✅ `hooks/useAssetUrl.ts` - Helper para componentes
- ✅ 8 componentes actualizados para usar el nuevo sistema

### Configuración (12-Factor Compliant)
- ✅ `.env` - Variables de desarrollo
- ✅ `.env.production` - Variables de producción
- ✅ `.env.example` - Template documentado
- ✅ Sin valores "hardcodeados" en el código

---

## Archivos Nuevos

| Archivo | Propósito |
|---------|-----------|
| `client/src/lib/assetUrl.ts` | Decide si usar local o CDN |
| `client/src/hooks/useCurrentProject.ts` | Transforma todas las URLs del proyecto |
| `client/src/hooks/useAssetUrl.ts` | Hook para URLs individuales |
| `scripts/upload-to-r2.ts` | Sube archivos locales a R2 |
| `.env.production` | Config de producción (CDN activado) |

---

## Archivos Modificados

| Archivo | Cambio |
|---------|--------|
| `IntroView.tsx` | Usa `useCurrentProject` |
| `HeroView.tsx` | Usa `useCurrentProject` + getAssetUrl para icon-mark |
| `HomeView.tsx` | Usa `getAssetUrl` |
| `LocationView.tsx` | Usa `useCurrentProject` |
| `FloorsView.tsx` | Usa `useCurrentProject` |
| `Tour360View.tsx` | Usa `useCurrentProject` |
| `RenderView.tsx` | Usa `useCurrentProject` |
| `Navigation.tsx` | Usa `getAssetUrl` para icon-mark |
| `index.html` | URLs absolutas de CDN para OG/Twitter/Schema |
| `server/index.ts` | Fix para Node.js 24 |
| `.env.example` | Variables R2 documentadas |
| `docs/DECISIONS.md` | ADR-012 agregado |

---

## Cómo Funciona

```
┌─────────────────────────────────────────────────────────────┐
│  DESARROLLO (tu computadora)                                │
│  ─────────────────────────                                  │
│  .env tiene: VITE_CDN_URL= (vacío)                         │
│  → La app usa: /assets/aviano/logo.png (local)             │
└─────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  PRODUCCIÓN (Vercel)                                        │
│  ───────────────────                                        │
│  .env.production tiene: VITE_CDN_URL=https://assets...     │
│  → La app usa: https://assets.cofinancia.me/cofinanciame/  │
└─────────────────────────────────────────────────────────────┘
```

---

## Para Agregar Nuevos Assets

**Opción 1: Desde tu computadora**
1. Agrega el archivo a `client/public/assets/`
2. Corre: `npx tsx scripts/upload-to-r2.ts`
3. Los archivos se sincronizan a la nube

**Opción 2: Directo a la nube**
1. Entra a [dash.cloudflare.com](https://dash.cloudflare.com)
2. R2 → showcase3d-assets → Upload
3. Arrastra el archivo

---

## Verificación

- [x] Build pasa: `npm run build`
- [x] Assets accesibles: `https://assets.cofinancia.me/cofinanciame/aviano/logo.png`
- [x] Desarrollo usa local (sin internet)
- [x] Producción usa CDN

---

## Variables de Entorno para Vercel

Si despliega en Vercel, estas variables ya están en `.env.production` y se aplican automáticamente. No necesita configurar nada en el dashboard de Vercel para los assets.

---

## Próximo Milestone

**M2**: TBD - Neon Database + Portal Socios

---

## Decisión Técnica Documentada

Ver [ADR-012](../DECISIONS.md#adr-012-2026-02-03--cloudflare-r2-cdn--configuración-12-factor) en DECISIONS.md
