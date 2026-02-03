import { motion } from "framer-motion";
import { Users, TrendingUp, Award, BarChart3, ArrowUpRight, BookOpen, Feather, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { ColleagueStats, TeamPerformanceMetrics } from "../utils/analytics-service";
import { cardVariants, staggerContainerVariants } from "../utils/animations";

export default function TeamAnalyticsDashboard() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    metrics: TeamPerformanceMetrics;
    colleagues: ColleagueStats[];
    recommendations: string[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/analytics/team")
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="w-6 h-6 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { metrics, colleagues, recommendations } = data;

  return (
    <motion.div 
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8"
    >
      {/* Header Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard 
          label="Total Team Posts" 
          value={metrics.totalPosts} 
          icon={<Users className="w-4 h-4 text-blue-400" />} 
        />
        <MetricCard 
          label="Total Impressions" 
          value={metrics.totalImpressions.toLocaleString()} 
          icon={<TrendingUp className="w-4 h-4 text-green-400" />} 
        />
        <MetricCard 
          label="Top Persona" 
          value={metrics.topPersona === "cso" ? "The Strategist" : metrics.topPersona} 
          icon={<Award className="w-4 h-4 text-purple-400" />} 
          subtext="Highest Volume"
        />
        <MetricCard 
          label="Top Advocate" 
          value={metrics.topColleague} 
          icon={<Users className="w-4 h-4 text-orange-400" />} 
        />
      </div>
      
      {/* Content Quality Metrics (Phase 30) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <MetricCard 
          label="Avg Word Count" 
          value={metrics.avgWordCount || 0} 
          icon={<BookOpen className="w-4 h-4 text-pink-400" />} 
          subtext="Target: 150-300"
        />
        <MetricCard 
          label="Readability" 
          value={`Grade ${metrics.avgReadabilityScore || 0}`} 
          icon={<Feather className="w-4 h-4 text-cyan-400" />} 
          subtext="Lower is better"
        />
        <MetricCard 
          label="Brand Voice" 
          value={metrics.signaturePhraseFreq || 0} 
          icon={<Zap className="w-4 h-4 text-yellow-400" />} 
          subtext="Phrases per post"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colleague Leaderboard */}
        <motion.div 
          variants={cardVariants}
          className="lg:col-span-2 bg-[#0A0A0A] border border-white/5 rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-400" />
              Team Leaderboard
            </h3>
            <span className="text-xs text-neutral-500">Last 30 Days</span>
          </div>

          <div className="space-y-4">
            {colleagues.length === 0 ? (
              <p className="text-neutral-500 text-sm text-center py-8">No team posts yet.</p>
            ) : (
              colleagues.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                      {i + 1}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{c.name}</div>
                      <div className="text-xs text-neutral-500">{c.role || "Team Member"}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-white">{c.postCount} posts</div>
                    <div className="text-xs text-neutral-500">
                      {Math.round(c.avgImpressions).toLocaleString()} avg. views
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* AI Recommendations */}
        <motion.div 
          variants={cardVariants}
          className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6 h-fit"
        >
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Strategy Insights</h3>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <div key={i} className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl">
                <div className="flex items-start gap-3">
                  <ArrowUpRight className="w-4 h-4 text-blue-400 mt-1 shrink-0" />
                  <p className="text-sm text-blue-100/90 leading-relaxed">
                    {rec}
                  </p>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && (
              <p className="text-neutral-500 text-sm">Not enough data for insights yet.</p>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}

function MetricCard({ label, value, icon, subtext }: { label: string, value: string | number, icon: React.ReactNode, subtext?: string }) {
  return (
    <motion.div 
      variants={cardVariants}
      className="bg-[#0A0A0A] border border-white/5 p-4 rounded-xl"
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white tracking-tight">
        {value}
      </div>
      {subtext && (
        <div className="text-xs text-neutral-500 mt-1">{subtext}</div>
      )}
    </motion.div>
  );
}
