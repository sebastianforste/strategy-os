import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import { Providers } from "../components/Providers";
import "./globals.css";
import HUDContainer from "../components/HUDContainer";
import theme from "../theme.json";
import type { StrategyTheme } from "@/types/theme";

const stitchSans = Space_Grotesk({
  variable: "--font-stitch-sans",
  subsets: ["latin"],
});

const stitchMono = Fira_Code({
  variable: "--font-stitch-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StrategyOS",
  description: "High-velocity ecosystem for strategic content generation.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  userScalable: true,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const resolvedTheme = theme as StrategyTheme;
  const colors = resolvedTheme.theme.colors;
  const typography = resolvedTheme.theme.typography;
  const radii = resolvedTheme.theme.radii || { panel: "1.5rem", control: "0.75rem", chip: "999px" };
  const spacingScale = resolvedTheme.theme.spacingScale || {
    xs: "0.25rem",
    sm: "0.5rem",
    md: "0.75rem",
    lg: "1rem",
    xl: "1.5rem",
  };
  const motion = resolvedTheme.theme.motion || {
    durationFast: "120ms",
    durationBase: "220ms",
    durationSlow: "360ms",
    easingStandard: "cubic-bezier(0.2, 0, 0, 1)",
  };
  const elevation = resolvedTheme.theme.elevation || {
    low: "0 8px 24px rgba(0,0,0,0.32)",
    medium: "0 16px 44px rgba(0,0,0,0.42)",
    high: "0 24px 80px rgba(0,0,0,0.58)",
  };
  const shouldRegisterServiceWorker = process.env.NODE_ENV === "production";

  const stitchVars = `
    :root {
      --stitch-background: ${colors.background};
      --stitch-surface: ${colors.surface};
      --stitch-accent: ${colors.accent};
      --stitch-muted: ${colors.muted};
      --stitch-border: ${colors.border};
      --stitch-border-low: ${colors.borderLow};
      --stitch-separator: ${colors.separator};
      --stitch-text-primary: ${colors.text.primary};
      --stitch-text-secondary: ${colors.text.secondary};
      --stitch-text-contrast: ${colors.text.contrast};
      --stitch-font-sans: ${typography.sans};
      --stitch-font-serif: ${typography.serif};
      --stitch-font-mono: ${typography.mono};
      --stitch-radius-panel: ${radii.panel};
      --stitch-radius-control: ${radii.control};
      --stitch-radius-chip: ${radii.chip};
      --stitch-space-xs: ${spacingScale.xs};
      --stitch-space-sm: ${spacingScale.sm};
      --stitch-space-md: ${spacingScale.md};
      --stitch-space-lg: ${spacingScale.lg};
      --stitch-space-xl: ${spacingScale.xl};
      --stitch-motion-fast: ${motion.durationFast};
      --stitch-motion-base: ${motion.durationBase};
      --stitch-motion-slow: ${motion.durationSlow};
      --stitch-motion-easing: ${motion.easingStandard};
      --stitch-elevation-low: ${elevation.low};
      --stitch-elevation-medium: ${elevation.medium};
      --stitch-elevation-high: ${elevation.high};
    }
  `;

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <style dangerouslySetInnerHTML={{ __html: stitchVars }} />
      </head>
      <body
        className={`${stitchSans.variable} ${stitchMono.variable} antialiased`}
      >
        <Providers>
          {children}
          <HUDContainer />
        </Providers>
        {shouldRegisterServiceWorker && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                if ('serviceWorker' in navigator && window.location.hostname !== 'localhost') {
                  window.addEventListener('load', async function() {
                    try {
                      const response = await fetch('/sw.js', { method: 'HEAD', cache: 'no-store' });
                      if (response.ok) {
                        await navigator.serviceWorker.register('/sw.js');
                      }
                    } catch (err) {
                      // Silent skip in dev/missing
                    }
                  });
                }
              `,
            }}
          />
        )}
      </body>
    </html>
  );
}
