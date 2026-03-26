import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { Loader2, Navigation, Plus, Minus, RotateCcw, ExternalLink, AlertCircle } from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import Map3DViewer, { Map3DViewerHandle } from '../modules/location/Map3DViewer';

export const LocationView = () => {
  const currentProject = useCurrentProject();
  const locationConfig = currentProject?.assets?.location;
  const mapRef = useRef<Map3DViewerHandle>(null);
  const [activeView, setActiveView] = useState('Ciudad');

  const dynamicLocationAssets = useMemo(() => {
    const locationAssets = currentProject?.rawAssets?.filter(
      (asset: any) => asset.category.startsWith('map_') || asset.category === 'Modelo 3D Arquitectónico (.glb)' || (asset.r2Url || asset.url)?.toLowerCase().endsWith('.glb')
    ) || [];

    return locationAssets.map((asset: any) => {
      let label = asset.category;
      if (asset.category === 'map_city') label = 'Ciudad';
      if (asset.category === 'map_sector') label = 'Sector';
      if (asset.category === 'map_neighborhood') label = 'Barrio';
      if (asset.category === 'map_3d_model' || asset.category === 'Modelo 3D Arquitectónico (.glb)' || (asset.r2Url || asset.url)?.toLowerCase().endsWith('.glb')) label = 'Mapa 3D';

      return {
        id: asset.id.toString(),
        category: asset.category,
        label: label,
        url: asset.r2Url,
        ...asset
      };
    });
  }, [currentProject?.rawAssets]);

  const [currentMapId, setCurrentMapId] = useState<string>('');

  useEffect(() => {
    if (dynamicLocationAssets.length > 0 && !currentMapId) {
      setCurrentMapId(dynamicLocationAssets[0].id);
    }
  }, [dynamicLocationAssets, currentMapId]);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasError, setHasError] = useState(false);

  const activeAsset = dynamicLocationAssets.find(a => a.id === currentMapId) || dynamicLocationAssets[0];

  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform(0);
    }
    setHasError(false);
    setIsInitialLoad(true);
  }, [currentMapId]);

  const handleCameraMove = (view: string) => {
    setActiveView(view);
  };

  const handleMapLoad = React.useCallback(() => {
    setIsInitialLoad(false);
  }, []);

  if (!dynamicLocationAssets || dynamicLocationAssets.length === 0) return null;

  const is3D = activeAsset?.category === 'map_3d_model' || activeAsset?.category === 'Modelo 3D Arquitectónico (.glb)' || (activeAsset?.r2Url || activeAsset?.url)?.toLowerCase().endsWith('.glb');

  return (
    <div className="relative w-full h-full bg-gray-800 overflow-hidden font-sans">

      <div className="absolute inset-0 w-full h-full z-0 bg-gray-900">

        {is3D ? (
          <div className="w-full h-full">
            <Map3DViewer 
              ref={mapRef} 
              asset={activeAsset} 
              activeView={activeView} 
              onLoad={handleMapLoad} 
            />
          </div>
        ) : (
          <TransformWrapper
            ref={transformRef}
            initialScale={1}
            minScale={1}
            maxScale={4}
            centerOnInit={true}
            limitToBounds={true}
          >
            {({ zoomIn, zoomOut, resetTransform }) => (
              <>
                <div className="absolute top-1/2 -translate-y-1/2 right-4 z-40 pointer-events-auto flex flex-col gap-2 bg-neutral-900/90 p-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl">
                  <button onClick={() => zoomIn()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><Plus size={20} /></button>
                  <button onClick={() => zoomOut()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><Minus size={20} /></button>
                  <button onClick={() => resetTransform()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><RotateCcw size={20} /></button>
                </div>

                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full">
                  <div className="relative w-full h-full flex items-center justify-center">

                    {hasError && (
                      <div className="flex flex-col items-center text-white/50 gap-2">
                        <AlertCircle size={48} />
                        <p>Imagen no disponible</p>
                      </div>
                    )}

                    <img
                      src={activeAsset?.url}
                      alt={activeAsset?.label || 'Mapa'}
                      className={cn(
                        "w-full h-full object-cover",
                        hasError ? "hidden" : "block"
                      )}
                      onLoad={() => setIsInitialLoad(false)}
                      onError={() => {
                        setHasError(true);
                        setIsInitialLoad(false);
                      }}
                      draggable={false}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        )}
      </div>

      <div className="absolute inset-0 pointer-events-none z-10 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.5)_100%)]" />

      {/* NUEVA UI SUPERIOR - PÍLDORA CINEMATOGRÁFICA */}
      <div className="absolute top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex flex-col-reverse md:flex-row items-center gap-3 md:gap-4 w-[90%] md:w-auto justify-center pointer-events-auto">
        <div className="bg-[#1a1f2e]/90 backdrop-blur-md rounded-full p-1 flex items-center border border-white/10 shadow-2xl">
          {['Ciudad', 'Sector', 'Barrio'].map((view) => (
            <button
              key={view}
              onClick={() => handleCameraMove(view)}
              className={cn(
                "text-xs md:text-base px-3 md:px-6 py-1.5 md:py-2 rounded-full transition-all duration-300 transform",
                activeView === view 
                  ? "bg-white text-[#1a1f2e] font-bold shadow-lg scale-100" 
                  : "text-white/70 hover:text-white font-medium hover:scale-105"
              )}
            >
              {view}
            </button>
          ))}
        </div>

        <a
          href={`https://www.google.com/maps/dir/?api=1&destination=${activeAsset?.geoLat || -2.8974},${activeAsset?.geoLng || -79.0045}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#00BCD4] text-white text-sm md:text-base px-5 py-2 md:px-6 h-auto md:h-10 rounded-full font-bold flex items-center gap-2 shadow-xl hover:bg-[#00BCD4]/90 transition-all hover:scale-105 w-auto"
        >
          <Navigation size={16} className="-rotate-45" />
          <span>Cómo llegar</span>
          <ExternalLink size={12} className="opacity-80" />
        </a>
      </div>

      {isInitialLoad && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-50 pointer-events-none">
          <Loader2 className="w-10 h-10 text-[#00CFC8] animate-spin drop-shadow-[0_0_12px_rgba(0,207,200,0.6)]" />
        </div>
      )}
    </div>
  );
};
