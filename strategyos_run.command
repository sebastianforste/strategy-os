# Source shell profile to get node/npm in PATH (needed when launched from Finder)
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc" 2>/dev/null
elif [ -f "$HOME/.bash_profile" ]; then
    source "$HOME/.bash_profile" 2>/dev/null
fi

# Ensure we are in the script's directory
cd "$(dirname "$0")" || exit 1

echo "Starting StrategyOS..."


cleanup() {
    echo "--- PRE-FLIGHT CLEANUP ---"
    
    # 1. Remove build artifacts (silent fail if locked)
    rm -rf ".next" "node_modules/.bin/.vitest" "tsconfig.tsbuildinfo" "node_modules/.cache" 2>/dev/null && echo "Build artifacts and cache cleared."
    
    # 2. Clear SingletonLock (user mode only)
    LOCKFILE="/Users/sebastian/.beck_export_edge_profile/SingletonLock"
    rm -f "$LOCKFILE" 2>/dev/null && echo "SingletonLock cleared."

    # 3. Clear file flags - best effort (user mode)
    echo "Unlocking build folders..."
    chflags -R nouchg .next node_modules 2>/dev/null || true

    # 4. Clear stale service worker
    rm -f public/sw.js 2>/dev/null && echo "Service worker cleared."
}

# Execute cleanup
cleanup

# Launch browser (background)
(sleep 3 && open "http://localhost:3000") &

# Start StrategyOS
echo "Launching StrategyOS..."
export PRISMA_CLIENT_ENGINE_TYPE=library
npx prisma generate
if ! npm run dev; then
    echo "---"
    echo "Launch Failed."
    echo "Tip: Check 'Full Disk Access' if errors persist."
    exit 1
fi
