"use client";

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class HighStatusErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("🔊 [Sonic Lattice] Event: DISSONANT_THUD | Frequencies: 110, 80Hz");
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-12 bg-[#16181D] border border-rose-500/20 rounded-lg flex flex-col items-center text-center">
          <AlertTriangle size={32} className="text-rose-500 mb-4" />
          <h3 className="text-lg font-serif font-bold text-white mb-2">Protocol Interrupted</h3>
          <p className="text-xs text-[#8A8D91] uppercase tracking-widest leading-loose">
            The sensory lattice has encountered a collision.<br />
            Degrading gracefully to standard output.
          </p>
        </div>
      );
    }

    return this.props.children;
  }
}
