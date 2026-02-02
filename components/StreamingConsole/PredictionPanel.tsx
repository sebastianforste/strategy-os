/**
 * PredictionPanel Component
 * -------------------------
 * Displays predictive analysis scores and improvement tips.
 * Extracted from StreamingConsole for maintainability.
 */

"use client";

import React from "react";
import { TrendingUp, X, AlertCircle } from "lucide-react";
import { PredictionResult } from "../../utils/predictive-service";

export interface PredictionPanelProps {
  prediction: PredictionResult | null;
  onClear: () => void;
}

export default function PredictionPanel({ prediction, onClear }: PredictionPanelProps) {
  if (!prediction) return null;

  return (
    <div className="mb-6 mx-6 mt-2 p-4 bg-neutral-900/50 border border-purple-500/20 rounded-xl relative overflow-hidden group/prediction">
      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-purple-500 to-indigo-500" />
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Predictive Score
            </span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-black text-white">{prediction.score}</span>
            <span className="text-sm text-neutral-500">/100</span>
          </div>
        </div>

        <div className="text-right">
          <button
            onClick={onClear}
            className="text-neutral-600 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <ScoreMetric
          label="Hook"
          score={prediction.breakdown.hookStrength}
          threshold={70}
        />
        <ScoreMetric
          label="Retain"
          score={prediction.breakdown.retainability}
          threshold={70}
        />
        <ScoreMetric
          label="Viral"
          score={prediction.breakdown.viralityPotential}
          threshold={70}
        />
      </div>

      {prediction.score < 80 && prediction.improvementTips.length > 0 && (
        <div className="mt-3 pt-3 border-t border-white/5">
          <div className="flex items-center gap-1.5 mb-2 text-amber-400/80 text-xs font-semibold">
            <AlertCircle className="w-3 h-3" />
            Optimization Tips
          </div>
          <ul className="space-y-1">
            {prediction.improvementTips.map((tip, i) => (
              <li
                key={i}
                className="text-xs text-neutral-300 pl-3 relative before:content-['•'] before:absolute before:left-0 before:text-neutral-500"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface ScoreMetricProps {
  label: string;
  score: number;
  threshold: number;
}

function ScoreMetric({ label, score, threshold }: ScoreMetricProps) {
  return (
    <div className="bg-white/5 p-2 rounded text-center">
      <div className="text-[10px] text-neutral-500 uppercase">{label}</div>
      <div
        className={`font-mono text-sm ${score > threshold ? "text-green-400" : "text-yellow-400"}`}
      >
        {score}%
      </div>
    </div>
  );
}
