import React, { useEffect, useRef } from 'react';
import { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface Props {
  image: string;
  fallbackImage?: string;
}

export const Viewer360: React.FC<Props> = ({ image, fallbackImage }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewerRef = useRef<Viewer | null>(null);

  // Referencia para cancelar cargas obsoletas si el usuario cambia rápido
  const currentImageRef = useRef<string | null>(null);

  // 1. INICIALIZACIÓN DEL MOTOR (Solo motor, sin imagen aún)
  useEffect(() => {
    if (!containerRef.current) return;

    const viewer = new Viewer({
      container: containerRef.current,
      // IMPORTANTE: No pasamos 'panorama' aquí.
      // Dejamos que el useEffect de abajo maneje TODAS las cargas.
      panorama: null, 
      defaultZoomLvl: 50,
      minFov: 30,
      maxFov: 90,
      navbar: false,
      withCredentials: false, // Forzar crossOrigin: 'anonymous'
      requestHeaders: (url) => ({}), // Asegura que las cabeceras se manejen correctamente
      touchmoveTwoFingers: false,
      loadingTxt: 'Cargando entorno...',
      mousewheel: false,
    });

    viewerRef.current = viewer;

    // Listener de seguridad por si acaso falla algo interno
    // @ts-ignore - El evento 'error' existe en runtime pero falta en los tipos oficiales de la versión actual
    viewer.addEventListener('error', (e: any) => {
      console.warn("PSV Error Interno:", e);
    });

    return () => {
      viewer.destroy();
      viewerRef.current = null;
    };
  }, []); 

  // 2. TUBERÍA DE CARGA UNIFICADA (Maneja Primera Carga y Cambios)
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    // 🛠️ FIX CORS: Envolvemos URLs externas en nuestro proxy local
    const getSafeUrl = (url: string) => {
      if (!url) return url;
      return url.startsWith('http') 
        ? `/api/proxy/image?url=${encodeURIComponent(url)}` 
        : url;
    };

    const safeImage = getSafeUrl(image);
    const safeFallback = fallbackImage ? getSafeUrl(fallbackImage) : undefined;

    // Si la imagen procesada es la misma que ya tiene el visor cargada o cargando, no hacemos nada.
    if (currentImageRef.current === safeImage) return;

    // Actualizamos referencia
    currentImageRef.current = safeImage;

    viewer.setPanorama(safeImage, { 
      transition: false,
      showLoader: true 
    })
    .then(() => {
      // Éxito en la carga
    })
    .catch((err: any) => {
      console.warn("Fallo carga principal (WebP), intentando fallback...", err);

      // Verificamos si sigue siendo la imagen solicitada antes de aplicar fallback
      if (currentImageRef.current === safeImage && safeFallback) {
         //@ts-ignore
         viewer.setPanorama(safeFallback, { transition: false, showLoader: true })
           .catch((e: any) => console.error("Fallback también falló:", e));
      }
    });

  }, [image, fallbackImage]);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full cursor-move" 
      style={{ width: '100%', height: '100%' }} 
      aria-label="Visor 360 grados" 
    />
  );
};