import React, { useState, useEffect, useRef } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useCurrentProject } from '../../hooks/useCurrentProject';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ZoomIn, ArrowLeft, Plus, Minus, RotateCcw, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TransformWrapper, TransformComponent, ReactZoomPanPinchRef } from "react-zoom-pan-pinch";
import { RenderCategory, RenderImageItem } from '../../config/types';
import { useRoute, useLocation } from 'wouter';

export const RenderView = () => {
  const { isLoading, setSection } = useAppStore();
  const currentProject = useCurrentProject();
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const transformRef = useRef<ReactZoomPanPinchRef | null>(null);

  const [match, params] = useRoute("/:projectSlug/:section/:subId?");
  const [, setLocation] = useLocation();

  // Indice local para navegación
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(-1);

  const categories = currentProject?.assets?.renders?.categories || [];

  const setCategoryAndUrl = (categoryId: string, label: string) => {
    setSelectedCategory(categoryId);
    if (params?.projectSlug) {
      const slug = encodeURIComponent(label.toLowerCase().replace(/\s+/g, '-'));
      setLocation(`/${params.projectSlug}/renders/${slug}`);
    }
  };

  useEffect(() => {
    if (isLoading) return;
    if (categories.length > 0) {
      const targetSlug = params?.subId ? decodeURIComponent(params.subId).toLowerCase() : null;
      
      const categoryFromUrl = targetSlug ? categories.find(c => {
        const catSlug = c.label.toLowerCase().replace(/\s+/g, '-');
        return catSlug === targetSlug || c.id.toLowerCase() === targetSlug;
      }) : null;

      if (categoryFromUrl) {
        if (selectedCategory !== categoryFromUrl.id) setSelectedCategory(categoryFromUrl.id);
      } else if (!selectedCategory && !params?.subId) {
        setSelectedCategory(categories[0].id);
      }
    }
  }, [categories, params?.subId, isLoading]);

  const currentCategoryData = categories.find(c => c.id === selectedCategory);

  const normalizeImage = (item: string | RenderImageItem): RenderImageItem => {
    if (typeof item === 'string') {
      const filename = item.split('/').pop() || '';
      const title = filename.replace(/\.[^/.]+$/, "").replace(/-/g, " ");
      return { url: item, title };
    }
    return item;
  };

  const currentImages = (currentCategoryData?.images || []).map(normalizeImage);

  // Sincronizar imagen seleccionada con índice
  useEffect(() => {
    if (selectedImage) {
      const idx = currentImages.findIndex(img => img.url === selectedImage);
      setCurrentImageIndex(idx);
    } else {
      setCurrentImageIndex(-1);
    }
  }, [selectedImage, currentImages]);

  // NAVEGACIÓN
  const nextImage = () => {
    if (currentImageIndex === -1) return;
    const newIndex = (currentImageIndex + 1) % currentImages.length;
    setSelectedImage(currentImages[newIndex].url);
  };

  const prevImage = () => {
    if (currentImageIndex === -1) return;
    const newIndex = (currentImageIndex - 1 + currentImages.length) % currentImages.length;
    setSelectedImage(currentImages[newIndex].url);
  };

  // TECLADO
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
      if (e.key === 'Escape') setSelectedImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentImageIndex]);

  return (
    <div className="w-full h-full bg-neutral-950 text-white overflow-y-auto relative z-10 md:pl-24 custom-scrollbar">

      <div className="hidden" aria-hidden="true">
        {categories.flatMap(cat => cat.images).map((item) => {
          const url = typeof item === 'string' ? item : item.url;
          return <img key={`preload-${url}`} src={url} alt="preload" />;
        })}
      </div>

      <div className="sticky top-0 left-0 right-0 z-30 pt-6 pb-6 px-6 bg-gradient-to-b from-neutral-950 via-neutral-950/95 to-transparent backdrop-blur-sm">
        <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center">
            <div>
              <h2 className="text-2xl font-light tracking-wide text-white">
                Galería <span className="font-semibold text-cyan-400">Visual</span>
              </h2>
              <p className="text-xs font-medium text-white/40 tracking-[0.2em] uppercase">
                {currentProject?.name}
              </p>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="w-full md:w-auto overflow-x-auto no-scrollbar">
              <div className="flex gap-2 p-1 bg-neutral-900/80 rounded-full border border-white/5 backdrop-blur-md min-w-max">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setCategoryAndUrl(cat.id, cat.label)}
                    className={cn(
                      "px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 whitespace-nowrap flex items-center gap-2",
                      selectedCategory === cat.id
                        ? "bg-cyan-500 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                        : "text-white/50 hover:text-white hover:bg-white/5"
                    )}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 md:px-8 max-w-[1600px] mx-auto min-h-screen pb-32 md:pb-24">
        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[40vh] text-white/30 gap-4">
            <div className="p-4 bg-white/5 rounded-full"><ImageIcon size={32} /></div>
            <p className="font-light text-lg">Galería en preparación</p>
          </div>
        ) : (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
            <AnimatePresence mode='popLayout'>
              {currentImages.map((item, index) => (
                <motion.div
                  layout
                  key={`${selectedCategory}-${item.url}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className="break-inside-avoid relative group cursor-pointer rounded-xl overflow-hidden bg-neutral-900 border border-white/5 hover:border-cyan-500/30 transition-all shadow-lg hover:shadow-cyan-500/10"
                  onClick={() => setSelectedImage(item.url)}
                >
                  <img
                    src={item.url}
                    alt={item.title}
                    className="w-full h-auto object-cover transition-transform duration-[1.5s] ease-out group-hover:scale-105"
                    loading="lazy"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <h3 className="text-white text-lg font-bold truncate">
                      {item.title || 'Sin título'}
                    </h3>
                    <p className="text-[#00BCD4] text-sm font-semibold uppercase tracking-wider">
                      {currentCategoryData?.label || 'Render'}
                    </p>
                  </div>
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                    <div className="p-2 bg-black/50 backdrop-blur-md rounded-full text-white border border-white/10">
                      <ZoomIn size={16} />
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/98 flex items-center justify-center overflow-hidden backdrop-blur-xl"
          >
            <div className="w-full h-full relative">

              <div className="absolute top-6 right-6 z-50 flex flex-col gap-4">
                <button
                  className="p-3 rounded-full bg-white/10 hover:bg-red-500 text-white transition-colors border border-white/10 backdrop-blur-md"
                  onClick={() => setSelectedImage(null)}
                >
                  <X size={24} />
                </button>

                <div className="flex flex-col gap-2 bg-neutral-900/90 p-2 rounded-full backdrop-blur-md border border-white/10 shadow-2xl">
                  <button onClick={() => transformRef.current?.zoomIn()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><Plus size={20} /></button>
                  <button onClick={() => transformRef.current?.zoomOut()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><Minus size={20} /></button>
                  <button onClick={() => transformRef.current?.resetTransform()} className="p-2 hover:bg-white/20 rounded-full text-white transition-colors"><RotateCcw size={20} /></button>
                </div>
              </div>

              {currentImages.length > 1 && (
                <>
                  <button onClick={prevImage} className="absolute left-4 md:left-32 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 z-50 transition-all hover:scale-110"><ChevronLeft size={32} /></button>
                  <button onClick={nextImage} className="absolute right-4 md:right-32 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md border border-white/10 z-50 transition-all hover:scale-110"><ChevronRight size={32} /></button>
                </>
              )}

              {currentImageIndex !== -1 && (
                <div className="absolute bottom-28 md:bottom-8 left-8 md:left-28 z-50 pointer-events-none">
                  <motion.div
                    key={currentImages[currentImageIndex].url}
                    initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
                    className="bg-[#1a1f2e]/90 backdrop-blur-md border border-white/10 px-6 py-4 rounded-xl shadow-2xl"
                  >
                    <h3 className="text-white text-xl font-bold mb-1">{currentImages[currentImageIndex].title}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-[#00BCD4] text-xs font-bold uppercase tracking-wider">{currentCategoryData?.label}</span>
                      <span className="text-white/50 text-xs">{currentImageIndex + 1} / {currentImages.length}</span>
                    </div>
                  </motion.div>
                </div>
              )}

              <TransformWrapper
                ref={transformRef}
                initialScale={1} minScale={0.5} maxScale={4}
                centerOnInit
                key={selectedImage}
              >
                <TransformComponent wrapperClass="!w-full !h-full" contentClass="!w-full !h-full flex items-center justify-center">
                  <img
                    src={selectedImage}
                    alt="Full view"
                    className="max-w-full max-h-screen object-contain shadow-2xl"
                    onClick={(e) => e.stopPropagation()}
                  />
                </TransformComponent>
              </TransformWrapper>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};