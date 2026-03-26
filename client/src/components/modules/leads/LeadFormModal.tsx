import React, { useState } from 'react';

interface LeadFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string | number;
    unitId: string | number;
}

export const LeadFormModal: React.FC<LeadFormModalProps> = ({ isOpen, onClose, projectId, unitId }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Seguridad: Validación frontend anti-vacíos
        if (!formData.name.trim() || !formData.email.trim() || !formData.phone.trim()) {
            alert('⚠️ Por favor, completa todos los campos para continuar.');
            return;
        }

        setStatus('loading');

        try {
            const res = await fetch('/api/webhooks/gespro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, projectId, unitId })
            });

            if (!res.ok) throw new Error('Error en el Webhook');

            setStatus('success');

            // Limpieza y cierre automático tras éxito
            setTimeout(() => {
                setStatus('idle');
                setFormData({ name: '', email: '', phone: '' });
                onClose();
            }, 2500);
        } catch (error) {
            console.error('Error enviando lead:', error);
            setStatus('error');
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative border border-slate-200">
                <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors">
                    ✕
                </button>

                <h3 className="text-xl font-bold text-slate-800">Me interesa esta unidad</h3>
                <p className="text-sm text-slate-500 mb-6">Déjanos tus datos para que un asesor te contacte sobre la unidad {unitId}.</p>

                {/* Feedback Visual */}
                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg text-center font-medium animate-in zoom-in duration-300">
                        ✅ ¡Enviado con éxito! <br /> Un asesor de GESPRO te contactará pronto.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Nombre Completo</label>
                            {/* Le añadimos text-slate-900 aquí 👇 */}
                            <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" placeholder="Ej. Juan Pérez" disabled={status === 'loading'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Correo Electrónico</label>
                            {/* Le añadimos text-slate-900 aquí 👇 */}
                            <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" placeholder="correo@empresa.com" disabled={status === 'loading'} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Teléfono</label>
                            {/* Le añadimos text-slate-900 aquí 👇 */}
                            <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-slate-50" placeholder="+123456789" disabled={status === 'loading'} />
                        </div>

                        <button type="submit" disabled={status === 'loading'} className="w-full bg-slate-900 text-white py-2.5 px-4 rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-70 flex items-center justify-center font-medium mt-2">
                            {status === 'loading' ? (
                                <span className="animate-pulse">Sincronizando con CRM...</span>
                            ) : (
                                'Solicitar Información'
                            )}
                        </button>

                        {status === 'error' && (
                            <p className="text-red-500 text-sm text-center mt-2 font-medium">⚠️ Hubo un error de conexión. Intenta de nuevo.</p>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
};
