import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, BedDouble, Bath, Car, Store, Home, Sun, Warehouse, Layers, BoxSelect, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { FloorUnit } from '../../config/types';
import { normalizeUnitStatus, isUnitAvailable } from '@/lib/utils';
import { LeadCaptureModal } from '../modules/leads/LeadCaptureModal';

interface UnitDrawerProps {
  unit: FloorUnit | null;
  projectName: string;
  onClose: () => void;
}

export const UnitDrawer: React.FC<UnitDrawerProps> = ({ unit, projectName, onClose }) => {
  const [isLeadModalOpen, setIsLeadModalOpen] = useState(false);

  if (!unit) return null;

  const handleWhatsAppClick = () => {
    const phone = "593984366162";
    const message = `Hola, estoy interesado en la unidad *${unit.label || unit.identifier}* del proyecto *${projectName}*. ¿Me podrían enviar más información?`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const getStatusColor = (rawStatus?: string) => {
    const status = normalizeUnitStatus(rawStatus);
    switch (status) {
      case 'disponible': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'reservado': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'vendido': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    }
  };

  const getStatusLabel = (rawStatus?: string) => {
    const status = normalizeUnitStatus(rawStatus);
    switch (status) {
      case 'disponible': return 'Disponible';
      case 'reservado': return 'Reservado';
      case 'vendido': return 'Vendido';
      default: return 'Información';
    }
  };

  const pluralize = (count: number, singular: string, plural: string) => count === 1 ? singular : plural;

  const isCommonArea = unit.type === 'common' || unit.status === 'info';
  const isDuplex = unit.isDuplex || !!unit.duplexTotalStats;
  const isInferior = unit.duplexLevel === 'inferior';
  const displayTitle = unit.label || unit.identifier || 'Unidad';

  // --- CÁLCULOS MATEMÁTICOS PARA EL PISO ACTUAL ---
  const habArea = Number(unit.habitableArea || 0);
  const terrArea = Number(unit.terraceArea || 0);
  const parkArea = Number(unit.parkingArea || 0);
  const storArea = Number(unit.storageArea || 0);
  const currentFloorExclusiveHabitable = habArea + terrArea;

  // CAJA AZUL: Área Exclusiva Habitable (Suma total de ambos pisos si es dúplex)
  const finalHabitableArea = isDuplex && unit.duplexTotalStats
    ? unit.duplexTotalStats.areaHabitableTotal
    : currentFloorExclusiveHabitable;

  // CAJA VERDE: Área Exclusiva Total (Prioridad ABSOLUTA al valor manual del CMS 'unit.area')
  const manualArea = Number(unit.area || 0);
  const finalTotalArea = manualArea > 0
    ? manualArea
    : (currentFloorExclusiveHabitable + parkArea + storArea);

  return (
    <AnimatePresence>
      {unit && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="
              fixed bottom-0 left-0 right-0 z-[70] 
              bg-[#121217] border-t border-white/10 shadow-2xl 
              rounded-t-[2rem] md:rounded-[2rem] 
              md:left-auto md:right-6 md:bottom-6 md:w-[400px] 
              max-h-[85vh] flex flex-col border md:border-white/5
            "
          >
            {/* HEADER FIJO */}
            <div className="p-6 pb-4 flex-none border-b border-white/5 bg-[#121217] z-10 rounded-t-[2rem]">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <h3 className="text-2xl md:text-3xl font-bold tracking-tight text-white leading-tight">{displayTitle}</h3>
                  {isDuplex && (
                    <p className="text-cyan-400 text-[11px] font-bold uppercase tracking-[0.15em] mt-1.5 flex items-center gap-1.5">
                      {isInferior ? <ArrowDownRight size={14} className="stroke-[3px]" /> : <ArrowUpRight size={14} className="stroke-[3px]" />}
                      PISO {unit.duplexLevel?.toUpperCase() || 'INFERIOR'}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {isCommonArea ? (
                      <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        INFORMACIÓN
                      </span>
                    ) : (
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(unit.status)}`}>
                        {getStatusLabel(unit.status)}
                      </span>
                    )}
                  </div>
                </div>
                <button onClick={onClose} className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white transition-colors shrink-0 border border-white/5"><X size={18} /></button>
              </div>
            </div>

            {/* BODY SCROLLABLE */}
            <div className="px-6 py-6 overflow-y-auto custom-scrollbar flex-1 min-h-0 bg-[#0F0F13]">

              {isCommonArea ? (
                // --- VISTA LOBBY / COMUNAL ---
                <div className="flex flex-col animate-in fade-in duration-500">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="p-3.5 bg-white/5 rounded-2xl border border-white/5">
                      <Store size={24} className="text-white/70" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest mb-0.5">Tipo de Espacio</span>
                      <span className="text-xl font-bold text-white">Comunal / Servicio</span>
                    </div>
                  </div>
                  <div className="p-4 bg-white/5 rounded-xl border border-white/5 mt-2">
                    <p className="text-sm text-white/60 leading-relaxed">
                      Esta es un área compartida diseñada para el bienestar y convivencia de todos los residentes del proyecto.
                    </p>
                  </div>
                </div>
              ) : (
                // --- VISTA DE UNIDAD (Simplex y Dúplex) ESTILO BOSS ---
                <div className="space-y-3 animate-in fade-in slide-in-from-bottom-2">

                  {/* Caja: Área Habitable */}
                  <div className="flex items-center gap-4 p-4 rounded-xl bg-[#16161a] border border-white/5 shadow-sm">
                    <Home className="w-5 h-5 text-white/40" />
                    <div className="flex-1">
                      <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Área Habitable</p>
                      <p className="text-xl font-bold text-white">{habArea.toFixed(2)} m²</p>
                    </div>
                  </div>

                  {/* Caja: Terraza (Si tiene) */}
                  {terrArea > 0 && (
                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[#16161a] border border-white/5 shadow-sm">
                      <Sun className="w-5 h-5 text-white/40" />
                      <div className="flex-1">
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-widest mb-0.5">Terraza / Patio</p>
                        <p className="text-xl font-bold text-white">{terrArea.toFixed(2)} m²</p>
                      </div>
                    </div>
                  )}

                  {/* Caja Bordeada: Área Exclusiva Habitable (De este piso) */}
                  <div className="p-4 rounded-xl border border-cyan-900/50 bg-[#0f172a] shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <BoxSelect className="w-4 h-4 text-cyan-500 opacity-80" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-500">Área Exclusiva Habitable</span>
                      </div>
                      <span className="text-lg font-bold text-white">{Number(finalHabitableArea).toFixed(2)} m²</span>
                    </div>
                  </div>

                  {/* Fila: Cuartos y Baños */}
                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <BedDouble className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm font-semibold text-white/90 truncate">{unit.rooms || 0} {pluralize(Number(unit.rooms), 'Dorm.', 'Dorm.')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <Bath className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm font-semibold text-white/90 truncate">{unit.bathrooms || 0} {pluralize(Number(unit.bathrooms), 'Baño', 'Baños')}</span>
                    </div>
                  </div>

                  {/* Fila Extra: Parqueo */}
                  {Number(unit.parkingCount) > 0 && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <Car className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm font-semibold text-white/90 truncate">
                        {unit.parkingCount} Parq. ({parkArea.toFixed(2)} m²)
                      </span>
                    </div>
                  )}

                  {/* Fila Extra: Bodega */}
                  {Number(unit.storageCount) > 0 && (
                    <div className="flex items-center gap-3 p-3.5 rounded-xl bg-[#16161a] border border-white/5 shadow-inner">
                      <Warehouse className="w-4 h-4 text-white/40 shrink-0" />
                      <span className="text-sm font-semibold text-white/90 truncate">
                        {unit.storageCount} Bod. ({storArea.toFixed(2)} m²)
                      </span>
                    </div>
                  )}

                  {/* CAJA VERDE: ÁREA EXCLUSIVA TOTAL */}
                  <div className={`mt-5 rounded-xl text-center shadow-lg p-5 ${isDuplex ? 'bg-[#0d9488] shadow-teal-900/20' : 'bg-gradient-to-r from-teal-500 to-emerald-400 shadow-teal-900/30'}`}>
                    <p className="text-[10px] text-teal-50 uppercase tracking-[0.2em] font-bold mb-1">Área Exclusiva Total</p>
                    <p className="text-3xl font-black text-white tracking-tight">{finalTotalArea.toFixed(2)} m²</p>
                  </div>

                  {/* CAJA INVERSIÓN */}
                  {unit?.price !== undefined && unit.price > 0 && (
                    <div className="mt-4 p-5 rounded-xl border border-white/5 bg-[#16161a] flex flex-col justify-center shadow-inner">
                      <span className="text-[9px] text-blue-400 uppercase font-bold tracking-[0.15em] mb-1.5">Inversión Estimada</span>
                      <p className="text-3xl font-black text-white tracking-tight">
                        {new Intl.NumberFormat('en-US', {
                          style: 'currency',
                          currency: 'USD',
                          maximumFractionDigits: 0
                        }).format(unit.price)}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* FOOTER BOTONES */}
            {!isCommonArea && (
              <div className="p-6 pt-4 flex-none border-t border-white/5 bg-[#121217] rounded-b-[2rem]">
                <div className="space-y-3">
                  {isUnitAvailable(unit.status) && (
                    <button
                      onClick={() => setIsLeadModalOpen(true)}
                      className="w-full py-4 bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                      Cotizar Unidad
                    </button>
                  )}
                  <button onClick={handleWhatsAppClick} className="w-full py-4 bg-[#10b981] hover:bg-[#059669] text-white font-bold text-xs uppercase tracking-[0.15em] rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 group">
                    <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                    Solicitar Información
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}

      {unit && (
        <LeadCaptureModal
          isOpen={isLeadModalOpen}
          onClose={() => setIsLeadModalOpen(false)}
          unit={unit}
          projectName={projectName}
        />
      )}
    </AnimatePresence>
  );
};