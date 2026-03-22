#!/bin/bash
set -e

# Deterministic Evaluation Runner
# Runs evaluation twice, compares outputs, retries up to 5 times until match

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Load config
if [ ! -f "config.json" ]; then
  echo -e "${RED}❌ config.json not found${NC}"
  echo "Create it with: {\"company\": \"Tesla\", \"ticker\": \"TSLA\", \"outputDir\": \"../../evaluations/TSLA\"}"
  exit 1
fi

COMPANY=$(jq -r '.company' config.json)
TICKER=$(jq -r '.ticker' config.json)
OUTPUT_DIR=$(jq -r '.outputDir' config.json)

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║         DETERMINISTIC BUFFETT EVALUATION                          ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo -e "${BLUE}Company:${NC} $COMPANY ($TICKER)"
echo -e "${BLUE}Output:${NC} $OUTPUT_DIR"
echo ""

# Create output directory
mkdir -p "$OUTPUT_DIR/determinism"

MAX_ATTEMPTS=5
attempt=1
matched=false

while [ $attempt -le $MAX_ATTEMPTS ] && [ "$matched" = false ]; do
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${YELLOW}Attempt $attempt of $MAX_ATTEMPTS${NC}"
  echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo ""
  
  # Run 1
  echo -e "${CYAN}🔄 Run 1/2: Executing full evaluation...${NC}"
  echo ""
  
  # Clean previous outputs
  rm -rf "$OUTPUT_DIR/agent"*.json "$OUTPUT_DIR/merged-"*.json "$OUTPUT_DIR/final.json" 2>/dev/null || true
  
  # Run full evaluation
  ./run.sh > "$OUTPUT_DIR/determinism/run1-log-attempt$attempt.txt" 2>&1
  
  if [ ! -f "$OUTPUT_DIR/final.json" ]; then
    echo -e "${RED}❌ Run 1 failed to produce final.json${NC}"
    cat "$OUTPUT_DIR/determinism/run1-log-attempt$attempt.txt"
    exit 1
  fi
  
  # Save Run 1 output
  cp "$OUTPUT_DIR/final.json" "$OUTPUT_DIR/determinism/run1-attempt$attempt.json"
  echo -e "${GREEN}✅ Run 1 complete${NC}"
  echo ""
  
  # Wait 2 seconds (give filesystem time to settle)
  sleep 2
  
  # Run 2
  echo -e "${CYAN}🔄 Run 2/2: Executing full evaluation again...${NC}"
  echo ""
  
  # Clean previous outputs
  rm -rf "$OUTPUT_DIR/agent"*.json "$OUTPUT_DIR/merged-"*.json "$OUTPUT_DIR/final.json" 2>/dev/null || true
  
  # Run full evaluation again
  ./run.sh > "$OUTPUT_DIR/determinism/run2-log-attempt$attempt.txt" 2>&1
  
  if [ ! -f "$OUTPUT_DIR/final.json" ]; then
    echo -e "${RED}❌ Run 2 failed to produce final.json${NC}"
    cat "$OUTPUT_DIR/determinism/run2-log-attempt$attempt.txt"
    exit 1
  fi
  
  # Save Run 2 output
  cp "$OUTPUT_DIR/final.json" "$OUTPUT_DIR/determinism/run2-attempt$attempt.json"
  echo -e "${GREEN}✅ Run 2 complete${NC}"
  echo ""
  
  # Compare outputs
  echo -e "${CYAN}🔍 Comparing outputs...${NC}"
  echo ""
  
  if node compare-outputs.js \
    "$OUTPUT_DIR/determinism/run1-attempt$attempt.json" \
    "$OUTPUT_DIR/determinism/run2-attempt$attempt.json" \
    > "$OUTPUT_DIR/determinism/comparison-attempt$attempt.txt" 2>&1; then
    
    # MATCH!
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                  ✅ DETERMINISTIC MATCH                            ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}Both runs produced identical results.${NC}"
    echo -e "${GREEN}Evaluation is deterministic after $attempt attempt(s).${NC}"
    echo ""
    
    # Copy final output
    cp "$OUTPUT_DIR/determinism/run1-attempt$attempt.json" "$OUTPUT_DIR/final.json"
    
    # Save summary
    cat > "$OUTPUT_DIR/determinism/summary.txt" << EOF
Deterministic Evaluation Summary
================================
Company: $COMPANY ($TICKER)
Date: $(date)
Attempts: $attempt
Result: MATCH ✅

Both runs produced identical outputs.
Evaluation is deterministic.

Files:
- Run 1: determinism/run1-attempt$attempt.json
- Run 2: determinism/run2-attempt$attempt.json
- Final: final.json
EOF
    
    cat "$OUTPUT_DIR/determinism/summary.txt"
    echo ""
    echo -e "${BLUE}📄 Summary saved: $OUTPUT_DIR/determinism/summary.txt${NC}"
    echo ""
    
    matched=true
    
  else
    # MISMATCH
    echo -e "${RED}"
    echo "╔════════════════════════════════════════════════════════════════════╗"
    echo "║                  ❌ NON-DETERMINISTIC OUTPUT                       ║"
    echo "╚════════════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    
    # Show comparison report
    cat "$OUTPUT_DIR/determinism/comparison-attempt$attempt.txt"
    echo ""
    
    if [ $attempt -lt $MAX_ATTEMPTS ]; then
      echo -e "${YELLOW}⚠️  Outputs don't match. Retrying...${NC}"
      echo ""
      sleep 3
    else
      echo -e "${RED}"
      echo "╔════════════════════════════════════════════════════════════════════╗"
      echo "║              ❌ MAX RETRIES EXCEEDED                               ║"
      echo "╚════════════════════════════════════════════════════════════════════╝"
      echo -e "${NC}"
      echo ""
      echo -e "${RED}Failed to achieve deterministic results after $MAX_ATTEMPTS attempts.${NC}"
      echo ""
      echo -e "${YELLOW}Debug information:${NC}"
      echo "  - Comparison logs: $OUTPUT_DIR/determinism/comparison-attempt*.txt"
      echo "  - Run outputs: $OUTPUT_DIR/determinism/run*-attempt*.json"
      echo "  - Run logs: $OUTPUT_DIR/determinism/run*-log-attempt*.txt"
      echo ""
      echo -e "${YELLOW}Possible causes:${NC}"
      echo "  1. Agent prompts have randomness/non-deterministic instructions"
      echo "  2. External data source changed between runs (SEC filings updated)"
      echo "  3. Calculation rounding differences"
      echo "  4. Claude Code model has inherent randomness"
      echo ""
      echo -e "${YELLOW}Recommended actions:${NC}"
      echo "  1. Review diff-report.json for patterns"
      echo "  2. Check if agents have 'latest' or 'current' instructions (non-deterministic)"
      echo "  3. Ensure all inputs are frozen (no live data fetching)"
      echo "  4. Add more specific calculation instructions to agents"
      echo ""
      
      # Save failure summary
      cat > "$OUTPUT_DIR/determinism/summary.txt" << EOF
Deterministic Evaluation Summary
================================
Company: $COMPANY ($TICKER)
Date: $(date)
Attempts: $MAX_ATTEMPTS
Result: FAILED ❌

Outputs did not match after $MAX_ATTEMPTS attempts.
Evaluation is NON-deterministic.

Files:
- All run outputs: determinism/run*-attempt*.json
- All comparisons: determinism/comparison-attempt*.txt
- All logs: determinism/run*-log-attempt*.txt

Action required: Investigate differences and fix non-deterministic sources.
EOF
      
      exit 1
    fi
  fi
  
  attempt=$((attempt + 1))
done

if [ "$matched" = true ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}Next steps:${NC}"
  echo "  1. Review: jq . $OUTPUT_DIR/final.json | less"
  echo "  2. Convert: node convert-to-website.js $TICKER"
  echo "  3. Validate: cd ../.. && node validate-data.js"
  echo "  4. Deploy: git add -A && git commit -m 'Add $TICKER evaluation' && git push"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  exit 1
fi
