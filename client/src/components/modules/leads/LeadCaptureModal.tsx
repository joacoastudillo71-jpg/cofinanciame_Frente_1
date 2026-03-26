import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Loader2, CheckCircle2 } from 'lucide-react';
import { FloorUnit } from '../../../config/types';

interface LeadCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  unit: FloorUnit;
  projectName: string;
}

export const LeadCaptureModal: React.FC<LeadCaptureModalProps> = ({ isOpen, onClose, unit, projectName }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // setError(null); // Descomentar si manejas estado de error

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lead: formData,
          context: {
            projectSlug: projectName,
            unitIdentifier: unit.identifier || unit.id, // Fallback de seguridad
            price: unit.price,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Fallo al comunicarse con el servidor');
      }

      setIsSuccess(true); 
      
      // Cerramos el modal tras la confirmación animada
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({ fullName: '', email: '', phone: '' });
        onClose();
      }, 1500);
    } catch (err) {
      console.error('[LeadCaptureModal] Error en el envío:', err);
      // setError('Hubo un error al enviar la solicitud. Intenta nuevamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-10"
        >
          {/* Header */}
          <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-slate-800 tracking-tight">Solicitar Cotización</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Unidad {unit.identifier} • {projectName}</p>
            </div>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-600 disabled:opacity-50"
            >
              <X size={18} />
            </button>
          </div>

          {/* Formulario */}
          <div className="p-6">
            {isSuccess ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-8 text-center"
              >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 size={32} />
                </div>
                <h4 className="text-xl font-bold text-slate-800 mb-2">¡Solicitud Enviada!</h4>
                <p className="text-sm text-slate-500 max-w-xs">
                  Un asesor se pondrá en contacto contigo muy pronto con la cotización.
                </p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Ej. Juan Pérez"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-60"
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ejemplo@correo.com"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+593 99 999 9999"
                    disabled={isSubmitting}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all disabled:opacity-60"
                  />
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white font-medium py-3 rounded-lg shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-slate-900/20 disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>Cargando...</span>
                      </>
                    ) : (
                      <span>Enviar Solicitud</span>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
