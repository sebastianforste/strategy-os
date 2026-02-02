#!/bin/bash
# workspace_sync.sh
# Synchronize secrets and config across the Sovereign Workspace.

# Source Paths
STRATEGY_OS_ENV_LOCAL="/Users/sebastian/Developer/strategy-os/.env.local"
STRATEGY_OS_ENV="/Users/sebastian/Developer/strategy-os/.env"
OCR_RENAME_ENV="/Users/sebastian/Developer/ocr_rename/.env"
OCR_CONFIG="/Users/sebastian/Developer/ocr_rename/config.json"

echo "🔄 Syncing Sovereign Workspace..."

# 1. Read Secrets from StrategyOS
if [ -f "$STRATEGY_OS_ENV_LOCAL" ]; then
    echo "  📍 Found StrategyOS .env.local"
    # Extract NEXT_PUBLIC_GOOGLE_API_KEY or NEXT_PUBLIC_GEMINI_API_KEY
    GEMINI_KEY=$(grep "^NEXT_PUBLIC_GOOGLE_API_KEY=" "$STRATEGY_OS_ENV_LOCAL" | cut -d'=' -f2-)
    
    if [ -z "$GEMINI_KEY" ]; then
         GEMINI_KEY=$(grep "^NEXT_PUBLIC_GEMINI_API_KEY=" "$STRATEGY_OS_ENV_LOCAL" | cut -d'=' -f2-)
    fi
else
    echo "  ❌ StrategyOS .env.local not found!"
    exit 1
fi

if [ -f "$STRATEGY_OS_ENV" ]; then
    echo "  📍 Found StrategyOS .env"
    DB_URL=$(grep "^DATABASE_URL=" "$STRATEGY_OS_ENV" | cut -d'=' -f2-)
fi

# 2. Update OCR Rename .env
echo "  📝 Updating OCR Rename .env..."
# Create/Overwrite .env with standardized keys
cat > "$OCR_RENAME_ENV" <<EOL
# Synced via workspace_sync.sh
GOOGLE_GENERATIVE_AI_API_KEY=$GEMINI_KEY
# Legacy Fallback
GEMINI_API_KEY=$GEMINI_KEY
EOL

echo "  ✅ OCR Rename secrets updated."

# 3. Verify Config
if [ -f "$OCR_CONFIG" ]; then
    echo "  🔍 Checking OCR Config..."
    # Simple grep check to ensure API URL is configured (we don't parse JSON in bash typically to avoid dep issues)
    if grep -q "strategy_os_api_url" "$OCR_CONFIG"; then
        echo "  ✅ OCR Config has strategy_os_api_url."
    else
        echo "  ⚠️  OCR Config missing strategy_os_api_url!"
    fi
fi

echo "🚀 Workspace Sync Complete."
