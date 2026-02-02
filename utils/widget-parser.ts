
export interface WidgetBlock {
  type: string;
  data: unknown;
}

export function extractWidgets(content: string): { cleanContent: string; widgets: WidgetBlock[] } {
  const widgets: WidgetBlock[] = [];
  let cleanContent = content;

  // Regex to find ```json widget:type ... ``` or just ```json ... ``` that contains widget data
  // For now, let's stick to a robust detection of labeled code blocks if possible, or inspection.
  // We'll look for blocks that start with ```json and contain "type": "swot"
  
  const jsonBlockRegex = /```json\s*(\{[\s\S]*?\})\s*```/g;
  let match;

  // We need to iterate and replace. 
  // Note: matchAll is newer, loop is safer for replace.
  
  // We will build a new string excluding the widget blocks
  const parts = [];
  let lastIndex = 0;
  
  while ((match = jsonBlockRegex.exec(content)) !== null) {
      try {
          const jsonStr = match[1];
          const parsed = JSON.parse(jsonStr);
          
          if (parsed.type && (parsed.type === 'swot' || parsed.type === 'trend')) {
              widgets.push(parsed);
              // Add text before this block
              parts.push(content.substring(lastIndex, match.index));
              lastIndex = jsonBlockRegex.lastIndex;
          }
      } catch {
          // If parse fails, ignore (it might be incomplete json during streaming)
      }
  }
  
  parts.push(content.substring(lastIndex));
  cleanContent = parts.join("").trim();
  
  return { cleanContent, widgets };
}
