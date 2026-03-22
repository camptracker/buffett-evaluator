# Buffett Evaluator - Claude Code Workflow

## Overview

This is the **Claude Code** version of the multi-agent Buffett evaluation system. Instead of copy-pasting into web Claude, you run it via the `cc` command and all I/O happens through files.

---

## Setup

### 1. Install Prerequisites
```bash
# Ensure Claude Code (cc) is installed
which cc

# Create workspace
mkdir -p ~/Documents/buffett-evaluator/evaluations
cd ~/Documents/buffett-evaluator
```

### 2. Project Structure
```
buffett-evaluator/
├── subagents/
│   └── claude-code/
│       ├── README.md              ← This file
│       ├── config.json            ← Company config
│       ├── agents/
│       │   ├── 1-data-collector.md
│       │   ├── 2-business-quality.md
│       │   ├── 3-management-quality.md
│       │   ├── 4-financial-health.md
│       │   ├── 5-valuation.md
│       │   └── 6-scorecard-verdict.md
│       └── run.sh                 ← Main execution script
├── evaluations/
│   └── [ticker]/
│       ├── agent1.json
│       ├── agent2.json
│       ├── agent3.json
│       ├── agent4.json
│       ├── agent5.json
│       ├── agent6.json
│       └── final.json
└── data/
    └── [ticker].json              ← Website output
```

---

## Quick Start

### Step 1: Configure Company
```bash
cd ~/Documents/buffett-evaluator/subagents/claude-code

# Edit config.json
cat > config.json << 'EOF'
{
  "company": "Tesla",
  "ticker": "TSLA",
  "outputDir": "../../evaluations/TSLA"
}
EOF
```

### Step 2: Run Evaluation
```bash
# Run all 6 agents sequentially
./run.sh

# Or run individual agents:
./run.sh 1    # Data Collector only
./run.sh 2    # Business Quality only
# etc.
```

### Step 3: Check Output
```bash
# Final evaluation
cat ../../evaluations/TSLA/final.json

# Convert to website format
node convert-to-website.js TSLA

# Validate
cd ../..
node validate-data.js
```

---

## How It Works

### Workflow
```
1. run.sh reads config.json
2. For each agent:
   - Read agent prompt from agents/X-*.md
   - Replace placeholders ([COMPANY], [TICKER], {PREVIOUS_AGENT_OUTPUT})
   - Invoke Claude Code via `cc` command
   - Claude Code reads prompt, executes task, writes JSON output
   - Script validates JSON and saves to evaluations/[ticker]/agentX.json
3. Merge all agent outputs into final.json
4. Convert final.json to website data/[ticker].json format
```

### File Flow
```
config.json
    ↓
agents/1-data-collector.md
    ↓ (cc command)
evaluations/TSLA/agent1.json
    ↓
agents/2-business-quality.md (reads agent1.json)
    ↓ (cc command)
evaluations/TSLA/agent2.json
    ↓
... (agents 3-6)
    ↓
evaluations/TSLA/final.json
    ↓ (convert-to-website.js)
data/TSLA.json
```

---

## Agent Prompts (Claude Code Format)

Each agent prompt is structured for file I/O:

```markdown
# Agent X: [Name]

## Task
[Description of what this agent does]

## Input Files
- `config.json` - Company name and ticker
- `evaluations/[TICKER]/agentX.json` - Previous agent output (if applicable)

## Your Job

1. Read the input file(s)
2. Execute the evaluation logic
3. Write output as JSON to: `evaluations/[TICKER]/agentX.json`

## Output Format

Write a valid JSON file with this structure:
```json
{
  "agentId": "X",
  "agentName": "[Name]",
  "timestamp": "ISO-8601",
  "data": {
    // Agent-specific output
  }
}
```

## Execution

When I run `cc "$(cat agents/X-*.md)"`, you will:
- Read input files
- Process data
- Write JSON output
- Print status to stdout

Do NOT print the JSON to stdout - write it to the file.
```

---

## Example: Running Agent 1

```bash
# config.json
{
  "company": "Tesla",
  "ticker": "TSLA",
  "outputDir": "../../evaluations/TSLA"
}

# Command
cc "$(cat agents/1-data-collector.md)"

# Claude Code executes:
1. Reads config.json
2. Gathers financial data for Tesla
3. Writes to evaluations/TSLA/agent1.json:
{
  "agentId": "1",
  "agentName": "Data Collector",
  "timestamp": "2026-03-22T05:23:00Z",
  "data": {
    "company": "Tesla",
    "ticker": "TSLA",
    "currentPrice": 195.00,
    "financialData": { ... }
  }
}
4. Prints: "✅ Agent 1 complete: evaluations/TSLA/agent1.json"
```

---

## Advantages

### vs Web Claude Copy-Paste:
✅ **Automated file I/O** - No manual copy-paste  
✅ **Reproducible** - Same inputs = same outputs  
✅ **Version controlled** - All outputs saved to git  
✅ **Scriptable** - Run via cron, CI/CD, etc.  
✅ **Parallel execution** - Run agents 2-4 simultaneously  

### vs OpenClaw sessions_spawn:
✅ **Local execution** - No network latency  
✅ **Full file system access** - Read SEC filings, PDFs, etc.  
✅ **Better for coding tasks** - Claude Code excels at data processing  
✅ **Easier debugging** - See exact file inputs/outputs  

---

## run.sh Script

```bash
#!/bin/bash
set -e

# Load config
COMPANY=$(jq -r '.company' config.json)
TICKER=$(jq -r '.ticker' config.json)
OUTPUT_DIR=$(jq -r '.outputDir' config.json)

mkdir -p "$OUTPUT_DIR"

echo "🔥 Buffett Evaluator - Claude Code Edition"
echo "Company: $COMPANY ($TICKER)"
echo "Output: $OUTPUT_DIR"
echo ""

# Agent 1: Data Collector
echo "📊 Agent 1: Data Collector..."
PROMPT=$(cat agents/1-data-collector.md | \
  sed "s/\[COMPANY\]/$COMPANY/g" | \
  sed "s/\[TICKER\]/$TICKER/g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent1.json|g")

cc "$PROMPT"

if [ ! -f "$OUTPUT_DIR/agent1.json" ]; then
  echo "❌ Agent 1 failed to produce output"
  exit 1
fi

echo "✅ Agent 1 complete"
echo ""

# Agent 2: Business Quality
echo "🏢 Agent 2: Business Quality..."
AGENT1_DATA=$(cat "$OUTPUT_DIR/agent1.json")
PROMPT=$(cat agents/2-business-quality.md | \
  sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/agent1.json|g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent2.json|g")

cc "$PROMPT"
echo "✅ Agent 2 complete"
echo ""

# Agent 3: Management Quality
echo "👔 Agent 3: Management Quality..."
PROMPT=$(cat agents/3-management-quality.md | \
  sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/agent1.json|g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent3.json|g")

cc "$PROMPT"
echo "✅ Agent 3 complete"
echo ""

# Agent 4: Financial Health
echo "💪 Agent 4: Financial Health..."
PROMPT=$(cat agents/4-financial-health.md | \
  sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/agent1.json|g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent4.json|g")

cc "$PROMPT"
echo "✅ Agent 4 complete"
echo ""

# Merge agents 1-4 for Agent 5
echo "🔀 Merging agents 1-4..."
jq -s '.[0].data * .[1].data * .[2].data * .[3].data' \
  "$OUTPUT_DIR/agent1.json" \
  "$OUTPUT_DIR/agent2.json" \
  "$OUTPUT_DIR/agent3.json" \
  "$OUTPUT_DIR/agent4.json" > "$OUTPUT_DIR/merged-1-4.json"

# Agent 5: Valuation
echo "💎 Agent 5: Valuation..."
PROMPT=$(cat agents/5-valuation.md | \
  sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/merged-1-4.json|g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent5.json|g")

cc "$PROMPT"
echo "✅ Agent 5 complete"
echo ""

# Merge all agents for Agent 6
echo "🔀 Merging all agents..."
jq -s '.[0].data * .[1].data * .[2].data * .[3].data * .[4].data' \
  "$OUTPUT_DIR/agent1.json" \
  "$OUTPUT_DIR/agent2.json" \
  "$OUTPUT_DIR/agent3.json" \
  "$OUTPUT_DIR/agent4.json" \
  "$OUTPUT_DIR/agent5.json" > "$OUTPUT_DIR/merged-all.json"

# Agent 6: Scorecard & Verdict
echo "📋 Agent 6: Scorecard & Verdict..."
PROMPT=$(cat agents/6-scorecard-verdict.md | \
  sed "s|\[INPUT_FILE\]|$OUTPUT_DIR/merged-all.json|g" | \
  sed "s|\[OUTPUT_FILE\]|$OUTPUT_DIR/agent6.json|g")

cc "$PROMPT"
echo "✅ Agent 6 complete"
echo ""

# Final merge
echo "🎯 Creating final output..."
jq -s '.[0].data * .[1].data' \
  "$OUTPUT_DIR/merged-all.json" \
  "$OUTPUT_DIR/agent6.json" > "$OUTPUT_DIR/final.json"

echo "✅ Evaluation complete!"
echo "📄 Output: $OUTPUT_DIR/final.json"
echo ""
echo "Next steps:"
echo "  1. Review: cat $OUTPUT_DIR/final.json | jq"
echo "  2. Convert: node convert-to-website.js $TICKER"
echo "  3. Validate: node validate-data.js"
echo "  4. Deploy: git add -A && git commit -m 'Add $TICKER evaluation' && git push"
```

---

## convert-to-website.js

```javascript
#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ticker = process.argv[2];
if (!ticker) {
  console.error('Usage: node convert-to-website.js TICKER');
  process.exit(1);
}

const inputFile = path.join(__dirname, '../../evaluations', ticker.toUpperCase(), 'final.json');
const outputFile = path.join(__dirname, '../../data', `${ticker.toLowerCase()}.json`);

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(inputFile, 'utf-8'));

// Transform from agent format to website format
const websiteData = {
  name: data.company,
  ticker: data.ticker,
  industry: data.industry || "Unknown",
  analysisDate: new Date().toISOString().split('T')[0],
  currentPrice: data.currentPrice,
  intrinsicValue: data.valuation?.intrinsicValue || 0,
  marginOfSafety: data.valuation?.marginOfSafety || "0%",
  verdict: data.finalVerdict?.verdict || "UNKNOWN",
  score: data.scorecard?.totalScore || 0,
  oneParagraphSummary: data.finalVerdict?.summary || "",
  
  financialData: data.financialData || {},
  qualitativeAnalysis: data.qualitativeData || {},
  businessQuality: data.businessQuality || {},
  managementQuality: data.managementQuality || {},
  financialHealth: data.financialHealth || {},
  intrinsicValueCalculation: data.intrinsicValueCalculation || {},
  scorecard: data.scorecard || {},
  finalVerdict: data.finalVerdict || {}
};

fs.writeFileSync(outputFile, JSON.stringify(websiteData, null, 2));
console.log(`✅ Website data written to: ${outputFile}`);
console.log(`\nNext steps:`);
console.log(`  1. Register in script.js: Add '${ticker.toLowerCase()}: "data/${ticker.toLowerCase()}.json"' to companies object`);
console.log(`  2. Validate: node validate-data.js`);
console.log(`  3. Deploy: git push`);
```

---

## Next Steps

1. **Create agent prompts** in `agents/` directory (refactored for file I/O)
2. **Test run.sh** with a known company (e.g., Apple)
3. **Build convert-to-website.js** to transform agent output to website JSON
4. **Add parallel execution** for agents 2-4 (via `&` backgrounding in bash)
5. **Create cron job** to auto-evaluate companies weekly

---

## Tips

### Debugging
```bash
# Check agent outputs individually
jq . evaluations/TSLA/agent1.json
jq . evaluations/TSLA/agent2.json

# Test single agent
cc "$(cat agents/1-data-collector.md | sed 's/\[COMPANY\]/Tesla/g')"

# Validate JSON syntax
jq empty evaluations/TSLA/*.json || echo "Invalid JSON"
```

### Parallel Execution (Advanced)
```bash
# Run agents 2-4 simultaneously
cc "$(cat agents/2-business-quality.md)" &
cc "$(cat agents/3-management-quality.md)" &
cc "$(cat agents/4-financial-health.md)" &
wait

# All 3 finish, then continue to agent 5
```

---

**Claude Code workflow = Fully automated, file-based, reproducible evaluations.** 🔥
