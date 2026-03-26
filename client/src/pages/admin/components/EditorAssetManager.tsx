import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit, X } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

interface EditorAssetManagerProps {
    projectsList: any[];
}

export const EditorAssetManager: React.FC<EditorAssetManagerProps> = ({ projectsList }) => {
    const { token } = useAuthStore();
    const [editorForm, setEditorForm] = useState({ projectId: '', category: 'Render de Galería', label: '' });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [assetList, setAssetList] = useState<any[]>([]);
    const [editingAsset, setEditingAsset] = useState<any | null>(null);
    const [editForm, setEditForm] = useState<any>({});

    const [vrCategory, setVrCategory] = useState<string>('');
    const [vrEntityName, setVrEntityName] = useState<string>('');
    const [vrAreaName, setVrAreaName] = useState<string>('');

    const [geoLat, setGeoLat] = useState<number | ''>('');
    const [geoLng, setGeoLng] = useState<number | ''>('');
    const [geoAlt, setGeoAlt] = useState<number>(0);
    const [geoRotation, setGeoRotation] = useState<number>(0);
    const [geoScale, setGeoScale] = useState<number>(1);
    
    // --- ESTADO: PREVIEW METADATA ---
    const [previewMetadataForm, setPreviewMetadataForm] = useState({ 
        totalFloors: '', 
        unitTypes: '',
        heroSubtitle: '',
        section1Title: '',
        section1Desc: '',
        locationTitle: '',
        locationDesc: '',
        ctaTitle: '',
        ctaDesc: '',
        ctaButtonText: ''
    });
    const [isSavingMetadata, setIsSavingMetadata] = useState(false);

    useEffect(() => {
        if (editorForm.projectId) {
            const project = projectsList.find(p => p.id.toString() === editorForm.projectId);
            
            // Sync Assets
            if (project?.slug) {
                fetch(`/api/projects/${project.slug}`)
                    .then(res => res.json())
                    .then(data => setAssetList(data.assets || []))
                    .catch(e => console.error(e));
            }

            // Sync Preview Metadata
            if (project) {
                setEditorForm(prev => ({ ...prev, category: project.isPreview ? 'Logo Principal' : 'Render de Galería' }));
                setPreviewMetadataForm({
                    totalFloors: project.previewMetadata?.totalFloors?.toString() || '',
                    unitTypes: Array.isArray(project.previewMetadata?.unitTypes) 
                        ? project.previewMetadata.unitTypes.join(', ') 
                        : (project.previewMetadata?.unitTypes || ''),
                    heroSubtitle: project.previewMetadata?.heroSubtitle || '',
                    section1Title: project.previewMetadata?.section1Title || '',
                    section1Desc: project.previewMetadata?.section1Desc || '',
                    locationTitle: project.previewMetadata?.locationTitle || '',
                    locationDesc: project.previewMetadata?.locationDesc || '',
                    ctaTitle: project.previewMetadata?.ctaTitle || '',
                    ctaDesc: project.previewMetadata?.ctaDesc || '',
                    ctaButtonText: project.previewMetadata?.ctaButtonText || ''
                });
            }
        } else {
            setAssetList([]);
            setPreviewMetadataForm({ 
                totalFloors: '', 
                unitTypes: '',
                heroSubtitle: '',
                section1Title: '',
                section1Desc: '',
                locationTitle: '',
                locationDesc: '',
                ctaTitle: '',
                ctaDesc: '',
                ctaButtonText: ''
            });
        }
    }, [editorForm.projectId, projectsList]);

    const handleSavePreviewMetadata = async () => {
        const project = projectsList.find(p => p.id.toString() === editorForm.projectId);
        if (!project) return;

        setIsSavingMetadata(true);
        try {
            const updatedMetadata = {
                ...project.previewMetadata,
                totalFloors: previewMetadataForm.totalFloors ? parseInt(previewMetadataForm.totalFloors) : null,
                unitTypes: previewMetadataForm.unitTypes ? previewMetadataForm.unitTypes.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '') : [],
                heroSubtitle: previewMetadataForm.heroSubtitle,
                section1Title: previewMetadataForm.section1Title,
                section1Desc: previewMetadataForm.section1Desc,
                locationTitle: previewMetadataForm.locationTitle,
                locationDesc: previewMetadataForm.locationDesc,
                ctaTitle: previewMetadataForm.ctaTitle,
                ctaDesc: previewMetadataForm.ctaDesc,
                ctaButtonText: previewMetadataForm.ctaButtonText
            };

            const response = await fetch(`/api/projects/${project.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ previewMetadata: updatedMetadata })
            });

            if (!response.ok) throw new Error('Error al actualizar metadata');
            alert('✅ Detalles del Preview actualizados con éxito');
            
            // Refrescar lista de proyectos para actualizar el estado local (asumiendo que AdminDashboard lo maneja)
            // En un flujo ideal, llamaríamos a una función de refresh provista por props.
            window.location.reload(); // Hard refresh temporal para asegurar consistencia
        } catch (error) {
            console.error('Error saving metadata:', error);
            alert('❌ Fallo al guardar los detalles');
        } finally {
            setIsSavingMetadata(false);
        }
    };

    const handleDeleteAsset = async (assetId: number) => {
        const isConfirmed = window.confirm('¿Estás seguro de eliminar este asset? Esta acción no se puede deshacer.');
        if (!isConfirmed) return;
        try {
            const response = await fetch(`/api/admin/assets/${assetId}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Fallo al eliminar el asset');
            setAssetList((prev) => prev.filter((asset) => asset.id !== assetId));
        } catch (error) {
            console.error('[AssetUploader] Error:', error);
            alert('No se pudo eliminar el asset. Intenta de nuevo.');
        }
    };

    const openEditModal = (asset: any) => {
        setEditingAsset(asset);
        setEditForm(asset);
    };

    const handleSaveEdit = async () => {
        try {
            const response = await fetch(`/api/admin/assets/${editingAsset.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(editForm),
            });

            if (!response.ok) throw new Error('Error al guardar');
            const updatedAsset = await response.json();

            setAssetList((prev) => prev.map((a) => (a.id === updatedAsset.id ? updatedAsset : a)));
            setEditingAsset(null);
        } catch (err) {
            console.error('[AssetUploader] Error:', err);
            alert('Error al actualizar el asset');
        }
    };

    const handleFileUpload = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedFile || !editorForm.projectId) {
            setUploadMessage({ type: 'error', text: '⚠️ Por favor selecciona un proyecto y un archivo.' });
            return;
        }

        setIsUploading(true);
        setUploadMessage(null);

        try {
            const uploadData = new FormData();
            uploadData.append('file', selectedFile);
            uploadData.append('projectId', editorForm.projectId);
            uploadData.append('category', editorForm.category);
            if (['Render de Galería', 'Plano Base (.webp)', 'Capa Interactiva (.svg)', 'Preview - Fachada (.webp)', 'Preview - Video Intro (.mp4)', 'Preview - Mapa Estático (.webp)'].includes(editorForm.category) && editorForm.label) {
                uploadData.append('label', editorForm.label);
            }
            if (editorForm.category === 'vr_view_360') {
                uploadData.append('vrCategory', vrCategory);
                uploadData.append('vrEntityName', vrEntityName);
                uploadData.append('vrAreaName', vrAreaName);
            }
            if (['map_3d_model', 'Modelo 3D Arquitectónico (.glb)'].includes(editorForm.category)) {
                uploadData.append('geoLat', geoLat.toString());
                uploadData.append('geoLng', geoLng.toString());
                uploadData.append('geoAlt', geoAlt.toString());
                uploadData.append('geoRotation', geoRotation.toString());
                uploadData.append('geoScale', geoScale.toString());
            }

            const response = await fetch('/api/admin/assets', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` },
                body: uploadData
            });

            if (!response.ok) throw new Error('Error en la subida a R2');

            setUploadMessage({ type: 'success', text: '✅ Asset subido con éxito a Cloudflare R2 y Neon DB.' });
            setSelectedFile(null);

            const project = projectsList.find(p => p.id.toString() === editorForm.projectId);
            if (project?.slug) {
                fetch(`/api/projects/${project.slug}`)
                    .then(res => res.json())
                    .then(data => setAssetList(data.assets || []));
            }

        } catch (error) {
            console.error('Error en la tubería de assets:', error);
            setUploadMessage({ type: 'error', text: '❌ Hubo un error al subir el asset. Revisa la consola.' });
        } finally {
            setIsUploading(false);
            setTimeout(() => setUploadMessage(null), 4000);
        }
    };

    const memoizedAssetTable = useMemo(() => (
        <tbody className="divide-y divide-gray-200 bg-white">
            {assetList.map((asset) => {
                const urlFileName = asset.r2Url ? asset.r2Url.split('/').pop() : (asset.url ? asset.url.split('/').pop() : 'desconocido');
                const isImage = /\.(jpeg|jpg|gif|png|webp)$/i.test(asset.r2Url || asset.url || '');
                return (
                    <tr key={asset.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 w-16">
                            {isImage ? (
                                <img src={asset.r2Url || asset.url} loading="lazy" decoding="async" alt="preview" className="h-10 w-10 object-cover rounded shadow-sm bg-gray-100 flex-shrink-0" />
                            ) : (
                                <span className="inline-flex h-10 w-10 bg-slate-100 rounded items-center justify-center text-[10px] text-slate-500 font-medium truncate uppercase border border-slate-200">
                                    {asset.type?.split('/').pop() || 'FILE'}
                                </span>
                            )}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-900 max-w-[200px] truncate" title={asset.name || urlFileName}>
                            {asset.label ? `${asset.label} ` : ''}
                            <span className="text-gray-500 font-normal">{asset.name || urlFileName}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                            <span className="px-2 py-1 bg-cyan-50 text-cyan-700 border border-cyan-100/50 rounded-full text-xs font-medium whitespace-nowrap">
                                {asset.category}
                            </span>
                        </td>
                        <td className="px-4 py-3 text-right flex justify-end gap-2">
                            <button
                                onClick={() => openEditModal(asset)}
                                className="p-2 bg-blue-100 text-blue-600 hover:bg-blue-200 hover:text-blue-700 rounded-md transition-colors inline-flex items-center justify-center"
                                title="Editar Metadata"
                            >
                                <Edit className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleDeleteAsset(asset.id)}
                                className="p-2 bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 rounded-md transition-colors inline-flex items-center justify-center"
                                title="Eliminar Asset Base de Datos"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </td>
                    </tr>
                );
            })}
        </tbody>
    ), [assetList]);

    return (
        <section className="animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-800">Gestor de Assets (R2)</h3>
            <p className="text-slate-500 mt-1 text-sm">Sube Renders, Capas SVG interactivas y Planos directamente al Edge.</p>

            {/* --- PANEL DE METADATA PARA PREVIEWS --- */}
            {(() => {
                const project = projectsList.find(p => p.id.toString() === editorForm.projectId);
                if (!project || !project.isPreview) return null;

                return (
                    <div className="mt-6 bg-[#121217]/95 rounded-[1.5rem] border border-white/5 p-6 mb-8 shadow-2xl backdrop-blur-xl animate-in slide-in-from-top-4 duration-500">
                        <div className="flex items-center gap-3 mb-6">
                            <span className="text-2xl">📋</span>
                            <div>
                                <h4 className="text-white font-bold text-lg">Detalles del Preview: {project.name}</h4>
                                <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold">Configuración de Proyecto en Planos</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Número total de pisos</label>
                                <input 
                                    type="number" 
                                    value={previewMetadataForm.totalFloors}
                                    onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, totalFloors: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                    placeholder="Ej. 15"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest ml-1">Tipos de Unidades (Separados por coma)</label>
                                <input 
                                    type="text" 
                                    value={previewMetadataForm.unitTypes}
                                    onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, unitTypes: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                    placeholder="Ej. Suites, Monoambientes, Locales"
                                />
                            </div>
                        </div>

                        {/* --- NUEVA SUB-SECCIÓN: TEXTOS Y COPY --- */}
                        <div className="mt-8 pt-6 border-t border-white/5 space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-lg">✍️</span>
                                <h5 className="text-white font-bold text-sm uppercase tracking-wider">Textos y Copy de la Landing</h5>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Hero: Subtítulo</label>
                                <input 
                                    type="text" 
                                    value={previewMetadataForm.heroSubtitle}
                                    onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, heroSubtitle: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                    placeholder="Ej. Descubre el próximo gran hito arquitectónico..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sección 1: Título</label>
                                    <input 
                                        type="text" 
                                        value={previewMetadataForm.section1Title}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, section1Title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ej. Diseño que Inspira. Espacios que Transforman."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Sección 1: Descripción</label>
                                    <textarea 
                                        rows={2}
                                        value={previewMetadataForm.section1Desc}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, section1Desc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20 resize-none"
                                        placeholder="Ej. Estamos construyendo una experiencia residencial sin precedentes..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ubicación: Título</label>
                                    <input 
                                        type="text" 
                                        value={previewMetadataForm.locationTitle}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, locationTitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ej. Ubicación Estratégica"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Ubicación: Descripción</label>
                                    <textarea 
                                        rows={2}
                                        value={previewMetadataForm.locationDesc}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, locationDesc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20 resize-none"
                                        placeholder="Ej. Conecta con los puntos más importantes de la ciudad..."
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CTA: Título</label>
                                    <input 
                                        type="text" 
                                        value={previewMetadataForm.ctaTitle}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, ctaTitle: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ej. ¿Te interesa ser parte de...?"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CTA: Descripción</label>
                                    <input 
                                        type="text" 
                                        value={previewMetadataForm.ctaDesc}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, ctaDesc: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ej. Agenda una cita personalizada..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">CTA: Texto Botón</label>
                                    <input 
                                        type="text" 
                                        value={previewMetadataForm.ctaButtonText}
                                        onChange={(e) => setPreviewMetadataForm({ ...previewMetadataForm, ctaButtonText: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all placeholder:text-white/20"
                                        placeholder="Ej. CONTACTAR POR WHATSAPP"
                                    />
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSavePreviewMetadata}
                            disabled={isSavingMetadata}
                            className="mt-6 w-full md:w-auto px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isSavingMetadata ? 'Guardando Detalles...' : 'Guardar Cambios de Detalles'}
                        </button>
                    </div>
                );
            })()}

            <div className="mt-6 bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-xl">
                <form onSubmit={handleFileUpload} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto Destino</label>
                        <select
                            required
                            value={editorForm.projectId}
                            onChange={(e) => setEditorForm({ ...editorForm, projectId: e.target.value })}
                            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        >
                            <option value="" disabled>Selecciona un proyecto...</option>
                            {projectsList.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.slug})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Categoría del Asset</label>
                        <select
                            required
                            value={editorForm.category}
                            onChange={(e) => setEditorForm({ ...editorForm, category: e.target.value })}
                            className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                        >
                            {(() => {
                                const selectedProject = projectsList.find(p => p.id.toString() === editorForm.projectId);
                                const isPreviewProject = selectedProject?.isPreview === true;

                                if (isPreviewProject) {
                                    return (
                                        <>
                                            <option value="Logo Principal">Logo Principal</option>
                                            <option value="Preview - Tarjeta Home (Video .mp4)">Preview - Tarjeta Home (Video .mp4)</option>
                                            <option value="Preview - Tarjeta Home (Imagen .webp/.jpg/.png)">Preview - Tarjeta Home (Imagen .webp/.jpg/.png)</option>
                                            <option value="Preview - Hero Interior (Video .mp4)">Preview - Hero Interior (Video .mp4)</option>
                                            <option value="Preview - Hero Interior (Imagen .webp/.jpg/.png)">Preview - Hero Interior (Imagen .webp/.jpg/.png)</option>
                                            <option value="Preview - Mapa Estático (.webp)">Preview - Mapa Estático (.webp)</option>
                                            <option value="Modelo 3D Arquitectónico (.glb)">Modelo 3D Arquitectónico (.glb)</option>
                                        </>
                                    );
                                }

                                return (
                                    <>
                                        <option value="Logo Principal">Logo Principal (.png) - Logo transparente del proyecto</option>
                                        <option value="Video de Intro (.mp4)">Video de Intro (.mp4) - Reproducción de carga antes de entrar</option>
                                        <option value="Render de Intro (.webp)">Render de Intro (.webp) - Imagen estática si no hay video de intro</option>
                                        <option value="Video Principal (.mp4)">Video de Portada (.mp4) - Fondo para la tarjeta en el Inicio</option>
                                        <option value="Render Principal (Cover)">Render de Portada (.webp) - Foto para la tarjeta en el Inicio</option>
                                        <option value="Video Hero Interior (.mp4) - Carrusel de inicio">Video Hero Interior (.mp4) - Carrusel de inicio</option>
                                        <option value="Render Hero Interior (.webp) - Carrusel estático de inicio">Render Hero Interior (.webp) - Carrusel estático de inicio</option>
                                        <option value="Render de Galería">Render de Galería (.webp) - Fotos para la sección "Renders"</option>
                                        <option value="Plano Base (.webp)">Plano Base (.webp) - Imagen de fondo del piso</option>
                                        <option value="Capa Interactiva (.svg)">Capa Interactiva (.svg) - Polígonos clickeables</option>
                                        <option value="vr_view_360">Vista 360° (.webp/jpg) - Tour interactivo panorámico</option>
                                        <option value="map_city">Mapa: Ciudad</option>
                                        <option value="map_sector">Mapa: Sector</option>
                                        <option value="map_neighborhood">Mapa: Barrio</option>
                                        <option value="map_3d_model">Mapa Interactivo 3D (.glb)</option>
                                    </>
                                );
                            })()}
                        </select>
                    </div>

                    {['Render de Galería', 'Plano Base (.webp)', 'Capa Interactiva (.svg)', 'Preview - Fachada (.webp)', 'Preview - Video Intro (.mp4)', 'Preview - Mapa Estático (.webp)'].includes(editorForm.category) && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300 bg-slate-50 p-4 rounded-lg border border-slate-100 mb-4">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Sección / Agrupación (Label)</label>
                            <input
                                type="text"
                                required
                                placeholder={
                                    editorForm.category === 'Render de Galería'
                                        ? "Ej. Exteriores, Sala, Áreas Comunes"
                                        : "Nombre de la Planta (Ej. Piso 1). DEBE SER EXACTAMENTE IGUAL en el Plano Base y en la Capa SVG."
                                }
                                value={editorForm.label}
                                onChange={(e) => setEditorForm({ ...editorForm, label: e.target.value })}
                                className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                            />
                            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                                {editorForm.category === 'Render de Galería'
                                    ? "Escribe a qué sección pertenece esta foto. Las fotos con el mismo nombre se agruparán automáticamente en la galería."
                                    : "Este campo vincula la imagen base con su mapa interactivo. Usa el mismo texto para ambos."}
                            </p>
                            {['Plano Base (.webp)', 'Capa Interactiva (.svg)'].includes(editorForm.category) && (
                                <p className="text-xs text-amber-600 mt-1 font-medium">
                                    Atención: Los nombres deben ser idénticos para que el emparejamiento sea automático.
                                </p>
                            )}
                        </div>
                    )}

                    {editorForm.category === 'vr_view_360' && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50/50">
                            <div className="flex flex-col space-y-1">
                                <label className="text-sm font-medium text-gray-700">Categoría 360°</label>
                                <input type="text" placeholder="Ej. Suite, Departamento..." value={vrCategory} onChange={(e) => setVrCategory(e.target.value)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <label className="text-sm font-medium text-gray-700">Unidad / Entidad</label>
                                <input type="text" placeholder="Ej. Suite 101, Depto 304..." value={vrEntityName} onChange={(e) => setVrEntityName(e.target.value)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                            </div>
                            <div className="flex flex-col space-y-1">
                                <label className="text-sm font-medium text-gray-700">Ambiente</label>
                                <input type="text" placeholder="Ej. Área Social, Dormitorio..." value={vrAreaName} onChange={(e) => setVrAreaName(e.target.value)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required />
                            </div>
                        </div>
                    )}

                    {['map_3d_model', 'Modelo 3D Arquitectónico (.glb)'].includes(editorForm.category) && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mt-4 p-4 border border-gray-200 rounded-md bg-gray-50/50">
                            <div className="flex flex-col space-y-1"><label className="text-sm font-medium text-gray-700">Latitud</label><input type="number" step="any" placeholder="Ej. -0.180653" value={geoLat} onChange={(e) => setGeoLat(e.target.value as any)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required /></div>
                            <div className="flex flex-col space-y-1"><label className="text-sm font-medium text-gray-700">Longitud</label><input type="number" step="any" placeholder="Ej. -78.467834" value={geoLng} onChange={(e) => setGeoLng(e.target.value as any)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" required /></div>
                            <div className="flex flex-col space-y-1"><label className="text-sm font-medium text-gray-700">Altitud (m)</label><input type="number" step="any" value={geoAlt} onChange={(e) => setGeoAlt(e.target.value as any)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" /></div>
                            <div className="flex flex-col space-y-1"><label className="text-sm font-medium text-gray-700">Rotación (°)</label><input type="number" step="any" value={geoRotation} onChange={(e) => setGeoRotation(e.target.value as any)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" /></div>
                            <div className="flex flex-col space-y-1"><label className="text-sm font-medium text-gray-700">Escala</label><input type="number" step="any" value={geoScale} onChange={(e) => setGeoScale(e.target.value as any)} className="px-3 py-2 border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm" /></div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Archivo</label>
                        <input
                            type="file"
                            required
                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-slate-600 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 transition-colors"
                        />
                    </div>

                    {uploadMessage && (
                        <div className={`p-3 rounded-md text-sm font-medium animate-in zoom-in duration-200 ${uploadMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                            {uploadMessage.text}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-60 flex items-center justify-center font-medium mt-2 shadow-sm"
                    >
                        {isUploading ? (
                            <span className="animate-pulse flex items-center gap-2">
                                <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                                Subiendo a R2...
                            </span>
                        ) : 'Subir Archivo'}
                    </button>
                </form>
            </div>

            <div className="mt-8 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Assets Actuales del Proyecto</h3>

                {assetList.length === 0 ? (
                    <p className="text-sm text-gray-500">No hay assets subidos para este proyecto o selecciona un proyecto arriba.</p>
                ) : (
                    <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm max-h-[500px] overflow-y-auto">
                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                            <thead className="bg-gray-50 sticky top-0 z-10">
                                <tr>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Preview</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Nombre / Etiqueta</th>
                                    <th className="px-4 py-3 text-left font-medium text-gray-700">Categoría</th>
                                    <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
                                </tr>
                            </thead>
                            {memoizedAssetTable}
                        </table>
                    </div>
                )}

                {editingAsset && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-xl animate-in fade-in zoom-in-95 duration-200 max-h-[85vh] overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-slate-800">Editar Metadata del Asset</h3>
                                <button onClick={() => setEditingAsset(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                <div className="col-span-full border-b border-slate-100 pb-4 mb-2">
                                    <label className="text-sm font-bold text-slate-700 block mb-1.5">Nombre / Título</label>
                                    <input 
                                        type="text" 
                                        placeholder="Ej: Cocina Principal, Fachada Posterior..." 
                                        value={editForm.name || ''} 
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} 
                                        className="border border-slate-300 p-3 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all shadow-sm font-medium" 
                                    />
                                </div>

                                {['map_3d_model', 'Modelo 3D Arquitectónico (.glb)'].includes(editingAsset.category) && (
                                    <>
                                        <div><label className="text-sm text-slate-600 block mb-1">Latitud</label><input type="number" step="any" placeholder="Latitud" value={editForm.geoLat || ''} onChange={(e) => setEditForm({ ...editForm, geoLat: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Longitud</label><input type="number" step="any" placeholder="Longitud" value={editForm.geoLng || ''} onChange={(e) => setEditForm({ ...editForm, geoLng: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Altitud</label><input type="number" step="any" placeholder="Altitud" value={editForm.geoAlt ?? ''} onChange={(e) => setEditForm({ ...editForm, geoAlt: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Rotación</label><input type="number" step="any" placeholder="Rotación" value={editForm.geoRotation ?? ''} onChange={(e) => setEditForm({ ...editForm, geoRotation: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Escala</label><input type="number" step="any" placeholder="Escala" value={editForm.geoScale ?? ''} onChange={(e) => setEditForm({ ...editForm, geoScale: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        
                                        <div className="col-span-full border-t border-slate-100 pt-4 mt-2">
                                            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                                📸 Calibración de Vistas de Cámara
                                            </h4>
                                            
                                            <div className="space-y-4">
                                                {['ciudad', 'sector', 'barrio'].map((view) => (
                                                    <div key={view} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                                                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">{view}</label>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="text-[9px] text-slate-500 block">Zoom</label>
                                                                <input 
                                                                    type="number" step="0.1" 
                                                                    value={editForm.metadata?.cameraViews?.[view]?.zoom ?? ''} 
                                                                    onChange={(e) => setEditForm({
                                                                        ...editForm,
                                                                        metadata: {
                                                                            ...editForm.metadata,
                                                                            cameraViews: {
                                                                                ...editForm.metadata?.cameraViews,
                                                                                [view]: { ...editForm.metadata?.cameraViews?.[view], zoom: parseFloat(e.target.value) }
                                                                            }
                                                                        }
                                                                    })} 
                                                                    className="w-full text-xs p-1.5 border rounded" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-slate-500 block">Tilt</label>
                                                                <input 
                                                                    type="number" step="1" 
                                                                    value={editForm.metadata?.cameraViews?.[view]?.tilt ?? ''} 
                                                                    onChange={(e) => setEditForm({
                                                                        ...editForm,
                                                                        metadata: {
                                                                            ...editForm.metadata,
                                                                            cameraViews: {
                                                                                ...editForm.metadata?.cameraViews,
                                                                                [view]: { ...editForm.metadata?.cameraViews?.[view], tilt: parseFloat(e.target.value) }
                                                                            }
                                                                        }
                                                                    })} 
                                                                    className="w-full text-xs p-1.5 border rounded" 
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="text-[9px] text-slate-500 block">Heading</label>
                                                                <input 
                                                                    type="number" step="1" 
                                                                    value={editForm.metadata?.cameraViews?.[view]?.heading ?? ''} 
                                                                    onChange={(e) => setEditForm({
                                                                        ...editForm,
                                                                        metadata: {
                                                                            ...editForm.metadata,
                                                                            cameraViews: {
                                                                                ...editForm.metadata?.cameraViews,
                                                                                [view]: { ...editForm.metadata?.cameraViews?.[view], heading: parseFloat(e.target.value) }
                                                                            }
                                                                        }
                                                                    })} 
                                                                    className="w-full text-xs p-1.5 border rounded" 
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                                {editingAsset.category === 'vr_view_360' && (
                                    <>
                                        <div><label className="text-sm text-slate-600 block mb-1">Categoría</label><input type="text" placeholder="Categoría (Ej. Suite)" value={editForm.vrCategory || ''} onChange={(e) => setEditForm({ ...editForm, vrCategory: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Entidad</label><input type="text" placeholder="Entidad (Ej. Suite 101)" value={editForm.vrEntityName || ''} onChange={(e) => setEditForm({ ...editForm, vrEntityName: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                        <div><label className="text-sm text-slate-600 block mb-1">Ambiente</label><input type="text" placeholder="Ambiente (Ej. Área Social)" value={editForm.vrAreaName || ''} onChange={(e) => setEditForm({ ...editForm, vrAreaName: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                    </>
                                )}
                                {!['map_3d_model', 'Modelo 3D Arquitectónico (.glb)', 'vr_view_360'].includes(editingAsset.category) && (
                                    <div><label className="text-sm text-slate-600 block mb-1">Nombre Público (Etiqueta)</label><input type="text" placeholder="Nombre (Label)" value={editForm.label || ''} onChange={(e) => setEditForm({ ...editForm, label: e.target.value })} className="border border-slate-300 p-2.5 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all" /></div>
                                )}
                            </div>

                            <div className="mt-8 flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button onClick={() => setEditingAsset(null)} className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-md font-medium transition-colors">Cancelar</button>
                                <button onClick={handleSaveEdit} className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors shadow-sm flex items-center justify-center min-w-[140px]">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
