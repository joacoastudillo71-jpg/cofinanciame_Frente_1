import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  ArrowDown,
  Layers,
  BoxSelect,
  Maximize2,
  X,
  MessageCircle,
  MapPin
} from 'lucide-react';
import { ProjectConfig } from '../../config/types';
import { Map3DViewer } from '../modules/location/Map3DViewer';
import { useLocation } from 'wouter';

interface PreviewShowcaseProps {
  project: ProjectConfig;
  onBack: () => void;
}

export const PreviewShowcase: React.FC<PreviewShowcaseProps> = ({ project, onBack }) => {
  const [, setLocation] = useLocation();
  const [activeModal, setActiveModal] = useState<'map' | 'image' | null>(null);

  // Fallback de Assets según la Fase 4
  const rawAssets = (project as any).rawAssets || project.assets || [];
  const videoIntro = rawAssets.find((a: any) => a.category === 'Preview - Hero Interior (Video .mp4)')?.r2Url;
  const fachadaImage = rawAssets.find((a: any) => a.category === 'Preview - Hero Interior (Imagen .webp/.jpg/.png)')?.r2Url || (project.assets && !(Array.isArray(project.assets)) ? (project.assets as any).coverImage : null);
  const mapStatic = rawAssets.find((a: any) => a.category === 'Preview - Mapa Estático (.webp)')?.r2Url;
  const map3dAsset = rawAssets.find((a: any) => a.category === 'map_3d_model' || a.category === 'Modelo 3D Arquitectónico (.glb)' || a.r2Url?.toLowerCase().endsWith('.glb'));
  const map3dModel = map3dAsset?.r2Url;

  const metadata = project.previewMetadata || { totalFloors: 0, unitTypes: [] };

  return (
    <div className="fixed inset-0 w-full h-full bg-[#020112] text-white overflow-y-auto overflow-x-hidden z-50 selection:bg-amber-500/30">
      {/* Botón Volver */}
      <button
        onClick={() => {
          onBack();
          setLocation('/');
        }}
        className="fixed top-8 left-8 z-[60] flex items-center gap-2 px-6 py-3 bg-black/40 backdrop-blur-md border border-white/20 rounded-full hover:bg-white/10 transition-all group shadow-lg"
      >
        <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform drop-shadow-[0_0_5px_rgba(255,255,255,0.4)]" />
        <span className="text-xs font-bold uppercase tracking-widest">Volver</span>
      </button>

      {/* SECCIÓN 1: HERO (100vh) */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {videoIntro ? (
            <video
              src={videoIntro}
              autoPlay
              muted
              loop
              playsInline
              className="w-full h-full object-cover opacity-60"
            />
          ) : (
            <img
              src={fachadaImage}
              alt={project.name}
              className="w-full h-full object-cover opacity-60"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-[#020112]/40 via-transparent to-[#020112]" />
        </div>

        <div className="relative z-10 text-center px-6 max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-6"
          >
            <span className="inline-block px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-[0.3em]">
              Lanzamiento Exclusivo
            </span>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-none">
              {project.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light max-w-2xl mx-auto">
              {project.previewMetadata?.heroSubtitle || "Descubre el próximo gran hito arquitectónico en el corazón de la ciudad."}
            </p>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-0 w-full flex flex-col items-center justify-center md:left-1/2 md:w-auto md:-translate-x-1/2 text-center z-50 gap-2 text-white/80"
        >
          <span className="text-[9px] uppercase tracking-widest font-bold drop-shadow-md">Scroll para explorar</span>
          <ArrowDown size={18} className="text-amber-500 drop-shadow-[0_0_8px_rgba(245,158,11,0.6)]" />
        </motion.div>
      </section>

      {/* SECCIÓN 2: AT-A-GLANCE (Detalles) */}
      <section className="relative w-full py-24 md:py-32 px-6 bg-gradient-to-b from-[#020112] to-[#05041a]">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
          <div className="space-y-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight" dangerouslySetInnerHTML={{
              __html: project.previewMetadata?.section1Title || 'Diseño que <span class="text-amber-500">Inspira.</span><br />Espacios que <span class="text-amber-500">Transforman.</span>'
            }} />
            <p className="text-gray-400 leading-relaxed text-lg">
              {project.previewMetadata?.section1Desc || "Estamos construyendo una experiencia residencial sin precedentes. Cada detalle ha sido meticulosamente planeado para ofrecer el máximo confort y sofisticación."}
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <Layers className="text-amber-500 w-6 h-6 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div>
                  <div className="text-2xl font-black text-white">{metadata.totalFloors}</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Niveles de Altura</div>
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 border border-white/5 space-y-3 drop-shadow-[0_0_10px_rgba(245,158,11,0.1)]">
                <BoxSelect className="text-amber-500 w-6 h-6 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]" />
                <div>
                  <div className="text-base font-bold flex flex-wrap gap-1">
                    {Array.isArray(metadata.unitTypes) ? metadata.unitTypes.map((type, i) => (
                      <span key={i} className="bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded text-[10px] border border-amber-500/20">{type}</span>
                    )) : metadata.unitTypes}
                  </div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-widest font-bold pt-1">Tipologías Disponibles</div>
                </div>
              </div>
            </div>
          </div>

          <div className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden group">
            <img src={fachadaImage} alt="Fachada Preview" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#020112] to-transparent opacity-60" />
          </div>
        </div>
      </section>

      {/* SECCIÓN 3: UBICACIÓN Y 3D */}
      <section className="relative w-full py-24 md:py-32 px-6 bg-[#05041a]">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tight">
              {project.previewMetadata?.locationTitle || "Ubicación Estratégica"}
            </h2>
            <p className="text-gray-400 max-w-xl mx-auto">
              {project.previewMetadata?.locationDesc || "Conecta con los puntos más importantes de la ciudad desde tu nuevo hogar."}
            </p>
          </div>

          <div className="relative w-full h-full min-h-[400px] md:h-[500px] lg:h-[600px] rounded-[3rem] overflow-hidden border border-white/10 bg-slate-900 group">
            {map3dAsset ? (
              <div className="absolute inset-0 w-full h-full">
                <Map3DViewer asset={map3dAsset} />
              </div>
            ) : mapStatic ? (
              <img src={mapStatic} className="w-full h-full object-cover" alt="Mapa Ubicación" />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 text-gray-500 bg-slate-900/50">
                <MapPin size={40} className="animate-bounce text-[#00CFC8] drop-shadow-[0_0_15px_rgba(0,207,200,0.5)]" />
                <span className="text-sm font-bold uppercase tracking-widest text-[#00CFC8]/50">Localización en proceso</span>
              </div>
            )}

            {/* Overlay de Interacción */}
            {(map3dAsset || mapStatic) && (
              <button
                onClick={() => setActiveModal(map3dAsset ? 'map' : 'image')}
                className="absolute bottom-10 right-10 z-20 flex items-center gap-2 px-6 py-4 bg-amber-500 text-black rounded-2xl font-black text-xs uppercase tracking-widest hover:scale-105 transition-transform shadow-2xl shadow-amber-500/20"
              >
                <Maximize2 size={16} />
                {map3dAsset ? 'Ver Modelo 3D' : 'Maximizar Mapa'}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* SECCIÓN 4: CTA FINAL */}
      <section className="relative w-full py-32 md:py-48 px-6 text-center">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter leading-none">
              {project.previewMetadata?.ctaTitle || `¿Te interesa ser parte de ${project.name}?`}
            </h2>
            <p className="text-gray-400 text-lg md:text-xl font-light">
              {project.previewMetadata?.ctaDesc || "Agenda una cita personalizada y sé de los primeros en conocer los planos y beneficios de preventa."}
            </p>
          </div>

          <a
            href={`https://wa.me/593984366162?text=Hola,%20estoy%20interesado%20en%20el%20proyecto%20EN%20PREVIEW:%20${project.name}%20(Slug:%20${project.id})`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#25D366] text-white rounded-full font-black text-sm uppercase tracking-[0.2em] hover:bg-[#1da851] transition-all hover:scale-105 shadow-[0_10px_40px_rgba(37,211,102,0.3)]"
          >
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 mr-2"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* AQUÍ ESTÁ EL ARREGLO: Añadida clase !fill-white al path */}
              <path
                className="!fill-white !stroke-none"
                d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.459-1.653-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            {project.previewMetadata?.ctaButtonText || "Contactar por WhatsApp"}
          </a>
        </div>
      </section>

      {/* MODALES */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
          >
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-10 right-10 z-[110] p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all transition-transform hover:rotate-90"
            >
              <X size={24} />
            </button>

            {activeModal === 'map' ? (
              <div className="w-full h-full relative">
                <Map3DViewer asset={map3dAsset} />
              </div>
            ) : (
              <img src={mapStatic} className="max-w-full max-h-full object-contain" alt="Vista Ampliada" />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer minimalista */}
      <footer className="py-12 border-t border-white/5 text-center text-gray-600 text-[10px] font-bold uppercase tracking-widest">
        © 2025 CoFinancia.me · {project.name} · All Rights Reserved
      </footer>
    </div>
  );
};
