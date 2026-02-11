import type { Metadata } from "next";
import { Space_Grotesk, Fira_Code } from "next/font/google";
import { Providers } from "../components/Providers";
import "./globals.css";
import HUDContainer from "../components/HUDContainer";
import theme from "../theme.json";

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
  const colors = theme.theme.colors;
  const typography = theme.theme.typography;

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
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').then(function(registration) {
                    console.log('ServiceWorker registration successful with scope: ', registration.scope);
                  }, function(err) {
                    console.log('ServiceWorker registration failed: ', err);
                  });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
