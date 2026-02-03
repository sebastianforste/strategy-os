"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, TrendingUp, Clock, Zap, X, RefreshCw, Loader2, Calendar, Target } from "lucide-react";
import { oracleService, TrendForecast, OptimalWindow, OpportunityAlert } from "../utils/oracle-service";

interface OracleDashboardProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function OracleDashboard({ isOpen, onClose }: OracleDashboardProps) {
    const [forecasts, setForecasts] = useState<TrendForecast[]>([]);
    const [windows, setWindows] = useState<OptimalWindow[]>([]);
    const [alerts, setAlerts] = useState<OpportunityAlert[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            loadPredictions();
        }
    }, [isOpen]);

    const loadPredictions = async () => {
        setIsLoading(true);
        try {
            const [f, w, a] = await Promise.all([
                oracleService.forecastTrendingTopics(),
                oracleService.predictOptimalTimes(),
                oracleService.generateOpportunityAlerts()
            ]);
            setForecasts(f);
            setWindows(w);
            setAlerts(a);
        } catch (e) {
            console.error("Oracle prediction failed", e);
        } finally {
            setIsLoading(false);
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 80) return 'text-green-400';
        if (confidence >= 60) return 'text-amber-400';
        return 'text-orange-400';
    };

    const getConfidenceBg = (confidence: number) => {
        if (confidence >= 80) return 'bg-green-500/10 border-green-500/30';
        if (confidence >= 60) return 'bg-amber-500/10 border-amber-500/30';
        return 'bg-orange-500/10 border-orange-500/30';
    };

    if (!isOpen) return null;

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-neutral-900 border border-white/10 rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-purple-900/20 to-blue-900/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl">
                            <Eye className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="font-bold text-white">The Oracle</h3>
                            <p className="text-xs text-neutral-500 font-mono">PREDICTIVE ANALYTICS ENGINE v1.0</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={loadPredictions}
                            disabled={isLoading}
                            className="p-2 text-neutral-500 hover:text-white transition-colors"
                        >
                            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                        <button onClick={onClose} className="text-neutral-500 hover:text-white transition-colors">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center h-64 gap-4">
                            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                            <p className="text-sm text-neutral-500 font-mono">ANALYZING TEMPORAL PATTERNS...</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* Opportunity Alerts */}
                            {alerts.length > 0 && (
                                <div className="bg-purple-500/5 rounded-xl p-5 border border-purple-500/20">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Zap className="w-4 h-4 text-purple-400" />
                                        <span className="text-sm font-bold text-purple-300 uppercase tracking-tighter">Opportunity Alerts</span>
                                    </div>
                                    <div className="space-y-3">
                                        {alerts.map(alert => (
                                            <div key={alert.id} className={`p-4 rounded-xl border ${getConfidenceBg(alert.confidence)}`}>
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                                                    <span className={`text-[10px] font-mono ${getConfidenceColor(alert.confidence)}`}>
                                                        {alert.confidence}% confidence
                                                    </span>
                                                </div>
                                                <p className="text-xs text-neutral-400">{alert.description}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Trending Topics Forecast */}
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="w-4 h-4 text-green-400" />
                                        <span className="text-sm font-bold text-white">Topic Velocity</span>
                                    </div>
                                    <div className="space-y-3">
                                        {forecasts.length === 0 ? (
                                            <p className="text-xs text-neutral-600 italic">Insufficient data for forecasting. Archive more posts with performance metrics.</p>
                                        ) : (
                                            forecasts.map((forecast, i) => (
                                                <div key={i} className="p-3 bg-black/30 rounded-lg border border-white/5">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <span className="text-xs font-bold text-white">{forecast.topic}</span>
                                                        <span className={`text-[10px] font-mono ${getConfidenceColor(forecast.confidence)}`}>
                                                            {forecast.confidence}%
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <div className="flex-1 bg-white/10 rounded-full h-2 overflow-hidden">
                                                            <div
                                                                className="bg-gradient-to-r from-green-500 to-blue-500 h-full rounded-full"
                                                                style={{ width: `${Math.min(forecast.momentum, 100)}%` }}
                                                            />
                                                        </div>
                                                        <span className="text-[10px] text-neutral-500 font-mono">{Math.round(forecast.momentum)}</span>
                                                    </div>
                                                    <p className="text-[10px] text-neutral-500 italic">{forecast.reasoning}</p>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Optimal Posting Windows */}
                                <div className="bg-white/5 rounded-xl p-5 border border-white/10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm font-bold text-white">Optimal Windows</span>
                                    </div>
                                    <div className="space-y-2">
                                        {windows.length === 0 ? (
                                            <p className="text-xs text-neutral-600 italic">Insufficient data for time optimization. Archive more posts with timestamps.</p>
                                        ) : (
                                            windows.slice(0, 5).map((window, i) => (
                                                <div key={i} className="p-3 bg-black/30 rounded-lg border border-white/5 flex items-center justify-between">
                                                    <div>
                                                        <div className="text-xs font-bold text-white mb-1">
                                                            {days[window.dayOfWeek]} at {window.hour}:00
                                                        </div>
                                                        <div className="text-[10px] text-neutral-500">
                                                            {window.platform} • Avg: {Math.round(window.avgEngagement)} engagement
                                                        </div>
                                                    </div>
                                                    <span className={`text-[10px] font-mono ${getConfidenceColor(window.confidence)}`}>
                                                        {Math.round(window.confidence)}%
                                                    </span>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* 7-Day Forecast Timeline */}
                            <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl p-5 border border-indigo-500/20">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                    <span className="text-sm font-bold text-indigo-300 uppercase tracking-tighter">7-Day Forecast</span>
                                </div>
                                <div className="grid grid-cols-7 gap-2">
                                    {[0, 1, 2, 3, 4, 5, 6].map(day => {
                                        const date = new Date();
                                        date.setDate(date.getDate() + day);
                                        const dayOfWeek = date.getDay();
                                        const hasOpportunity = windows.some(w => w.dayOfWeek === dayOfWeek && w.confidence > 70);

                                        return (
                                            <div
                                                key={day}
                                                className={`p-3 rounded-lg border text-center ${
                                                    hasOpportunity
                                                        ? 'bg-indigo-500/20 border-indigo-500/40'
                                                        : 'bg-white/5 border-white/10'
                                                }`}
                                            >
                                                <div className="text-[10px] text-neutral-500 mb-1">{days[dayOfWeek]}</div>
                                                <div className="text-xs font-bold text-white">{date.getDate()}</div>
                                                {hasOpportunity && (
                                                    <Target className="w-3 h-3 text-indigo-400 mx-auto mt-1" />
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-white/5 bg-black/20 flex items-center justify-between">
                    <p className="text-[10px] text-neutral-600 font-mono">
                        FORECASTS: {forecasts.length} • WINDOWS: {windows.length} • ALERTS: {alerts.length}
                    </p>
                    <p className="text-[9px] text-neutral-600 font-mono uppercase tracking-widest">
                        Powered by Oracle Analytics Engine
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
