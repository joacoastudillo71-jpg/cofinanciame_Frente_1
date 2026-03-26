import { useAppStore, SectionId } from '../../store/useAppStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'wouter';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { getAssetUrl } from '../../lib/assetUrl';

// --- ICONOS DE NAVEGACIÓN QUIRÚRGICOS (100% HERENCIA) ---
const InicioIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number; strokeWidth?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" className="!opacity-100 !stroke-current" />
    <polyline points="9 22 9 12 15 12 15 22" className="!opacity-100 !stroke-current" />
  </svg>
);

const PlantasIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number; strokeWidth?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="12 2 2 7 12 12 22 7 12 2" className="!opacity-100 !stroke-current" />
    <polyline points="2 17 12 22 22 17" className="!opacity-100 !stroke-current" />
    <polyline points="2 12 12 17 22 12" className="!opacity-100 !stroke-current" />
  </svg>
);

const UbicacionIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number; strokeWidth?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" className="!opacity-100 !stroke-current" />
    <circle cx="12" cy="10" r="3" className="!opacity-100 !stroke-current" />
  </svg>
);

const RendersIcon = ({ size = 24, strokeWidth = 2, className }: { size?: number; strokeWidth?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" className="!opacity-100 !stroke-current" />
    <circle cx="9" cy="9" r="2" className="!opacity-100 !stroke-current" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" className="!opacity-100 !stroke-current" />
  </svg>
);

const Tour360Icon = ({ size = 24, strokeWidth = 2, className }: { size?: number; strokeWidth?: number; className?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" className="!opacity-100 !stroke-current" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" className="!opacity-100 !stroke-current" />
    <line x1="12" y1="22.08" x2="12" y2="12" className="!opacity-100 !stroke-current" />
  </svg>
);

export const Navigation = () => {
  const { currentSection, setSection, currentProject, exitProject } = useAppStore();

  const [, setLocation] = useLocation();

  const handleExit = () => {
    exitProject();
    setLocation('/');
  };

  const getNavItems = () => {
    const features = currentProject?.enabledFeatures;

    console.log("🚨 ASSETS DEL PROYECTO ACTUAL:", currentProject?.rawAssets);

    // VR 360 Validation
    const has360Views = currentProject?.rawAssets?.some(
      (asset: any) => asset.category === 'vr_view_360'
    );

    // Ubi 3D Map Validation
    const hasLocationAssets = currentProject?.rawAssets?.some(
      (asset: any) => asset.category?.startsWith('map_')
    );

    const items = [
      { id: 'hero', icon: InicioIcon, label: 'Inicio', enabled: true },
      { id: 'floors', icon: PlantasIcon, label: 'Plantas', enabled: features?.floors },
      { id: 'location', icon: UbicacionIcon, label: 'Ubicación', enabled: hasLocationAssets },
      { id: 'renders', icon: RendersIcon, label: 'Renders', enabled: features?.renders },
      { id: 'tour360', icon: Tour360Icon, label: '360°', enabled: has360Views },
    ];

    return items.filter(item => item.enabled) as { id: SectionId, icon: any, label: string }[];
  };

  const navItems = getNavItems();

  return (
    <motion.nav
      className="
        flex flex-row justify-around items-center 
        bg-black/90 backdrop-blur-xl border-t border-white/10
        px-2 pb-6 pt-3 md:p-4 
        md:flex-col md:justify-start md:pt-8 md:h-full md:w-24 md:border-t-0 md:border-r md:border-white/10 md:gap-8
        shadow-2xl z-50
        overflow-x-auto overflow-y-hidden whitespace-nowrap scrollbar-hide
      "
      initial={{ x: -100 }}
      animate={{ x: 0 }}
      role="navigation"
      aria-label="Menú principal del proyecto"
    >
      <button
        onClick={handleExit}
        className="hidden md:flex flex-col items-center gap-2 mb-4 group transition-all duration-300 hover:-translate-y-1"
        title="Volver a la selección de proyectos"
      >
        <div className="relative p-2">
          <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-0 group-hover:opacity-30 transition-opacity duration-500 rounded-full" />
          <img
            src={getAssetUrl("/assets/icon-mark.png")}
            alt="Cofinancia.me"
            className="w-10 h-10 object-contain relative z-10 drop-shadow-[0_0_10px_rgba(0,207,200,0.3)] group-hover:drop-shadow-[0_0_15px_rgba(0,207,200,0.6)] transition-all"
          />
        </div>
        <span className="text-[9px] uppercase tracking-widest text-white/40 group-hover:text-[#00BCD4] transition-colors opacity-0 group-hover:opacity-100 -mt-1">
          Salir
        </span>
      </button>

      <div className="hidden md:block w-8 h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent mb-2" />

      {/* 🚀 BOTÓN SALIR (LOGO) - SOLO MÓVIL (dentro del flex container de la barra inferior) */}
      <button
        onClick={handleExit}
        className="md:hidden flex flex-col items-center justify-center min-w-[64px] transition-all"
      >
        <div className="w-10 h-10 bg-[#1a1f2f] rounded-xl flex items-center justify-center mb-1 border border-white/5 relative">
          <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-20 rounded-full" />
          <img
            src={getAssetUrl("/assets/icon-mark.png")}
            alt="Salir"
            className="w-6 h-6 object-contain relative z-10 drop-shadow-[0_0_8px_rgba(0,188,212,0.4)]"
          />
        </div>
        <span className="text-[10px] font-bold tracking-wider text-[#00BCD4]">
          SALIR
        </span>
      </button>

      {navItems.map((item) => {
        const isActive = currentSection === item.id;
        return (
          <button
            key={item.id}
            onClick={() => {
              setSection(item.id);
              if (currentProject?.slug) {
                setLocation(`/${currentProject.slug}/${item.id}`);
              }
            }}
            className={`
              flex flex-col items-center gap-1 transition-all duration-300 group relative w-full
              ${isActive ? 'scale-105' : 'hover:scale-105'}
            `}
          >
            {/* ESTO ES LA BARRITA LATERAL ILUMINADA DE PRODUCCIÓN */}
            {isActive && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute -left-4 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#00BCD4] rounded-r-full shadow-[0_0_10px_#00BCD4] hidden md:block"
              />
            )}

            <div className={`
                p-3 rounded-2xl transition-all duration-300 flex items-center justify-center relative
                ${isActive
                ? 'bg-[#00BCD4]/10 shadow-[0_0_15px_rgba(0,188,212,0.1)]' 
                : 'bg-transparent group-hover:bg-white/5'}
            `}>
              <item.icon
                size={24}
                strokeWidth={isActive ? 2.5 : 1.5}
                className={`transition-all ${isActive ? 'text-[#00BCD4]' : 'text-white/70 group-hover:text-white'}`}
              />
            </div>

            <span className={`
              text-[10px] uppercase tracking-wider font-bold transition-all mt-1 duration-200
              ${isActive
                ? 'text-[#00BCD4] opacity-100' 
                : 'text-white/70 group-hover:text-white'}
            `}>
              {item.label}
            </span>
          </button>
        );
      })}
    </motion.nav>
  );
};