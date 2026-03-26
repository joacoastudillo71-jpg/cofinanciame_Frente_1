# Cloudflare Worker Maintenance Guide

Este documento explica cómo mantener y escalar el servicio de **Cache Warming** (`cache-warming-cofinancia`) que mantiene los assets rápidos a nivel global.

## 1. Agregar Nuevos Assets

Cuando subas nuevos proyectos o assets (imágenes, videos) a Cloudflare R2, debes notificar al Worker para que los incluya en el calentamiento.

### Pasos:

1.  **Abrir el Worker**: Ir a [Cloudflare Dashboard](https://dash.cloudflare.com) > Workers & Pages > `cache-warming-cofinancia` > **Edit Code**.
2.  **Editar `worker.js`**: Buscar el array `ALL_ASSETS` (al inicio del archivo).
3.  **Agregar las rutas**: Añadir las rutas relativas de los nuevos archivos.
    ```javascript
    // Ejemplo:
    // ============ NUEVO PROYECTO ============
    'nuevo-proyecto/logo.png',
    'nuevo-proyecto/video.mp4',
    ```
4.  **Guardar**: Clic en **Deploy**.

> **Nota**: No necesitas configurar nada más. El script detectará automáticamente los nuevos archivos y creará nuevos "chunks" si es necesario.

---

## 2. Ajustar el Cron (Frecuencia)

El Worker divide los assets en grupos (chunks) de 45 archivos. El Cron ejecuta un grupo diferente cada vez.

### Regla de Oro:
El Ciclo Completo de calentamiento dura: `(Número de Chunks) x (Frecuencia del Cron)`.

### Tabla de Referencia:

| Total Assets | Chunks (Grupos) | Frecuencia Cron Sugerida | Ciclo Completo (cada asset se calienta cada...) |
| :--- | :--- | :--- | :--- |
| < 500 | 1 - 12 | **Cada 2 horas** (Actual) | 2h - 24h (OK) |
| 500 - 1000 | 12 - 24 | **Cada 1 hora** | 12h - 24h (OK) |
| > 1000 | > 24 | **Cada 30 minutos** | 12h+ (OK) |

### Cómo cambiar el Cron:
1. Ir a `cache-warming-cofinancia` > **Settings** > **Triggers**.
2. En "Cron Triggers", clic en **Edit**.
3. Cambiar la expresión Cron (ej. de `0 */2 * * *` a `0 * * * *` para cada hora).
4. Guardar.

---

## 3. Monitoreo

Para verificar que todo funciona:
- Visitar: `https://cache-warming-cofinancia.danny-jara.workers.dev/warm/all`
- Respuesta esperada: Un JSON mostrando `success` para cada chunk.

---

## 4. Troubleshooting

*   **Error 1101 (Worker Threw Exception)**: Posible error de sintaxis en el archivo JS. Verificar comas `,` al final de cada línea en el array `ALL_ASSETS`.
*   **Too Many Subrequests**: Si ves este error en los logs, significa que el `CHUNK_SIZE` (45) es muy alto para el plan actual. Bájalo a 30 en el código.
