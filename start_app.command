#!/bin/bash
echo "Starting StrategyOS..."
cd /Users/sebastian/Developer/strategy-os

# Open the browser (waits a moment to ensure server spin-up starts)
(sleep 3 && open http://localhost:3000) &

# Start the application
npm run dev
