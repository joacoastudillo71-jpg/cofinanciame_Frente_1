import React, { useState, useEffect, useMemo } from 'react';

interface SellerManagerProps {
    projectsList: any[];
    fetchAndParseSvgIds: (url: string) => Promise<string[]>;
}

export const SellerManager: React.FC<SellerManagerProps> = ({ projectsList, fetchAndParseSvgIds }) => {
    const [selectedProjectId, setSelectedProjectId] = useState('');
    const [unitsList, setUnitsList] = useState<any[]>([]);
    const [isLoadingUnits, setIsLoadingUnits] = useState(false);

    const [sellerSvgAssets, setSellerSvgAssets] = useState<any[]>([]);
    const [sellerSelectedSvgUrl, setSellerSelectedSvgUrl] = useState<string>('');
    const [sellerCurrentFloorIds, setSellerCurrentFloorIds] = useState<string[]>([]);
    const [isSellerParsingSvg, setIsSellerParsingSvg] = useState(false);

    const fetchUnits = async (projectId: string) => {
        setSelectedProjectId(projectId);
        if (!projectId) return;
        setIsLoadingUnits(true);
        try {
            const res = await fetch(`/api/projects/${projectId}/units`);
            if (!res.ok) throw new Error('Error al cargar unidades');
            const data = await res.json();
            setUnitsList(data);
        } catch (err) {
            console.error(err);
            alert('❌ Error al obtener las unidades');
        } finally {
            setIsLoadingUnits(false);
        }
    };

    const handleUnitUpdate = async (unitId: number, newStatus: string, newPrice?: string | number) => {
        try {
            const payload = { status: newStatus, price: newPrice };
            const res = await fetch(`/api/units/${unitId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Error al actualizar');
            const updatedData = await res.json();
            setUnitsList(prev => prev.map(u => u.id === unitId ? { ...u, status: updatedData.status, price: updatedData.price } : u));
        } catch (err) {
            console.error('Error al actualizar la unidad en BD:', err);
        }
    };

    useEffect(() => {
        const fetchSellerAssets = async () => {
            if (!selectedProjectId) {
                setSellerSvgAssets([]);
                setSellerSelectedSvgUrl('');
                setSellerCurrentFloorIds([]);
                return;
            }
            try {
                const selectedProject = projectsList.find(p => String(p.id) === String(selectedProjectId));
                const projectSlug = selectedProject?.slug;
                if (!projectSlug) return;

                const res = await fetch(`/api/projects/${projectSlug}`);
                if (!res.ok) return;
                const projectData = await res.json();

                const svgAssets = projectData.assets?.filter((a: any) =>
                    a.r2Url?.toLowerCase().endsWith('.svg')
                ) || [];

                setSellerSvgAssets(svgAssets);
                setSellerSelectedSvgUrl('');
                setSellerCurrentFloorIds([]);
            } catch (err) {
                console.error("Error al obtener SVGs del vendedor:", err);
                setSellerSvgAssets([]);
            }
        };

        fetchSellerAssets();
    }, [selectedProjectId, projectsList]);

    useEffect(() => {
        const parseSellerSelectedSvg = async () => {
            if (!sellerSelectedSvgUrl) {
                setSellerCurrentFloorIds([]);
                return;
            }
            setIsSellerParsingSvg(true);
            const ids = await fetchAndParseSvgIds(sellerSelectedSvgUrl);
            setSellerCurrentFloorIds(ids);
            setIsSellerParsingSvg(false);
        };
        parseSellerSelectedSvg();
    }, [sellerSelectedSvgUrl, fetchAndParseSvgIds]);

    const sellerUnitsFiltered = useMemo(() =>
        unitsList.filter(u => sellerCurrentFloorIds.includes(u.identifier)),
        [unitsList, sellerCurrentFloorIds]
    );

    const [sellerPage, setSellerPage] = useState(1);
    const sellerPageSize = 20;
    const totalSellerPages = Math.ceil(sellerUnitsFiltered.length / sellerPageSize);

    useEffect(() => { setSellerPage(1); }, [sellerSelectedSvgUrl, selectedProjectId, sellerUnitsFiltered.length]);

    const currentSellerUnits = sellerUnitsFiltered.slice(
        (sellerPage - 1) * sellerPageSize,
        sellerPage * sellerPageSize
    );

    return (
        <section className="animate-in fade-in duration-300">
            <h3 className="text-lg font-bold text-slate-800">Gestión de Estados</h3>
            <p className="text-slate-500 mt-1 text-sm">Actualización de disponibilidad de unidades.</p>

            <div className="mt-6 bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Seleccionar Proyecto</label>
                        <select
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                            value={selectedProjectId}
                            onChange={(e) => fetchUnits(e.target.value)}
                        >
                            <option value="" disabled>Elige un proyecto...</option>
                            {projectsList.map((project) => (
                                <option key={project.id} value={project.id}>
                                    {project.name} ({project.slug})
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700">Planta / Archivo SVG</label>
                        <select
                            className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400"
                            value={sellerSelectedSvgUrl}
                            onChange={(e) => setSellerSelectedSvgUrl(e.target.value)}
                            disabled={!selectedProjectId || sellerSvgAssets.length === 0}
                        >
                            <option value="" disabled>
                                {selectedProjectId && sellerSvgAssets.length === 0 ? '❌ No hay planos interactivos' : 'Selecciona una planta...'}
                            </option>
                            {sellerSvgAssets.map((asset, idx) => {
                                const urlFileName = asset.r2Url ? asset.r2Url.split('/').pop() : 'desconocido.svg';
                                return (
                                    <option key={asset.id || idx} value={asset.r2Url}>
                                        Archivo: {urlFileName}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                </div>

                {isLoadingUnits || isSellerParsingSvg ? (
                    <p className="text-sm text-slate-500 py-4 animate-pulse">
                        {isSellerParsingSvg ? 'Extrayendo unidades del plano...' : 'Cargando unidades...'}
                    </p>
                ) : !sellerSelectedSvgUrl ? (
                    <p className="text-sm text-amber-600 font-medium py-4">⚠️ Selecciona una planta para ver sus unidades asociadas</p>
                ) : sellerUnitsFiltered.length > 0 ? (
                    <div className="overflow-x-auto border border-slate-200 rounded-md mt-4">
                        <table className="min-w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-4 py-3">Identificador</th>
                                    <th className="px-4 py-3">Área (m²)</th>
                                    <th className="px-4 py-3">Baños</th>
                                    <th className="px-4 py-3">Precio</th>
                                    <th className="px-4 py-3">Estado Actual</th>
                                </tr>
                            </thead>
                            <tbody>
                                {currentSellerUnits.map((unit) => (
                                    <tr key={unit.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 font-medium text-slate-900">{unit.identifier}</td>
                                        <td className="px-4 py-3">{unit.area || '-'}</td>
                                        <td className="px-4 py-3">{unit.bathrooms || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center space-x-1">
                                                <span className="text-slate-500 font-medium">$</span>
                                                <input
                                                    type="number"
                                                    min="0"
                                                    placeholder="0"
                                                    className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none transition-colors"
                                                    defaultValue={unit.price || ''}
                                                    onBlur={(e) => handleUnitUpdate(unit.id, unit.status, e.target.value)}
                                                />
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <select
                                                className={`rounded-md border text-sm font-semibold focus:outline-none px-2 py-1 cursor-pointer transition-colors ${unit.status === 'Vendido' ? 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100' :
                                                    unit.status === 'Reservado' ? 'bg-yellow-50 text-yellow-700 border-yellow-200 hover:bg-yellow-100' :
                                                        'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                    }`}
                                                value={unit.status}
                                                onChange={(e) => handleUnitUpdate(unit.id, e.target.value, unit.price)}
                                            >
                                                <option value="Disponible">Disponible</option>
                                                <option value="Reservado">Reservado</option>
                                                <option value="Vendido">Vendido</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {totalSellerPages > 1 && (
                            <div className="flex justify-between items-center px-4 py-3 bg-white sm:px-6">
                                <span className="text-sm text-gray-700">Página <span className="font-semibold">{sellerPage}</span> de <span className="font-semibold">{totalSellerPages}</span></span>
                                <div className="flex gap-2">
                                    <button disabled={sellerPage === 1} onClick={() => setSellerPage(p => p - 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Anterior</button>
                                    <button disabled={sellerPage === totalSellerPages} onClick={() => setSellerPage(p => p + 1)} className="px-3 py-1 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Siguiente</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : selectedProjectId ? (
                    <p className="text-sm text-slate-500 py-4">No se encontraron unidades para este proyecto.</p>
                ) : null}
            </div>
        </section>
    );
};
