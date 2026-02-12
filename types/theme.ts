export interface ThemeTextPalette {
  primary: string;
  secondary: string;
  contrast: string;
}

export interface ThemeColors {
  background: string;
  surface: string;
  accent: string;
  muted: string;
  border: string;
  borderLow: string;
  separator: string;
  text: ThemeTextPalette;
}

export interface ThemeTypography {
  sans: string;
  serif: string;
  mono: string;
}

export interface ThemeSpacing {
  railWidth: string;
  gap: string;
}

export interface ThemeRadii {
  panel: string;
  control: string;
  chip: string;
}

export interface ThemeSpacingScale {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
}

export interface ThemeMotion {
  durationFast: string;
  durationBase: string;
  durationSlow: string;
  easingStandard: string;
}

export interface ThemeElevation {
  low: string;
  medium: string;
  high: string;
}

export interface StrategyTheme {
  theme: {
    colors: ThemeColors;
    typography: ThemeTypography;
    spacing: ThemeSpacing;
    radii?: ThemeRadii;
    spacingScale?: ThemeSpacingScale;
    motion?: ThemeMotion;
    elevation?: ThemeElevation;
    shadows?: {
      subtle: string;
    };
    meta?: {
      source?: string;
      lastSynced?: string;
    };
  };
}
