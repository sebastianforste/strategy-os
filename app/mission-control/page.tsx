import { MissionControlDashboard } from "@/components/MissionControl/MissionControlDashboard";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mission Control | StrategyOS",
  description: "Real-time AI agent monitoring and telemetry.",
};

export default function MissionControlPage() {
  return <MissionControlDashboard />;
}
