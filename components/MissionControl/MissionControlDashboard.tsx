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
    fetchData();
    const interval = setInterval(fetchData, 10000); // Poll every 10s
    return () => clearInterval(interval);
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
