import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/useAuthStore';
import { ShieldCheck, UserPlus, KeyRound, Loader2, Trash2 } from 'lucide-react';

export const UserManager: React.FC = () => {
  const { token } = useAuthStore();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Create User Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('VENDEDOR');
  
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Error al cargar usuarios');
      const data = await res.json();
      setUsersList(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [token]);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ email, password, role })
      });
      if (!res.ok) throw new Error('Error al crear usuario');
      alert('✅ Usuario creado exitosamente');
      setEmail('');
      setPassword('');
      setRole('VENDEDOR');
      fetchUsers();
    } catch (err) {
      alert('❌ Error al crear usuario');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (userId: number) => {
    const newPassword = prompt('Ingrese la nueva contraseña temporal para este usuario:');
    if (!newPassword || newPassword.trim() === '') return;

    try {
      const res = await fetch(`/api/admin/users/${userId}/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newPassword })
      });
      if (!res.ok) throw new Error('Error al resetear contraseña');
      alert('✅ Contraseña actualizada correctamente en la base de datos');
    } catch (err) {
      alert('❌ Error al resetear contraseña');
      console.error(err);
    }
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ role: newRole })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error al cambiar rol');
      
      alert('✅ Rol actualizado exitosamente');
      
      // Update local state instantly
      setUsersList(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (err: any) {
      alert(`❌ Error: ${err.message}`);
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Create User Section */}
      <section className="bg-slate-50 p-6 border border-slate-200 rounded-xl">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-4">
          <UserPlus size={20} className="text-blue-600" />
          Crear Nuevo Accesos (Equipo)
        </h3>
        
        <form onSubmit={handleCreateUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="ejemplo@cofinancia.me" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Contraseña</label>
            <input type="text" required value={password} onChange={e => setPassword(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none" placeholder="Temporary Pass" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Rol de Acceso</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 outline-none bg-white">
              <option value="ADMIN">ADMIN (Acceso Total)</option>
              <option value="EDITOR">EDITOR (Assets y Planos)</option>
              <option value="VENDEDOR">VENDEDOR (Leads y Cotizaciones)</option>
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" disabled={isLoading || !email || !password} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-md transition-colors disabled:opacity-50 flex justify-center items-center gap-2">
              {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Registrar'}
            </button>
          </div>
        </form>
      </section>

      {/* Users Table */}
      <section className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" />
            Usuarios Activos
          </h3>
          <span className="text-xs font-bold bg-slate-200 text-slate-600 px-2 py-1 rounded-full">{usersList.length} Registros</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">ID</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Rol</th>
                <th className="px-6 py-3 text-right">Acciones (Super Admin)</th>
              </tr>
            </thead>
            <tbody>
              {usersList.map((usr) => (
                <tr key={usr.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="px-6 py-4 font-medium text-slate-500">#{usr.id}</td>
                  <td className="px-6 py-4 font-bold text-slate-800">{usr.email}</td>
                  <td className="px-6 py-4">
                    {usr.role === 'SUPER_ADMIN' ? (
                      <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">
                        {usr.role}
                      </span>
                    ) : (
                      <select 
                        value={usr.role}
                        onChange={(e) => handleRoleChange(usr.id, e.target.value)}
                        className={`text-[10px] font-bold uppercase tracking-wider rounded-full px-2 py-1 outline-none border focus:ring-2 focus:ring-cyan-500/50 transition-colors cursor-pointer appearance-none text-center ${usr.role === 'ADMIN' ? 'bg-blue-100 text-blue-700 border-blue-200' : usr.role === 'EDITOR' ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-emerald-100 text-emerald-700 border-emerald-200'}`}
                      >
                       <option value="ADMIN">ADMIN</option>
                       <option value="EDITOR">EDITOR</option>
                       <option value="VENDEDOR">VENDEDOR</option>
                      </select>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => handleResetPassword(usr.id)} 
                      className="p-2 text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 rounded-lg transition-colors inline-block"
                      title="Forzar Reseteo de Contraseña"
                    >
                      <KeyRound size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {usersList.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-400">
                    Cargando base de datos de usuarios...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

    </div>
  );
};
