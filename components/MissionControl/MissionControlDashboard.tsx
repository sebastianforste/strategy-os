"use client";

import React, { useEffect, useState } from "react";
import { getMissionControlData, DashboardData } from "../../actions/mission-control";
import { StatusPulse } from "./StatusPulse";
import AutonomousOpsHub from "./redesigned/AutonomousOpsHub";
import IntelligenceHub from "./redesigned/IntelligenceHub";

export const MissionControlDashboard: React.FC = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ops');

  const fetchData = async () => {
    try {
      const result = await getMissionControlData();
      setData(result);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isUnmounted = false;
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;
    let source: EventSource | null = null;

    const startPollingFallback = () => {
      if (fallbackInterval) return;
      void fetchData();
      fallbackInterval = setInterval(fetchData, 10_000);
    };

    const startSse = () => {
      try {
        source = new EventSource("/api/mission-control/stream");

        source.addEventListener("snapshot", (event) => {
          if (isUnmounted) return;
          try {
            const parsed = JSON.parse((event as MessageEvent).data) as DashboardData;
            // SSE payload comes over JSON; hydrate timestamps to Date for downstream components.
            const hydrated: DashboardData = {
              ...parsed,
              recentActivity: (parsed.recentActivity || []).map((act: any) => ({
                ...act,
                timestamp: new Date(act.timestamp),
              })),
            };
            setData(hydrated);
            setLoading(false);
          } catch (e) {
            console.warn("Failed to parse telemetry snapshot", e);
          }
        });

        source.addEventListener("error", () => {
          // If SSE is unavailable (proxy/serverless), fall back to polling.
          if (isUnmounted) return;
          try {
            source?.close();
          } catch {
            // ignore close errors
          }
          source = null;
          startPollingFallback();
        });
      } catch (e) {
        console.warn("Telemetry stream unavailable; falling back to polling", e);
        startPollingFallback();
      }
    };

    // Always fetch once so the UI populates fast even before SSE delivers.
    void fetchData();
    startSse();

    return () => {
      isUnmounted = true;
      if (fallbackInterval) clearInterval(fallbackInterval);
      try {
        source?.close();
      } catch {
        // ignore close errors
      }
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#06040a]">
        <StatusPulse status="running" size="lg" />
        <p className="ml-4 text-white/40 font-mono text-xs uppercase tracking-widest animate-pulse">
            Establishing Telemetry...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#06040a]">
      {activeTab === 'ops' ? (
        <AutonomousOpsHub 
          activities={data?.recentActivity || []} 
          onDeploy={() => console.log("Deployment triggered")}
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
      ) : (
        <IntelligenceHub 
          metrics={data?.performanceMetrics || { totalImpressions: 0, avgEngagement: 0, viralHits: 0 }}
          onTabChange={setActiveTab}
          activeTab={activeTab}
        />
      )}
    </div>
  );
};
