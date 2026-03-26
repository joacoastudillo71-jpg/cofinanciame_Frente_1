import React, { lazy, Suspense } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { AnimatePresence, motion } from 'framer-motion';
import { ErrorBoundary } from '../common/ErrorBoundary';
import { useRoute, useLocation } from 'wouter';

// Code-Splitting: Lazy loading para reducir el tamaño del bundle inicial
const HomeView = lazy(() => import('../views/HomeView').then(module => ({ default: module.HomeView })));
const IntroView = lazy(() => import('../views/IntroView').then(module => ({ default: module.IntroView })));
const FloorsView = lazy(() => import('../views/FloorsView').then(module => ({ default: module.FloorsView })));
const HeroView = lazy(() => import('../views/HeroView').then(module => ({ default: module.HeroView })));
const LocationView = lazy(() => import('../views/LocationView').then(module => ({ default: module.LocationView })));
const Tour360View = lazy(() => import('../views/Tour360View').then(module => ({ default: module.Tour360View })));
const RenderView = lazy(() => import('../views/RenderView').then(module => ({ default: module.RenderView })));

interface PreviewShowcaseProps {
  project: import('../../config/types').ProjectConfig;
  onBack: () => void;
}

const PreviewShowcase = lazy<React.FC<PreviewShowcaseProps>>(() => 
  import('../views/PreviewShowcase').then(module => ({ default: module.PreviewShowcase }))
);

export const ShowcaseEngine = () => {
  const { currentSection, currentProject, exitProject, isLoading, error, setProject, setSection } = useAppStore();
  const [, setLocation] = useLocation();

  const handleExit = () => {
    exitProject();
    setLocation('/');
  };

  const [matchProject3, params3] = useRoute("/:projectSlug/:section/:subId");
  const [matchProject2, params2] = useRoute("/:projectSlug/:section?");
  
  const matchProject = matchProject3 || matchProject2;
  const params = matchProject3 ? params3 : params2;
  const [matchHome] = useRoute("/");

  React.useEffect(() => {
    // 🛡️ REBOUND SHIELD: Si el destino es el Home, reseteamos y salimos inmediatamente
    if (matchHome) {
      const currentStoreSection = useAppStore.getState().currentSection;
      if (currentStoreSection !== 'home') {
        exitProject();
      }
      return; // No procesar nada más si estamos en Home
    }

    if (matchProject && params?.projectSlug) {
      const currentSlug = useAppStore.getState().currentProject?.slug;
      if (currentSlug !== params.projectSlug) {
         setProject({ slug: params.projectSlug } as any);
      }
      
      // CRITICAL FIX: Retrasar selección estricta hasta pasar estado de carga (Hydration)
      if (!isLoading || currentSlug === params.projectSlug) {
        const targetSection = params.section || 'intro';
        const currentStoreSection = useAppStore.getState().currentSection;
        if (currentStoreSection !== targetSection) {
           setSection(targetSection as any);
        }
      }
    }
  }, [matchProject, params?.projectSlug, params?.section, matchHome, setProject, setSection, exitProject, isLoading]);

  // Aislamiento de Errores y Loading
  if (isLoading && currentSection !== 'home') {
    return (
      <div className="flex items-center justify-center h-screen w-full bg-slate-900 text-slate-100">
        <p className="animate-pulse text-lg font-medium tracking-wide">Sincronizando con Base de Datos...</p>
      </div>
    );
  }

  if ((error || !currentProject) && currentSection !== 'home') {
    return (
      <div className="flex flex-col items-center justify-center h-screen w-full bg-slate-900 text-red-400 p-6 text-center">
        <span className="text-4xl mb-4">⚠️</span>
        <p className="text-xl font-semibold">Error Crítico de Conexión</p>
        <p className="text-sm mt-2 opacity-80">{error || 'Proyecto no encontrado'}</p>
        <button onClick={() => exitProject()} className="mt-6 px-4 py-2 border border-red-500 rounded text-red-500 hover:bg-red-500/10">Volver al Inicio</button>
      </div>
    );
  }

  const handleRecover = () => {
    exitProject();
  };

  const renderView = () => {
    if (currentSection === 'home') return <HomeView />;
    if (!currentProject) return null;

    // INYECCIÓN FASE 4: Si el proyecto es un preview, mostramos la nueva Landing vertical
    if (currentProject.isPreview) {
        return <PreviewShowcase project={currentProject} onBack={exitProject} />;
    }

    switch (currentSection) {
      case 'intro': return <IntroView />;
      case 'hero': return <HeroView />;
      case 'location': return <LocationView />;
      case 'floors': return <FloorsView />;
      case 'tour360': return <Tour360View />;
      case 'renders': return <RenderView />;
      default: return <HomeView />;
    }
  };

  const isHome = currentSection === 'home';

  const containerClass = isHome
    ? "relative w-full min-h-screen z-10"
    : "fixed inset-0 w-full h-full overflow-hidden z-20 bg-black";

  const pageVariants = {
    initial: { opacity: 0, zIndex: 20 },
    animate: { opacity: 1, zIndex: 20, transition: { duration: 0.4, ease: "easeOut" } },
    exit: { opacity: 0, zIndex: 0, pointerEvents: "none" as const, transition: { duration: 0.3, ease: "easeIn" } }
  };

  return (
    <ErrorBoundary onReset={handleRecover}>
      <div className="fixed inset-0 bg-black -z-10" />

      <Suspense fallback={
        <div className="flex items-center justify-center h-screen w-full bg-[#020112] text-slate-300">
          <span className="animate-pulse text-sm font-medium tracking-widest uppercase flex items-center gap-2">
            <svg className="animate-spin h-4 w-4 text-slate-300" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Cargando módulos...
          </span>
        </div>
      }>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className={containerClass}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </Suspense>
    </ErrorBoundary>
  );
};