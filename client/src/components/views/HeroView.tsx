import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { ChevronLeft, ChevronRight, MapPin, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { getAssetUrl } from '../../lib/assetUrl';

// ============================================================================
// 1. MOTOR DE VIDEO OPTIMIZADO (GARBAGE COLLECTION FORZADO)
// ============================================================================
const HeroVideoPlayer = ({
  src,
  onEnded,
  loop
}: {
  src: string;
  onEnded?: () => void;
  loop: boolean;
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Asignación de fuente vía JS para no atar el buffer al JSX de React
    video.src = src;
    video.load();

    // Autoplay preventivo con catch de errores silenciosos
    const playPromise = video.play();
    if (playPromise !== undefined) {
      playPromise.catch(e => console.warn("Autoplay preventivo manejado:", e));
    }

    // CLEANUP ESTRICTO: Destrucción total del nodo de video en memoria RAM
    return () => {
      video.pause();
      video.removeAttribute('src'); // Rompe el enlace al archivo físico
      video.srcObject = null;       // Destruye buffers de streaming si existieran
      video.load();                 // Obliga al motor de Chromium a vaciar la caché de este nodo
    };
  }, [src]);

  return (
    <video
      ref={videoRef}
      // NOTA ARQUITECTÓNICA: NO se usa el atributo src="" aquí. Todo se maneja en el useEffect.
      className="w-full h-full object-cover opacity-100"
      muted
      loop={loop}
      playsInline
      onEnded={onEnded}
    />
  );
};

export const HeroView = () => {
  const { exitProject } = useAppStore();
  const currentProject = useCurrentProject();
  
  // Transform DB mapped raw Assets into carousel items
  const rawAssets = currentProject?.rawAssets || [];
  const heroAssets = rawAssets
    .filter((a: any) => a.category === 'Video Hero Interior (.mp4) - Carrusel de inicio' || a.category === 'Render Hero Interior (.webp) - Carrusel estático de inicio')
    .map((a: any) => ({
      url: a.r2Url || a.url,
      type: a.category === 'Video Hero Interior (.mp4) - Carrusel de inicio' ? 'video' : 'image'
    }));

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isNavLocked, setIsNavLocked] = useState(false);

  const handleGoHome = () => {
    exitProject();
  };

  const nextSlide = useCallback(() => {
    if (!isNavLocked && heroAssets.length > 1) {
      setIsNavLocked(true);
      setCurrentIndex((prev) => (prev + 1) % heroAssets.length);
    }
  }, [isNavLocked, heroAssets.length]);

  const prevSlide = useCallback(() => {
    if (!isNavLocked && heroAssets.length > 1) {
      setIsNavLocked(true);
      setCurrentIndex((prev) => (prev - 1 + heroAssets.length) % heroAssets.length);
    }
  }, [isNavLocked, heroAssets.length]);

  // ============================================================================
  // 2. CICLO DE VIDA Y NAVEGACIÓN
  // ============================================================================
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isNavLocked || heroAssets.length <= 1) return;
      if (e.key === 'ArrowRight') nextSlide();
      if (e.key === 'ArrowLeft') prevSlide();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isNavLocked, heroAssets.length, nextSlide, prevSlide]);

  useEffect(() => {
    if (heroAssets.length <= 1) return;

    const intervalId = setInterval(() => {
      nextSlide();
    }, 12000);

    // Al cambiar el índice manualmente o desmontar, el timer se reinicia/limpia
    return () => clearInterval(intervalId);
  }, [currentIndex, heroAssets.length, nextSlide]);

  // ============================================================================
  // 3. RENDERIZADO VISUAL
  // ============================================================================
  return (
    <div className="absolute inset-0 w-full h-full bg-black overflow-hidden">
      {/* MOTOR DE RENDERIZADO AISLADO */}
      <div className="absolute inset-0 w-full h-full bg-[#020112]">
        <AnimatePresence
          initial={false}
          onExitComplete={() => setIsNavLocked(false)}
        >
          {heroAssets.length > 0 ? (
            <motion.div
              key={`asset-${currentIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
            >
              {heroAssets[currentIndex].type === 'video' ? (
                <HeroVideoPlayer
                  src={heroAssets[currentIndex].url}
                  onEnded={heroAssets.length > 1 ? nextSlide : undefined}
                  loop={heroAssets.length === 1}
                />
              ) : (
                <img
                  src={heroAssets[currentIndex].url}
                  alt={currentProject?.name || 'Project Background'}
                  className="w-full h-full object-cover opacity-100"
                />
              )}
            </motion.div>
          ) : (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 w-full h-full bg-black"
            />
          )}
        </AnimatePresence>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020112] via-[#020112]/20 to-transparent pointer-events-none" />
      </div>

      {/* CONTROLES */}
      {heroAssets.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            disabled={isNavLocked}
            className={cn(
              "absolute left-4 md:left-32 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer z-50",
              isNavLocked
                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/30 border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            )}
          >
            <ChevronLeft size={32} />
          </button>

          <button
            onClick={nextSlide}
            disabled={isNavLocked}
            className={cn(
              "absolute right-4 md:right-12 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-full backdrop-blur-md transition-all cursor-pointer z-50",
              isNavLocked
                ? "bg-white/5 border-white/5 text-white/20 cursor-not-allowed"
                : "bg-white/10 hover:bg-white/30 border border-white/20 text-white shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            )}
          >
            {isNavLocked ? <Lock size={24} className="animate-pulse opacity-50" /> : <ChevronRight size={32} />}
          </button>
        </>
      )}

      {/* TEXTOS / PROYECTO */}
      <div className="absolute bottom-28 left-6 md:bottom-12 md:left-32 z-20 pointer-events-none select-none">
        <motion.div
          key={currentProject?.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="flex flex-col items-start gap-2"
        >
          <div className="w-10 h-[2px] bg-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.8)] rounded-full"></div>
          <h1 className="text-base md:text-xl font-bold text-white tracking-[0.2em] uppercase drop-shadow-lg">
            {currentProject?.name}
          </h1>
          <div className="flex items-center gap-2 text-white/90 text-xs font-medium tracking-widest uppercase drop-shadow-md bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-[0_0_15px_rgba(0,0,0,0.3)]">
            <MapPin className="w-4 h-4 text-[#03fff6] [&_*]:!stroke-[#03fff6] drop-shadow-[0_0_6px_#03fff6]" />
            <span>Cuenca, Ecuador</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};