"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Line } from '@react-pdf/renderer';
import { CarouselSlide } from '../utils/carousel-service';

export type CarouselTheme = 'viral' | 'professional' | 'minimal';

// Theme Configurations (PDF Safe Colors)
const THEMES = {
  viral: {
    bg: "#FFD600",
    text: "#000000",
    accent: "#000000",
    font: "Helvetica-Bold"
  },
  professional: {
    bg: "#0A192F",
    text: "#FFFFFF",
    accent: "#64FFDA",
    font: "Times-Roman"
  },
  minimal: {
    bg: "#FFFFFF",
    text: "#171717", // Neutral 900
    accent: "#171717",
    font: "Helvetica"
  }
};

const styles = StyleSheet.create({
  page: { flexDirection: 'column', padding: 40 },
  header: { height: 40, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 },
  progressBar: { flexDirection: 'row', gap: 4, height: 6, flex: 1, maxWidth: 150 },
  barSegment: { flex: 1, borderRadius: 3 },
  content: { flex: 1, justifyContent: 'center' },
  title: { fontSize: 32, marginBottom: 16, lineHeight: 1.1 },
  body: { fontSize: 18, lineHeight: 1.4, opacity: 0.9 },
  footer: { marginTop: 30, borderTopWidth: 1, borderColor: 'rgba(0,0,0,0.1)', paddingTop: 16, flexDirection: 'row', justifyContent: 'space-between' },
  handle: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  cta: { fontSize: 10, fontFamily: 'Helvetica' }
});

interface CarouselPDFProps {
  slides: CarouselSlide[];
  theme: CarouselTheme;
  handle?: string;
  avatarUrl?: string;
}

export default function CarouselPDF({ slides, theme, handle = "@StrategyOS", avatarUrl }: CarouselPDFProps) {
  const t = THEMES[theme];

  return (
    <Document>
      {slides.map((slide, index) => (
        <Page 
          key={index} 
          size={[400, 500]} 
          style={{ ...styles.page, backgroundColor: t.bg, color: t.text }}
        >
            {/* HEADER */}
            <View style={styles.header}>
                {theme !== 'minimal' ? (
                    <View style={styles.progressBar}>
                        {Array.from({ length: slides.length }).map((_, i) => (
                          <View 
                            key={i} 
                            style={[
                                styles.barSegment, 
                                { backgroundColor: i <= index ? t.accent : 'rgba(0,0,0,0.1)' }
                            ]} 
                          />
                        ))}
                    </View>
                ) : (
                    <Text style={{ fontSize: 10, color: '#999' }}>{index + 1}/{slides.length}</Text>
                )}
            </View>

            {/* CONTENT */}
            <View style={styles.content}>
                <Text style={[styles.title, { fontFamily: t.font }]}>{slide.title}</Text>
                <Text style={[styles.body, { fontFamily: theme === 'professional' ? 'Times-Roman' : 'Helvetica' }]}>
                    {slide.body}
                </Text>
            </View>

            {/* FOOTER */}
            <View style={[styles.footer, { borderColor: theme === 'professional' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                    {/* Placeholder for avatar since remote images need auth handling sometimes */}
                     <Text style={[styles.handle, { color: t.text }]}>{handle}</Text>
                </View>
                <Text style={[styles.cta, { color: t.text }]}>
                    {index < slides.length - 1 ? "SWIPE ➔" : "SAVE 💾"}
                </Text>
            </View>
        </Page>
      ))}
    </Document>
  );
}
