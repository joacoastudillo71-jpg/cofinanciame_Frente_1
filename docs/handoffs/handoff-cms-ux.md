# Handoff: CMS Asset Management y Purge de Estado (Frente 1)

## Contexto
Implementación de interfaz de visualización y eliminación de Assets dentro del Editor CMS. Corrección del bug de estado corrupto (Zustand) al salir de un proyecto, y validación dinámica de navegación al seleccionar/salir de un proyecto (Wouter).

## Cambios Realizados
1. **Backend:** Creación de endpoint `DELETE /api/admin/assets/:id` en `server/routes.ts`.
2. **Frontend UI:** Inyección de tabla interactiva `AssetList` con preview en `AdminDashboard.tsx`.
3. **Store:** Refactorización limpia de `exitProject` en `useAppStore.ts` (purga completa de estado de proyecto, unidades y sección).
4. **Navegación:** `handleExit` en `Navigation.tsx` forzando redirección local con `useLocation('/')` y reestructuración del fallback screen (`ShowcaseEngine.tsx`)

## Pruebas Superadas (`npm run check`, `npm run build`)
- 0 Errores de TypeScript.
- Build de producción (Vite + tsc) generado en 5 segundos sin fallos de compilación.
- Aislamiento de capas del patrón adaptador intactos.
