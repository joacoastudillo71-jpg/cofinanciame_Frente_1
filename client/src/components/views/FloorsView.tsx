import React, { useEffect, useState, useRef, useMemo } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { FloorUnit } from '../../config/types';
import { Loader2, Plus, Minus, RotateCcw, X, Home, Sun, Maximize, BedDouble, Bath, Car, MessageCircle, Store, Warehouse, Layers, BoxSelect, ArrowDownRight, ArrowUpRight, CheckCircle2, Clock, XCircle } from 'lucide-react';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { cn } from '@/lib/utils';
import { LeadCaptureModal } from '../modules/leads/LeadCaptureModal';
import { useRoute, useLocation } from 'wouter';

export const FloorsView = () => {
  const currentProject = useCurrentProject();

  const unifiedFloors = useMemo(() => {
    if (!currentProject?.rawAssets) return [];

    const floorsMap = new Map<string, any>();

    const getFloorKey = (label: string) => {
      const up = label.trim().toUpperCase();
      if (up.includes('PB') || up === 'PLANTA BAJA') return '1';
      const match = up.match(/\d+/);
      return match ? match[0] : up;
    };

    currentProject.rawAssets.forEach((asset: Record<string, any>) => {
      if (!asset.label) return;

      const floorKey = getFloorKey(asset.label);

      if (asset.category === 'Plano Base (.webp)' || asset.category === 'Capa Interactiva (.svg)') {
        if (!floorsMap.has(floorKey)) {
          floorsMap.set(floorKey, {
            id: floorKey,
            label: asset.label.trim(),
            baseImage: null,
            interactiveLayer: null,
            units: currentProject.units || []
          });
        }

        const floorEntry = floorsMap.get(floorKey);
        if (asset.category === 'Plano Base (.webp)') {
          floorEntry.baseImage = asset;
        } else if (asset.category === 'Capa Interactiva (.svg)') {
          floorEntry.interactiveLayer = asset;
        }
      }
    });

    const parsedFloors = Array.from(floorsMap.values()).filter(floor => floor.baseImage);

    // Sort floors descending by numerical value
    return parsedFloors.sort((a, b) => {
      const valA = isNaN(Number(a.id)) ? 0 : Number(a.id);
      const valB = isNaN(Number(b.id)) ? 0 : Number(b.id);
      return valB - valA;
    });
  }, [currentProject?.rawAssets, currentProject?.units]);

  const { isLoading } = useAppStore();
  const [currentFloorId, setFloorState] = useState<string | number | null>(null);

  const [match, params] = useRoute("/:projectSlug/:section/:subId?");
  const [, setLocation] = useLocation();

  const setFloor = (id: string | number) => {
    setFloorState(id);
    if (params?.projectSlug) {
      setLocation(`/${params.projectSlug}/floors/${String(id).toLowerCase()}`);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (unifiedFloors.length > 0) {
      const targetId = params?.subId ? decodeURIComponent(params.subId).toUpperCase() : null;
      
      const floorFromUrl = targetId ? unifiedFloors.find(f => {
        const fid = String(f.id).toUpperCase();
        return fid === targetId || fid.replace(/[^A-Z0-9]/g, '') === targetId.replace(/[^A-Z0-9]/g, '');
      }) : null;
      
      if (floorFromUrl) {
        if (currentFloorId !== floorFromUrl.id) setFloorState(floorFromUrl.id);
      } else if (!currentFloorId && !params?.subId) {
        // PROTECCIÓN ESTRICTA: Solo hacer fallback a PB si verdaderamente no hay intento de subId en URL
        setFloorState(unifiedFloors[0].id);
      }
    }
  }, [unifiedFloors, params?.subId, isLoading]);

  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [liveUnits, setLiveUnits] = useState<FloorUnit[]>([]);
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  useEffect(() => {
    if (currentProject?.id) {
      fetch(`/api/projects/${currentProject.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.units) setLiveUnits(data.units);
        })
        .catch((err) => console.error('Error al recuperar estado híbrido:', err));
    }
  }, [currentProject?.id]);

  const [svgContent, setSvgContent] = useState<string | null>(null);
  const [svgViewBox, setSvgViewBox] = useState<string>("0 0 1920 1080");
  const [selectedUnit, setSelectedUnit] = useState<FloorUnit | null>(null);

  interface LabelData {
    id: string;
    x: number;
    y: number;
    primaryText: string;
    secondaryText?: string;
  }
  const [labels, setLabels] = useState<LabelData[]>([]);
  const activeFloor = unifiedFloors.find(f => f.id === currentFloorId) || unifiedFloors[0];

  const dynamicFontSize = useMemo(() => {
    const parts = svgViewBox.split(' ').map(Number);
    if (parts.length === 4 && parts[2] > 0) {
      return Math.max(16, parts[2] * 0.013);
    }
    return 24;
  }, [svgViewBox]);

  const interactiveStyles = useMemo(() => {
    const hasUnits = liveUnits && liveUnits.length > 0;
    const allIds = hasUnits ? liveUnits.map((u: FloorUnit) => u.identifier || u.id) : [];
    const pointerSelectors = allIds.map((id: string | number) => `[id="${id}"]`).join(', ');

    return `
      .interactive-svg-layer { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
      .interactive-svg-layer svg { width: 100%; height: 100%; max-width: 100%; max-height: 100%; object-fit: contain; pointer-events: none; }
      
      /* Polígonos base: transparentes, pero NO los interactivos */
      .interactive-svg-layer svg path, .interactive-svg-layer svg rect, .interactive-svg-layer svg polygon, .interactive-svg-layer svg circle, .interactive-svg-layer svg ellipse, .interactive-svg-layer svg polyline, .interactive-svg-layer svg line, .interactive-svg-layer svg g { 
        fill: transparent !important; 
        stroke: transparent !important; 
        pointer-events: none; 
      }
      
      ${hasUnits ? `
        /* Otorga 'cuerpo' invisible a las unidades registradas para que el mouse las detecte */
        ${pointerSelectors} { 
          pointer-events: auto !important; 
          cursor: pointer !important; 
          fill: rgba(255, 255, 255, 0.01) !important; /* Capa fantasma para el hover */
          stroke: transparent !important; 
          opacity: 1 !important; /* Aseguramos que CSS mande sobre cualquier opacidad residual */
          transition: all 0.25s ease !important; 
        }
        
        /* Lógica de colores de disponibilidad (Hover) */
        ${liveUnits.map((unit: FloorUnit) => {
      let hoverFill = 'rgba(0, 207, 200, 0.5)'; // Cian por defecto
      let hoverStroke = '#00CFC8';
      const status = typeof unit.status === 'string' ? unit.status.toLowerCase() : '';

      if (status === 'disponible' || status === 'available') { hoverFill = 'rgba(34, 197, 94, 0.6)'; hoverStroke = '#22c55e'; }
      else if (status === 'reservado' || status === 'reserved') { hoverFill = 'rgba(234, 179, 8, 0.6)'; hoverStroke = '#eab308'; }
      else if (status === 'vendido' || status === 'sold') { hoverFill = 'rgba(239, 68, 68, 0.6)'; hoverStroke = '#ef4444'; }

      return `[id="${unit.identifier}"]:hover, [id="${unit.identifier}"]:hover * { fill: ${hoverFill} !important; stroke: ${hoverStroke} !important; stroke-width: 2px !important; filter: drop-shadow(0 0 10px ${hoverFill}); }`;
        }).join('\n')}
      ` : ''
    }

      /* Lógica de unidad seleccionada (Click) */
      ${selectedUnit ? `[id="${selectedUnit?.identifier || selectedUnit?.id}"], [id="${selectedUnit?.identifier || selectedUnit?.id}"] * { fill: rgba(0, 207, 200, 0.6) !important; stroke: #00CFC8 !important; stroke-width: 3px !important; filter: drop-shadow(0 0 15px rgba(0,207,200, 0.8)); }` : ''}
    `;
  }, [selectedUnit, liveUnits]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const currentIndex = unifiedFloors.findIndex(f => f.id === currentFloorId);
      if (currentIndex === -1) return;
      if (e.key === 'ArrowUp' && currentIndex > 0) setFloor(unifiedFloors[currentIndex - 1].id);
      if (e.key === 'ArrowDown' && currentIndex < unifiedFloors.length - 1) setFloor(unifiedFloors[currentIndex + 1].id);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFloorId, unifiedFloors]);



  useEffect(() => {
    if (transformRef.current) {
      transformRef.current.resetTransform(0);
      setHasError(false);
      setSelectedUnit(null);
      setLabels([]);
      setSvgContent(null);
    }
    const svgUrl = activeFloor?.interactiveLayer?.r2Url || activeFloor?.interactiveLayer?.url;
    if (svgUrl) {
      fetch(svgUrl)
        .then(res => res.text())
        .then(text => {
          const viewBoxMatch = text.match(/viewBox=['"]([^'"]*)['"]/i);
          if (viewBoxMatch && viewBoxMatch[1]) {
            setSvgViewBox(viewBoxMatch[1]);
          } else {
            const widthMatch = text.match(/width=['"](\d+)[^'"]*['"]/i);
            const heightMatch = text.match(/height=['"](\d+)[^'"]*['"]/i);
            if (widthMatch && heightMatch) {
              setSvgViewBox(`0 0 ${widthMatch[1]} ${heightMatch[1]}`);
            }
          }

          // LIMPIEZA ABSOLUTA: En lugar de forzar "0", eliminamos los atributos
          // para que el CSS !important tome el control total.
          const cleanSvg = text
            .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
            .replace(/<svg([^>]+)>/i, '<svg$1 preserveAspectRatio="xMidYMid meet">')
            .replace(/width=['"][^'"]*['"]/gi, 'width="100%"')
            .replace(/height=['"][^'"]*['"]/gi, 'height="100%"')
            .replace(/style=['"][^'"]*['"]/gi, '')
            .replace(/class=['"][^'"]*['"]/gi, '')
            .replace(/isolation=['"][^'"]*['"]/gi, '')
            .replace(/opacity=['"][^'"]*['"]/gi, '')
            .replace(/fill-opacity=['"][^'"]*['"]/gi, '')
            .replace(/fill=['"][^'"]*['"]/gi, '')
            .replace(/stroke=['"][^'"]*['"]/gi, '');

          setSvgContent(cleanSvg);
        })
        .catch(() => setSvgContent(null));
    } else {
      setSvgContent(null);
    }
  }, [currentFloorId, currentProject?.id, activeFloor]);

  useEffect(() => {
    if (svgContent) {
      const timer = setTimeout(() => {
        const container = document.querySelector('.interactive-svg-layer svg');
        if (!container || !liveUnits || liveUnits.length === 0) return;
        const newLabels: LabelData[] = [];
        liveUnits.forEach((unit: FloorUnit) => {
          const svgId = unit.identifier || unit.id;
          const element = document.getElementById(String(svgId));
          if (element instanceof SVGGraphicsElement) {
            // --- INYECCIÓN DINÁMICA DE ESTILOS (STATUS-ON-HOVER) ---
            const status = typeof unit.status === 'string' ? unit.status.toLowerCase() : '';
            const isSelected = selectedUnit?.identifier === unit.identifier || selectedUnit?.id === unit.id;
            
            // Colores de estado (Hover) - Efecto "Cristal Tintado" (Alpha 0.25)
            let hoverColor = 'rgba(34, 197, 94, 0.25)'; // Verde
            if (status === 'reservado' || status === 'reserved') hoverColor = 'rgba(234, 179, 8, 0.25)'; // Amarillo
            else if (status === 'vendido' || status === 'sold') hoverColor = 'rgba(239, 68, 68, 0.25)'; // Rojo

            const selectColor = 'rgba(0, 207, 200, 0.35)'; // Cian (Selección)
            const selectGlow = 'drop-shadow(0 0 15px rgba(0, 207, 200, 0.8))';

            // ESTADO INICIAL: Transparente (o Cian si está seleccionado)
            element.style.setProperty('fill', isSelected ? selectColor : 'transparent', 'important');
            element.style.setProperty('filter', isSelected ? selectGlow : 'none', 'important');
            element.style.setProperty('transition', 'fill 0.3s ease, filter 0.3s ease', 'important');
            element.style.setProperty('pointer-events', 'auto', 'important');
            element.style.setProperty('cursor', 'pointer', 'important');

            // Handlers de hover
            element.onmouseenter = () => {
              element.style.setProperty('fill', hoverColor, 'important');
              element.style.setProperty('filter', 'drop-shadow(0 0 10px ' + hoverColor + ')', 'important');
            };
            element.onmouseleave = () => {
              // Re-verificar si sigue seleccionado después del hover
              const stillSelected = selectedUnit?.identifier === unit.identifier || selectedUnit?.id === unit.id;
              element.style.setProperty('fill', stillSelected ? selectColor : 'transparent', 'important');
              element.style.setProperty('filter', stillSelected ? selectGlow : 'none', 'important');
            };

            try {
              const bbox = element.getBBox();
              if (bbox.width > 0 && bbox.height > 0) {
                const displayLabel = unit.label || unit.identifier || '';
                const cleanLabel = displayLabel.replace(/^(Local|Departamento|Suite|Oficina|Penthouse-Dúplex|Estudio|Monoambiente|Bodega|Parqueo)\s*/i, '');
                const parts = cleanLabel.match(/^(\d+)\s+(.+)$/);
                if (parts) newLabels.push({ id: String(svgId), x: bbox.x + (bbox.width / 2), y: bbox.y + (bbox.height / 2), primaryText: parts[1], secondaryText: parts[2] });
                else newLabels.push({ id: String(svgId), x: bbox.x + (bbox.width / 2), y: bbox.y + (bbox.height / 2), primaryText: cleanLabel });
              }
            } catch (e) { }
          }
        });
        setLabels(newLabels);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [svgContent, currentFloorId, activeFloor, liveUnits, selectedUnit]);

  const handleSvgClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as Element;
    const elementId = target.id || target.closest('[id]')?.id;
    if (elementId && liveUnits.length > 0) {
      const unitData = liveUnits.find((u: FloorUnit) => String(u.identifier || u.id) === elementId);
      if (unitData) {
        e.stopPropagation();
        e.preventDefault();

        const dbUnit = liveUnits.find(u => u.identifier === elementId);
        let finalUnitData: FloorUnit = { ...unitData };

        if (dbUnit) {
          const statusMap: Record<string, FloorUnit['status']> = { 
            'Disponible': 'available', 
            'Reservado': 'reserved', 
            'Vendido': 'sold' 
          };
          
          finalUnitData = {
            ...unitData,
            status: (dbUnit.status && statusMap[dbUnit.status as keyof typeof statusMap]) || unitData.status,
            price: dbUnit.price ? Number(dbUnit.price) : undefined,
            label: dbUnit.label || unitData.label,
            type: dbUnit.type || unitData.type,
            area: dbUnit.area,
            storageCount: dbUnit.storageCount,
            storageArea: dbUnit.storageArea,
            isDuplex: dbUnit.isDuplex,
            duplexLevel: dbUnit.duplexLevel
          };

          if (dbUnit.isDuplex && dbUnit.label) {
            const twinUnits = liveUnits.filter(u => u.label === dbUnit.label);
            if (twinUnits.length > 0) {
              const areaHabitableTotal = twinUnits.reduce((sum, u) => sum + Number(u.habitableArea || 0) + Number(u.terraceArea || 0), 0);
              let maxPrice = 0;
              twinUnits.forEach(t => {
                const p = Number(t.price) || 0;
                if (p > maxPrice) maxPrice = p;
              });
              finalUnitData.duplexTotalStats = { 
                areaInterior: "0", // Mandatory per UnitStats if not optional
                areaHabitableTotal: areaHabitableTotal.toFixed(2) 
              };
              if (maxPrice > 0) finalUnitData.price = maxPrice;
            }
          }
          finalUnitData.stats = finalUnitData.stats || { areaInterior: "0" };
          finalUnitData.stats.storage = (dbUnit.storageCount ?? 0) > 0 ? `${dbUnit.storageCount} (${dbUnit.storageArea || 0} m²)` : undefined;
        }
        setSelectedUnit(finalUnitData);
      }
    }
  };

  if (!activeFloor) return null;

  return (
    <div className="relative w-full h-full bg-gray-900 overflow-hidden">
      <style>{interactiveStyles}</style>
      <style>{`.unit-label-text { font-family: 'Inter', system-ui, sans-serif; text-anchor: middle; dominant-baseline: middle; pointer-events: none; fill: white; text-shadow: 0 2px 4px rgba(0,0,0,0.9), 0 0 12px rgba(0,0,0,0.6), 0 0 20px rgba(0,0,0,0.4); transition: opacity 0.3s ease; letter-spacing: -0.02em; } .unit-label-primary { font-weight: 700; font-size: ${dynamicFontSize}px; } .unit-label-secondary { font-weight: 500; font-size: ${dynamicFontSize * 0.55}px; fill: #f5f5f5; text-shadow: 0 2px 4px rgba(0,0,0,0.95); }`}</style>
      <div className="hidden" aria-hidden="true">
        {unifiedFloors.map((floor) => (
          <img key={`preload-${floor.id}`} src={floor.baseImage?.r2Url || floor.baseImage?.url} alt="preload" />
        ))}
      </div>

      <div className="absolute top-4 right-4 md:top-8 md:right-8 z-50 pointer-events-auto flex flex-col gap-2 bg-[#1a1f2e]/80 p-2 rounded-full backdrop-blur-md border border-white/10 shadow-xl transition-all">
        <button onClick={() => transformRef.current?.zoomIn()} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"><Plus size={20} /></button>
        <button onClick={() => transformRef.current?.zoomOut()} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"><Minus size={20} /></button>
        <button onClick={() => transformRef.current?.resetTransform()} className="p-2 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all"><RotateCcw size={20} /></button>
      </div>

      <div className="absolute inset-0 w-full h-full z-0">
        <TransformWrapper ref={transformRef} initialScale={1} minScale={1} maxScale={6} centerOnInit limitToBounds wheel={{ step: 0.2 }}>
          <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
            <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-900/50 rounded-xl border border-slate-800 shadow-2xl">

              <div className="relative flex-none" style={{ maxWidth: '100%', maxHeight: '100%' }}>
                <img
                  src={activeFloor.baseImage?.r2Url || activeFloor.baseImage?.url}
                  alt={activeFloor.label}
                  className={cn("block w-auto h-auto max-w-full max-h-[85vh] object-contain select-none pointer-events-none", hasError ? "hidden" : "block")}
                  onLoad={() => setIsInitialLoad(false)}
                  onError={() => { setHasError(true); setIsInitialLoad(false); }}
                  draggable={false}
                />
                {!hasError && svgContent && (
                  <div
                    className="absolute inset-0 w-full h-full pointer-events-none interactive-svg-layer csm-interactive-floor-map"
                    style={{ zIndex: 10 }}
                    dangerouslySetInnerHTML={{ __html: svgContent }}
                    onClick={handleSvgClick}
                  />
                )}
                {!hasError && labels.length > 0 && (
                  <svg className="absolute inset-0 w-full h-full pointer-events-none unit-label-layer" viewBox={svgViewBox} preserveAspectRatio="xMidYMid meet" style={{ zIndex: 20 }}>
                    {labels.map(label => (
                      <text key={`label-${label.id}`} x={label.x} y={label.y} className="unit-label-text">
                        {label.secondaryText ? (<><tspan x={label.x} dy="-0.65em" className="unit-label-primary">{label.primaryText}</tspan><tspan x={label.x} dy="1.45em" className="unit-label-secondary">{label.secondaryText}</tspan></>) : (<tspan className="unit-label-primary" fontSize={`${dynamicFontSize}px`}>{label.primaryText}</tspan>)}
                      </text>
                    ))}
                  </svg>
                )}
              </div>

            </div>
          </TransformComponent>
        </TransformWrapper>
      </div>

      <nav className="absolute z-40 bottom-28 left-1/2 -translate-x-1/2 md:bottom-auto md:top-1/2 md:-translate-y-1/2 md:left-28 md:translate-x-0">
        <div className="flex md:flex-col items-center gap-2 p-2 bg-black/60 backdrop-blur-xl border border-white/10 rounded-full shadow-2xl overflow-y-auto max-h-[60vh] custom-scrollbar pointer-events-auto">
          {unifiedFloors.map((floor) => {
            let displayLabel = floor.label;
            const up = displayLabel.toUpperCase();
            if (up.includes('PB')) {
              displayLabel = '1';
            } else {
              const match = up.match(/\d+/);
              displayLabel = match ? match[0] : displayLabel.replace(/^(Piso|Nivel|Planta)\s*/i, '').substring(0, 3);
            }
            return (
              <button 
                key={floor.id} 
                onClick={() => setFloor(floor.id)} 
                className={cn(
                  "w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full flex items-center justify-center text-sm md:text-base font-bold transition-all duration-150 relative z-10", 
                  currentFloorId === floor.id 
                    ? 'bg-[#00BCD4] text-white border-[#00BCD4] shadow-[0_0_15px_rgba(0, 188, 212, 0.4)] scale-110' 
                    : 'text-white/60 bg-white/5 border border-transparent hover:border-white/20 hover:text-white hover:bg-white/10 transition-all'
                )}
              >
                {displayLabel}
              </button>
            );
          })}
        </div>
      </nav>

      <div className="absolute top-4 left-4 md:left-28 z-30 pointer-events-none">
        <div className="bg-black/40 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-xl shadow-lg">
          <span className="text-xs text-white/50 uppercase tracking-wider block">Viendo</span>
          <span className="text-lg font-bold text-[#00BCD4]">
            {activeFloor.id === '1' ? 'PISO 1' : `PISO ${activeFloor.id}`}
          </span>
        </div>
      </div>

      {isInitialLoad && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center z-50 bg-gray-900 pointer-events-none">
          <Loader2 className="w-12 h-12 text-[#00CFC8] animate-spin drop-shadow-[0_0_15px_rgba(0,207,200,0.6)]" />
        </div>
      )}

      {selectedUnit && (() => {
        const isCommonArea = selectedUnit.type === 'common';
        const displayTitle = selectedUnit.label || selectedUnit.name || selectedUnit.identifier || 'Unidad';
        const isDuplex = selectedUnit.isDuplex || !!selectedUnit.duplexTotalStats;
        const isInferior = selectedUnit.duplexLevel === 'inferior';

        const pluralize = (count: number, singular: string, plural: string) => count === 1 ? singular : plural;

        const habArea = Number(selectedUnit.habitableArea || 0);
        const terrArea = Number(selectedUnit.terraceArea || 0);
        const parkArea = Number(selectedUnit.parkingArea || 0);
        const storArea = Number(selectedUnit.storageArea || 0);

        const currentFloorExclusiveHabitable = habArea + terrArea;
        const currentFloorExclusiveTotal = currentFloorExclusiveHabitable + parkArea + storArea;

        const finalHabitableArea = (isDuplex && selectedUnit.duplexTotalStats?.areaHabitableTotal)
          ? Number(selectedUnit.duplexTotalStats.areaHabitableTotal)
          : currentFloorExclusiveHabitable;

        const manualArea = Number(selectedUnit.area || 0);
        const finalTotalArea = manualArea > 0
          ? manualArea
          : currentFloorExclusiveTotal;

        return (
          <div 
            className="fixed md:absolute top-[45%] md:top-8 left-1/2 md:left-auto md:right-8 transform -translate-x-1/2 -translate-y-1/2 md:translate-x-0 md:translate-y-0 w-[92%] md:w-[360px] max-h-[65vh] md:max-h-[calc(100vh-4rem)] bg-[#121217]/95 backdrop-blur-xl rounded-[2rem] border border-white/5 shadow-2xl z-[100] flex flex-col overflow-y-auto md:overflow-hidden animate-in slide-in-from-right-8 duration-300 custom-scrollbar"
          >
            <div className="p-3 md:p-4 pb-3 flex-none border-b border-white/5 bg-[#121217]/80">
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                  <h3 className="text-lg md:text-xl font-bold tracking-tight text-white leading-tight">{displayTitle}</h3>
                  {isDuplex && (
                    <p className="text-cyan-400 text-[10px] font-bold uppercase tracking-[0.15em] mt-1 flex items-center gap-1.5">
                      {isInferior ? <ArrowDownRight size={14} className="stroke-[3px]" /> : <ArrowUpRight size={14} className="stroke-[3px]" />}
                      PISO {selectedUnit.duplexLevel?.toUpperCase() || 'INFERIOR'}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {isCommonArea ? (
                      <span className="px-3 py-1 rounded-full text-[10px] flex items-center gap-1 font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        INFORMACIÓN
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border flex items-center gap-1.5 ${(selectedUnit.status?.trim().toLowerCase() === 'disponible' || selectedUnit.status?.trim().toLowerCase() === 'available')
                        ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'
                        : (selectedUnit.status?.trim().toLowerCase() === 'reservado' || selectedUnit.status?.trim().toLowerCase() === 'reserved')
                          ? 'text-amber-400 border-amber-400/30 bg-amber-400/10'
                          : 'text-rose-400 border-rose-400/30 bg-rose-400/10'
                        }`}>
                        {(selectedUnit.status?.trim().toLowerCase() === 'disponible' || selectedUnit.status?.trim().toLowerCase() === 'available') ? <><CheckCircle2 size={14} className="icon-glow-cyan" /> Disponible</> :
                          (selectedUnit.status?.trim().toLowerCase() === 'reservado' || selectedUnit.status?.trim().toLowerCase() === 'reserved') ? <><Clock size={14} className="icon-glow-gold" /> Reservado</> :
                            <><XCircle size={14} className="icon-glow-orange" /> Vendido</>}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={() => setSelectedUnit(null)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors shrink-0 border border-white/5"><X size={18} /></button>
              </div>
            </div>

            <div className="px-3 md:px-4 py-3 md:py-4 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-[#0F0F13]/80">
              {isCommonArea ? (
                <div className="flex flex-col animate-in fade-in duration-500">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-white/5 rounded-xl border border-white/5">
                      <Store size={20} className="text-white/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Tipo de Espacio</span>
                      <span className="text-lg font-bold text-white">Comunal / Servicio</span>
                    </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-xl border border-white/5 mt-1">
                    <p className="text-xs text-white/60 leading-relaxed">
                      Esta es un área compartida diseñada para el bienestar y convivencia de todos los residentes del proyecto.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-[#16161a] border border-white/5 shadow-sm">
                    <Home className="w-5 h-5 text-white/40 shadow-sm" />
                    <div className="flex-1">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Área Habitable</p>
                      <p className="text-base md:text-lg font-bold text-white">{habArea.toFixed(2)} m²</p>
                    </div>
                  </div>

                  {terrArea > 0 && (
                    <div className="flex items-center gap-2 md:gap-3 p-2.5 md:p-3 rounded-xl bg-[#16161a] border border-white/5 shadow-sm">
                      <Sun className="w-5 h-5 text-white/40" />
                      <div className="flex-1">
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Terraza / Patio</p>
                        <p className="text-base md:text-lg font-bold text-white">{terrArea.toFixed(2)} m²</p>
                      </div>
                    </div>
                  )}

                  <div className="p-3 rounded-xl border border-cyan-900/50 bg-[#0f172a] shadow-sm mt-1">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <BoxSelect className="w-3.5 h-3.5 text-cyan-500 opacity-80 shrink-0" />
                        <span className="text-[9px] font-bold uppercase tracking-wider text-cyan-500 leading-tight">Exclusiva Habitable</span>
                      </div>
                      <span className="text-sm md:text-base font-bold text-white whitespace-nowrap">{finalHabitableArea.toFixed(2)} m²</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1.5">
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <BedDouble className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="text-xs font-semibold text-white/90 truncate">{selectedUnit.rooms || 0} {pluralize(Number(selectedUnit.rooms), 'Dorm.', 'Dorm.')}</span>
                    </div>
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <Bath className="w-3.5 h-3.5 text-white/40 shrink-0" />
                      <span className="text-xs font-semibold text-white/90 truncate">{selectedUnit.bathrooms || 0} {pluralize(Number(selectedUnit.bathrooms), 'Baño', 'Baños')}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Number(selectedUnit.parkingCount) > 0 && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                        <Car className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="text-[10px] font-bold text-white/90 truncate shadow-sm">
                          {selectedUnit.parkingCount} Parq. <span className="opacity-60 text-[9px] font-normal">({parkArea.toFixed(1)}m²)</span>
                        </span>
                      </div>
                    )}

                    {Number(selectedUnit.storageCount) > 0 && (
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                        <Warehouse className="w-3.5 h-3.5 text-white/40 shrink-0" />
                        <span className="text-[10px] font-bold text-white/90 truncate shadow-sm">
                          {selectedUnit.storageCount} Bod. <span className="opacity-60 text-[9px] font-normal">({storArea.toFixed(1)}m²)</span>
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div className={`rounded-xl text-center shadow-lg p-2.5 md:p-3 flex flex-col justify-center items-center ${isDuplex ? 'bg-[#0d9488] shadow-teal-900/20' : 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-teal-900/30'}`}>
                      <p className="text-[9px] text-teal-50 uppercase tracking-[0.1em] font-bold mb-0.5">
                        Área Total {isDuplex && <span className="lowercase opacity-80 font-medium whitespace-nowrap"><br/>(niveles)</span>}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-white tracking-tight">{finalTotalArea.toFixed(2)} m²</p>
                    </div>

                    {selectedUnit?.price !== undefined && selectedUnit.price > 0 && (
                      <div className="p-2.5 md:p-3 rounded-xl border border-white/5 bg-[#16161a] flex flex-col justify-center text-center shadow-inner">
                        <span className="text-[9px] text-blue-400 uppercase font-bold tracking-[0.1em] mb-0.5">Inversión Mínima</span>
                        <p className="text-lg md:text-xl font-bold text-white tracking-tight">
                          {new Intl.NumberFormat('en-US', {
                            style: 'currency',
                            currency: 'USD',
                            maximumFractionDigits: 0
                          }).format(selectedUnit.price)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!isCommonArea && (
              <div className="p-4 pt-3 pb-8 md:pb-4 flex-none border-t border-white/5 bg-[#121217]/80">
                <div className="flex flex-col gap-2 md:gap-3">
                  {(selectedUnit.status?.trim().toLowerCase() === 'disponible' || selectedUnit.status?.trim().toLowerCase() === 'available') && (
                    <button
                      onClick={() => setIsLeadModalOpen(true)}
                      className="w-full py-2.5 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                      Cotizar Unidad
                    </button>
                  )}
                  <button onClick={() => {
                    const phone = "593984366162";
                    const message = `Hola, estoy interesado en la unidad *${displayTitle}* del proyecto *${currentProject?.name || 'su proyecto'}*. ¿Me podrían enviar más información?`;
                    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                    className="w-full py-2.5 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group">
                    <MessageCircle size={16} className="group-hover:scale-110 group-hover:icon-glow-cyan transition-all" />
                    Solicitar Info
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {selectedUnit && (
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          unit={selectedUnit}
          projectName={currentProject?.name || ''}
        />
      )}
    </div>
  );
};