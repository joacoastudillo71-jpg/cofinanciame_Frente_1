import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Smartphone, RotateCw, Loader2 } from 'lucide-react';

// Componente de Rotación (Mantenido de tu código original)
const RotateDeviceHint = () => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const checkOrientation = () => {
      // Mostrar solo si es móvil Y está en vertical
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    return () => window.removeEventListener('resize', checkOrientation);
  }, []);

  if (!visible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={() => setVisible(false)}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/90 backdrop-blur-md text-white p-8 text-center cursor-pointer"
    >
      <div className="mb-8 relative">
        <motion.div
          animate={{ rotate: 90 }}
          transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut", repeatDelay: 1 }}
          className="origin-center"
        >
          <Smartphone size={64} className="text-white/80" />
        </motion.div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <RotateCw size={32} className="text-cyan-400 animate-pulse" />
        </div>
      </div>
      <h3 className="text-2xl font-bold mb-3">Mejor en Horizontal</h3>
      <p className="text-white/60 text-sm max-w-xs leading-relaxed">
        Gira tu dispositivo para disfrutar la experiencia inmersiva completa.
      </p>
      <span className="mt-12 text-xs text-cyan-400/50 uppercase tracking-widest animate-pulse">Toca para ignorar</span>
    </motion.div>
  );
};

export const IntroView = () => {
  const { setSection, setProject } = useAppStore();
  const currentProject = useCurrentProject();
  const videoSrc = currentProject?.assets.introVideo;

  // Estado para controlar la carga del video
  const [videoReady, setVideoReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);


  // Efecto para manejar la carga inicial sin flasheos
  useEffect(() => {
    if (videoRef.current) {
      // Resetear estado al montar
      setVideoReady(false);

      // Intentar cargar
      videoRef.current.load();
    }
  }, [videoSrc]); // Re-ejecutar si cambia el video

  // Efecto auxiliar para caso de proyectos sin assets multimedia pre-cargados
  useEffect(() => {
    if (!currentProject?.assets?.introVideo && !currentProject?.assets?.introImage) {
      const timer = setTimeout(() => setVideoReady(true), 500);
      return () => clearTimeout(timer);
    }
  }, [currentProject?.assets?.introVideo, currentProject?.assets?.introImage]);

  return (
    <div className="relative w-full h-full bg-black overflow-hidden">

      {/* 
         AVISO MÓVIL DESACTIVADO TEMPORALMENTE 
         Descomentar cuando la versión móvil horizontal esté lista
      */}
      {/* 
      <AnimatePresence>
        <RotateDeviceHint />
      </AnimatePresence>
      */}

      {/* --- PRELOADER DE MARCA (NUEVO) --- */}
      {/* Se muestra MIENTRAS el video no está listo (videoReady = false) */}
      <AnimatePresence mode='wait'>
        {!videoReady && (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0 z-50 bg-black flex flex-col items-center justify-center"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4], scale: [0.98, 1, 0.98] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <img
                src={currentProject?.assets.logo}
                alt="Cargando..."
                className="h-16 md:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
              />
            </motion.div>
            <div className="mt-6 flex items-center gap-2 text-[#00CFC8] text-xs tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(0,207,200,0.4)]">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Cargando Experiencia</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. VIDEO DE FONDO (Mejorado) */}
      <div className="absolute inset-0 w-full h-full">
        {currentProject?.assets?.introVideo ? (
          <video
            ref={videoRef}
            src={currentProject.assets.introVideo}
            className="w-full h-full object-cover opacity-60"
            muted playsInline autoPlay
            onLoadedData={() => setVideoReady(true)}
          />
        ) : currentProject?.assets?.introImage ? (
          <img
            src={currentProject.assets.introImage}
            alt="Intro Background"
            className="w-full h-full object-cover opacity-60"
            onLoad={() => setVideoReady(true)}
          />
        ) : (
          <div className="w-full h-full bg-[#020112]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020112] via-[#020112]/50 to-transparent opacity-90" />
      </div>

      {/* {/* 2. UI LAYER */}
      {/* Solo mostramos la UI cuando el video ya está listo para evitar saltos */}
      <AnimatePresence>
        {videoReady && (
          <>

            {/* 3. CONTENIDO CENTRAL */}
            <div className="absolute inset-0 flex flex-col items-center justify-center z-40 p-6">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                className="flex flex-col items-center w-full"
              >
                <div
                  className="
                    flex items-center justify-center mb-10
                    relative
                  "
                  style={{
                    filter: `drop-shadow(0 0 40px ${currentProject?.theme.primaryColor}40)`,
                  }}
                >
                  <img
                    src={currentProject?.assets.logo}
                    alt={`Bienvenido a ${currentProject?.name}`}
                    className={`
                      w-[80%] md:w-[70%] max-w-5xl ${currentProject?.ui?.logoSize || "max-h-64"}
                      object-contain 
                      filter drop-shadow-[0_0_25px_rgba(255,255,255,0.9)]
                    `}
                  />
                </div>

                <button
                  onClick={() => setSection('hero')}
                  className="
                    group relative px-10 py-3 
                    bg-white text-black font-bold rounded-full 
                    flex items-center justify-center gap-1.5
                    shadow-[0_0_20px_rgba(255,255,255,0.4)]
                    hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]
                    transition-all duration-300
                  "
                >
                  <span className="text-sm md:text-base">Entrar</span>
                  {/* Flecha tipográfica infalible */}
                  <span className="text-lg font-normal -mt-[2px] group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};