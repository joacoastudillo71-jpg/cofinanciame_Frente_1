# Golden Paths — Showcase Inmobiliario 3D

## Qué son los Golden Paths

Son los flujos CRÍTICOS que NUNCA deben romperse. Antes de mergear cualquier PR, verificar que estos flujos funcionan.

---

## Flujos Críticos

### 1. Home → Selección de Proyecto

1. Usuario accede a `cofinancia.me`
2. HomeView muestra grid de 3 proyectos (Aviano, Siena, L'Arca)
3. Videos de fondo reproducen automáticamente
4. Usuario hace click en un proyecto
5. Transición animada a IntroView
6. **Verificar**: Animación suave, sin parpadeos negros

### 2. Navegación dentro de Proyecto

1. Usuario está en cualquier sección (Hero, Floors, Location, etc.)
2. Click en Navigation sidebar/bottom bar
3. ShowcaseEngine cambia de vista
4. AnimatePresence anima transición
5. Nueva vista carga correctamente
6. **Verificar**: 60 FPS, sin lag

### 3. Tour 360°

1. Usuario navega a sección Tour 360°
2. Viewer360 carga panorama
3. Usuario puede rotar vista (mouse/touch)
4. Hotspots funcionan (si existen)
5. **Verificar**: Carga < 3 segundos, control responsivo

### 4. Visualización de Plantas (Floors)

1. Usuario navega a sección Plantas
2. FloorsView muestra planos
3. Zoom y pan funcionan
4. Selección de pisos/unidades funciona
5. **Verificar**: Interactividad fluida

### 5. Salir de Proyecto → Home

1. Usuario hace click en "Salir" o logo
2. `exitProject()` se ejecuta
3. Transición a HomeView
4. Estado se limpia correctamente
5. **Verificar**: No queda estado residual

### 6. Preview Discovery Path

1. Usuario accede a `cofinancia.me`
2. Scroll hasta la sección "Próximos Proyectos"
3. Click en "Ver Preview" de un proyecto (ej: Sensa)
4. La URL cambia a `/preview/sensa`
5. Se renderiza la landing vertical inmersiva
6. **Verificar**: Scroll fluido, carga de video/hero y carga de Mapa 3D

---

## Checklist Pre-Merge

- [ ] Flujo 1: Home → Proyecto funciona
- [ ] Flujo 2: Navegación entre secciones OK
- [ ] Flujo 3: Tour 360° carga y responde
- [ ] Flujo 4: Plantas interactivas OK
- [ ] Flujo 5: Salir limpia estado
- [ ] Flujo 6: Preview Landing carga y navega OK
- [ ] Performance: Sin lag visible
- [ ] Mobile: Responsive funciona
