import React, { useState, useEffect } from 'react';
import { useAdminStore, AdminRole } from '../../store/adminStore';
import { useAuthStore } from '../../store/useAuthStore';
import { EditorAssetManager } from './components/EditorAssetManager';
import { EditorUnitManager } from './components/EditorUnitManager';
import { SellerManager } from './components/SellerManager';
import { UserManager } from './components/UserManager';

// --- CACHÉ DE RENDIMIENTO PARA PARSEO SVG ---
const svgIdCache = new Map<string, string[]>();

const fetchAndParseSvgIds = async (url: string): Promise<string[]> => {
  if (!url) return [];
  if (svgIdCache.has(url)) return svgIdCache.get(url)!; // Retorna desde la memoria instantáneamente
  
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Fallo al cargar SVG');
    const text = await res.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "image/svg+xml");
    const ids = Array.from(doc.querySelectorAll('[id]'))
        .map(el => el.id)
        .filter(id => id && !id.startsWith('Layer_') && !id.startsWith('Capa_'));
    const uniqueIds = Array.from(new Set(ids));
    
    svgIdCache.set(url, uniqueIds); // Guarda en caché para futuros renders
    return uniqueIds;
  } catch (err) {
    console.error("Error parseando SVG:", err);
    return [];
  }
};

export const AdminDashboard: React.FC = () => {
    // Session State
    const { user, logout } = useAuthStore();
    const realRole = user?.role || 'VENDEDOR';
    
    // Tab State (Starts at user's real role, unless Super Admin which starts at Admin)
    const [activeTab, setActiveTab] = useState<string>(realRole === 'SUPER_ADMIN' ? 'Admin' : realRole === 'ADMIN' ? 'Admin' : realRole === 'EDITOR' ? 'Editor' : 'VENDEDOR');

    // Available Tabs calculation
    const getAvailableTabs = () => {
      const tabs = [];
      if (realRole === 'SUPER_ADMIN') tabs.push('Equipo', 'Admin', 'Editor', 'Vendedor');
      if (realRole === 'ADMIN') tabs.push('Admin', 'Editor', 'Vendedor');
      if (realRole === 'EDITOR') tabs.push('Editor');
      if (realRole === 'VENDEDOR') tabs.push('Vendedor');
      return tabs; // Ensuring backward compatibility with the mock labels
    };
    const availableTabs = getAvailableTabs();

    // --- ESTADO: ADMIN (Crear Proyecto) ---
    const [formData, setFormData] = useState({ 
        name: '', 
        description: '', 
        slug: '', 
        isPreview: false,
        previewMetadata: {
            totalFloors: '',
            unitTypes: ''
        }
    });
    const [isLoading, setIsLoading] = useState(false);
    const [projectsList, setProjectsList] = useState<any[]>([]);

    useEffect(() => {
        if (activeTab === 'Editor' || activeTab === 'Vendedor' || activeTab === 'VENDEDOR') {
            fetch('/api/projects')
                .then((res) => {
                    if (!res.ok) throw new Error('Fallo en la red al obtener proyectos');
                    return res.json();
                })
                .then((data) => setProjectsList(data))
                .catch((err) => console.error('Error al obtener proyectos para el CMS:', err));
        }
    }, [activeTab]);

    const handleCreateProject = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const response = await fetch('/api/projects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (!response.ok) throw new Error('Error en la petición');
            alert('✅ Proyecto creado con éxito en Neon DB');
            setFormData({ 
                name: '', 
                description: '', 
                slug: '',
                isPreview: false,
                previewMetadata: {
                    totalFloors: '',
                    unitTypes: ''
                }
            });
        } catch (error) {
            console.error(error);
            alert('❌ Hubo un error al crear el proyecto');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto font-sans text-slate-900">
            <header className="mb-8 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Panel CMS Básico</h1>
                    <p className="text-slate-500 mt-1">CoFinancia.me - Gestión Inmobiliaria ({user?.email})</p>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {availableTabs.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                activeTab === tab || (activeTab === 'VENDEDOR' && tab === 'Vendedor')
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-slate-600 hover:text-slate-900'
                            }`}
                        >
                            {tab}
                        </button>
                    ))}
                    <button onClick={logout} className="ml-2 px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-100">
                      Salir
                    </button>
                </div>
            </header>

            <main className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 min-h-[500px]">
                <h2 className="text-xl font-semibold border-b border-slate-100 pb-4 mb-6">
                    Vista Operativa: <span className="text-blue-600">{activeTab}</span>
                </h2>

                {activeTab === 'Equipo' && <UserManager />}

                {activeTab === 'Admin' && (
                    <section className="animate-in fade-in duration-300">
                        <h3 className="text-lg font-bold text-slate-800">Crear Proyecto</h3>
                        <p className="text-slate-500 mt-1 text-sm">Gestión integral de nuevos desarrollos inmobiliarios.</p>

                        <form onSubmit={handleCreateProject} className="mt-6 space-y-4 max-w-md bg-slate-50 p-4 border border-slate-200 rounded-lg">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Nombre del Proyecto</label>
                                <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Ej. Residencial Siena" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Ubicación / Slug</label>
                                <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" placeholder="Ej. sector-norte-siena" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Descripción</label>
                                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none" rows={3} placeholder="Detalles del proyecto..."></textarea>
                            </div>

                            <div className="pt-4 border-t border-slate-200">
                                <div className="flex items-center justify-between p-3 bg-slate-100/50 rounded-lg border border-slate-200">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">Proyecto en fase de Preview</span>
                                        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Coming Soon</span>
                                    </div>
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer"
                                            checked={formData.isPreview}
                                            onChange={(e) => setFormData({ ...formData, isPreview: e.target.checked })}
                                        />
                                        <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                                    </label>
                                </div>
                            </div>

                            {formData.isPreview && (
                                <div className="animate-in fade-in slide-in-from-top-2 duration-300 grid grid-cols-2 gap-3 p-3 bg-blue-50/50 border border-blue-100 rounded-lg shadow-sm">
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Pisos (Est.)</label>
                                        <input 
                                            type="number" 
                                            value={formData.previewMetadata.totalFloors} 
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                previewMetadata: { ...formData.previewMetadata, totalFloors: e.target.value } 
                                            })} 
                                            className="w-full bg-white border border-blue-200 rounded p-2 text-xs focus:ring-1 focus:ring-blue-400 outline-none"
                                            placeholder="Ej. 12"
                                        />
                                    </div>
                                    <div className="col-span-1">
                                        <label className="block text-[10px] font-bold text-blue-600 uppercase mb-1">Tipos Unidad</label>
                                        <input 
                                            type="text" 
                                            value={formData.previewMetadata.unitTypes} 
                                            onChange={(e) => setFormData({ 
                                                ...formData, 
                                                previewMetadata: { ...formData.previewMetadata, unitTypes: e.target.value } 
                                            })} 
                                            className="w-full bg-white border border-blue-200 rounded p-2 text-xs focus:ring-1 focus:ring-blue-400 outline-none"
                                            placeholder="Suites, Locales..."
                                        />
                                    </div>
                                </div>
                            )}
                            <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50">
                                {isLoading ? 'Guardando en BD...' : 'Guardar Proyecto'}
                            </button>
                        </form>
                    </section>
                )}

                {(activeTab === 'Editor') && (
                    <>
                        <EditorAssetManager projectsList={projectsList} />
                        <EditorUnitManager projectsList={projectsList} fetchAndParseSvgIds={fetchAndParseSvgIds} />
                    </>
                )}

                {(activeTab === 'Vendedor' || activeTab === 'VENDEDOR') && (
                    <SellerManager projectsList={projectsList} fetchAndParseSvgIds={fetchAndParseSvgIds} />
                )}
            </main>
        </div>
    );
};