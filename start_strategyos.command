#!/bin/bash
echo "Starting StrategyOS..."
WORKDIR="/Users/sebastian/Developer/strategy-os"
cd "$WORKDIR"

cleanup() {
    echo "--- PRE-FLIGHT CLEANUP ---"
    
    # 1. Remove build artifacts that often cause locks
    [ -d "node_modules/.bin/.vitest" ] && rm -rf "node_modules/.bin/.vitest" && echo "Removed .vitest artifacts"
    [ -f "tsconfig.tsbuildinfo" ] && rm -f "tsconfig.tsbuildinfo" && echo "Removed tsconfig.tsbuildinfo"
    
    # 2. Clear SingletonLock for Edge Profile
    LOCKFILE="/Users/sebastian/.beck_export_edge_profile/SingletonLock"
    if [ -f "$LOCKFILE" ]; then
        rm -f "$LOCKFILE"
        echo "Successfully cleared SingletonLock."
    fi

    # 3. Clear file flags (nouchg) to prevent EPERM on build folders
    echo "Ensuring build folders are writable..."
    sudo chflags -R nouchg .next node_modules 2>/dev/null || chflags -R nouchg .next node_modules 2>/dev/null
}

# Execute cleanup
cleanup

# Open the browser (waits a moment to ensure server spin-up starts)
(sleep 3 && open http://localhost:3000) &

# Start the application with error awareness
echo "Launching StrategyOS..."
if ! npm run dev; then
    ERROR_CODE=$?
    echo "---"
    echo "ERROR: StrategyOS failed to start (Exit code: $ERROR_CODE)"
    
    # Check for EPERM in the output would be better but we can't easily capture it and re-display it perfectly
    # So we provide a general hint if it fails
    echo "TIP: If you see 'EPERM: Operation not permitted', please ensure your terminal"
    echo "has 'Full Disk Access' in: System Settings > Privacy & Security > Full Disk Access"
    exit $ERROR_CODE
fi
