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

const failures: string[] = [];

for (const rel of TARGETS) {
  const fullPath = path.join(process.cwd(), rel);
  if (!fs.existsSync(fullPath)) {
    failures.push(`${rel}: missing file`);
    continue;
  }

  const source = fs.readFileSync(fullPath, "utf8");
  if (!source.includes("var(--stitch-")) {
    failures.push(`${rel}: no stitch CSS variable usage found`);
  }
}

if (failures.length > 0) {
  console.error("Stitch token usage check failed:\n" + failures.map((f) => `- ${f}`).join("\n"));
  process.exit(1);
}

console.log("Stitch token usage check passed.");
