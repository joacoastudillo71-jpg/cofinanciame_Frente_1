import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getAssetUrl } from '../lib/assetUrl';
import type { ProjectConfig, RenderImageItem } from '../config/types';

/**
 * Deep transforms all asset URLs in the project config
 * Converts local paths to CDN URLs in production
 */
function transformProjectAssets(project: ProjectConfig): ProjectConfig {
    return {
        ...project,
        assets: {
            ...project.assets,
            logo: getAssetUrl(project.assets.logo),
            introVideo: project.assets.introVideo ? getAssetUrl(project.assets.introVideo) : undefined,
            heroVideos: project.assets.heroVideos.map(getAssetUrl),

            renders: {
                categories: project.assets.renders.categories.map(cat => ({
                    ...cat,
                    images: cat.images.map(img => {
                        // Handle both string and RenderImageItem types
                        if (typeof img === 'string') {
                            return getAssetUrl(img);
                        }
                        return {
                            ...img,
                            url: getAssetUrl(img.url)
                        } as RenderImageItem;
                    })
                }))
            },

            location: {
                ...project.assets.location,
                levels: project.assets.location.levels.map(level => ({
                    ...level,
                    image: getAssetUrl(level.image),
                    imageFallback: level.imageFallback ? getAssetUrl(level.imageFallback) : undefined
                }))
            },

            floors: project.assets.floors.map(floor => ({
                ...floor,
                image: getAssetUrl(floor.image),
                imageFallback: floor.imageFallback ? getAssetUrl(floor.imageFallback) : undefined,
                svgUrl: floor.svgUrl ? getAssetUrl(floor.svgUrl) : undefined
            })),

            toursData: project.assets.toursData?.map(category => ({
                ...category,
                units: category.units.map(unit => ({
                    ...unit,
                    scenes: unit.scenes.map(scene => ({
                        ...scene,
                        image: getAssetUrl(scene.image),
                        imageFallback: scene.imageFallback ? getAssetUrl(scene.imageFallback) : undefined
                    }))
                }))
            }))
        }
    };
}

/**
 * Hook that returns the current project with CDN-transformed asset URLs
 * Use this instead of accessing currentProject directly from the store
 */
export function useCurrentProject(): ProjectConfig | null {
    const currentProject = useAppStore(state => state.currentProject);

    return useMemo(() => {
        if (!currentProject) return null;
        return transformProjectAssets(currentProject);
    }, [currentProject]);
}
