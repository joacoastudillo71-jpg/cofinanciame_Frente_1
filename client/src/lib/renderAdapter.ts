/**
 * Adaptador Universal para Renders
 * 
 * Convierte cualquier formato de configuración de renders a un formato
 * normalizado { categories: [...] }, permitiendo que RenderView sea agnóstico
 * al formato de entrada.
 * 
 * Esto hace el sistema:
 * - Modular: Soporta múltiples formatos
 * - Escalable: Agregar nuevos formatos sin cambiar RenderView
 * - Mantenible: Lógica centralizada en un adaptador
 */

import { RenderConfig, RenderCategory } from '../config/types';

export interface NormalizedRenderConfig {
  categories: RenderCategory[];
}

/**
 * Normaliza cualquier formato de configuración de renders
 * a { categories: [...] }
 */
export function normalizeRenderConfig(
  config: RenderConfig | undefined
): NormalizedRenderConfig {
  if (!config) {
    return { categories: [] };
  }

  // Caso 1: Formato categorizado { categories: [...] }
  if ('categories' in config && Array.isArray(config.categories)) {
    return {
      categories: config.categories,
    };
  }

  // Caso 2: Formato flat array [...]
  if (Array.isArray(config)) {
    // Crear una categoría genérica "Renders" para arrays simples
    return {
      categories: [
        {
          id: 'renders',
          label: 'Renders',
          images: config,
        },
      ],
    };
  }

  // Fallback: config inválida
  return { categories: [] };
}
