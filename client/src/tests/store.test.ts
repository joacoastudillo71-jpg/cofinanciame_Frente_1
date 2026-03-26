// client/src/tests/store.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../store/useAppStore';
import { ProjectConfig } from '../config/types';

describe('Showcase Store', () => {
  // Reseteamos estado antes de cada test
  beforeEach(() => {
    useAppStore.setState({
      currentProject: null,
      currentSection: 'home',
    });
  });

  it('Debería iniciar en la sección Home sin proyecto', () => {
    const state = useAppStore.getState();
    expect(state.currentSection).toBe('home');
    expect(state.currentProject).toBeNull();
  });

  it('Debería actualizar el proyecto y la sección correctamente', () => {
    // Simulamos seleccionar un proyecto
    useAppStore.getState().setProject({ id: 'aviano' } as ProjectConfig);
    useAppStore.getState().setSection('intro');

    const newState = useAppStore.getState();
    expect(newState.currentProject?.id).toBe('aviano');
    expect(newState.currentSection).toBe('intro');
  });
});