// client/src/config/types.ts

// ==========================================
// 1. DEFINICIONES PARA RENDERS (GALERÍA VISUAL)
// ==========================================

/**
 * Representa una imagen individual en la galería.
 * Permite título opcional para SEO y UI.
 */
export interface RenderImageItem {
  url: string;
  title?: string; // Título opcional para mostrar en el lightbox (ej: "Baño Master")
  alt?: string;   // Texto alternativo para accesibilidad y SEO
}

/**
 * Categoría de renders (ej: "Interiores", "Exteriores", "Amenities").
 */
export interface RenderCategory {
  id: string;
  label: string;
  // Soporta tanto string simple (ruta) como objeto detallado para retrocompatibilidad
  images: (string | RenderImageItem)[];
}

/**
 * Configuración global del módulo de Renders.
 */
export interface RenderConfig {
  categories: RenderCategory[];
}


// ==========================================
// 2. DEFINICIONES PARA UNIDADES Y PISOS (INTERACTIVO)
// ==========================================

/**
 * Detalles estadísticos y técnicos de una unidad inmobiliaria.
 * Usado para mostrar la ficha técnica en el Drawer.
 */
export interface UnitStats {
  // --- ÁREAS ---
  areaInterior: string;        // Ej: "85,50 m²" (Área Habitable cerrada)

  areaExterior?: string;       // Ej: "12,00 m²" (Terraza, Patio, Balcón)

  areaHabitableTotal?: string; // NUEVO: Suma de Interior + Exterior (Para claridad comercial)

  areaTotal?: string;          // Ej: "115,00 m²" (Suma Final incluyendo Bodega/Parqueo)

  // --- ETIQUETAS DINÁMICAS ---
  exteriorLabel?: string;      // Ej: "Terraza", "Patio", "Balcón", "Jardín" (Para ser específico)

  // --- DISTRIBUCIÓN ---
  bedrooms?: number;           // Número de dormitorios (0 para lofts/locales)
  bathrooms?: number;          // Número de baños (soporta decimales ej: 2.5)

  // --- ADICIONALES ---
  parking?: string;            // Ej: "1" o "1 (12.5m²)" - Texto flexible
  storage?: string;            // Ej: "1 (3.5m²)" - Texto flexible

  // --- COMERCIAL ---
  price?: string;              // Precio formateado (Opcional para fases futuras)
}

/**
 * Representa una unidad interactiva dentro del plano SVG.
 */
export interface FloorUnit {
  // ID técnico: DEBE COINCIDIR EXACTAMENTE con el nombre de la capa/ID en el archivo SVG de Illustrator
  id: string;
  identifier?: string; // Drizzle DB string ID

  // Nombre comercial para mostrar en la interfaz (ej: "Departamento 301")
  label?: string | null;
  name?: string; // Soporte para UI Siena Premium Card
  rooms?: number; // Soporte para UI Siena Premium Card

  // Propiedades Premium Fase 4
  area?: number | string; // Permitimos string en caso de venir del DB sin parseo
  habitableArea?: number;
  terraceArea?: number;
  parkingCount?: number;
  parkingArea?: number;
  bathrooms?: number;
  storageCount?: number;
  storageArea?: number;

  // Nuevas Propiedades Dúplex
  isDuplex?: boolean;
  duplexLevel?: 'inferior' | 'superior' | string | null;

  // Tipo de unidad para determinar el icono a mostrar en la UI
  type?: 'apartment' | 'suite' | 'penthouse' | 'commercial' | 'common' | string | null;

  // Estado comercial para el color del badge (Semáforo de ventas)
  status: 'available' | 'reserved' | 'sold' | 'info' | 'Disponible' | 'Reservado' | 'Vendido';
  price?: number;

  // Datos específicos de este piso/unidad
  stats: UnitStats;

  // NUEVO: Para Dúplex (Penthouse)
  // Aquí guardamos el resumen total sumando ambos pisos.
  // Si existe, el Drawer mostrará una sección extra "Total Unidad" con estos datos.
  duplexTotalStats?: UnitStats;
}

/**
 * Representa un nivel o piso completo del edificio.
 */
export interface FloorLevel {
  id: string | number;
  label: string;

  // Imagen base del plano (.webp) que se muestra de fondo
  image: string;

  // Ruta al archivo de trazos (.svg) que se superpone para la interactividad
  svgUrl?: string;

  // Imagen de respaldo para navegadores antiguos (opcional)
  imageFallback?: string;

  // Texto alternativo para accesibilidad
  altText?: string;

  // Lista de unidades interactivas que se mapean sobre el SVG
  units?: FloorUnit[];
}


// ==========================================
// 3. DEFINICIONES PARA UBICACIÓN (MAPAS)
// ==========================================

export interface LocationLevel {
  id: string;
  label: string;
  image: string;
  imageFallback?: string;
  altText?: string;
}

export interface ProjectLocation {
  levels: LocationLevel[];
  googleMapsLink: string; // Enlace externo a Google Maps para el botón "Cómo llegar"
}


// ==========================================
// 4. DEFINICIONES PARA TOURS 360 (TOUR VIRTUAL)
// ==========================================

export interface TourScene {
  id: string;
  label: string;
  image: string;
  imageFallback?: string;

}

export interface TourUnit {
  id: string;
  label: string;
  scenes: TourScene[];
}

export interface TourCategory {
  id: string;
  label: string;
  units: TourUnit[];
}


// ==========================================
// 5. CONFIGURACIÓN PRINCIPAL DEL PROYECTO
// ==========================================

/**
 * Interfaz Maestra que define la estructura de datos de un proyecto inmobiliario.
 * Todos los archivos en /data/projects/ deben cumplir este contrato.
 */
export interface ProjectConfig {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isPreview?: boolean;
  previewMetadata?: {
    totalFloors?: number;
    unitTypes?: string[];
    expectedLaunchDate?: string;
    threeDModelUrl?: string;
    heroSubtitle?: string;
    section1Title?: string;
    section1Desc?: string;
    locationTitle?: string;
    locationDesc?: string;
    ctaTitle?: string;
    ctaDesc?: string;
    ctaButtonText?: string;
  };
  units?: any[];
  rawAssets?: any[]; // Mapeo de Assets puros de Base de Datos para validaciones crudas (ej. vr_view_360)

  // Configuración visual del tema
  theme: {
    primaryColor: string;
    secondaryColor: string;
    fontFamily?: string;
  };

  // Configuraciones de UI específicas
  ui?: {
    logoSize?: string; // Clase de Tailwind para el tamaño del logo (ej: "h-24")
  };

  // Feature Flags: Permite activar/desactivar módulos por proyecto individualmente
  // Útil para lanzar proyectos por fases.
  enabledFeatures: {
    introVideo: boolean;
    heroVideos: boolean;
    tours360: boolean;
    location: boolean;
    floors: boolean;
    renders: boolean;
    chatbot: boolean;
    interactiveFloors?: boolean;
  };

  // Contenedor de todos los activos y datos del proyecto
  assets: {
    logo: string;
    introVideo?: string;
    introImage?: string; // NUEVO: Soporte para render estático de intro
    coverImage?: string; // Imagen principal estática de fallback

    // Videos del carrusel principal
    heroVideos: string[];

    // Configuración de la Galería de Renders
    renders: RenderConfig;

    // Configuración del Visor de Ubicación
    location: ProjectLocation;

    // Configuración del Visor de Plantas Interactivas
    floors: FloorLevel[];

    // Configuración del Tour Virtual 360
    tour360Url?: string; // URL externa (si aplica)
    toursData?: TourCategory[]; // Data interna (si aplica)
  };
}