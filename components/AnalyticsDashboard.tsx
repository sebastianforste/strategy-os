import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, Target, Sparkles, Award, BarChart3, Search, Lightbulb, ExternalLink, Globe } from "lucide-react";
import {
  getAnalyticsStats,
  getPerformanceInsights,
  getSuccessPatterns,
} from "../utils/analytics-service";
import { PerformanceRating } from "../utils/history-service";
import { analyzeCompetitorAction, deepDiveAction } from "../actions/generate";
import { CompetitorContent, TrendReport } from "../utils/trend-service";

interface AnalyticsDashboardProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AnalyticsDashboard({
  isOpen,
  onClose,
}: AnalyticsDashboardProps) {
  const [activeTab, setActiveTab] = useState<"performance" | "market">("performance");
  const [stats, setStats] = useState<any>(null);
  const [insights, setInsights] = useState<string[]>([]);
  const [patterns, setPatterns] = useState<any>(null);

  // Market Intel State
  const [competitorName, setCompetitorName] = useState("");
  const [competitorResults, setCompetitorResults] = useState<CompetitorContent[]>([]);
  const [isSearchingCompetitor, setIsSearchingCompetitor] = useState(false);
  
  const [deepDiveTopic, setDeepDiveTopic] = useState("");
  const [trendReport, setTrendReport] = useState<TrendReport | null>(null);
  const [isDeepDiving, setIsDeepDiving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = () => {
    const loadedStats = getAnalyticsStats();
    const loadedInsights = getPerformanceInsights();
    const loadedPatterns = getSuccessPatterns();

    setStats(loadedStats);
    setInsights(loadedInsights);
    setPatterns(loadedPatterns);
  };

  const handleCompetitorSearch = async () => {
    if(!competitorName.trim()) return;
    setIsSearchingCompetitor(true);
    try {
        const serperKey = localStorage.getItem("strategyos_serper_key") || "";
        const results = await analyzeCompetitorAction(competitorName, serperKey);
        setCompetitorResults(results);
    } catch(e) {
        console.error(e);
    } finally {
        setIsSearchingCompetitor(false);
    }
  };

  const handleDeepDive = async () => {
      if(!deepDiveTopic.trim()) return;
      setIsDeepDiving(true);
      try {
          const geminiKey = localStorage.getItem("strategyos_gemini_key") || "";
          const report = await deepDiveAction(deepDiveTopic, geminiKey);
          setTrendReport(report);
      } catch(e) {
          console.error(e);
      } finally {
          setIsDeepDiving(false);
      }
  };

  if (!isOpen) return null;

  const ratingColors: { [key in Exclude<PerformanceRating, null>]: string } = {
    viral: "bg-green-500",
    good: "bg-blue-500",
    meh: "bg-yellow-500",
    flopped: "bg-red-500",
  };

  const ratingLabels: { [key in Exclude<PerformanceRating, null>]: string } = {
    viral: "Viral",
    good: "Good",
    meh: "Meh",
    flopped: "Flopped",
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-[#0A0A0A] border border-neutral-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-800">
            <div className="flex items-center gap-6">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <BarChart3 className="w-6 h-6" />
                        StrategyOS Analytics
                    </h2>
                    <p className="text-sm text-neutral-500 mt-1">
                        Data-driven insights for your content engine.
                    </p>
                </div>
                
                {/* Tabs */}
                <div className="flex bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                    <button
                        onClick={() => setActiveTab("performance")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "performance" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
                    >
                        Performance
                    </button>
                    <button
                        onClick={() => setActiveTab("market")}
                        className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${activeTab === "market" ? "bg-neutral-800 text-white shadow-sm" : "text-neutral-400 hover:text-neutral-200"}`}
                    >
                        Market Intel
                    </button>
                </div>
            </div>

            <button onClick={onClose} className="text-neutral-500 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            
            {activeTab === "performance" && (
                <>
                {!stats || stats.totalPosts === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                    <BarChart3 className="w-16 h-16 text-neutral-700 mb-4" />
                    <h3 className="text-lg font-medium text-white mb-2">No Data Yet</h3>
                    <p className="text-neutral-500 text-sm max-w-md">
                    Generate some content and rate it to unlock analytics insights.
                    Start by marking posts as Viral, Good, Meh, or Flopped in your history.
                    </p>
                </div>
                ) : (
                <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className="text-neutral-500 text-xs font-medium mb-1">
                        TOTAL POSTS
                        </div>
                        <div className="text-3xl font-bold text-white">
                        {stats.totalPosts}
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className="text-neutral-500 text-xs font-medium mb-1">
                        RATED POSTS
                        </div>
                        <div className="text-3xl font-bold text-white">
                        {stats.ratedPosts}
                        </div>
                    </div>
                    <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4">
                        <div className="text-neutral-500 text-xs font-medium mb-1">
                        AVG RATING
                        </div>
                        <div className="text-3xl font-bold text-white">
                        {stats.avgRating.toFixed(1)}/4
                        </div>
                    </div>
                    </div>

                    {/* Insights */}
                    {insights.length > 0 && (
                    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-3">
                        <Sparkles className="w-5 h-5 text-blue-400" />
                        <h3 className="font-bold text-white">Key Insights</h3>
                        </div>
                        <ul className="space-y-2">
                        {insights.map((insight, i) => (
                            <li key={i} className="text-sm text-neutral-300">
                            {insight}
                            </li>
                        ))}
                        </ul>
                    </div>
                    )}

                    {/* Rating Distribution */}
                    {stats.ratedPosts > 0 && (
                    <div>
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5" />
                        Rating Distribution
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {(Object.keys(ratingLabels) as Exclude<PerformanceRating, null>[]).map((rating) => (
                            <div
                            key={rating}
                            className="bg-neutral-900 border border-neutral-800 rounded-lg p-4"
                            >
                            <div className="flex items-center gap-2 mb-2">
                                <div className={`w-3 h-3 rounded-full ${ratingColors[rating]}`} />
                                <span className="text-xs font-medium text-neutral-500">
                                {ratingLabels[rating]}
                                </span>
                            </div>
                            <div className="text-2xl font-bold text-white">
                                {stats.ratingDistribution[rating]}
                            </div>
                            <div className="text-xs text-neutral-600">
                                {stats.ratedPosts > 0
                                ? Math.round(
                                    (stats.ratingDistribution[rating] / stats.ratedPosts) * 100
                                    )
                                : 0}
                                %
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Top Hooks */}
                    {stats.topHooks.length > 0 && (
                    <div>
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Award className="w-5 h-5" />
                        Top Performing Hooks
                        </h3>
                        <div className="space-y-2">
                        {stats.topHooks.map((hook: string, i: number) => (
                            <div
                            key={i}
                            className="bg-neutral-900 border border-neutral-800 rounded-lg p-3"
                            >
                            <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center text-xs font-bold text-black">
                                {i + 1}
                                </div>
                                <p className="text-sm text-neutral-300 flex-1">
                                {hook}
                                </p>
                            </div>
                            </div>
                        ))}
                        </div>
                    </div>
                    )}

                    {/* Success Patterns */}
                    {patterns && patterns.bestHookTypes.length > 0 && (
                    <div>
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                        <Target className="w-5 h-5" />
                        Success Patterns
                        </h3>
                        <div className="bg-neutral-900 border border-neutral-800 rounded-lg p-4 space-y-3">
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">
                            Best Hook Types
                            </div>
                            <div className="flex gap-2 flex-wrap">
                            {patterns.bestHookTypes.map((type: string) => (
                                <span
                                key={type}
                                className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-white capitalize"
                                >
                                {type}
                                </span>
                            ))}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">
                            Optimal Length
                            </div>
                            <div className="text-sm text-white">
                            {patterns.bestLength.min} - {patterns.bestLength.max} characters
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-neutral-500 mb-1">
                            Best Times to Post
                            </div>
                            <div className="flex gap-2 flex-wrap">
                            {patterns.bestTimes.map((time: string) => (
                                <span
                                key={time}
                                className="px-3 py-1 bg-neutral-800 rounded-full text-xs text-white"
                                >
                                {time}
                                </span>
                            ))}
                            </div>
                        </div>
                        </div>
                    </div>
                    )}
                </div>
                )}
                </>
            )}

            {activeTab === "market" && (
                <div className="space-y-8 animate-in fade-in">
                    
                    {/* COMPETITOR WATCH */}
                    <section>
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Globe className="w-5 h-5 text-blue-400" />
                             Competitor Watch
                         </h3>
                         <div className="flex gap-2 mb-6">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    value={competitorName}
                                    onChange={(e) => setCompetitorName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleCompetitorSearch()}
                                    placeholder="Enter LinkedIn/Twitter handle (e.g. 'Justin Welsh')"
                                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                            <button
                                onClick={handleCompetitorSearch}
                                disabled={isSearchingCompetitor}
                                className="bg-white text-black font-bold px-6 rounded-lg hover:bg-neutral-200 transition-colors disabled:opacity-50"
                            >
                                {isSearchingCompetitor ? "Scanning..." : "Search"}
                            </button>
                         </div>
                         
                         {competitorResults.length > 0 && (
                             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                 {competitorResults.map((item, i) => (
                                     <a 
                                        href={item.link} 
                                        target="_blank" 
                                        key={i}
                                        className="block p-4 bg-neutral-900 border border-neutral-800 rounded-lg hover:border-neutral-700 transition-colors group"
                                     >
                                         <div className="flex items-start justify-between mb-2">
                                            <span className="text-[10px] font-bold text-neutral-500 uppercase bg-neutral-950 px-2 py-0.5 rounded border border-neutral-800">
                                                {item.source}
                                            </span>
                                            <ExternalLink className="w-3 h-3 text-neutral-600 group-hover:text-white" />
                                         </div>
                                         <h4 className="text-sm font-medium text-white line-clamp-2 mb-2 group-hover:text-blue-400 transition-colors">
                                             {item.title}
                                         </h4>
                                         <p className="text-xs text-neutral-400 line-clamp-3">
                                             {item.snippet}
                                         </p>
                                     </a>
                                 ))}
                             </div>
                         )}
                    </section>
                    
                    {/* TREND LABORATORY */}
                    <section>
                         <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                             <Lightbulb className="w-5 h-5 text-yellow-400" />
                             Trend Laboratory (Deep Dive)
                         </h3>
                         <div className="flex gap-2 mb-6">
                            <input
                                value={deepDiveTopic}
                                onChange={(e) => setDeepDiveTopic(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleDeepDive()}
                                placeholder="Enter a topic (e.g. 'AI Agents', 'Remote Work')"
                                className="flex-1 bg-neutral-900 border border-neutral-800 rounded-lg px-4 py-3 text-sm text-white focus:border-yellow-500 outline-none transition-colors"
                            />
                            <button
                                onClick={handleDeepDive}
                                disabled={isDeepDiving}
                                className="bg-neutral-800 text-white font-bold px-6 rounded-lg hover:bg-neutral-700 transition-colors border border-neutral-700 disabled:opacity-50"
                            >
                                {isDeepDiving ? "Analyzing..." : "Deep Dive"}
                            </button>
                         </div>

                         {trendReport && (
                             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                 <div className="p-5 bg-neutral-900/50 border border-neutral-800 rounded-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                     <h4 className="text-xs font-bold text-neutral-500 uppercase mb-2">The Mainstream View</h4>
                                     <p className="text-sm text-neutral-200 leading-relaxed font-medium">
                                         "{trendReport.mainstreamView}"
                                     </p>
                                 </div>
                                 <div className="p-5 bg-neutral-900/50 border border-red-900/30 rounded-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-20 h-20 bg-red-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                     <h4 className="text-xs font-bold text-red-400 uppercase mb-2">The Contrarian Angle</h4>
                                     <p className="text-sm text-white leading-relaxed font-bold">
                                         "{trendReport.contrarianAngle}"
                                     </p>
                                 </div>
                                 <div className="p-5 bg-neutral-900/50 border border-purple-900/30 rounded-xl relative overflow-hidden">
                                     <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                     <h4 className="text-xs font-bold text-purple-400 uppercase mb-2">Underrated Insight</h4>
                                     <p className="text-sm text-neutral-200 leading-relaxed italic">
                                         "{trendReport.underratedInsight}"
                                     </p>
                                 </div>
                             </div>
                         )}
                    </section>

                </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-neutral-800 bg-neutral-900/30">
            <button
              onClick={onClose}
              className="w-full px-4 py-3 bg-white text-black rounded-lg hover:bg-neutral-200 text-sm font-bold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
