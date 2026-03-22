#!/bin/bash
set -e

# Buffett Evaluator - Claude Code Runner
# Usage: ./run.sh [agent_number]
# If no agent number specified, runs all agents sequentially

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Load config
if [ ! -f "config.json" ]; then
  echo "❌ config.json not found"
  echo "Create it with: {\"company\": \"Tesla\", \"ticker\": \"TSLA\", \"outputDir\": \"../../evaluations/TSLA\"}"
  exit 1
fi

COMPANY=$(jq -r '.company' config.json)
TICKER=$(jq -r '.ticker' config.json)
OUTPUT_DIR=$(jq -r '.outputDir' config.json)

# Create output directory
mkdir -p "$OUTPUT_DIR"

echo "🔥 Buffett Evaluator - Claude Code Edition"
echo "Company: $COMPANY ($TICKER)"
echo "Output: $OUTPUT_DIR"
echo ""

# Function to run a single agent
run_agent() {
  local AGENT_NUM=$1
  local AGENT_NAME=$2
  local EMOJI=$3
  
  echo "$EMOJI Agent $AGENT_NUM: $AGENT_NAME..."
  
  # Find the agent file
  AGENT_FILE=$(ls agents/$AGENT_NUM-*.md 2>/dev/null | head -1)
  
  if [ ! -f "$AGENT_FILE" ]; then
    echo "❌ Agent file not found: agents/$AGENT_NUM-*.md"
    exit 1
  fi
  
  # Replace placeholders
  PROMPT=$(cat "$AGENT_FILE" | \
    sed "s|\[COMPANY\]|$COMPANY|g" | \
    sed "s|\[TICKER\]|$TICKER|g" | \
    sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent$AGENT_NUM.json|g" | \
    sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/merged-prev.json|g")
  
  # Save prompt to temp file for debugging
  echo "$PROMPT" > "$OUTPUT_DIR/agent$AGENT_NUM-prompt.txt"
  
  # Run Claude Code with permission bypass (safe for local file reading)
  echo "$PROMPT" | claude --dangerously-skip-permissions
  
  # Check output exists
  if [ ! -f "$OUTPUT_DIR/agent$AGENT_NUM.json" ]; then
    echo "❌ Agent $AGENT_NUM failed to produce output"
    exit 1
  fi
  
  # Validate JSON
  if ! jq empty "$OUTPUT_DIR/agent$AGENT_NUM.json" 2>/dev/null; then
    echo "❌ Agent $AGENT_NUM produced invalid JSON"
    exit 1
  fi
  
  echo "✅ Agent $AGENT_NUM complete"
  echo ""
}

# If agent number specified, run only that agent
if [ $# -eq 1 ]; then
  AGENT_NUM=$1
  case $AGENT_NUM in
    1) run_agent 1 "Data Collector" "📊" ;;
    2) run_agent 2 "Business Quality" "🏢" ;;
    3) run_agent 3 "Management Quality" "👔" ;;
    4) run_agent 4 "Financial Health" "💪" ;;
    5) run_agent 5 "Valuation" "💎" ;;
    6) run_agent 6 "Scorecard & Verdict" "📋" ;;
    *)
      echo "❌ Invalid agent number: $AGENT_NUM"
      echo "Usage: ./run.sh [1-6]"
      exit 1
      ;;
  esac
  exit 0
fi

# Run all agents sequentially
run_agent 1 "Data Collector" "📊"

# Prepare merged input for agents 2-4 (they all read agent1 data)
cp "$OUTPUT_DIR/agent1.json" "$OUTPUT_DIR/merged-prev.json"

run_agent 2 "Business Quality" "🏢"
run_agent 3 "Management Quality" "👔"
run_agent 4 "Financial Health" "💪"

# Merge agents 1-4 for agent 5
echo "🔀 Merging agents 1-4..."
jq -s 'reduce .[] as $item ({}; . * $item.data)' \
  "$OUTPUT_DIR/agent1.json" \
  "$OUTPUT_DIR/agent2.json" \
  "$OUTPUT_DIR/agent3.json" \
  "$OUTPUT_DIR/agent4.json" > "$OUTPUT_DIR/merged-1-4.json"

# Wrap in { "data": ... } for consistency
jq '{data: .}' "$OUTPUT_DIR/merged-1-4.json" > "$OUTPUT_DIR/merged-prev.json"

run_agent 5 "Valuation" "💎"

# Merge all agents for agent 6
echo "🔀 Merging all agents..."
jq -s 'reduce .[] as $item ({}; . * $item.data)' \
  "$OUTPUT_DIR/agent1.json" \
  "$OUTPUT_DIR/agent2.json" \
  "$OUTPUT_DIR/agent3.json" \
  "$OUTPUT_DIR/agent4.json" \
  "$OUTPUT_DIR/agent5.json" > "$OUTPUT_DIR/merged-all.json"

jq '{data: .}' "$OUTPUT_DIR/merged-all.json" > "$OUTPUT_DIR/merged-prev.json"

run_agent 6 "Scorecard & Verdict" "📋"

# Create final merged output
echo "🎯 Creating final output..."
jq -s 'reduce .[] as $item ({}; . * $item.data)' \
  "$OUTPUT_DIR/agent1.json" \
  "$OUTPUT_DIR/agent2.json" \
  "$OUTPUT_DIR/agent3.json" \
  "$OUTPUT_DIR/agent4.json" \
  "$OUTPUT_DIR/agent5.json" \
  "$OUTPUT_DIR/agent6.json" > "$OUTPUT_DIR/final.json"

echo "✅ Evaluation complete!"
echo ""
echo "📄 Final output: $OUTPUT_DIR/final.json"
echo ""
echo "Next steps:"
echo "  1. Review: jq . $OUTPUT_DIR/final.json | less"
echo "  2. Convert: node convert-to-website.js $TICKER"
echo "  3. Validate: cd ../.. && node validate-data.js"
echo "  4. Deploy: git add -A && git commit -m 'Add $TICKER evaluation' && git push"
