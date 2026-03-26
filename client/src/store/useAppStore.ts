import { create } from 'zustand';
import { ProjectConfig, FloorUnit, LocationLevel } from '../config/types';

export type SectionId = 'home' | 'intro' | 'hero' | 'floors' | 'location' | 'renders' | 'tour360';

interface AppState {
  currentProject: ProjectConfig | null;
  isLoading: boolean;
  error: string | null;
  fetchProjectData: (slug: string) => Promise<void>;
  currentSection: SectionId;
  isMenuOpen: boolean;
  setProject: (config: ProjectConfig | null) => void;
  setSection: (section: SectionId) => void;
  exitProject: () => void;
  selectedUnit?: FloorUnit | null;
  activeLocation?: LocationLevel | null;
}

// FIX: Añadimos 'get' aquí para poder llamar funciones dentro de otras funciones
export const useAppStore = create<AppState>((set, get) => ({
  currentProject: null,
  isLoading: true,
  error: null,
  currentSection: 'home',

  isMenuOpen: false,

  // 🚀 EL FIX MAESTRO: Interceptamos la inyección estática
  setProject: (config) => {
    if (config && config.slug) {
      // Si la Home manda datos viejos, le robamos el slug (ej. 'siena') y consultamos a Neon DB
      get().fetchProjectData(config.slug);
    } else {
      set({ currentProject: config, isLoading: false });
    }
  },

  setSection: (section) => set({ currentSection: section }),

  // FIX: Al salir, reseteamos todo para que el próximo proyecto cargue limpio
  exitProject: () => set({ 
    currentProject: null,
    currentSection: 'home', 
    isLoading: true,
    error: null,
    selectedUnit: null,
    activeLocation: null
  }),

  fetchProjectData: async (slug: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(`/api/projects/${slug}`);
      if (!res.ok) throw new Error('Fallo en la sincronización con Neon DB');

      const data = await res.json();

      // Extraer el array crudo de la BD
      const dbAssetsArray = Array.isArray(data.assets) ? data.assets : [];

      // Clasificación de Assets
      const basePlans = dbAssetsArray.filter((a: Record<string, unknown>) => a.category === 'Plano Base (.webp)');
      const svgLayers = dbAssetsArray.filter((a: Record<string, unknown>) => a.category === 'Capa Interactiva (.svg)');
      const logoAsset = dbAssetsArray.find((a: Record<string, unknown>) => a.category === 'Logo Principal');
      const introVideoAsset = dbAssetsArray.find((a: Record<string, unknown>) => a.category === 'Video de Intro (.mp4)');
      const introImageAsset = dbAssetsArray.find((a: Record<string, unknown>) => a.category === 'Render de Intro (.webp)');
      const videoAsset = dbAssetsArray.find((a: Record<string, unknown>) => a.category === 'Video Principal (.mp4)');
      const coverAsset = dbAssetsArray.find((a: Record<string, unknown>) => a.category === 'Render Principal (Cover)');
      const galleryAssets = dbAssetsArray.filter((a: Record<string, unknown>) => a.category === 'Render de Galería');

      // Ensamblaje de Pisos Dinámicos
      let dynamicFloors: Record<string, unknown>[] = [];
      if (basePlans.length > 0) {
        dynamicFloors = basePlans.map((webpAsset: Record<string, unknown>, index: number) => ({
          id: index + 1,
          label: `Piso ${index + 1}`,
          image: webpAsset.r2Url,
          svgUrl: svgLayers[index]?.r2Url || '',
          // Mapeo explícito para asegurar que label y type bajen de la BD al estado
          units: (data.units || []).map((u: Record<string, unknown>) => ({
            ...u,
            label: u.label,
            type: u.type
          }))
        }));
      }

      interface RenderCategoryMap {
        [key: string]: { id: string; label: string; images: { url: string; title: string }[] };
      }

      // Lógica de Agrupación (Reduce) para la Galería de Renders
      const categoriesMap = galleryAssets.reduce((acc: RenderCategoryMap, asset: Record<string, unknown>) => {
        const groupLabel = (asset.label as string) || 'General';
        const groupId = groupLabel.toLowerCase().replace(/\s+/g, '-');

        if (!acc[groupId]) {
          acc[groupId] = { id: groupId, label: groupLabel, images: [] };
        }

        acc[groupId].images.push({ url: (asset.r2Url as string), title: (asset.name as string) || '' });
        return acc;
      }, {} as RenderCategoryMap);

      const dynamicGalleryCategories = Object.values(categoriesMap);

      // Reconstrucción estricta del objeto ProjectConfig (Salvavidas Globales)
      const structuredProject = {
        ...data,
        id: data.slug || data.id?.toString(),
        rawAssets: dbAssetsArray,
        theme: data.theme || { primaryColor: '#06b6d4', secondaryColor: '#0891b2' },
        assets: {
          logo: logoAsset ? logoAsset.r2Url : '/assets/cofinancia-logo.png',
          introVideo: introVideoAsset ? introVideoAsset.r2Url : '',
          introImage: introImageAsset ? introImageAsset.r2Url : '',
          heroVideos: videoAsset ? [videoAsset.r2Url] : [],
          coverImage: coverAsset ? coverAsset.r2Url : '',
          floors: dynamicFloors as unknown as import('../config/types').FloorLevel[],
          renders: { categories: dynamicGalleryCategories }, // Ensamblaje inyectado
          location: { levels: [] },
          toursData: []
        },
        // El Interruptor Mágico: Activar el botón de Renders en la UI si hay imágenes
        enabledFeatures: {
          ...(data.enabledFeatures || {}),
          ...(dynamicGalleryCategories.length > 0 ? { renders: true } : {}),
          ...(dynamicFloors.length > 0 ? { floors: true } : {})
        }
      } as ProjectConfig;

      // Inyectar al store global respetando la nomenclatura original
      set({ currentProject: structuredProject, isLoading: false });
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Error en fetchProjectData:', error);
      set({ error: error.message || 'Error desconocido', isLoading: false });
    }
  }
}));