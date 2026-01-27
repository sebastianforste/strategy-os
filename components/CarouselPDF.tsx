"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Svg, Rect, Circle, Line } from '@react-pdf/renderer';
import { Slide } from '../utils/carousel-generator';

// Enhanced styles with visual elements
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#0a0a0a', // Near-black
    color: '#ffffff',
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // Accent corner decorations
  topLeftAccent: {
    position: 'absolute',
    top: 20,
    left: 20,
  },
  bottomRightAccent: {
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
  // Content container
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  // Typography
  coverText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 36,
    textAlign: 'center',
    color: '#ffffff',
    lineHeight: 1.3,
  },
  contentText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 22,
    textAlign: 'center',
    color: '#e5e5e5',
    lineHeight: 1.5,
  },
  ctaText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 26,
    textAlign: 'center',
    color: '#ffffff',
  },
  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#666666',
  },
  pagination: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#3b82f6', // Blue accent
  },
  // Accent bar
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: '#3b82f6', // Blue accent bar at top
  },
});

// Generate a unique accent color per slide
const getAccentColor = (index: number): string => {
  const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];
  return colors[index % colors.length];
};

interface CarouselPDFProps {
  slides: Slide[];
  handle?: string;
}

export default function CarouselPDF({ slides, handle = "@StrategyOS" }: CarouselPDFProps) {
  return (
    <Document>
      {slides.map((slide, index) => {
        const accentColor = getAccentColor(index);
        
        return (
          <Page 
            key={slide.id} 
            size={[400, 500]} // 4:5 Aspect Ratio
            style={styles.page}
          >
            {/* Top accent bar */}
            <View style={[styles.accentBar, { backgroundColor: accentColor }]} />
            
            {/* Decorative corner elements */}
            <View style={styles.topLeftAccent}>
              <Svg width={40} height={40}>
                <Line x1="0" y1="0" x2="30" y2="0" stroke={accentColor} strokeWidth={2} />
                <Line x1="0" y1="0" x2="0" y2="30" stroke={accentColor} strokeWidth={2} />
              </Svg>
            </View>
            
            <View style={styles.bottomRightAccent}>
              <Svg width={40} height={40}>
                <Line x1="10" y1="40" x2="40" y2="40" stroke={accentColor} strokeWidth={2} />
                <Line x1="40" y1="10" x2="40" y2="40" stroke={accentColor} strokeWidth={2} />
              </Svg>
            </View>
            
            {/* Main content */}
            <View style={styles.contentContainer}>
              <Text style={
                slide.type === 'cover' ? styles.coverText : 
                slide.type === 'cta' ? styles.ctaText : 
                styles.contentText
              }>
                {slide.content}
              </Text>
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>{handle}</Text>
              {slide.type !== 'cta' && (
                <Text style={[styles.pagination, { color: accentColor }]}>
                  {index + 1} / {slides.length}
                </Text>
              )}
            </View>
          </Page>
        );
      })}
    </Document>
  );
}

