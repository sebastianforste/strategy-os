"use client";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useEffect, useState, useCallback } from "react";
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_TAB_COMMAND,
  KEY_ESCAPE_COMMAND,
  $createTextNode,
} from "lexical";
import { mergeRegister } from "@lexical/utils";

// Mock API for local dev debouncer
const fetchGhostCompletion = async (text: string): Promise<string> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  if (text.endsWith("theater.")) return " Real impact is found in the second-order effects no one wants to audit.";
  if (text.endsWith("strategy")) return " is just a series of expensive mistakes.";
  return "";
};

export function GhostTextPlugin() {
  const [editor] = useLexicalComposerContext();
  const [suggestion, setSuggestion] = useState<string>("");
  const [typingTimer, setTypingTimer] = useState<NodeJS.Timeout | null>(null);

  const clearTimer = useCallback(() => {
    if (typingTimer) clearTimeout(typingTimer);
  }, [typingTimer]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState, dirtyLeaves }) => {
        if (dirtyLeaves.size === 0) return;

        clearTimer();
        setSuggestion("");

        const timer = setTimeout(() => {
          editorState.read(async () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && selection.isCollapsed()) {
              const textContent = editor.getRootElement()?.innerText || "";
              const completion = await fetchGhostCompletion(textContent.trim());
              setSuggestion(completion);
            }
          });
        }, 600);

        setTypingTimer(timer);
      }),

      editor.registerCommand(
        KEY_TAB_COMMAND,
        (event) => {
          if (suggestion) {
            event.preventDefault();
            editor.update(() => {
              const selection = $getSelection();
              if ($isRangeSelection(selection)) {
                selection.insertText(suggestion);
              }
            });
            setSuggestion("");
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      ),

      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          if (suggestion) {
            setSuggestion("");
            return true;
          }
          return false;
        },
        COMMAND_PRIORITY_LOW
      )
    );
  }, [editor, suggestion, typingTimer, clearTimer]);

  return suggestion ? (
    <div className="pointer-events-none select-none text-[#94A3B8] italic inline">
      {suggestion}
    </div>
  ) : null;
}
