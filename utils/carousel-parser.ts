/**
 * CAROUSEL PARSER - 2028 Generative Media Factory
 * 
 * Splits a long-form LinkedIn post into "Slides" for a PDF Carousel.
 * Logic:
 * 1. Introduction Slide
 * 2. Main points as individual slides
 * 3. Conclusion / CTA slide
 */

export interface CarouselSlide {
  title: string;
  content: string;
  footer?: string;
}

/**
 * PARSE CONTENT TO SLIDES
 * -----------------------
 * Heuristically splits content into slides based on paragraphs/bullets.
 */
export function parseContentToSlides(content: string, title?: string): CarouselSlide[] {
  const slides: CarouselSlide[] = [];
  
  // Clean up content
  const lines = content.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  // 1. Initial Slide (Title/Overview)
  slides.push({
    title: title || "Strategic Insight",
    content: lines.slice(0, 2).join(' '),
    footer: "@strategyos"
  });
  
  // 2. Body Slides
  // Group lines into clusters or individual points
  let currentGroup: string[] = [];
  
  for (let i = 2; i < lines.length - 2; i++) {
    const line = lines[i];
    
    // If it looks like a heading or a bullet point
    if (line.match(/^[0-9]\./) || line.startsWith('•') || line.startsWith('-') || (line.length < 50 && line.endsWith(':'))) {
      if (currentGroup.length > 0) {
        slides.push({ title: "Deep Dive", content: currentGroup.join(' '), footer: "@strategyos" });
        currentGroup = [];
      }
      slides.push({ title: line.replace(/^[0-9]\.\s*/, ''), content: lines[i+1] || "", footer: "@strategyos" });
      i++; // Skip next line (used as content)
    } else {
      currentGroup.push(line);
      if (currentGroup.length >= 3) {
        slides.push({ title: "Analysis", content: currentGroup.join(' '), footer: "@strategyos" });
        currentGroup = [];
      }
    }
  }
  
  // Add remaining body
  if (currentGroup.length > 0) {
     slides.push({ title: "Summary", content: currentGroup.join(' '), footer: "@strategyos" });
  }
  
  // 3. Closing Slide (CTA)
  slides.push({
    title: "Final Takeaway",
    content: lines.slice(-2).join(' '),
    footer: "StrategyOS // 2028 Edition"
  });
  
  return slides.slice(0, 10); // Limit to 10 slides for brevity
}
