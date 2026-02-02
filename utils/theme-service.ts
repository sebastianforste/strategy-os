export type VisualThemeId = 'noir' | 'swiss' | 'cyber' | 'paper';

export interface VisualTheme {
  id: VisualThemeId;
  name: string;
  colors: {
    background: string;
    text: string;
    accent: string;
    secondary: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  layout: 'grid' | 'centered' | 'asymmetric';
}

export const VISUAL_THEMES: Record<VisualThemeId, VisualTheme> = {
  noir: {
    id: 'noir',
    name: 'Strategy Noir',
    colors: {
      background: '#000000',
      text: '#FFFFFF',
      accent: '#FFFFFF', // Monochrome
      secondary: '#333333'
    },
    fonts: {
      heading: 'Helvetica-Bold',
      body: 'Helvetica'
    },
    layout: 'centered'
  },
  swiss: {
    id: 'swiss',
    name: 'International Style',
    colors: {
      background: '#EEEEEE',
      text: '#000000',
      accent: '#FF3300', // Red accent
      secondary: '#CCCCCC'
    },
    fonts: {
      heading: 'Helvetica-Bold',
      body: 'Helvetica'
    },
    layout: 'grid'
  },
  cyber: {
    id: 'cyber',
    name: 'Cyberpunk 2077',
    colors: {
      background: '#0F0F23', // Dark classic blue
      text: '#00FF99', // Cyan/Green
      accent: '#FF0055', // Neon Pink
      secondary: '#444466'
    },
    fonts: {
      heading: 'Courier-Bold', // Monospace feel
      body: 'Courier'
    },
    layout: 'asymmetric'
  },
  paper: {
    id: 'paper',
    name: 'Substack Paper',
    colors: {
      background: '#FFFFFF',
      text: '#1A1A1A',
      accent: '#3B82F6', // Blue link color
      secondary: '#E5E7EB'
    },
    fonts: {
      heading: 'Times-Bold',
      body: 'Times-Roman'
    },
    layout: 'centered'
  }
};
