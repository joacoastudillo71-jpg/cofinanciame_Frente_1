# Operations Manual — Showcase Inmobiliario 3D

## 1. Desarrollo Local

### Requisitos
- Node.js 20+
- npm

### Setup

```bash
# Clonar repo
git clone https://github.com/joacoastudillo71-jpg/cofinanciame_Frente_1.git
cd cofinanciame_Frente_1

# Instalar dependencias
npm install

# Activar hooks de Git
chmod +x .githooks/*
git config core.hooksPath .githooks

# Crear .env.local (opcional, para DB)
cp .env.example .env.local

# Iniciar desarrollo
npm run dev
```

### Scripts disponibles

| Script | Comando | Propósito |
|:---|:---|:---|
| Dev | `npm run dev` | Servidor de desarrollo |
| Build | `npm build` | Build completo para Vercel (Frontend + Server) |
| Check | `npm run check` | Type-check TypeScript |
| Handoff | `npm run handoff` | Generar Superbundle |

---

## 2. Branching Strategy

### Main is Sacred

```
main (protegido)
  └── feat/feature-name
  └── fix/bug-name
  └── chore/task-name
```

### Flujo

1. Crear rama desde main: `git checkout -b feat/mi-feature`
2. Desarrollar y hacer commits
3. Push a origin: `git push origin feat/mi-feature`
4. Crear PR en GitHub
5. CI verifica build
6. Merge a main

---

## 3. Deployment

### Vercel (Producción)

- **URL**: https://cofinancia.me
- **Dominio alternativo**: https://www.cofinancia.me
- **Auto-deploy**: Push a `main` → Deploy automático
- **Preview**: Cada PR genera preview URL

### Environment Variables (Vercel)

| Variable | Propósito |
|:---|:---|
| `DATABASE_URL` | Conexión a Neon PostgreSQL |

---

## 4. Gestión de Assets

### Estructura

```
client/public/assets/
├── aviano/
│   ├── videos/
│   ├── floors/
│   └── location/
├── siena/
│   ├── videos/
│   ├── 360/
│   ├── renders/
│   └── ...
└── larca/
    └── ...
```

### Optimización

- Videos: MP4 H.264, máximo 1080p
- Imágenes 360°: JPEG, máximo 4096x2048
- Renders: WebP preferido, fallback JPEG

---

## 5. Troubleshooting

### Build falla

1. Verificar `npm run check` para errores de tipos
2. Limpiar cache: `rm -rf node_modules/.vite`
3. Reinstalar: `rm -rf node_modules && npm install`

### Assets no cargan

1. Verificar rutas en archivos de proyecto (`data/projects/*.ts`)
2. Verificar que assets existen en `public/assets/`
3. Verificar mayúsculas/minúsculas en nombres

---

## 6. Contactos

| Rol | Contacto |
|:---|:---|
| Owner | Danny |
