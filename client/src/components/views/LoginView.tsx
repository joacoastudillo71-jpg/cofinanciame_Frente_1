import React, { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '../../store/useAuthStore';
import { ShieldAlert, ArrowRight, Loader2, Key, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LoginView: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);

  const [, setLocation] = useLocation();
  const { setAuth } = useAuthStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      setAuth(data.token, data.user);
      setLocation('/admin');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020112] text-white flex items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background Decorative */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-96 h-96 bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[30rem] h-[30rem] bg-amber-500/10 blur-[150px] rounded-full mix-blend-screen" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-2xl border border-white/10 p-8 md:p-12 rounded-[2rem] shadow-2xl relative overflow-hidden">
          {/* Top Line Glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_rgba(34,211,238,0.8)]" />

          <div className="flex justify-center mb-8">
            <div className="p-4 bg-black/40 rounded-full border border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.5)]">
              <span className="font-black text-2xl tracking-tighter">Cofinancia<span className="text-cyan-400">.me</span></span>
            </div>
          </div>

          <div className="text-center mb-10">
            <h1 className="text-2xl font-bold tracking-tight text-white mb-2">Portal de Administración</h1>
            <p className="text-white/50 text-sm">Ingresa tus credenciales para continuar al CMS.</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-3 text-red-400 text-sm font-medium"
              >
                <ShieldAlert size={16} />
                <span>{error}</span>
              </motion.div>
            )}

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-widest text-white/60 ml-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-cyan-500/50 focus:bg-black/50 focus:outline-none transition-all text-white placeholder-white/20 shadow-inner"
                  placeholder="ejemplo@cofinancia.me"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center ml-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/60">Contraseña</label>
                  <button
                    type="button"
                    onClick={() => setShowRecoveryInfo(!showRecoveryInfo)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="w-full px-5 py-3.5 bg-black/30 border border-white/10 rounded-xl focus:border-cyan-500/50 focus:bg-black/50 focus:outline-none transition-all text-white placeholder-white/20 shadow-inner"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <AnimatePresence>
              {showRecoveryInfo && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginTop: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                  exit={{ opacity: 0, height: 0, marginTop: 0 }}
                  className="p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-xl flex items-start gap-3 text-cyan-50 text-sm overflow-hidden"
                >
                  <Info size={18} className="text-cyan-400 mt-0.5 shrink-0" />
                  <p className="leading-relaxed">
                    Por medidas de seguridad corporativa, el reseteo de credenciales está centralizado. Por favor, contacta al Administrador del Sistema (Super Admin) para que asigne una nueva contraseña a tu cuenta.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-8 py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black rounded-xl transition-all flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none"
            >
              {isLoading ? <Loader2 size={18} className="animate-spin" /> : (
                <>
                  <span>Ingresar al CMS</span>
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-white/5 text-center flex items-center justify-center gap-2 text-white/30 text-[10px] uppercase font-bold tracking-widest">
            <Key size={12} />
            <span>Encrypted Session Protocol</span>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
