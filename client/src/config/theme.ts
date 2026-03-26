// client/src/config/theme.ts

export const baseTheme = {
  colors: {
    // Usamos tu Azul Profundo (#0c056d) como base, yendo hacia casi negro para profundidad
    background: '#050225', 
    surface: '#0c056d', // Tu azul corporativo base para tarjetas/elementos

    textPrimary: '#FFFFFF',
    textSecondary: '#e6e6e6', // Tu gris claro de la paleta

    // --- TUS COLORES DE MARCA EXACTOS ---
    brand: {
      primary: '#00CFC8',   // Cyan Vibrante (Botones, Enlaces, Logos)
      secondary: '#0C056D', // Azul Profundo (Fondos, Branding)
      accent: '#00BCD4',    // Cyan oficial
      highlight: '#03fff6'  // Cyan Eléctrico (Brillos/Glows)
    },

    hover: 'rgba(255, 255, 255, 0.1)',
    active: 'rgba(0, 207, 200, 0.2)', // Cyan con transparencia
  },
  typography: {
    fontFamily: '"Inter", sans-serif',
  }
};

export const getProjectThemeStyles = (projectColor?: string) => ({
  primary: projectColor || baseTheme.colors.brand.primary,
});