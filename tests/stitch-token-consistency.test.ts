import { describe, expect, it } from "vitest";
import fs from "fs";
import path from "path";

const TARGETS = [
  "components/UnifiedCanvas.tsx",
  "components/Canvas/CanvasEditor.tsx",
  "components/Canvas/OmniBar.tsx",
  "components/Canvas/LeftRail.tsx",
  "components/Canvas/RightRail.tsx",
  "components/Canvas/DailyBriefing.tsx",
  "components/Canvas/DevicePreview.tsx",
  "components/Canvas/TactileNewsroom.tsx",
  "components/Canvas/MechanicalOdometer.tsx",
  "components/Canvas/SelectionToolbar.tsx",
];

describe("Stitch token consistency", () => {
  it("uses stitch css variables in core shell surfaces", () => {
    for (const rel of TARGETS) {
      const source = fs.readFileSync(path.join(process.cwd(), rel), "utf8");
      expect(source.includes("var(--stitch-")).toBe(true);
    }
  });
});
