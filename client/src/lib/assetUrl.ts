/**
 * Asset URL Configuration
 * 
 * This module provides centralized URL generation for assets.
 * In production, assets are served from Cloudflare R2 CDN.
 * In development, assets are served locally.
 * 
 * Follows 12-Factor App principles:
 * - Config from environment variables
 * - No hardcoded values
 * 
 * @see https://12factor.net/config
 */

// Environment detection
const isDevelopment = import.meta.env.DEV;

// Configuration from environment (12-Factor compliant)
const CDN_URL = import.meta.env.VITE_CDN_URL || '';
const TENANT_ID = import.meta.env.VITE_TENANT_ID || 'default';

/**
 * Generates the correct asset URL based on environment
 * 
 * @param localPath - Local path like "/assets/aviano/logo.png"
 * @returns Full URL for the asset
 * 
 * @example
 * getAssetUrl('/assets/aviano/logo.png')
 * // Dev: '/assets/aviano/logo.png'
 * // Prod: 'https://assets.cofinancia.me/cofinanciame/aviano/logo.png'
 */
export function getAssetUrl(localPath: string): string {
    // In development OR if CDN_URL is not configured, use local assets
    if (isDevelopment || !CDN_URL) {
        return localPath;
    }

    // In production with CDN configured, use CDN URL
    // Transform: /assets/aviano/logo.png → cofinanciame/aviano/logo.png
    const cleanPath = localPath.replace(/^\/assets\//, '');
    return `${CDN_URL}/${TENANT_ID}/${cleanPath}`;
}

/**
 * Helper to generate multiple asset URLs at once
 */
export function getAssetUrls(localPaths: string[]): string[] {
    return localPaths.map(getAssetUrl);
}

/**
 * Asset base URL for current environment
 */
export const ASSET_BASE_URL = isDevelopment || !CDN_URL
    ? '/assets'
    : `${CDN_URL}/${TENANT_ID}`;
