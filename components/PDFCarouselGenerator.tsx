"use client";

/**
 * PDF CAROUSEL GENERATOR - 2028 Physical Asset Pillar
 * 
 * Direct production of LinkedIn-ready PDF Carousels.
 * Uses @react-pdf/renderer for high-status minimalist layout.
 */

import React from "react";
import { Document, Page, Text, View, StyleSheet, Font, PDFDownloadLink } from "@react-pdf/renderer";
import { Download, FileText, Loader2 } from "lucide-react";
import { CarouselSlide } from "../utils/carousel-parser";
import { VISUAL_THEMES, VisualThemeId } from "../utils/theme-service";

// --- PDF COMPONENT ---

const CarouselDocument = ({ slides, themeId }: { slides: CarouselSlide[], themeId: VisualThemeId }) => {
  const theme = VISUAL_THEMES[themeId];

  const styles = StyleSheet.create({
    page: {
      padding: 60,
      backgroundColor: theme.colors.background,
      color: theme.colors.text,
      display: "flex",
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      textAlign: theme.layout === 'asymmetric' ? 'left' : 'center',
    },
    contentContainer: {
      width: "100%",
      maxWidth: 600,
    },
    title: {
      fontSize: 48, // Bigger
      fontWeight: "bold",
      marginBottom: 30,
      color: theme.colors.text,
      textTransform: theme.id === 'cyber' ? 'uppercase' : 'none',
      letterSpacing: theme.id === 'swiss' ? -1 : 0,
    },
    body: {
      fontSize: 24,
      lineHeight: 1.5,
      color: theme.colors.text, // Use main text color
      opacity: 0.9,
      fontFamily: theme.fonts.body === 'Courier' ? 'Courier' : 'Helvetica',
    },
    footer: {
      position: "absolute",
      bottom: 40,
      left: 60,
      right: 60,
      fontSize: 12,
      color: theme.colors.secondary,
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-between",
      borderTop: `2px solid ${theme.colors.secondary}`,
      paddingTop: 15,
      fontFamily: 'Courier'
    },
    accentBar: {
       position: "absolute",
       top: 0,
       left: 0,
       right: 0,
       height: 10,
       backgroundColor: theme.colors.accent
    }
  });

  return (
    <Document>
        {slides.map((slide, i) => (
        <Page key={i} size={[1080, 1080]} style={styles.page}>
            {/* Top Accent Bar */}
            <View style={styles.accentBar} />

            <View style={styles.contentContainer}>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.body}>{slide.content}</Text>
            </View>
            <View style={styles.footer}>
            <Text>{slide.footer || "@strategyos"}</Text>
            <Text>Slide {i + 1} / {slides.length}</Text>
            </View>
        </Page>
        ))}
    </Document>
  );
};

// --- MAIN UI COMPONENT ---

interface PDFCarouselGeneratorProps {
  slides: CarouselSlide[];
  filename?: string;
  themeId?: VisualThemeId;
}

export default function PDFCarouselGenerator({ slides, filename = "carousel.pdf", themeId = "noir" }: PDFCarouselGeneratorProps) {
  if (!slides || slides.length === 0) return null;

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-500/20 rounded-xl">
          <FileText className="w-5 h-5 text-indigo-400" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white">PDF Carousel Ready</h3>
          <p className="text-[10px] text-neutral-500 uppercase tracking-widest">{slides.length} Slides • {VISUAL_THEMES[themeId].name}</p>
        </div>
      </div>

      <PDFDownloadLink
        document={<CarouselDocument slides={slides} themeId={themeId} />}
        fileName={filename}
        className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition-all hover:scale-105 flex items-center gap-2"
      >
        {({ loading }) => (
          <>
            {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
            {loading ? "BUILDING PDF..." : "DOWNLOAD PDF"}
          </>
        )}
      </PDFDownloadLink>
    </div>
  );
}
