import React, { useState, useEffect, useMemo } from 'react';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { Viewer360 } from '../modules/Viewer360';
import { Loader2, ChevronDown, Home, Check, AlertCircle, ChevronRight, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRoute, useLocation } from 'wouter';

export const Tour360View = () => {
  const currentProject = useCurrentProject();

  // 1. EXTRAER Y TRANSFORMAR DATOS DINÁMICOS
  const dynamicToursData = useMemo(() => {
    // Filtramos solo los assets de 360
    const vrAssets = currentProject?.rawAssets?.filter(
      (asset: any) => asset.category === 'vr_view_360'
    ) || [];

    if (vrAssets.length === 0) return [];

    // Agrupamos la data: vrCategory -> vrEntityName -> vrAreaName
    const categoriesMap = new Map();

    vrAssets.forEach((asset: any) => {
      // Usamos fallbacks por si el admin dejó algún campo vacío por error
      const catLabel = asset.vrCategory || 'General';
      const unitLabel = asset.vrEntityName || 'Unidad Principal';
      const sceneLabel = asset.vrAreaName || 'Vista Principal';

      if (!categoriesMap.has(catLabel)) {
        categoriesMap.set(catLabel, { id: catLabel, label: catLabel, unitsMap: new Map() });
      }

      const category = categoriesMap.get(catLabel);

      if (!category.unitsMap.has(unitLabel)) {
        category.unitsMap.set(unitLabel, { id: unitLabel, label: unitLabel, scenes: [] });
      }

      const unit = category.unitsMap.get(unitLabel);

      unit.scenes.push({
        id: asset.id.toString(),
        label: sceneLabel,
        image: asset.r2Url,
        imageFallback: asset.r2Url // Usamos la misma por defecto si no hay fallback
      });
    });

    // Convertimos los Maps a Arrays para el renderizado
    return Array.from(categoriesMap.values()).map((cat: any) => ({
      id: cat.id,
      label: cat.label,
      units: Array.from(cat.unitsMap.values()) as any[]
    }));
  }, [currentProject?.rawAssets]);

  const legacyUrl = currentProject?.assets?.tour360Url;

  const [activeCategory, setActiveCategory] = useState<any>(null);
  const [expandedUnitId, setExpandedUnitId] = useState<string | null>(null);
  const [activeScene, setActiveScene] = useState<any>(null);
  const [activeUnitLabel, setActiveUnitLabel] = useState<string>("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const [match, params] = useRoute("/:projectSlug/:section/:subId?");
  const [, setLocation] = useLocation();

  // Inicialización automática y Deep Linking
  useEffect(() => {
    if (dynamicToursData && dynamicToursData.length > 0) {
      const targetSceneId = params?.subId;
      let foundScene = false;

      if (targetSceneId) {
         for (const cat of dynamicToursData) {
            for (const unit of cat.units) {
               for (const scene of unit.scenes) {
                  if (scene.id.toLowerCase() === targetSceneId.toLowerCase()) {
                     setActiveCategory(cat);
                     setExpandedUnitId(unit.id);
                     setActiveScene(scene);
                     setActiveUnitLabel(unit.label);
                     foundScene = true;
                     break;
                  }
               }
               if (foundScene) break;
            }
            if (foundScene) break;
         }
      }

      // Fallback a inicialización por defecto si no hay match en la URL
      if (!foundScene && !activeScene) {
        const firstCat = dynamicToursData[0];
        setActiveCategory(firstCat);

        if (firstCat.units.length > 0) {
          const firstUnit: any = firstCat.units[0];
          setExpandedUnitId(firstUnit.id);
          setActiveUnitLabel(firstUnit.label);

          if (firstUnit.scenes.length > 0) {
            setActiveScene(firstUnit.scenes[0]);
          }
        }
      }
    }
  }, [dynamicToursData, params?.subId]);

  const handleSceneClick = (scene: any, unitLabel: string) => {
    setActiveScene(scene);
    setActiveUnitLabel(unitLabel);
    setIsMenuOpen(false);
    if (params?.projectSlug) {
      setLocation(`/${params.projectSlug}/tour360/${scene.id.toLowerCase()}`);
    }
  };

  // Fallbacks
  if (!dynamicToursData || dynamicToursData.length === 0) {
    if (legacyUrl) return <iframe src={legacyUrl} className="w-full h-full border-0" allowFullScreen />;
    return <div className="w-full h-full bg-gray-900 flex items-center justify-center text-white"><AlertCircle className="mr-2" /> Sin recorridos</div>;
  }

  if (!activeScene) {
    return <div className="w-full h-full bg-black flex items-center justify-center text-white"><Loader2 className="animate-spin mr-2 text-[#00CFC8] drop-shadow-[0_0_10px_rgba(0,207,200,0.6)]" /> Iniciando...</div>;
  }

  return (
    <div className="relative w-full h-full bg-gray-900">

      {/* 1. VISOR */}
      <div className="absolute inset-0 z-0">
        <Viewer360
          image={activeScene.image}
          fallbackImage={activeScene.imageFallback}
        />
      </div>

      {/* 2. HUD DE NAVEGACIÓN INTELIGENTE */}
      <div className="absolute top-4 left-4 md:left-28 z-20 max-w-[340px] w-[90%] md:w-full">
        <motion.button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          animate={{
            borderRadius: isMenuOpen ? "12px 12px 0 0" : "50px",
            backgroundColor: isMenuOpen ? "rgba(0,0,0,0.9)" : "rgba(0,0,0,0.6)"
          }}
          className="w-full flex items-center justify-between backdrop-blur-xl p-3 md:p-4 border border-white/10 text-white shadow-2xl ring-1 ring-white/5 group transition-all"
        >
          <div className="flex items-center gap-3 font-bold text-sm md:text-base truncate pr-2">
            <div className={`p-2 rounded-full transition-all duration-300 ${isMenuOpen ? 'bg-[#03fff6]/20 text-[#03fff6]' : 'bg-[#03fff6]/10 border border-[#03fff6]/20 shadow-[0_0_15px_rgba(3,255,246,0.3)] group-hover:bg-[#03fff6]/20'}`}>
              {isMenuOpen ? <Home className="w-5 h-5 text-[#03fff6] drop-shadow-[0_0_5px_#03fff6]" /> : <MapPin className="w-5 h-5 text-[#03fff6] [&_*]:!stroke-[#03fff6] drop-shadow-[0_0_8px_#03fff6]" />}
            </div>

            <div className="flex flex-col items-start text-left overflow-hidden">
              <span className="text-[9px] md:text-[10px] text-white/50 font-bold uppercase tracking-widest">
                {isMenuOpen ? 'Seleccionar Vista' : 'Ubicación Actual'}
              </span>
              <span className="truncate w-full font-bold text-sm md:text-base">
                {activeUnitLabel} <span className="text-white/40 mx-1">|</span> {activeScene.label}
              </span>
            </div>
          </div>

          <div className={`p-1 rounded-full ${isMenuOpen ? 'bg-white/10' : 'bg-transparent'}`}>
            <ChevronDown className={`transition-transform duration-300 text-white/70 ${isMenuOpen ? 'rotate-180' : ''}`} size={18} />
          </div>
        </motion.button>

        {/* CUERPO DEL MENÚ (Acordeón) */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: "circOut" }}
              className="bg-black/90 backdrop-blur-xl rounded-b-xl overflow-hidden shadow-2xl border border-t-0 border-white/10"
            >
              <div className="p-4 space-y-5 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* TABS: Categorías */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {dynamicToursData.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setActiveCategory(cat);
                        if (cat.units[0]) {
                          setExpandedUnitId(cat.units[0].id);
                        }
                      }}
                      className={`
                        whitespace-nowrap px-4 py-2 rounded-lg text-xs font-bold transition-all flex-shrink-0
                        ${activeCategory?.id === cat.id
                          ? 'bg-cyan-600 text-white shadow-lg'
                          : 'bg-white/10 text-white/70 hover:bg-white/20'}
                      `}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>

                {/* LISTA: Unidades */}
                {activeCategory && (
                  <div className="space-y-2">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold pl-1">
                      Unidades en {activeCategory.label}
                    </p>

                    {activeCategory.units.map((unit: any) => {
                      const isExpanded = expandedUnitId === unit.id;

                      return (
                        <div key={unit.id} className={`rounded-xl overflow-hidden border transition-colors ${isExpanded ? 'bg-white/5 border-white/10' : 'border-transparent'}`}>
                          <button
                            onClick={() => setExpandedUnitId(isExpanded ? null : unit.id)}
                            className="w-full text-left px-4 py-3 text-sm font-medium flex justify-between items-center text-white/90 hover:bg-white/5 transition-colors"
                          >
                            {unit.label}
                            <ChevronRight size={16} className={`text-white/40 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                          </button>

                          {isExpanded && (
                            <div className="bg-black/20 border-t border-white/5 p-2 space-y-1">
                              {unit.scenes.map((scene: any) => {
                                const isActive = activeScene?.id === scene.id && activeUnitLabel === unit.label;
                                return (
                                  <button
                                    key={scene.id}
                                    onClick={() => handleSceneClick(scene, unit.label)}
                                    className={`
                                      w-full text-left px-3 py-2.5 rounded-lg text-xs flex items-center gap-3 transition-all
                                      ${isActive
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'text-white/60 hover:text-white hover:bg-white/10 border border-transparent'}
                                    `}
                                  >
                                    <div className={`w-4 h-4 flex-shrink-0 flex items-center justify-center rounded-full ${isActive ? 'bg-cyan-500 text-black' : 'bg-white/10'}`}>
                                      {isActive ? <Check size={10} strokeWidth={4} /> : <div className="w-1 h-1 bg-white/50 rounded-full" />}
                                    </div>
                                    {scene.label}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};