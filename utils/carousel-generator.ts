export interface Slide {
  id: number;
  content: string;
  type: "cover" | "content" | "cta";
}

export function transformTextToSlides(text: string, handle: string = "@StrategyOS"): Slide[] {
  const slides: Slide[] = [];
  
  if (!text) return slides;

  // Split by double newlines to find paragraphs
  const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);

  // Slide 1: Cover (Hook)
  // Usually the first paragraph or the first sentence if the paragraph is long
  const hook = paragraphs[0];
  const remainingParagraphs = paragraphs.slice(1);
  
  slides.push({
    id: 1,
    content: hook.trim(),
    type: "cover"
  });

  // Middle Slides: Content
  remainingParagraphs.forEach((para) => {
    // If paragraph is very long (> 200 chars), split it further? 
    // For now, keep it simple.
    
    // Check if it's a list
    if (para.includes("- ") || para.includes("• ")) {
      // It's a list, maybe keep it as one slide or split?
      // "Visualize Value" style prefers one idea per slide.
      // Let's try to split lists if they are long.
      slides.push({
        id: slides.length + 1,
        content: para.trim(),
        type: "content"
      });
    } else {
        slides.push({
            id: slides.length + 1,
            content: para.trim(),
            type: "content"
        });
    }
  });

  // Final Slide: CTA
  // If the last paragraph looks like a CTA, mark it. 
  // Otherwise, add a generic one or just use the last one as content.
  // StrategyOS usually doesn't generate explicit CTAs unless requested, 
  // but we can enforce a branding slide.
  
  slides.push({
      id: slides.length + 1,
      content: "Follow for more strategies.\n\n" + handle,
      type: "cta"
  });

  return slides;
}
