export type AppTheme = 'default' | 'crisis' | 'creative';

export const THEMES: Record<AppTheme, React.CSSProperties> = {
  default: {
    '--background': '#050505',
    '--foreground': '#ffffff',
    '--accent-glow': 'rgba(255, 255, 255, 0.3)',
    '--glass-border': 'rgba(255, 255, 255, 0.2)',
  } as React.CSSProperties,
  crisis: {
    '--background': '#000000',
    '--foreground': '#ff3333',
    '--accent-glow': 'rgba(255, 0, 0, 0.5)',
    '--glass-border': 'rgba(255, 0, 0, 0.4)',
  } as React.CSSProperties,
  creative: {
    '--background': '#1a1a2e',
    '--foreground': '#e0e0ffff',
    '--accent-glow': 'rgba(100, 200, 255, 0.4)',
    '--glass-border': 'rgba(255, 255, 255, 0.1)',
  } as React.CSSProperties,
};

export function applyTheme(theme: AppTheme) {
  const root = document.documentElement;
  const vars = THEMES[theme];
  
  // Custom logic for deep changes
  if (theme === 'crisis') {
    document.body.classList.add('theme-crisis');
    document.body.classList.remove('theme-creative');
  } else if (theme === 'creative') {
    document.body.classList.add('theme-creative');
    document.body.classList.remove('theme-crisis');
  } else {
    document.body.classList.remove('theme-crisis');
    document.body.classList.remove('theme-creative');
  }
}
