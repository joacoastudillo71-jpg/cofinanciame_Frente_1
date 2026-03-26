import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { motion } from 'framer-motion';
import { ArrowRight, Building2, TrendingUp, ShieldCheck, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { ProjectConfig } from '../../config/types';
import { baseTheme } from '../../config/theme';
import { getAssetUrl } from '../../lib/assetUrl';
import { ProjectCard } from '../common/ProjectCard';
import { useLocation } from 'wouter';

// --- ICONOS UI ---
const SocialIcon = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    // EL FIX: Resplandor BLANCO puro. Cambiamos los rgba de cian a rgba(255,255,255,X)
    className="p-3 bg-white/5 rounded-full hover:bg-white/10 transition-all border border-white/5 hover:border-white/50 flex items-center justify-center text-white [&_svg_*]:!stroke-white drop-shadow-[0_0_5px_rgba(255,255,255,0.4)] hover:drop-shadow-[0_0_12px_rgba(255,255,255,1)]"
  >
    {children}
  </a>
);

const StatItem = ({ icon: Icon, label, subLabel }: { icon: any, label: string, subLabel: string }) => {
  // EL FIX: Iluminación CIEN NEÓN (#03fff6). 
  // Mantenemos el balance para la flecha de Plusvalía, pero con el hexadecimal brillante.
  const isPlusvalia = label === "Plusvalía";
  const shadowClass = isPlusvalia
    ? "drop-shadow-[0_0_4px_#03fff6] group-hover:drop-shadow-[0_0_8px_#03fff6]" // Luz controlada para la flecha
    : "drop-shadow-[0_0_8px_#03fff6] group-hover:drop-shadow-[0_0_15px_#03fff6]"; // Luz intensa para los demás

  return (
    <div className="flex flex-col items-center lg:items-start gap-2 p-3 rounded-xl bg-white/5 border border-white/5 hover:border-[#03fff6]/30 transition-colors group">
      <Icon className={`w-5 h-5 text-[#00CFC8] [&_*]:!stroke-[#00CFC8] filter transition-all ${shadowClass}`} />
      <div className="flex flex-col">
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{label}</span>
        <span className="text-[9px] text-gray-400">{subLabel}</span>
      </div>
    </div>
  );
};

const TikTokIcon = () => (
  // EL VERDADERO LOGO LINEAL: Trazado exacto (stroke) para que haga juego con Instagram y Facebook.
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="w-5 h-5"
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const WhatsAppFloating = () => (
  <a
    href="https://wa.me/593984366162"
    target="_blank"
    rel="noopener noreferrer"
    className="fixed bottom-6 right-6 z-50 group"
    aria-label="Contactar por WhatsApp"
  >
    {/* Contenedor Verde Oficial con resplandor exterior suave */}
    <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_4px_14px_rgba(37,211,102,0.4)] hover:shadow-[0_0_20px_rgba(37,211,102,0.9)] hover:scale-110 transition-all duration-300 border border-white/20">

      {/* Logo de WhatsApp Sólido y Nítido (Ruta SVG oficial y blindada) */}
      <svg
        viewBox="0 0 24 24"
        className="w-8 h-8 !fill-white !stroke-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          className="!fill-white !stroke-none"
          d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.305-.885-.653-1.48-1.459-1.653-1.756-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
      </svg>
    </div>
  </a>
);

export const HomeView = () => {
  const { setProject, setSection } = useAppStore();
  const [, setLocation] = useLocation();

  const handleSelectProject = (project: any) => {
    // 1. Fetch full data from DB when selected
    fetch(`/api/projects/${project.slug}`)
      .then(res => res.json())
      .then(fullProject => {
        const dbAssets = fullProject.assets || [];
        const logoAsset = dbAssets.find((a: any) => a.category === 'Logo Principal');
        const videoAsset = dbAssets.find((a: any) => a.category === 'Video Principal (.mp4)');
        const coverAsset = dbAssets.find((a: any) => a.category === 'Render Principal (Cover)');

        const configuredProject: ProjectConfig = {
          ...fullProject,
          id: fullProject.slug || fullProject.id.toString(),
          name: fullProject.name,
          theme: { primaryColor: '#00CFC8', secondaryColor: '#1e1b4b' }, // Default theme
          enabledFeatures: {
            introVideo: true,
            heroVideos: true,
            tours360: true, // Habilitados para la web
            location: true,
            floors: true,
            renders: true,
            chatbot: false,
          },
          assets: {
            logo: logoAsset ? logoAsset.r2Url : '/assets/cofinancia-logo.png',
            heroVideos: videoAsset ? [videoAsset.r2Url] : [],
            coverImage: coverAsset ? coverAsset.r2Url : '',
            renders: { categories: [] }, // Mapeo para Assets se expandirá en Fase 4
            location: { levels: [] },
            floors: [],
            toursData: []
          }
        };

        setProject(configuredProject);
        setSection('intro'); // Enrutamiento estricto: SIEMPRE pasar por la Intro
        setLocation(`/${fullProject.slug}/intro`);
      })
      .catch(err => console.error("Error fetching project details:", err));
  };

  const [liveProjects, setLiveProjects] = React.useState<any[]>([]);

  const activeProjects = liveProjects.filter(p => !p.isPreview);
  const previewProjects = liveProjects.filter(p => p.isPreview);

  React.useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setLiveProjects(data);
        }
      })
      .catch(err => console.error("Error hidratando proyectos vivos:", err));
  }, []);

  return (
    <div
      className="w-full min-h-screen h-auto text-white relative selection:bg-[#00CFC8] selection:text-black font-sans overflow-x-hidden"
      style={{
        background: `radial-gradient(circle at top left, #1e1b4b 0%, #020112 100%)`
      }}
    >
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#00CFC8] rounded-full blur-[180px] opacity-[0.08]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-900 rounded-full blur-[180px] opacity-20"></div>
      </div>

      <WhatsAppFloating />

      <div className="relative z-10 w-full max-w-[1920px] mx-auto flex flex-col lg:grid lg:grid-cols-12">

        <header className="w-full px-6 pt-12 pb-8 lg:col-span-5 lg:p-16 flex flex-col lg:sticky lg:top-0 lg:h-screen lg:pt-24 z-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col items-center lg:items-start text-center lg:text-left space-y-8"
          >
            {/* Corrección de Alt Text */}
            <img
              src={getAssetUrl("/assets/cofinancia-logo.png")}
              alt="Cofinancia.me"
              className="h-16 md:h-20 lg:h-28 object-contain drop-shadow-2xl"
            />

            <div className="max-w-lg space-y-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight tracking-tight">
                <span className="block text-white">Tu dinero en movimiento,</span>
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#00CFC8] to-[#03fff6]">
                  tu futuro en construcción.
                </span>
              </h1>
              <p className="text-sm md:text-base text-gray-300 font-light leading-relaxed">
                Plataforma de inversión inmobiliaria de alto impacto.
                Conectamos visión con realidad a través de proyectos exclusivos.
              </p>
            </div>

            <div className="hidden lg:grid w-full grid-cols-3 gap-3 pt-8 border-t border-white/10">
              <StatItem icon={ShieldCheck} label="Seguridad" subLabel="Jurídica & Técnica" />
              <StatItem icon={TrendingUp} label="Plusvalía" subLabel="Alta Rentabilidad" />
              <StatItem icon={Building2} label="Exclusividad" subLabel="Ubicaciones Prime" />
            </div>

            <div className="hidden lg:flex flex-col gap-3 w-full pt-6">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Síguenos</p>
              <div className="flex gap-4">
                <SocialIcon href="https://www.instagram.com/cofinanciame/"><Instagram size={18} /></SocialIcon>
                <SocialIcon href="https://www.facebook.com/profile.php?id=61569695919219"><Facebook size={18} /></SocialIcon>
                <SocialIcon href="https://www.tiktok.com/@cofinanciame"><TikTokIcon /></SocialIcon>
              </div>
            </div>
          </motion.div>
        </header>

        <main className="w-full px-4 pb-24 lg:col-span-7 lg:min-h-screen lg:px-16 lg:pt-24 lg:pb-32 bg-[#020112]/30 lg:bg-transparent lg:border-l border-white/5">
          <div className="flex items-center gap-4 mb-10 lg:mb-12 pt-4 lg:pt-0 px-2">
            <div className="h-[2px] w-12 bg-[#00CFC8] rounded-full"></div>
            <h3 className="text-xs md:text-sm font-bold text-white uppercase tracking-[0.2em]">Proyectos Disponibles</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
            {activeProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                onClick={handleSelectProject}
              />
            ))}
          </div>

          {/* --- SECCIÓN: PRÓXIMOS PROYECTOS --- */}
          {previewProjects.length > 0 && (
            <div className="mt-20">
              <div className="flex items-center gap-4 mb-10 lg:mb-12 pt-4 lg:pt-0 px-2 justify-center lg:justify-start">
                <div className="h-[2px] w-12 bg-amber-500 rounded-full"></div>
                <h3 className="text-sm md:text-base font-bold text-white uppercase tracking-[0.2em]">Próximos Proyectos</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-10">
                {previewProjects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    index={index}
                    onClick={handleSelectProject}
                  />
                ))}
              </div>
            </div>
          )}

          <footer className="lg:hidden mt-12 pt-8 border-t border-white/10 text-center space-y-6">
            <div className="flex justify-center gap-6">
              <SocialIcon href="https://www.instagram.com/cofinanciame/"><Instagram size={20} /></SocialIcon>
              <SocialIcon href="https://www.facebook.com/profile.php?id=61569695919219"><Facebook size={20} /></SocialIcon>
              <SocialIcon href="https://www.tiktok.com/@cofinanciame"><TikTokIcon /></SocialIcon>
            </div>
            {/* Corrección de Copyright */}
            <p className="text-[10px] text-gray-600 uppercase tracking-widest">© 2025 Cofinancia.me</p>
          </footer>
        </main>
      </div>
    </div>
  );
};