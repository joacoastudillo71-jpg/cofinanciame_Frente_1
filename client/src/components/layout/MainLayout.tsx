import React from 'react';
import { useAppStore, SectionId } from '../../store/useAppStore';
import { Navigation } from './Navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
  children: React.ReactNode;
  TopRightOverlay?: React.ReactNode;
  BottomRightOverlay?: React.ReactNode;
}

// FIX: Agregamos 'renders' para que el menú no desaparezca
const SECTIONS_WITH_NAV: SectionId[] = ['hero', 'floors', 'location', 'tour360', 'renders'];

export const MainLayout: React.FC<Props> = ({ children, TopRightOverlay, BottomRightOverlay }) => {
  const { currentSection, currentProject } = useAppStore();

  const hasProject = currentProject !== null;
  const isNavAllowed = SECTIONS_WITH_NAV.includes(currentSection);
  const showNavigation = hasProject && isNavAllowed;
  const showOverlays = showNavigation;

  return (
    <div className="relative w-full min-h-screen bg-black text-white font-sans">

      {/* CAPA DE CONTENIDO */}
      <main className="relative z-0 w-full h-full">
        {children}
      </main>

      {/* CAPA UI */}
      <div className="fixed inset-0 z-50 pointer-events-none h-[100dvh]">

        <AnimatePresence>
          {showNavigation && (
            <motion.div
              key="sidebar-nav"
              className="pointer-events-auto absolute bottom-0 w-full md:w-auto md:left-0 md:top-0 md:h-full z-50"
              initial={{ x: -100, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -100, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
                <Navigation />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showOverlays && (
            <>
              <motion.div 
                key="overlay-tr"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="absolute top-4 right-4 pointer-events-auto flex flex-col gap-4 items-end"
              >
                {TopRightOverlay}
              </motion.div>

              <motion.div 
                key="overlay-br"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute bottom-20 right-4 md:bottom-4 pointer-events-auto"
              >
                 {BottomRightOverlay}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};