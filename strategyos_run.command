#!/bin/zsh

# Source shell profile to get node/npm in PATH (needed when launched from Finder)
if [ -f "$HOME/.zshrc" ]; then
    source "$HOME/.zshrc" 2>/dev/null
elif [ -f "$HOME/.bash_profile" ]; then
    source "$HOME/.bash_profile" 2>/dev/null
fi

# Ensure we are in the script's directory
cd "$(dirname "$0")" || exit 1

echo "Starting StrategyOS..."

PORT="${PORT:-3000}"

cleanup() {
    echo "--- PRE-FLIGHT CLEANUP ---"

    # Clear the Next dev lock if it got stuck. This is the common cause of:
    # "Unable to acquire lock at .next/dev/lock"
    rm -f ".next/dev/lock" 2>/dev/null && echo "Next dev lock cleared."

    # Optional: clear a browser SingletonLock only when explicitly requested.
    # This is not related to Next.js and is intentionally opt-in.
    if [ "${CLEAR_EDGE_LOCK:-}" = "1" ]; then
        LOCKFILE="/Users/sebastian/.beck_export_edge_profile/SingletonLock"
        rm -f "$LOCKFILE" 2>/dev/null && echo "SingletonLock cleared."
    fi
}

ensure_port_free() {
    # Do not kill processes. If the port is taken, exit with a clear message.
    if command -v lsof >/dev/null 2>&1; then
        local pid
        pid="$(lsof -ti tcp:"$PORT" 2>/dev/null | head -n 1)"
        if [ -n "$pid" ]; then
            echo "Port $PORT in use (pid $pid). Stop the other server first, or run with PORT=<free_port>."
            exit 1
        fi
    fi
}

# Execute cleanup
cleanup

# Refuse to start if the port is already taken.
ensure_port_free

# Launch browser (background)
(sleep 3 && open "http://localhost:${PORT}") &

# Start StrategyOS
echo "Launching StrategyOS..."
export PRISMA_CLIENT_ENGINE_TYPE=library
npx prisma generate
if ! PORT="$PORT" npm run dev; then
    echo "---"
    echo "Launch Failed."
    echo "Tip: Check 'Full Disk Access' if errors persist."
    exit 1
fi
