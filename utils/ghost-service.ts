export interface Signal {
  id: string;
  topic: string;
  source: "X_TRENDS" | "TECHCRUNCH" | "HN" | "MARKET_MOVER";
  relevanceScore: number;
  velocity: "RISING" | "PEAKING" | "EXPLODING";
  timestamp: string;
  summary: string;
  suggestedAngle: string;
}

const MOCK_SIGNALS: Signal[] = [
  {
    id: "sig_01",
    topic: "OpenAI 'Project Strawberry' Leak",
    source: "X_TRENDS",
    relevanceScore: 98,
    velocity: "EXPLODING",
    timestamp: "2 mins ago",
    summary: "New reasoning capabilities rumored. 40k posts in last hour.",
    suggestedAngle: "The 'Reasoning Gap' is the new moat. Don't build wrappers, build thinkers."
  },
  {
    id: "sig_02",
    topic: "Cursor Acquires Replit",
    source: "TECHCRUNCH",
    relevanceScore: 85,
    velocity: "RISING",
    timestamp: "12 mins ago",
    summary: "Consolidation in AI coding space. IDEs are becoming OSs.",
    suggestedAngle: "The consolidation phase has begun. Why independent dev tools are dead."
  },
  {
    id: "sig_03",
    topic: "React 20 Server Components",
    source: "HN",
    relevanceScore: 72,
    velocity: "PEAKING",
    timestamp: "45 mins ago",
    summary: "Benchmark wars heating up. Vercel vs. The World.",
    suggestedAngle: "Performance is a feature, but DX is the product. Analyzing the React backlash."
  }
];

export function scanForSignals(): Promise<Signal | null> {
  return new Promise((resolve) => {
    // Simulate API latency and random "hits"
    setTimeout(() => {
      const random = Math.random();
      if (random > 0.7) { // 30% chance of finding a signal per scan
        const signal = MOCK_SIGNALS[Math.floor(Math.random() * MOCK_SIGNALS.length)];
        resolve({
            ...signal,
            id: Math.random().toString(36).substring(7), // Unique ID for keying
            timestamp: "Just now"
        });
      } else {
        resolve(null);
      }
    }, 1500);
  });
}
