// Ruta: client/src/store/adminStore.ts
import { create } from 'zustand';

export type AdminRole = 'Admin' | 'Editor' | 'Vendedor';

interface AdminState {
    activeRole: AdminRole;
    setActiveRole: (role: AdminRole) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    activeRole: 'Admin', // Rol por defecto para maquetación UI
    setActiveRole: (role) => set({ activeRole: role }),
}));
