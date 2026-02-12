export type LayoutMode = "desktop" | "tablet" | "mobile";

export type ShellPanel = "NONE" | "TOOLS" | "LEFT_RAIL" | "RIGHT_RAIL";

export type ShellActionId =
  | "briefing"
  | "settings"
  | "history"
  | "voice"
  | "ghost"
  | "analytics"
  | "tokens"
  | "manifesto"
  | "preview"
  | "editor"
  | "left_rail"
  | "right_rail";

export interface ShellAction {
  id: ShellActionId;
  label: string;
  description?: string;
  ariaLabel?: string;
  icon?: string;
  group?: "content" | "tools" | "layout";
}
