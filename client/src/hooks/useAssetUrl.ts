import { useMemo } from 'react';
import { getAssetUrl, getAssetUrls } from '../lib/assetUrl';

/**
 * Hook to get asset URLs with automatic environment detection
 * 
 * @example
 * const logoUrl = useAssetUrl('/assets/aviano/logo.png');
 * const videoUrls = useAssetUrls(['/assets/aviano/hero/video-1.mp4', '/assets/aviano/hero/video-2.mp4']);
 */
export function useAssetUrl(localPath: string): string {
    return useMemo(() => getAssetUrl(localPath), [localPath]);
}

export function useAssetUrls(localPaths: string[]): string[] {
    return useMemo(() => getAssetUrls(localPaths), [localPaths]);
}
