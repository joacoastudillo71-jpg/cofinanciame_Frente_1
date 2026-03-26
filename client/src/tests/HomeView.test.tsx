// client/src/tests/HomeView.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HomeView } from '../components/views/HomeView';

// Mock del store para evitar errores fuera de contexto
import { useAppStore } from '../store/useAppStore';

describe('HomeView Component', () => {
  it('Renderiza correctamente el título de la plataforma', () => {
    render(<HomeView />);

    // Buscamos el texto principal
    // Nota: CoFinancia está en un nodo y .me en otro span, 
    // así que buscamos por partes o role.
    expect(screen.getByText(/Plataforma de experiencias inmobiliarias/i)).toBeInTheDocument();
  });

  it('Renderiza al menos un proyecto de la lista', () => {
    render(<HomeView />);
    // Debería haber botones o artículos interactivos
    const projectCards = screen.getAllByRole('listitem');
    expect(projectCards.length).toBeGreaterThan(0);
  });
});