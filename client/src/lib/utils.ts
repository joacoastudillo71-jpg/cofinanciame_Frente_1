import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================================
// NORMALIZADOR DE ESTADOS (Single Source of Truth)
// ============================================================================
export function normalizeUnitStatus(status?: string): 'disponible' | 'reservado' | 'vendido' | 'info' {
  if (!status) return 'info';
  const s = status.trim().toLowerCase();
  if (s === 'disponible' || s === 'available') return 'disponible';
  if (s === 'reservado' || s === 'reserved') return 'reservado';
  if (s === 'vendido' || s === 'sold') return 'vendido';
  return 'info';
}

export function isUnitAvailable(status?: string): boolean {
  return normalizeUnitStatus(status) === 'disponible';
}
