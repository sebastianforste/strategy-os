#!/bin/zsh

# Full clean start (opt-in). This is intentionally more destructive than
# strategyos_run.command. Use when you're stuck with weird cache/build state.

# Source shell profile to get node/npm in PATH (needed when launched from Finder)
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc" 2>/dev/null
elif [ -f "$HOME/.bash_profile" ]; then
    source "$HOME/.bash_profile" 2>/dev/null
fi

# Ensure we are in the script's directory
cd "$(dirname "$0")" || exit 1

PORT="${PORT:-3000}"

ensure_port_free() {
    if command -v lsof >/dev/null 2>&1; then
        local pid
        pid="$(lsof -ti tcp:"$PORT" 2>/dev/null | head -n 1)"
        if [ -n "$pid" ]; then
            echo "Port $PORT in use (pid $pid). Stop the other server first, or run with PORT=<free_port>."
            exit 1
        fi
    fi
}

cleanup() {
    echo "--- FULL CLEAN START ---"
    rm -rf ".next" "tsconfig.tsbuildinfo" "node_modules/.cache" "node_modules/.bin/.vitest" 2>/dev/null || true
    echo "Cleared: .next, tsconfig.tsbuildinfo, node_modules/.cache, node_modules/.bin/.vitest"

    # Optional: clear a browser SingletonLock only when explicitly requested.
    if [ "${CLEAR_EDGE_LOCK:-}" = "1" ]; then
        LOCKFILE="/Users/sebastian/.beck_export_edge_profile/SingletonLock"
        rm -f "$LOCKFILE" 2>/dev/null && echo "SingletonLock cleared."
    fi
}

cleanup
ensure_port_free

(sleep 3 && open "http://localhost:${PORT}") &

echo "Launching StrategyOS (clean)..."
export PRISMA_CLIENT_ENGINE_TYPE=library
npx prisma generate
PORT="$PORT" npm run dev

