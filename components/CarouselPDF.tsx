"use client";

import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Slide } from '../utils/carousel-generator';

// Register fonts if needed (using default Helvetica for now which is built-in)
// In a real app, we'd register Inter or a custom font

// Define styles
// 4:5 Aspect Ratio: 1080 x 1350 roughly
// PDF points: 1 pt = 1/72 inch.
// Let's verify standard A4 is 595 x 842.
// For social media PDF, we can use a custom size. 
// 1080px / 96dpi * 72 = 810pt? No, let's just stick to a relative ratio.
// React-pdf allows string sizes in points.

const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#000000', // Black background
    color: '#ffffff', // White text
    padding: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center', // Center horizontally
    width: '100%',
  },
  text: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24, // Large text
    textAlign: 'center', // Centered text (Visualize Value style)
    lineHeight: 1.4,
  },
  coverText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 32, // Larger for hook
    textAlign: 'center',
  },
  ctaText: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 24,
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
  },
  footerText: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#666666',
  },
  pagination: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#666666',
  }
});

interface CarouselPDFProps {
  slides: Slide[];
  handle?: string;
}

export default function CarouselPDF({ slides, handle = "@StrategyOS" }: CarouselPDFProps) {
  return (
    <Document>
      {slides.map((slide, index) => (
        <Page 
            key={slide.id} 
            size={[400, 500]} // 4:5 Aspect Ratio (approx)
            style={styles.page}
        >
          <View style={styles.contentContainer}>
            <Text style={
                slide.type === 'cover' ? styles.coverText : 
                slide.type === 'cta' ? styles.ctaText : 
                styles.text
            }>
              {slide.content}
            </Text>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.footerText}>{handle}</Text>
            {slide.type !== 'cta' && (
                <Text style={styles.pagination}>{index + 1} / {slides.length}</Text>
            )}
          </View>
        </Page>
      ))}
    </Document>
  );
}
