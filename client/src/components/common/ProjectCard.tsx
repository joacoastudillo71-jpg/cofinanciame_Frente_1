import React from 'react';
import { motion } from 'framer-motion';
import { getAssetUrl } from '../../lib/assetUrl';

interface ProjectCardProps {
  project: any;
  index: number;
  onClick: (project: any) => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, index, onClick }) => {
  const isPreview = project.isPreview;
  const isArray = Array.isArray(project.assets);

  // Pre-calcular variables
  let video = null;
  let cover = null;
  let logoUrl = null;

  if (isPreview) {
    video = isArray ? project.assets.find((a: any) => a.category === 'Preview - Tarjeta Home (Video .mp4)')?.r2Url : null;
    cover = isArray ? project.assets.find((a: any) => a.category === 'Preview - Tarjeta Home (Imagen .webp/.jpg/.png)')?.r2Url : null;
    logoUrl = isArray ? project.assets.find((a: any) => a.category === 'Logo Principal')?.r2Url : null;
  } else {
    video = isArray ? project.assets.find((a: any) => a.category === 'Video Principal (.mp4)')?.r2Url : project.assets?.heroVideos?.[0];
    cover = isArray ? project.assets.find((a: any) => a.category === 'Render Principal (Cover)')?.r2Url : project.assets?.coverImage;
    logoUrl = isArray ? project.assets.find((a: any) => a.category === 'Logo Principal')?.r2Url : project.assets?.logo;
  }

  const fallbackLogo = '/assets/cofinancia-logo.png';
  const finalLogoSrc = logoUrl || fallbackLogo;

  const bgClass = isPreview ? "bg-[#121217] border-white/5 hover:border-amber-500/50" : "bg-[#080435] border-white/10 hover:border-[#00CFC8]/50";
  const initialAnim = isPreview ? { opacity: 0, scale: 0.95 } : { opacity: 0, y: 40 };
  const whileInViewAnim = isPreview ? { opacity: 1, scale: 1 } : { opacity: 1, y: 0 };
  const viewportAnim = isPreview ? { once: true } : { once: true, margin: "-50px" };

  return (
    <motion.article
      initial={initialAnim}
      whileInView={whileInViewAnim}
      viewport={viewportAnim}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className={`group relative h-[360px] lg:h-[440px] rounded-[2rem] overflow-hidden cursor-pointer border shadow-2xl transition-all duration-500 hover:-translate-y-2 ${bgClass}`}
      onClick={(e) => {
        if (isPreview) e.stopPropagation();
        onClick(project);
      }}
    >
      {isPreview && (
        <div className="absolute top-6 left-6 z-30">
          <span className="bg-amber-500 text-black px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-xl shadow-amber-500/20">
            Próximamente
          </span>
        </div>
      )}

      <div className="absolute inset-0 w-full h-full">
        {video ? (
          <video 
            src={video} 
            className={`w-full h-full object-cover transition-all duration-700 ${isPreview ? 'opacity-70 group-hover:opacity-90' : 'opacity-80 group-hover:opacity-100'} group-hover:scale-105`} 
            muted loop playsInline autoPlay 
          />
        ) : cover ? (
          <img 
            src={cover} 
            alt={project.name || 'Proyecto Cofinanciame'} 
            className={`w-full h-full object-cover transition-all duration-700 ${isPreview ? 'opacity-70 group-hover:opacity-90' : 'opacity-80 group-hover:opacity-100'} group-hover:scale-105`} 
          />
        ) : (
          <div className={`w-full h-full ${isPreview ? 'bg-slate-900' : 'bg-slate-800'}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#020112] via-transparent to-transparent opacity-90" />
      </div>

      <div className="absolute inset-0 p-6 lg:p-8 flex flex-col h-full z-10">
        <div className="flex-1" />

        <div className="flex-[2] flex items-center justify-center w-full">
          <div className="relative p-6 flex items-center justify-center">
            {isPreview ? (
              <div className="absolute inset-0 bg-amber-500/5 blur-[80px] rounded-full -z-10 pointer-events-none mix-blend-screen"></div>
            ) : (
              <>
                <div className="absolute inset-0 bg-[#00CFC8]/10 blur-[80px] rounded-full -z-10 pointer-events-none mix-blend-screen"></div>
                <div className="absolute inset-0 bg-white/20 blur-[40px] rounded-full -z-10 pointer-events-none scale-50"></div>
              </>
            )}
            <img
              src={getAssetUrl(finalLogoSrc)}
              alt={project.name || 'Proyecto Cofinanciame'}
              className={`h-24 lg:h-32 object-contain transition-transform duration-500 group-hover:scale-110 ${isPreview ? 'drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] opacity-100' : 'drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] relative z-20'}`}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                if (target.src !== getAssetUrl(fallbackLogo)) {
                  target.src = getAssetUrl(fallbackLogo);
                }
              }}
            />
          </div>
        </div>

        <div className="flex-none flex flex-col items-center text-center mt-auto pt-2">
          {isPreview ? (
            <button className="
              w-[160px] h-[42px] rounded-full 
              bg-transparent text-white border border-white/20
              flex items-center justify-center gap-1.5 
              font-bold text-[10px] uppercase tracking-widest
              shadow-md active:scale-95
              group-hover:bg-amber-500 group-hover:text-black group-hover:border-transparent
              transition-all duration-300 mx-auto
            ">
              <span>VER PREVIEW</span>
              <span className="text-[15px] font-normal -mt-[2px] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          ) : (
            <button className="
              w-[160px] h-[42px] rounded-full 
              bg-[#00CFC8] text-[#050225]
              flex items-center justify-center gap-1.5 
              font-bold text-[10px] uppercase tracking-widest
              transition-all duration-300 shadow-md active:scale-95
              group-hover:bg-white hover:text-black mx-auto
            ">
              <span>EXPLORAR</span>
              <span className="text-[15px] font-normal -mt-[2px] group-hover:translate-x-1 transition-transform">→</span>
            </button>
          )}
        </div>
      </div>
    </motion.article>
  );
};
