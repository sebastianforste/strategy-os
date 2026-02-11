import { useEffect } from 'react';
import { $getSelection, $isRangeSelection, ParagraphNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

/**
 * useTypographyGuard
 * 
 * Implements "The Widow Killer" protocol.
 * Detects paragraphs where the last word is an orphan (widow)
 * and binds it to the penultimate word using a non-breaking space.
 */
export function useTypographyGuard() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    return editor.registerNodeTransform(ParagraphNode, (node: ParagraphNode) => {
      const textContent = node.getTextContent();
      const words = textContent.trim().split(/\s+/);

      if (words.length < 3) return;

      const lastWord = words[words.length - 1];
      const penultimateWord = words[words.length - 2];

      // Use a safer check for NBSP
      if (textContent.includes('\u00A0')) return;

      editor.update(() => {
        const lastChild = node.getLastChild();
        // Explicit typing for Lexical node
        if (lastChild && lastChild.getType() === 'text') {
           const text = lastChild.getTextContent();
           const lastSpaceIndex = text.lastIndexOf(' ');
           
           if (lastSpaceIndex !== -1) {
             const newText = text.substring(0, lastSpaceIndex) + '\u00A0' + text.substring(lastSpaceIndex + 1);
             // @ts-ignore
             lastChild.setTextContent(newText);
           }
        }
      });
    });
  }, [editor]);
}

export function TypographyGuardPlugin(): null {
  useTypographyGuard();
  return null;
}
