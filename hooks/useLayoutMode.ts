"use client";

import { useEffect, useState } from "react";
import type { LayoutMode } from "@/types/shell-ui";

const DESKTOP_QUERY = "(min-width: 1280px)";
const TABLET_QUERY = "(min-width: 768px) and (max-width: 1279px)";

function getLayoutMode(): LayoutMode {
  if (typeof window === "undefined") return "mobile";
  if (window.matchMedia(DESKTOP_QUERY).matches) return "desktop";
  if (window.matchMedia(TABLET_QUERY).matches) return "tablet";
  return "mobile";
}

export function useLayoutMode(): LayoutMode {
  // Use a deterministic initial mode to keep SSR/CSR markup aligned.
  const [layoutMode, setLayoutMode] = useState<LayoutMode>("mobile");

  useEffect(() => {
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    const tabletQuery = window.matchMedia(TABLET_QUERY);

    const sync = () => {
      setLayoutMode(getLayoutMode());
    };

    sync();
    desktopQuery.addEventListener("change", sync);
    tabletQuery.addEventListener("change", sync);
    window.addEventListener("resize", sync);

    return () => {
      desktopQuery.removeEventListener("change", sync);
      tabletQuery.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);

  return layoutMode;
}
