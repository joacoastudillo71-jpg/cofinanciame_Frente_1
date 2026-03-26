import React, { useState, useEffect, useMemo } from 'react';
import { Trash2, Edit, X, Layers } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

interface EditorUnitManagerProps {
    projectsList: any[];
    fetchAndParseSvgIds: (url: string) => Promise<string[]>;
}

export const EditorUnitManager: React.FC<EditorUnitManagerProps> = ({ projectsList, fetchAndParseSvgIds }) => {
    const { token } = useAuthStore();
    const [filterPlanta, setFilterPlanta] = useState<string>('ALL');
    const [filterPlantaIds, setFilterPlantaIds] = useState<string[]>([]);
    const [isFilteringSvg, setIsFilteringSvg] = useState(false);

    const [unitForm, setUnitForm] = useState({
        projectId: '', svgId: '', name: '', price: '', area: '', rooms: '', bathrooms: '',
        status: 'Disponible', habitableArea: '', terraceArea: '', parkingCount: '', parkingArea: '',
        storageCount: '', storageArea: '', isDuplex: false, duplexLevel: ''
    });
    const [isCreatingUnit, setIsCreatingUnit] = useState(false);
    const [unitMessage, setUnitMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const [editorUnitsList, setEditorUnitsList] = useState<any[]>([]);
    const [editingUnit, setEditingUnit] = useState<any | null>(null);
    const [editUnitForm, setEditUnitForm] = useState<any>({});

    const [availableSvgAssets, setAvailableSvgAssets] = useState<any[]>([]);
    const [selectedSvgUrl, setSelectedSvgUrl] = useState<string>('');
    const [availableSvgIds, setAvailableSvgIds] = useState<string[]>([]);
    const [isParsingSvg, setIsParsingSvg] = useState(false);
    const [isLoadingAssets, setIsLoadingAssets] = useState(false);

    useEffect(() => {
        const parseFilterSvg = async () => {
            if (filterPlanta === 'ALL' || !filterPlanta) {
                setFilterPlantaIds([]);
                return;
            }
            setIsFilteringSvg(true);
            const ids = await fetchAndParseSvgIds(filterPlanta);
            setFilterPlantaIds(ids);
            setIsFilteringSvg(false);
        };
        parseFilterSvg();
    }, [filterPlanta, fetchAndParseSvgIds]);

    useEffect(() => {
        const fetchProjectAssets = async () => {
            if (!unitForm.projectId) {
                setAvailableSvgAssets([]);
                setSelectedSvgUrl('');
                setAvailableSvgIds([]);
                setUnitForm(prev => ({ ...prev, svgId: '' }));
                return;
            }

            setIsLoadingAssets(true);
            try {
                const selectedProject = projectsList.find(p => String(p.id) === String(unitForm.projectId));
                const projectSlug = selectedProject?.slug;

                if (!projectSlug) throw new Error('No se pudo determinar el slug del proyecto seleccionado.');

                const res = await fetch(`/api/projects/${projectSlug}`);
                if (!res.ok) throw new Error('Error al obtener el proyecto');
                const projectData = await res.json();

                const svgAssets = projectData.assets?.filter((a: any) =>
                    a.category?.includes('Capa Interactiva') ||
                    a.r2Url?.toLowerCase().endsWith('.svg')
                ) || [];

                setAvailableSvgAssets(svgAssets);
                setEditorUnitsList(projectData.units || []);

                setSelectedSvgUrl('');
                setAvailableSvgIds([]);
                setUnitForm(prev => ({ ...prev, svgId: '' }));
            } catch (err) {
                console.error("Error fetching project assets:", err);
                setAvailableSvgAssets([]);
            } finally {
                setIsLoadingAssets(false);
            }
        };

        fetchProjectAssets();
    }, [unitForm.projectId, projectsList]);

    useEffect(() => {
        const parseSelectedSvg = async () => {
            if (!selectedSvgUrl) {
                setAvailableSvgIds([]);
                setUnitForm(prev => ({ ...prev, svgId: '' }));
                return;
            }

            setIsParsingSvg(true);
            const uniqueIds = await fetchAndParseSvgIds(selectedSvgUrl);
            setAvailableSvgIds(uniqueIds);
            if (uniqueIds.length > 0) {
                setUnitForm(prev => ({ ...prev, svgId: uniqueIds[0] }));
            } else {
                setUnitForm(prev => ({ ...prev, svgId: '' }));
            }
            setIsParsingSvg(false);
        };

        parseSelectedSvg();
    }, [selectedSvgUrl, fetchAndParseSvgIds]);

    const filteredUnits = useMemo(() => {
        if (filterPlanta === 'ALL') return editorUnitsList;
        return editorUnitsList.filter((u: any) => filterPlantaIds.includes(u.identifier || u.svgId));
    }, [filterPlanta, editorUnitsList, filterPlantaIds]);

    const [adminPage, setAdminPage] = useState(1);
    const adminPageSize = 20;
    const totalAdminPages = Math.ceil(filteredUnits.length / adminPageSize);

    useEffect(() => { setAdminPage(1); }, [filterPlanta, filteredUnits.length]);

    const currentAdminUnits = filteredUnits.slice(
        (adminPage - 1) * adminPageSize,
        adminPage * adminPageSize
    );

    const handleCreateUnit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!unitForm.projectId || !unitForm.svgId) {
            setUnitMessage({ type: 'error', text: '⚠️ Selecciona un proyecto e ingresa un identificador SVG.' });
            return;
        }

        setIsCreatingUnit(true);
        setUnitMessage(null);

        try {
            const res = await fetch('/api/units', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(unitForm)
            });

            if (!res.ok) throw new Error('Fallo en la petición');
            const data = await res.json();

            if (data && data.id) {
                setEditorUnitsList(prev => [...prev, data]);
            }

            setUnitMessage({ type: 'success', text: '✅ Unidad registrada y vinculada a la DB correctamente.' });
            setUnitForm({
                ...unitForm, svgId: '', name: '', price: '', area: '', rooms: '', bathrooms: '',
                status: 'Disponible', habitableArea: '', terraceArea: '', parkingCount: '', parkingArea: '',
                storageCount: '', storageArea: '', isDuplex: false, duplexLevel: ''
            });
        } catch (err) {
            console.error('Error al crear unidad:', err);
            setUnitMessage({ type: 'error', text: '❌ Ocurrió un error al registrar la unidad.' });
        } finally {
            setIsCreatingUnit(false);
            setTimeout(() => setUnitMessage(null), 4000);
        }
    };

    const handleEditUnit = async () => {
        try {
            const response = await fetch(`/api/admin/units/${editingUnit.id}`, {
                method: 'PATCH',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify({
                    rooms: parseInt(editUnitForm.rooms || 0),
                    bathrooms: parseFloat(editUnitForm.bathrooms || 0),
                    area: parseFloat(editUnitForm.area || 0),
                    price: parseFloat(editUnitForm.price || 0),
                    habitableArea: parseFloat(editUnitForm.habitableArea || 0),
                    terraceArea: parseFloat(editUnitForm.terraceArea || 0),
                    parkingCount: parseInt(editUnitForm.parkingCount || 0),
                    parkingArea: parseFloat(editUnitForm.parkingArea || 0),
                    storageCount: parseInt(editUnitForm.storageCount || 0),
                    storageArea: parseFloat(editUnitForm.storageArea || 0),
                    isDuplex: editUnitForm.isDuplex,
                    duplexLevel: editUnitForm.duplexLevel,
                    label: editUnitForm.label,
                    type: editUnitForm.type,
                }),
            });

            if (!response.ok) throw new Error('Error al actualizar');
            const updated = await response.json();
            setEditorUnitsList((prev) => prev.map((u) => (u.id === updated.id ? updated : u)));
            setEditingUnit(null);
        } catch (err) {
            console.error(err);
            alert('Fallo al actualizar la unidad');
        }
    };

    const handleDeleteUnit = async (id: number) => {
        if (!window.confirm('¿Eliminar unidad? Esta acción no se puede deshacer.')) return;
        try {
            const res = await fetch(`/api/admin/units/${id}`, { 
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Error al eliminar');
            setEditorUnitsList(prev => prev.filter(u => u.id !== id));
        } catch (err) {
            console.error(err);
            alert('Fallo al eliminar la unidad');
        }
    };

    return (
        <section className="animate-in fade-in duration-300">
            <div className="mt-8 border-t border-slate-200 pt-8">
                <h3 className="text-lg font-bold text-slate-800">Creador de Unidades (Registro BD)</h3>
                <p className="text-slate-500 mt-1 text-sm mb-6">Registra nuevos departamentos/locales y vincúlalos al ID del polígono SVG.</p>

                <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm max-w-2xl">
                    <form onSubmit={handleCreateUnit} className="space-y-5">
                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">1. Identificación Técnica</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Proyecto</label>
                                    <select required value={unitForm.projectId} onChange={(e) => setUnitForm({ ...unitForm, projectId: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors">
                                        <option value="" disabled>Seleccionar...</option>
                                        {projectsList.map((p) => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Planta / Archivo SVG</label>
                                    <select
                                        required
                                        disabled={isLoadingAssets || availableSvgAssets.length === 0 || !unitForm.projectId}
                                        value={selectedSvgUrl}
                                        onChange={(e) => setSelectedSvgUrl(e.target.value)}
                                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        <option value="" disabled>
                                            {isLoadingAssets ? 'Buscando plantas...' :
                                                (unitForm.projectId && availableSvgAssets.length === 0) ? '❌ No hay capas interactivas' :
                                                    'Seleccionar planta...'}
                                        </option>
                                        {availableSvgAssets.map((asset, index) => {
                                            const urlFileName = asset.r2Url ? asset.r2Url.split('/').pop() : 'desconocido.svg';
                                            const displayName = asset.name || asset.fileName || urlFileName;
                                            return (
                                                <option key={asset.id || index} value={asset.r2Url}>
                                                    Archivo: {displayName}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">ID del Polígono (svgId)</label>
                                    <select
                                        required
                                        disabled={isParsingSvg || availableSvgIds.length === 0 || !selectedSvgUrl}
                                        value={unitForm.svgId}
                                        onChange={(e) => setUnitForm({ ...unitForm, svgId: e.target.value })}
                                        className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-100 disabled:text-slate-400"
                                    >
                                        <option value="" disabled>
                                            {isParsingSvg ? 'Extrayendo polígonos del SVG...' :
                                                (!selectedSvgUrl) ? '⚠️ Selecciona una planta primero' :
                                                    availableSvgIds.length === 0 ? '❌ SVG vacío o sin IDs' :
                                                        'Seleccionar polígono...'}
                                        </option>
                                        {availableSvgIds.map(id => (
                                            <option key={id} value={id}>{id}</option>
                                        ))}
                                    </select>
                                    {availableSvgIds.length > 0 && (
                                        <p className="mt-1 text-xs text-emerald-600 font-medium">✅ {availableSvgIds.length} polígonos detectados.</p>
                                    )}
                                    {availableSvgAssets.length === 0 && !isLoadingAssets && unitForm.projectId && (
                                        <p className="mt-1 text-xs text-rose-500 font-medium">Sube una "Capa Interactiva" en el paso anterior.</p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre Público</label>
                                    <input type="text" required placeholder="Ej. Penthouse 401" value={unitForm.name} onChange={(e) => setUnitForm({ ...unitForm, name: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" />
                                </div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">2. Distribución y Áreas</h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Habitaciones</label><input type="number" min="0" placeholder="2" value={unitForm.rooms} onChange={(e) => setUnitForm({ ...unitForm, rooms: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Baños</label><input type="number" min="0" step="0.5" placeholder="2.5" value={unitForm.bathrooms} onChange={(e) => setUnitForm({ ...unitForm, bathrooms: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Área Total (m²)</label><input type="number" step="0.01" placeholder="120.5" value={unitForm.area} onChange={(e) => setUnitForm({ ...unitForm, area: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Área Habitable (m²)</label><input type="number" step="0.01" placeholder="90.0" value={unitForm.habitableArea} onChange={(e) => setUnitForm({ ...unitForm, habitableArea: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Área Terraza/Patio (m²)</label><input type="number" step="0.01" placeholder="30.5" value={unitForm.terraceArea} onChange={(e) => setUnitForm({ ...unitForm, terraceArea: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Cant. Parqueos</label><input type="number" min="0" placeholder="1" value={unitForm.parkingCount} onChange={(e) => setUnitForm({ ...unitForm, parkingCount: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Área Parqueos (m²)</label><input type="number" step="0.01" placeholder="12.5" value={unitForm.parkingArea} onChange={(e) => setUnitForm({ ...unitForm, parkingArea: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Cant. Bodegas</label><input type="number" min="0" placeholder="1" value={unitForm.storageCount} onChange={(e) => setUnitForm({ ...unitForm, storageCount: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                                    <div><label className="block text-sm font-medium text-slate-700 mb-1">Área Bodegas (m²)</label><input type="number" step="0.01" placeholder="5.0" value={unitForm.storageArea} onChange={(e) => setUnitForm({ ...unitForm, storageArea: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" /></div>
                            </div>
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <input type="checkbox" id="isDuplexCheck" checked={unitForm.isDuplex} onChange={(e) => setUnitForm({ ...unitForm, isDuplex: e.target.checked, duplexLevel: e.target.checked ? 'inferior' : '' })} className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
                                <label htmlFor="isDuplexCheck" className="text-sm font-bold text-slate-800 cursor-pointer">Unidad Penthouse Dúplex</label>
                            </div>
                            {unitForm.isDuplex && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1">Nivel del Dúplex</label>
                                        <select required value={unitForm.duplexLevel} onChange={(e) => setUnitForm({ ...unitForm, duplexLevel: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors">
                                            <option value="inferior">Piso Inferior</option>
                                            <option value="superior">Piso Superior</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6 space-y-4">
                            <h4 className="text-sm font-bold text-slate-800 border-b border-slate-200 pb-2">3. Gestión Comercial</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Precio / Inversión Estimada ($)</label>
                                    <input type="number" min="0" placeholder="150000" value={unitForm.price} onChange={(e) => setUnitForm({ ...unitForm, price: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                                    <select required value={unitForm.status} onChange={(e) => setUnitForm({ ...unitForm, status: e.target.value })} className="block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-colors">
                                        <option value="Disponible">Disponible</option>
                                        <option value="Reservado">Reservado</option>
                                        <option value="Vendido">Vendido</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {unitMessage && (
                            <div className={`p-3 rounded-md text-sm font-medium animate-in zoom-in duration-200 ${unitMessage.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                                {unitMessage.text}
                            </div>
                        )}

                        <button type="submit" disabled={isCreatingUnit} className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center font-medium mt-2 shadow-sm">
                            {isCreatingUnit ? 'Registrando en Base de Datos...' : 'Crear Unidad'}
                        </button>
                    </form>
                </div>

                {editorUnitsList.length > 0 && (
                    <div className="mt-8 border-t border-slate-200 pt-6">
                        <h3 className="text-lg font-bold text-slate-800 mb-4">Unidades Registradas</h3>

                        <div className="mb-4 flex items-center justify-start bg-gray-50 p-3 rounded-md border border-gray-200">
                            <label className="text-sm font-medium text-gray-700 mr-3">Filtrar por Planta/Archivo SVG:</label>
                            <select
                                value={filterPlanta}
                                onChange={(e) => setFilterPlanta(e.target.value)}
                                className="px-3 py-1.5 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm min-w-[200px] bg-white"
                            >
                                <option value="ALL">Todas las plantas / SVGs {isFilteringSvg ? '(Cargando...)' : ''}</option>
                                {availableSvgAssets.map((asset, index) => {
                                    const urlFileName = asset.r2Url ? asset.r2Url.split('/').pop() : 'desconocido.svg';
                                    const displayName = asset.name || asset.fileName || urlFileName;
                                    return (
                                        <option key={asset.id || index} value={asset.r2Url || asset.id}>
                                            Archivo: {displayName}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>

                        <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                            <table className="min-w-full divide-y divide-gray-200 text-sm">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-medium text-gray-700">SVG ID / Nombre</th>
                                        <th className="px-4 py-3 text-left font-medium text-gray-700">Estado</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700">Área (m²)</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700">Precio</th>
                                        <th className="px-4 py-3 text-right font-medium text-gray-700">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200 bg-white">
                                    {currentAdminUnits.map((unit: any) => (
                                        <tr key={unit.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-gray-900">
                                                {unit.label ? `${unit.label} (${unit.identifier || 'Sin ID'})` : (unit.identifier || 'Sin ID')}
                                            </td>
                                            <td className="px-4 py-3 text-gray-500">
                                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${unit.status === 'Disponible' ? 'bg-green-100 text-green-800' : unit.status === 'Reservado' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-800'}`}>
                                                    {unit.status}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-right text-gray-500">{unit.area} m²</td>
                                            <td className="px-4 py-3 text-right text-gray-500">${unit.price}</td>
                                            <td className="px-4 py-3 text-right flex justify-end gap-2">
                                                <button onClick={() => { setEditingUnit(unit); setEditUnitForm(unit); }} className="p-2 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200 transition-colors inline-flex items-center justify-center"><Edit className="w-4 h-4" /></button>
                                                <button onClick={() => handleDeleteUnit(unit.id)} className="p-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200 transition-colors inline-flex items-center justify-center"><Trash2 className="w-4 h-4" /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>

                            {totalAdminPages > 1 && (
                                <div className="flex justify-between items-center px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
                                    <span className="text-sm text-gray-700">Página <span className="font-semibold">{adminPage}</span> de <span className="font-semibold">{totalAdminPages}</span></span>
                                    <div className="flex gap-2">
                                        <button disabled={adminPage === 1} onClick={() => setAdminPage(p => p - 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                                        <button disabled={adminPage === totalAdminPages} onClick={() => setAdminPage(p => p + 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
                
                {editingUnit && (
                    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
                        <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] overflow-hidden">
                            <div className="p-6 pb-4 border-b border-slate-100 flex justify-between items-center shrink-0 bg-white z-10">
                                <h3 className="text-xl font-bold text-slate-800">Editar: {editingUnit.name || editingUnit.svgId}</h3>
                                <button onClick={() => setEditingUnit(null)} className="text-slate-400 hover:text-slate-600 transition-colors p-1.5 hover:bg-slate-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="p-6 overflow-y-auto custom-scrollbar bg-slate-50/50">
                                <div className="grid grid-cols-1 gap-5 mb-5">
                                    <div><label className="text-sm text-slate-700 block mb-1.5 font-semibold">Nombre a Mostrar (Label)</label><input type="text" placeholder="Ej. Lobby, Penthouse 401" value={editUnitForm.label || ''} onChange={e => setEditUnitForm({ ...editUnitForm, label: e.target.value })} className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm" /></div>
                                    <div><label className="text-sm text-slate-700 block mb-1.5 font-semibold">Tipo de Espacio</label><select value={editUnitForm.type || 'commercial'} onChange={e => setEditUnitForm({ ...editUnitForm, type: e.target.value })} className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all bg-white shadow-sm"><option value="commercial">Unidad Comercial (Vendible)</option><option value="common">Área Común (Lobby/Pasillo)</option></select></div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Dimensiones y Distribución</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Habitaciones</label><input type="number" min="0" value={editUnitForm.rooms || ''} onChange={e => setEditUnitForm({ ...editUnitForm, rooms: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Baños</label><input type="number" step="0.5" min="0" value={editUnitForm.bathrooms || ''} onChange={e => setEditUnitForm({ ...editUnitForm, bathrooms: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Área Habitable</label><input type="number" step="0.01" value={editUnitForm.habitableArea || ''} onChange={e => setEditUnitForm({ ...editUnitForm, habitableArea: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Área Terraza</label><input type="number" step="0.01" value={editUnitForm.terraceArea || ''} onChange={e => setEditUnitForm({ ...editUnitForm, terraceArea: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                    </div>
                                </div>
                                <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-5">
                                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Extras</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Parqueos (Cant.)</label><input type="number" min="0" value={editUnitForm.parkingCount || ''} onChange={e => setEditUnitForm({ ...editUnitForm, parkingCount: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Área Parqueos</label><input type="number" step="0.01" value={editUnitForm.parkingArea || ''} onChange={e => setEditUnitForm({ ...editUnitForm, parkingArea: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Bodegas (Cant.)</label><input type="number" min="0" value={editUnitForm.storageCount || ''} onChange={e => setEditUnitForm({ ...editUnitForm, storageCount: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-medium">Área Bodegas</label><input type="number" step="0.01" value={editUnitForm.storageArea || ''} onChange={e => setEditUnitForm({ ...editUnitForm, storageArea: e.target.value })} className="border border-slate-300 p-2 rounded-md w-full" /></div>
                                    </div>
                                </div>
                                <div className="bg-blue-50/50 p-5 rounded-xl border border-blue-100 shadow-sm">
                                    <h4 className="text-xs font-bold text-blue-500 uppercase tracking-wider mb-4 border-b border-blue-100 pb-2 flex items-center gap-2"><Layers size={14} /> Configuración Dúplex & Comercial</h4>
                                    <label className="flex items-center gap-3 mb-4 p-3 bg-white rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50"><input type="checkbox" checked={editUnitForm.isDuplex || false} onChange={e => setEditUnitForm({ ...editUnitForm, isDuplex: e.target.checked })} className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500 cursor-pointer" /><span className="text-sm font-bold text-slate-700">Esta es una unidad Dúplex (2 pisos)</span></label>
                                    {editUnitForm.isDuplex && (
                                        <div className="mb-5 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-xs text-slate-600 block mb-1 font-semibold">Nivel de este polígono:</label>
                                            <select value={editUnitForm.duplexLevel || 'inferior'} onChange={e => setEditUnitForm({ ...editUnitForm, duplexLevel: e.target.value })} className="border border-blue-200 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 transition-all bg-white"><option value="inferior">Piso Inferior</option><option value="superior">Piso Superior</option></select>
                                            <p className="text-[11px] text-slate-500 mt-2 leading-tight">Asegúrate de que la otra mitad de este dúplex tenga <strong className="text-slate-700">exactamente el mismo Nombre Público</strong> para que el sistema los fusione.</p>
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-blue-100">
                                        <div><label className="text-xs text-slate-600 block mb-1 font-bold">Precio Total ($)</label><input type="number" min="0" value={editUnitForm.price || ''} onChange={e => setEditUnitForm({ ...editUnitForm, price: e.target.value })} className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 bg-white font-medium" placeholder="0.00" /></div>
                                        <div><label className="text-xs text-slate-600 block mb-1 font-bold">Área Total Manual</label><input type="number" step="0.01" value={editUnitForm.area || ''} onChange={e => setEditUnitForm({ ...editUnitForm, area: e.target.value })} className="border border-slate-300 p-2.5 rounded-lg w-full focus:ring-2 focus:ring-blue-500 bg-white" placeholder="Calculado auto..." /></div>
                                    </div>
                                </div>
                            </div>
                            <div className="p-5 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-white z-10 rounded-b-2xl">
                                <button onClick={() => setEditingUnit(null)} className="px-5 py-2.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl font-bold transition-colors">Cancelar</button>
                                <button onClick={handleEditUnit} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-colors shadow-lg shadow-blue-600/20 flex items-center justify-center min-w-[140px]">Guardar Cambios</button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
};
